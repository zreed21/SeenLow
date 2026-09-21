import { NextRequest } from "next/server";
import { paymentConfig } from "@/lib/payments";
import { withCors, preflight } from "@/lib/apiAccess";

export async function OPTIONS(request: NextRequest) {
  return preflight(request);
}

export async function GET(request: NextRequest) {
  return withCors(request, { success: true, ...paymentConfig() });
}
