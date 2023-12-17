import BaseCalendarService from "../base";
import { Connection } from "../types";

export default class AppleCalendarService extends BaseCalendarService {
  constructor(credential: Connection) {
    super(credential, "https://caldav.icloud.com");
  }
}
