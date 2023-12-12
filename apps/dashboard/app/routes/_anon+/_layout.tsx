import { Link, Outlet } from "@remix-run/react";
import { Logo } from "~/components/Logo";
import type { MetaFunction } from "@remix-run/node";
import { cn } from "@repo/ui";
import noise from "~/assets/noise.svg";

export const meta: MetaFunction = () => {
  return [];
};

export default function AuthLayout() {
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
      <main
        id="main"
        className="grid grid-cols-1 lg:grid-cols-2 flex-1 relative z-10"
      >
        <div className="flex items-center justify-center overflow-hidden relative z-10 px-8">
          <div className="flex flex-col items-center lg:items-start gap-y-2 w-full max-w-lg">
            <p className="text-2xl font-medium font-serif mb-8">FamDigest</p>

            <h1 className="text-5xl md:text-6xl font-medium font-serif">
              Never use a shared calendar again.
            </h1>
            <h2 className="text-2xl mt-4">
              Send a short daily digest of your day to{" "}
              <span className="underline italic">anyone</span> via text message.
            </h2>
            <p className="text-xs mt-3">
              By creating an account, you agree to our{" "}
              <Link to="https://www.famdigest.com/terms" className="underline">
                terms of use
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center lg:justify-center p-6 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
