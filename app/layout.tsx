import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const notoSerif = Noto_Serif_SC({ variable: "--font-serif", subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "云计算 × AI 平台售前知识库",
  description: "面向售前人员的云计算与 AI 平台知识地图、实战模块与客户问答手册。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
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
