import Link from "next/link";

import { DenseModuleReadingModes, type DenseChapterLink, type ReadingModeId } from "./dense-module-reading-modes";
import styles from "./a2a-module-experience.module.css";
import { requireModuleBrief } from "./module-brief-content.mjs";
import { requireModuleCurriculum } from "./module-curriculum-content.mjs";
import { requireModuleLearning } from "./module-learning-content.mjs";
import { ModuleCurriculumAtlas, ModuleUpdatedAt, QuestionAddedAt } from "./module-content-components";
import { getPublishedModule } from "./module-publication.mjs";
import { sourceLedger } from "./reference-content.mjs";
import { terminology } from "./terminology.mjs";
import { UnifiedModuleScaffold } from "./unified-module-hero";

export type A2AModuleExperienceProps = {
  initialMode?: ReadingModeId;
  className?: string;
};

type SourceQa = {
  q: string;
  a: string;
  depth: string;
  ask: string;
  tag: string;
  basis: string;
  evidence: readonly { sourceId: string; supports: string }[];
  addedAt?: string;
};

type SourceEvidenceCard = {
  metric: string;
  title: string;
  finding: string;
  boundary: string;
  sourceId: string;
};

type SourceLab = {
  title: string;
  scenario: string;
  tasks: readonly string[];
  deliverable: string;
  acceptance: string;
  sourceIds: readonly string[];
};

type A2ASourceBrief = { qa: readonly SourceQa[]; evidenceCards: readonly SourceEvidenceCard[] };
type A2ASourceCurriculum = {
  lead: string;
  chapters: ReadonlyArray<{ title: string; en: string; explanation: string; decision: string; boundary: string; sourceIds: readonly string[] }>;
};
type A2ASourceLearning = {
  outcomes: readonly string[];
  route: ReadonlyArray<{ title: string; learn: string; checkpoint: string }>;
  labs: readonly SourceLab[];
};

const chapters = [
  { id: "a2a-chapter-1", label: "A2A 与 MCP", eyebrow: "先画边界" },
  { id: "a2a-chapter-2", label: "Agent Card", eyebrow: "发现、版本、Binding" },
  { id: "a2a-chapter-3", label: "Message 还是 Task", eyebrow: "两条响应路径" },
  { id: "a2a-chapter-4", label: "对象关系", eyebrow: "Message · Part · Artifact" },
  { id: "a2a-chapter-5", label: "九个 TaskState", eyebrow: "中断、恢复、终态" },
  { id: "a2a-chapter-6", label: "交付方式", eyebrow: "阻塞、轮询、流、Push" },
  { id: "a2a-chapter-7", label: "取消、重试与幂等", eyebrow: "先确认，再补发" },
  { id: "a2a-chapter-8", label: "身份与授权", eyebrow: "四段身份链" },
  { id: "a2a-chapter-9", label: "追踪与 Artifact", eyebrow: "证据和三层验收" },
  { id: "a2a-chapter-10", label: "拓扑与采用边界", eyebrow: "不为协议拆系统" },
  { id: "a2a-chapter-11", label: "验证实验", eyebrow: "用结果决定采用" },
] as const satisfies readonly DenseChapterLink[];

const taskStates = [
  { code: "TASK_STATE_SUBMITTED", label: "已提交", kind: "active", meaning: "服务端已接收并创建 Task，尚未开始主要执行。" },
  { code: "TASK_STATE_WORKING", label: "执行中", kind: "active", meaning: "提供方正在处理；进度消息不能替代持久状态。" },
  { code: "TASK_STATE_INPUT_REQUIRED", label: "等待补件", kind: "interrupt", meaning: "缺少业务输入；补齐后恢复同一个 Task。" },
  { code: "TASK_STATE_AUTH_REQUIRED", label: "等待授权", kind: "interrupt", meaning: "需要新的授权或确认；不得静默扩大原授权。" },
  { code: "TASK_STATE_COMPLETED", label: "技术完成", kind: "terminal", meaning: "提供方结束执行，不代表产物合格或业务接受。" },
  { code: "TASK_STATE_FAILED", label: "执行失败", kind: "terminal", meaning: "任务以失败结束；修订工作另建相关 Task。" },
  { code: "TASK_STATE_CANCELED", label: "已取消", kind: "terminal", meaning: "协议任务已终止，不证明下游副作用已回滚。" },
  { code: "TASK_STATE_REJECTED", label: "已拒绝", kind: "terminal", meaning: "提供方拒绝受理；调用方需重新判断范围或能力。" },
] as const;

const deliveryRows = [
  { mode: "直接 Message", when: "即时、自包含，不需要后续跟踪", state: "不创建 Task", client: "保持一次请求", guard: "仍保存身份、输入和响应证据" },
  { mode: "阻塞等待", when: "短任务且超时包络明确", state: "可返回 Task 终态", client: "连接保持在线", guard: "网络超时不等于任务失败" },
  { mode: "轮询", when: "客户端无法长连或需主动控制节奏", state: "按 Task ID 查询", client: "可离线后恢复", guard: "设置退避、TTL 和终态停止条件" },
  { mode: "Streaming / 订阅", when: "需要低延迟状态或内容增量", state: "状态仍由 Task 保存", client: "维持流或重连", guard: "游标、顺序和断线恢复需测试" },
  { mode: "Push", when: "客户端不在线，服务端主动通知", state: "回调只传更新", client: "提供受控回调地址", guard: "验证地址、认证、幂等、限流与重放" },
] as const;

const bindingRows = [
  { binding: "HTTP + JSON", interface: "supportedInterfaces[]", direct: "Message", task: "Task + 状态查询", stream: "按接口声明", cancel: "CancelTask", error: "HTTP 状态 + A2A 错误", auth: "HTTP 认证 / OAuth2 / mTLS" },
  { binding: "JSON-RPC", interface: "supportedInterfaces[]", direct: "SendMessage 结果", task: "Task 方法与事件", stream: "SSE / 声明能力", cancel: "CancelTask 方法", error: "JSON-RPC + A2A 错误", auth: "承载层认证 + 任务授权" },
  { binding: "gRPC", interface: "supportedInterfaces[]", direct: "Unary Message", task: "Task RPC / 状态", stream: "Server streaming", cancel: "CancelTask RPC", error: "gRPC status + A2A 语义", auth: "通道身份 + 资源授权" },
] as const;

type FieldQuestion = {
  item: SourceQa;
  sourceIndex: number;
};

type FieldQuestionGroup = {
  code: string;
  title: string;
  questions: readonly FieldQuestion[];
};

