import { Button, Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email() {
  return (
    <BaseTemplate preview="Reset your FamDigest password">
      <Heading className="text-xl mt-0 font-normal">
        Click below to reset you <strong>FamDigest</strong> password.
      </Heading>
      <Text>
        We're sorry to hear that you're having trouble accessing your account.
        To reset your password and regain access, please click the link below:
      </Text>
      <Button
        href="{{ .SiteURL }}/auth/confirm?token={{ .TokenHash }}&type=recovery&next=/recovery"
        className="bg-slate-800 text-white px-4 py-2 rounded-md"
      >
        Reset
      </Button>
      <Text>
        Best Regards,
        <br />
        FamDigest Team
      </Text>
    </BaseTemplate>
  );
}
