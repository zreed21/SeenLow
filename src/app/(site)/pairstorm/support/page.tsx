import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pairstorm — Support — SeenLow",
  description: "Help and contact for Pairstorm on iOS. Support from SeenLow / Zach Reed.",
};

export default function PairstormSupportPage() {
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
            borderBottom: "2px solid #FBBF24",
            paddingBottom: "0.75rem",
          }}
        >
          Pairstorm Support
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9375rem", lineHeight: 1.65 }}>
          <p style={{ color: "#F0E6D8", margin: 0 }}>
            Need help with Pairstorm on iPhone? Email us and we&apos;ll get back to you as soon as we can.
          </p>

          <p
            style={{
              color: "#F0E6D8",
              fontSize: "1rem",
              fontWeight: 600,
              padding: "0.875rem 1rem",
              backgroundColor: "#1A1A1A",
              borderLeft: "4px solid #FBBF24",
              borderRadius: "0.375rem",
              margin: 0,
            }}
          >
            Contact:{" "}
            <a href="mailto:support@seenlow.com?subject=Pairstorm%20Support" style={{ color: "#FBBF24", textDecoration: "underline", fontWeight: 700 }}>
              support@seenlow.com
            </a>
            <br />
            <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>Subject line tip: include &ldquo;Pairstorm&rdquo; and your iOS version.</span>
          </p>

          <p style={{ color: "#FFFFFF", fontWeight: 700, margin: 0 }}>Quick tips</p>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#F0E6D8" }}>
            <li>
              <strong style={{ color: "#FFFFFF" }}>Online duel:</strong> one player Hosts, shares the 4-character code; the other Joins with that code. Both need an internet connection.
            </li>
            <li>
              <strong style={{ color: "#FFFFFF" }}>Nearby:</strong> Bluetooth helps share the code. The match still uses a peer connection — allow Camera / Mic / Local Network / Bluetooth prompts if iOS asks (needed for peer links; we do not record video or audio).
            </li>
            <li>
              <strong style={{ color: "#FFFFFF" }}>Can&apos;t connect:</strong> confirm both devices are on a network that allows WebRTC, try a new code, or restart the app.
            </li>
            <li>
              <strong style={{ color: "#FFFFFF" }}>TestFlight:</strong> install updates from the TestFlight app when a new build is available.
            </li>
          </ul>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            Operator: Zach Reed / SeenLow · Williston, North Dakota, United States.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <Link href="/pairstorm/privacy" style={{ color: "#FBBF24", textDecoration: "underline", fontWeight: 600 }}>
              Privacy Policy
            </Link>
            {" · "}
            <Link href="/pairstorm/marketing" style={{ color: "#FBBF24", textDecoration: "underline", fontWeight: 600 }}>
              Marketing
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
