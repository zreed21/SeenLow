import type { NextConfig } from "next";

// CORS for the shared API so a separate website (different origin) can consume
// the same backend. Origins are locked down via API_ALLOWED_ORIGINS in prod.
const allowedOrigin = process.env.API_ALLOWED_ORIGINS?.split(",")[0]?.trim() || "*";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: allowedOrigin },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-API-Key" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },
};

export default nextConfig;
