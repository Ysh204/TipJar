import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TipJar — Creator Tipping Platform",
  description: "Support your favorite creators with instant SOL tips, secured by MPC wallets.",
};

import GlobalBackground from "../components/layout/GlobalBackground";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans flex flex-col min-h-screen" suppressHydrationWarning>
        <GlobalBackground />
        {children}
      </body>
    </html>
  );
}
