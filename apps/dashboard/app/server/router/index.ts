import { publicProcedure, router } from "~/server/trpc.server";
import { workspaceRouter } from "./workspace";
import { userRouter } from "./user";
import { inviteRouter } from "./invite";
import { memberRouter } from "./members";
import { billingRouter } from "./billing";
import { googleRouter } from "./google";
import { connectionsRouter } from "./connections";
import { digestsRouter } from "./digests";
import { calendarRouter } from "./calendars";
import { messagesRouter } from "./messages";
import { subscriptionRouter } from "./subscriptions";

export const appRouter = router({
  healthcheck: publicProcedure.query(() => "yay!"),
  workspaces: workspaceRouter,
  users: userRouter,
  invites: inviteRouter,
  members: memberRouter,
  billing: billingRouter,
  google: googleRouter,
  connections: connectionsRouter,
  digests: digestsRouter,
  calendars: calendarRouter,
  messages: messagesRouter,
  subscribers: subscriptionRouter,
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
