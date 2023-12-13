import { Table } from "./helpers";

export type Calendar = Omit<Table<"calendars">, "data"> & {
  data: Record<string, any> | null;
};
