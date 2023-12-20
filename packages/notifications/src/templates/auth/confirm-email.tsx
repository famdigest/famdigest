import { Button, Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email() {
  return (
    <BaseTemplate preview="Confirm your signup">
      <Heading className="text-xl mt-0 font-normal">
        Click below to continue to <strong>FamDigest</strong>.
      </Heading>
      <Text>
        The link will remain valid for 24 hours or until it is used, whichever
        comes first. If you need to request another link,{" "}
        <a href="{{ .SiteURL }}/sign-in">please click here</a>.
      </Text>
      <Button
        href="{{ .SiteURL }}/auth/confirm?token={{ .TokenHash }}&type=email"
        className="bg-slate-800 text-white px-4 py-2 rounded-md"
      >
        Confirm
      </Button>
      <Text>
        Best Regards,
        <br />
        FamDigest Team
      </Text>
    </BaseTemplate>
  );
}
