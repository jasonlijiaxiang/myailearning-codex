import type { Metadata } from "next";

import { DocumentLanguage } from "../i18n/document-language";

export const metadata: Metadata = {
  title: { default: "Cloud × AI Presales Fieldbook", template: "%s | Cloud × AI Presales Fieldbook" },
  description: "An evidence-backed fieldbook for cloud and AI presales learning, architecture decisions, and customer conversations.",
  robots: { index: false, follow: false },
  alternates: { languages: { "zh-CN": "/", en: "/en" } },
  openGraph: {
    locale: "en_US",
    siteName: "Cloud × AI Presales Fieldbook",
    title: "Cloud × AI Presales Fieldbook",
    description: "An evidence-backed fieldbook for cloud and AI presales learning.",
  },
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div lang="en"><DocumentLanguage lang="en" />{children}</div>;
}
