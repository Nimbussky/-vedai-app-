import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VedAI - AI Vedic Astrology Platform",
    template: "%s | VedAI",
  },
  description: "Generate your birth chart in seconds, get instant AI-powered Vedic astrology interpretations, explore dashas, transits, and compatibility.",
  keywords: ["vedic astrology", "birth chart", "kundli", "horoscope", "AI astrology", "dasha", "transits", "compatibility", "nakshatra", "panchang"],
  authors: [{ name: "VedAI" }],
  creator: "VedAI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vedai.app",
    siteName: "VedAI",
    title: "VedAI - AI Vedic Astrology Platform",
    description: "Generate your birth chart in seconds, get instant AI-powered Vedic astrology interpretations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VedAI - Vedic Astrology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VedAI - AI Vedic Astrology Platform",
    description: "Generate your birth chart in seconds, get instant AI-powered Vedic astrology interpretations.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href="https://vedai.app" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
