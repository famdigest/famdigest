import { json } from "@remix-run/node";
import { and, db, eq, schema } from "~/lib/db.server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { RemoteCalendarService } from "~/lib/calendars";
import { humanloop } from "~/lib/humanloop.server";
import dedent from "dedent";
import { sendMessage } from "~/lib/twilio.server";
import { sendNotification } from "~/lib/slack.server";

dayjs.extend(utc);

export async function action() {
  const now = dayjs().utc();
  const roundedMinute = Math.floor(now.minute() / 15) * 15;
  const roundedTime = now.minute(roundedMinute).second(0).millisecond(0);

  const digests = await db.query.digests.findMany({
    with: {
      profile: true,
    },
    where: eq(schema.digests.notify_on, roundedTime.format("HH:mm:ss")),
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
      const service = RemoteCalendarService.getProviderClass(
        calendar.connection
      );
      const events = await service.getTodayEvents(calendar.external_id);
      allEvents.push(...events);
    }

    allEvents.sort((a, b) => (dayjs(a.start).isAfter(dayjs(b.start)) ? 1 : -1));

    totalEventsCaptured = totalEventsCaptured + allEvents.length;
    // ai time
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

    // twilio
    const sentMessage = await sendMessage({
      body: response.data.data[0].output,
      to: digest.phone,
    });

    await db.insert(schema.messages).values({
      role: "assistant",
      message: response.data.data[0].output,
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

  return json({
    ok: true,
  });
}
