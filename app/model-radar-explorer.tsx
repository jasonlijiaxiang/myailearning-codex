"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type Snapshot = {
  id: string;
  label: string;
  kind: string;
  asOf: string;
  models: readonly Model[];
};

type Model = {
  id: string;
  shortName: string;
  name: string;
  provider: string;
  family: string;
  openness: string;
  overall: number | null;
  intelligence: number | null;
  coding: number | null;
  agentic: number | null;
  finance: number | null;
  efficiency: number | null;
  tag: string;
  strengths: Readonly<Record<string, string>>;
  evidence: readonly string[];
  note: string;
  componentScores: Readonly<Record<string, number | null>>;
  benchmarkScores: Readonly<Record<string, number | null>>;
};

type Benchmark = {
  sourceId: string;
  shortTitle: string;
  title: string;
  kind: string;
  grade: string;
  note: string;
  href: string;
  scoreScale: {
    min: number;
    max: number;
    unit: string;
  };
  guide: {
    summary: string;
    what: string;
    usefulFor: string;
    limitation: string;
    readScore: string;
  };
};

type ModelRadarLocale = "zh" | "en";

const modelRadarCopy = {
  zh: {
    snapshot: "快照",
    currentOrder: "当前排序",
    selectorTitle: "按能力指数查看 Top 20",
    dateOptionsAria: "榜单日期",
    benchmarkOptionsAria: "模型 benchmark 选项",
    evidenceGrade: "证据等级",
    viewSource: "查看来源 ↗",
    collapseBenchmark: "收起 Benchmark 解释",
    expandBenchmark: "展开 Benchmark 解释",
    what: "测什么",
    usefulFor: "适合看什么",
    limitation: "不能代表什么",
    readScore: "如何读分数",
    rank: "排名",
    model: "模型",
    provider: "公司 / 机构",
    score: "得分",
    strength: "主要优势领域",
    caption: (benchmark: string, snapshot: string) => `Top 20 大模型在 ${benchmark} 的排名，当前快照为 ${snapshot}`,
    scoreCoverage: (count: number, total: number) => `当前快照有 ${count}/${total} 个模型的精确公开分数；其余显示为 —。`,
    noScoreCoverage: "当前快照没有与这些模型版本精确对应的公开分数，暂不填值。",
    modelLandscape: "查看模型格局方法边界 ↗",
    selectedModel: "已选模型",
    currentScore: "当前快照单项得分",
    indexComponents: "指数构成",
    evidenceCoverage: "证据覆盖",
    retention: "数据保留规则：",
    retentionSuffix: "。页面不会记录每周完整历史；以后接入动态数据时，优先保存同一模型版本、benchmark 版本和运行配置。",
  },
  en: {
    snapshot: "Snapshot",
    currentOrder: "Current order",
    selectorTitle: "View the top 20 by capability index",
    dateOptionsAria: "Ranking date",
    benchmarkOptionsAria: "Model benchmark options",
    evidenceGrade: "evidence grade",
    viewSource: "View source ↗",
    collapseBenchmark: "Collapse benchmark explanation",
    expandBenchmark: "Expand benchmark explanation",
    what: "What it measures",
    usefulFor: "What it is useful for",
    limitation: "What it does not establish",
    readScore: "How to read the score",
    rank: "Rank",
    model: "Model",
    provider: "Provider",
    score: "score",
    strength: "Primary signal",
    caption: (benchmark: string, snapshot: string) => `Top 20 models ranked by ${benchmark}; current snapshot: ${snapshot}`,
    scoreCoverage: (count: number, total: number) => `${count}/${total} models in this snapshot have an exact public score; the rest display —.`,
    noScoreCoverage: "No exact public score is available for these model versions in this snapshot, so no value is inferred.",
    modelLandscape: "Review the model-landscape method boundary ↗",
    selectedModel: "Selected model",
    currentScore: "score in this snapshot",
    indexComponents: "Index components",
    evidenceCoverage: "Evidence coverage",
    retention: "Data-retention rule: ",
    retentionSuffix: ". The page does not preserve every weekly history. When new dynamic data is added, retain the exact model version, benchmark version, and run configuration first.",
  },
} as const;

const benchmarkMarks: Record<string, string> = {
  "intelligence-index": "I",
  "coding-index": "C",
  "agentic-index": "A",
};

const benchmarkComponents: Record<string, readonly { id: string; label: string }[]> = {
  "coding-index": [
    { id: "terminal-bench-v21", label: "Terminal-Bench 2.1" },
    { id: "scicode", label: "SciCode" },
  ],
  "agentic-index": [
    { id: "gdpval-aa-v2", label: "GDPval-AA v2" },
    { id: "tau3-banking", label: "τ³-Banking" },
  ],
};

