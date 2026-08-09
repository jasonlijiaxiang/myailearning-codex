import type { Metadata } from "next";
import Link from "next/link";

import { EnglishPilotDirectory, type EnglishPilotDirectoryItem } from "../../i18n/english-pilot-directory";
import { englishPageMetadata } from "../../i18n/english-page-metadata";
import { englishModuleRegistry, englishSourceCopy } from "../../i18n/en/registry.mjs";
import { sourceLedger } from "../../reference-content.mjs";

export const metadata: Metadata = englishPageMetadata({
  title: "References",
  description: "The English source ledger and evidence limits available for the fieldbook.",
  path: "/en/references",
  zhPath: "/references",
});

function referenceItem(sourceId: string, copy: (typeof englishSourceCopy)[string]): EnglishPilotDirectoryItem {
  const canonical = sourceLedger[sourceId];
  if (!canonical) throw new Error(`Unknown English sourceId: ${sourceId}`);
  return {
    id: `source-${sourceId}`,
    title: canonical.title,
    subtitle: `${canonical.grade} evidence · ${copy.kind} · verified ${canonical.verifiedAt}`,
    body: copy.note,
    href: canonical.href,
    keywords: `${copy.shortTitle} ${canonical.shortTitle} ${canonical.kind}`,
    external: true,
  };
}

const itemsBySourceId = new Map(Object.entries(englishSourceCopy).map(([sourceId, copy]) => [sourceId, referenceItem(sourceId, copy)]));
const allItems = [...itemsBySourceId.values()];

type EnglishReferencesSearchParams = { module?: string };

export default async function EnglishReferencesPage({ searchParams }: { searchParams?: Promise<EnglishReferencesSearchParams> }) {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({}));
  const requestedModule = resolvedSearchParams.module;
  const selectedModule = requestedModule && englishModuleRegistry[requestedModule] ? englishModuleRegistry[requestedModule] : null;
  const items = selectedModule
    ? Object.keys(selectedModule.sources).map((sourceId) => {
      const item = itemsBySourceId.get(sourceId);
      if (!item) throw new Error(`${selectedModule.slug} declares a source without English ledger copy: ${sourceId}`);
      return item;
    })
    : allItems;
  const scope = selectedModule
    ? { label: `Showing ${items.length} sources used by ${selectedModule.title}.`, clearHref: "/en/references" }
    : undefined;

  return (
    <main lang="en" className="fieldbookTheme questionDirectoryPage">
      <nav className="topbar" aria-label="Reference ledger navigation">
        <Link className="brand" href="/en" prefetch={false}><span>Cloud × AI / Presales Fieldbook</span></Link>
        <div className="toplinks"><Link href="/en/questions" prefetch={false}>Questions</Link><Link href="/en/glossary" prefetch={false}>Glossary</Link><Link href="/references" hrefLang="zh-CN" lang="zh-CN" prefetch={false}>中文</Link></div>
      </nav>
      <header className="questionDirectoryHero"><p className="kicker">SOURCE LEDGER</p><h1>Know what each source supports—and what it does not</h1><p>Every listed English entry keeps the original title, URL, evidence grade, verification date, supported claim, and explicit limit together.</p></header>
      <EnglishPilotDirectory items={items} label="Search sources" placeholder="Try NIST, ISO, retrieval, model directory…" actionLabel="Open source ↗" scope={scope} />
    </main>
  );
}
