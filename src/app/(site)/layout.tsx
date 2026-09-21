import Link from "next/link";
import type { ReactNode } from "react";
import { SeenLowLogo } from "@/components/SeenLowLogo";

/**
 * Public website shell for SeenLow / SeenLow LLC
 * Consistent SeenLow deep black (#0A0A0A) background with crisp #F0E6D8 body text.
 * Max content width ~42rem for clear document layout.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0A0A",
        color: "#F0E6D8",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #1E1E1E",
          backgroundColor: "#121212",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: "42rem",
            margin: "0 auto",
            padding: "0.875rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }} aria-label="SeenLow Home">
            <SeenLowLogo variant="lockup" size="md" />
          </Link>
          <nav style={{ display: "flex", gap: "1rem", fontSize: "0.8125rem", fontWeight: 600 }}>
            <Link
              href="/disclosure"
              style={{ color: "#F0E6D8", textDecoration: "none" }}
            >
              Disclosure
            </Link>
            <Link
              href="/privacy"
              style={{ color: "#F0E6D8", textDecoration: "none" }}
            >
              Privacy
            </Link>
            <Link
              href="/advertise"
              style={{ color: "#F0E6D8", textDecoration: "none" }}
            >
              Advertise
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ padding: "2.5rem 0" }}>{children}</main>

      <footer
        style={{
          borderTop: "1px solid #1E1E1E",
          backgroundColor: "#0A0A0A",
          padding: "2rem 1rem",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "#A1A1AA",
          lineHeight: 1.6,
        }}
      >
        <div style={{ maxWidth: "42rem", margin: "0 auto" }}>
          <p style={{ margin: "0 0 0.35rem 0", color: "#F0E6D8", fontWeight: 600 }}>
            SeenLow is a US deal-discovery app operated by SeenLow LLC at seenlow.com.
          </p>
          <p style={{ margin: 0 }}>
            Lowest we&apos;ve seen. Checked again before you tap. &middot;{" "}
            <a href="mailto:support@seenlow.com" style={{ color: "#B91C1C", textDecoration: "none" }}>
              support@seenlow.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
