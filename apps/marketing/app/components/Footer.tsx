import { Link } from "@remix-run/react";
import { IconBrandTwitter, IconBrandInstagram } from "@tabler/icons-react";
import dayjs from "dayjs";

export function Footer() {
  return (
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
  );
}
