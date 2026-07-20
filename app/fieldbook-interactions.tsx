"use client";

import Link from "next/link";
import { type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";

import { balanceGridRows, gridSpan } from "./layout-utils.mjs";

export type ExplorerModule = {
  slug: string;
  href: string;
  zh: string;
  en: string;
  layerNo: string;
  layerName: string;
  summary: string;
  cue: string;
};

export type KnowledgeSearchEntry = {
  id: string;
  type: "客户问答" | "课程章节" | "实战练习" | "专业术语" | "来源证据";
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
};

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const distance = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(distance > 0 ? Math.min(100, Math.max(0, (window.scrollY / distance) * 100)) : 0);
        frame = 0;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="readingProgress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>;
}

export function ModuleExplorer({ modules, knowledgeEntries = [] }: { modules: ExplorerModule[]; knowledgeEntries?: KnowledgeSearchEntry[] }) {
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState("all");
  const searchRef = useRef<HTMLInputElement>(null);
  const layers = useMemo(() => {
    const seen = new Map<string, string>();
    modules.forEach((item) => seen.set(item.layerNo, item.layerName));
    return [...seen.entries()].map(([no, name]) => ({ no, name }));
  }, [modules]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return modules.filter((item) => {
      const inLayer = layer === "all" || item.layerNo === layer;
      const haystack = `${item.zh} ${item.en} ${item.layerName} ${item.summary} ${item.cue}`.toLocaleLowerCase("zh-CN");
      return inLayer && (!normalized || haystack.includes(normalized));
    });
  }, [layer, modules, query]);

  const knowledgeMatches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    if (!normalized) return [];
    return knowledgeEntries
      .filter((item) => `${item.title} ${item.subtitle} ${item.keywords}`.toLocaleLowerCase("zh-CN").includes(normalized))
      .slice(0, 12);
  }, [knowledgeEntries, query]);
  const visibleRows = useMemo(() => balanceGridRows(visible, 3), [visible]);
  const knowledgeMatchRows = useMemo(() => balanceGridRows(knowledgeMatches, 2), [knowledgeMatches]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing = target?.matches("input, textarea, select, [contenteditable='true']");
      if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") || (event.key === "/" && !isEditing)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <section className="moduleExplorer" aria-labelledby="module-explorer-title">
      <div className="moduleExplorerIntro">
        <div>
          <p className="kicker">FIND THE RIGHT MODULE</p>
          <h2 id="module-explorer-title">从当前客户问题开始</h2>
        </div>
        <p>不必按目录顺序学习。输入客户正在讨论的技术、场景或风险，直接进入相关模块。</p>
      </div>

      <div className="moduleExplorerControls">
        <label className="moduleSearch">
          <span>搜索模块与知识内容</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例如：知识更新、量化、工具调用、GPU 利用率……"
          />
          <kbd>⌘ K</kbd>
        </label>
        <div className="layerFilters" aria-label="按知识层筛选">
          <button type="button" className={layer === "all" ? "active" : ""} onClick={() => setLayer("all")}>全部</button>
          {layers.map((item) => (
            <button type="button" className={layer === item.no ? "active" : ""} onClick={() => setLayer(item.no)} key={item.no}>
              {item.name.replace("层", "")}
            </button>
          ))}
        </div>
      </div>

      <div className="moduleExplorerStatus" aria-live="polite">
        <span>找到 {visible.length} 个模块{query ? `，另有 ${knowledgeMatches.length} 条知识命中` : ""}</span>
        {(query || layer !== "all") && <button type="button" onClick={() => { setQuery(""); setLayer("all"); }}>清除筛选</button>}
      </div>

      {query && knowledgeMatches.length > 0 ? (
        <div className="knowledgeSearchResults" aria-label="知识内容搜索结果">
          <header><strong>直接进入知识内容</strong><span>显示前 {knowledgeMatches.length} 条匹配</span></header>
          <div data-count={knowledgeMatches.length} data-odd={knowledgeMatches.length % 2 === 1 ? "true" : "false"}>
            {knowledgeMatchRows.flatMap((row) => row.map((item) => (
              <Link href={item.href} key={item.id} style={{ "--search-span": gridSpan(row.length) } as CSSProperties}>
                <span>{item.type}</span>
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
                <i aria-hidden="true">↗</i>
              </Link>
            )))}
          </div>
        </div>
      ) : null}

      <div className="moduleResultGrid" data-count={visible.length} data-odd={visible.length % 2 === 1 ? "true" : "false"}>
        {visibleRows.flatMap((row) => row.map((item) => (
          <Link className="moduleResult" href={item.href} key={item.slug} style={{ "--result-span": gridSpan(row.length) } as CSSProperties}>
            <div className="moduleResultMeta"><span>{item.layerNo}</span><small>{item.layerName}</small><i aria-hidden="true">↗</i></div>
            <h3>{item.zh}</h3>
            <p className="moduleResultEn">{item.en}</p>
            <p>{item.summary}</p>
            <strong>什么时候看这个模块：{item.cue}</strong>
          </Link>
        )))}
      </div>
      {visible.length === 0 && <div className="emptySearch"><strong>没有直接匹配的模块</strong><p>换一个业务问题或清除知识层筛选。</p></div>}
    </section>
  );
}

