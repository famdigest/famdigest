import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Link, useLoaderData, useRevalidator } from "@remix-run/react";
import { asc, db, eq, schema } from "~/lib/db.server";
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
import { ConnectionProviderIcon } from "~/components/Connections/ConnectionProviderIcon";
import { RemoteCalendarService } from "~/lib/calendars";
import { trpc } from "~/lib/trpc";
import { getSessionWorkspace } from "~/lib/workspace.server";
import { convertToLocal } from "~/lib/dates";
import { DigestFormModal } from "~/components/Digests/DigestFormModal";
import { useDisclosure } from "@mantine/hooks";
import { DisgestMessages } from "~/components/Digests/DigestMessages";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Digests: ${data?.digest.full_name} - FamDigest` }];
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
      statusText: "Digest not found",
    });
  }

  return json(
    {
      digest,
    },
    {
      headers: response.headers,
    }
  );
}

export default function Route() {
  const [open, { toggle }] = useDisclosure(false);
  const { digest: initialData } = useLoaderData<typeof loader>();
  const { data: digest, isLoading } = trpc.digests.one.useQuery(
    initialData.id,
    {
      initialData,
    }
  );

  return (
    <div className="container max-w-screen-md p-6 md:p-12">
      <div className="flex items-center p-4">
        <Link to="/digests" className="flex items-center gap-x-2 text-sm">
          <IconArrowLeft size={14} />
          <span className="">Back to Digests</span>
        </Link>
      </div>
      <Card>
        <div className="flex items-start md:items-center p-6 gap-x-4">
          <CardHeader className="p-0 space-y-0.5">
            <CardTitle className="capitalize text-xl">
              {digest.full_name}
            </CardTitle>
            <CardDescription>
              Every Day @ {convertToLocal(digest.notify_on).format("hh:mm A")}
            </CardDescription>
          </CardHeader>
          <div className="ml-auto">
            <DigestFormModal digest={digest} open={open} onOpenChange={toggle}>
              <Button>Edit</Button>
            </DigestFormModal>
          </div>
        </div>
        <CardContent className="p-6 border-t space-y-4">
          <DisgestMessages digest_id={digest.id} />
        </CardContent>
      </Card>
    </div>
  );
}
