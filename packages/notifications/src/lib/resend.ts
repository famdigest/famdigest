import { Resend } from "resend";
import { CreateEmailOptions } from "resend/build/src/emails/interfaces";

export const resendClient = new Resend(process.env.RESEND_KEY);

type SendEmailArgs = Omit<CreateEmailOptions, "from">;
export async function sendEmail(input: SendEmailArgs) {
  return await resendClient.emails.send({
    ...input,
    from: "FamDigest <notifications@hey.famdigest.com>",
  } as CreateEmailOptions);
}
