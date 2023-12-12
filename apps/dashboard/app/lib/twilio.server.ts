import twilio from "twilio";
import { MessageListInstanceCreateOptions } from "twilio/lib/rest/api/v2010/account/message";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export { client };

type SendMessageArgs = Omit<MessageListInstanceCreateOptions, "from">;
export async function sendMessage(args: SendMessageArgs) {
  return await client.messages.create({
    ...args,
    from: process.env.TWILIO_SERVICE_SID,
  });
}
