import { Link, Outlet } from "@remix-run/react";
import { Button, cn } from "@repo/ui";
import { IconBrandInstagram, IconBrandTwitter } from "@tabler/icons-react";
import dayjs from "dayjs";
import noise from "~/assets/noise.svg";

//
export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen w-screen relative overflow-hidden bg-gradient-to-r from-rose-100 to-teal-100">
      <div
        className={cn(
          "absolute inset-0 brightness-100 opacity-50 contrast-150 z-0 pointer-events-none"
        )}
        style={{
          backgroundImage: `url(${noise})`,
        }}
      />
      <header className="relative z-10 shrink-0">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="text-2xl font-medium font-serif">
            FamDigest
          </Link>
          <nav>
            <Button>Coming Soon</Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>
      <footer className="relative z-10 shrink-0 py-4">
        <div className="container flex flex-col-reverse justify-center md:flex-row items-center md:justify-start gap-y-4 md:gap-y-0">
          <p className="text-xs">
            Copyright &copy; 2021 - {dayjs().year()}. FamDigest. All rights
            reserved.
          </p>
          <nav className="flex gap-x-4 md:ml-auto">
            <Link to="https://twitter.com/famdigest" target="_blank">
              <IconBrandTwitter />
            </Link>
            <Link to="https://www.instagram.com/famdigest/" target="_blank">
              <IconBrandInstagram />
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
