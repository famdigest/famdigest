import { Profile, db, schema } from "@repo/database";
import { z } from "zod";

export async function autoSubscribe({
  invited_by_id,
  workspace_id,
  owner_id,
}: {
  invited_by_id: string;
  workspace_id: string;
  owner_id: string;
}) {
  const prefCheck = z.object({
    full_name: z.string(),
    phone: z.string(),
    notify_on: z.string(),
    timezone: z.string(),
    event_preferences: z.enum(["same-day", "next-day"]),
  });

  // create the request
  const invited_by = await db.query.profiles.findFirst({
    where: (table, { eq }) => eq(table.id, invited_by_id),
  });

  if (!invited_by) return null;

  const pref = prefCheck.safeParse({
    full_name: invited_by.full_name,
    phone: invited_by.phone,
    ...invited_by.preferences,
  });
  if (!pref.success) {
    return null;
  }

  const [newSubscription] = await db
    .insert(schema.subscriptions)
    .values({
      ...pref.data,
      owner_id: owner_id,
      user_id: invited_by.id,
      workspace_id: workspace_id,
    })
    .returning();

  return newSubscription.id;
}
