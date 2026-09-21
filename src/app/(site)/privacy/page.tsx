import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SeenLow",
  description: "Privacy policy for SeenLow, operated by SeenLow LLC at seenlow.com.",
};

export default function PrivacyPage() {
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
          Privacy Policy
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
            SeenLow is a US deal-discovery app operated by SeenLow LLC at seenlow.com.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>What we collect:</strong> Account email and name if you sign up; delivery address and order details if you use our &ldquo;Have us buy it&rdquo; checkout; your email if you join the midnight deal list; and standard technical request logs. Card details go directly to our payment processor (Stripe) and never touch our servers.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Outbound retailer links:</strong> When you tap through to a retailer, we record the deal, timestamp, and price shown so we can verify tracking and fix broken links. Retailers and affiliate networks set their own cookies on their websites under their respective privacy policies.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>What we do not do:</strong> We do not sell personal information. We do not send marketing email without opt-in consent, and every email contains a one-click unsubscribe link.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Retention &amp; access:</strong> Order records are kept for accounting and dispute obligations. You can request a copy or deletion of your account data by emailing us.
          </p>

          <p
            style={{
              color: "#F0E6D8",
              marginTop: "0.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #262626",
            }}
          >
            <strong style={{ color: "#FFFFFF" }}>Contact:</strong> SeenLow LLC &middot;{" "}
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
