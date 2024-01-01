import { DataTable } from "../DataTable";
import { columns, type CalendarTableRow } from "./Columns";

type CalendarTableProps = {
  calendars: CalendarTableRow[];
};
export function CalendarTable({ calendars }: CalendarTableProps) {
  return <DataTable columns={columns} data={calendars} />;
}
