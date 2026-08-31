"use client";

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { formatModuleUpdatedAt, formatQuestionAddedAt } from "./content-update-metadata.mjs";
import { DenseModuleReadingModes } from "./dense-module-reading-modes";
import { UnifiedModuleScaffold } from "./unified-module-hero";
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

type QaCategory = string;
type QaGroup = { id: QaCategory; label: string; tags: readonly string[]; items: Array<{ item: QaItem; index: number }> };

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

function groupFieldQuestions(questions: readonly QaItem[]): QaGroup[] {
  const configuredGroups = QA_CATEGORIES.map((category) => ({ ...category, items: [] as Array<{ item: QaItem; index: number }> }));
  const fallback: QaGroup = { id: "other", label: "其他已发布问题", tags: [], items: [] };
  const renderedIndexes = new Set<number>();

  questions.forEach((item, index) => {
    const matches = configuredGroups.filter((candidate) => candidate.tags.includes(item.tag));
    if (matches.length > 1) throw new Error(`MCP question tag ${item.tag} belongs to more than one field group`);
    const group = matches[0] ?? fallback;
    group.items.push({ item, index });
    renderedIndexes.add(index);
  });

  if (renderedIndexes.size !== questions.length) throw new Error("Every published MCP question must render once");
  return [...configuredGroups.filter((group) => group.items.length > 0), ...(fallback.items.length > 0 ? [fallback] : [])];
}

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

      <section className={styles.sectionBand} id="mcp-principles">
        <header className={styles.sectionHeader}><span>02</span><div><h2>{data.principleTitle}</h2><p>速查只保留决策句；机制、版本和来源在系统学习中按主题展开。</p></div></header>
        <div className={styles.principleGrid}>
          {data.principles.map((item, index) => (
            <article key={item.zh}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.zh}</h3><small>{item.en}</small><p>{item.decision}</p></article>
          ))}
        </div>
        <p className={styles.learnLink}><Link href="#mcp-chapter-3">版本、初始化与能力发现：进入系统学习查看迁移判断与依据 →</Link></p>
      </section>
    </div>
  );
}

