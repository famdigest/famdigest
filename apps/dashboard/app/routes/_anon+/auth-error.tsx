import { Link } from "@remix-run/react";
import { Button } from "@repo/ui";

export default function Route() {
  return (
    <div className="w-full max-w-md flex flex-col gap-y-6 p-8 md:p-12 bg-white rounded-md shadow-2xl">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight mb-3">
          Sorry, something went wrong!
        </h1>
        <div className="text-sm mb-2">
          <p>
            Your access link must have expired. Please try signing in again.
          </p>
        </div>
        <Button asChild>
          <Link to="/sign-in">Back to login</Link>
        </Button>
      </div>
    </div>
  );
}
