import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-6 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="font-bold text-white">SeenLow</span>
          <span className="hidden sm:inline text-slate-500">·</span>
          <span>Operated by Zach Reed doing business as SeenLow at seenlow.com</span>
          <span className="hidden sm:inline text-slate-500">·</span>
          <a href="mailto:support@seenlow.com" className="hover:text-slate-300 transition">
            support@seenlow.com
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-400">
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link href="/disclosure" className="hover:text-white transition">
              Disclosure
            </Link>
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>
            <Link href="/advertise" className="hover:text-white transition">
              Advertise
            </Link>
            <Link href="/account-deletion" className="hover:text-white transition">
              Delete account
            </Link>
          </nav>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Hourly Deal Auditing Active
          </span>
          <span>US Only · Prices in USD</span>
        </div>
      </div>
    </footer>
  );
}
