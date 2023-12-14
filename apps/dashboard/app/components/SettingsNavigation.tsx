import { Link, NavLink, useLocation, useNavigate } from "@remix-run/react";
import { settings } from "~/lib/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  cn,
} from "@repo/ui";
import { IconArrowLeft } from "@tabler/icons-react";

export function SettingsNavigation() {
  return (
    <div
      className={cn(
        "hidden md:block group sticky top-0 flex-shrink-0 scrollbar-none",
        "transition-all ease-in-out duration-150",
        "sm:w-52 h-screen overflow-y-auto",
        "bg-secondary"
      )}
    >
      <div className="flex items-center p-4">
        <Link to="/" className="flex items-center gap-x-2 text-sm">
          <IconArrowLeft size={14} />
          <span className="hidden sm:inline">Back</span>
        </Link>
      </div>

      <NavItems />
    </div>
  );
}

export function SettingsNavMobile() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="md:hidden container py-4">
      <Select value={location.pathname} onValueChange={(val) => navigate(val)}>
        <SelectTrigger className="w-full lg:hidden">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          {settings.map((group, idx) => (
            <SelectGroup key={idx}>
              <SelectLabel>{group.name}</SelectLabel>
              {group.items.map((item) => (
                <SelectItem value={item.slug} key={item.slug}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function NavItems() {
  return (
    <div className="flex flex-col gap-y-0.5 p-2 justify-start w-full">
      {settings.map((group, idx) => {
        return (
          <div className="" key={idx}>
            <p className="hidden p-2 sm:inline-block text-sm font-medium">
              {group.name}
            </p>
            <nav className="flex flex-col gap-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.slug}
                  to={item.slug}
                  end={item.slug === "/settings"}
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
              ))}
            </nav>
          </div>
        );
      })}
    </div>
  );
}
