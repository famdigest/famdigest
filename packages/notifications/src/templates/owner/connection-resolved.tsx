import dedent from "dedent";
import { TemplateProps } from "../types";
import { Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email({ owner, calendar }: TemplateProps) {
  return (
    <BaseTemplate preview="FamDigest Calendar Sync Issue Resolved">
      <Heading className="text-xl mt-0">
        FamDigest Calendar Sync Issue Resolved
      </Heading>
      <Text>Dear {owner?.full_name ?? "Customer"},</Text>
      <Text>
        We're pleased to inform you that the issue with your {calendar?.name}
        connection on FamDigest has been resolved. Your calendar is now syncing
        properly and you and your recipients will continue to receive accurate
        daily digests. If you have any questions or need further assistance,
        please contact us at support@famdigest.com.
      </Text>
      <Text>
        Best Regards,
        <br />
        FamDigest Team
      </Text>
    </BaseTemplate>
  );
}

export const textMessage = ({ owner, calendar }: TemplateProps) => {
  return dedent`Hey ${owner.full_name ?? "there"}!

  We're pleased to inform you that the issue with your ${calendar?.name} connection on FamDigest has been resolved. Your calendar is now syncing properly and you and your recipients will continue to receive accurate daily digests. If you have any questions or need further assistance, please contact us at support@famdigest.com.

  FamDigest Team
  `;
};

export {
  Email as ConnectionFailureResolved,
  textMessage as connectionFailureResolved,
};
