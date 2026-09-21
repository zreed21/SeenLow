import { NextRequest, NextResponse } from "next/server";

/**
 * Shared cross-origin access control for the public API.
 *
 * The app (same origin) and the future website (different origin) both consume
 * these endpoints. This helper adds the right CORS headers and, when an
 * API_SHARED_KEY is configured, enforces it for cross-origin callers.
 */

function allowedOrigins(): string[] | "*" {
  const raw = process.env.API_ALLOWED_ORIGINS?.trim();
  if (!raw) return "*";
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const allow = allowedOrigins();
  const value = allow === "*" ? "*" : origin && allow.includes(origin) ? origin : allow[0] || "*";
  return {
    "Access-Control-Allow-Origin": value,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export function preflight(request: NextRequest): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

/** Wrap any JSON payload with CORS headers. */
export function withCors(request: NextRequest, body: unknown, init: ResponseInit = {}): NextResponse {
  const res = NextResponse.json(body, init);
  const headers = corsHeaders(request.headers.get("origin"));
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  return res;
}

/** True if the request is same-origin (no shared key needed) or presents a valid key. */
export function isAuthorized(request: NextRequest): boolean {
  const requiredKey = process.env.API_SHARED_KEY?.trim();
  if (!requiredKey) return true; // open during development
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return true; // same-origin server calls / app itself
  if (host && origin.endsWith(host)) return true;
  const provided = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return provided === requiredKey;
}
