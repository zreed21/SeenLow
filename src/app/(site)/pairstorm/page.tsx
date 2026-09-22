import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pairstorm — SeenLow",
  description:
    "Pairstorm is a competitive connection duel game for iPhone. Solo play, online codes, and Nearby Bluetooth handoff. From SeenLow.",
};

const linkStyle = {
  color: "#FBBF24",
  textDecoration: "underline",
  fontWeight: 600,
} as const;

export default function PairstormHubPage() {
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
          iOS GAME
        </p>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "-0.025em",
            marginBottom: "1rem",
            borderBottom: "2px solid #FBBF24",
            paddingBottom: "0.75rem",
          }}
        >
          Pairstorm
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9375rem", lineHeight: 1.65 }}>
          <p style={{ color: "#F0E6D8", margin: 0 }}>
            Fast competitive connection duels. Think quick, link the right ideas, and outplay your rival before the round slips away.
          </p>
          <p style={{ color: "#F0E6D8", margin: 0 }}>
            Play solo, challenge a friend online with a short code, or use Nearby on iPhone to share the code over Bluetooth. No account required.
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#F0E6D8" }}>
            <li>
              <Link href="/pairstorm/marketing" style={linkStyle}>
                Marketing
              </Link>
            </li>
            <li>
              <Link href="/pairstorm/support" style={linkStyle}>
                Support
              </Link>
            </li>
            <li>
              <Link href="/pairstorm/privacy" style={linkStyle}>
                Privacy
              </Link>
            </li>
          </ul>
          <p style={{ color: "#A1A1AA", margin: 0, fontSize: "0.8125rem" }}>
            Pairstorm is published by Zach Reed / SeenLow. App Store listing uses these pages for support, marketing, and privacy.
          </p>
        </div>
      </article>
    </div>
  );
}
