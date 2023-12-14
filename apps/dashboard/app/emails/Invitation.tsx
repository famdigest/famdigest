type InvitationProps = {
  workspace_name: string;
  workspace_owner: string;
  accept_invite_link: string;
};
export function Invitation({
  workspace_name,
  workspace_owner,
  accept_invite_link,
}: InvitationProps) {
  return (
    <>
      <p>Hi there,</p>
      <p>
        You have been invited to {workspace_name} by {workspace_owner}.
      </p>
      <p>
        Click{" "}
        <a href={accept_invite_link} style={{ fontWeight: "bold" }}>
          here
        </a>{" "}
        to accept your invite.
      </p>
      <p>
        If the above link does not work, copy and paste this plain text link
        instead.
      </p>
      <p>{accept_invite_link}</p>

      <p>
        Best,
        <br />
        The FamDigest Team
      </p>
    </>
  );
}
