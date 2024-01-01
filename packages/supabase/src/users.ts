import type { Enums, Table } from ".";

export type UserPreferences = {
  theme: "light" | "dark" | "system";
  notify_on?: string;
  timezone?: string;
  event_preferences?: Enums<"event_preference">;
};

export type User = Omit<Table<"profiles">, "preferences"> & {
  preferences: UserPreferences;
};

export type Profile = Omit<Table<"profiles">, "preferences"> & {
  preferences: UserPreferences;
};
