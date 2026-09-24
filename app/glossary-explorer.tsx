"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type GlossaryModuleLink = {
  slug: string;
  zh: string;
  en: string;
};

export type GlossaryTermItem = {
  id: string;
  groupId: string;
  zh: string;
  en: string;
  abbr?: string;
  description: string;
  modules: GlossaryModuleLink[];
};

export type GlossaryGroupItem = {
  id: string;
  zh: string;
  en: string;
};

function matchScore(item: GlossaryTermItem, query: string) {
  if (!query) return 0;
  const zh = item.zh.toLocaleLowerCase("zh-CN");
  const en = item.en.toLocaleLowerCase("zh-CN");
  const abbr = item.abbr?.toLocaleLowerCase("zh-CN") ?? "";
  if (zh === query || en === query || abbr === query) return 100;
  if (zh.includes(query) || en.includes(query) || abbr.includes(query)) return 60;
  if (item.description.toLocaleLowerCase("zh-CN").includes(query)) return 20;
  return item.modules.some((module) => `${module.zh} ${module.en}`.toLocaleLowerCase("zh-CN").includes(query)) ? 5 : -1;
}

export function GlossaryExplorer({ groups, terms }: { groups: GlossaryGroupItem[]; terms: GlossaryTermItem[] }) {
  const [query, setQuery] = useState("");
  const [groupId, setGroupId] = useState("all");
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");

  const visibleTerms = useMemo(() => terms.filter((item) =>
    (groupId === "all" || item.groupId === groupId) && matchScore(item, normalizedQuery) >= 0
  ).sort((left, right) => matchScore(right, normalizedQuery) - matchScore(left, normalizedQuery)), [groupId, normalizedQuery, terms]);
  const visibleGroups = useMemo(() => {
    if (!normalizedQuery) return groups;
    const bestScore = (group: GlossaryGroupItem) => {
      const firstMatch = visibleTerms.find((item) => item.groupId === group.id);
      return firstMatch ? matchScore(firstMatch, normalizedQuery) : -1;
    };
    return [...groups].sort((left, right) => bestScore(right) - bestScore(left));
  }, [groups, normalizedQuery, visibleTerms]);
  const hasFilter = Boolean(normalizedQuery) || groupId !== "all";

  return (
    <div className="glossaryExplorer">
      <div className="glossaryToolbar">
        <label className="glossarySearch">
          <span>搜索名称、缩写、说明或相关模块</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例如：上下文窗口、Tool Calling、SLO……"
          />
          <i aria-hidden="true">⌕</i>
        </label>
        <div className="glossaryFilters" aria-label="按术语主题筛选">
          <button type="button" aria-pressed={groupId === "all"} className={groupId === "all" ? "active" : ""} onClick={() => setGroupId("all")}>全部主题</button>
          {groups.map((group) => (
            <button type="button" aria-pressed={groupId === group.id} className={groupId === group.id ? "active" : ""} onClick={() => setGroupId(group.id)} key={group.id}>{group.zh}</button>
          ))}
        </div>
      </div>

      <div className="glossaryStatus" aria-live="polite">
        <span>找到 <strong>{visibleTerms.length}</strong> 个术语</span>
        {hasFilter ? <button type="button" onClick={() => { setQuery(""); setGroupId("all"); }}>清除筛选</button> : <span>按知识关系分组，不按字母堆叠</span>}
      </div>

      <div className="glossaryGroupList">
        {visibleGroups.map((group, groupIndex) => {
          const groupTerms = visibleTerms.filter((item) => item.groupId === group.id);
          if (groupTerms.length === 0) return null;
          return (
            <section className="glossaryGroup" aria-labelledby={`glossary-group-${group.id}`} key={group.id}>
              <header>
                <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                <div><h2 id={`glossary-group-${group.id}`}>{group.zh}</h2><p>{group.en}</p></div>
                <strong>{groupTerms.length} 个术语</strong>
              </header>
              <div className="glossaryTermList">
                {groupTerms.map((item, termIndex) => (
                  <article id={`term-${item.id}`} className="glossaryTerm" key={item.id}>
                    <span className="glossaryTermNo">{String(termIndex + 1).padStart(2, "0")}</span>
                    <div className="glossaryTermName">
                      <h3>{item.zh}</h3>
                      <p>{item.en}{item.abbr ? <strong>{item.abbr}</strong> : null}</p>
                    </div>
                    <p className="glossaryTermDescription">{item.description}</p>
                    <nav aria-label={`${item.zh}相关页面`}>
                      {item.modules.map((module) => <Link href={`/modules/${module.slug}`} key={module.slug}>{module.zh}</Link>)}
                    </nav>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {visibleTerms.length === 0 ? (
        <div className="glossaryEmpty">
          <strong>没有找到直接匹配的术语</strong>
          <p>尝试中文名、英文名、缩写或相关模块名称。</p>
          <button type="button" onClick={() => { setQuery(""); setGroupId("all"); }}>查看全部术语</button>
        </div>
      ) : null}
    </div>
  );
}
