import { NextRequest, NextResponse } from "next/server";
import { forceSeedDatabase } from "@/db/seed";

export async function POST(request: NextRequest) {
  try {
    const result = await forceSeedDatabase();
    return NextResponse.json({
      success: true,
      message: "Database successfully reseeded with Top 50 deals, orders, and crawler logs",
      result,
    });
  } catch (error) {
    console.error("Error in POST /api/seed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reseed database", details: String(error) },
      { status: 500 }
    );
  }
}
