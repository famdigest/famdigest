import hubspot from "@hubspot/api-client";
import { sendNotification } from "./slack.server";

const hubspotClient = new hubspot.Client({
  accessToken: process.env.HUBSPOT_API_KEY,
});

export async function addToWaitlist(email: string) {
  try {
    await sendNotification({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "β New Beta Sign Up",
            emoji: true,
          },
        },
        {
          type: "divider",
        },
        {
          type: "rich_text",
          elements: [
            {
              type: "rich_text_section",
              elements: [
                {
                  type: "text",
                  text: `${email} just signed up`,
                },
              ],
            },
          ],
        },
      ],
    });

    const getContactResponse =
      await hubspotClient.crm.contacts.searchApi.doSearch({
        query: email,
        limit: 1,
        sorts: ["-createdate"],
        properties: ["email", "createdate"],
        filterGroups: [],
        after: 0,
      });

    if (getContactResponse.results.length > 0) {
      return getContactResponse.results[0];
    }

    const createContactResponse =
      await hubspotClient.crm.contacts.basicApi.create({
        properties: {
          email,
        },
        associations: [],
      });

    return createContactResponse;
  } catch (error) {
    throw error;
  }
}
