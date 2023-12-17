import { Link } from "@remix-run/react";
import { Button } from "@repo/ui";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="relative z-10 shrink-0">
      <div className="container max-w-screen-xl flex items-center justify-center py-4">
        <Link
          to="/"
          className="text-2xl font-medium font-serif flex items-center gap-x-2 text-slate-800"
        >
          <Logo className="h-16 w-16" />
          FamDigest
        </Link>
        {/* <nav>
          <Button>Coming Soon</Button>
        </nav> */}
      </div>
    </header>
  );
}
