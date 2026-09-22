import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { scrapeDealInbox } from "@/lib/priceScrape";

export const maxDuration = 60;

async function authorized(request: NextRequest) {
  const user = await getSessionUser();
  if (user?.role === "admin") return true;
  const secret = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization") || "";
  if (secret && header === `Bearer ${secret}`) return true;
  const ua = request.headers.get("user-agent") || "";
  return ua.toLowerCase().includes("vercel-cron");
}

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  if (!(await authorized(request))) {
    return NextResponse.json({ success: false, error: "Admin or CRON_SECRET required" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const onlyId = Number(body.id) || undefined;
  const results = await scrapeDealInbox(15, onlyId);
  return NextResponse.json({ success: true, checked: results.length, results });
}
