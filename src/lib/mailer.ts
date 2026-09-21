import nodemailer from "nodemailer";
import { db } from "@/db";
import { deals, emailSubscribers, emailLogs } from "@/db/schema";
import { and, eq } from "drizzle-orm";

function money(value: string | number) {
  return `$${Number(value).toFixed(2)}`;
}

export function buildDigestHtml(items: typeof deals.$inferSelect[], appUrl: string) {
  const rows = items.map((d) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e4e4e7;width:64px">
        <img src="${d.imageUrl}" width="56" height="56" style="border-radius:10px;object-fit:cover" alt="">
      </td>
      <td style="padding:10px;border-bottom:1px solid #e4e4e7;font-family:Arial,sans-serif">
        <div style="font-size:11px;color:#B91C1C;font-weight:bold">#${d.dealRank} · ${Number(d.discountPercent).toFixed(0)}% OFF</div>
        <div style="font-size:13px;color:#0A0A0A;font-weight:bold">${d.title}</div>
        <div style="font-size:12px;color:#71717a">
          <s>${money(d.originalPrice)}</s> &nbsp; <strong style="color:#B91C1C">${money(d.finalPrice)}</strong>
        </div>
      </td>
    </tr>`).join("");

  return `<!doctype html><html><body style="margin:0;background:#0A0A0A;padding:24px">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7">
    <tr>
      <td style="background:#0A0A0A;padding:22px;text-align:center;font-family:Arial,sans-serif;border-bottom:3px solid #B91C1C">
        <div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px">Seen<span style="color:#B91C1C">Low</span></div>
        <div style="font-size:12px;color:#d4d4d8;margin-top:4px">Lowest we've seen. Checked again before you tap.</div>
        <div style="font-size:11px;color:#a1a1aa;margin-top:2px">Tonight's best tracked US deals — ${new Date().toLocaleDateString()}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:14px 20px;font-family:Arial,sans-serif;font-size:12px;color:#52525b;background:#fafafa;border-bottom:1px solid #e4e4e7">
        SeenLow watches US store prices and sends you to the best live offer. We may earn a commission if you buy.
        Prices and availability subject to change without notice. Checked again before you tap.
      </td>
    </tr>
    <tr><td><table width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>
    <tr>
      <td style="padding:22px;text-align:center;font-family:Arial,sans-serif;background:#fafafa">
        <a href="${appUrl}" style="background:#B91C1C;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:bold;font-size:14px;display:inline-block">
          Open SeenLow
        </a>
        <div style="font-size:11px;color:#71717a;margin-top:14px">
          Operated by SeenLow LLC at <a href="https://seenlow.com" style="color:#B91C1C">seenlow.com</a>. Support: <a href="mailto:support@seenlow.com" style="color:#B91C1C">support@seenlow.com</a>
        </div>
        <div style="font-size:11px;color:#a1a1aa;margin-top:6px">
          You're receiving this because you joined the SeenLow deal list.
          <a href="${appUrl}/api/newsletter?unsubscribe={{TOKEN}}" style="color:#71717a">Unsubscribe</a>
        </div>
      </td>
    </tr>
  </table></body></html>`;
}

export async function sendMidnightDigest(appUrl: string) {
  const top = await db.select().from(deals).where(and(eq(deals.isTop50, true), eq(deals.isActive, true))).orderBy(deals.dealRank);
  const subscribers = await db.select().from(emailSubscribers).where(eq(emailSubscribers.isActive, true));
  const subject = `SeenLow: Tonight's lowest-tracked deals — up to ${Math.max(0, ...top.map((d) => Number(d.discountPercent))).toFixed(0)}% off`;
  const baseHtml = buildDigestHtml(top.slice(0, 50), appUrl);

  const smtpReady = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  let deliveryMode: "smtp" | "outbox" = "outbox";

  if (smtpReady && subscribers.length > 0) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    for (const sub of subscribers) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"SeenLow" <support@seenlow.com>`,
        to: sub.email,
        subject,
        html: baseHtml.replace("{{TOKEN}}", sub.unsubscribeToken),
      });
    }
    deliveryMode = "smtp";
  }

  const now = new Date();
  for (const sub of subscribers) {
    await db.update(emailSubscribers).set({ lastSentAt: now }).where(eq(emailSubscribers.id, sub.id));
  }

  const [log] = await db.insert(emailLogs).values({
    subject,
    recipientCount: subscribers.length,
    deliveryMode,
    htmlPreview: baseHtml.replace("{{TOKEN}}", "preview"),
    status: "sent",
  }).returning();

  return { log, recipientCount: subscribers.length, deliveryMode };
}
