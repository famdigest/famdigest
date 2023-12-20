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
    const digests = await db.query.digests.findMany({
      with: {
        profile: true,
      },
      where: (table, { and, eq }) =>
        and(eq(table.opt_in, false), eq(table.enabled, true)),
    });

    const today = dayjs();

    for (const digest of digests) {
      const diff = Math.abs(today.diff(dayjs(digest.created_at), "days"));
      if (diff === 3) {
        NotificationService.send({
          owner: digest.profile,
          contact: digest,
          recipient: digest.profile,
          key: "owner.subscriberFailedToOptIn",
          type: "email",
        });

        await db
          .update(schema.digests)
          .set({
            enabled: false,
          })
          .where(eq(schema.digests.id, digest.id));
      } else if (diff >= 1 && diff < 3) {
        NotificationService.send({
          owner: digest.profile,
          contact: digest,
          recipient: digest.profile,
          key: "owner.subscriberOptInReminder",
          type: "sms",
        });

        NotificationService.send({
          owner: digest.profile,
          contact: digest,
          recipient: digest,
          key: "contact.optInReminder",
          type: "sms",
        });
      }
    }

    reply.send({
      data: {
        ok: true,
      },
    });
  });

  fastify.get("/digests/:id", async (request, reply) => {
    // if (process.env.NODE_ENV === "production") {
    //   return reply.send({
    //     error: {
    //       message: "Nice Try",
    //     },
    //   });
    // }
    const { id } = request.params as { id: string };
    const digest = await db.query.digests.findFirst({
      with: {
        profile: true,
      },
      where: (table, { and, eq }) => and(eq(table.id, id)),
    });
    if (!digest) {
      return reply.send({
        error: {
          message: "No Digest Found",
        },
      });
    }

    const calendars = await db.query.calendars.findMany({
      with: {
        connection: true,
      },
      where: and(
        eq(schema.calendars.owner_id, digest.owner_id),
        eq(schema.calendars.enabled, true)
      ),
    });

    const allEvents = [];

    for (const calendar of calendars) {
      try {
        const service = getCalendarProviderClass(calendar.connection);
        const events = await service.getTodayEvents(calendar.external_id);
        allEvents.push(...events);
      } catch (error) {
        // shh
      }
    }

    allEvents.sort((a, b) => (dayjs(a.start).isAfter(dayjs(b.start)) ? 1 : -1));

    const eventString = allEvents
      .map((event) => {
        if (event.allDay) {
          return `${event.title ?? "Busy"} - All Day`;
        }
        return `${event.title ?? "Busy"} - ${dayjs(event.start).format(
          "h:mm a"
        )} - ${dayjs(event.end).format("h:mm a")}`;
      })
      .join("\n");

    const utc = dayjs.utc();
    return reply.send({
      utc: utc,
      start: utc.startOf("day").toISOString(),
      end: utc.endOf("day").toISOString(),
      message: eventString,
      data: allEvents,
    });
  });

  fastify.post("/digests", async (_request, reply) => {
    const now = dayjs().utc();
    const roundedMinute = Math.floor(now.minute() / 15) * 15;
    const roundedTime = now.minute(roundedMinute).second(0).millisecond(0);

    const digests = await db.query.digests.findMany({
      with: {
        profile: true,
      },
      where: (table, { and, eq }) =>
        and(
          eq(table.notify_on, roundedTime.format("HH:mm:ss")),
          eq(table.opt_in, true),
          eq(table.enabled, true)
        ),
    });

    let totalEventsCaptured = 0;

    for (const digest of digests) {
      const owner = digest.profile;
      const calendars = await db.query.calendars.findMany({
        with: {
          connection: true,
        },
        where: and(
          eq(schema.calendars.owner_id, digest.owner_id),
          eq(schema.calendars.enabled, true)
        ),
      });

      //
      const allEvents = [];

      for (const calendar of calendars) {
        try {
          const service = getCalendarProviderClass(calendar.connection);
          const events = await service.getTodayEvents(calendar.external_id);
          allEvents.push(...events);
        } catch (error) {
          //
          NotificationService.send({
            key: "owner.connectionFailure",
            recipient: digest.profile,
            owner: digest.profile,
            contact: digest,
            calendar: calendar,
            type: "both",
          });
        }
      }

      allEvents.sort((a, b) =>
        dayjs(a.start).isAfter(dayjs(b.start)) ? 1 : -1
      );

      const local = dayjs(dayjs()).tz(digest.timezone);
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
        outboundMessage = dedent`Hey there ${digest.full_name}!\n\nNo events for ${owner.full_name} today.`;
      } else {
        const eventString = allEvents
          .map((event) => {
            if (event.allDay) {
              return `${event.title ?? "Busy"} - All Day`;
            }
            return `${event.title ?? "Busy"} - ${dayjs(event.start).format(
              "h:mm a"
            )} - ${dayjs(event.end).format("h:mm a")}`;
          })
          .join("\n");

        outboundMessage = dedent`Good ${timeOfDay}, ${digest.full_name}!

Here's your daily digest for ${owner.full_name}:

${eventString}

Best,
FamDigest Team`;
      }

      totalEventsCaptured = totalEventsCaptured + allEvents.length;

      // twilio
      const sentMessage = await sendMessage({
        body: outboundMessage,
        to: digest.phone,
      });

      await db.insert(schema.messages).values({
        role: "assistant",
        message: outboundMessage,
        external_id: sentMessage.sid,
        segments: Number(sentMessage.numSegments),
        digest_id: digest.id,
        owner_id: owner.id,
        data: { msg: sentMessage, events: allEvents },
      });
    }

    // hit slack
    if (digests.length > 0) {
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
                        text: `Digest Sent: ${digests.length}`,
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
}

export default routes;
