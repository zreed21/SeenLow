import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = process.env.AUTH_SECRET || "fire-deals-dev-secret-change-me";
export const SESSION_COOKIE = "fd_session";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createSessionToken(userId: number) {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token?: string | null) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  if (sign(payload) !== parts[2]) return null;
  const userId = Number(parts[0]);
  return Number.isFinite(userId) ? userId : null;
}

export async function getSessionUser() {
  const store = await cookies();
  const userId = parseSessionToken(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!rows[0]) return null;
  const { passwordHash, ...safeUser } = rows[0];
  return safeUser;
}

export function publicUserId(user: { id: number } | null, guestEmail?: string | null) {
  if (user) return `user-${user.id}`;
  if (guestEmail) return `guest-${guestEmail.toLowerCase().trim()}`;
  return "demo-user-1";
}
