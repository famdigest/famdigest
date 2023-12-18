import twilio from "twilio";
import { MessageListInstanceCreateOptions } from "twilio/lib/rest/api/v2010/account/message";
import { z } from "zod";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export { client };

export const TwilioMessageSchema = z.object({
  ToCountry: z.string(),
  ToState: z.string().optional(),
  SmsMessageSid: z.string(),
  NumMedia: z.string(),
  ToCity: z.string().optional(),
  FromZip: z.string(),
  SmsSid: z.string(),
  FromState: z.string(),
  SmsStatus: z.string(),
  FromCity: z.string(),
  Body: z.string(),
  FromCountry: z.string(),
  To: z.string(),
  ToZip: z.string().optional(),
  NumSegments: z.string(),
  MessageSid: z.string(),
  AccountSid: z.string(),
  From: z.string(),
  ApiVersion: z.string(),
});

type SendMessageArgs = Omit<MessageListInstanceCreateOptions, "from">;
export async function sendMessage(args: SendMessageArgs) {
  return await client.messages.create({
    ...args,
    from: process.env.TWILIO_PHONE,
  });
}
