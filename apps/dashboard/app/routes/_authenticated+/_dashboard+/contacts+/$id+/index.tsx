import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Link, useLoaderData, useRevalidator } from "@remix-run/react";
import { asc, db, eq, schema } from "@repo/database";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Switch,
  Button,
} from "@repo/ui";
import { IconArrowLeft } from "@tabler/icons-react";
import { trpc } from "~/lib/trpc";
import { getSessionWorkspace } from "~/lib/workspace.server";
import { convertToLocal } from "~/lib/dates";
import { DigestFormModal } from "~/components/Digests/DigestFormModal";
import { useDisclosure } from "@mantine/hooks";
import { DigestMessages } from "~/components/Digests/DigestMessages";
import { getSession } from "~/lib/session.server";
import { trackPageView } from "@repo/tracking";
import { DigestMissingOptIn } from "~/components/Digests/DigestMissingOptIn";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Contacts: ${data?.digest.full_name} - FamDigest` }];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user, response } = await getSessionWorkspace(request);

  const { id } = params as { id: string };
  const [digest] = await db
    .select()
    .from(schema.digests)
    .where(eq(schema.digests.id, id));

  if (!digest) {
    throw new Response("", {
      status: 404,
      statusText: "Contact not found",
    });
  }

  const message = await db.query.messages.findFirst({
    where: (msg, { eq }) => eq(msg.digest_id, digest.id),
    orderBy: (msg, { desc }) => desc(msg.created_at),
  });

  const session = await getSession(request);
  trackPageView({
    request,
    properties: {
      device_id: session.id,
      title: "contacts:id",
      user_id: session.get("userId"),
    },
  });

  return json(
    {
      digest,
      lastMessage: message,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Route() {
  const [open, { toggle }] = useDisclosure(false);
  const { digest: initialData, lastMessage } = useLoaderData<typeof loader>();
  const { data: digest, isLoading } = trpc.digests.one.useQuery(
    initialData.id,
    {
      initialData,
    }
  );

  return (
    <div className="container max-w-screen-md py-6 md:py-12">
      {!digest.opt_in && (
        <DigestMissingOptIn digest={digest} lastMessage={lastMessage} />
      )}
      <div className="flex items-center p-4">
        <Link to="/contacts" className="flex items-center gap-x-2 text-sm">
          <IconArrowLeft size={14} />
          <span className="">Back to Contacts</span>
        </Link>
      </div>
      <Card>
        <div className="flex items-start md:items-center p-6 gap-x-4">
          <CardHeader className="p-0 space-y-0.5">
            <CardTitle className="capitalize text-xl">
              {digest.full_name}
            </CardTitle>
            <CardDescription>
              {digest.phone} | Every Day @{" "}
              {convertToLocal(digest.notify_on).format("hh:mm A")}
            </CardDescription>
          </CardHeader>
          <div className="ml-auto">
            <Button asChild>
              <Link to="edit">Edit</Link>
            </Button>
          </div>
        </div>
        <CardContent className="p-6 border-t space-y-4">
          <DigestMessages digest_id={digest.id} />
        </CardContent>
      </Card>
    </div>
  );
}
