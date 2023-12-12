import { Link, Outlet } from "@remix-run/react";
import { Button, cn } from "@repo/ui";
import { IconBrandInstagram, IconBrandTwitter } from "@tabler/icons-react";
import dayjs from "dayjs";
import noise from "~/assets/noise.svg";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";

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
      <Header />
      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
