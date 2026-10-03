import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import "../fieldbook-v3.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://cloud-ai-presales-fieldbook.lijx.chatgpt.site"),
  title: "AI 学习手册",
  description: "从模块与场景出发的 AI 学习手册：知识地图、实战练习与问答。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "AI 学习手册",
    title: "AI 学习手册",
    description: "从模块与场景出发的 AI 学习手册：知识地图、实战练习与问答。",
    images: [{ url: "/social-card.png", width: 1731, height: 909, alt: "AI 知识、证据和判断路径组成的学习地图" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 学习手册",
    description: "从模块与场景出发的 AI 学习手册：知识地图、实战练习与问答。",
    images: ["/social-card.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <a className="skipLink" href="#main-content">跳到主要内容</a>
        {children}
      </body>
    </html>
  );
}
