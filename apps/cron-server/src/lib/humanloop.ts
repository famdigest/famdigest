import { Humanloop } from "humanloop";

const humanloop = new Humanloop({
  apiKey: process.env.HUMANLOOP_API_KEY!,
  openaiApiKey: process.env.OPENAI_API_KEY,
});

export { humanloop };
