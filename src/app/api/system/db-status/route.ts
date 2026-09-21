import { NextRequest, NextResponse } from "next/server";
import { getDatabaseStatus, ensureDatabaseReady } from "@/lib/dbBootstrap";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  try {
    const user = await getSessionUser();
    return user?.role === "admin" ? user : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  const status = await getDatabaseStatus();
  return NextResponse.json({ success: true, ...status });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  }
  try {
    const result = await ensureDatabaseReady();
    const status = await getDatabaseStatus();
    return NextResponse.json({
      success: true,
      message: "Database schema and catalog checked. Existing rows and scan evidence were preserved.",
      bootstrapResult: result,
      currentStatus: status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Database setup failed", details: String(error) },
      { status: 500 }
    );
  }
}
