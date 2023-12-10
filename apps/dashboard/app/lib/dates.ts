import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import timezonePlugin from "dayjs/plugin/timezone.js";
import utcPlugin from "dayjs/plugin/utc.js";

dayjs.extend(relativeTime);
dayjs.extend(timezonePlugin);
dayjs.extend(utcPlugin);

export function fromNow(datestring: string | null) {
  return dayjs(datestring).fromNow();
}

export function getUtcOffset(timezone: string) {
  return dayjs.utc().tz(timezone).utcOffset();
}

export function guessTimezone() {
  return dayjs.tz.guess();
}