export type ReadingSection = {
  id: string;
  label: string;
  eyebrow?: string;
};

export function ModuleReadingNav({
  moduleName,
  sections,
  quickLinks,
}: {
  moduleName: string;
  sections: ReadingSection[];
  quickLinks?: Array<{ href: string; label: string }>;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (nodes.length === 0) return;

    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const readingLine = Math.min(240, window.innerHeight * 0.32);
        let current = nodes[0];
        for (const node of nodes) {
          if (node.getBoundingClientRect().top <= readingLine) current = node;
          else break;
        }
        setActive(current.id);
        frame = 0;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sections]);

  return (
    <aside className="moduleReadingNav" aria-label={`${moduleName} 章节导航`}>
      <div className="readingNavHead">
        <span>正在阅读</span>
        <strong>{moduleName}</strong>
      </div>
      <ol>
        {sections.map((section, index) => (
          <li key={section.id} className={active === section.id ? "active" : ""}>
            <a href={`#${section.id}`} aria-current={active === section.id ? "location" : undefined}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{section.label}</strong>{section.eyebrow ? <small>{section.eyebrow}</small> : null}</div>
            </a>
          </li>
        ))}
      </ol>
      {quickLinks?.length ? <div className="readingNavModes"><span>快速入口</span>{quickLinks.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</div> : null}
    </aside>
  );
}

export type LensPanel = {
  id: string;
  label: string;
  title: string;
  description: string;
  takeaway: string;
  nodes: Array<{
    label: string;
    en?: string;
    detail: string;
    signal: string;
  }>;
};

