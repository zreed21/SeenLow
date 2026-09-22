import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pairstorm — Privacy Policy — SeenLow",
  description:
    "Privacy policy for the Pairstorm iOS game, operated by Zach Reed / SeenLow.",
};

export default function PairstormPrivacyPage() {
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
          Pairstorm Privacy Policy
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
            Pairstorm is an iOS game published by Zach Reed doing business as SeenLow (seenlow.com). This policy covers the Pairstorm app. The main SeenLow website has a{" "}
            <Link href="/privacy" style={{ color: "#FBBF24", textDecoration: "underline" }}>
              separate privacy policy
            </Link>
            .
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Effective date:</strong> September 22, 2026
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>What the app does:</strong> Pairstorm is a competitive connection / party puzzle game. You can play solo or duel another player using a short room code. Optional Nearby mode on iPhone can use Bluetooth to help exchange that code.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Accounts:</strong> Pairstorm does not require creating an account. We do not ask for your name, email, or phone number inside the app for gameplay.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Data on your device:</strong> The app may store preferences locally on your device (for example display name, mute setting, or recent room codes) using on-device storage. That data stays on your phone unless you clear app data or delete the app.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Multiplayer / networking:</strong> Online duels use a peer-to-peer connection. A public signaling service (PeerJS) helps devices find each other; gameplay traffic is exchanged between players. We do not operate a SeenLow game server that stores your match chat or round history for this build. Nearby Bluetooth is used only to help share a short duel code — not to upload personal profiles.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Permissions:</strong> iOS may prompt for Camera, Microphone, Local Network, and/or Bluetooth. These support peer connections and Nearby code handoff. Pairstorm does not record, save, or upload camera or microphone captures for this build.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Analytics, ads, tracking:</strong> This build does not include third-party advertising SDKs or cross-app tracking. We do not sell personal information.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Children:</strong> Pairstorm is not directed at children under 13. Do not use the app if you are under 13.
          </p>

          <p style={{ color: "#F0E6D8", margin: 0 }}>
            <strong style={{ color: "#FFFFFF" }}>Changes:</strong> If we add accounts, analytics, or purchases, we will update this page and the App Store privacy labels.
          </p>

          <p
            style={{
              color: "#F0E6D8",
              marginTop: "0.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #262626",
            }}
          >
            <strong style={{ color: "#FFFFFF" }}>Contact:</strong> Zach Reed, d/b/a SeenLow ·{" "}
            <a href="mailto:support@seenlow.com?subject=Pairstorm%20Privacy" style={{ color: "#FBBF24", textDecoration: "underline", fontWeight: 600 }}>
              support@seenlow.com
            </a>
            {" · "}
            <Link href="/pairstorm/support" style={{ color: "#FBBF24", textDecoration: "underline", fontWeight: 600 }}>
              Support
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
