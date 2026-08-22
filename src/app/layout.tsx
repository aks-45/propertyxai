import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Property X — Know Before You Buy",
  description: "Explore and analyze properties before you make a decision.",
};

import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { FooterDisclaimer } from "@/components/ui/FooterDisclaimer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased font-inter">
      <body className="min-h-full flex flex-col bg-white text-dark-navy relative">
        <ParticleBackground />
        <div className="relative z-10 min-h-full flex flex-col flex-1">
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <FooterDisclaimer />
        </div>
      </body>
    </html>
  );
}