export function SystemLens({ title, lead, panels }: { title: string; lead: string; panels: LensPanel[] }) {
  const [activeId, setActiveId] = useState(panels[0]?.id ?? "");
  const tabsId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panel = panels.find((item) => item.id === activeId) ?? panels[0];
  if (!panel) return null;

  const moveTab = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? panels.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + panels.length) % panels.length;
    const next = panels[nextIndex];
    setActiveId(next.id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="systemLens" aria-labelledby={`${panels[0].id}-lens-title`}>
      <header className="systemLensIntro">
        <div><p className="kicker">INTERACTIVE SYSTEM VIEW</p><h3 id={`${panels[0].id}-lens-title`}>{title}</h3></div>
        <p>{lead}</p>
      </header>
      <div className="lensTabs" role="tablist" aria-label={`${title}视角`}>
        {panels.map((item, index) => (
          <button
            ref={(node) => { tabRefs.current[index] = node; }}
            type="button"
            role="tab"
            id={`${tabsId}-tab-${item.id}`}
            aria-controls={`${tabsId}-panel-${item.id}`}
            aria-selected={item.id === panel.id}
            tabIndex={item.id === panel.id ? 0 : -1}
            className={item.id === panel.id ? "active" : ""}
            onClick={() => setActiveId(item.id)}
            onKeyDown={(event) => moveTab(event, index)}
            key={item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="lensPanel" role="tabpanel" id={`${tabsId}-panel-${panel.id}`} aria-labelledby={`${tabsId}-tab-${panel.id}`} key={panel.id}>
        <div className="lensPanelCopy"><p className="miniLabel">{panel.label}</p><h4>{panel.title}</h4><p>{panel.description}</p></div>
        <ol className="lensFlow">
          {panel.nodes.map((node, index) => (
            <li key={node.label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h5>{node.label}{node.en ? <small>{node.en}</small> : null}</h5><p>{node.detail}</p><strong>{node.signal}</strong></div>
            </li>
          ))}
        </ol>
        <p className="lensTakeaway"><span>售前结论</span>{panel.takeaway}</p>
      </div>
    </section>
  );
}

export function QaFilterShell({ items, children }: { items: Array<{ tag: string; text: string }>; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const uniqueTags = useMemo(() => [...new Set(items.map((item) => item.tag))], [items]);
  const visibleCount = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return items.filter((item) => (tag === "all" || item.tag === tag) && (!normalized || item.text.toLocaleLowerCase("zh-CN").includes(normalized))).length;
  }, [items, query, tag]);

  useEffect(() => {
    const details = [...(rootRef.current?.querySelectorAll<HTMLDetailsElement>("details[data-qa-tag]") ?? [])];
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    details.forEach((item) => {
      const text = item.textContent?.toLocaleLowerCase("zh-CN") ?? "";
      const matches = (tag === "all" || item.dataset.qaTag === tag) && (!normalized || text.includes(normalized));
      item.hidden = !matches;
    });
  }, [query, tag]);

  useEffect(() => {
    const revealTarget = () => {
      const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
      if (target instanceof HTMLDetailsElement && target.dataset.qaTag) target.open = true;
    };
    revealTarget();
    window.addEventListener("hashchange", revealTarget);
    return () => window.removeEventListener("hashchange", revealTarget);
  }, []);

  return (
    <div className="qaExplorer" ref={rootRef}>
      <div className="qaToolbar">
        <label><span>搜索客户问题</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入关键词，如：成本、权限、准确率……" /></label>
        <div className="qaTagFilters" aria-label="按问题类型筛选">
          <button type="button" className={tag === "all" ? "active" : ""} onClick={() => setTag("all")}>全部</button>
          {uniqueTags.map((item) => <button type="button" className={tag === item ? "active" : ""} onClick={() => setTag(item)} key={item}>{item}</button>)}
        </div>
        <p aria-live="polite">当前显示 {visibleCount} 个问题</p>
      </div>
      {children}
      {visibleCount === 0 && <div className="emptySearch"><strong>没有匹配的问题</strong><p>清除筛选，或换一个更短的关键词。</p></div>}
    </div>
  );
}

export type ReferenceFilterItem = {
  key: string;
  moduleId: string;
  grade: string;
  text: string;
};

export function ReferenceFilterShell({ items, children }: { items: ReferenceFilterItem[]; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("all");
  const grades = useMemo(() => [...new Set(items.map((item) => item.grade))], [items]);
  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return items.filter((item) => (grade === "all" || item.grade === grade) && (!normalized || item.text.toLocaleLowerCase("zh-CN").includes(normalized)));
  }, [grade, items, query]);
  const visibleKeys = useMemo(() => new Set(visibleItems.map((item) => item.key)), [visibleItems]);
  const visibleModules = useMemo(() => new Set(visibleItems.map((item) => item.moduleId)).size, [visibleItems]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-reference-key]").forEach((node) => {
      node.hidden = !visibleKeys.has(node.dataset.referenceKey ?? "");
    });
    root.querySelectorAll<HTMLElement>("[data-reference-module]").forEach((section) => {
      section.hidden = !visibleItems.some((item) => item.moduleId === section.dataset.referenceModule);
    });
  }, [visibleItems, visibleKeys]);

  return (
    <div className="referenceExplorer" ref={rootRef}>
      <div className="referenceToolbar">
        <div>
          <p className="kicker">SEARCH THE EVIDENCE</p>
          <h2>查找来源，而不是翻阅长名单</h2>
        </div>
        <label><span>检索标题、边界或模块</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：权限、Reranker、Agent 评估……" /></label>
        <div className="referenceGradeFilters" aria-label="按证据类别筛选">
          <button type="button" className={grade === "all" ? "active" : ""} onClick={() => setGrade("all")}>全部类别</button>
          {grades.map((item) => <button type="button" className={grade === item ? "active" : ""} onClick={() => setGrade(item)} key={item}>{item} 类证据</button>)}
        </div>
        <p aria-live="polite">当前显示 {visibleItems.length} 条来源，分布在 {visibleModules} 个模块</p>
        {(query || grade !== "all") && <button className="referenceClear" type="button" onClick={() => { setQuery(""); setGrade("all"); }}>清除筛选</button>}
      </div>
      {children}
      {visibleItems.length === 0 && <div className="emptySearch referenceEmpty"><strong>没有匹配的来源</strong><p>缩短关键词或清除证据类别筛选。</p></div>}
    </div>
  );
}
