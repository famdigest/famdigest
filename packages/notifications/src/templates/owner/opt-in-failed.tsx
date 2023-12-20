import dedent from "dedent";
import { TemplateProps } from "../types";
import { Button, Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email({ owner, contact }: TemplateProps) {
  return (
    <BaseTemplate preview="FamDigest Daily Digest Opt-In Status">
      <Heading className="text-xl mt-0">
        {contact?.full_name}'s Opt-In Status
      </Heading>
      <Text>Dear {owner?.full_name ?? "Customer"},</Text>
      <Text>
        We're writing to inform you that the recipient you added to your
        FamDigest account, {contact?.full_name}, has not opted-in to our service
        within the three-day window. As a result, we've paused sending the daily
        digest to respect their privacy. If this was a mistake or if they wish
        to receive the digest, they can opt-in at any time. For any questions or
        assistance, please reach out to us at support@famdigest.com.
      </Text>
      <Button
        href="https://app.famdigest.com/contacts"
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

export const textMessage = ({ owner, contact }: TemplateProps) => {
  return dedent`Hey ${owner.full_name ?? "there"}!

  We're writing to inform you that the recipient you added to your FamDigest account, ${contact?.full_name}, has not opted-in to our service within the three-day window. As a result, we've paused sending the daily digest to respect their privacy. If this was a mistake or if they wish to receive the digest, they can opt-in at any time.

  FamDigest Team
  `;
};

export {
  Email as SubscriberFailedToOptIn,
  textMessage as subscriberFailedToOptIn,
};