type FieldGroupDefinition = {
  code: string;
  title: string;
  tags: readonly string[];
};

const fieldGroupDefinitions = [
  { code: "A", title: "发现与连接", tags: ["协议边界", "架构选择", "采用判断", "发现信任"] },
  { code: "B", title: "任务、交付与恢复", tags: ["可靠性", "故障恢复", "取消语义", "产物验收"] },
  { code: "C", title: "安全与责任", tags: ["审计与可观测", "跨域委托"] },
  { code: "D", title: "运营与采用", tags: ["协作拓扑"] },
] as const satisfies readonly FieldGroupDefinition[];

function groupFieldQuestions(qa: readonly SourceQa[]): readonly FieldQuestionGroup[] {
  const tagToGroup = new Map<string, string>();
  const groupsByCode = new Map<string, { code: string; title: string; questions: FieldQuestion[] }>(
    fieldGroupDefinitions.map((group) => [group.code, {
      code: group.code,
      title: group.title,
      questions: [] as FieldQuestion[],
    }]),
  );
  const unclassified: FieldQuestion[] = [];

  for (const group of fieldGroupDefinitions) {
    for (const tag of group.tags) {
      if (tagToGroup.has(tag)) {
        throw new Error(`A2A field-question tag is assigned to more than one group: ${tag}`);
      }
      tagToGroup.set(tag, group.code);
    }
  }

  qa.forEach((item, sourceIndex) => {
    const group = groupsByCode.get(tagToGroup.get(item.tag) ?? "");
    const question = { item, sourceIndex };

    if (group) {
      group.questions.push(question);
    } else {
      unclassified.push(question);
    }
  });

  const populatedGroups = [...groupsByCode.values()]
    .filter((group) => group.questions.length > 0)
    .map((group) => ({ ...group, questions: Object.freeze([...group.questions]) }));

  return unclassified.length > 0
    ? [...populatedGroups, { code: "补充", title: "其他已发布问题", questions: Object.freeze(unclassified) }]
    : populatedGroups;
}

function loadA2ASourceContent() {
  const brief = requireModuleBrief("a2a") as A2ASourceBrief;
  const curriculum = requireModuleCurriculum("a2a") as A2ASourceCurriculum;
  const learning = requireModuleLearning("a2a") as A2ASourceLearning;
  const fieldQuestionGroups = groupFieldQuestions(brief.qa);
  const renderedQuestions = fieldQuestionGroups.flatMap((group) => group.questions);
  const renderedQuestionIndices = renderedQuestions.map((question) => question.sourceIndex);

  if (!brief.qa.length || renderedQuestionIndices.length !== brief.qa.length || new Set(renderedQuestionIndices).size !== renderedQuestionIndices.length || renderedQuestions.some(({ item, sourceIndex }) => brief.qa[sourceIndex] !== item)) {
    throw new Error("A2A source contract changed: every published question must appear in one field-question group.");
  }
  if (!brief.evidenceCards.length) {
    throw new Error("A2A source contract changed: the evidence ledger needs at least one published record.");
  }
  if (!curriculum.chapters.length || !learning.labs.length || !chapters.length) {
    throw new Error("A2A source contract changed: the learning view needs topic, practice, and navigation content.");
  }
  if (learning.labs.some((lab) => lab.sourceIds.length === 0 || lab.sourceIds.some((sourceId) => !sourceLedger[sourceId]))) {
    throw new Error("A2A source contract changed: every published practice needs resolvable source evidence.");
  }

  return { qa: brief.qa, evidenceCards: brief.evidenceCards, curriculum, learning, fieldQuestionGroups };
}

const sources = [
  { id: "a2a-concepts", title: "A2A Core Concepts", type: "官方 · 核心概念", proves: "Message / Task、Part、Artifact 与生命周期对象边界。" },
  { id: "a2a-specification", title: "A2A Protocol Specification", type: "官方 · 规范", proves: "协议操作、TaskState、逐请求版本、Binding、取消与错误语义。" },
  { id: "a2a-release-1-0-1", title: "A2A v1.0.1 Release", type: "官方 · 发布记录", proves: "v1.0.1 是规范补丁发布，不参与线上 Major.Minor 协商。" },
  { id: "a2a-mcp-boundary", title: "A2A and MCP", type: "官方 · 边界说明", proves: "A2A 面向独立 Agent；MCP 面向工具、资源和应用连接。" },
  { id: "opentelemetry-semconv", title: "OpenTelemetry Semantic Conventions", type: "官方 · 遥测规范", proves: "用 Trace Context 关联跨服务调用的通用机制。" },
] as const;

function FlowArrow({ label }: { label?: string }) {
  return (
    <span className={styles.flowArrow} aria-label={label ?? "流向"}>
      <svg viewBox="0 0 54 18" aria-hidden="true">
        <path d="M1 9h47" />
        <path d="m42 3 7 6-7 6" />
      </svg>
    </span>
  );
}

function SectionHeader({ number, title, eyebrow, lead }: { number: string; title: string; eyebrow: string; lead: string }) {
  return (
    <header className={styles.sectionHeader}>
      <span>{number}</span>
      <div>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <strong>{lead}</strong>
      </div>
    </header>
  );
}

function Boundary({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className={styles.boundary} aria-label="重要边界" data-importance="critical">
      <strong>{title}</strong>
      <p>{children}</p>
    </aside>
  );
}

function LabSourceLinks({ sourceIds }: { sourceIds: readonly string[] }) {
  const references = [...new Set(sourceIds)].map((sourceId) => {
    const source = sourceLedger[sourceId];

    if (!source) {
      throw new Error(`Unknown A2A lab sourceId: ${sourceId}`);
    }

    return { sourceId, title: source.shortTitle };
  });

  if (references.length === 0) return null;

  return (
    <nav className={styles.labSources} aria-label="本练习依据">
      <span>本练习依据</span>
      {references.map((source) => (
        <Link href={`/references#source-${source.sourceId}`} key={source.sourceId}>{source.title} ↗</Link>
      ))}
    </nav>
  );
}

