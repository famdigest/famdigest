import fetch from "node-fetch";

export async function sendNotification({
  text,
  blocks,
}: {
  text?: string;
  blocks?: any;
}) {
  try {
    const response = await fetch(process.env.PRIVATE_SLACK_WEBHOOK!, {
      method: "post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ text, blocks }),
    });
    const data = await response.text();

    return data;
  } catch (error) {
    console.log(error);
    // throw error;
  }
}
