import { Link } from "@remix-run/react";
import { IconBrandTwitter, IconBrandInstagram } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative z-10 shrink-0 bg-slate-800 text-white mt-12 md:mt-24">
      <div className="container max-w-screen-xl flex flex-col md:flex-row md:items-center md:justify-between py-6 md:py-12">
        <div className="flex flex-col gap-y-6">
          <div className="flex items-center gap-x-2 font-serif">
            <Logo className="h-16 w-16" />
            <p className="text-2xl font-medium font-serif">FamDigest</p>
          </div>
          <p className="text-sm max-w-xs">
            Rethinking the way families share calendars one SMS at a time.
          </p>
          <nav className="flex items-center gap-x-4 text-sm">
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
