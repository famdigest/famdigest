import type { Table } from ".";

export type UserPreferences = {
  theme: "light" | "dark" | "system";
};

export type User = Omit<Table<"profiles">, "preferences"> & {
  preferences: UserPreferences;
};

export type Profile = Omit<Table<"profiles">, "preferences"> & {
  preferences: UserPreferences;
};
