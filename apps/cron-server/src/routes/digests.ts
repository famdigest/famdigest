import { FastifyInstance } from "fastify";
import { and, db, eq, schema } from "@repo/database";
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
          // NotificationService.send({
          //   key: "owner.connectionFailure",
          //   recipient: subscriber,
          //   owner: subscriber.owner,
          //   contact: subscriber.owner,
          //   // @ts-ignore jsonb bullshit
          //   workspace: workspace,
          //   calendar: calendar,
          //   type: "both",
          // });
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
      if (hour < 12) {
        timeOfDay = "morning";
      } else if (hour < 17) {
        timeOfDay = "afternoon";
      } else {
        timeOfDay = "evening";
      }

      if (allEvents.length === 0) {
        outboundMessage = dedent`Hey there ${subscriber.full_name}!\n\nThere are no events today.`;
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

        outboundMessage = dedent`There are ${allEvents.length} events today.
Good ${timeOfDay}!

Here is today's schedule:

${eventString}

Best,
FamDigest Team`;
      }

      totalEventsCaptured = totalEventsCaptured + allEvents.length;

      console.log("outboundMessage", outboundMessage);
      // twilio
      // if (subscriber.phone) {
      //   const sentMessage = await sendMessage({
      //     body: outboundMessage,
      //     to: subscriber.phone,
      //   });

      //   await db.insert(schema.messages).values({
      //     role: "assistant",
      //     message: outboundMessage,
      //     external_id: sentMessage.sid,
      //     segments: Number(sentMessage.numSegments),
      //     digest_id: subscriber.id,
      //     owner_id: subscriber.id,
      //     workspace_id: workspace.id,
      //     data: { msg: sentMessage, events: allEvents },
      //   });
      // }
    }

    // hit slack
    // if (subscribers.length > 0) {
    //   await sendNotification({
    //     blocks: [
    //       {
    //         type: "header",
    //         text: {
    //           type: "plain_text",
    //           text: "Daily Digest Report",
    //         },
    //       },
    //       {
    //         type: "rich_text",
    //         elements: [
    //           {
    //             type: "rich_text_list",
    //             style: "bullet",
    //             elements: [
    //               {
    //                 type: "rich_text_section",
    //                 elements: [
    //                   {
    //                     type: "text",
    //                     text: `Digest Sent: ${subscribers.length}`,
    //                   },
    //                 ],
    //               },
    //               {
    //                 type: "rich_text_section",
    //                 elements: [
    //                   {
    //                     type: "text",
    //                     text: `Total Events Captured: ${totalEventsCaptured}`,
    //                   },
    //                 ],
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     ],
    //   });
    // }

    reply.send({
      data: {
        ok: true,
      },
    });
  });
}

export default routes;
