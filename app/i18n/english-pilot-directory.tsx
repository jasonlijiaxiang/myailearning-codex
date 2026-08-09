"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";

export type EnglishPilotDirectoryItem = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  href: string;
  keywords: string;
  external?: boolean;
};

type EnglishPilotDirectoryScope = {
  label: string;
  clearHref: string;
};

type EnglishPilotDirectoryProps = {
  items: EnglishPilotDirectoryItem[];
  label: string;
  placeholder: string;
  actionLabel?: string;
  scope?: EnglishPilotDirectoryScope;
};

export function EnglishPilotDirectory({ items, label, placeholder, actionLabel = "Open the related knowledge ↗", scope }: EnglishPilotDirectoryProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => {
    const normalized = deferredQuery.trim().toLocaleLowerCase("en-US");
    if (!normalized) return items;
    return items.filter((item) => `${item.title} ${item.subtitle} ${item.body} ${item.keywords}`.toLocaleLowerCase("en-US").includes(normalized));
  }, [deferredQuery, items]);

  return (
    <div className="questionDirectoryShell">
      <div className="questionDirectoryToolbar"><label className="questionDirectorySearch"><span>{label}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} type="search" /></label><p className="questionDirectoryStatus" aria-live="polite"><strong>{results.length}</strong><span>{results.length === 1 ? "result" : "results"}</span></p></div>
      {scope ? <p className="questionDirectoryScope"><span>{scope.label}</span><Link href={scope.clearHref} prefetch={false}>Show all sources</Link></p> : null}
      <div className="questionDirectoryList">{results.map((item) => (
        <article className="questionDirectoryItem" id={item.id} key={item.id}><header><span className="questionDirectoryTag">{item.subtitle}</span></header><h3>{item.title}</h3><div className="questionDirectoryShort"><span>SUMMARY</span><p>{item.body}</p></div>{item.external ? <a href={item.href} target="_blank" rel="noreferrer">{actionLabel}</a> : <Link href={item.href}>{actionLabel}</Link>}</article>
      ))}</div>
      {results.length === 0 ? <div className="questionEmptyState"><h2>No matching content</h2><p>Try a technical term, abbreviation, customer concern, or module name.</p></div> : null}
    </div>
  );
}
