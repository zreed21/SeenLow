import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { catalogPriceFields } from "@/lib/pricing";

/** Internal listing editor. Customers only see the resulting product price. */
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (user?.role !== "admin") return NextResponse.json({ success: false, error: "Admin sign-in required" }, { status: 403 });
  try {
    const body = await request.json();
    const priced = catalogPriceFields(body.sourceCost, body.regularPrice);
    return NextResponse.json({ success: true, salePrice: priced.finalPrice, discountPercent: priced.discountPercent });
  } catch {
    return NextResponse.json({ success: false, error: "Enter positive source cost and regular price amounts" }, { status: 400 });
  }
}
