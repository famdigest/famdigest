import { Link } from "@remix-run/react";
import {
  Button,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@repo/ui";
import { Logo } from "./Logo";
import { IconMenu, IconMenu2 } from "@tabler/icons-react";

export function Header() {
  return (
    <header className="relative z-10 shrink-0">
      <div className="container max-w-screen-xl flex items-center justify-between py-4">
        <Link
          to="/"
          className="text-2xl font-medium font-serif flex items-center gap-x-2 text-slate-800"
        >
          <Logo className="h-12 w-12" />
          FamDigest
        </Link>
        <nav className="hidden md:flex items-center gap-x-6 text-sm">
          <Link to="#overview">Overview</Link>
          <Link to="#pricing">Pricing</Link>
          <Link
            to={`mailto:support@famdigest.com?subject=${encodeURIComponent(
              "FamDigest Contact Form"
            )}`}
            target="_blank"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-x-2 h-full">
          <Button asChild shape="pill">
            <Link to="https://app.famdigest.com/sign-up">Get Started</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon-sm" variant="ghost" className="md:hidden">
                <IconMenu size={16} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="flex flex-col">
              <Link
                to="/"
                className="text-2xl font-medium font-serif flex items-center gap-x-2 text-slate-800 shrink-0"
              >
                <Logo className="h-12 w-12" />
                FamDigest
              </Link>
              <nav className="flex flex-col gap-y-6 text-sm my-6">
                <SheetClose asChild>
                  <Link to="#overview">Overview</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="#pricing">Pricing</Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    to={`mailto:support@famdigest.com?subject=${encodeURIComponent(
                      "FamDigest Contact Form"
                    )}`}
                    target="_blank"
                  >
                    Contact
                  </Link>
                </SheetClose>
                <Separator />
                <div className="flex gap-x-6">
                  <SheetClose asChild>
                    <Link
                      to="https://app.famdigest.com/sign-up"
                      className="text-xs"
                    >
                      Login
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/privacy-policy" className="text-xs">
                      Privacy
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/terms" className="text-xs">
                      Terms
                    </Link>
                  </SheetClose>
                </div>
              </nav>
              <Button asChild shape="pill" className="shrink-0">
                <Link to="https://app.famdigest.com/sign-up">Get Started</Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
