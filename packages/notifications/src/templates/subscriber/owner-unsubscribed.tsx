import dedent from "dedent";
import { TemplateProps } from "../types";
import { Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email({ owner, contact }: TemplateProps) {
  return (
    <BaseTemplate preview="Changes to Your FamDigest Daily Digest">
      <Heading className="text-xl mt-0">
        Changes to Your FamDigest Daily Digest
      </Heading>
      <Text>Dear {contact?.full_name ?? "Customer"},</Text>
      <Text>
        We're writing to inform you that {owner?.full_name} has unsubscribed
        from the FamDigest service. As a result, you will no longer receive the
        daily digest of their schedule.
      </Text>
      <Text>
        We appreciate your understanding and thank you for being a part of the
        FamDigest community. If you have any questions or need assistance,
        please feel free to contact us at support@famdigest.com.
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

  We're writing to inform you that ${owner?.full_name} has unsubscribed from the FamDigest service. As a result, you will no longer receive the daily digest of their schedule.

  FamDigest Team
  `;
};

export { Email as OwnerUnsubscribed, textMessage as ownerUnsubscribed };
