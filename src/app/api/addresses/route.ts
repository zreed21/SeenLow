import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userAddresses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user-1";

    const addresses = await db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, userId));

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Error in GET /api/addresses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = "demo-user-1",
      fullName,
      street,
      apt,
      city,
      state,
      zipCode,
      country = "United States",
      phone,
      isDefault = false,
    } = body;

    if (!fullName || !street || !city || !state || !zipCode || !phone) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required shipping address fields" },
        { status: 400 }
      );
    }

    if (isDefault) {
      // unset other defaults
      await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, userId));
    }

    const inserted = await db
      .insert(userAddresses)
      .values({
        userId,
        fullName,
        street,
        apt,
        city,
        state,
        zipCode,
        country,
        phone,
        isDefault: Boolean(isDefault),
      })
      .returning();

    return NextResponse.json({
      success: true,
      address: inserted[0],
    });
  } catch (error) {
    console.error("Error in POST /api/addresses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create address" },
      { status: 500 }
    );
  }
}