function QuickView({ knowledgeView, terms }: { knowledgeView: string; terms: ReadonlyArray<{ id: string; zh: string; en: string; description: string }> }) {
  return (
    <div className={styles.quickView}>
      <section className={`moduleKnowledgeExplorer moduleKnowledgeExplorer--lifecycle ${styles.modeIntro}`} id="principle" data-quality-section="principle" data-knowledge-explorer="interactive" data-knowledge-view={knowledgeView}>
        <div>
          <p>机制速览 · 方案判断 · QUICK DESK</p>
          <h2>一项跨 Agent 任务如何暂停、恢复或失败</h2>
          <strong>不是“两个模型互聊”，而是一次可恢复、可验收的跨边界委派。</strong>
        </div>
        <dl>
          <div><dt>先判</dt><dd>对方是独立 Agent，还是工具 / API？</dd></div>
          <div><dt>再判</dt><dd>即时 Message，还是需要跟踪的 Task？</dd></div>
          <div><dt>最后</dt><dd>技术终态、产物校验、业务接受是否分开？</dd></div>
        </dl>
        <div className={styles.termLedger} aria-label="A2A 核心术语">
          {terms.map((term) => <article key={term.id}><strong>{term.zh}</strong><small>{term.en}</small><p>{term.description}</p></article>)}
        </div>
      </section>

      <section className={styles.handoffSection} aria-labelledby="a2a-handoff-title" data-adaptive-visual="sequence">
        <header className={styles.compactHeader}>
          <span>01 / MESSAGE OR TASK</span>
          <h2 id="a2a-handoff-title">SendMessage 之后，远端决定返回对象</h2>
          <p>直接 Message 与创建 Task 都从同一个 SendMessage 节点分叉。只有进入 Task 后，才讨论补件、授权、取消和恢复。</p>
        </header>
        <div className={styles.handoffFlow}>
          <article className={styles.domainNode}>
            <span>组织域 A · 调用方</span>
            <h3>委托 Agent</h3>
            <p>保存 Card 快照、用户目标、调用身份、messageId 与授权范围。</p>
          </article>
          <FlowArrow label="调用 SendMessage" />
          <article className={styles.sendNode}>
            <span>统一入口</span>
            <h3>SendMessage</h3>
            <code>A2A-Version: 1.0</code>
          </article>
          <div className={styles.branchPaths}>
            <article>
              <span>路径 A · 即时</span>
              <h3>直接返回 Message</h3>
              <p>适合一次自包含的响应，不创建 Task，也不要求 Artifact。</p>
            </article>
            <article>
              <span>路径 B · 可跟踪</span>
              <h3>创建服务端 Task</h3>
              <p>获得 Task ID；之后才可能进入等待补件、等待授权或 CancelTask。</p>
              <ul>
                <li className={styles.selectedState}>当前示例：INPUT_REQUIRED · 等待补件</li>
                <li>补齐信息后恢复同一个 Task</li>
                <li>CancelTask 不证明副作用已经回滚</li>
              </ul>
            </article>
          </div>
          <FlowArrow label="远端处理并返回" />
          <article className={styles.domainNode}>
            <span>组织域 B · 提供方</span>
            <h3>专业 Agent</h3>
            <p>维护内部执行与策略证据，对外发布状态、Message 与可选 Artifact。</p>
          </article>
        </div>
      </section>

      <div className={styles.quickGrid}>
        <section className={styles.boundaryMap} aria-labelledby="quick-boundary-title">
          <header className={styles.compactHeader}>
            <span>02 / PROTOCOL BOUNDARY</span>
            <h2 id="quick-boundary-title">三个边界，不要混成一套</h2>
          </header>
          <div className={styles.boundaryRows}>
            <article><strong>A2A</strong><span>独立 Agent ↔ 独立 Agent</span><p>发现、Message / Task、状态、产物与跨边界协作契约。</p></article>
            <article><strong>MCP / API</strong><span>Agent / 应用 ↔ 工具与数据</span><p>工具、资源、数据与业务 API 的连接；授权仍由资源侧执行。</p></article>
            <article><strong>本地编排</strong><span>同一运行时内部</span><p>共享代码、状态与发布周期的细粒度节点，继续留在框架或工作流里。</p></article>
          </div>
        </section>

        <aside className={styles.quickRail}>
          <span>AGENT CARD · 信任边界</span>
          <h2>先验证，再准入</h2>
          <p>未验证来源或签名时，Agent Card 只是对端声明。</p>
          <p>使用受信公钥验证 JWS 后，可证明卡片来源与完整性，但仍不替代调用授权、能力实测或业务验收。</p>
          <Link href="/references#source-a2a-specification">核对官方规范</Link>
        </aside>
      </div>

      <section className={styles.acceptanceStrip} aria-label="三项独立验收">
        <div><span>1</span><strong>协议终态</strong><p>Task 到达 COMPLETED / FAILED / CANCELED / REJECTED。</p></div>
        <div><span>2</span><strong>产物校验</strong><p>类型、来源、完整性、安全与访问条件通过。</p></div>
        <div><span>3</span><strong>业务接受</strong><p>权威系统或责任人确认结果满足业务标准。</p></div>
      </section>

      <Boundary title="需要单独验证">协议终态只关闭远端 Task；调用方还要绑定 Artifact 版本、校验结果和业务接受人。FAILED / CANCELED 也不能替代下游副作用核对。</Boundary>
    </div>
  );
}

