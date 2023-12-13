import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import timezonePlugin from "dayjs/plugin/timezone.js";
import utcPlugin from "dayjs/plugin/utc.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(timezonePlugin);
dayjs.extend(utcPlugin);

export function fromNow(datestring: string | null) {
  return dayjs(datestring).fromNow();
}

export function getUtc() {
  return dayjs.utc();
}

export function getUtcOffset(timezone: string) {
  return dayjs.utc().tz(timezone).utcOffset();
}

export function convertToUTC(timestring: string) {
  const hasSeconds = timestring.split(":").length === 3;
  const hasAmPm = timestring.toLowerCase().includes("m");
  const format = hasAmPm ? "h:mm A" : hasSeconds ? "HH:mm:ss" : "HH:mm";
  const now = dayjs(timestring, format);
  const utcTime = now.utc();

  return utcTime.format("HH:mm:ss");
}

export function convertToLocal(timestring: string) {
  const [hour, minute] = timestring.split(":");
  const now = dayjs.utc().hour(Number(hour)).minute(Number(minute)).second(0);
  const localTime = now.local();
  return localTime;
}

export function guessTimezone() {
  return dayjs.tz.guess();
}