function scoreLabel(value: number | null) {
  if (value === null || value === undefined) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function scoreBarWidth(value: number | null, scale: Benchmark["scoreScale"]) {
  if (value === null || value === undefined || scale.max <= scale.min) return 0;
  return Math.min(100, Math.max(0, ((value - scale.min) / (scale.max - scale.min)) * 100));
}

function providerLabel(model: Model) {
  return model.provider.replace(" / ", " · ");
}

function RankingTableHeader({
  benchmarkTitle,
  headerRef,
  locale,
}: {
  benchmarkTitle?: string;
  headerRef?: React.Ref<HTMLTableSectionElement>;
  locale: ModelRadarLocale;
}) {
  const copy = modelRadarCopy[locale];
  return (
    <thead ref={headerRef}>
      <tr>
        <th scope="col">{copy.rank}</th>
        <th scope="col">{copy.model}</th>
        <th scope="col">{copy.provider}</th>
        <th scope="col">{benchmarkTitle} {copy.score}</th>
        <th scope="col">{copy.strength}</th>
      </tr>
    </thead>
  );
}

export function ModelRadarExplorer({
  snapshots,
  benchmarks,
  retention,
  locale = "zh",
  referencesHref = "/references",
  modelLandscapeHref = "/modules/model-landscape#qa-1",
}: {
  snapshots: readonly Snapshot[];
  benchmarks: readonly Benchmark[];
  retention: string;
  locale?: ModelRadarLocale;
  referencesHref?: string;
  modelLandscapeHref?: string;
}) {
  const copy = modelRadarCopy[locale];
  const [snapshotId, setSnapshotId] = useState(snapshots[0]?.id ?? "");
  const [selectedId, setSelectedId] = useState(snapshots[0]?.models[0]?.id ?? "");
  const [benchmarkId, setBenchmarkId] = useState(benchmarks[0]?.sourceId ?? "");
  const [openBenchmark, setOpenBenchmark] = useState("");
  const benchmarkSelectorRef = useRef<HTMLElement | null>(null);
  const tableHeaderRef = useRef<HTMLTableSectionElement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const stickyTableRef = useRef<HTMLTableElement | null>(null);
  const [benchmarkSelectorHeight, setBenchmarkSelectorHeight] = useState(0);
  const [tableHeaderHeight, setTableHeaderHeight] = useState(0);

  const snapshot = snapshots.find((item) => item.id === snapshotId) ?? snapshots[0];
  const activeBenchmark = benchmarks.find((item) => item.sourceId === benchmarkId) ?? benchmarks[0];
  const models = useMemo(
    () => [...(snapshot?.models ?? [])].sort((a, b) => {
      const aScore = a.benchmarkScores[benchmarkId] ?? null;
      const bScore = b.benchmarkScores[benchmarkId] ?? null;
      if (aScore === null && bScore === null) return 0;
      if (aScore === null) return 1;
      if (bScore === null) return -1;
      return bScore - aScore;
    }),
    [snapshot, benchmarkId],
  );
  const selected = models.find((item) => item.id === selectedId) ?? models[0];
  const selectedBenchmarkScore = selected?.benchmarkScores[benchmarkId] ?? null;
  const activeBenchmarkScoreCount = models.filter((item) => item.benchmarkScores[benchmarkId] !== null && item.benchmarkScores[benchmarkId] !== undefined).length;
  const activeScoreScale = activeBenchmark?.scoreScale ?? { min: 0, max: 100, unit: "%" };
  const isActiveBenchmarkOpen = activeBenchmark?.sourceId === openBenchmark;

  useEffect(() => {
    const element = benchmarkSelectorRef.current;
    const tableHeader = tableHeaderRef.current;
    if (!element || !tableHeader) return;

    const updateHeight = () => {
      const nextHeight = Math.ceil(element.getBoundingClientRect().height);
      setBenchmarkSelectorHeight((currentHeight) => currentHeight === nextHeight ? currentHeight : nextHeight);
      const nextTableHeaderHeight = Math.ceil(tableHeader.getBoundingClientRect().height);
      setTableHeaderHeight((currentHeight) => currentHeight === nextTableHeaderHeight ? currentHeight : nextTableHeaderHeight);
    };

    updateHeight();
    const selectorObserver = new ResizeObserver(updateHeight);
    const tableHeaderObserver = new ResizeObserver(updateHeight);
    selectorObserver.observe(element);
    tableHeaderObserver.observe(tableHeader);
    return () => {
      selectorObserver.disconnect();
      tableHeaderObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const scrollElement = tableScrollRef.current;
    const stickyTable = stickyTableRef.current;
    const actualTable = scrollElement?.querySelector(".modelPosterTable");
    if (!scrollElement || !stickyTable || !actualTable) return;

    const sourceCells = Array.from(actualTable.querySelectorAll("thead th"));
    const stickyCells = Array.from(stickyTable.querySelectorAll("thead th"));

    const syncHorizontalScroll = () => {
      stickyTable.style.width = `${actualTable.getBoundingClientRect().width}px`;
      stickyTable.style.tableLayout = "fixed";
      stickyCells.forEach((cell, index) => {
        const sourceCell = sourceCells[index];
        if (sourceCell) cell.style.width = `${sourceCell.getBoundingClientRect().width}px`;
      });
      stickyTable.style.transform = `translate3d(${-scrollElement.scrollLeft}px, 0, 0)`;
    };

    syncHorizontalScroll();
    scrollElement.addEventListener("scroll", syncHorizontalScroll, { passive: true });
    const tableObserver = new ResizeObserver(syncHorizontalScroll);
    tableObserver.observe(actualTable);
    return () => {
      scrollElement.removeEventListener("scroll", syncHorizontalScroll);
      tableObserver.disconnect();
    };
  }, [benchmarkId]);

  const selectSnapshot = (id: string) => {
    setSnapshotId(id);
    const nextSnapshot = snapshots.find((item) => item.id === id);
    if (nextSnapshot?.models[0]) setSelectedId(nextSnapshot.models[0].id);
  };

  const selectBenchmark = (id: string) => {
    setBenchmarkId(id);
    setOpenBenchmark("");
  };

  return (
    <div
      className="modelPosterExplorer"
      style={{
        "--model-poster-selector-height": `${benchmarkSelectorHeight}px`,
        ...(tableHeaderHeight > 0 ? { "--model-poster-table-header-height": `${tableHeaderHeight}px` } : {}),
      } as CSSProperties}
    >
      <div className="modelPosterMetaLine">
        <span className="modelPosterDemoBadge">Artificial Analysis · v4.1</span>
        <span>{copy.snapshot} · {snapshot?.label} · {copy.currentOrder} · {activeBenchmark?.shortTitle}</span>
      </div>

      <section ref={benchmarkSelectorRef} className="modelPosterBenchmarkSelector" aria-labelledby="benchmark-selector-title">
        <div className="modelPosterBenchmarkSelectorIntro">
          <h2 id="benchmark-selector-title">{copy.selectorTitle}</h2>
          <div className="modelPosterDateOptions" role="group" aria-label={copy.dateOptionsAria}>
            {snapshots.map((item) => (
              <button
                className={snapshot?.id === item.id ? "active" : ""}
                key={item.id}
                type="button"
                aria-pressed={snapshot?.id === item.id}
                onClick={() => selectSnapshot(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="modelPosterBenchmarkTabs" role="group" aria-label={copy.benchmarkOptionsAria}>
          {benchmarks.map((benchmark) => (
            <button
              aria-pressed={benchmark.sourceId === benchmarkId}
              className={benchmark.sourceId === benchmarkId ? "active" : ""}
              key={benchmark.sourceId}
              type="button"
              onClick={() => selectBenchmark(benchmark.sourceId)}
            >
              {benchmark.shortTitle}
            </button>
          ))}
        </div>
        {activeBenchmark && (
          <div className="modelPosterActiveBenchmark" aria-live="polite">
            <span className="modelPosterBenchmarkMark" aria-hidden="true">{benchmarkMarks[activeBenchmark.sourceId] ?? "B"}</span>
            <div><strong>{activeBenchmark.shortTitle}</strong><small>{activeBenchmark.kind} · {copy.evidenceGrade} {activeBenchmark.grade} · {activeBenchmark.scoreScale.unit}</small></div>
            <p>{activeBenchmark.guide.summary}</p>
            <div className="modelPosterActiveBenchmarkActions">
              <Link href={`${referencesHref}#source-${activeBenchmark.sourceId}`}>{copy.viewSource}</Link>
              <button
                className="modelPosterBenchmarkExpand"
                type="button"
                aria-expanded={isActiveBenchmarkOpen}
                aria-label={isActiveBenchmarkOpen ? copy.collapseBenchmark : copy.expandBenchmark}
                onClick={() => setOpenBenchmark(isActiveBenchmarkOpen ? "" : activeBenchmark.sourceId)}
              >
                <i aria-hidden="true">{isActiveBenchmarkOpen ? "⌃" : "⌄"}</i>
              </button>
            </div>
            {isActiveBenchmarkOpen && (
              <div className="modelPosterActiveBenchmarkDetails">
                <div><strong>{copy.what}</strong><p>{activeBenchmark.guide.what}</p></div>
                <div><strong>{copy.usefulFor}</strong><p>{activeBenchmark.guide.usefulFor}</p></div>
                <div><strong>{copy.limitation}</strong><p>{activeBenchmark.guide.limitation}</p></div>
                <div><strong>{copy.readScore}</strong><p>{activeBenchmark.guide.readScore}</p></div>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="modelPosterRankingLayout">
        <div className="modelPosterTableColumn">
          <div className="modelPosterTableWrap">
            <div className="modelPosterTableStickyHead" aria-hidden="true">
              <div className="modelPosterTableStickyHeadCover" />
              <div className="modelPosterTableStickyHeadViewport">
                <table ref={stickyTableRef} className="modelPosterTable modelPosterStickyTable">
                  <RankingTableHeader benchmarkTitle={activeBenchmark?.shortTitle} locale={locale} />
                </table>
              </div>
            </div>
            <div ref={tableScrollRef} className="modelPosterTableScroll">
              <table className="modelPosterTable">
                <caption>{copy.caption(activeBenchmark?.shortTitle ?? "", snapshot?.label ?? "")}</caption>
                <RankingTableHeader headerRef={tableHeaderRef} benchmarkTitle={activeBenchmark?.shortTitle} locale={locale} />
                <tbody>
                  {models.map((model, index) => {
                    const score = model.benchmarkScores[benchmarkId] ?? null;
                    return (
                      <tr
                        className={selected?.id === model.id ? "selected" : ""}
                        key={model.id}
                      >
                        <td className={`modelPosterRank rank-${index + 1}`}>
                          {index < 3 ? <span className="modelPosterMedal">{index + 1}</span> : index + 1}
                        </td>
                        <th scope="row">
                          <button type="button" aria-pressed={selected?.id === model.id} onClick={() => setSelectedId(model.id)}>{model.name}</button>
                          <small>{model.openness}</small>
                        </th>
                        <td className="modelPosterProvider">{providerLabel(model)}</td>
                        <td className="modelPosterScoreCell">
                          <strong>{scoreLabel(score)}</strong>
                          <span className="modelPosterScoreBar"><i style={{ width: `${scoreBarWidth(score, activeScoreScale)}%` }} /></span>
                        </td>
                        <td className="modelPosterStrength"><span>{model.strengths[benchmarkId] ?? model.tag}</span>{model.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="modelPosterTableFoot">
              <span>{activeBenchmarkScoreCount > 0 ? copy.scoreCoverage(activeBenchmarkScoreCount, models.length) : copy.noScoreCoverage}</span>
              <Link href={modelLandscapeHref}>{copy.modelLandscape}</Link>
            </div>
          </div>
        </div>

        {selected && activeBenchmark && (
          <aside className="modelPosterSelected" aria-live="polite">
            <div className="modelPosterSelectedHeader"><span>{copy.selectedModel}</span></div>
            <h3>{selected.name}</h3>
            <p className="modelPosterSelectedIdentity">{selected.provider} · {selected.tag}</p>
            <div className="modelPosterSelectedScore"><span>{activeBenchmark.shortTitle}</span><strong>{scoreLabel(selectedBenchmarkScore)}</strong><small>{copy.currentScore}</small></div>
            <div className="modelPosterSelectedMetrics"><span>Intelligence <b>{scoreLabel(selected.intelligence)}</b></span><span>Coding <b>{scoreLabel(selected.coding)}</b></span><span>Agentic <b>{scoreLabel(selected.agentic)}</b></span></div>
            {benchmarkComponents[benchmarkId] && (
              <div className="modelPosterSelectedBreakdown">
                <span>{copy.indexComponents}</span>
                {benchmarkComponents[benchmarkId].map((component) => <b key={component.id}>{component.label} <em>{scoreLabel(selected.componentScores[component.id] ?? null)}</em></b>)}
              </div>
            )}
            <div className="modelPosterEvidence"><span>{copy.evidenceCoverage}</span>{selected.evidence.map((item) => <b key={item}>{item}</b>)}</div>
            <p className="modelPosterSelectedNote">{selected.note}</p>
          </aside>
        )}
      </div>

      <div className="modelPosterRetentionNote"><strong>{copy.retention}</strong>{retention}{copy.retentionSuffix}</div>
    </div>
  );
}
