import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pairstorm — Marketing — SeenLow",
  description:
    "Pairstorm: competitive connection duels on iPhone. Solo, online codes, and Nearby Bluetooth. From SeenLow.",
};

export default function PairstormMarketingPage() {
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
        <p style={{ color: "#FBBF24", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.2em", margin: "0 0 0.75rem 0" }}>
          PAIRSTORM
        </p>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "-0.025em",
            marginBottom: "0.5rem",
            borderBottom: "2px solid #FBBF24",
            paddingBottom: "0.75rem",
          }}
        >
          Duel. Connect. Outsmart.
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9375rem", lineHeight: 1.65 }}>
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
            Pairstorm is a competitive connection game for iPhone — short rounds, sharp thinking, and head-to-head energy.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Solo</strong> — sharpen your instincts against the board.
          </p>
          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Online duel</strong> — host or join with a short 4-character code. No account required.
          </p>
          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Nearby</strong> — on iPhone, share that code over Bluetooth, then play the match peer-to-peer.
          </p>
          <p style={{ color: "#F0E6D8", margin: 0 }}>
            Built for quick sessions and living-room tournaments. Available on TestFlight / the App Store as Pairstorm.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <Link href="/pairstorm/support" style={{ color: "#FBBF24", textDecoration: "underline", fontWeight: 600 }}>
              Support
            </Link>
            {" · "}
            <Link href="/pairstorm/privacy" style={{ color: "#FBBF24", textDecoration: "underline", fontWeight: 600 }}>
              Privacy
            </Link>
            {" · "}
            <Link href="/pairstorm" style={{ color: "#FBBF24", textDecoration: "underline", fontWeight: 600 }}>
              Overview
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
