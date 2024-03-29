import { Link, Outlet } from "@remix-run/react";
import { cn } from "@repo/ui";
import noise from "~/assets/noise.svg";

export const meta = () => {
  return [
    { title: "Account Setup | FamDigest" },
    {
      property: "og:title",
      content: "Account Setup | FamDigest",
    },
  ];
};

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-r from-rose-100 to-teal-100">
      <div
        className={cn(
          "absolute inset-0 brightness-100 opacity-50 contrast-150 z-0 pointer-events-none"
        )}
        style={{
          backgroundImage: `url(${noise})`,
        }}
      />
      <header>
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-medium font-serif">
            FamDigest{" "}
            <span className="font-sans text-base font-normal">/ Setup</span>
          </div>
        </div>
      </header>
      <main id="main" className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
