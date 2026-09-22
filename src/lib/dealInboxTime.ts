export function parseEndsAt(value: unknown): Date | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const clock = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (clock) {
    const h = Number(clock[1]);
    const m = Number(clock[2]);
    const s = Number(clock[3] || 0);
    if (m < 60 && s < 60) return new Date(Date.now() + ((h * 3600) + (m * 60) + s) * 1000);
  }

  const hours = raw.match(/^(\d+(?:\.\d+)?)\s*h(?:ours?)?$/i);
  if (hours) return new Date(Date.now() + Number(hours[1]) * 3600 * 1000);
  const mins = raw.match(/^(\d+)\s*m(?:ins?)?$/i);
  if (mins) return new Date(Date.now() + Number(mins[1]) * 60 * 1000);

  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}