function LearnView({ curriculum, learning }: { curriculum: A2ASourceCurriculum; learning: A2ASourceLearning }) {
  return (
    <div className={styles.learnView}>
      <section className={styles.studyGuide} id="study-guide" data-quality-section="study-guide">
        <header><span>LEARNING OUTPUT</span><h2>学习产出</h2></header>
        <ol className={styles.learningOutcomes}>{learning.outcomes.map((outcome, index) => <li key={outcome}><span>{String(index + 1).padStart(2, "0")}</span>{outcome}</li>)}</ol>
        <h3>学习路线</h3>
        <div className={styles.learningRoute}>{learning.route.map((step, index) => <article key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><h4>{step.title}</h4><p>{step.learn}</p><strong>{step.checkpoint}</strong></article>)}</div>
      </section>

      <section className={styles.curriculumAtlas} id="curriculum" data-quality-section="curriculum">
        <header className={styles.curriculumHeader}>
          <span>REFERENCE MAP</span>
          <h2>原始主题与本页学习主线</h2>
        </header>
        <ModuleCurriculumAtlas content={curriculum} sourceLedger={sourceLedger} />
      </section>

      <section className={styles.learnLead}>
        <p>LEARNING SPINE</p>
        <h2>以同一跨域任务为主线，固定 Agent Card、Message / Task 分叉、九个 TaskState、恢复策略、身份链和三层验收</h2>
        <div>
          <span>对象模型</span>
          <span>运行与恢复</span>
          <span>信任与证据</span>
          <span>采用与实验</span>
        </div>
      </section>

      <section className={styles.chapter} id="a2a-chapter-1">
        <SectionHeader number="01" eyebrow="BOUNDARY FIRST" title="A2A 与 MCP" lead="先看所有权和信任域，再决定协议。" />
        <div className={styles.comparisonTableScroll} tabIndex={0} aria-label="A2A、MCP 和本地编排对比，可横向滚动">
        <div className={styles.comparisonTable} role="table" aria-label="A2A MCP 和本地编排对比">
          <div className={styles.tableHead} role="row"><span role="columnheader">维度</span><span role="columnheader">A2A</span><span role="columnheader">MCP / API</span><span role="columnheader">本地编排</span></div>
          {[
            ["连接对象", "独立 Agent ↔ 独立 Agent", "AI 应用 ↔ 工具 / 资源", "同一系统内节点"],
            ["核心对象", "Agent Card、Message、Task、Artifact", "Tools、Resources、Prompts / API 契约", "状态、步骤、队列、检查点"],
            ["责任边界", "跨部署、所有权或信任域", "能力与数据入口", "共享发布与运维责任"],
            ["不负责", "内部节点、工具细节、业务验收", "Agent 委派拓扑和 Task 业务终态", "跨组织稳定协议契约"],
            ["采用信号", "对端独立升级、授权、SLO、审计", "需要标准工具或数据连接", "共享代码、状态和信任域"],
          ].map((row) => <div className={styles.tableRow} role="row" key={row[0]}>{row.map((cell, index) => <span role={index === 0 ? "rowheader" : "cell"} key={cell}>{cell}</span>)}</div>)}
        </div>
        </div>
        <Boundary title="边界">一个内部编排系统可以整体作为一个 A2A Agent 对外；不要为了使用协议，把共享状态的应用人为拆成分布式 Agent。</Boundary>
      </section>

      <section className={styles.chapter} id="a2a-chapter-2">
        <SectionHeader number="02" eyebrow="DISCOVERY · VERSION · BINDING" title="Agent Card" lead="发现入口、版本声明与可验证来源，三件事分开处理。" />
        <div className={styles.cardAndVersion}>
          <article className={styles.cardAnatomy}>
            <header><span>AGENT CARD SNAPSHOT</span><strong>准入记录至少保留</strong></header>
            <dl>
              <div><dt>所有者与入口</dt><dd>name、description、url、域名、所有者、停用状态</dd></div>
              <div><dt>能力契约</dt><dd>skills、输入输出模式、代表性样本与限制</dd></div>
              <div><dt>接口声明</dt><dd><code>supportedInterfaces[]</code>：url、protocolBinding、<code>{'protocolVersion: "1.0"'}</code></dd></div>
              <div><dt>安全要求</dt><dd>securitySchemes、所需 scope、认证入口</dd></div>
              <div><dt>来源验证</dt><dd>Card 来源、JWS、受信公钥、验证时间与结果</dd></div>
            </dl>
          </article>
          <aside className={styles.versionLedger}>
            <span>VERSION LEDGER</span>
            <h3>三个版本位置</h3>
            <dl>
              <div><dt>规范发布</dt><dd><b>v1.0.1</b> · 补丁发布</dd></div>
              <div><dt>请求与协商</dt><dd><code>A2A-Version: 1.0</code></dd></div>
              <div><dt>Agent Card</dt><dd><code>{'supportedInterfaces[].protocolVersion = "1.0"'}</code></dd></div>
            </dl>
            <p>补丁号不进入协议版本协商，也不写成线上 <code>A2A-Version: 1.0.1</code>。</p>
          </aside>
        </div>
        <Boundary title="Agent Card 信任边界">验证 JWS 后，准入记录还要保存公钥来源、验证时间、Card 版本与停用状态；调用 Scope、Binding 和能力质量另行验收。</Boundary>

        <div className={styles.tableBlock}>
          <header><span>BINDING CONTRACT MATRIX</span><h3>每个接口、每种 Binding 都要单独验收</h3></header>
          <div className={styles.tableScroll} role="region" tabIndex={0} aria-label="A2A 三种 Binding 契约矩阵，可横向滚动">
            <table className={styles.bindingTable}>
              <caption className="srOnly">A2A 三种 Binding 契约矩阵</caption>
              <thead><tr><th scope="col">Binding</th><th scope="col">接口声明</th><th scope="col">直接响应</th><th scope="col">Task</th><th scope="col">流式</th><th scope="col">取消</th><th scope="col">错误</th><th scope="col">认证与授权</th></tr></thead>
              <tbody>{bindingRows.map((row) => <tr key={row.binding}><th scope="row">{row.binding}</th><td>{row.interface}</td><td>{row.direct}</td><td>{row.task}</td><td>{row.stream}</td><td>{row.cancel}</td><td>{row.error}</td><td>{row.auth}</td></tr>)}</tbody>
            </table>
          </div>
          <p className={styles.tableNote}>同一套对象语义不代表三种承载自动互通。逐项测试 Message、Task、九状态、Artifact、Streaming、认证、授权、取消、错误与不支持版本。</p>
        </div>
      </section>

      <section className={styles.chapter} id="a2a-chapter-3">
        <SectionHeader number="03" eyebrow="RESPONSE OBJECT" title="Message 还是 Task" lead="是否需要跟踪、等待或恢复，决定是否创建 Task。" />
        <div className={styles.decisionFork}>
          <article className={styles.forkQuestion}>
            <span>入口</span><h3>SendMessage</h3><p>同一请求可能返回两种对象。</p>
          </article>
          <FlowArrow />
          <div>
            <article><span>无需跟踪</span><h3>直接 Message</h3><p>即时、自包含；不创建 Task，不保证产生 Artifact。</p><strong>保存：调用身份、输入、响应、版本与 Binding</strong></article>
            <article><span>需要跟踪</span><h3>创建 Task</h3><p>等待外部系统、人、补件、授权，或需要断线恢复、取消、状态审计。</p><strong>保存：Task ID、状态事件、游标、幂等键与验收记录</strong></article>
          </div>
        </div>
        <details className={styles.detailBlock} open>
          <summary>三个容易误判的场景</summary>
          <div className={styles.detailGrid}>
            <p><strong>网络很慢</strong>不等于必须建 Task；看业务是否需要耐久状态和恢复。</p>
            <p><strong>有一个文件</strong>不等于必须建 Task；Message Part 也可表达内容，Artifact 仍是可选任务输出。</p>
            <p><strong>返回 HTTP 200</strong>不等于 Task COMPLETED，更不等于业务接受。</p>
          </div>
        </details>
      </section>

      <section className={styles.chapter} id="a2a-chapter-4">
        <SectionHeader number="04" eyebrow="OBJECT MODEL" title="Message / Task / Part / Artifact" lead="交互内容、耐久状态、内容片段与任务产物各自负责一件事。" />
        <div className={styles.objectModel}>
          <article><span>交互</span><h3>Message</h3><p>用户或 Agent 的即时输入、响应和任务交互。</p><small>包含一个或多个 Part</small></article>
          <article><span>承载</span><h3>Part</h3><p>文本、文件、结构化数据或引用等内容片段。</p><small>可出现在 Message 或 Artifact 中</small></article>
          <article><span>耐久</span><h3>Task</h3><p>服务端创建、可查询、可恢复的工作单元和状态时间线。</p><small>可有 Message 历史与零个或多个 Artifact</small></article>
          <article><span>输出</span><h3>Artifact</h3><p>Task 的可选产物；可由多个 Part 组成。</p><small>不是每个 Task 都必须产生</small></article>
        </div>
        <div className={styles.objectRelations} aria-label="A2A 对象关系">
          <p><strong>Message</strong><span>包含</span><b>1..n Part</b></p>
          <p><strong>SendMessage</strong><span>返回</span><b>Message | Task</b></p>
          <p><strong>Task</strong><span>可交付</span><b>0..n Artifact</b></p>
          <p><strong>Artifact</strong><span>包含</span><b>1..n Part</b></p>
        </div>
        <Boundary title="对象边界">关键任务状态不能只存在于可能未持久保存的 Message；Artifact 也不能替代 Task 状态或业务验收记录。</Boundary>
      </section>

      <section className={styles.chapter} id="a2a-chapter-5" data-quality-section="deep-dive">
        <SectionHeader number="05" eyebrow="TASK LIFECYCLE" title="九个 TaskState" lead="两个运行态、两个可恢复中断态、四个并列终态，再加一个未知占位。" />
        <p className={styles.stateEnumLine}>TASK_STATE_SUBMITTED、TASK_STATE_WORKING、TASK_STATE_INPUT_REQUIRED、TASK_STATE_AUTH_REQUIRED；TASK_STATE_COMPLETED、TASK_STATE_FAILED、TASK_STATE_CANCELED、TASK_STATE_REJECTED。</p>
        <div className={styles.stateMachine}>
          <aside>
            <span>不进入正常流程</span>
            <h3>TASK_STATE_UNSPECIFIED</h3>
            <p>未知或未指定，不是可运营的业务状态。接收后应记录并按错误或兼容策略处理。</p>
          </aside>
          <div className={styles.activeStates}>
            {taskStates.filter((state) => state.kind === "active").map((state, index) => (
              <div key={state.code}><article><span>{state.label}</span><code>{state.code}</code><p>{state.meaning}</p></article>{index === 0 ? <FlowArrow /> : null}</div>
            ))}
          </div>
          <div className={styles.interruptStates}>
            <header><span>可恢复中断 · 补齐后回到同一 Task 的 WORKING</span></header>
            {taskStates.filter((state) => state.kind === "interrupt").map((state) => <article key={state.code}><span>{state.label}</span><code>{state.code}</code><p>{state.meaning}</p></article>)}
          </div>
          <div className={styles.terminalStates}>
            <header><span>四个并列终态 · 不是线性序列</span></header>
            {taskStates.filter((state) => state.kind === "terminal").map((state) => <article key={state.code}><span>{state.label}</span><code>{state.code}</code><p>{state.meaning}</p></article>)}
          </div>
        </div>
        <Boundary title="状态边界">INPUT_REQUIRED 与 AUTH_REQUIRED 在补齐条件后恢复同一个 Task。任何终态都不可继续写入；若需要修订，创建新的相关 Task，并由客户端维护关联。</Boundary>
      </section>

      <section className={styles.chapter} id="a2a-chapter-6">
        <SectionHeader number="06" eyebrow="DELIVERY" title="交付方式" lead="交付通道匹配在线条件；权威状态仍由 Task 保存。" />
        <div className={styles.tableScroll} role="region" tabIndex={0} aria-label="A2A 交付方式矩阵，可横向滚动">
          <table className={styles.deliveryTable}>
            <caption className="srOnly">A2A 交付方式矩阵</caption>
            <thead><tr><th scope="col">方式</th><th scope="col">适用条件</th><th scope="col">状态模型</th><th scope="col">客户端条件</th><th scope="col">必须验证</th></tr></thead>
            <tbody>{deliveryRows.map((row) => <tr key={row.mode}><th scope="row">{row.mode}</th><td>{row.when}</td><td>{row.state}</td><td>{row.client}</td><td>{row.guard}</td></tr>)}</tbody>
          </table>
        </div>
        <div className={styles.deliveryChecks}>
          <article><strong>流式断线</strong><p>按 Task ID 查询或重订阅；游标和事件顺序要进入契约测试。</p></article>
          <article><strong>Push 回调</strong><p>验证地址与服务身份；回调事件可重复，消费端必须幂等。</p></article>
          <article><strong>大文件</strong><p>优先受控对象引用，绑定短时访问、校验值、数据分类和保留期。</p></article>
        </div>
      </section>

      <section className={styles.chapter} id="a2a-chapter-7">
        <SectionHeader number="07" eyebrow="RECOVERY" title="取消、重试与幂等" lead="先判断请求处在哪个阶段，再决定查询、重发还是补偿。" />
        <div className={styles.recoveryLanes}>
          <article>
            <span>场景 A · 首次创建超时</span>
            <h3>此时未必持有 taskId</h3>
            <ol><li>保留 messageId、幂等键与请求摘要</li><li>通过服务端去重或查询入口确认是否已创建</li><li>确认未执行后再重试；高影响动作先回读权威系统</li></ol>
          </article>
          <article>
            <span>场景 B · 后续请求超时</span>
            <h3>已持有 taskId</h3>
            <ol><li>先按 Task ID 查询当前状态</li><li>恢复轮询或订阅，不盲目重建 Task</li><li>终态后的修订另建相关 Task</li></ol>
          </article>
          <article>
            <span>场景 C · CancelTask</span>
            <h3>合作式取消，不是事务回滚</h3>
            <ol><li>确认任务是否允许取消</li><li>查询最终 TaskState</li><li>独立核对下游动作与副作用，必要时执行补偿</li></ol>
          </article>
        </div>
        <Boundary title="幂等边界">协议不承诺 Exactly-once。重复请求、重复事件和重复 Artifact 都要按业务幂等键、版本与权威状态处理。</Boundary>
      </section>

      <section className={styles.chapter} id="a2a-chapter-8">
        <SectionHeader number="08" eyebrow="IDENTITY CHAIN" title="身份与授权" lead="认证主体、委托关系和资源授权，必须一路传到最终资源。" />
        <div className={styles.identityChain}>
          {[
            { n: "01", title: "最终用户", body: "发起目标、同意与业务上下文；不把全部长期权限复制给远端。" },
            { n: "02", title: "委托 Agent", body: "代表谁发起、哪个租户、哪个 Skill、什么任务与数据范围。" },
            { n: "03", title: "远端 Agent", body: "验证调用方，接受受限委托，并为自己的内部执行负责。" },
            { n: "04", title: "资源服务器", body: "对具体资源和动作做最终授权；OAuth2 / mTLS 不能替代资源级策略。" },
          ].map((step, index, steps) => <div key={step.n}><article><span>{step.n}</span><h3>{step.title}</h3><p>{step.body}</p></article>{index < steps.length - 1 ? <FlowArrow /> : null}</div>)}
        </div>
        <div className={styles.scopeLedger}>
          <strong>一份可撤销委托至少绑定</strong>
          <span>主体与代表关系</span><span>租户</span><span>Skill / 操作</span><span>Task 与资源</span><span>数据分类</span><span>有效期</span><span>撤销方</span><span>审计关联</span>
        </div>
        <Boundary title="授权边界">JWS 可证明 Agent Card 的来源与完整性；OAuth2 或 mTLS 可建立通信身份。它们都不自动证明当前调用对目标资源有权，也不证明远端能力合格。</Boundary>
      </section>

      <section className={styles.chapter} id="a2a-chapter-9">
        <SectionHeader number="09" eyebrow="TRACE · ARTIFACT · ACCEPTANCE" title="跨域追踪与 Artifact" lead="双方共享最少关联字段，各自在自己的信任域保留执行证据。" />
        <div className={styles.traceSplit}>
          <article>
            <span>调用方证据</span>
            <h3>为什么委派、委派给谁、接受了什么</h3>
            <ul><li>Agent Card 快照与验证结果</li><li>用户 / 租户 / 授权范围</li><li>messageId、Task ID、Trace Context</li><li>收到的状态事件、Message 与 Artifact</li><li>产物校验和业务接受 / 拒绝</li></ul>
          </article>
          <article>
            <span>提供方证据</span>
            <h3>如何执行、应用了什么策略、为何进入终态</h3>
            <ul><li>Task 状态与内部检查点</li><li>策略决策、工具与资源调用</li><li>重试、超时、取消与补偿</li><li>产物生成、校验、访问与保留</li><li>内部质量和安全证据</li></ul>
          </article>
        </div>
        <p className={styles.traceBridge}><strong>共同关联键</strong><span>Task ID</span><span>Trace Context</span><span>参与方身份</span><span>时间</span><span>Artifact 版本 / 校验值</span></p>
        <div className={styles.artifactChecklist}>
          <header><span>ARTIFACT ACCEPTANCE RECORD</span><h3>产物记录应能回答八件事</h3></header>
          <ol><li>媒体类型</li><li>来源与生成方</li><li>完整性 / 校验值</li><li>恶意内容与安全扫描</li><li>受控对象引用</li><li>访问范围</li><li>保留与删除</li><li>业务接受人和版本</li></ol>
        </div>
        <section className={styles.acceptanceStrip} aria-label="A2A 三层验收">
          <div><span>A</span><strong>TaskState</strong><p>提供方技术终态。</p></div>
          <div><span>B</span><strong>Artifact 验证</strong><p>接收方技术校验。</p></div>
          <div><span>C</span><strong>业务接受</strong><p>权威系统或责任人确认。</p></div>
        </section>
        <Boundary title="可观测边界">跨组织审计不要求暴露隐藏 Prompt、内部工具细节或思维链。双方要能共同证明身份、契约、状态、策略结果和产物验收。</Boundary>
      </section>

      <section className={styles.chapter} id="a2a-chapter-10" data-adaptive-visual="scenario">
        <SectionHeader number="10" eyebrow="ADOPTION" title="拓扑与采用边界" lead="用所有权、部署、信任域和生命周期选择边界，而不是数 Agent。" />
        <div className={styles.adoptionTable}>
          {[
            { choice: "本地工作流 / Agent 框架", signal: "共享代码、状态、发布周期和安全边界", cost: "最低网络与契约成本", boundary: "内部节点不必逐一暴露为 A2A Agent" },
            { choice: "MCP / API", signal: "需要调用工具、资源或稳定业务能力", cost: "围绕工具契约和资源授权", boundary: "服务不独立承接任务，就不必包装成 Agent" },
            { choice: "队列 / 事件 / 工作流", signal: "确定性异步处理、事件驱动、补偿和批量任务", cost: "运营成熟但语义需自建", boundary: "不需要 Agent 发现和任务交互时更直接" },
            { choice: "A2A", signal: "跨部署、团队、框架、云或信任域的独立 Agent", cost: "增加版本、身份、状态、SLO 与跨域审计面", boundary: "只有稳定外部任务契约能抵消成本时采用" },
          ].map((row) => <article key={row.choice}><h3>{row.choice}</h3><dl><div><dt>采用信号</dt><dd>{row.signal}</dd></div><div><dt>新增成本</dt><dd>{row.cost}</dd></div><div><dt>边界</dt><dd>{row.boundary}</dd></div></dl></article>)}
        </div>
        <details className={styles.detailBlock} open>
          <summary>采用评审要回答的问题</summary>
          <ol className={styles.reviewQuestions}><li>对端是否独立部署和升级？</li><li>是否跨所有权或信任域？</li><li>是否需要耐久 Task 与恢复？</li><li>双方怎样定义 SLO、取消、错误和升级？</li><li>身份、数据和 Artifact 是否可跨域治理？</li><li>本地工作流、MCP/API 或队列为什么不够？</li></ol>
        </details>
      </section>

      <section className={styles.chapter} id="a2a-chapter-11">
        <SectionHeader number="11" eyebrow="PRACTICE" title="动手验证交付契约" lead="不以网络连通验收，而以恢复、边界和交付证据决定采用。" />
        <div className={styles.labList}>
          {learning.labs.map((lab) => (
            <article key={lab.title}>
              <span>验证练习 · 可追溯依据</span>
              <h3>{lab.title}</h3>
              <p>{lab.scenario}</p>
              <ol>{lab.tasks.map((task) => <li key={task}>{task}</li>)}</ol>
              <dl><div><dt>产物</dt><dd>{lab.deliverable}</dd></div><div><dt>通过</dt><dd>{lab.acceptance}</dd></div></dl>
              <LabSourceLinks sourceIds={lab.sourceIds} />
            </article>
          ))}
        </div>
        <Boundary title="学习完成条件">能解释两条响应路径、九个状态、三个版本位置与三种 Binding；能在故障注入后恢复同一 Task，并把技术终态、产物校验、业务接受分别验收。</Boundary>
      </section>
    </div>
  );
}

