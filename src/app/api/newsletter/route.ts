import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailSubscribers, emailLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendMidnightDigest } from "@/lib/mailer";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const unsubscribe = searchParams.get("unsubscribe");
  if (unsubscribe) {
    await db.update(emailSubscribers).set({ isActive: false }).where(eq(emailSubscribers.unsubscribeToken, unsubscribe));
    return new NextResponse("<html><body style='font-family:Arial;padding:40px;text-align:center'><h2>You've been unsubscribed from SeenLow.</h2></body></html>", { headers: { "Content-Type": "text/html" } });
  }
  const subscribers = await db.select().from(emailSubscribers).orderBy(desc(emailSubscribers.createdAt));
  const logs = await db.select().from(emailLogs).orderBy(desc(emailLogs.sentAt)).limit(10);
  return NextResponse.json({ success: true, subscribers, logs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body.action === "send_digest") {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
      const result = await sendMidnightDigest(appUrl);
      return NextResponse.json({ success: true, ...result });
    }

    const email = String(body.email || "").toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    const [row] = await db.insert(emailSubscribers)
      .values({
        email,
        name: body.name ? String(body.name).trim() : null,
        source: body.source || "website",
        unsubscribeToken: randomBytes(16).toString("hex"),
      })
      .onConflictDoUpdate({ target: emailSubscribers.email, set: { isActive: true } })
      .returning();

    return NextResponse.json({ success: true, subscriber: row, message: "You're on the list! Tonight's 50 deals arrive at 12:15 AM." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Unable to subscribe right now." }, { status: 500 });
  }
}
