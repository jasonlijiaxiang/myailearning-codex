import type { Metadata } from "next";
import Link from "next/link";

import { EnglishPilotDirectory, type EnglishPilotDirectoryItem } from "../../../i18n/english-pilot-directory";
import { englishPageMetadata } from "../../../i18n/english-page-metadata";
import { englishModuleRegistry, englishQuestions } from "../../../i18n/en/registry.mjs";

export const metadata: Metadata = englishPageMetadata({
  title: "Customer Questions",
  description: "Search the fieldbook's evidence-backed customer question pack.",
  path: "/en/questions",
  zhPath: "/questions",
});

const exactQuestionTargets = new Set(Object.values(englishModuleRegistry).flatMap((module) =>
  module.qa.map((item) => `${module.slug}:${item.id}`),
));

function directoryItem(item: (typeof englishQuestions)[number]): EnglishPilotDirectoryItem {
  return {
  id: `question-${item.moduleSlug}-${item.id}`,
  title: item.q,
  subtitle: `${item.moduleTitle} · ${item.tag}${item.addedAt ? ` · Added on ${item.addedAt}` : ""}`,
  body: item.a,
  href: exactQuestionTargets.has(`${item.moduleSlug}:${item.id}`)
    ? `/en/modules/${item.moduleSlug}#qa-${item.id}`
    : `/en/modules/${item.moduleSlug}#qa`,
  keywords: `${item.depth} ${item.ask} ${item.basis}`,
  };
}

const allItems: EnglishPilotDirectoryItem[] = englishQuestions.map(directoryItem);

type EnglishQuestionsSearchParams = { module?: string };

export default async function EnglishQuestionsPage({ searchParams }: { searchParams?: Promise<EnglishQuestionsSearchParams> }) {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({})) as EnglishQuestionsSearchParams;
  const requestedModule = resolvedSearchParams.module;
  const selectedModule = requestedModule && englishModuleRegistry[requestedModule] ? englishModuleRegistry[requestedModule] : null;
  const items = selectedModule
    ? englishQuestions.filter((item) => item.moduleSlug === selectedModule.slug).map(directoryItem)
    : allItems;
  const scopeLead = selectedModule
    ? `This view lists all ${items.length} questions for ${selectedModule.title}, each with a concise answer. Module pages place the same question pack beside its mechanism and evidence.`
    : `This directory lists all ${items.length} questions in the fieldbook, each with a concise answer. Module pages place each question beside its mechanism and evidence.`;

  return (
    <main lang="en" className="fieldbookTheme questionDirectoryPage">
      <nav className="topbar" aria-label="Question directory navigation">
        <Link className="brand" href="/en" prefetch={false}><span>Cloud × AI / Presales Fieldbook</span></Link>
        <div className="toplinks"><Link href="/en/glossary" prefetch={false}>Glossary</Link><Link href="/en/references" prefetch={false}>References</Link><Link href="/questions" hrefLang="zh-CN" lang="zh-CN" prefetch={false}>Chinese</Link></div>
      </nav>
      <div id="main-content" className="skipTarget" tabIndex={-1} />
      <header className="questionDirectoryHero"><p className="kicker">CUSTOMER QUESTION PACK</p><h1>Find the answer you need in a customer conversation</h1><p>{scopeLead}</p></header>
      <EnglishPilotDirectory items={items} label="Search customer questions" placeholder="Try grounding, open weights, EU AI Act…" />
    </main>
  );
}
