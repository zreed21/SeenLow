export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const g = globalThis as typeof globalThis & { __seenLowScheduler?: boolean };
  if (g.__seenLowScheduler) return;
  g.__seenLowScheduler = true;

  try {
    const { ensureDatabaseReady, getDatabaseStatus } = await import("@/lib/dbBootstrap");
    const status = await getDatabaseStatus();
    // Bootstrap only for a missing schema or a truly empty catalog. Once Neon
    // has deal rows, cold starts never run catalog insertion or source scans.
    if (status.missingTables.length > 0 || status.dealsCount === 0) {
      await ensureDatabaseReady();
    } else {
      console.log(
        `[db-bootstrap] Existing catalog detected (${status.dealsCount} deals, ` +
          `${status.sourcesCount} sources). Startup bootstrap skipped.`
      );
    }
  } catch (err) {
    console.error("[scheduler] Database bootstrap on startup warning:", err);
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
  const ran = new Set<string>();

  const trigger = async (path: string, body?: unknown) => {
    try {
      await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      console.error(`[scheduler] ${path} failed`, error);
    }
  };

  setInterval(() => {
    const now = new Date();
    const stamp = `${now.toDateString()}-${now.getHours()}-${now.getMinutes()}`;
    const h = now.getHours();
    const m = now.getMinutes();

    if (h === 0 && m === 0 && !ran.has(`crawl-${stamp}`)) {
      ran.add(`crawl-${stamp}`);
      void trigger("/api/crawler/midnight-run");
    }
    if (h === 0 && m === 15 && !ran.has(`digest-${stamp}`)) {
      ran.add(`digest-${stamp}`);
      void trigger("/api/newsletter", { action: "send_digest" });
    }
    if (m === 30 && !ran.has(`verify-${stamp}`)) {
      ran.add(`verify-${stamp}`);
      void trigger("/api/crawler/hourly-verify");
    }
    if (ran.size > 500) ran.clear();
  }, 30_000);

  console.log("[scheduler] SeenLow scheduler online: crawl 00:00, digest 00:15, hourly verify at :30");
}
