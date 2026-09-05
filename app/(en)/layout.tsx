import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import "../fieldbook-v2.css";
import "../fieldbook-v3.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://cloud-ai-presales-fieldbook.lijx.chatgpt.site"),
  title: { default: "Cloud × AI Presales Fieldbook", template: "%s | Cloud × AI Presales Fieldbook" },
  description: "An evidence-backed fieldbook for cloud and AI presales learning, architecture decisions, and customer conversations.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Cloud × AI Presales Fieldbook",
    title: "Cloud × AI Presales Fieldbook",
    description: "An evidence-backed fieldbook for cloud and AI presales learning.",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "Cloud × AI Presales Fieldbook",
    description: "An evidence-backed fieldbook for cloud and AI presales learning.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function EnglishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <a className="skipLink" href="#main-content">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
