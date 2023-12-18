import { Link } from "@remix-run/react";
import { IconBrandTwitter, IconBrandInstagram } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Logo } from "./Logo";
import { Button } from "@repo/ui";

export function Footer() {
  return (
    <footer className="relative z-10 shrink-0 bg-slate-800 text-white mt-24">
      <div className="container max-w-screen-xl transform -translate-y-1/2 -mb-24 md:mb-0">
        <div className="bg-background text-foreground rounded-xl shadow-lg flex flex-col gap-y-4 md:gap-y-0 md:flex-row items-start md:items-center md:justify-between p-6 md:p-12">
          <div className="max-w-screen-sm flex flex-col gap-y-1.5">
            <h2 className="text-4xl font-semibold font-serif tracking-tight">
              Start your 14-day free trial
            </h2>
            <p className="text-lg">
              Get up and running in less than 5 minutes.
            </p>
          </div>
          <Button asChild shape="pill">
            <Link to="https://app.famdigest.com/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
      <div className="container max-w-screen-xl flex flex-col md:flex-row md:items-center md:justify-between pb-6 md:pb-12">
        <div className="flex flex-col gap-y-6">
          <div className="flex items-center gap-x-2 font-serif">
            <Logo className="h-16 w-16" />
            <p className="text-2xl font-medium font-serif">FamDigest</p>
          </div>
          <p className="text-sm max-w-xs">
            Rethinking the way families share calendars one SMS at a time.
          </p>
          <nav className="flex items-center gap-x-4 text-sm">
            <Link to="/">Overview</Link>
            <Link to="#pricing">Pricing</Link>
            <Link
              to={`mailto:contact@famdigest.com?subject=${encodeURIComponent(
                "FamDigest Contact Form"
              )}`}
              target="_blank"
            >
              Contact
            </Link>
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </nav>
        </div>
        <div>
          <Button size="xl" variant="secondary" asChild shape="pill">
            <Link to="http://app.famdigest.com/sign-in">Sign up for free</Link>
          </Button>
        </div>
      </div>
      <div className="container max-w-screen-xl py-6 md:py-12 flex flex-col-reverse justify-center md:flex-row items-center md:justify-start gap-y-4 md:gap-y-0 border-t border-muted-foreground">
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
  );
}
