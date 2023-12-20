import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import { sendMessage, sendEmail } from "./lib";
import { TemplateProps } from "./templates/types";
import { notificationsMap } from "./templates";
import { db, schema } from "@repo/database";
import { Table } from "@repo/supabase";

export * from "./lib";

export interface NotificationData extends TemplateProps {
  type: "email" | "sms" | "both";
  key: keyof typeof notificationsMap;
  subject?: string;
  recipient: Table<"profiles"> | Table<"digests">;
  includeVCard?: boolean;
}
export class NotificationService {
  static async send(notification: NotificationData): Promise<void> {
    const {
      type,
      key,
      recipient,
      owner,
      contact,
      calendar,
      subject,
      includeVCard,
    } = notification;
    const template = notificationsMap[key];

    if ((type === "both" || type === "email") && "email" in recipient) {
      sendEmail({
        to: recipient.email!,
        react: template.react({
          owner,
          contact,
          calendar,
        }),
        subject: subject ?? template.subject,
      });
    }

    if ((type === "both" || type === "sms") && recipient.phone) {
      const message = await sendMessage({
        to: recipient.phone,
        body: template.text({ owner, contact, calendar }),
        mediaUrl: includeVCard
          ? [`https://www.famdigest.com/assets/vcard.vcf`]
          : undefined,
      });
      this.saveToDatabase({
        message,
        owner,
        contact,
      });
    }
  }

  private static async saveToDatabase({
    message,
    owner,
    contact,
  }: TemplateProps & { message: MessageInstance }): Promise<void> {
    // Implement saving to the database
    await db.insert(schema.messages).values({
      role: "assistant",
      message: message.body,
      external_id: message.sid,
      segments: Number(message.numSegments),
      digest_id: contact.id,
      owner_id: owner.id,
      data: { msg: message },
    });
  }
}
