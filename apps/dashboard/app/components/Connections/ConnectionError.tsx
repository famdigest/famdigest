import { Link } from "@remix-run/react";
import { Alert, AlertTitle, AlertDescription, Button } from "@repo/ui";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";

export function ConnectionError({ error }: { error: string }) {
  const { user } = useWorkspaceLoader();
  const [provider, message] = error.split("|");
  const emailBody = `Hey FamDigest,\n\nI was not able to add my ${provider} calendar.\n\nError:${message}\n\nUser: ${user.email}`;

  return (
    <Alert className="bg-destructive text-destructive-foreground">
      <AlertTitle>Looks like something went wrong!</AlertTitle>
      <AlertDescription>
        Try adding that calendar again. If the problem continues, please email{" "}
        <a
          href={`mailto:support@famdigest.com?subject=${encodeURIComponent(
            `Cannot add ${provider} calendar`
          )}&body=${encodeURIComponent(emailBody)}`}
        >
          support@famdigest.com
        </a>
        .
      </AlertDescription>

      <Button className="mt-2" size="sm" variant="secondary" asChild>
        <Link to="/calendars">Dismiss</Link>
      </Button>
    </Alert>
  );
}
