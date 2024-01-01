import { Enums } from "@repo/supabase";
import { cn } from "@repo/ui";
import { IconCalendar } from "@tabler/icons-react";
import { GoogleCalendarIcon } from "../GoogleIcon";
import outlookIcon from "~/assets/outlook-icon.svg";
import appleIcon from "~/assets/apple-icon.svg";

export function ConnectionProviderIcon({
  provider,
  className,
}: {
  provider?: Enums<"provider_type">;
  className?: string;
}) {
  const icon = () => {
    if (provider === "google") {
      return <GoogleCalendarIcon className="w-full h-full" />;
    }

    if (provider === "apple") {
      return <img src={appleIcon} className="w-full h-full" />;
    }

    if (provider === "office365") {
      return <img src={outlookIcon} className="w-full h-full" />;
    }

    return <IconCalendar className="w-full h-full" />;
  };

  return (
    <div
      className={cn(
        "w-10 aspect-square flex items-center justify-center shrink-0",
        className
      )}
    >
      {icon()}
    </div>
  );
}
