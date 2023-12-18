import Mixpanel from "mixpanel";
import UAParser from "ua-parser-js";
import { getClientIPAddress } from "./getClientIp";
import { z } from "zod";

const requestschema: z.ZodType<Request> = z.any();
const baseProperties = z.record(z.any());
const requiredProperties = z.object({
  device_id: z.string(),
  event_name: z.string(),
});
const mixpanelEventSchema = z.object({
  request: requestschema,
  properties: baseProperties.and(requiredProperties),
});
const mixpanelPageViewSchema = mixpanelEventSchema.extend({
  properties: requiredProperties.pick({ device_id: true }).and(baseProperties),
});

const peopleProperties = z.object({
  avatar: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  plan: z.string().optional(),
  interval: z.string().optional(),
  digests: z.number().optional(),
  calendars: z.number().optional(),
  created: z.string().optional(),
});
const mixpanelPeopleSchema = z.object({
  id: z.string(),
  request: requestschema,
  properties: baseProperties.and(peopleProperties),
});

export type MixpanelEvent = z.infer<typeof mixpanelEventSchema>;
export type MixpanelDefinedEvent = z.infer<typeof mixpanelPageViewSchema>;
export type MixpanelPeopleEvent = z.infer<typeof mixpanelPeopleSchema>;

export function trackPageView(args: MixpanelDefinedEvent) {
  if (!args.properties.device_id) {
    return null;
  }
  return track({
    ...args,
    properties: {
      ...args.properties,
      event_name: "Page Viewed",
    },
  });
}

export function identify(args: MixpanelDefinedEvent) {
  return track({
    ...args,
    properties: {
      ...args.properties,
      event_name: "$identify",
    },
  });
}

export function people(args: MixpanelPeopleEvent) {
  const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
  const { id, properties } = mixpanelPeopleSchema.parse(args);
  const { avatar, name, email, created, ...others } = properties;
  mixpanel.people.set(id, {
    $avatar: avatar,
    $name: name,
    $email: email,
    $created: created,
    ...others,
  });
  return {
    ok: true,
  };
}

export function track(args: MixpanelEvent) {
  const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
  const { request, properties } = mixpanelEventSchema.parse(args);

  const { event_name, device_id, user_id, user_agent, ...others } = properties;

  const { searchParams } = new URL(request.url);
  const referrer = request.headers.get("referer");
  const { browser, device, os } = UAParser(
    user_agent ?? request.headers.get("user-agent") ?? ""
  );

  const finalProperties: Record<string, any> = {
    $device_id: device_id,
    $current_url: request.url,
    $browser: browser.name,
    $device: device.vendor,
    $os: os.name,
    $referrer: referrer ?? undefined,
    $referring_domain: referrer ? new URL(referrer).hostname : undefined,
    ip: getClientIPAddress(request.headers),
    ...Object.fromEntries(searchParams),
    ...others,
  };

  if (user_id) {
    finalProperties.$user_id = user_id;
  }

  mixpanel.track(event_name!, finalProperties);

  return {
    ok: true,
  };
}
