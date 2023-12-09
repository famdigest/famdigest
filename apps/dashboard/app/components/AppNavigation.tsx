import { Link, NavLink } from "@remix-run/react";
import { navigation } from "~/lib/navigation";
import { cn } from "@repo/ui";
import { Logo } from "./Logo";

export function AppNavigation() {
  return (
    <div
      className={cn(
        "group sticky top-0 flex-shrink-0 scrollbar-none",
        "transition-all ease-in-out duration-150",
        "sm:w-52 h-screen overflow-y-auto"
      )}
    >
      <div className="h-14 flex items-center p-2">
        <Link
          to="/"
          className="px-3 py-2 flex items-center h-full w-full relative text-foreground/80 rounded-md"
        >
          <Logo className="flex-none sm:mr-3 h-full" />
          <span className="hidden sm:block font-medium">FamDigest</span>
        </Link>
      </div>
      <NavItems />
    </div>
  );
}

function NavItems() {
  return (
    <div className="flex flex-col gap-y-2 p-2 justify-start w-full">
      {navigation.map((item, idx) => {
        return (
          <NavLink
            key={item.slug}
            to={item.slug}
            className={({ isActive }) =>
              cn(
                "px-3 py-2 flex items-center h-full w-full relative text-foreground/80 rounded-md",
                isActive ? "bg-foreground/10" : "hover:bg-foreground/10"
              )
            }
          >
            <item.icon
              className="flex-none sm:mr-3"
              size={20}
              strokeWidth={1.5}
            />
            <span className="hidden sm:block text-sm">{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
