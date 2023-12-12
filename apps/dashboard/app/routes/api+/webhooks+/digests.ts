import { json } from "@remix-run/node";
import { and, db, eq, schema } from "~/lib/db.server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { RemoteCalendarService } from "~/lib/calendars";
import { humanloop } from "~/lib/humanloop.server";
import endent from "endent";

dayjs.extend(utc);

export async function action() {
  const now = dayjs().utc();
  const roundedMinute = Math.floor(now.minute() / 15) * 15;
  const roundedTime = now.minute(roundedMinute).second(0).millisecond(0);

  const digests = await db
    .select()
    .from(schema.digests)
    .where(eq(schema.digests.notify_on, roundedTime.format("HH:mm")));

  const allEvents = [];
  const allResponses = [];

  for (const digest of digests) {
    const [owner] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, digest.owner_id));

    const calendars = await db
      .select()
      .from(schema.calendars)
      .innerJoin(
        schema.connections,
        eq(schema.calendars.connection_id, schema.connections.id)
      )
      .where(
        and(
          eq(schema.calendars.owner_id, digest.owner_id),
          eq(schema.calendars.enabled, true)
        )
      );

    //
    // const allEvents = [];
    for (const item of calendars) {
      const { calendars: calendar, connections } = item;
      const service = RemoteCalendarService.getProviderClass(connections);
      const events = await service.getTodayEvents(calendar.external_id);
      allEvents.push(...events);
    }

    allEvents.sort((a, b) => (dayjs(a.start).isAfter(dayjs(b.start)) ? 1 : -1));

    // ai time
    const response = await humanloop.chatDeployed({
      project_id: process.env.HUMANLOOP_PROJECT_ID,
      messages: [
        {
          role: "user",
          content: endent`To: ${digest.full_name}
          From: ${owner.full_name}
          Events: ${JSON.stringify(allEvents, null, 2)}
        `,
        },
      ],
    });

    allResponses.push(response.data.data[0].output);

    // twilio
  }

  return json({
    roundedMinute,
    roundedTime: roundedTime.toJSON(),
    digests,
    allEvents,
    allResponses,
  });
}
