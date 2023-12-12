import { Link } from "@remix-run/react";
import { Button } from "@repo/ui";

export function Header() {
  return (
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
  );
}
