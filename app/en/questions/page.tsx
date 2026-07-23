import type { Metadata } from "next";
import Link from "next/link";

import { EnglishPilotDirectory, type EnglishPilotDirectoryItem } from "../../i18n/english-pilot-directory";
import { englishQuestions } from "../../i18n/en/registry.mjs";

export const metadata: Metadata = { title: "Customer Questions", description: "Search the fieldbook's evidence-backed customer question pack." };

const items: EnglishPilotDirectoryItem[] = englishQuestions.map((item) => ({
  id: `question-${item.moduleSlug}-${item.id}`,
  title: item.q,
  subtitle: `${item.moduleTitle} · ${item.tag}${item.addedAt ? ` · Added on ${item.addedAt}` : ""}`,
  body: item.a,
  href: `/en/modules/${item.moduleSlug}#qa-${item.id}`,
  keywords: `${item.depth} ${item.ask} ${item.basis}`,
}));

export default function EnglishQuestionsPage() {
  return <main lang="en" className="questionDirectoryPage"><nav className="topbar" aria-label="Question directory navigation"><Link className="brand" href="/en" prefetch={false}><span>Cloud × AI / Presales Fieldbook</span></Link><div className="toplinks"><Link href="/en/glossary" prefetch={false}>Glossary</Link><Link href="/en/references" prefetch={false}>References</Link><Link href="/questions" hrefLang="zh-CN" lang="zh-CN" prefetch={false}>中文</Link></div></nav><header className="questionDirectoryHero"><p className="kicker">CUSTOMER QUESTION PACK</p><h1>Find the answer you need in a customer conversation</h1><p>This directory covers all {items.length} questions across the fieldbook. Each answer continues into technical detail, evidence limits, and a recommended discovery question.</p></header><EnglishPilotDirectory items={items} label="Search customer questions" placeholder="Try grounding, open weights, EU AI Act…" /></main>;
}