function FieldView({
  evidenceCards,
  questionGroups,
}: {
  evidenceCards: readonly SourceEvidenceCard[];
  questionGroups: readonly FieldQuestionGroup[];
}) {
  return (
    <div className={styles.fieldView}>
      <section className={styles.fieldLead}>
        <div>
          <p>FIELD VERIFICATION · 会前与会中核对</p>
          <h2>先辨认“声明、官方规范、运行证据、边界说明”，再回答客户</h2>
        </div>
      </section>

      <div className={styles.fieldLayout}>
        <div className={styles.fieldMain}>
          <section className={styles.fieldChecklist} aria-labelledby="field-checklist-title">
            <header className={styles.compactHeader}><span>RUNBOOK</span><h2 id="field-checklist-title">一条现场核验顺序</h2></header>
            {[
              { n: "01", title: "核验 Agent Card", body: "保存原始 Card、JWS、公钥标识、验证时间与结果，再跑 Scope、Binding 和能力契约测试。" },
              { n: "02", title: "跑通 Message | Task", body: "从 SendMessage 同时测试直接 Message 与创建 Task；确认不是每次请求都强制建 Task。" },
              { n: "03", title: "故障注入", body: "测试 INPUT_REQUIRED / AUTH_REQUIRED 恢复、首次创建超时、已持有 taskId 的后续超时、CancelTask 与重复事件。" },
              { n: "04", title: "检查 Artifact", body: "Task 可以没有 Artifact；有产物时核对类型、来源、完整性、访问、安全、保留和业务接受。" },
            ].map((step) => <article key={step.n}><span>{step.n}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></article>)}
          </section>

          <section className={styles.fieldQuestions} id="qa" aria-labelledby="field-questions-title" data-quality-section="qa">
            <header className={styles.compactHeader}><span>FIELD QUESTIONS</span><h2 id="field-questions-title">客户问题 · 现场入口</h2><p>每道题都带“怎么核验”和“什么算证据”。</p></header>
            {questionGroups.map((group) => (
              <section key={group.code}>
                <header><span>{group.code}</span><h3>{group.title}</h3></header>
                {group.questions.map(({ item, sourceIndex }, index) => {
                  return (
                  <details id={`qa-${sourceIndex + 1}`} key={`qa-${sourceIndex}`} open={index === 0}>
                    <summary><span>{group.code}{index + 1}</span><strong>{item.q}</strong><QuestionAddedAt value={item.addedAt} /></summary>
                    <div><p><b>结论</b>{item.a}</p><p><b>现场补问</b>{item.ask}</p><p><b>深挖</b>{item.depth}</p><p><b>依据</b>{item.basis} · {item.evidence.map((evidence) => evidence.supports).join("；")}</p></div>
                  </details>
                  );
                })}
              </section>
            ))}
          </section>
        </div>

        <aside className={styles.fieldRail}>
          <section>
            <span>VERSION CHECK</span>
            <h2>版本三件套</h2>
            <dl><div><dt>发布</dt><dd>v1.0.1</dd></div><div><dt>请求</dt><dd>A2A-Version: 1.0</dd></div><div><dt>Card</dt><dd>{'protocolVersion: "1.0"'}</dd></div></dl>
            <p>补丁号不参与协议协商。</p>
          </section>
          <section>
            <span>ALWAYS VISIBLE</span>
            <h2>三条硬边界</h2>
            <ul><li>Artifact 可选。</li><li>CancelTask 不证明副作用已回滚。</li><li>COMPLETED ≠ 产物通过 ≠ 业务接受。</li></ul>
          </section>
          <nav aria-label="A2A 现场相关入口">
            <Link href="/questions?module=a2a">搜索客户问题</Link>
            <Link href="/references#module-a2a">打开来源资料库</Link>
          </nav>
        </aside>
      </div>

      <section className={styles.evidenceLedger} id="evidence" aria-labelledby="evidence-ledger-title" data-quality-section="evidence">
        <header className={styles.compactHeader}><span>EVIDENCE LEDGER</span><h2 id="evidence-ledger-title">证据不是同一种东西</h2></header>
        <div className={styles.evidenceTypes}>
          <article><strong>官方</strong><span>规范 / 核心概念 / 发布记录</span><p>用于确认协议对象、版本、状态和正式语义。</p></article>
          <article><strong>对端声明</strong><span>Agent Card</span><p>未验证来源或签名时只是声明；JWS 只提升来源与完整性可信度。</p></article>
          <article><strong>运行证据</strong><span>Task event log / Trace</span><p>证明某次真实委派发生了什么，不替代业务权威状态。</p></article>
          <article><strong>边界说明</strong><span>A2A 与 MCP / 采用记录</span><p>解释协议分工与适用条件，不是产品能力承诺。</p></article>
        </div>
        <div className={styles.registryEvidence} aria-label="来自 A2A 内容注册表的证据卡">
          {evidenceCards.map((card) => (
            <article key={card.title}>
              <span>{card.metric}</span>
              <h3>{card.title}</h3>
              <p>{card.finding}</p>
              <small><b>边界</b>{card.boundary}</small>
              <Link href={`/references#source-${card.sourceId}`}>核对来源</Link>
            </article>
          ))}
        </div>
        <details className={styles.detailBlock}>
          <summary>完整来源注册表 · {sources.length} 项</summary>
          <div className={styles.sourceRows}>
            {sources.map((source) => (
              <Link href={`/references#source-${source.id}`} key={source.id}>
                <span>{source.type}</span><strong>{source.title}</strong><p>{source.proves}</p><small>查看已核验来源</small>
              </Link>
            ))}
          </div>
        </details>
      </section>

      <section className={styles.cloudSection} id="cloud" aria-labelledby="cloud-title" data-quality-section="cloud">
        <header className={styles.compactHeader}><span>CLOUD RESPONSIBILITY</span><h2 id="cloud-title">云能力与责任</h2><p>按运行与目录、任务与消息、身份边界、产物与可观测四个责任面核对云能力和项目 Owner；地域、配额、SLA、价格与协议版本在采购时复核。</p></header>
        <div className={styles.tableScroll} role="region" tabIndex={0} aria-label="A2A 云责任矩阵，可横向滚动">
          <table className={styles.cloudTable}>
            <caption className="srOnly">A2A 云责任矩阵</caption>
            <thead><tr><th scope="col">能力面</th><th scope="col">常见云能力</th><th scope="col">项目交付责任</th><th scope="col">现场要问</th></tr></thead>
            <tbody>
              <tr><th scope="row">运行与目录</th><td>Agent Runtime、容器、服务发现、私有目录、DNS</td><td>稳定入口、所有者、Card 发布与停用</td><td>Agent 分属哪些团队、云和信任域？</td></tr>
              <tr><th scope="row">任务与消息</th><td>任务存储、数据库、队列、事件总线、工作流</td><td>状态、恢复、幂等、取消、补偿和 SLO</td><td>任务最长多久，断线后从哪里恢复？</td></tr>
              <tr><th scope="row">身份与边界</th><td>API Gateway、OAuth/OIDC、mTLS、IAM、策略引擎</td><td>四段身份链、最小授权、租户与数据策略</td><td>谁有权委派哪个 Skill 和哪份数据？</td></tr>
              <tr><th scope="row">产物与可观测</th><td>对象存储、KMS、Tracing、日志、审计、成本监控</td><td>受控交付、校验、保留、Trace 和三层验收</td><td>哪个 Trace 关联双方，谁接受哪个版本？</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.relatedSection} id="related-modules" aria-labelledby="related-title" data-quality-section="related-modules">
        <header className={styles.compactHeader}><span>NEXT MODULES</span><h2 id="related-title">相关模块</h2></header>
        <nav>
          <Link href="/modules/ai-agent"><span>能力主体</span><strong>AI Agent</strong><p>Agent 循环、Harness、权限与终态验证。</p></Link>
          <Link href="/modules/mcp"><span>工具连接</span><strong>MCP</strong><p>Host / Client / Server、原语、版本和资源授权。</p></Link>
          <Link href="/modules/security"><span>信任控制</span><strong>AI 安全</strong><p>身份链、最小权限、数据边界和零信任。</p></Link>
          <Link href="/modules/ai-ops"><span>运行证据</span><strong>AI Ops</strong><p>Tracing、SLO、事件、回滚和运营责任。</p></Link>
        </nav>
      </section>
    </div>
  );
}

