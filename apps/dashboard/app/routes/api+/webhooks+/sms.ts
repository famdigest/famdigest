import { ActionFunctionArgs, json } from "@remix-run/node";
import { NotificationService } from "@repo/notifications";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse.js";
import { db, eq, schema } from "@repo/database";
import { TwilioMessageSchema, sendMessage } from "~/lib/twilio.server";

export async function action({ request }: ActionFunctionArgs) {
  const validation = TwilioMessageSchema.safeParse(
    Object.fromEntries(await request.formData())
  );

  if (!validation.success) {
    return json(
      {
        success: false,
        error: validation.error.flatten(),
      },
      {
        status: 500,
      }
    );
  }

  const { From, Body, SmsSid, NumSegments } = validation.data;

  const digest = await db.query.digests.findFirst({
    where: eq(schema.digests.phone, From),
    with: {
      profile: true,
    },
  });
  if (!digest) {
    // nope
    return json(
      {
        success: false,
        error: "Digest user not found",
      },
      {
        status: 500,
      }
    );
  }

  await db.insert(schema.messages).values({
    message: Body,
    role: "user",
    external_id: SmsSid,
    digest_id: digest.id,
    segments: Number(NumSegments),
    data: validation.data,
    owner_id: digest.owner_id,
  });

  const twiml = new MessagingResponse();

  if (
    Body.toLowerCase().startsWith("yes") ||
    Body.toLowerCase().includes("yes")
  ) {
    if (!digest.opt_in) {
      await db
        .update(schema.digests)
        .set({
          opt_in: true,
        })
        .where(eq(schema.digests.id, digest.id));

      // send message
      NotificationService.send({
        key: "owner.subscriberOptInConfirmation",
        owner: digest.profile,
        contact: digest,
        recipient: digest.profile,
        type: "both",
      });
    }

    NotificationService.send({
      key: "contact.optInConfirmation",
      owner: digest.profile,
      contact: digest,
      recipient: digest,
      type: "sms",
    });
  } else {
    twiml.message(
      `Thanks for reaching out, ${digest.full_name}. We are not accpeting inbound messages at the moment.`
    );
  }

  return new Response(twiml.toString(), {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