function McpToolContractDossier({ sources }: { sources: Record<string, SourceInfo> }) {
  return (
    <section className={styles.protocolDossier} id="mcp-contract-dossier" data-quality-section="protocol-dossier">
      <header className={styles.sectionHeader}>
        <span>例</span>
        <div><h2>把一个 API 变成可验收的 MCP Tool</h2><p>以只读工单查询为贯穿案例。下面是教学用契约，不是可直接复制的企业授权方案；实际字段、身份和错误语义由 Server 与权威业务系统共同定义。</p></div>
      </header>
      <div className={styles.dossierGrid}>
        <article>
          <header><span>01</span><div><h3>先让模型看见可检查的输入合同</h3><p>Tool 的名称、用途和 JSON Schema 是发现与调用的边界；只读提示不是授权本身。</p></div></header>
          <pre aria-label="教学 Tool 定义示例"><code>{`{
  "name": "ticket.get",
  "description": "Read one ticket by its authoritative ID.",
  "inputSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "ticketId": { "type": "string", "pattern": "^INC-\\\\d+$" }
    },
    "required": ["ticketId"]
  },
  "annotations": { "readOnlyHint": true }
}`}</code></pre>
          <p className={styles.dossierRule}><strong>验收：</strong>用无效 ID、额外字段和越权租户各跑一次，记录 Schema 拒绝、授权拒绝和可关联的请求 ID。</p>
        </article>
        <article>
          <header><span>02</span><div><h3>再把一次调用和一次回读分开</h3><p>MCP 表达调用和结果结构；调用方仍需将用户、租户与最小 scope 交给确定性授权链，工单系统保留权威状态与审计。</p></div></header>
          <pre aria-label="教学 tools call 示例"><code>{`{
  "jsonrpc": "2.0",
  "id": "req-7",
  "method": "tools/call",
  "params": {
    "name": "ticket.get",
    "arguments": { "ticketId": "INC-1042" }
  }
}

// 结果示意：content 给人读，structuredContent 给应用校验。
{ "result": {
  "content": [{ "type": "text", "text": "INC-1042 is open" }],
  "structuredContent": { "ticketId": "INC-1042", "status": "open" },
  "isError": false
} }`}</code></pre>
          <p className={styles.dossierRule}><strong>验收：</strong>客户端把结构化结果与权威工单记录的 ID、状态、更新时间对齐；自然语言摘要不能单独作为业务事实。</p>
        </article>
        <article>
          <header><span>03</span><div><h3>为“结果未知”准备恢复记录</h3><p>超时不等于未执行。写入类 Tool 必须由业务系统的幂等键、回读和补偿语义收口；不要把一段通用错误码当成所有 Server 的恢复契约。</p></div></header>
          <dl>
            <div><dt>输入不合规</dt><dd>停止调用；保存 Schema 校验结果与请求关联键。</dd></div>
            <div><dt>身份或 scope 不足</dt><dd>不升级模型权限；由授权系统给出拒绝证据与申请路径。</dd></div>
            <div><dt>下游超时</dt><dd>保留关联键，先查权威状态，再决定恢复、重试或人工接管。</dd></div>
            <div><dt>内容含不可信指令</dt><dd>按数据处理，不提升为 Host 指令；高风险动作重新确认并走业务控制。</dd></div>
          </dl>
          <p className={styles.dossierRule}><strong>最小交付：</strong>Tool Schema、一次调用捕获、授权/资源回读记录、失败处置表与各项 Owner。</p>
        </article>
      </div>
      <SourceDisclosure sourceIds={["mcp-tools-2026-07-28", "mcp-authorization", "mcp-security"]} sources={sources} label="查看本示例的协议与安全依据" />
    </section>
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
        <h2>主题地图</h2><p>{data.curriculum.lead}</p>
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
              <p className={styles.chapterMechanism}><strong>工作机制</strong>{chapter.explanation}</p>
              <p className={styles.chapterBoundary}><strong>适用边界</strong>{chapter.boundary}</p>
              <SourceDisclosure sourceIds={chapter.sourceIds} sources={data.sources} label="查看本章依据" />
            </article>
          );
        })}
      </div>

      <section className={styles.deepDiveSection} id="mcp-relationships" data-quality-section="protocol-relationships">
        <header className={styles.sectionHeader}><span>关</span><div><h2>把主题连成一次真实调用</h2><p>这三张关系图分别回答：控制权在哪里、部署如何改变信任边界、远程 Tool 调用如何留下可追溯证据。</p></div></header>
        {data.deepDives.map((block) => <DeepDiveView block={block} key={block.title} sources={data.sources} />)}
      </section>

      <McpToolContractDossier sources={data.sources} />

      <section className={styles.labs} id="mcp-labs">
        <header className={styles.sectionHeader}><span>LAB</span><div><h2>可复核练习</h2><p>每项练习都有情境、任务、交付物和通过标准，可直接进入 PoC 计划。</p></div></header>
        <div className={styles.labGrid}>
          {data.learning.labs.map((lab, index) => (
            <article key={lab.title}>
              <header><span>LAB {String(index + 1).padStart(2, "0")}</span><h3>{lab.title}</h3></header>
              <p><strong>情境</strong>{lab.scenario}</p>
              <ol className={styles.labTasks}>{lab.tasks.map((task) => <li key={task}>{task}</li>)}</ol>
              <dl><div><dt>产物</dt><dd>{lab.deliverable}</dd></div><div><dt>通过标准</dt><dd>{lab.acceptance}</dd></div></dl>
              <SourceDisclosure sourceIds={lab.sourceIds} sources={data.sources} label="查看实验依据" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function FieldQa({ data }: { data: McpExperienceData }) {
  const groups = useMemo(() => groupFieldQuestions(data.qa), [data.qa]);
  const [category, setCategory] = useState<QaCategory>(() => groups[0]?.id ?? "");
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const activeCategory = groups.some((group) => group.id === category) ? category : (groups[0]?.id ?? "");

  useEffect(() => {
    const syncCategory = () => {
      const match = window.location.hash.match(/^#qa-(\d+)$/);
      if (!match) return;
      const item = data.qa[Number(match[1]) - 1];
      const group = item ? groups.find((candidate) => candidate.items.some(({ index }) => index === Number(match[1]) - 1)) : null;
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
  }, [data.qa, groups]);

  const moveCategory = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (groups.length === 0) return;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + groups.length) % groups.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % groups.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = groups.length - 1;
    setCategory(groups[nextIndex].id);
    tabsRef.current[nextIndex]?.focus();
  };

  return (
    <section className={styles.fieldQa} id="qa" data-quality-section="qa">
      <span className={styles.anchorAlias} id="mcp-field-qa" />
      <header className={styles.sectionHeader}><span>01</span><div><h2>客户问题</h2><p>短答案先给结论，技术机制、追问和证据继续展开。<Link href="/questions?module=mcp">搜索客户问题</Link></p></div></header>
      <div className={styles.qaTabs} role="tablist" aria-label="现场问答分类">
        {groups.map((item, index) => {
          return <button aria-controls={`mcp-qa-panel-${item.id}`} aria-selected={activeCategory === item.id} id={`mcp-qa-tab-${item.id}`} key={item.id} onClick={() => setCategory(item.id)} onKeyDown={(event) => moveCategory(event, index)} ref={(node) => { tabsRef.current[index] = node; }} role="tab" tabIndex={activeCategory === item.id ? 0 : -1} type="button"><strong>{item.label}</strong><span>{item.items.length}</span></button>;
        })}
      </div>
      {groups.map((group) => {
        return (
          <div aria-labelledby={`mcp-qa-tab-${group.id}`} className={styles.fieldQaList} hidden={activeCategory !== group.id} id={`mcp-qa-panel-${group.id}`} key={group.id} role="tabpanel" tabIndex={0}>
            {group.items.map(({ item, index }) => <QaPreview anchorId={`qa-${index + 1}`} item={item} index={index} key={item.q} sources={data.sources} />)}
          </div>
        );
      })}
    </section>
  );
}

function FieldView({ data }: { data: McpExperienceData }) {
  return (
    <div className={styles.modeContent}>
      <FieldQa data={data} />

      <section className={styles.evidenceSection} id="evidence" data-quality-section="evidence">
        <span className={styles.anchorAlias} id="mcp-field-evidence" />
        <header className={styles.sectionHeader}><span>02</span><div><h2>证据卡：结论和适用边界同时看</h2><p>来源链接只是入口，证据能说明什么、不能说明什么必须常显。</p></div></header>
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

      <section className={styles.lifecycleSection} id="related-modules" data-quality-section="related-modules" aria-labelledby="mcp-related-title">
        <header className={styles.sectionHeader}><span>04</span><div><h2 id="mcp-related-title">相关模块</h2><p>Agent 负责 Run 与工具控制，A2A 负责独立 Agent 委派；Security 和 AI Gateway 分别补齐身份安全与共享策略入口。</p></div></header>
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
    { id: "mcp-relationships", label: "调用关系图", eyebrow: "控制、信任与证据" },
    { id: "mcp-contract-dossier", label: "Tool 契约示例", eyebrow: "从 Schema 到回读" },
    { id: "mcp-labs", label: "可复核练习", eyebrow: "按结果验收" },
  ];

  return (
    <UnifiedModuleScaffold
      className={`${styles.page} fieldbookTheme modulePage modulePilot moduleFocused`}
      hero={{
        anchorId: "mcp-top",
        definition: "MCP 规定 AI 应用如何发现并调用外部工具、资源和提示，并用统一消息交换上下文。",
        enTitle: data.module.en,
        evidenceCount: data.evidenceCards.length,
        facts: [
          { label: "采用条件", value: "多客户端重复适配值得统一" },
          { label: "协议对象", value: "Tool · Resource · Prompt" },
          { label: "执行责任", value: "现有身份、授权与事务系统" },
          { label: "版本边界", value: "2026-07-28 与旧版不可混用" },
        ],
        position: "协议负责发现、描述与标准化调用；现有 API、身份、授权和业务事务系统继续负责真实执行与控制。",
        questionCount: data.qa.length,
        shortTitle: "MCP",
        slug: "mcp",
        titleId: data.module.titleId,
        zhTitle: data.module.zh,
      }}
    >

      <DenseModuleReadingModes
        chapters={learnDirectory}
        criticalBoundary={data.criticalBoundary}
        directories={{
          quick: [
            { id: "mcp-decisions", label: "采用与选型", eyebrow: "四方责任" },
            { id: "mcp-principles", label: "工作原则", eyebrow: "决策速查" },
          ],
          learn: learnDirectory,
          field: [
            { id: "qa", label: "现场问答", eyebrow: "分类回答" },
            { id: "evidence", label: "证据与范围", eyebrow: "来源与范围" },
            { id: "cloud", label: "云能力与责任", eyebrow: "交付矩阵" },
            { id: "related-modules", label: "相关模块", eyebrow: "责任连接" },
          ],
        }}
        field={<FieldView data={data} />}
        hashGroups={{
          quick: ["principle", "mcp-decisions", "mcp-principles"],
          learn: ["study-guide", "curriculum", ...data.curriculum.chapters.map((_, index) => `mcp-chapter-${index + 1}`), "mcp-relationships", "mcp-contract-dossier", "mcp-labs"],
          field: ["qa", "mcp-field-qa", "evidence", "mcp-field-evidence", "cloud", "mcp-field-cloud", "related-modules"],
        }}
        learn={<LearnView data={data} />}
        moduleName="MCP · 模型上下文协议"
        quick={<QuickView data={data} />}
        readerId="mcp-reading"
      />

      <footer className={styles.footer}><strong>MCP · 模型上下文协议</strong><p>主题学习、协议工件与现场查证<ModuleUpdatedAt value={data.module.updatedAt ?? undefined} /></p><a href="#mcp-reading">返回阅读任务 ↑</a></footer>
    </UnifiedModuleScaffold>
  );
}
