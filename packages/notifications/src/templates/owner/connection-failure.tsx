import dedent from "dedent";
import { TemplateProps } from "../types";
import { Button, Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email({ owner, calendar }: TemplateProps) {
  return (
    <BaseTemplate preview="FamDigest Calendar Sync Issue">
      <Heading className="text-xl mt-0">FamDigest Calendar Sync Issue</Heading>
      <Text>Dear {owner?.full_name ?? "Customer"},</Text>
      <Text>
        We've noticed an issue with one of your calendar connections on
        FamDigest. It appears that your {calendar?.name} calendar is not syncing
        properly. To ensure you and your recipients continue to receive accurate
        daily digests, please log into your account and check the calendar
        settings. If you need any assistance, feel free to contact us at
        support@famdigest.com.
      </Text>
      <Button
        href={`https://app.famdigest.com/calendars/${calendar?.connection_id}`}
        className="bg-slate-800 text-white px-4 py-2 rounded-md"
      >
        Manage Contacts
      </Button>
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

  We've noticed an issue with one of your calendar connections on FamDigest. It appears that your ${calendar?.name} calendar is not syncing properly. To ensure you and your recipients continue to receive accurate daily digests, please log into your account and check the calendar settings. If you need any assistance, feel free to contact us at support@famdigest.com.

  FamDigest Team
  `;
};

export { Email as ConnectionFailure, textMessage as connectionFailure };
