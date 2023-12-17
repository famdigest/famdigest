import { Enums } from "@repo/supabase";
import { cn } from "@repo/ui";
import {
  IconBrandApple,
  IconBrandGoogle,
  IconCalendar,
} from "@tabler/icons-react";

export function ConnectionProviderIcon({
  provider,
}: {
  provider: Enums<"provider_type">;
}) {
  const icon = () => {
    if (provider === "google") {
      return <IconBrandGoogle className="w-6 h-6 md:w-8 md:h-8" />;
    }
    if (provider === "apple") {
      return <IconBrandApple className="w-6 h-6 md:w-8 md:h-8" />;
    }

    return <IconCalendar className="w-6 h-6 md:w-8 md:h-8" />;
  };

  return (
    <div
      className={cn(
        "w-10 md:w-16 aspect-square rounded-md border flex items-center justify-center shrink-0"
      )}
    >
      {icon()}
    </div>
  );
}
