import { LifeBuoy } from "lucide-react";

/**
 * Customer-facing support & returns statement for SeenLow.
 * Legal entity: SeenLow LLC
 * Email: support@seenlow.com
 */
export function SupportNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 text-slate-300 ${
        compact ? "p-2.5 text-[11px]" : "p-3 text-xs"
      }`}
    >
      <LifeBuoy className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
      <span>
        <strong className="text-white">Returns &amp; support:</strong> SeenLow LLC handles every order question, return, and issue directly — reach us at{" "}
        <a href="mailto:support@seenlow.com" className="text-red-400 font-semibold hover:underline">
          support@seenlow.com
        </a>. Delivery dates are estimates, not guarantees.
      </span>
    </div>
  );
}
