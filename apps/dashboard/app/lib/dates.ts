import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

export function fromNow(datestring: string | null) {
  return dayjs(datestring).fromNow();
}
