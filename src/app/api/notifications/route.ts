import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user-1";

    const notifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    const unreadCount = notifs.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications: notifs,
      unreadCount,
    });
  } catch (error) {
    console.error("Error in GET /api/notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, markAllRead, userId = "demo-user-1" } = body;

    if (markAllRead) {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    if (id) {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, Number(id)));
      return NextResponse.json({ success: true, message: "Marked as read" });
    }

    return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    console.error("Error in PUT /api/notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
