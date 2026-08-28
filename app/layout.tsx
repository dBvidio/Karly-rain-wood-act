import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const content = getContent();
const siteUrl = `https://${content.campaign.domain}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${content.hero.headline} | ${content.campaign.billName}`,
  description: content.hero.ask,
  openGraph: {
    title: content.hero.headline,
    description: content.hero.ask,
    url: siteUrl,
    siteName: content.campaign.billName,
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: content.hero.headline,
    description: content.hero.ask,
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-body text-ink-900">{children}</body>
    </html>
  );
}
