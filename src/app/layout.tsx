import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeenLow — Lowest we've seen. Checked again before you tap.",
  description: "SeenLow watches US store prices and sends you to the best live offer — or buys it for you when you want one seller. Operated by SeenLow LLC at seenlow.com.",
  icons: {
    icon: "/images/seenlow-icon.svg",
    apple: "/images/seenlow-icon.svg",
  },
  metadataBase: new URL("https://seenlow.com"),
};

const themeScript = `(function(){try{var t=localStorage.getItem('fd-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-[#B91C1C] selection:text-white">
        {children}
      </body>
    </html>
  );
}
