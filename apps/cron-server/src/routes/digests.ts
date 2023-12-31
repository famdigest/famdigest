import { FastifyInstance } from "fastify";
import { db, schema } from "@repo/database";
import { getCalendarProviderClass } from "@repo/plugins";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import dedent from "dedent";

import { sendMessage } from "../lib/twilio";
import { sendNotification } from "../lib/slack";
import { NotificationService } from "@repo/notifications";

dayjs.extend(utc);
dayjs.extend(timezone);

async function routes(fastify: FastifyInstance, _options: any) {
  fastify.post("/opt-in-reminder", async (_request, reply) => {
    reply.send({
      data: {
        ok: true,
      },
    });
  });

  fastify.post("/digests", async (_request, reply) => {
    const now = dayjs().utc();
    const roundedMinute = Math.floor(now.minute() / 15) * 15;
    const roundedTime = now.minute(roundedMinute).second(0).millisecond(0);

    const subscribers = await db.query.subscriptions.findMany({
      with: {
        workspace: true,
        owner: true,
        subscription_calendars: {
          with: {
            calendar: {
              with: {
                connection: true,
              },
            },
          },
        },
      },
      where: (table, { and, eq }) =>
        and(
          eq(table.notify_on, roundedTime.format("HH:mm:ss")),
          eq(table.opt_in, true),
          eq(table.enabled, true)
        ),
    });

    let totalEventsCaptured = 0;

    for (const subscriber of subscribers) {
      const calendars = subscriber.subscription_calendars.map(
        (sc) => sc.calendar
      );
      const allEvents = [];
      for (const calendar of calendars) {
        try {
          const service = getCalendarProviderClass(calendar.connection);
          const events =
            subscriber.event_preferences === "same-day"
              ? await service.getTodayEvents(calendar.external_id)
              : await service.getTomorrowEvents(calendar.external_id);
          allEvents.push(...events);
        } catch (error) {
          //
          NotificationService.send({
            key: "owner.connectionFailure",
            recipient: subscriber,
            owner: subscriber.owner,
            contact: subscriber.owner,
            // @ts-ignore jsonb bullshit
            workspace: workspace,
            calendar: calendar,
            type: "both",
          });
        }
      }

      allEvents.sort((a, b) =>
        dayjs(a.start).isAfter(dayjs(b.start)) ? 1 : -1
      );

      const timezone = subscriber.timezone ?? "America/New_York";
      const local = dayjs(dayjs()).tz(timezone);
      const hour = local.hour();
      let outboundMessage = "";
      let timeOfDay = "";
      let event_pref =
        subscriber.event_preferences === "same-day" ? "today" : "tomorrow";
      if (hour < 12) {
        timeOfDay = "morning";
      } else if (hour < 17) {
        timeOfDay = "afternoon";
      } else {
        timeOfDay = "evening";
      }

      if (allEvents.length === 0) {
        outboundMessage = dedent`Good ${timeOfDay} ${subscriber.full_name}\n\nThere are no events ${event_pref}.`;
      } else {
        const eventString = allEvents
          .map((event) => {
            if (event.allDay) {
              return `All Day - ${event.title ?? "Busy"}`;
            }
            return `${dayjs(event.start)
              .tz(timezone)
              .format("h:mm a")} - ${dayjs(event.end)
              .tz(timezone)
              .format("h:mm a")} ${event.title ?? "Busy"}`;
          })
          .join("\n");

        outboundMessage = dedent`There are ${allEvents.length} event(s) ${event_pref}.
Good ${timeOfDay}!

Here is ${event_pref}'s schedule:

${eventString}

Best,
FamDigest Team`;
      }

      totalEventsCaptured = totalEventsCaptured + allEvents.length;

      // twilio
      if (subscriber.phone) {
        const sentMessage = await sendMessage({
          body: outboundMessage,
          to: `+${subscriber.phone}`,
        });

        await db.insert(schema.subscription_logs).values({
          owner_id: subscriber.owner.id,
          workspace_id: subscriber.workspace.id,
          subscription_id: subscriber.id,
          external_id: sentMessage.sid,
          message: outboundMessage,
          segments: Number(sentMessage.numSegments),
          data: { msg: sentMessage, events: allEvents },
        });
      }
    }

    // hit slack
    if (subscribers.length > 0) {
      await sendNotification({
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "Daily Digest Report",
            },
          },
          {
            type: "rich_text",
            elements: [
              {
                type: "rich_text_list",
                style: "bullet",
                elements: [
                  {
                    type: "rich_text_section",
                    elements: [
                      {
                        type: "text",
                        text: `Digest Sent: ${subscribers.length}`,
                      },
                    ],
                  },
                  {
                    type: "rich_text_section",
                    elements: [
                      {
                        type: "text",
                        text: `Total Events Captured: ${totalEventsCaptured}`,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
    }

    reply.send({
      data: {
        ok: true,
      },
    });
  });

  type DryRunRequestBody = {
    mocktime: string;
  };
  fastify.post<{ Body: DryRunRequestBody }>(
    "/digests/dry-run",
    async (request, reply) => {
      const mocktime = request.body.mocktime;
      let now = dayjs().utc();
      if (mocktime) {
        const [hour, minutes] = mocktime.split(":");
        now = now.hour(Number(hour)).minute(Number(minutes));
      }
      const roundedMinute = Math.floor(now.minute() / 15) * 15;
      const roundedTime = now.minute(roundedMinute).second(0).millisecond(0);

      const subscribers = await db.query.subscriptions.findMany({
        with: {
          workspace: true,
          owner: true,
          subscription_calendars: {
            with: {
              calendar: {
                with: {
                  connection: true,
                },
              },
            },
          },
        },
        where: (table, { and, eq }) =>
          and(
            eq(table.notify_on, roundedTime.format("HH:mm:ss")),
            eq(table.opt_in, true),
            eq(table.enabled, true)
          ),
      });

      let totalEventsCaptured = 0;
      let subscriberMessages: { phone: string; message: string }[] = [];

      for (const subscriber of subscribers) {
        const calendars = subscriber.subscription_calendars.map(
          (sc) => sc.calendar
        );
        const allEvents = [];
        for (const calendar of calendars) {
          try {
            const service = getCalendarProviderClass(calendar.connection);
            const events =
              subscriber.event_preferences === "same-day"
                ? await service.getTodayEvents(calendar.external_id)
                : await service.getTomorrowEvents(calendar.external_id);
            allEvents.push(...events);
          } catch (error) {
            //
          }
        }

        allEvents.sort((a, b) =>
          dayjs(a.start).isAfter(dayjs(b.start)) ? 1 : -1
        );

        const timezone = subscriber.timezone ?? "America/New_York";
        const local = dayjs(dayjs()).tz(timezone);
        const hour = local.hour();
        let outboundMessage = "";
        let timeOfDay = "";
        let event_pref =
          subscriber.event_preferences === "same-day" ? "today" : "tomorrow";
        if (hour < 12) {
          timeOfDay = "morning";
        } else if (hour < 17) {
          timeOfDay = "afternoon";
        } else {
          timeOfDay = "evening";
        }

        if (allEvents.length === 0) {
          outboundMessage = dedent`Good ${timeOfDay} ${subscriber.full_name}\n\nThere are no events ${event_pref}.`;
        } else {
          const eventString = allEvents
            .map((event) => {
              if (event.allDay) {
                return `All Day - ${event.title ?? "Busy"}`;
              }
              return `${dayjs(event.start)
                .tz(timezone)
                .format("h:mm a")} - ${dayjs(event.end)
                .tz(timezone)
                .format("h:mm a")} ${event.title ?? "Busy"}`;
            })
            .join("\n");

          outboundMessage = dedent`There are ${allEvents.length} event(s) ${event_pref}.
Good ${timeOfDay}, ${subscriber.full_name}!

Here is ${event_pref}'s schedule:

${eventString}

Best,
FamDigest Team`;
        }

        totalEventsCaptured = totalEventsCaptured + allEvents.length;

        // twilio
        if (subscriber.phone) {
          subscriberMessages.push({
            phone: subscriber.phone,
            message: outboundMessage,
          });
        }
      }

      reply.send({
        data: {
          ok: true,
          roundedTime,
          subscriberMessages,
        },
      });
    }
  );
}

export default routes;
