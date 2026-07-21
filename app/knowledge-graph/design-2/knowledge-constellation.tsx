"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";

import type { GraphLayer, GraphModule, GraphRelationType, GraphTerm } from "../graph-types";
import styles from "./knowledge-constellation.module.css";

type Relation = { id: string; from: string; to: string; type: string; explanation: string; direction: string; status: string };
type Focus = { kind: "module" | "term"; id: string };
type Neighbor = {
  key: string;
  kind: Focus["kind"];
  id: string;
  title: string;
  subtitle: string;
  relationType: string;
  explanation: string;
};
type Point = Neighbor & { x: number; y: number };

const DEFAULT_FOCUS: Focus = { kind: "module", id: "rag" };
const layerColors = ["#6ff4bd", "#47cfff", "#5b9cff", "#8177ff", "#b871ff", "#e76dc7", "#ffad46"];

function focusKey(focus: Focus) {
  return `${focus.kind}:${focus.id}`;
}

function splitModuleTitle(title: string) {
  const [lead, detail] = title.split(" · ", 2);
  return detail ? { lead, detail } : { lead: title, detail: "" };
}

function edgePath(point: Pick<Point, "x" | "y">) {
  const controlX = 500 + (point.x - 500) * .48;
  const controlY = 350 + (point.y - 350) * .35 - 22;
  return `M500 350 Q${controlX.toFixed(3)} ${controlY.toFixed(3)} ${point.x.toFixed(3)} ${point.y.toFixed(3)}`;
}

function parseFocus(value: string | null, modules: Map<string, GraphModule>, terms: Map<string, GraphTerm>): Focus | null {
  if (!value) return null;
  const [kind, id] = value.split(":");
  if (kind === "module" && modules.has(id)) return { kind, id };
  if (kind === "term" && terms.has(id)) return { kind, id };
  return null;
}

