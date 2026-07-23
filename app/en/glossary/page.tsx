import type { Metadata } from "next";
import Link from "next/link";

import { EnglishPilotDirectory, type EnglishPilotDirectoryItem } from "../../i18n/english-pilot-directory";
import { englishTermCopy } from "../../i18n/en/registry.mjs";
import { englishModulePath } from "../../i18n/locale-config.mjs";
import { terminology } from "../../terminology.mjs";

export const metadata: Metadata = { title: "Glossary", description: "Definitions for the stable concept IDs used across the fieldbook." };

const items: EnglishPilotDirectoryItem[] = Object.entries(englishTermCopy).map(([termId, copy]) => {
  const canonical = terminology[termId];
  if (!canonical) throw new Error(`Unknown English termId: ${termId}`);
  const relatedModulePath = canonical.moduleSlugs.map((slug) => englishModulePath(slug) ?? `/modules/${slug}`).at(0) ?? "/en";
  return {
    id: `term-${termId}`,
    title: copy.name,
    subtitle: copy.abbr ? `${copy.abbr} · Shared concept ID` : "Shared concept ID",
    body: copy.definition,
    href: relatedModulePath,
    keywords: `${canonical.zh} ${canonical.en} ${canonical.abbr ?? ""} ${canonical.moduleSlugs.join(" ")}`,
  };
});

export default function EnglishGlossaryPage() {
  return <main lang="en" className="questionDirectoryPage"><nav className="topbar" aria-label="Glossary navigation"><Link className="brand" href="/en" prefetch={false}><span>Cloud × AI / Presales Fieldbook</span></Link><div className="toplinks"><Link href="/en/questions" prefetch={false}>Questions</Link><Link href="/en/references" prefetch={false}>References</Link><Link href="/glossary" hrefLang="zh-CN" lang="zh-CN" prefetch={false}>中文</Link></div></nav><header className="questionDirectoryHero"><p className="kicker">FIELD GLOSSARY</p><h1>Use one stable concept across the fieldbook</h1><p>Names, abbreviations, concept IDs, and module relationships stay consistent so every definition leads back to the relevant technical context.</p></header><EnglishPilotDirectory items={items} label="Search the glossary" placeholder="Try grounding, assurance, open weights…" /></main>;
}
