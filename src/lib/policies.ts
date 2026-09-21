import { db } from "@/db";
import { policies } from "@/db/schema";

export type Policy = typeof policies.$inferSelect;

/** Single-row policy record: company name and support email default to SeenLow */
export async function getPolicies(): Promise<Policy> {
  const rows = await db.select().from(policies).limit(1);
  if (rows[0]) return rows[0];
  const [created] = await db
    .insert(policies)
    .values({
      companyName: "SeenLow",
      supportEmail: "support@seenlow.com",
    })
    .returning();
  return created;
}
