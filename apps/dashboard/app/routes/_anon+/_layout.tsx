import { Outlet } from "@remix-run/react";
import { Logo } from "~/components/Logo";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    {
      name: "description",
      content: "[SEO Description]",
    },
    {
      property: "og:description",
      content: "[SEO Description]",
    },
    {
      property: "og:title",
      content: "[OG Title]",
    },
    // {
    //   property: "og:image",
    //   content: "/social/open-graph.jpg",
    // },
  ];
};

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <main
        id="main"
        className="grid grid-cols-1 lg:grid-cols-2 flex-1 relative"
      >
        <div className="flex items-center justify-center overflow-hidden relative z-10 px-8">
          <div className="flex flex-col items-center lg:items-start gap-y-2 w-full max-w-lg">
            <Logo className="h-16" />
            <p className="text-4xl font-medium tracking-tight">
              Build Better Software
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center lg:justify-center lg:bg-muted p-6 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
