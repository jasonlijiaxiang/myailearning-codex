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

export function GlossaryExplorer({ groups, terms }: { groups: GlossaryGroupItem[]; terms: GlossaryTermItem[] }) {
  const [query, setQuery] = useState("");
  const [groupId, setGroupId] = useState("all");
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");

  const visibleTerms = useMemo(() => terms.filter((item) => {
    const inGroup = groupId === "all" || item.groupId === groupId;
    const haystack = `${item.zh} ${item.en} ${item.abbr ?? ""} ${item.description} ${item.modules.map((module) => `${module.zh} ${module.en}`).join(" ")}`.toLocaleLowerCase("zh-CN");
    return inGroup && (!normalizedQuery || haystack.includes(normalizedQuery));
  }), [groupId, normalizedQuery, terms]);

  const visibleIds = useMemo(() => new Set(visibleTerms.map((item) => item.id)), [visibleTerms]);
  const hasFilter = Boolean(normalizedQuery) || groupId !== "all";

  return (
    <div className="glossaryExplorer">
      <div className="glossaryToolbar">
        <label className="glossarySearch">
          <span>搜索中文、英文、缩写或说明</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例如：上下文窗口、Tool Calling、SLO……"
          />
          <i aria-hidden="true">⌕</i>
        </label>
        <div className="glossaryFilters" aria-label="按术语主题筛选">
          <button type="button" className={groupId === "all" ? "active" : ""} onClick={() => setGroupId("all")}>全部主题</button>
          {groups.map((group) => (
            <button type="button" className={groupId === group.id ? "active" : ""} onClick={() => setGroupId(group.id)} key={group.id}>{group.zh}</button>
          ))}
        </div>
      </div>

      <div className="glossaryStatus" aria-live="polite">
        <span>找到 <strong>{visibleTerms.length}</strong> 个术语</span>
        {hasFilter ? <button type="button" onClick={() => { setQuery(""); setGroupId("all"); }}>清除筛选</button> : <span>按知识关系分组，不按字母堆叠</span>}
      </div>

      <div className="glossaryGroupList">
        {groups.map((group, groupIndex) => {
          const groupTerms = terms.filter((item) => item.groupId === group.id && visibleIds.has(item.id));
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
                      <Link href={`/references#module-${item.modules[0]?.slug ?? "solution-patterns"}`}>依据 ↗</Link>
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
