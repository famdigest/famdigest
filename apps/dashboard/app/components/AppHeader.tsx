import {
  IconDeviceDesktop,
  IconLogout,
  IconMoon,
  IconPalette,
  IconSun,
} from "@tabler/icons-react";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { trpc } from "~/lib/trpc";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/ui";
import { useSupabase } from "~/components/SupabaseProvider";
import { useRevalidator } from "@remix-run/react";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";

export type ThemeOptions = "light" | "dark" | "system";

export function AppHeader() {
  const supabase = useSupabase();
  const revalidator = useRevalidator();
  const { user, billing_status: subscription } = useWorkspaceLoader();
  const updatePreferences = trpc.users.updatePreferences.useMutation({
    onSuccess() {
      revalidator.revalidate();
    },
  });

  const handleChangeTheme = (newTheme: ThemeOptions) => {
    updatePreferences.mutate({
      preferences: {
        theme: newTheme,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="h-14 flex items-center flex-shrink-0 px-3 sticky top-0 backdrop-blur-md z-50">
      <WorkspaceSwitcher />

      {/* workspaces */}
      <div className="ml-auto">
        {subscription?.status === "trialing" && (
          <Badge className="mr-3">Trial</Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger>
            {user && (
              <Avatar className="">
                {user.avatar_url ? (
                  <AvatarImage src={user.avatar_url}></AvatarImage>
                ) : (
                  <AvatarFallback className="uppercase bg-background">
                    {user.email?.substring(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem className="flex flex-col items-start">
                <p className="text-xs font-medium text-muted-foreground">
                  Sign in as
                </p>
                <p className="text-xs">{user?.email}</p>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconPalette className="mr-2" size={16} />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleChangeTheme("light")}>
                    <IconSun className="mr-2" size={16} />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangeTheme("dark")}>
                    <IconMoon className="mr-2" size={16} />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleChangeTheme("system")}>
                    <IconDeviceDesktop className="mr-2" size={16} />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <IconLogout className="mr-2" size={16} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
