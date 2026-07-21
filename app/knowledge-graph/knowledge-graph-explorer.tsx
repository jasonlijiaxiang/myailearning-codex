"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import styles from "./knowledge-graph.module.css";

export type GraphLayer = { no: string; name: string; en: string; moduleIds: string[] };
export type GraphModule = { id: string; zh: string; en: string; href: string; layerNo: string; layerName: string; summary: string };
export type GraphTerm = { id: string; zh: string; en: string; abbr?: string; description: string; moduleIds: string[]; primaryModuleId: string };
export type GraphRelation = { from: string; to: string; type: string; explanation: string };
export type GraphRelationType = { label: string; description: string };
export type GraphModuleCoverage = { moduleId: string; termCount: number; primaryTermCount: number };
export type GraphOverviewLink = { id: string; from: string; to: string; termIds: string[]; sharedTermCount: number };

type Focus = { kind: "module" | "term"; id: string };
type Neighbor = {
  key: string;
  kind: "module" | "term";
  id: string;
  title: string;
  subtitle: string;
  relationType: string;
  explanation: string;
};

const lineClassByType: Record<string, string> = {
  "primary-owner": styles.edgePrimary,
  "contextual-use": styles.edgeContext,
  prerequisite: styles.edgePrerequisite,
  component: styles.edgeComponent,
  control: styles.edgeControl,
  metric: styles.edgeMetric,
};

