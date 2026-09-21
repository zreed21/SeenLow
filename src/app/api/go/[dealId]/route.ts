import { NextRequest, NextResponse } from "next/server";
import { validateRedirect } from "@/lib/monetization";

/**
 * Outbound affiliate redirect with mandatory pre-tap revalidation.
 * If the deal died since the last check, the shopper is bounced back to the
 * feed with an explanation instead of landing on a mispriced page.
 */
export async function GET(request: NextRequest, props: { params: Promise<{ dealId: string }> }) {
  const { dealId } = await props.params;
  const id = Number(dealId);
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  if (!Number.isSafeInteger(id) || id <= 0) return NextResponse.redirect(`${origin}/?redirect=invalid`, 302);
  const userId = new URL(request.url).searchParams.get("u") || undefined;
  try {
    const result = await validateRedirect(id, userId);
    if (!result.ok) return NextResponse.redirect(`${origin}/?deal=${id}&redirect=dead`, 302);
    return NextResponse.redirect(result.trackingUrl, 302);
  } catch (error) {
    console.error("Redirect validation failed", error);
    return NextResponse.redirect(`${origin}/?deal=${id}&redirect=error`, 302);
  }
}
