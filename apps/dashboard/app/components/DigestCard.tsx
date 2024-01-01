import { convertTimeToLocalTime } from "@repo/plugins";
import { Card, CardHeader, CardTitle, Switch, toast } from "@repo/ui";
import { useDigestConfigured } from "~/hooks/digest-configured";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import { trpc } from "~/lib/trpc";

export function DigestCard() {
  const { user: initialData } = useWorkspaceLoader();
  const { data: user } = trpc.users.me.useQuery(undefined, {
    initialData,
  });
  const digestConfigurationComplete = useDigestConfigured(user);
  const utils = trpc.useUtils();
  const updateUser = trpc.users.update.useMutation({
    async onSuccess() {
      await utils.users.invalidate();
    },
  });

  const handleCheckChanged = (checked: boolean) => {
    if (!user.phone && checked) {
      return;
    }

    updateUser.mutate(
      {
        enabled: checked,
      },
      {
        onSuccess() {
          toast({
            title: "Success",
            description:
              "Your digest has been " + checked ? "enabled" : "disabled",
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-normal">
          {!digestConfigurationComplete ? (
            <>Enable your digest</>
          ) : (
            <>
              Digest enabled, next one is at{" "}
              {convertTimeToLocalTime(user.notify_on!, user.timezone!).format(
                "dddd h:mm a"
              )}
            </>
          )}
        </CardTitle>
        <div className="flex items-center gap-x-2">
          <Switch
            checked={digestConfigurationComplete}
            onCheckedChange={handleCheckChanged}
          />
        </div>
      </CardHeader>
    </Card>
  );
}
