import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Outlet,
  Scripts,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { WorkspaceBillingStatus } from "@repo/supabase";
import { Button } from "@repo/ui";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "~/lib/trpc";
import { getSessionWorkspace } from "~/lib/workspace.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, workspace, response, supabase } =
    await getSessionWorkspace(request);
  const { data } = await supabase
    .rpc("get_workspace_billing_status", {
      lookup_workspace_id: workspace.id,
    })
    .returns<WorkspaceBillingStatus>();

  const { pathname } = new URL(request.url);
  // if (data === null && !pathname.includes("subscribe")) {
  //   // no subs
  //   return redirect("/subscribe", {
  //     headers: response.headers,
  //   });
  // }

  return json({
    user,
    workspace,
    billing_status: data as WorkspaceBillingStatus,
  });
}

export default function WorkspaceLayout() {
  const { user, workspace, billing_status } = useLoaderData<typeof loader>();

  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  const renderErrorMarkup = () => {
    if (isRouteErrorResponse(error)) {
      return (
        <>
          <div className="flex items-center gap-x-2 text-sm text-primary uppercase tracking-wider font-medium mb-8 border px-2 py-1.5 rounded-md bg-background border-primary">
            <span className="h-2 w-2 rounded-full bg-primary overflow-hidden"></span>
            <p>{error.status} error</p>
          </div>
          <h1 className="text-7xl font-sans font-semibold mb-8 leading-none">
            {error.status === 404
              ? "We can't find that page"
              : "Sorry, something went wrong."}
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            {error.statusText
              ? error.statusText
              : "Sorry, the page you are looking for doesn't exist or has been moved."}
          </p>
          <Button asChild>
            <a href="/">
              <div className="h-full flex items-center justify-center font-bold">
                Back Home
              </div>
            </a>
          </Button>
        </>
      );
    }

    let errorMessage: string = "Unknown error";
    if (error instanceof Error && "message" in error) {
      errorMessage = error.message as string;
    }

    return (
      <>
        <div className="flex items-center gap-x-2 text-sm text-primary uppercase tracking-wider font-medium mb-8 border px-2 py-1.5 rounded-md bg-background border-primary">
          <span className="h-2 w-2 rounded-full bg-primary overflow-hidden"></span>
          <p>Oh No</p>
        </div>
        <h1 className="text-7xl font-sans font-semibold mb-4">
          Sorry, something went wrong.
        </h1>
        <p className="text-lg text-muted-foreground mb-8">{errorMessage}</p>
        <Button asChild>
          <a href="/">
            <div className="h-full flex items-center justify-center font-bold">
              Back Home
            </div>
          </a>
        </Button>
      </>
    );
  };

  return (
    <div className="h-screen w-screen bg-muted flex items-center justify-start">
      <div className="container max-w-screen-md flex flex-col items-start">
        {renderErrorMarkup()}
      </div>
      <Scripts />
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/zgutzmns';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`,
        }}
      />
    </div>
  );
}
