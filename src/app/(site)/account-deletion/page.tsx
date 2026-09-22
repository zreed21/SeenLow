import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account Deletion — SeenLow",
  description:
    "How to delete your SeenLow account at seenlow.com. In-app deletion and email support for Google Play and store readiness.",
};

export default function AccountDeletionPage() {
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
          Delete your SeenLow account
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
            SeenLow is operated by Zach Reed doing business as SeenLow at seenlow.com. You can delete your account anytime.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>In the app / website:</strong> Sign in at{" "}
            <Link href="/" style={{ color: "#B91C1C", textDecoration: "underline" }}>
              seenlow.com
            </Link>
            , open your profile menu (your name / avatar in the top bar), choose <strong style={{ color: "#FFFFFF" }}>Delete account</strong>, and confirm. That removes your login, watchlist, notifications, and saved addresses, and signs you out.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>By email:</strong> Send a request from the email on your account to{" "}
            <a
              href="mailto:support@seenlow.com?subject=Delete%20my%20SeenLow%20account"
              style={{ color: "#B91C1C", textDecoration: "underline", fontWeight: 600 }}
            >
              support@seenlow.com
            </a>{" "}
            with the subject &ldquo;Delete my SeenLow account.&rdquo; We will confirm and complete deletion.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>What we keep:</strong> Completed or in-progress orders may be retained in anonymized form for accounting, fulfillment, tax, fraud, and dispute obligations. Newsletter subscriptions are turned off for that email. We do not keep your password after deletion.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            More detail is in our{" "}
            <Link href="/privacy" style={{ color: "#B91C1C", textDecoration: "underline" }}>
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" style={{ color: "#B91C1C", textDecoration: "underline" }}>
              Terms of Use
            </Link>
            .
          </p>

          <p
            style={{
              color: "#F0E6D8",
              marginTop: "0.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #262626",
            }}
          >
            <strong style={{ color: "#FFFFFF" }}>Contact:</strong> Zach Reed, d/b/a SeenLow &middot;{" "}
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
