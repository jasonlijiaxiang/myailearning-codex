import type { Metadata } from "next";

import { EnglishModulePage, type EnglishModule } from "../../../../i18n/english-pilot-module-page";
import { englishPageMetadata } from "../../../../i18n/english-page-metadata";
import { requireEnglishModule } from "../../../../i18n/en/registry.mjs";

const rag = requireEnglishModule("rag") as unknown as EnglishModule;

export const metadata: Metadata = englishPageMetadata({
  title: rag.title,
  description: rag.definition,
  path: "/en/modules/rag",
  zhPath: "/modules/rag",
});

export default function EnglishRagPage() {
  return <EnglishModulePage module={rag} reader="unified" />;
}
