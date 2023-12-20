import dedent from "dedent";
import { TemplateProps } from "../types";
import { Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email({ owner, contact }: TemplateProps) {
  return (
    <BaseTemplate preview="FamDigest Daily Digest Opt-In Confirmation">
      <Heading className="text-xl mt-0">
        {contact?.full_name}'s Opt-In Confirmation
      </Heading>
      <Text>Dear {owner?.full_name ?? "Customer"},</Text>
      <Text>
        Great news! The recipient you added to your FamDigest account,{" "}
        {contact?.full_name}, has successfully opted-in to our service. They
        will now start receiving the daily digest as per your settings. If you
        need any assistance or have any questions, please contact us at
        support@famdigest.com.
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

  Great news! The recipient you added to your FamDigest account, ${contact?.full_name}, has successfully opted-in to our service. They will now start receiving the daily digest as per your settings. If you need any assistance or have any questions, please contact us at support@famdigest.com.

  FamDigest Team
  `;
};

export {
  Email as SubscriberOptInConfirmation,
  textMessage as subscriberOptInConfirmation,
};
