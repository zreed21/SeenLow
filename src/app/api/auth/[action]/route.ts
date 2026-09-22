import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import {
  users,
  emailSubscribers,
  watchlists,
  notifications,
  userAddresses,
  orders,
  affiliateClicks,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { SESSION_COOKIE, createSessionToken, getSessionUser, hashPassword, verifyPassword, publicUserId } from "@/lib/auth";

async function setSession(userId: number) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Delete account data tied to this login. Orders are anonymized (not dropped)
 * so accounting / dispute records remain. Unrelated tables are never touched.
 */
async function deleteAccountForUser(user: { id: number; email: string; name: string }) {
  const scopedId = publicUserId(user);
  const email = user.email.toLowerCase().trim();
  const deletedAt = new Date().toISOString();

  await db.delete(watchlists).where(eq(watchlists.userId, scopedId));
  await db.delete(notifications).where(eq(notifications.userId, scopedId));
  await db.delete(userAddresses).where(eq(userAddresses.userId, scopedId));

  // Soft-detach affiliate click identity; keep rows for reconciliation.
  await db
    .update(affiliateClicks)
    .set({ userId: null })
    .where(eq(affiliateClicks.userId, scopedId));

  // Anonymize order PII; keep financial / fulfillment history.
  await db
    .update(orders)
    .set({
      userName: "Deleted user",
      userEmail: `deleted+${user.id}@seenlow.invalid`,
      shippingAddress: JSON.stringify({
        deleted: true,
        deletedAt,
        note: "Customer account deleted; address redacted",
      }),
      customerRef: `deleted-user-${user.id}`,
      updatedAt: new Date(),
    })
    .where(eq(orders.userId, scopedId));

  await db
    .update(emailSubscribers)
    .set({ isActive: false, name: null })
    .where(eq(emailSubscribers.email, email));

  await db.delete(users).where(eq(users.id, user.id));
}

export async function GET(_req: NextRequest, props: { params: Promise<{ action: string }> }) {
  const { action } = await props.params;
  if (action === "me") {
    const user = await getSessionUser();
    return NextResponse.json({ success: true, user });
  }
  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 404 });
}

export async function POST(request: NextRequest, props: { params: Promise<{ action: string }> }) {
  const { action } = await props.params;

  if (action === "logout") {
    await clearSession();
    return NextResponse.json({ success: true });
  }

  if (action === "delete-account") {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Sign in required to delete your account." }, { status: 401 });
    }
    if (sessionUser.role === "admin") {
      return NextResponse.json(
        { success: false, error: "Admin accounts cannot be self-deleted. Email support@seenlow.com." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const confirm = String(body.confirm || "").trim().toLowerCase();
    if (confirm !== "delete") {
      return NextResponse.json(
        { success: false, error: 'Type "delete" to confirm account deletion.' },
        { status: 400 }
      );
    }

    try {
      await deleteAccountForUser({
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
      });
      await clearSession();
      return NextResponse.json({ success: true, message: "Account deleted." });
    } catch (error) {
      console.error("delete-account failed:", error);
      return NextResponse.json(
        { success: false, error: "Could not delete account. Email support@seenlow.com." },
        { status: 500 }
      );
    }
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
  }

  if (action === "register") {
    const name = String(body.name || "").trim() || email.split("@")[0];
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters." }, { status: 400 });
    }
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing[0]) {
      return NextResponse.json({ success: false, error: "An account with this email already exists." }, { status: 409 });
    }
    const [created] = await db.insert(users).values({
      email,
      name,
      passwordHash: hashPassword(password),
      role: "user",
    }).returning();

    if (body.subscribe) {
      await db.insert(emailSubscribers)
        .values({ email, name, source: "account", unsubscribeToken: randomBytes(16).toString("hex") })
        .onConflictDoNothing();
    }

    await setSession(created.id);
    const { passwordHash, ...safeUser } = created;
    return NextResponse.json({ success: true, user: safeUser });
  }

  if (action === "login") {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }
    await setSession(user.id);
    const { passwordHash, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser });
  }

  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 404 });
}
