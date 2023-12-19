import { FastifyInstance } from "fastify";
import { and, db, eq, schema } from "@repo/database";
import { getCalendarProviderClass } from "@repo/plugins";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import dedent from "dedent";

import { humanloop } from "../lib/humanloop";
import { sendMessage } from "../lib/twilio";
import { sendNotification } from "../lib/slack";

dayjs.extend(utc);

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
      const diff = Math.abs(today.diff(dayjs(digest.created_at)));
      if (diff > 9) {
        await db
          .update(schema.digests)
          .set({
            enabled: false,
          })
          .where(eq(schema.digests.id, digest.id));
      } else if (diff % 3 == 0) {
        //resend
      }
    }

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
        const service = getCalendarProviderClass(calendar.connection);
        const events = await service.getTodayEvents(calendar.external_id);
        allEvents.push(...events);
      }

      allEvents.sort((a, b) =>
        dayjs(a.start).isAfter(dayjs(b.start)) ? 1 : -1
      );

      let outboundMessage = "";

      if (allEvents.length === 0) {
        outboundMessage = dedent`Hey there ${digest.full_name}!\n\nNo events for ${owner.full_name} today.`;
      } else {
        const response = await humanloop.chatDeployed({
          project_id: process.env.HUMANLOOP_PROJECT_ID,
          messages: [
            {
              role: "user",
              content: dedent`Send my daily digest to ${digest.full_name}.

          ## SENDER
          ${owner.full_name}

          ## EVENTS
          ${JSON.stringify(allEvents, null, 2)}
        `,
            },
          ],
        });
        outboundMessage = response.data.data[0].output;
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
