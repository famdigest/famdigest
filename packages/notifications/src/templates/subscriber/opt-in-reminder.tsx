import dedent from "dedent";
import { TemplateProps } from "../types";
import { Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email({ owner, contact }: TemplateProps) {
  return (
    <BaseTemplate preview="Reminder to Opt-In to FamDigest Daily Digest">
      <Heading className="text-xl mt-0">
        Reminder to Opt-In to FamDigest Daily Digest
      </Heading>
      <Text>Dear {contact?.full_name ?? "Customer"},</Text>
      <Text>
        This is a friendly reminder that {owner?.full_name} has added you to
        receive their daily schedule digest via FamDigest. To start receiving
        these messages, please confirm your opt-in by replying to the SMS we
        sent you.
      </Text>
      <Text>
        Best Regards,
        <br />
        FamDigest Team
      </Text>
    </BaseTemplate>
  );
}
export const textMessage = ({ owner, contact }: TemplateProps) => {
  return dedent`Hey ${contact.full_name ?? "there"}!

  This is a friendly reminder that ${owner?.full_name} has added you to receive their daily digest via FamDigest. To start receiving these messages, please confirm your opt-in by replying "YES".

  FamDigest Team
  `;
};

export { Email as ContactOptInReminder, textMessage as contactOptInReminder };
