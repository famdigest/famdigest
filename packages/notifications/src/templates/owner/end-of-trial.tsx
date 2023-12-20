import dedent from "dedent";
import { TemplateProps } from "../types";
import { Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email({ owner }: TemplateProps) {
  return (
    <BaseTemplate preview="FamDigest Trial Ending Soon">
      <Heading className="text-xl mt-0">FamDigest Trial Ending Soon</Heading>
      <Text>Dear {owner?.full_name ?? "Customer"},</Text>
      <Text>
        Just a quick note to let you know that your FamDigest trial period is
        ending in 3 days. To continue enjoying our services without
        interruption, please consider subscribing to one of our plans. If you
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

export const textMessage = ({ owner }: TemplateProps) => {
  return dedent`Hey ${owner.full_name ?? "there"}!

  Just a quick note to let you know that your FamDigest trial period is ending in 3 days. To continue enjoying our services without interruption, please consider subscribing to one of our plans. If you need any assistance or have any questions, please contact us at support@famdigest.com.

  FamDigest Team
  `;
};

export { Email as TrialEndingSoon, textMessage as trialEndingSoon };
