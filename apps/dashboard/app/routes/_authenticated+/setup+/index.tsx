import { Link } from "@remix-run/react";
import { Button } from "@repo/ui";
import { IconChevronRight } from "@tabler/icons-react";

export function loader() {
  return null;
}

export default function Route() {
  return (
    <div className="flex-1 flex py-16 items-start justify-center overflow-hidden">
      <div className="container sm:max-w-sm flex flex-col gap-y-10">
        <div>
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6">
            Welcome to FamDigest
          </h1>
          <p>
            Select the option that best describes what you're wanting to do?
          </p>
        </div>
        <div className="">
          <p className="font-semibold mb-4">I want to...</p>
          <div className="space-y-3">
            <Button
              className="bg-background hover:bg-muted text-foreground w-full rounded-lg h-14 text-left px-4 flex items-center justify-between"
              asChild
            >
              <Link to="/setup/send">
                <span>
                  <strong>Send</strong> my daily digest to someone else
                </span>
                <IconChevronRight size={20} />
              </Link>
            </Button>
            <Button
              className="bg-background hover:bg-muted text-foreground w-full rounded-lg h-14 text-left px-4 flex items-center justify-between"
              asChild
            >
              <Link to="/setup/myself">
                <span>
                  <strong>Get</strong> my own daily digest
                </span>
                <IconChevronRight size={20} />
              </Link>
            </Button>
            <Button
              className="bg-background hover:bg-muted text-foreground w-full rounded-lg h-14 text-left px-4 flex items-center justify-between"
              asChild
            >
              <Link to="/setup/receive">
                <span>
                  <strong>Get</strong> someone else's daily digest
                </span>
                <IconChevronRight size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
