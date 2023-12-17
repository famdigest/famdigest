import { IconCalendarCheck } from "@tabler/icons-react";
import logoSrc from "~/assets/logo.png";

export function Logo(props: React.ComponentPropsWithoutRef<"img">) {
  return <img src={logoSrc} alt="logo" {...props} />;
}
