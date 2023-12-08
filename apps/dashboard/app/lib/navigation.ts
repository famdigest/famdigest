import {
  IconUser,
  IconSettings,
  IconUsers,
  IconCreditCard,
  IconPassword,
  IconUsersGroup,
  IconLayoutDashboard,
} from "@tabler/icons-react";

export const navigation = [
  { slug: "/", name: "Dashboard", icon: IconLayoutDashboard },
  { slug: "/settings", name: "Settings", icon: IconSettings },
];

export const settings = [
  {
    name: "Workspace Settings",
    items: [
      { slug: "/settings", name: "Workspace", icon: IconUsersGroup, end: true },
      { slug: "/settings/members", name: "Members", icon: IconUsers },
      { slug: "/settings/billing", name: "Billing", icon: IconCreditCard },
    ],
  },
  {
    name: "Account Settings",
    items: [
      { slug: "/settings/account", name: "Account", icon: IconUser },
      {
        slug: "/settings/password",
        name: "Password",
        icon: IconPassword,
      },
    ],
  },
];
