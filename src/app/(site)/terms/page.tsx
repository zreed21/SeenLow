import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — SeenLow",
  description:
    "Terms of use for SeenLow at seenlow.com, operated by Zach Reed doing business as SeenLow. US-only deal discovery, affiliate and reseller paths.",
};

export default function TermsPage() {
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
          Terms of Use
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
            SeenLow is a US deal-discovery site at seenlow.com, operated by Zach Reed doing business as SeenLow. A limited liability company has not been formed yet. These terms will be updated if that changes.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Who we are:</strong> Zach Reed, d/b/a SeenLow, Williston, North Dakota, United States. Contact:{" "}
            <a href="mailto:support@seenlow.com" style={{ color: "#B91C1C", textDecoration: "underline", fontWeight: 600 }}>
              support@seenlow.com
            </a>
            .
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>What SeenLow is:</strong> A catalog of deals we have seen. Prices are shown in USD. The site and reseller shipping are United States only; reseller delivery is lower-48 street addresses only.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Affiliate / tap-through path:</strong> When you buy at a retailer through our link, you check out with that retailer. Their price, payment, shipping, returns, and packing label apply. We may earn a commission if you buy. That does not change the price the retailer charges you.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Reseller / &ldquo;Have us buy it&rdquo; path:</strong> You pay SeenLow. Zach Reed doing business as SeenLow is the seller of record for that order. A partner retailer may fulfill and ship the item. Tracking and support for that path go through SeenLow (
            <a href="mailto:support@seenlow.com" style={{ color: "#B91C1C", textDecoration: "underline" }}>
              support@seenlow.com
            </a>
            ). See also our{" "}
            <Link href="/disclosure" style={{ color: "#B91C1C", textDecoration: "underline" }}>
              Disclosure
            </Link>
            .
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Prices and stock:</strong> Retailer prices and availability change without notice. We recheck when we can, but a deal can expire or move before you complete checkout. Any increase on a reseller order requires your approval before payment.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Accounts:</strong> You are responsible for your login credentials. You may delete your account in the app when signed in, or by emailing support@seenlow.com. Order records needed for accounting, fulfillment, or disputes may be retained in anonymized form. See{" "}
            <Link href="/account-deletion" style={{ color: "#B91C1C", textDecoration: "underline" }}>
              Account deletion
            </Link>{" "}
            and our{" "}
            <Link href="/privacy" style={{ color: "#B91C1C", textDecoration: "underline" }}>
              Privacy Policy
            </Link>
            .
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>No warranties on third-party sites:</strong> We do not control Amazon, Best Buy, or other retailers. Product descriptions on their sites, and their policies, govern tap-through purchases.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Governing law:</strong> These terms are governed by the laws of the State of North Dakota, United States, without regard to conflict-of-law rules. Venue for disputes is in courts serving Williston, North Dakota, unless applicable consumer law requires otherwise.
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
            <br />
            <span style={{ color: "#A1A1AA", fontSize: "0.8125rem" }}>Last updated: September 21, 2026</span>
          </p>
        </div>
      </article>
    </div>
  );
}
