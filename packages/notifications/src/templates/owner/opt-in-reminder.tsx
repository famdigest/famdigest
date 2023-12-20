import dedent from "dedent";
import { TemplateProps } from "../types";
import { Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email({ owner, contact }: TemplateProps) {
  return (
    <BaseTemplate preview="Opt-In Reminder Sent to Your Subscriber">
      <Heading className="text-xl mt-0">
        {contact?.full_name}'s Opt-In Reminder
      </Heading>
      <Text>Dear {owner?.full_name ?? "Customer"},</Text>
      <Text>
        We've sent an opt-in reminder to {contact?.full_name}, the recipient you
        added to your FamDigest account, as they haven't opted-in yet. If you or
        the recipient need assistance, please contact us at hello@famdigest.com.
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
  return dedent`Hey ${owner.full_name ?? "there"}!

  We've sent an opt-in reminder to ${contact?.full_name}, the recipient you added to your FamDigest account, as they haven't opted-in yet. If you or the recipient need assistance, please contact us at hello@famdigest.com.

  FamDigest Team
  `;
};

export {
  Email as SubscriberOptInReminder,
  textMessage as subscriberOptInReminder,
};
