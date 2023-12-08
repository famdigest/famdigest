import { NavLink, useLocation, useNavigate } from "@remix-run/react";
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

export function SettingsNavigation() {
  return (
    <div className={cn("group flex-shrink-0 scrollbar-none w-full")}>
      <NavItems />
      <NavItemsMobile />
    </div>
  );
}

function NavItems() {
  return (
    <div className="hidden lg:flex flex-col gap-y-2 px-2 justify-start w-full">
      {settings.map((group, idx) => {
        return (
          <div className="mb-6 last-of-type:mb-0" key={idx}>
            <p className="p-2 inline-block text-sm font-medium">{group.name}</p>
            <nav className="flex flex-col gap-y-2 justify-start w-full">
              {group.items.map((item) => (
                <NavLink
                  key={item.slug}
                  to={item.slug}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-2 flex items-center h-full w-full relative text-foreground/80 rounded-md",
                      isActive ? "bg-muted" : "hover:bg-muted"
                    )
                  }
                >
                  <item.icon
                    className="flex-none mr-3"
                    size={20}
                    strokeWidth={1.5}
                  />
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        );
      })}
    </div>
  );
}

function NavItemsMobile() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
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
  );
}
