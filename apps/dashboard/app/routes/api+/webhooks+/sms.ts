import { ActionFunctionArgs, json } from "@remix-run/node";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse.js";
import { db, eq, schema } from "~/lib/db.server";
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

  const tags = [];
  if (!digest.opt_in) {
    await db
      .update(schema.digests)
      .set({
        opt_in: true,
      })
      .where(eq(schema.digests.id, digest.id));

    // send message
    if (digest.profile.phone) {
      const [name] = (digest.profile.full_name ?? "")?.split(" ");
      const [dName] = digest.full_name.split(" ");
      await sendMessage({
        to: digest.profile.phone,
        body: `Hey ${
          name ?? "there"
        }, ${dName} just opted-in to receive your daily digest.`,
      });
    }

    tags.push("opt-in-response");
  }

  await db.insert(schema.messages).values({
    message: Body,
    role: "user",
    external_id: SmsSid,
    digest_id: digest.id,
    segments: Number(NumSegments),
    data: validation.data,
    owner_id: digest.owner_id,
    tags,
  });

  const twiml = new MessagingResponse();

  if (
    Body.toLowerCase().startsWith("yes") ||
    Body.toLowerCase().includes("yes")
  ) {
    const optInBody = `Great! You are now opted-in to receive ${digest.profile.full_name}'s daily digest.`;
    const msg = await sendMessage({
      to: digest.phone,
      body: optInBody,
    });

    await db.insert(schema.messages).values({
      message: optInBody,
      role: "assistant",
      external_id: msg.sid,
      digest_id: digest.id,
      segments: Number(msg.numSegments),
      data: msg,
      owner_id: digest.owner_id,
      tags: ["opt-in-confirmation"],
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