export function A2AModuleExperience({ initialMode = "quick", className }: A2AModuleExperienceProps) {
  const sourceContent = loadA2ASourceContent();
  const publication = getPublishedModule("a2a");
  if (!publication) throw new Error("Missing A2A publication entry");
  const terms = publication.requiredTerms.map((termId) => {
    const term = terminology[termId];
    if (!term) throw new Error(`Unknown A2A term: ${termId}`);
    return { id: termId, zh: term.zh, en: term.en, description: term.description };
  });

  return (
    <UnifiedModuleScaffold
      className={`${styles.page} fieldbookTheme modulePage modulePilot${className ? ` ${className}` : ""}`}
      hero={{
        anchorId: "a2a-top",
        definition: "让独立 Agent 跨组织域交接一份可恢复、可追踪、可验收的任务档案。",
        enTitle: "Agent2Agent Protocol",
        evidenceCount: sourceContent.evidenceCards.length,
        facts: [
          { label: "采用条件", value: "独立 Agent 跨信任域委派" },
          { label: "返回对象", value: "Message 或 Task" },
          { label: "运行责任", value: "调用方与服务方分别验收" },
          { label: "完成证据", value: "Task 状态 + Artifact + 业务接受" },
        ],
        position: "A2A 用 Agent Card 发布候选能力；SendMessage 可直接返回 Message，也可创建带服务端 ID 的 Task，并以状态事件和可选 Artifact 交付。",
        questionCount: sourceContent.qa.length,
        shortTitle: "A2A",
        slug: "a2a",
        titleId: publication.titleId,
        zhTitle: "智能体间协议",
      }}
    >

      <DenseModuleReadingModes
        chapters={chapters}
        criticalBoundary="A2A 只处理独立 Agent 的水平协作；MCP / API 连接工具和数据，本地编排继续维护单一信任域内的细粒度执行。"
        defaultMode={initialMode}
        directories={{
          quick: [
            { id: "principle", label: "采用判断", eyebrow: "是否需要 A2A" },
            { id: "a2a-handoff-title", label: "Message 或 Task", eyebrow: "响应分叉" },
            { id: "quick-boundary-title", label: "三个协议边界", eyebrow: "责任不混用" },
          ],
          learn: chapters,
          field: [
            { id: "field-checklist-title", label: "现场核验顺序", eyebrow: "可执行 Runbook" },
            { id: "qa", label: `${sourceContent.qa.length} 题客户问题`, eyebrow: "按主题核验" },
            { id: "evidence", label: `${sourceContent.evidenceCards.length} 张证据卡`, eyebrow: "来源与范围" },
            { id: "cloud", label: "云能力与责任", eyebrow: "交付矩阵" },
            { id: "related-modules", label: "相关模块", eyebrow: "责任连接" },
          ],
        }}
        field={<FieldView evidenceCards={sourceContent.evidenceCards} questionGroups={sourceContent.fieldQuestionGroups} />}
        hashGroups={{
          quick: ["principle", "a2a-handoff-title", "quick-boundary-title"],
          learn: ["study-guide", "curriculum", ...chapters.map((chapter) => chapter.id)],
          field: ["field-checklist-title", "qa", "evidence", "cloud", "related-modules"],
        }}
        learn={<LearnView curriculum={sourceContent.curriculum} learning={sourceContent.learning} />}
        moduleName="A2A · 智能体间协议"
        quick={<QuickView knowledgeView={publication.knowledgeView ?? "delegated-task-lifecycle"} terms={terms} />}
        readerId="a2a-reading"
      />

      <footer className={styles.footer}>
        <div><strong>A2A · Agent2Agent Protocol</strong><p>对象、状态、身份和验收都留下可核对记录。<ModuleUpdatedAt value={publication.updatedAt ?? undefined} /></p></div>
        <nav><a href="#a2a-top">返回顶部</a><Link href="/references#module-a2a">来源与证据</Link></nav>
      </footer>
    </UnifiedModuleScaffold>
  );
}

export default A2AModuleExperience;
