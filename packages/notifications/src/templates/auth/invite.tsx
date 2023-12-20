import { Button, Heading, Text } from "@react-email/components";
import BaseTemplate from "../base";

export default function Email() {
  return (
    <BaseTemplate preview="You have been invited">
      <Heading className="text-xl mt-0 font-normal">
        You have been invited to <strong>FamDigest</strong>.
      </Heading>
      <Text>
        The link will remain valid for 24 hours or until it is used, whichever
        comes first. If you need to request another link,{" "}
        <a href="{{ .SiteURL }}/sign-in">please click here</a>.
      </Text>
      <Text>Follow this link to accept the invite:</Text>
      <Button
        href="{{ .SiteURL }}/auth/confirm?token={{ .TokenHash }}&type=invite&next=/accept-invite"
        className="bg-slate-800 text-white px-4 py-2 rounded-md"
      >
        Accept Invite
      </Button>
      <Text>
        Best Regards,
        <br />
        FamDigest Team
      </Text>
    </BaseTemplate>
  );
}