function Icon({ name }: { name: "plus" | "minus" | "fit" | "reset" | "pause" | "play" | "search" | "layers" }) {
  const paths = {
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <><path d="M5 12h14" /></>,
    fit: <><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M8 20H4v-4" /></>,
    reset: <><path d="M20 11a8 8 0 1 1-2.3-5.7L20 8" /><path d="M20 3v5h-5" /></>,
    pause: <><path d="M9 5v14M15 5v14" /></>,
    play: <><path d="m8 5 11 7-11 7Z" /></>,
    search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export function KnowledgeConstellation({
  layers,
  modules,
  terms,
  relations,
  relationTypes,
  scalePolicy,
}: {
  layers: readonly GraphLayer[];
  modules: readonly GraphModule[];
  terms: readonly GraphTerm[];
  relations: readonly Relation[];
  relationTypes: Readonly<Record<string, GraphRelationType>>;
  scalePolicy: Readonly<{ maxActiveNodes: number; maxActiveEdges: number }>;
}) {
  const moduleById = useMemo(() => new Map(modules.map((knowledgeModule) => [knowledgeModule.id, knowledgeModule])), [modules]);
  const termById = useMemo(() => new Map(terms.map((term) => [term.id, term])), [terms]);
  const [focus, setFocus] = useState<Focus>(DEFAULT_FOCUS);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [motionPaused, setMotionPaused] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("zh-CN"));

  useEffect(() => {
    function syncFocusFromUrl() {
      const next = parseFocus(new URLSearchParams(window.location.search).get("node"), moduleById, termById);
      if (next) setFocus(next);
    }
    queueMicrotask(syncFocusFromUrl);
    window.addEventListener("popstate", syncFocusFromUrl);
    return () => window.removeEventListener("popstate", syncFocusFromUrl);
  }, [moduleById, termById]);

  const selectFocus = useCallback((next: Focus) => {
    setFocus(next);
    setQuery("");
    setRailOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("node", focusKey(next));
    window.history.replaceState({}, "", url);
  }, []);

  const searchResults = useMemo(() => {
    if (!deferredQuery) return [];
    const moduleMatches = modules.flatMap((module) => `${module.zh} ${module.en} ${module.summary}`.toLocaleLowerCase("zh-CN").includes(deferredQuery)
      ? [{ kind: "module" as const, id: module.id, title: module.zh, subtitle: module.en }]
      : []);
    const termMatches = terms.flatMap((term) => `${term.zh} ${term.en} ${term.abbr ?? ""} ${term.description}`.toLocaleLowerCase("zh-CN").includes(deferredQuery)
      ? [{ kind: "term" as const, id: term.id, title: term.zh, subtitle: term.abbr ?? term.en }]
      : []);
    return [...moduleMatches, ...termMatches].slice(0, 10);
  }, [deferredQuery, modules, terms]);

  const neighbors = useMemo<Neighbor[]>(() => {
    if (focus.kind === "module") {
      return terms.flatMap((term) => {
        if (!term.moduleIds.includes(focus.id) || term.id === focus.id) return [];
        const relationType = term.primaryModuleId === focus.id ? "primary-owner" : "contextual-use";
        const owner = moduleById.get(term.primaryModuleId);
        return [{
          key: `term:${term.id}`,
          kind: "term" as const,
          id: term.id,
          title: term.abbr ?? term.zh,
          subtitle: term.abbr ? term.zh : term.en,
          relationType,
          explanation: relationType === "primary-owner"
            ? `${moduleById.get(focus.id)?.zh} 是“${term.zh}”的主要归属模块。`
            : `${moduleById.get(focus.id)?.zh} 在局部判断中使用“${term.zh}”；主要解释位于“${owner?.zh ?? "其归属模块"}”。`,
        }];
      }).slice(0, scalePolicy.maxActiveNodes - 1);
    }
    const selected = termById.get(focus.id);
    if (!selected) return [];
    const moduleNeighbors: Neighbor[] = selected.moduleIds.flatMap((id) => {
      const knowledgeModule = moduleById.get(id);
      if (!knowledgeModule) return [];
      const relationType = selected.primaryModuleId === id ? "primary-owner" : "contextual-use";
      return [{
        key: `module:${id}`,
        kind: "module",
        id,
        title: knowledgeModule.zh,
        subtitle: knowledgeModule.en,
        relationType,
        explanation: relationType === "primary-owner" ? `“${knowledgeModule.zh}”是该知识点的主要归属模块。` : `“${knowledgeModule.zh}”在局部判断中使用该知识点。`,
      }];
    });
    const semanticNeighbors: Neighbor[] = relations.flatMap((relation) => {
      if (relation.from !== focus.id && relation.to !== focus.id) return [];
      const id = relation.from === focus.id ? relation.to : relation.from;
      const term = termById.get(id);
      if (!term || selected.moduleIds.includes(id)) return [];
      return [{ key: `term:${id}:${relation.type}`, kind: "term", id, title: term.abbr ?? term.zh, subtitle: term.abbr ? term.zh : term.en, relationType: relation.type, explanation: relation.explanation }];
    });
    return [...moduleNeighbors, ...semanticNeighbors].slice(0, scalePolicy.maxActiveNodes - 1);
  }, [focus, moduleById, relations, scalePolicy.maxActiveNodes, termById, terms]);

  const points = useMemo<Point[]>(() => neighbors.map((neighbor, index) => {
    const count = neighbors.length;
    const innerCount = Math.min(count, 10);
    const ringIndex = index < innerCount ? 0 : 1;
    const ringOffset = ringIndex ? innerCount : 0;
    const ringCount = ringIndex ? count - innerCount : innerCount;
    const angle = -Math.PI / 2 + ((index - ringOffset) / Math.max(ringCount, 1)) * Math.PI * 2 + (ringIndex ? Math.PI / Math.max(ringCount, 1) : 0);
    const radiusX = ringIndex ? 410 : 285;
    const radiusY = ringIndex ? 275 : 205;
    return {
      ...neighbor,
      x: Math.round((500 + Math.cos(angle) * radiusX) * 1000) / 1000,
      y: Math.round((350 + Math.sin(angle) * radiusY) * 1000) / 1000,
    };
  }), [neighbors]);

  const selectedModule = focus.kind === "module" ? moduleById.get(focus.id) : undefined;
  const selectedTerm = focus.kind === "term" ? termById.get(focus.id) : undefined;
  const selectedTitle = selectedModule?.zh ?? selectedTerm?.zh ?? focus.id;
  const selectedSubtitle = selectedModule?.en ?? selectedTerm?.en ?? "";
  const selectedDescription = selectedModule?.summary ?? selectedTerm?.description ?? "";
  const primaryModule = selectedModule ?? moduleById.get(selectedTerm?.primaryModuleId ?? "");
  const selectedModuleTitle = selectedModule ? splitModuleTitle(selectedModule.zh) : null;
  const activeEdgeCount = Math.min(points.length, scalePolicy.maxActiveEdges);

  return (
    <section className={`${styles.explorer} ${motionPaused ? styles.paused : ""}`} aria-label="动态知识星图">
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <label className={styles.search}>
            <span className={styles.srOnly}>搜索模块或术语</span>
            <Icon name="search" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索模块或术语" />
          </label>
          {deferredQuery ? (
            <div className={styles.searchResults} aria-label="搜索结果">
              {searchResults.length ? searchResults.map((result) => (
                <button type="button" key={`${result.kind}:${result.id}`} onClick={() => selectFocus({ kind: result.kind, id: result.id })}>
                  <span>{result.kind === "module" ? "模块" : "术语"}</span><strong>{result.title}</strong><small>{result.subtitle}</small>
                </button>
              )) : <p>没有找到匹配的模块或术语。</p>}
            </div>
          ) : null}
        </div>
        <button type="button" className={styles.modulePicker} aria-expanded={railOpen} onClick={() => setRailOpen((value) => !value)}><Icon name="layers" />选择模块</button>
        <p className={styles.scopeNote}>聚焦显示 {activeEdgeCount} 条一跳关系；未显示不代表没有联系。</p>
      </div>

      <div className={styles.workspace}>
        <aside className={`${styles.rail} ${railOpen ? styles.railOpen : ""}`} aria-label="知识层与模块">
          <header><strong>知识层与模块</strong><button type="button" onClick={() => setRailOpen(false)} aria-label="关闭模块列表">×</button></header>
          {layers.map((layer, layerIndex) => (
            <section key={layer.no} style={{ "--layer-color": layerColors[layerIndex] } as CSSProperties}>
              <h2><span>{layer.no}</span>{layer.name}</h2>
              {layer.moduleIds.map((id) => {
                const knowledgeModule = moduleById.get(id);
                if (!knowledgeModule) return null;
                return <button type="button" key={id} aria-pressed={focus.kind === "module" && focus.id === id} onClick={() => selectFocus({ kind: "module", id })}><i />{knowledgeModule.zh}<small>{knowledgeModule.en}</small></button>;
              })}
            </section>
          ))}
        </aside>

        <div className={styles.canvasShell}>
          <div className={styles.canvas} style={{ "--graph-scale": zoom } as CSSProperties}>
            <div className={styles.starfield} aria-hidden="true" />
            <div className={styles.graphPlane}>
              <svg className={styles.edges} viewBox="0 0 1000 700" role="img" aria-label={`${selectedTitle} 的 ${activeEdgeCount} 条一跳关系`}>
                <title>{`${selectedTitle} 的明确一跳关系`}</title>
                <desc>选择节点后仅点亮与它直接相连的模块或术语，其他模块作为背景位置参考。</desc>
                {points.slice(0, scalePolicy.maxActiveEdges).map((point) => (
                  <g key={point.key} className={styles[`edge_${point.relationType}`] ?? ""}>
                    <path d={edgePath(point)} />
                    <circle className={styles.particle} r="3"><animateMotion dur={`${(2.2 + (point.x % 4) * .25).toFixed(2)}s`} repeatCount="indefinite" path={edgePath(point)} /></circle>
                  </g>
                ))}
              </svg>

              {modules.map((module, index) => {
                const angle = -Math.PI / 2 + (index / modules.length) * Math.PI * 2;
                const x = 500 + Math.cos(angle) * 458;
                const y = 350 + Math.sin(angle) * 315;
                const active = focus.kind === "module" && focus.id === module.id;
                return <button type="button" key={module.id} className={`${styles.ambientModule} ${active ? styles.ambientActive : ""}`} style={{ "--x": `${(x / 10).toFixed(3)}%`, "--y": `${(y / 7).toFixed(3)}%`, "--layer-color": layerColors[Math.max(0, Number(module.layerNo) - 1)] } as CSSProperties} onClick={() => selectFocus({ kind: "module", id: module.id })} aria-label={`模块：${module.zh}`}><i /><span>{module.zh}</span></button>;
              })}

              {points.map((point, index) => (
                <button type="button" key={point.key} className={`${styles.node} ${styles[`node_${point.relationType}`] ?? ""}`} style={{ "--x": `${(point.x / 10).toFixed(3)}%`, "--y": `${(point.y / 7).toFixed(3)}%`, "--delay": `${Math.min(index * 35, 420)}ms` } as CSSProperties} onClick={() => selectFocus({ kind: point.kind, id: point.id })}>
                  <small>{relationTypes[point.relationType]?.label}</small><strong>{point.title}</strong><span>{point.subtitle}</span>
                </button>
              ))}

              <article className={styles.focusNode} aria-live="polite">
                <span>{focus.kind === "module" ? "模块" : "术语"}</span>
                <strong>
                  {selectedModuleTitle ? (
                    <><span className={styles.moduleTitleLead}>{selectedModuleTitle.lead}</span><span className={styles.moduleTitleDetail}>{selectedModuleTitle.detail}</span></>
                  ) : selectedTitle}
                </strong>
                <small>{selectedSubtitle}</small>
                {selectedModule ? <Link className={styles.focusAction} href={selectedModule.href}>进入模块 <span aria-hidden="true">→</span></Link> : null}
              </article>
            </div>
          </div>

          <div className={styles.canvasControls} aria-label="画布控制">
            <button type="button" onClick={() => setZoom((value) => Math.min(1.2, +(value + .1).toFixed(1)))} aria-label="放大"><Icon name="plus" /></button>
            <button type="button" onClick={() => setZoom((value) => Math.max(.8, +(value - .1).toFixed(1)))} aria-label="缩小"><Icon name="minus" /></button>
            <button type="button" onClick={() => setZoom(1)} aria-label="适应画布"><Icon name="fit" /></button>
            <button type="button" onClick={() => { setZoom(1); selectFocus(DEFAULT_FOCUS); }} aria-label="重置视图"><Icon name="reset" /></button>
            <button type="button" aria-pressed={motionPaused} onClick={() => setMotionPaused((value) => !value)} aria-label={motionPaused ? "继续动画" : "暂停动画"}><Icon name={motionPaused ? "play" : "pause"} /></button>
          </div>

          <div className={styles.legend} aria-label="关系图例">
            {Object.entries(relationTypes).map(([id, type]) => <span key={id}><i className={styles[`legend_${id}`] ?? ""} />{type.label}</span>)}
          </div>
        </div>

        <aside className={styles.inspector} aria-label="选中节点详情">
          <div className={styles.handle} aria-hidden="true" />
          <header><span>选中{focus.kind === "module" ? "模块" : "术语"}</span><h2>{selectedTitle}</h2><p>{selectedSubtitle}</p></header>
          <p className={styles.description}>{selectedDescription}</p>
          <div className={styles.meta}><span>主要归属</span><strong>{primaryModule?.zh}</strong><span>当前显示</span><strong>{activeEdgeCount} 条关系</strong></div>
          <section><h3>关系解释</h3><ul>{neighbors.map((neighbor) => <li key={`${neighbor.key}:detail`}><button type="button" onClick={() => selectFocus({ kind: neighbor.kind, id: neighbor.id })}><span>{relationTypes[neighbor.relationType]?.label}</span><strong>{neighbor.title}</strong></button><p>{neighbor.explanation}</p></li>)}</ul></section>
          <nav>
            <Link href={primaryModule?.href ?? "/"}>进入主要模块</Link>
            <Link href={`/glossary#term-${selectedTerm?.id ?? selectedModule?.id}`}>在术语库查看</Link>
          </nav>
        </aside>
      </div>
    </section>
  );
}
