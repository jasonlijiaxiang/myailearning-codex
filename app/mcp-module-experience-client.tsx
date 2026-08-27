"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { formatModuleUpdatedAt, formatQuestionAddedAt } from "./content-update-metadata.mjs";
import { DenseModuleReadingModes } from "./dense-module-reading-modes";
import { ReadingProgress } from "./fieldbook-interactions";
import { UnifiedModuleHero } from "./unified-module-hero";
import styles from "./mcp-module-experience.module.css";

type SourceInfo = {
  grade: string;
  kind: string;
  shortTitle: string;
  title: string;
  note: string;
  verifiedAt: string;
  href: string;
};

type SourceRef = { sourceId: string; supports: string };

type QaItem = {
  q: string;
  a: string;
  depth: string;
  ask: string;
  tag: string;
  basis: string;
  evidence: readonly SourceRef[];
  addedAt?: string;
};

type DeepDiveItem = {
  name: string;
  en?: string;
  mechanism: string;
  decision: string;
  boundary?: string;
};

type DeepDiveBlock = {
  kind: string;
  eyebrow: string;
  title: string;
  intro: string;
  items: readonly DeepDiveItem[];
  sourceIds: readonly string[];
  columnLabels?: {
    name: string;
    mechanism: string;
    decision: string;
    boundary: string;
  };
};

export type McpExperienceData = {
  module: { zh: string; en: string; layerName: string; titleId: string; updatedAt: string | null; knowledgeView: string };
  terms: ReadonlyArray<{ id: string; zh: string; en: string; description: string }>;
  definition: string;
  position: string;
  principleTitle: string;
  principles: ReadonlyArray<{
    zh: string;
    en: string;
    explanation: string;
    decision: string;
  }>;
  decisions: ReadonlyArray<{
    question: string;
    signal: string;
    recommendation: string;
    boundary: string;
  }>;
  criticalBoundary: string;
  cloudHooks: ReadonlyArray<{
    stage: string;
    services: string;
    value: string;
    discover: string;
  }>;
  qa: readonly QaItem[];
  evidenceCards: ReadonlyArray<{
    metric: string;
    title: string;
    finding: string;
    boundary: string;
    sourceId: string;
    accent?: boolean;
  }>;
  deepDives: readonly DeepDiveBlock[];
  curriculum: {
    lead: string;
    chapters: ReadonlyArray<{
      title: string;
      en: string;
      explanation: string;
      decision: string;
      boundary: string;
      sourceIds: readonly string[];
    }>;
  };
  learning: {
    outcomes: readonly string[];
    route: ReadonlyArray<{ title: string; learn: string; checkpoint: string }>;
    labs: ReadonlyArray<{
      title: string;
      scenario: string;
      tasks: readonly string[];
      deliverable: string;
      acceptance: string;
      sourceIds: readonly string[];
    }>;
  };
  sources: Record<string, SourceInfo>;
};

type QaCategory = "version" | "authorization" | "supply" | "failure" | "tasks";

function ModuleUpdatedAt({ value }: { value?: string }) {
  const label = formatModuleUpdatedAt(value);
  return label && value ? <span className="moduleUpdatedAt"> · <time dateTime={value}>{label}</time></span> : null;
}

function QuestionAddedAt({ value }: { value?: string }) {
  const label = formatQuestionAddedAt(value);
  return label && value ? <time className="questionAddedAt" dateTime={value}>{label}</time> : null;
}

const QA_CATEGORIES: ReadonlyArray<{ id: QaCategory; label: string; tags: readonly string[] }> = [
  { id: "version", label: "版本与边界", tags: ["协议边界", "选型与锁定", "契约版本", "能力发现"] },
  { id: "authorization", label: "授权", tags: ["身份授权", "安全边界", "授权链", "能力分权"] },
  { id: "supply", label: "供应链", tags: ["供应链安全", "平台治理", "Server 供应链"] },
  { id: "failure", label: "错误与结果", tags: ["错误语义", "结果注入"] },
  { id: "tasks", label: "长任务", tags: ["长任务"] },
];

