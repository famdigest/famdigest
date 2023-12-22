import { Enums } from "@repo/supabase";
import { cn } from "@repo/ui";
import { IconBrandApple, IconCalendar } from "@tabler/icons-react";
import { GoogleCalendarIcon } from "../GoogleIcon";
import outlookIcon from "~/assets/outlook-icon.svg";

export function ConnectionProviderIcon({
  provider,
}: {
  provider: Enums<"provider_type">;
}) {
  const icon = () => {
    if (provider === "google") {
      return <GoogleCalendarIcon className="w-6 h-6 lg:w-8 lg:h-8" />;
    }

    if (provider === "apple") {
      return <IconBrandApple className="w-6 h-6 lg:w-8 lg:h-8" />;
    }

    if (provider === "office365") {
      return <img src={outlookIcon} className="w-6 h-6 lg:w-8 lg:h-8" />;
    }

    return <IconCalendar className="w-6 h-6 lg:w-8 lg:h-8" />;
  };

  return (
    <div
      className={cn(
        "w-10 lg:w-16 aspect-square rounded-md border flex items-center justify-center shrink-0"
      )}
    >
      {icon()}
    </div>
  );
}
