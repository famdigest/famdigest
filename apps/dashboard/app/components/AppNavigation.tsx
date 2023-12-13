import { Link, NavLink, useRevalidator } from "@remix-run/react";
import { navigation } from "~/lib/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  cn,
} from "@repo/ui";
import { useWorkspaceLoader } from "~/hooks/useWorkspaceLoader";
import {
  IconDeviceDesktop,
  IconLogout2,
  IconMoon,
  IconPalette,
  IconSelector,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { trpc } from "~/lib/trpc";
import { useSupabase } from "./SupabaseProvider";

export function AppNavigation() {
  return (
    <>
      <div
        className={cn(
          "group sticky top-0 flex-shrink-0 scrollbar-none",
          "transition-all ease-in-out duration-150",
          "hidden md:block md:w-52 h-screen overflow-y-auto",
          "bg-secondary"
        )}
      >
        <div className="flex items-center p-2">
          <NavDropdownMenu />
        </div>

        <NavItems />
      </div>
      <div className="fixed bottom-0 inset-x-0 h-16 bg-secondary border-t md:hidden">
        <div className="grid grid-cols-4 gap-2 p-2 h-full">
          {navigation.map((item, idx) => {
            return (
              <NavLink
                key={item.slug}
                to={item.slug}
                className={({ isActive }) =>
                  cn(
                    "text-sm flex flex-col gap-y-0.5 items-center justify-center h-full relative text-foreground/80 rounded-md",
                    isActive ? "bg-foreground/10" : "hover:bg-foreground/10"
                  )
                }
              >
                <item.icon
                  className="flex-none sm:mr-2"
                  size={16}
                  strokeWidth={1.5}
                />
                <span className="text-xs">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
}

export type ThemeOptions = "light" | "dark" | "system";

function NavDropdownMenu() {
  const { user } = useWorkspaceLoader();
  const supabase = useSupabase();
  const revalidator = useRevalidator();
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="px-0 sm:px-3 justify-center sm:justify-start hover:bg-primary/10 w-full"
        >
          <Avatar className="sm:mr-2 h-5 w-5">
            <AvatarImage
              src={
                user.avatar_url ?? `https://avatar.vercel.sh/${user.email!}.png`
              }
              alt={user.full_name ?? user.email ?? ""}
            />
            <AvatarFallback>{user.full_name?.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{user.full_name}</span>
          <IconSelector className="hidden sm:inline ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 p-0 py-1">
        <DropdownMenuItem className="text-sm leading-5 rounded-none" asChild>
          <Link to="/settings/account" type="button">
            <IconUser size={14} className="mr-2" />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-sm leading-5 rounded-none" asChild>
          <Link to="/settings" type="button">
            <IconSettings size={14} className="mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconPalette className="mr-2" size={14} />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleChangeTheme("light")}>
                <IconSun className="mr-2" size={14} />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeTheme("dark")}>
                <IconMoon className="mr-2" size={14} />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeTheme("system")}>
                <IconDeviceDesktop className="mr-2" size={14} />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-sm leading-5 rounded-none"
          onClick={() => signOut()}
        >
          <IconLogout2 size={14} className="mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavItems() {
  return (
    <div className="flex flex-col gap-y-0.5 p-2 justify-start w-full">
      {navigation.map((item, idx) => {
        return (
          <NavLink
            key={item.slug}
            to={item.slug}
            className={({ isActive }) =>
              cn(
                "text-sm px-2 py-1.5 flex items-center h-full w-full relative text-foreground/80 rounded-md",
                isActive ? "bg-foreground/10" : "hover:bg-foreground/10"
              )
            }
          >
            <item.icon
              className="flex-none sm:mr-2"
              size={16}
              strokeWidth={1.5}
            />
            <span className="hidden sm:block text-sm">{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
