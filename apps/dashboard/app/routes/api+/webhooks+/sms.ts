import { ActionFunctionArgs, json } from "@remix-run/node";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse.js";
import { db, eq, schema } from "~/lib/db.server";
import { TwilioMessageSchema } from "~/lib/twilio.server";

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

  await db
    .update(schema.digests)
    .set({
      opt_in: true,
    })
    .where(eq(schema.digests.id, digest.id));

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
    twiml.message(
      `Great! You are now opted-in to receive ${digest.profile.full_name}'s daily digest.`
    );
  } else {
    twiml.message(
      `Thanks for reaching out ${digest.full_name}, but we are not accpeting inbound messages at the moment.`
    );
  }

  return new Response(twiml.toString(), {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
