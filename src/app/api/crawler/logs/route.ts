import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { crawlerLogs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const logs = await db
      .select()
      .from(crawlerLogs)
      .orderBy(desc(crawlerLogs.startedAt))
      .limit(30);

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Error in GET /api/crawler/logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch crawler logs" },
      { status: 500 }
    );
  }
}
