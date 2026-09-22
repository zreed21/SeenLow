import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { publishDealFromInbox } from "@/lib/dealInboxPublish";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

  const result = await publishDealFromInbox(id);
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status });
  }
  return NextResponse.json({
    success: true,
    dealId: result.dealId,
    canSell: result.canSell,
    sourceStatus: result.sourceStatus,
    message: result.message,
  });
}
