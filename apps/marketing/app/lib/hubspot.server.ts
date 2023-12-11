import hubspot from "@hubspot/api-client";

const hubspotClient = new hubspot.Client({
  accessToken: process.env.HUBSPOT_API_KEY,
});

export async function addToWaitlist(email: string) {
  try {
    const getContactResponse =
      await hubspotClient.crm.contacts.searchApi.doSearch({
        query: `email=${email}`,
        limit: 1,
        sorts: ["-createdate"],
        properties: ["email", "createdate"],
        filterGroups: [],
        after: 0,
      });

    if (getContactResponse.results) {
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
