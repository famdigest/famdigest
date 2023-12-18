import BaseCalendarService, { type Connection } from "../base";

export class AppleCalendarService extends BaseCalendarService {
  constructor(credential: Connection) {
    super(credential, "https://caldav.icloud.com");
  }
}
