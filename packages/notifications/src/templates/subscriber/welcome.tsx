import dedent from "dedent";
import { TemplateProps } from "../types";
import { Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email({ owner, contact }: TemplateProps) {
  return (
    <BaseTemplate preview="Welcome to FamDigest">
      <Heading className="text-xl mt-0">Welcome to FamDigest!</Heading>
      <Text>Dear {contact?.full_name ?? "Customer"},</Text>
      <Text>
        You have been added by {owner?.full_name} to receive a daily digest of
        their schedule via FamDigest. To start receiving these messages, please
        confirm your opt-in by replying "YES" to the text message we sent you.
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
  return dedent`Hi ${contact.full_name ?? "there"}!

  You have been added by ${owner?.full_name} to receive a daily digest of their schedule via FamDigest. To start receiving these messages, please confirm your opt-in by replying "YES".

  Also, save our number to your contacts for a better experience.

  FamDigest Team
  `;
};

export { Email as ContactWelcomeMessage, textMessage as contactWelcomeMessage };