function scrollHashTargetIntoView(hash: string) {
  const target = document.getElementById(hash.replace(/^#/, ""));
  if (!target) return;
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  target.scrollIntoView({ block: "start" });
  root.style.scrollBehavior = previousBehavior;
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h13M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SourceDisclosure({
  sourceIds,
  sources,
  label = "查看机制依据",
}: {
  sourceIds: readonly string[];
  sources: Record<string, SourceInfo>;
  label?: string;
}) {
  const uniqueIds = [...new Set(sourceIds)];
  if (uniqueIds.length === 0) return null;

  return (
    <details className={styles.sourceDisclosure}>
      <summary>{label}<span>{uniqueIds.length} 项</span></summary>
      <div className={styles.sourceList}>
        {uniqueIds.map((sourceId) => {
          const source = sources[sourceId];
          if (!source) return null;
          return (
            <article key={sourceId}>
              <div><span>{source.grade} · {source.kind}</span><time dateTime={source.verifiedAt}>{source.verifiedAt}</time></div>
              <strong>{source.shortTitle}</strong>
              <p>{source.note}</p>
              <a href={source.href} target="_blank" rel="noreferrer">打开原始来源 <ArrowIcon /></a>
            </article>
          );
        })}
      </div>
    </details>
  );
}

function QaPreview({ item, index, sources, anchorId }: { item: QaItem; index: number; sources: Record<string, SourceInfo>; anchorId?: string }) {
  return (
    <article className={styles.qaPreview} id={anchorId}>
      <header>
        <span>Q{String(index + 1).padStart(2, "0")}</span>
        <div><small>{item.tag}</small><h4>{item.q}</h4><QuestionAddedAt value={item.addedAt} /></div>
      </header>
      <p className={styles.qaLead}>{item.a}</p>
      <p className={styles.qaAsk}><strong>现场可追问</strong>{item.ask}</p>
      <details className={styles.mechanismDisclosure}>
        <summary>展开技术机制与适用范围</summary>
        <p>{item.depth}</p>
        <strong>{item.basis}</strong>
        <SourceDisclosure sourceIds={item.evidence.map((evidence) => evidence.sourceId)} sources={sources} label="查看本题依据" />
      </details>
    </article>
  );
}

function DeepDiveView({ block, sources }: { block: DeepDiveBlock; sources: Record<string, SourceInfo> }) {
  const labels = block.columnLabels ?? {
    name: "对象",
    mechanism: "工作机制",
    decision: "方案判断",
    boundary: "不能推导",
  };

  return (
    <section className={styles.deepDive} data-quality-section="deep-dive">
      <header><span>{block.eyebrow}</span><h3>{block.title}</h3><p>{block.intro}</p></header>
      <div className={styles.deepDiveTable} role="table" aria-label={block.title}>
        <div className={styles.deepDiveHead} role="row">
          <strong role="columnheader">{labels.name}</strong>
          <strong role="columnheader">{labels.mechanism}</strong>
          <strong role="columnheader">{labels.decision}</strong>
          <strong role="columnheader">{labels.boundary}</strong>
        </div>
        {block.items.map((item, index) => (
          <div className={styles.deepDiveRow} role="row" key={item.name}>
            <div role="cell"><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.name}</strong>{item.en ? <small>{item.en}</small> : null}</div>
            <p role="cell">{item.mechanism}</p>
            <p role="cell">{item.decision}</p>
            <p role="cell" className={styles.riskCell}>{item.boundary}</p>
          </div>
        ))}
      </div>
      <SourceDisclosure sourceIds={block.sourceIds} sources={sources} />
    </section>
  );
}

function QuickView({ data }: { data: McpExperienceData }) {
  const [selectedDecision, setSelectedDecision] = useState(0);
  const decision = data.decisions[selectedDecision];
  const versionChapter = data.curriculum.chapters[2];
  const versionMarker = "；2025-11-25";
  const [currentVersionText, oldVersionRemainder] = versionChapter.explanation.split(versionMarker);
  const oldVersionText = oldVersionRemainder ? `2025-11-25${oldVersionRemainder}` : versionChapter.explanation;

  return (
    <div className={styles.modeContent}>
      <div className="mcpArchitectureExplorer">
      <section className={`focusedNarrative ${styles.sectionBand}`} id="principle" data-quality-section="principle" data-knowledge-explorer="interactive" data-knowledge-view={data.module.knowledgeView}>
        <span className={styles.anchorAlias} id="mcp-decisions" />
        <header className={styles.sectionHeader}><span>01</span><div><h2>MCP 的复用价值与四方责任</h2><p>机制速览 · MCP 协议边界：只有跨客户端复用和重复适配成本高于 Server 运营与治理成本时，才值得引入；单应用的少量稳定 API 继续用直接函数调用。</p></div></header>
        <div className={styles.termLedger} aria-label="MCP 核心术语">
          {data.terms.map((term) => <article key={term.id}><strong>{term.zh}</strong><small>{term.en}</small><p>{term.description}</p></article>)}
        </div>
        <div className={styles.protocolPrimer}>
          <p><strong>原语控制：</strong>Tool 由模型控制调用，Resource 由应用选择装配，Prompt 由用户主动选择；Tool 也可以是只读查询，读写与副作用必须另行分级。</p>
          <ol aria-label="一次工具调用的典型路径"><li>发现 Server 与能力</li><li>选择必要原语</li><li>核对身份与授权</li><li>执行并回读权威结果</li></ol>
          <p><strong>连接契约：</strong>版本、能力元数据与结构化消息负责互操作，业务系统继续负责真实授权与事务结果。</p>
        </div>
        <div className="focusedDecisionLedger">
          <h3 className={styles.decisionTitle}>方案判断</h3>
          <div className={styles.decisionWorkbench}>
          <nav aria-label="MCP 方案判断">
            {data.decisions.map((item, index) => (
              <button aria-pressed={selectedDecision === index} key={item.question} onClick={() => setSelectedDecision(index)} type="button">
                <span>{String(index + 1).padStart(2, "0")}</span>{item.question}
              </button>
            ))}
          </nav>
          <article>
            <span>判断信号</span><p>{decision.signal}</p>
            <span>建议</span><strong>{decision.recommendation}</strong>
            <span>边界</span><p className={styles.riskText}>{decision.boundary}</p>
          </article>
          </div>
        </div>
      </section>
      </div>

      <section className={styles.sectionBand} id="mcp-version">
        <header className={styles.sectionHeader}><span>02</span><div><h2>{versionChapter.title}</h2><p>{versionChapter.decision}</p></div></header>
        <div className={styles.versionCompare}>
          <article className={styles.currentVersion}><span>当前正式版</span><h3>2026-07-28</h3><p>{currentVersionText}</p></article>
          <article><span>旧版迁移对照</span><h3>2025-11-25</h3><p>{oldVersionText}</p></article>
        </div>
        <p className={styles.fullBoundary}><strong>不能混用</strong>{versionChapter.boundary}</p>
        <SourceDisclosure sourceIds={versionChapter.sourceIds} sources={data.sources} label="查看双版本依据" />
      </section>

      <section className={styles.sectionBand} id="mcp-principles">
        <header className={styles.sectionHeader}><span>03</span><div><h2>{data.principleTitle}</h2><p>速查只保留决策句；完整机制与来源进入系统学习。</p></div></header>
        <div className={styles.principleGrid}>
          {data.principles.map((item, index) => (
            <article key={item.zh}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.zh}</h3><small>{item.en}</small><p>{item.decision}</p></article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChapterSupplements({ chapterNo, data }: { chapterNo: number; data: McpExperienceData }) {
  const deepDive = chapterNo === 2 ? data.deepDives[1] : chapterNo === 4 ? data.deepDives[2] : chapterNo === 5 ? data.deepDives[0] : undefined;

  if (!deepDive) return null;
  return (
    <div className={styles.chapterSupplements}>
      <div data-adaptive-visual={chapterNo === 5 ? "sequence" : "matrix"}><DeepDiveView block={deepDive} sources={data.sources} /></div>
    </div>
  );
}

function LearnView({ data }: { data: McpExperienceData }) {
  return (
    <div className={styles.modeContent}>
      <section className={styles.learningRoute} id="study-guide" data-quality-section="study-guide">
        <div className={styles.outcomes}>
          <h2>学习产出</h2>
          <ol>{data.learning.outcomes.map((outcome, index) => <li key={outcome}><span>{String(index + 1).padStart(2, "0")}</span>{outcome}</li>)}</ol>
        </div>
        <div className={styles.routeSteps}>
          <h2>学习路线</h2>
          {data.learning.route.map((step, index) => (
            <article key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.learn}</p><strong>{step.checkpoint}</strong></article>
          ))}
        </div>
      </section>

      <section className={styles.curriculumIntro} id="curriculum" data-quality-section="curriculum">
        <h2>{data.curriculum.chapters.length} 章完整知识地图</h2><p>{data.curriculum.lead}</p>
      </section>
      <div className={styles.chapterList}>
        {data.curriculum.chapters.map((chapter, index) => {
          const chapterNo = index + 1;
          return (
            <article className={styles.chapter} id={`mcp-chapter-${chapterNo}`} key={chapter.title}>
              <header>
                <span>{String(chapterNo).padStart(2, "0")}</span>
                <div><h2>{chapter.title}</h2><small>{chapter.en}</small></div>
                <strong>{chapter.decision}</strong>
              </header>
              <p className={styles.chapterBoundary}><strong>适用边界</strong>{chapter.boundary}</p>
              <details className={styles.mechanismDisclosure} open={chapterNo === 6 || chapterNo === 7}>
                <summary>展开工作机制与版本差异</summary><p>{chapter.explanation}</p>
              </details>
              <ChapterSupplements chapterNo={chapterNo} data={data} />
              <SourceDisclosure sourceIds={chapter.sourceIds} sources={data.sources} label="查看本章依据" />
            </article>
          );
        })}
      </div>

      <section className={styles.labs} id="mcp-labs">
        <header className={styles.sectionHeader}><span>LAB</span><div><h2>验证实验 · {data.learning.labs.length} 项</h2><p>每项实验都给出情境、任务、交付物和通过标准，可直接进入 PoC 计划。</p></div></header>
        <div className={styles.labGrid}>
          {data.learning.labs.map((lab, index) => (
            <article key={lab.title}>
              <header><span>LAB {String(index + 1).padStart(2, "0")}</span><h3>{lab.title}</h3></header>
              <p><strong>情境</strong>{lab.scenario}</p>
              <dl><div><dt>产物</dt><dd>{lab.deliverable}</dd></div><div><dt>通过标准</dt><dd>{lab.acceptance}</dd></div></dl>
              <details className={styles.mechanismDisclosure}><summary>展开实验任务</summary><ol>{lab.tasks.map((task) => <li key={task}>{task}</li>)}</ol></details>
              <SourceDisclosure sourceIds={lab.sourceIds} sources={data.sources} label="查看实验依据" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function FieldQa({ data }: { data: McpExperienceData }) {
  const [category, setCategory] = useState<QaCategory>("version");
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const syncCategory = () => {
      const match = window.location.hash.match(/^#qa-(\d+)$/);
      if (!match) return;
      const item = data.qa[Number(match[1]) - 1];
      const group = item ? QA_CATEGORIES.find((candidate) => candidate.tags.includes(item.tag)) : null;
      if (group) {
        setCategory(group.id);
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
          scrollHashTargetIntoView(match[0]);
        }));
      }
    };
    syncCategory();
    window.addEventListener("hashchange", syncCategory);
    return () => window.removeEventListener("hashchange", syncCategory);
  }, [data.qa]);

  const moveCategory = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + QA_CATEGORIES.length) % QA_CATEGORIES.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % QA_CATEGORIES.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = QA_CATEGORIES.length - 1;
    setCategory(QA_CATEGORIES[nextIndex].id);
    tabsRef.current[nextIndex]?.focus();
  };

  return (
    <section className={styles.fieldQa} id="qa" data-quality-section="qa">
      <span className={styles.anchorAlias} id="mcp-field-qa" />
      <header className={styles.sectionHeader}><span>01</span><div><h2>客户问题 · {data.qa.length} 题 · {QA_CATEGORIES.length} 类入口</h2><p>短答案先给结论，技术机制、追问和证据继续展开。<Link href="/questions?module=mcp">搜索客户问题</Link></p></div></header>
      <div className={styles.qaTabs} role="tablist" aria-label="现场问答分类">
        {QA_CATEGORIES.map((item, index) => {
          const count = data.qa.filter((qa) => item.tags.includes(qa.tag)).length;
          return <button aria-controls={`mcp-qa-panel-${item.id}`} aria-selected={category === item.id} id={`mcp-qa-tab-${item.id}`} key={item.id} onClick={() => setCategory(item.id)} onKeyDown={(event) => moveCategory(event, index)} ref={(node) => { tabsRef.current[index] = node; }} role="tab" tabIndex={category === item.id ? 0 : -1} type="button"><strong>{item.label}</strong><span>{count}</span></button>;
        })}
      </div>
      {QA_CATEGORIES.map((group) => {
        const items = data.qa.map((item, index) => ({ item, index })).filter(({ item }) => group.tags.includes(item.tag));
        return (
          <div aria-labelledby={`mcp-qa-tab-${group.id}`} className={styles.fieldQaList} hidden={category !== group.id} id={`mcp-qa-panel-${group.id}`} key={group.id} role="tabpanel" tabIndex={0}>
            {items.map(({ item, index }) => <QaPreview anchorId={`qa-${index + 1}`} item={item} index={index} key={item.q} sources={data.sources} />)}
          </div>
        );
      })}
    </section>
  );
}

function FieldView({ data }: { data: McpExperienceData }) {
  const lifecycleStep = data.learning.route[4];
  const enterpriseLab = data.learning.labs[3];
  return (
    <div className={styles.modeContent}>
      <FieldQa data={data} />

      <section className={styles.evidenceSection} id="evidence" data-quality-section="evidence">
        <span className={styles.anchorAlias} id="mcp-field-evidence" />
        <header className={styles.sectionHeader}><span>02</span><div><h2>五张证据卡：结论和适用边界同时看</h2><p>来源链接只是入口，证据能说明什么、不能说明什么必须常显。</p></div></header>
        <div className={styles.evidenceGrid}>
          {data.evidenceCards.map((card, index) => {
            const source = data.sources[card.sourceId];
            return (
              <article key={card.title}>
                <header><span>{String(index + 1).padStart(2, "0")}</span><small>{card.metric}</small></header>
                <h3>{card.title}</h3><p>{card.finding}</p>
                <p className={styles.evidenceBoundary}><strong>范围</strong>{card.boundary}</p>
                {source ? <Link href={`/references#source-${card.sourceId}`}><span>{source.grade} · {source.kind}</span>{source.shortTitle}<ArrowIcon /></Link> : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.cloudSection} id="cloud" data-quality-section="cloud">
        <span className={styles.anchorAlias} id="mcp-field-cloud" />
        <header className={styles.sectionHeader}><span>03</span><div><h2>云能力与责任</h2><p>按 Server 运行、身份网关、API / 数据适配、运营安全四个责任面，逐项核对云能力、交付责任与客户问题。</p></div></header>
        <div className={styles.cloudTable} role="table" aria-label="MCP 云能力与责任">
          <div className={styles.cloudHead} role="row"><strong role="columnheader">责任阶段</strong><strong role="columnheader">云服务与能力</strong><strong role="columnheader">交付价值</strong><strong role="columnheader">现场追问</strong></div>
          {data.cloudHooks.map((item) => <div className={styles.cloudRow} role="row" key={item.stage}><strong role="cell">{item.stage}</strong><p role="cell">{item.services}</p><p role="cell">{item.value}</p><p role="cell">{item.discover}</p></div>)}
        </div>
      </section>

      <section className={styles.lifecycleSection} id="mcp-field-lifecycle">
        <header className={styles.sectionHeader}><span>04</span><div><h2>{lifecycleStep.title}</h2><p>{lifecycleStep.learn}</p></div></header>
        <div className={styles.lifecycleGrid}>
          <article><span>掌握检查</span><strong>{lifecycleStep.checkpoint}</strong></article>
          <article><span>企业评审情境</span><strong>{enterpriseLab.scenario}</strong></article>
          <article><span>评审产物</span><strong>{enterpriseLab.deliverable}</strong></article>
          <article className={styles.lifecycleAcceptance}><span>通过标准</span><strong>{enterpriseLab.acceptance}</strong></article>
        </div>
        <ol className={styles.lifecycleTasks}>{enterpriseLab.tasks.map((task, index) => <li key={task}><span>{String(index + 1).padStart(2, "0")}</span>{task}</li>)}</ol>
        <SourceDisclosure sourceIds={enterpriseLab.sourceIds} sources={data.sources} label="查看目录与下线依据" />
      </section>

      <section className={styles.lifecycleSection} id="related-modules" data-quality-section="related-modules" aria-labelledby="mcp-related-title">
        <header className={styles.sectionHeader}><span>05</span><div><h2 id="mcp-related-title">相关模块</h2><p>Agent 负责 Run 与工具控制，A2A 负责独立 Agent 委派；Security 和 AI Gateway 分别补齐身份安全与共享策略入口。</p></div></header>
        <nav className={styles.relatedLinks} aria-label="MCP 相关模块">
          <Link href="/modules/ai-agent">Agent · 任务运行与工具控制</Link>
          <Link href="/modules/a2a">A2A · 独立 Agent 委派</Link>
          <Link href="/modules/security">AI 安全 · 身份与结果注入</Link>
          <Link href="/modules/ai-gateway">AI Gateway · 共享策略入口</Link>
        </nav>
      </section>
    </div>
  );
}

export function McpModuleExperienceClient({ data }: { data: McpExperienceData }) {
  const learnDirectory = [
    { id: "study-guide", label: "学习产出与路线", eyebrow: "先定检查点" },
    ...data.curriculum.chapters.map((chapter, index) => ({ id: `mcp-chapter-${index + 1}`, label: chapter.title, eyebrow: chapter.en })),
    { id: "mcp-labs", label: `${data.learning.labs.length} 项验证实验`, eyebrow: "按结果验收" },
  ];

  return (
    <main className={`${styles.page} fieldbookTheme modulePage modulePilot moduleFocused`}>
      <ReadingProgress />
      <UnifiedModuleHero
        anchorId="mcp-top"
        definition="MCP 规定 AI 应用如何发现并调用外部工具、资源和提示，并用统一消息交换上下文。"
        enTitle={data.module.en}
        evidenceCount={data.evidenceCards.length}
        facts={[
          { label: "采用条件", value: "多客户端重复适配值得统一" },
          { label: "协议对象", value: "Tool · Resource · Prompt" },
          { label: "执行责任", value: "现有身份、授权与事务系统" },
          { label: "版本边界", value: "2026-07-28 与旧版不可混用" },
        ]}
        position="协议负责发现、描述与标准化调用；现有 API、身份、授权和业务事务系统继续负责真实执行与控制。"
        questionCount={data.qa.length}
        shortTitle="MCP"
        slug="mcp"
        titleId={data.module.titleId}
        zhTitle={data.module.zh}
      />

      <DenseModuleReadingModes
        chapters={learnDirectory}
        criticalBoundary={data.criticalBoundary}
        directories={{
          quick: [
            { id: "mcp-decisions", label: "采用与选型", eyebrow: "四方责任" },
            { id: "mcp-version", label: "双版本边界", eyebrow: "当前与旧版" },
            { id: "mcp-principles", label: "五条工作原则", eyebrow: "决策速查" },
          ],
          learn: learnDirectory,
          field: [
            { id: "qa", label: `${data.qa.length} 题现场问答`, eyebrow: "分类回答" },
            { id: "evidence", label: `${data.evidenceCards.length} 张证据卡`, eyebrow: "来源与范围" },
            { id: "cloud", label: "云能力与责任", eyebrow: "交付矩阵" },
            { id: "mcp-field-lifecycle", label: "目录与下线", eyebrow: "退役检查" },
            { id: "related-modules", label: "相关模块", eyebrow: "责任连接" },
          ],
        }}
        field={<FieldView data={data} />}
        hashGroups={{
          quick: ["principle", "mcp-decisions", "mcp-version", "mcp-principles"],
          learn: ["study-guide", "curriculum", ...data.curriculum.chapters.map((_, index) => `mcp-chapter-${index + 1}`), "mcp-labs"],
          field: ["qa", "mcp-field-qa", "evidence", "mcp-field-evidence", "cloud", "mcp-field-cloud", "mcp-field-lifecycle", "related-modules"],
        }}
        learn={<LearnView data={data} />}
        moduleName="MCP · 模型上下文协议"
        quick={<QuickView data={data} />}
        readerId="mcp-reading"
      />

      <footer className={styles.footer}><strong>MCP · 模型上下文协议</strong><p>{data.curriculum.chapters.length} 章完整学习与现场查证<ModuleUpdatedAt value={data.module.updatedAt ?? undefined} /></p><a href="#mcp-reading">返回阅读任务 ↑</a></footer>
    </main>
  );
}
