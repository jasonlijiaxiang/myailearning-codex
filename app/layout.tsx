import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import "./fieldbook-v2.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const notoSerif = Noto_Serif_SC({ variable: "--font-serif", subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://cloud-ai-presales-fieldbook.lijx.chatgpt.site"),
  title: "云计算 × AI 平台售前知识库",
  description: "面向售前人员的云计算与 AI 平台知识地图、实战模块与客户问答手册。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "云计算 × AI 平台售前知识库",
    title: "云计算 × AI 平台售前知识库",
    description: "面向售前人员的云计算与 AI 平台知识地图、实战模块与客户问答手册。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
