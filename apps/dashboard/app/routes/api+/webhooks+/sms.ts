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

  const subscriber = await db.query.subscriptions.findFirst({
    where: (table, { eq }) => eq(table.phone, From),
    with: {
      owner: true,
      workspace: true,
    },
  });
  if (!subscriber) {
    // nope
    return json(
      {
        success: false,
        error: "User not found",
      },
      {
        status: 500,
      }
    );
  }

  await db.insert(schema.subscription_logs).values({
    message: Body,
    external_id: SmsSid,
    subscription_id: subscriber.id,
    segments: Number(NumSegments),
    data: validation.data,
    owner_id: subscriber.owner_id,
    workspace_id: subscriber.workspace_id,
  });

  const twiml = new MessagingResponse();

  if (
    Body.toLowerCase().startsWith("yes") ||
    Body.toLowerCase().includes("yes")
  ) {
    if (!subscriber.opt_in) {
      // opt-in all instances
      await db
        .update(schema.subscriptions)
        .set({
          opt_in: true,
        })
        .where(eq(schema.subscriptions.phone, subscriber.phone));

      // send message
      NotificationService.send({
        key: "owner.subscriberOptInConfirmation",
        owner: subscriber.owner,
        contact: subscriber,
        recipient: subscriber.owner,
        workspace: subscriber.workspace,
        type: "both",
      });
    }

    NotificationService.send({
      key: "contact.optInConfirmation",
      owner: subscriber.owner,
      contact: subscriber,
      recipient: subscriber,
      workspace: subscriber.workspace,
      type: "sms",
    });
  } else {
    twiml.message(
      `Thanks for reaching out, ${subscriber.full_name}. We are not accpeting inbound messages at the moment.`
    );
  }

  return new Response(twiml.toString(), {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