function nodeKey(kind: Focus["kind"], id: string) {
  return `${kind}:${id}`;
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

export function KnowledgeGraphExplorer({
  layers,
  modules,
  terms,
  relations,
  relationTypes,
  moduleCoverage,
  overviewLinks,
  overviewMinSharedTerms,
  minimumRelatedTerms,
  minimumPrimaryTerms,
}: {
  layers: GraphLayer[];
  modules: GraphModule[];
  terms: GraphTerm[];
  relations: GraphRelation[];
  relationTypes: Record<string, GraphRelationType>;
  moduleCoverage: GraphModuleCoverage[];
  overviewLinks: GraphOverviewLink[];
  overviewMinSharedTerms: number;
  minimumRelatedTerms: number;
  minimumPrimaryTerms: number;
}) {
  const [viewMode, setViewMode] = useState<"overview" | "detail">("overview");
  const [focus, setFocus] = useState<Focus>({ kind: "module", id: "rag" });
  const [query, setQuery] = useState("");
  const [moduleRelationMode, setModuleRelationMode] = useState<"all" | "primary">("all");
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("zh-CN"));

  const moduleById = useMemo(() => new Map(modules.map((module) => [module.id, module])), [modules]);
  const termById = useMemo(() => new Map(terms.map((term) => [term.id, term])), [terms]);
  const coverageByModule = useMemo(() => new Map(moduleCoverage.map((coverage) => [coverage.moduleId, coverage])), [moduleCoverage]);
  const overviewGeometry = useMemo(() => {
    const nodes = layers.flatMap((layer, layerIndex) => layer.moduleIds.map((moduleId, moduleIndex) => ({
      moduleId,
      x: 118 + ((moduleIndex + .5) * 864 / layer.moduleIds.length),
      y: 61 + layerIndex * 100,
    })));
    return { nodes, pointByModule: new Map(nodes.map((node) => [node.moduleId, node])) };
  }, [layers]);
  const underModeledModules = useMemo(() => moduleCoverage
    .filter((coverage) => coverage.termCount < minimumRelatedTerms || coverage.primaryTermCount < minimumPrimaryTerms)
    .map((coverage) => ({ ...coverage, module: moduleById.get(coverage.moduleId) }))
    .filter((entry) => entry.module), [minimumPrimaryTerms, minimumRelatedTerms, moduleById, moduleCoverage]);
  const overviewCanvasHeight = 20 + layers.length * 100;

  const searchResults = useMemo(() => {
    if (!deferredQuery) return [];
    const moduleMatches = modules
      .filter((module) => `${module.zh} ${module.en} ${module.summary}`.toLocaleLowerCase("zh-CN").includes(deferredQuery))
      .map((module) => ({ kind: "module" as const, id: module.id, title: module.zh, subtitle: module.en }));
    const termMatches = terms
      .filter((term) => `${term.zh} ${term.en} ${term.abbr ?? ""} ${term.description}`.toLocaleLowerCase("zh-CN").includes(deferredQuery))
      .map((term) => ({ kind: "term" as const, id: term.id, title: term.zh, subtitle: term.abbr ?? term.en }));
    return [...moduleMatches, ...termMatches].slice(0, 10);
  }, [deferredQuery, modules, terms]);

  const neighbors = useMemo<Neighbor[]>(() => {
    if (focus.kind === "module") {
      return terms.flatMap((term) => {
        if (!term.moduleIds.includes(focus.id) || term.id === focus.id) return [];
        const relationType = term.primaryModuleId === focus.id ? "primary-owner" : "contextual-use";
        if (moduleRelationMode === "primary" && relationType !== "primary-owner") return [];
        const owner = moduleById.get(term.primaryModuleId);
        return [{
          key: nodeKey("term", term.id),
          kind: "term",
          id: term.id,
          title: term.abbr ?? term.zh,
          subtitle: term.abbr ? term.zh : term.en,
          relationType,
          explanation: relationType === "primary-owner"
            ? `${moduleById.get(focus.id)?.zh ?? focus.id} 是“${term.zh}”的主要归属模块，负责其定义、机制与边界。`
            : `${moduleById.get(focus.id)?.zh ?? focus.id} 在局部机制或方案判断中使用“${term.zh}”；主要解释位于${owner ? `“${owner.zh}”` : "其归属模块"}。`,
        }];
      });
    }

    const selectedTerm = termById.get(focus.id);
    if (!selectedTerm) return [];
    const moduleNeighbors: Neighbor[] = selectedTerm.moduleIds.flatMap((moduleId) => {
      const knowledgeModule = moduleById.get(moduleId);
      if (!knowledgeModule) return [];
      const relationType = selectedTerm.primaryModuleId === moduleId ? "primary-owner" : "contextual-use";
      return [{
        key: nodeKey("module", knowledgeModule.id),
        kind: "module",
        id: knowledgeModule.id,
        title: knowledgeModule.zh,
        subtitle: knowledgeModule.en,
        relationType,
        explanation: relationType === "primary-owner"
          ? `“${knowledgeModule.zh}”是该知识点的主要归属模块。`
          : `“${knowledgeModule.zh}”在局部机制或方案判断中使用该知识点。`,
      }];
    });
    const semanticNeighbors: Neighbor[] = relations.flatMap((relation) => {
      if (relation.from !== focus.id && relation.to !== focus.id) return [];
      const otherId = relation.from === focus.id ? relation.to : relation.from;
      if (selectedTerm.moduleIds.includes(otherId)) return [];
      const other = termById.get(otherId);
      if (!other) return [];
      return [{
        key: `${nodeKey("term", other.id)}:${relation.type}`,
        kind: "term",
        id: other.id,
        title: other.abbr ?? other.zh,
        subtitle: other.abbr ? other.zh : other.en,
        relationType: relation.type,
        explanation: relation.explanation,
      }];
    });
    return [...moduleNeighbors, ...semanticNeighbors];
  }, [focus, moduleById, moduleRelationMode, relations, termById, terms]);

  const selectedModule = focus.kind === "module" ? moduleById.get(focus.id) : undefined;
  const selectedTerm = focus.kind === "term" ? termById.get(focus.id) : undefined;
  const selectedTitle = selectedModule?.zh ?? selectedTerm?.zh ?? focus.id;
  const selectedSubtitle = selectedModule?.en ?? selectedTerm?.en ?? "";
  const selectedDescription = selectedModule?.summary ?? selectedTerm?.description ?? "";
  const relationCounts = useMemo(() => neighbors.reduce<Record<string, number>>((counts, neighbor) => {
    counts[neighbor.relationType] = (counts[neighbor.relationType] ?? 0) + 1;
    return counts;
  }, {}), [neighbors]);

  const rowsPerSide = Math.ceil(neighbors.length / 2);
  const canvasHeight = Math.max(560, rowsPerSide * 82 + 88);
  const centerY = Math.round(canvasHeight / 2);
  const positions = neighbors.map((neighbor, index) => ({
    neighbor,
    side: index % 2 === 0 ? "left" as const : "right" as const,
    y: 54 + Math.floor(index / 2) * 82,
  }));

  function selectFocus(next: Focus) {
    setFocus(next);
    setViewMode("detail");
    setQuery("");
    setMobileRailOpen(false);
  }

  function showOverview() {
    setViewMode("overview");
    setQuery("");
    setMobileRailOpen(false);
  }

  return (
    <section className={styles.explorer} aria-label="全局知识关系探索器">
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <label className={styles.search}>
            <span className={styles.srOnly}>搜索模块或术语</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索模块或术语，例如：RAG、KV Cache、身份与授权"
            />
          </label>
          {deferredQuery ? (
            <div className={styles.searchResults} aria-label="搜索结果">
              {searchResults.length ? searchResults.map((result) => (
                <button type="button" key={nodeKey(result.kind, result.id)} onClick={() => selectFocus({ kind: result.kind, id: result.id })}>
                  <span>{result.kind === "module" ? "模块" : "术语"}</span>
                  <strong>{result.title}</strong>
                  <small>{result.subtitle}</small>
                </button>
              )) : <p>没有找到匹配的模块或术语。</p>}
            </div>
          ) : null}
        </div>

        <div className={styles.modeControls} aria-label="模块关系显示范围">
          <button type="button" className={viewMode === "overview" ? styles.activeMode : ""} onClick={showOverview} aria-pressed={viewMode === "overview"}>全局总览</button>
          <button type="button" className={viewMode === "detail" && moduleRelationMode === "all" ? styles.activeMode : ""} onClick={() => setModuleRelationMode("all")} disabled={viewMode === "overview" || focus.kind !== "module"}>全部关联术语</button>
          <button type="button" className={viewMode === "detail" && moduleRelationMode === "primary" ? styles.activeMode : ""} onClick={() => setModuleRelationMode("primary")} disabled={viewMode === "overview" || focus.kind !== "module"}>只看主要讲解</button>
        </div>

        <div className={styles.legend} aria-label="关系类型图例">
          {Object.entries(relationTypes).map(([typeId, type]) => (
            <span key={typeId} className={styles.legendItem}><i className={lineClassByType[typeId]} aria-hidden="true" />{type.label}</span>
          ))}
        </div>
      </div>

      <button type="button" className={styles.mobileRailToggle} aria-expanded={mobileRailOpen} onClick={() => setMobileRailOpen((value) => !value)}>
        <span>选择知识层与模块</span><strong>{viewMode === "overview" ? `全部 ${modules.length} 个模块` : selectedModule?.zh ?? moduleById.get(selectedTerm?.primaryModuleId ?? "")?.zh}</strong>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7 5 5 5-5" /></svg>
      </button>

      <div className={styles.workspace}>
        <aside className={`${styles.moduleRail} ${mobileRailOpen ? styles.mobileRailOpen : ""}`} aria-label="知识层与模块">
          <header><strong>知识层级与模块</strong><span>{modules.length}</span></header>
          {layers.map((layer) => (
            <section key={layer.no} aria-labelledby={`graph-layer-${layer.no}`}>
              <div><span>{layer.no}</span><h2 id={`graph-layer-${layer.no}`}>{layer.name}</h2><small>{layer.en}</small></div>
              <ul>
                {layer.moduleIds.map((moduleId) => {
                  const knowledgeModule = moduleById.get(moduleId);
                  if (!knowledgeModule) return null;
                  const active = viewMode === "detail" && focus.kind === "module" && focus.id === knowledgeModule.id;
                  return (
                    <li key={knowledgeModule.id}>
                      <button type="button" className={active ? styles.activeModule : ""} onClick={() => selectFocus({ kind: "module", id: knowledgeModule.id })} aria-pressed={active}>
                        <span>{knowledgeModule.zh}</span><small>{knowledgeModule.en}</small>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </aside>

        <div className={styles.graphRegion}>
          {viewMode === "overview" ? (
            <>
              <header className={styles.graphStatus}>
                <div><span>全局总览</span><strong>{modules.length} 个正式模块</strong></div>
                <p>{overviewLinks.length} 条共享术语主干</p>
              </header>
              <div className={styles.overviewCanvas} style={{ "--overview-height": `${overviewCanvasHeight}px` } as CSSProperties}>
                <svg className={styles.overviewConnections} viewBox={`0 0 1000 ${overviewCanvasHeight}`} role="img" aria-label={`${modules.length} 个模块之间的共享术语关系`}>
                  <title>{`${modules.length} 个模块全局关系总览`}</title>
                  <desc>{`连线表示两个模块共享至少 ${overviewMinSharedTerms} 个已登记术语。`}</desc>
                  {overviewLinks.map((link) => {
                    const from = overviewGeometry.pointByModule.get(link.from);
                    const to = overviewGeometry.pointByModule.get(link.to);
                    if (!from || !to) return null;
                    return <line key={link.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} style={{ "--shared-count": Math.min(link.sharedTermCount, 6) } as CSSProperties} />;
                  })}
                </svg>
                {layers.map((layer, layerIndex) => (
                  <section className={styles.overviewLayer} key={layer.no} style={{ "--layer-row": layerIndex, "--module-count": layer.moduleIds.length } as CSSProperties} aria-labelledby={`overview-layer-${layer.no}`}>
                    <header><span>{layer.no}</span><div><strong id={`overview-layer-${layer.no}`}>{layer.name}</strong><small>{layer.en}</small></div></header>
                    <div className={styles.overviewModuleGrid}>
                      {layer.moduleIds.map((moduleId) => {
                        const knowledgeModule = moduleById.get(moduleId);
                        const coverage = coverageByModule.get(moduleId);
                        if (!knowledgeModule || !coverage) return null;
                        return (
                          <button type="button" key={moduleId} onClick={() => selectFocus({ kind: "module", id: moduleId })} aria-label={`${knowledgeModule.zh}，${coverage.termCount} 个关联术语，${coverage.primaryTermCount} 个主要讲解术语`}>
                            <strong>{knowledgeModule.zh}</strong>
                            <span>{knowledgeModule.en}</span>
                            <small>{coverage.termCount} 关联术语 · {coverage.primaryTermCount} 主要讲解</small>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
              <p className={styles.overviewBoundary}>总览连线只表示两个模块共享至少 {overviewMinSharedTerms} 个已登记术语；点击任一模块查看完整一跳关系。</p>
            </>
          ) : (
            <>
              <header className={styles.graphStatus}>
                <div><span>{focus.kind === "module" ? "当前模块" : "当前术语"}</span><strong>{selectedTitle}</strong></div>
                <p aria-live="polite">显示 {neighbors.length} 条一跳关系</p>
              </header>
              <div className={styles.canvas} style={{ "--canvas-height": `${canvasHeight}px`, "--center-y": `${centerY}px` } as CSSProperties}>
            <svg className={styles.connectors} viewBox={`0 0 1000 ${canvasHeight}`} preserveAspectRatio="none" aria-hidden="true">
              {positions.map(({ neighbor, side, y }) => (
                <line
                  key={neighbor.key}
                  className={`${styles.edge} ${lineClassByType[neighbor.relationType] ?? ""}`}
                  x1="500"
                  y1={centerY}
                  x2={side === "left" ? 150 : 850}
                  y2={y + 29}
                />
              ))}
            </svg>

            <article className={styles.focusNode}>
              <span>{focus.kind === "module" ? "模块" : "术语"}</span>
              <strong>{selectedTitle}</strong>
              <small>{selectedSubtitle}</small>
            </article>

            <div className={styles.mobileNeighborGrid}>
              {positions.map(({ neighbor, side, y }) => (
                <button
                  type="button"
                  key={neighbor.key}
                  className={`${styles.neighborNode} ${lineClassByType[neighbor.relationType] ?? ""}`}
                  data-side={side}
                  style={{ "--node-y": `${y}px` } as CSSProperties}
                  onClick={() => selectFocus({ kind: neighbor.kind, id: neighbor.id })}
                >
                  <small>{relationTypes[neighbor.relationType]?.label}</small>
                  <strong>{neighbor.title}</strong>
                  <span>{neighbor.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
            </>
          )}
        </div>

        <aside className={styles.inspector} aria-label="选中节点详情">
          {viewMode === "overview" ? (
            <>
              <header><span>全局视图</span><h2>{modules.length} 模块总览</h2><p>{layers.length} 个知识层</p></header>
              <section className={styles.definition}><h3>当前覆盖</h3><p>{terms.length} 个术语已进入图谱；{overviewLinks.length} 条连线构成共享术语主干。模块卡片同时显示关联术语和主要讲解术语的准确数量。</p></section>
              <section className={styles.context}><h3>连线边界</h3><p>连线表示共享术语，不表示学习先后顺序或强制关系，也不代表全部可能联系。</p></section>
              <section className={styles.coverageWatch}>
                <h3>覆盖门禁</h3>
                {underModeledModules.length === 0 ? (
                  <p>全部 {modules.length} 个模块均达到完整覆盖门禁：每个模块至少 {minimumRelatedTerms} 个关联术语、{minimumPrimaryTerms} 个主要讲解术语。</p>
                ) : (
                  <>
                    <p>以下模块尚未达到每个模块至少 {minimumRelatedTerms} 个关联术语、{minimumPrimaryTerms} 个主要讲解术语的门禁。</p>
                    <ul>{underModeledModules.map((entry) => (
                      <li key={entry.moduleId}><button type="button" onClick={() => selectFocus({ kind: "module", id: entry.moduleId })}><span>{entry.module?.zh}</span><strong>{entry.termCount} / {entry.primaryTermCount}</strong></button></li>
                    ))}</ul>
                  </>
                )}
              </section>
            </>
          ) : (
            <>
          <header><span>选中{focus.kind === "module" ? "模块" : "术语"}</span><h2>{selectedTitle}</h2><p>{selectedSubtitle}</p></header>
          <section className={styles.definition}><h3>简介</h3><p>{selectedDescription}</p></section>
          {focus.kind === "module" ? (
            <section className={styles.context}><h3>所在位置</h3><p><strong>{selectedModule?.layerNo}</strong>{selectedModule?.layerName}</p></section>
          ) : (
            <section className={styles.context}><h3>主要归属</h3><button type="button" onClick={() => selectFocus({ kind: "module", id: selectedTerm?.primaryModuleId ?? "rag" })}>{moduleById.get(selectedTerm?.primaryModuleId ?? "")?.zh}</button></section>
          )}
          <section className={styles.relationSummary}>
            <h3>当前关系</h3>
            <div>{Object.entries(relationCounts).map(([typeId, count]) => <span key={typeId}><i className={lineClassByType[typeId]} />{relationTypes[typeId]?.label}<strong>{count}</strong></span>)}</div>
          </section>
          <section className={styles.relationDetails}>
            <h3>关系解释</h3>
            <ul>
              {neighbors.map((neighbor) => (
                <li key={`${neighbor.key}:detail`}>
                  <button type="button" onClick={() => selectFocus({ kind: neighbor.kind, id: neighbor.id })}>
                    <span>{relationTypes[neighbor.relationType]?.label}</span><strong>{neighbor.title}</strong><ArrowIcon />
                  </button>
                  <p>{neighbor.explanation}</p>
                </li>
              ))}
            </ul>
          </section>
          <nav className={styles.inspectorActions} aria-label="选中节点相关页面">
            {selectedModule ? <Link className={styles.primaryAction} href={selectedModule.href}>进入模块 <ArrowIcon /></Link> : null}
            {selectedTerm ? <Link className={styles.primaryAction} href={moduleById.get(selectedTerm.primaryModuleId)?.href ?? "/"}>进入主要模块 <ArrowIcon /></Link> : null}
            <Link href={`/glossary#term-${selectedTerm?.id ?? selectedModule?.id}`}>在术语库查看 <ArrowIcon /></Link>
          </nav>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
