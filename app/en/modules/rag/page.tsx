import type { Metadata } from "next";

import { EnglishModulePage } from "../../../i18n/english-pilot-module-page";
import { requireEnglishModule } from "../../../i18n/en/registry.mjs";

const rag = requireEnglishModule("rag");

export const metadata: Metadata = {
  title: rag.title,
  description: rag.definition,
  alternates: { canonical: "/en/modules/rag", languages: { en: "/en/modules/rag", "zh-CN": "/modules/rag" } },
};

export default function EnglishRagPage() {
  return <EnglishModulePage module={rag} />;
}
