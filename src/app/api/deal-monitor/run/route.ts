import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { runDealMonitor } from "@/lib/dealMonitor";

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

/**
 * Primary 30-minute cadence: call this from an external scheduler / bot.
 * Vercel Hobby only allows daily crons — vercel.json may hit this once/day as a safety net.
 */
export async function POST(request: NextRequest) {
  if (!(await authorized(request))) {
    return NextResponse.json({ success: false, error: "Admin or CRON_SECRET required" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const onlyInboxId = Number(body.id) || undefined;
  const limit = Number(body.limit) || undefined;
  const result = await runDealMonitor({ onlyInboxId, limit });
  return NextResponse.json({
    success: true,
    ...result,
    hint: "Schedule this endpoint every 30 minutes (Hobby cron is daily-only). Auth: admin session or Authorization: Bearer $CRON_SECRET.",
  });
}
