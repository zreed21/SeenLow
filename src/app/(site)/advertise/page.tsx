import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise — SeenLow",
  description: "Promoted placements on SeenLow, operated by Zach Reed doing business as SeenLow at seenlow.com.",
};

export default function AdvertisePage() {
  return (
    <div style={{ maxWidth: "42rem", margin: "0 auto", padding: "0 1rem" }}>
      <article
        style={{
          backgroundColor: "#121212",
          border: "1px solid #262626",
          borderRadius: "1rem",
          padding: "2rem",
          color: "#F0E6D8",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "-0.025em",
            marginBottom: "1.5rem",
            borderBottom: "2px solid #B91C1C",
            paddingBottom: "0.75rem",
          }}
        >
          Advertise with SeenLow
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9375rem", lineHeight: 1.65 }}>
          <p
            style={{
              color: "#F0E6D8",
              fontSize: "1rem",
              fontWeight: 600,
              padding: "0.875rem 1rem",
              backgroundColor: "#1A1A1A",
              borderLeft: "4px solid #B91C1C",
              borderRadius: "0.375rem",
              margin: 0,
            }}
          >
            SeenLow is a US deal-discovery app operated by Zach Reed doing business as SeenLow at seenlow.com.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            Our audience opens the app to see the day's lowest verified prices across US stores. We sell exactly one ad product, and it is clearly labeled.
          </p>

          <div
            style={{
              backgroundColor: "#171717",
              border: "1px solid #2E1515",
              borderRadius: "0.75rem",
              padding: "1.25rem",
            }}
          >
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: "0 0 0.75rem 0",
              }}
            >
              Promoted card in the SeenLow deal feed
            </h2>
            <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#F0E6D8" }}>
              <li style={{ marginBottom: "0.35rem" }}>
                One promoted card per screen, always labeled <strong style={{ color: "#B91C1C" }}>Sponsored</strong>
              </li>
              <li style={{ marginBottom: "0.35rem" }}>Optional push/email mention alongside the daily midnight digest</li>
              <li style={{ marginBottom: "0.35rem" }}>Flat weekly fee &mdash; no auctions, no hidden placements</li>
              <li>Your card sits next to, never inside, our organic SeenLow pick</li>
            </ul>
          </div>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            We keep editorial and paid strictly separate: the SeenLow pick (&ldquo;lowest we've tracked in 30 days&rdquo;) is computed from 30-day price history and source certification, and cannot be bought. Shoppers trust the badge because it is never for sale.
          </p>

          <p
            style={{
              color: "#F0E6D8",
              marginTop: "0.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #262626",
            }}
          >
            <strong style={{ color: "#FFFFFF" }}>Contact:</strong>{" "}
            <a
              href="mailto:partners@seenlow.com"
              style={{ color: "#B91C1C", textDecoration: "underline", fontWeight: 600 }}
            >
              partners@seenlow.com
            </a>{" "}
            or{" "}
            <a
              href="mailto:support@seenlow.com"
              style={{ color: "#B91C1C", textDecoration: "underline", fontWeight: 600 }}
            >
              support@seenlow.com
            </a>
          </p>
        </div>
      </article>
    </div>
  );
}
