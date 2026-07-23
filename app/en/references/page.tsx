import type { Metadata } from "next";
import Link from "next/link";

import { EnglishPilotDirectory, type EnglishPilotDirectoryItem } from "../../i18n/english-pilot-directory";
import { englishSourceCopy } from "../../i18n/en/registry.mjs";
import { sourceLedger } from "../../reference-content.mjs";

export const metadata: Metadata = { title: "References", description: "The source ledger and evidence limits for the complete fieldbook." };

const items: EnglishPilotDirectoryItem[] = Object.entries(englishSourceCopy).map(([sourceId, copy]) => {
  const canonical = sourceLedger[sourceId];
  if (!canonical) throw new Error(`Unknown English sourceId: ${sourceId}`);
  return {
    id: `source-${sourceId}`,
    title: canonical.title,
    subtitle: `${canonical.grade} evidence · ${copy.kind} · verified ${canonical.verifiedAt}`,
    body: copy.note,
    href: canonical.href,
    keywords: `${copy.shortTitle} ${canonical.shortTitle} ${canonical.kind}`,
  };
});

export default function EnglishReferencesPage() {
  return <main lang="en" className="questionDirectoryPage"><nav className="topbar" aria-label="Reference ledger navigation"><Link className="brand" href="/en" prefetch={false}><span>Cloud × AI / Presales Fieldbook</span></Link><div className="toplinks"><Link href="/en/questions" prefetch={false}>Questions</Link><Link href="/en/glossary" prefetch={false}>Glossary</Link><Link href="/references" hrefLang="zh-CN" lang="zh-CN" prefetch={false}>中文</Link></div></nav><header className="questionDirectoryHero"><p className="kicker">SOURCE LEDGER</p><h1>Know what each source supports—and what it does not</h1><p>Every entry keeps the original title, URL, evidence grade, verification date, supported claim, and explicit limit together.</p></header><EnglishPilotDirectory items={items} label="Search sources" placeholder="Try NIST, ISO, retrieval, model directory…" /></main>;
}
