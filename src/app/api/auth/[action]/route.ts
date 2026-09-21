import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, emailSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { SESSION_COOKIE, createSessionToken, getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";

async function setSession(userId: number) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
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
    const store = await cookies();
    store.delete(SESSION_COOKIE);
    return NextResponse.json({ success: true });
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
