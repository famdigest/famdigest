import dedent from "dedent";
import { TemplateProps } from "../types";
import { Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email({ owner, contact }: TemplateProps) {
  return (
    <BaseTemplate preview="Opt-In Confirmation">
      <Heading className="text-xl mt-0">
        {owner.full_name} thanks you for opting in
      </Heading>
      <Text>Dear {contact?.full_name ?? "Customer"},</Text>
      <Text>
        Thank you for opting in to receive the daily digest from FamDigest.
        We're excited to help you stay updated with {owner?.full_name}'s
        schedule. If you have any questions or need assistance, please feel free
        to contact us at support@famdigest.com.
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

  Thank you for opting in to receive the daily digest from FamDigest. We're excited to help you stay updated with ${owner?.full_name}'s schedule. If you have any questions or need assistance, please feel free to contact us at support@famdigest.com.

  FamDigest Team
  `;
};

export {
  Email as ContactOptInConfirmation,
  textMessage as contactOptInConfirmation,
};
