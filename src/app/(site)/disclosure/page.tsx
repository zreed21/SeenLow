import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclosure — SeenLow",
  description:
    "SeenLow is a US deal-discovery site operated by Zach Reed, doing business as SeenLow, at seenlow.com. Affiliate and merchant disclosure.",
};

export default function DisclosurePage() {
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
          Disclosure
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
            SeenLow is a US deal-discovery site at seenlow.com, operated by Zach Reed doing business as SeenLow. A limited liability company has not been formed yet. When it is, this page will be updated.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            We may earn a commission if you buy through a retailer link. That is an advertising relationship. It does not change the price the retailer charges you on their site.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Default path:</strong> you check out at the retailer. Their price, shipping, returns, and packing label apply.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Optional path:</strong> &ldquo;Have us buy it&rdquo; &mdash; you pay SeenLow; Zach Reed doing business as SeenLow is the seller of record for that order. That path is separate from a tap-through to Best Buy or another store.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            Sponsored cards are labeled{" "}
            <span style={{ color: "#B91C1C", fontWeight: 700 }}>Sponsored</span>. They are never the SeenLow pick.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            Catalog is United States only, USD only. Reseller shipping is lower-48 street addresses only.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            Prices and stock change. We recheck before you tap. Deals can expire.
          </p>

          <p
            style={{
              color: "#F0E6D8",
              marginTop: "0.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #262626",
            }}
          >
            <strong style={{ color: "#FFFFFF" }}>Support:</strong>{" "}
            <a
              href="mailto:support@seenlow.com"
              style={{ color: "#B91C1C", textDecoration: "underline", fontWeight: 600 }}
            >
              support@seenlow.com
            </a>
            <br />
            Williston, North Dakota, United States
          </p>
        </div>
      </article>
    </div>
  );
}
