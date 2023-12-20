import dedent from "dedent";
import { TemplateProps } from "../types";
import { Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email({ owner }: TemplateProps) {
  return (
    <BaseTemplate preview="Welcome to FamDigest">
      <Heading className="text-xl mt-0">Welcome to FamDigest!</Heading>
      <Text>Dear {owner?.full_name ?? "Customer"},</Text>
      <Text>
        We're thrilled to welcome you to FamDigest! You've taken the first step
        towards simplifying your daily schedule management and we're excited to
        be a part of your journey.
      </Text>
      <Text>
        With FamDigest, you can now effortlessly share your schedule with
        friends, family, and colleagues. No more shared calendars, just simple,
        straightforward text messages.
      </Text>
      <Text>Here's a quick overview of how FamDigest works:</Text>
      <ol>
        <li className="pb-4">
          Create an Account: You've already completed this step. Welcome aboard!
        </li>
        <li className="pb-4">
          Sync Calendars: Connect as many calendars as you wish - work,
          personal, or even your side gig. You can add them all!
        </li>
        <li className="pb-4">
          Add Phone Number: Provide the phone number and delivery time for who
          you'd like to receive your daily digest. This could be your spouse,
          family nanny, or any person you wish to share your schedule with.
        </li>
      </ol>
      <Text>
        Remember, you can always manage your calendars, digests, and make
        changes as needed in your account settings.
      </Text>
      <Text>
        If you have any questions or need assistance, feel free to reach out to
        us at support@famdigest.com. We're here to help!
      </Text>
      <Text>
        Thank you for choosing FamDigest. We look forward to making your daily
        schedule management a breeze!
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

  We're thrilled to welcome you to FamDigest! You've taken the first step towards simplifying your daily schedule management and we're excited to be a part of your journey.

  Here's a quick overview of how FamDigest works:
  - Sync Calendars: Connect as many calendars as you wish!
  - Add Phone Number: Provide the phone number and delivery time for who you'd like to receive your daily digest.

  Remember, you can always manage your calendars, digests, and make changes as needed in your dashboard.

  Thank you for choosing FamDigest. We look forward to making your daily schedule management a breeze!

  FamDigest Team
  `;
};

export { Email as WelcomeMessage, textMessage as welcomeMessageText };
