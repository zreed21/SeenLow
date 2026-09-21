import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">SeenLow</span>
          <span className="text-slate-500">·</span>
          <span>Operated by Zach Reed doing business as SeenLow at seenlow.com</span>
          <span className="text-slate-500">·</span>
          <span>support@seenlow.com</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Hourly Deal Auditing Active
          </span>
          <span>US Only · Prices in USD</span>
        </div>
      </div>
    </footer>
  );
}
