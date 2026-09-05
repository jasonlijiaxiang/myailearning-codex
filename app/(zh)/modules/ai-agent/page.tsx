import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { chinesePageMetadata } from "../../../i18n/chinese-page-metadata";
import Link from "next/link";
import { balanceGridRows, gridSpan } from "../../../layout-utils.mjs";
import { BalancedGrid, CriticalBoundary, ModuleDeepDiveBlocks, ModuleEvidenceGrid, ModuleQaList, ModuleUpdatedAt } from "../../../module-content-components";
import { SystemLens } from "../../../fieldbook-interactions";
import { AgentRunLab } from "../../../flagship-labs";
import { sourceLedger } from "../../../reference-content.mjs";
import { AgentControlPrimer } from "../../../module-pilot-views";
import { getPublishedModule } from "../../../module-publication.mjs";
import { DenseModuleReadingModes } from "../../../dense-module-reading-modes";
import { requireModuleContent } from "../../../module-content-registry.mjs";
import type { AgentMechanicItem, AgentModuleBrief } from "../../../content-types";
import { UnifiedModuleScaffold } from "../../../unified-module-hero";
import agentStyles from "../../../agent-dense-reader.module.css";

export const metadata: Metadata = chinesePageMetadata({
  title: "Agent · 智能体 | 云计算 × AI 平台售前知识库",
  description: "AI Agent 的基础概念、工作循环、架构边界、云服务连接、评估治理与售前高频问题。",
  path: "/modules/ai-agent",
  enPath: "/en/modules/ai-agent",
});

const agentPublication = getPublishedModule("ai-agent");
const brief = requireModuleContent("ai-agent") as unknown as AgentModuleBrief;
const { facts, chapters, designChain, servingChain, conceptLinks, agentLoop, agentActions, engineeringScopes, harnessLayers, harnessNeighbors, harnessEvaluationDimensions, architecturePatterns, coreCapabilities, memoryLayers, interactionBoundaries, cloudHooks, systemLens, releaseAcceptanceGates, qa, evidenceCards, deepDives } = brief;
const conceptRows = balanceGridRows(conceptLinks, 4);

function AgentKnowledgeRows({ items, label }: { items: readonly AgentMechanicItem[]; label: string }) {
  return (
    <div className={agentStyles.knowledgeRows} aria-label={label}>
      {items.map((item, index) => (
        <details key={item.code} open={index === 0}>
          <summary><span className={agentStyles.knowledgeIdentity}><b>{item.code}</b><strong>{item.title}</strong></span><span className={agentStyles.knowledgeDigest}><b>定义</b>{item.definition}</span><span className={agentStyles.knowledgeDigest}><b>机制</b>{item.mechanism}</span></summary>
          <dl className={agentStyles.knowledgeInspector}><div><dt>输入 → 输出</dt><dd>{item.io}</dd></div><div><dt>常见失败</dt><dd>{item.failure}</dd></div><div><dt>工程控制</dt><dd>{item.control}</dd></div><div><dt>云服务连接</dt><dd>{item.cloud}</dd></div><div><dt>售前判断</dt><dd>{item.presales}</dd></div></dl>
        </details>
      ))}
    </div>
  );
}

export default function AgentModulePage() {
  return (
    <UnifiedModuleScaffold
      className={`fieldbookTheme modulePage modulePilot modulePilot--dedicated ${agentStyles.reader}`}
      hero={{ anchorId: "agent", definition: brief.definition, enTitle: "AI Agent", evidenceCount: evidenceCards.length, facts, position: brief.position, questionCount: qa.length, shortTitle: "Agent", slug: "ai-agent", titleId: "agent-title", zhTitle: "智能体" }}
    >
      <div className="dedicatedArticleLayout moduleReadingHost">
        <section className="section ragBody" aria-label="Agent 核心内容">
          <div className="sectionNumber">02</div>
          <div className="sectionBody"><DenseModuleReadingModes
              moduleName="Agent · 智能体"
              chapters={chapters}
              criticalBoundary={brief.criticalBoundary}
              directories={{ quick: [{ id: "agent-principle", label: "是否需要 Agent", eyebrow: "采用边界" }], learn: chapters.filter((chapter) => chapter.id !== "agent-principle"), field: [{ id: "cloud-opportunities", label: "云能力与责任", eyebrow: "交付边界" }, { id: "evidence", label: "证据与适用范围", eyebrow: "来源核验" }, { id: "qa", label: "客户问题", eyebrow: "现场回答" }] }}
              hashGroups={{ quick: ["agent-principle"], learn: ["learn-run", "concept-map", "agent-loop", "learn-harness", "harness", "boundaries", "capabilities", "memory-interaction", "learn-release", "patterns", "architecture", "agent-independent-depth", "poc"], field: ["cloud-opportunities", "evidence", "qa"] }}
              readerId="agent-reading"
              quick={(
                <><div className="decisionBanner"><p className="kicker">PRESALES POSITION</p><h2>Agent 的采用条件</h2><p>Agent 的采购价值来自受控的动态决策：确定性流程承载业务基线，只有确实依赖新证据选择下一步的局部才交给 Agent。</p></div><div id="agent-principle"><AgentControlPrimer /></div></>
              )}
              learn={(
                <><section className="learningStage" id="learn-run" aria-labelledby="agent-learn-run-title"><div className="subHead"><span>L1</span><div><p className="kicker">RUN MODEL</p><h2 id="agent-learn-run-title">任务运行与责任边界</h2><p className="sectionLead">建立 Agent 的工作循环，标出模型决策、应用控制和相关知识模块各自负责的部分。</p></div></div>
                    <div className="subsection" id="concept-map" data-quality-section="related-modules"><div className="subHead"><span>2.1</span><div><p className="kicker">KNOWLEDGE CONNECTIONS</p><h3>Agent 在知识地图中的位置与相关模块</h3></div></div>
                      <p className="sectionLead">Agent 的责任从模型选择下一步开始，到应用校验执行、读取权威状态并结束 Run。模型、Prompt、RAG、MCP / A2A、身份与评估分别提供推理、行为约束、证据、互操作、权限与验收。</p>
                      <div className="conceptGrid" data-count={conceptLinks.length} data-odd={conceptLinks.length % 2 === 1 ? "true" : "false"}>
                        {conceptRows.flatMap((row) => row.map((item) => (
                          <article key={item.concept} style={{ "--concept-span": gridSpan(row.length) } as CSSProperties}><div className="conceptCard"><div className="conceptMeta"><span>{item.relation}</span><Link href={item.href}>{item.owner} ↗</Link></div><h4>{item.concept}</h4><p>{item.local}</p></div></article>
                        )))}
                      </div>
                    </div>
                    <div className="subsection foundationSection" id="agent-loop" data-quality-section="principle"><div className="subHead"><span>2.2</span><div><p className="kicker">FOUNDATION &amp; LOOP</p><h3>Agent 的基础概念与工作循环</h3></div></div>
                      <div className="memoryCompare">
                        <article><p className="miniLabel">LLM APPLICATION</p><h4>模型参与某一步</h4><p>应用决定何时调用模型、输入什么和下一步走向；适合分类、抽取、生成和固定流程中的局部判断。</p></article>
                        <article className="externalMemory"><p className="miniLabel">AI AGENT</p><h4>模型管理下一步</h4><p>模型根据目标与当前状态选择动作，读取真实工具结果后继续、修正、完成或退出，但每个动作仍受应用侧控制规则（Control Plane）约束。</p></article>
                      </div>
                      <div className="principleDepth">
                        <header className="principleDepthIntro"><p className="miniLabel">PRESALES MECHANISM</p><h4>Agent 的四个关键动作：感知—思考—行动—观察</h4><p>工程上可拆为感知—思考—行动—观察：感知建立本轮任务状态，观察核对动作后的权威状态；观察结果进入下一轮，直到<strong>完成、失败、超时、超预算或转人工</strong>。</p></header>
                        <div className="chainWrap"><div className="chainLabel"><strong>单次任务运行 · Run</strong><span>Controlled agent loop</span></div><div className="flow runtimeFlow">{agentLoop.map((step, index) => (<div className="flowStep" key={step.zh}><span className="flowNo">{String(index + 1).padStart(2, "0")}</span><div className="flowTerm"><strong>{step.zh}</strong><small>{step.en}</small></div></div>))}</div></div>
                        <p className="paperBoundary"><strong>术语边界：</strong>本页的<strong>感知（Perceive）</strong>指请求、事件和多模态输入标准化；<strong>观察（Observe）</strong>指读取工具与环境的 ground truth、更新状态并决定继续或终止。框架可能把两者统称为 observation、context 或 state update，评估时以实际数据流为准。</p>
                        <AgentKnowledgeRows items={agentActions} label="Agent 四个关键动作的定义、机制与工程检查" />
                        <p className="paperBoundary"><strong>生产可观测边界：</strong>“思考（Reason）”不等于要求模型公开隐藏的思维链（Chain-of-Thought）。运行证据应按<strong>观察—决策—行动—反馈</strong>串联，并记录可审计的<strong>计划、决策摘要、工具调用、环境结果、策略判断与停止原因</strong>；这些足以复盘行为，同时避免把冗长推理文字误当成真实依据。<strong>模型会调用 API，不等于模型拥有 API 权限。</strong></p>
                        <div className="principleLimits">
                          <article><span>A</span><h5>真实反馈优先于模型描述</h5><p>工具返回、权威数据库状态和执行错误决定下一步；“模型说成功”不等于业务已经成功。</p></article>
                          <article><span>B</span><h5>循环必须有明确的最终状态</h5><p>完成、失败、超时、超预算、最大轮次和人工接管都要能被系统识别与审计。</p></article>
                          <article><span>C</span><h5>应用侧控制每一步</h5><p>模型可以建议下一步，但工具、身份、预算、审批、执行和终止条件仍由应用掌握。</p></article>
                        </div>
                        <Link className="paperAnchor" href="/references#source-react-2023">原理来源：ReAct 论文 ↗</Link>
                      </div>
                      <div className="workedExample"><div className="exampleQuestion"><span>客户任务</span><strong>“核对这宗跨区域理赔的材料，列出缺件并生成可审计的初审草稿。”</strong></div><div className="exampleSteps">
                        <article><span>01</span><h4>感知<small>Perceive</small></h4><p>把申请人身份、案件快照、扫描件、事故照片、当前条款版本和缺失字段整理为任务状态。</p></article>
                        <article><span>02</span><h4>思考与行动<small>Reason &amp; Act</small></h4><p>按新证据选择读取条款、核对案件或生成补件草稿；应用逐次校验来源、权限和工具参数。</p></article>
                        <article><span>03</span><h4>观察并决定是否继续<small>Observe &amp; Close</small></h4><p>回读案件与通知状态；材料完整或草稿获确认才结束，否则等待补件、转人工或安全停止。</p></article>
                      </div></div>
                      <CriticalBoundary>Agent 的“思考”不能替代业务控制。身份、权限、审批、幂等、补偿和审计必须由确定性系统执行；最终赔付资格、金额与案件状态永不由 Agent 自行决定。三平面以及 Safe Exit / Kill Switch 时序是本站基于事件报告、评测实践与 NCSC 临时建议形成的工程归纳，不是任一来源定义的统一标准、统一术语、通用触发阈值或恢复时限。</CriticalBoundary>
                      <SystemLens title="从运行、控制与恢复理解 Agent" lead="三个视角共同回答：Agent 如何推进任务、企业怎样限制它，以及失败后如何知道真实世界发生了什么。" panels={systemLens} />
                      <AgentRunLab />
                    </div>
                    <div className="architectureNotes"><p><strong>阶段产物：</strong>一张 Run 状态图，写明输入、动作、权威反馈、停止状态和责任系统。</p></div>
                  </section>
                  <section className="learningStage" id="learn-harness" aria-labelledby="agent-learn-harness-title"><div className="subHead"><span>L2</span><div><p className="kicker">RUNTIME CONTROL</p><h2 id="agent-learn-harness-title">Harness、能力与交互控制</h2><p className="sectionLead">把工具、状态、记忆、协议和恢复机制放进同一套运行合同。</p></div></div>
                    <div className="subsection" id="harness" data-quality-section="principle"><div className="subHead"><span>2.3</span><div><p className="kicker">AGENT RUNTIME &amp; CONTROL</p><h3>Harness：把模型能力变成可运行、可验证的任务系统</h3></div></div>
                      <p className="sectionLead">Harness 是围绕模型与环境的<strong>执行、反馈和控制系统</strong>，范围大于单一 Agent Framework。工作公式：<strong>Agent System = Model + Harness + Environment + Domain Rules</strong>。</p>
                      <div className={`tableWrap ${agentStyles.stackTable}`}><table><thead><tr><th>工程范围</th><th>名称与主要问题</th><th>输入</th><th>责任人</th><th>主要责任</th><th>不能替代</th></tr></thead><tbody>{engineeringScopes.map((item) => <tr className={item.name === "Harness Engineering" ? "highlight" : undefined} key={item.name}><th>{item.scope}</th><td data-label="名称与问题"><strong>{item.name}</strong><small>{item.question}</small></td><td data-label="输入">{item.input}</td><td data-label="责任人">{item.owner}</td><td data-label="主要责任">{item.owns}</td><td data-label="不能替代">{item.boundary}</td></tr>)}</tbody></table></div>
                      <dl className={agentStyles.harnessLayerLedger} aria-label="Harness 内外两层">{harnessLayers.map((item) => <div key={item.en}><dt><span>{item.en}</span><strong>{item.title}</strong></dt><dd>{item.body}</dd></div>)}</dl>
                      <CriticalBoundary>用户感受到的效果不是“模型能力”的单变量结果，而是<strong>Model × Harness × Task × Environment</strong>。同一个模型放进不同 Coding Agent，可能因为上下文策略、工具、补丁方式、命令沙箱、验证循环和恢复机制不同而得到完全不同的结果。</CriticalBoundary>
                      <div className={agentStyles.neighborLedger} role="list" aria-label="Harness 邻接概念边界">{harnessNeighbors.map((item) => <div key={item.name} role="listitem"><strong>{item.name}</strong><span>{item.role}</span><small>{item.boundary}</small></div>)}</div>
                      <div className="gates"><h4>怎样判断一套 Harness 更好</h4><ol className={agentStyles.evaluationLedger}>{harnessEvaluationDimensions.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol>
                        <p>先固定任务与干净环境快照、模型和推理配置、Prompt、工具与安全规则、网络、权限、数据、停止策略，以及 Token、时间、金额和工具调用预算，再进行多次运行与失败注入。成功率要区分至少一次成功的 pass@k 与连续可靠的 pass^k，并让安全硬门独立阻断。SWE-bench、Terminal-Bench、SWE-ReBench 等只能回答特定任务；Harness-Bench 正尝试分离 Harness 效应，NIST 也在推进 Agent 标准工作，但目前没有覆盖所有 Agent 的统一总分。</p>
                      </div>
                      <div className="workedExample"><div className="exampleQuestion"><span>持续更新的选型资料</span><strong>Coding Agent 产品与 Harness 选型雷达</strong></div><div className="exampleSteps">
                        <article><span>01</span><h4>官方事实<small>Product Facts</small></h4><p>确认产品形态、模型策略、执行环境、权限与生命周期，不用媒体印象代替产品文档。</p></article>
                        <article><span>02</span><h4>独立测评<small>Benchmarks</small></h4><p>按任务和实验配置读取排行榜，明确模型、Harness、预算、日期和复现条件。</p></article>
                        <article><span>03</span><h4>客户 PoC<small>Field Validation</small></h4><p>用同一真实仓库、权限、任务和验收标准复测，最终按客户约束做选择。</p></article>
                      </div><Link className="paperAnchor" href="/coding-agents">打开 Coding Agent 产品与 Harness 选型雷达 ↗</Link></div>
                      <div className="deepDiveSources" aria-label="本节依据"><span>本节依据</span><Link href="/references#source-openai-harness-engineering">OpenAI Harness Engineering ↘</Link><Link href="/references#source-anthropic-agent-evals">Anthropic Agent Evals ↘</Link><Link href="/references#source-harness-bench-2026">Harness-Bench ↘</Link></div>
                    </div>
                    <div className="subsection" id="boundaries"><div className="subHead"><span>2.4</span><div><p className="kicker">BOUNDARY MAP</p><h3>智能体、工作流、RAG 与聊天机器人的边界</h3></div></div>
                      <div className={`tableWrap ${agentStyles.stackTable}`}><table><thead><tr><th>模式</th><th>谁决定下一步</th><th>主要作用</th><th>是否改变外部状态</th><th>售前判断</th></tr></thead><tbody>
                        <tr><th>聊天机器人 · Chatbot</th><td data-label="谁决定下一步">通常由用户对话推进</td><td data-label="主要作用">自然语言交互与回答</td><td data-label="外部状态">不一定</td><td data-label="售前判断">“能聊天”不是 Agent 证明</td></tr>
                        <tr><th>RAG</th><td data-label="谁决定下一步">检索链或应用预设</td><td data-label="主要作用">给模型提供外部证据</td><td data-label="外部状态">通常不改变</td><td data-label="售前判断">是 Agent 可使用的数据工具</td></tr>
                        <tr><th>工作流 · Workflow</th><td data-label="谁决定下一步">代码、规则或流程图</td><td data-label="主要作用">稳定执行已知步骤</td><td data-label="外部状态">可以</td><td data-label="售前判断">高确定性路径优先</td></tr>
                        <tr className="highlight"><th>Agent</th><td data-label="谁决定下一步">模型基于状态动态选择</td><td data-label="主要作用">处理开放、多步与例外任务</td><td data-label="外部状态">可以，但必须授权</td><td data-label="售前判断">只把必要决策交给模型</td></tr>
                      </tbody></table></div>
                      <p className="sectionFootnote">生产系统常采用“工作流（Workflow）包住 Agent 决策点，Agent 再调用 RAG 与业务工具”的组合，不需要在四者中只选一个。</p>
                    </div>
                    <div className="subsection" id="capabilities"><div className="subHead"><span>2.5</span><div><p className="kicker">CORE COMPONENTS</p><h3>规划、记忆与工具：让四个动作持续运转</h3></div></div>
                      <p className="sectionLead">四个动作描述 Agent 每一轮“做什么”，三类组件说明它“靠什么持续完成多步任务”。规划决定路径，记忆保留必要信息，工具连接外部世界；三者共享一个可恢复、可审计的运行状态（Run State）。</p>
                      <AgentKnowledgeRows items={coreCapabilities} label="规划、记忆与工具的定义、机制与工程检查" />
                      <div className="memoryCompare retrievalCompare">
                        <article><p className="miniLabel">RUN STATE ≠ MEMORY</p><h4>运行状态是共同底座</h4><p>运行状态记录本次任务的目标、当前步骤、工具结果、预算和停止原因，应通过 Run ID、Checkpoint 与版本恢复。短期会话只服务当前交互；长期记忆才跨会话保留。Memory 是需治理的数据，不是模型魔法；不能把不断增长的聊天文本同时当状态机、数据库和审计日志。</p></article>
                        <article className="externalMemory"><p className="miniLabel">RAG ≠ MEMORY</p><h4>知识检索不等于记住用户</h4><p>RAG 从外部知识库取回可更新证据，回答“组织知道什么”；Memory 保存与主体和历史交互相关的信息，回答“这个 Agent 需要为谁记住什么”。二者都需要来源、权限和时效控制，但写入责任与生命周期不同。</p></article>
                      </div>
                      <BalancedGrid className="technicalNotes" maxColumns={3}>
                        <article><p className="miniLabel">DATA TOOLS</p><h4>数据工具 · Data Tools</h4><p>搜索、RAG、数据库查询和文件读取为判断提供证据，通常只读，但返回内容仍可能过期、越权或包含注入指令。</p></article>
                        <article><p className="miniLabel">ACTION TOOLS</p><h4>动作工具 · Action Tools</h4><p>创建工单、修改订单、发消息或执行代码会改变外部状态，必须强化身份、幂等、审批、回读与补偿。</p></article>
                        <article><p className="miniLabel">ORCHESTRATION TOOLS</p><h4>编排工具 · Orchestration Tools</h4><p>工作流、队列、子 Agent 和任务调度负责长任务、并行与交接；需要明确输入输出、超时、所有权和聚合验证。</p></article>
                      </BalancedGrid>
                    </div>
                    <div className="subsection" id="memory-interaction"><div className="subHead"><span>2.6</span><div><p className="kicker">MEMORY &amp; INTERACTION</p><h3>记忆分层与外部交互边界</h3></div></div>
                      <p className="sectionLead">Agent 的 Memory 不是一个不断增长的聊天框。任务状态、会话、长期记忆和权威事实有不同的写入责任、保留期和授权方式；工具调用、MCP、A2A 与 Computer Use 也解决不同连接问题。</p>
                      <div className={`tableWrap ${agentStyles.stackTable}`}><table><thead><tr><th>状态层</th><th>保存什么</th><th>何时读取</th><th>谁能写入</th><th>重要边界</th></tr></thead><tbody>{memoryLayers.map((item) => <tr key={item.en}><th>{item.layer}<small>{item.en}</small></th><td data-label="保存什么">{item.stores}</td><td data-label="何时读取">{item.read}</td><td data-label="谁能写入">{item.write}</td><td data-label="重要边界">{item.boundary}</td></tr>)}</tbody></table></div>
                      <div className={`tableWrap ${agentStyles.stackTable}`} style={{ marginTop: 18 }}><table><thead><tr><th>连接能力</th><th>主要解决什么</th><th>责任边界</th><th>不能替代什么</th></tr></thead><tbody>{interactionBoundaries.map((item) => <tr key={item.capability}><th>{item.capability}</th><td data-label="主要解决什么">{item.purpose}</td><td data-label="责任边界">{item.owns}</td><td data-label="不能替代什么">{item.boundary}</td></tr>)}</tbody></table></div>
                      <CriticalBoundary>RAG 主要提供组织知识，Memory 主要保存任务与主体相关状态，权威业务事实仍应回到事实源读取。连接协议能降低集成成本，却不会自动赋予身份、权限或生产可靠性。</CriticalBoundary>
                    </div>
                    <div className="architectureNotes"><p><strong>阶段产物：</strong>Harness 清单与动作、记忆合同，写清身份、工具、检查点和恢复方式。</p></div>
                  </section>
                  <section className="learningStage" id="learn-release" aria-labelledby="agent-learn-release-title"><div className="subHead"><span>L3</span><div><p className="kicker">ARCHITECTURE &amp; RELEASE</p><h2 id="agent-learn-release-title">架构选择与上线验证</h2><p className="sectionLead">比较架构模式，补齐生产托管条件，并用同一任务集验证自治范围。</p></div></div>
                    <div className="subsection" id="patterns"><div className="subHead"><span>2.7</span><div><p className="kicker">ARCHITECTURE PATTERNS</p><h3>从固定流程到动态决策的四种模式</h3></div></div>
                      <div className="variantList">{architecturePatterns.map((item) => (<article key={item.name}><div><p className="miniLabel">{item.cue}</p><h4>{item.name}</h4></div><p className="variantPipeline">{item.pipeline}</p><p>{item.boundary}</p></article>))}</div>
                      <div className="fitGrid" style={{ marginTop: 18 }}>
                        <article className="fit"><h4><span>✓</span>适合 Agent 的任务</h4><ul><li>步骤数量或工具路径无法提前确定</li><li>需要综合非结构化信息和环境反馈</li><li>有清晰的成功状态、沙箱和人工接管</li><li>动态判断带来的收益高于新增风险与成本</li></ul></article>
                        <article className="fit maybe"><h4><span>!</span>优先不用 Agent</h4><ul><li>固定规则已经能稳定、低成本完成</li><li>缺少可验证的最终状态或真实工具反馈</li><li>高风险动作无法审批、停止、隔离或补偿</li><li>Agent 自己的日志是唯一验收证据</li><li>没有代表性任务集和责任人持续运营</li></ul></article>
                      </div>
                    </div>
                    <div className="subsection" id="architecture"><div className="subHead"><span>2.8</span><div><p className="kicker">REFERENCE ARCHITECTURE</p><h3>Agent 生产参考架构</h3></div></div>
                      <div className="chainWrap"><div className="chainLabel"><strong>设计与治理链</strong><span>Design &amp; governance</span></div><div className="flow">{designChain.map((step, i) => <div className="flowStep" key={step.zh}><span className="flowNo">{String(i+1).padStart(2,"0")}</span><div className="flowTerm"><strong>{step.zh}</strong><small>{step.en}</small></div></div>)}</div><div className="chainLabel runtime"><strong>在线任务链</strong><span>Serving pipeline</span></div><div className="flow runtimeFlow">{servingChain.map((step, i) => <div className="flowStep" key={step.zh}><span className="flowNo">{String(i+1).padStart(2,"0")}</span><div className="flowTerm"><strong>{step.zh}</strong><small>{step.en}</small></div></div>)}</div></div>
                      <div className="architectureNotes">
                        <p><strong>执行面（Execution Plane）</strong>：模型、Harness、工具、沙箱和工作区执行任务；它可以动态选路，但不能自行授权或验收。</p>
                        <p><strong>控制面（Control Plane）</strong>：身份、策略、预算、审批、网络出口、调度、停止和凭据生命周期；Kill Switch 要能阻止新调度、取消父子 Run、撤权、断网并隔离迟到结果。</p>
                        <p><strong>证据面（Evidence Plane）</strong>：权威业务状态、环境断言、防篡改日志、独立评分器和人工裁决；执行主体无权改写关键验收证据。</p>
                        <p><strong>归纳边界：</strong>三平面以及 Safe Exit / Kill Switch 时序是本站基于事件报告、评测实践与 NCSC 临时建议形成的工程归纳，不是任一来源定义的统一标准、统一术语、通用触发阈值或恢复时限。</p>
                      </div>
                    </div>
                    <div className="subsection" id="agent-independent-depth" data-quality-section="deep-dive"><div className="subHead"><span>2.9</span><div><p className="kicker">INDEPENDENT KNOWLEDGE EXPANSION</p><h3>Agent 的生产托管条件</h3></div></div>
                      <p className="sectionLead">生产托管要回答四个问题：Run 以什么终态结束，工具怎样受权执行，进程崩溃后从哪里恢复，记忆与委托怎样维持最小信任。</p>
                      <ModuleDeepDiveBlocks blocks={deepDives} sourceLedger={sourceLedger} />
                    </div>
                    <div className="subsection" id="poc"><div className="subHead"><span>2.10</span><div><p className="kicker">POC PLAYBOOK</p><h3>Agent PoC 的自治风险阶梯</h3></div></div>
                      <p className="sectionLead">在同一理赔任务集、相同工具、相同身份与相同终态下，依次比较确定性 Workflow、Workflow 中的 LLM 步骤与单 Agent；多 Agent 只有在独立并行或隔离收益被数据证明后才进入候选。</p>
                      <div className="pocGrid">
                        <article><span>SHADOW</span><h4>任务与最终状态</h4><p>先以观察或建议模式运行，固定真实任务、可验证的最终状态、风险等级和现有人工 / 工作流表现。</p></article>
                        <article><span>READ ONLY</span><h4>最小可用工具流程</h4><p>接入完成任务必需的最少只读工具；验证身份、结构化参数、超时、停止、Trace 和后置条件。</p></article>
                        <article><span>CONTROLLED WRITE</span><h4>受控副作用</h4><p>只开放可逆或低风险写入，验证审批绑定、幂等、重复消息、结果未知、部分成功、补偿和恢复。</p></article>
                        <article><span>OPERATIONS</span><h4>灰度与运营交接</h4><p>按风险分别验收成功率、接管率、P95 和成功任务成本；通过当前检查后再扩大自治，不预设固定天数。</p></article>
                      </div>
                      <div className="gates"><h4>建议的通过 / 暂停条件</h4><dl className={agentStyles.releaseGateLedger}>{releaseAcceptanceGates.map((gate, index) => <div className={gate.releaseBlocking ? agentStyles.releaseGatePrimary : undefined} key={gate.name}><dt><span>{String(index + 1).padStart(2, "0")}</span>{gate.name}</dt><dd>{gate.check}</dd></div>)}</dl><p>带“上线硬门”标识的条件各自按业务风险和签字阈值执行；任何策略违规或高风险误执行都应暂停。运营、性能、成本与恢复证据也要与场景接受条件一致；总体平均不能掩盖高风险场景失败。</p></div>
                      <div className="architectureNotes"><p><strong>价值侧</strong>：只计算经权威终态验证的周期缩短、返工减少、首次材料完整率提升和可释放人工。</p><p><strong>完整 TCO</strong>：模型、检索、工具、平台、评估、人工接管、运营、安全与残余风险共同计入；不使用通用 ROI 数字替代客户基线。</p></div>
                    </div>
                    <div className="architectureNotes"><p><strong>阶段产物：</strong>候选架构、PoC 风险阶梯和带阈值的 Go / Hold / No-Go 记录。</p></div>
                  </section></>
              )}
              field={(
                <><div className="subsection cloudSection" id="cloud-opportunities" data-quality-section="cloud"><div className="subHead"><span>F1</span><div><p className="kicker">CLOUD OPPORTUNITY MAP</p><h3>Agent 技术环节与云服务机会</h3></div></div>
                    <div className="cloudIntro"><p>Agent 会把模型服务延伸到运行时、API、身份、数据、安全和运维。售前应先用厂商中立的能力描述拆解需求，再对应到当前云产品、地域、配额和计费。</p><span>模型只是其中一部分</span><span>身份贯穿每次调用</span><span>按成功任务核算成本</span></div>
                    <div className={`cloudTable tableWrap ${agentStyles.stackTable}`}><table><thead><tr><th>Agent 环节</th><th>可连接的云服务</th><th>客户价值</th><th>售前发现问题</th></tr></thead><tbody>{cloudHooks.map((item) => <tr key={item.stage}><th>{item.stage}</th><td data-label="云服务">{item.services}</td><td data-label="客户价值">{item.value}</td><td data-label="售前发现问题">{item.discover}</td></tr>)}</tbody></table></div>
                    <BalancedGrid className="solutionBundles" maxColumns={3}>
                      <article><p className="miniLabel">BUNDLE A</p><h4>企业服务 Agent</h4><p>模型服务 + RAG / 搜索 + CRM / 工单工具 + API 网关 + 用户身份 + 审批流 + Trace。</p><small>价值：从回答问题延伸到受控地完成服务流程</small></article>
                      <article><p className="miniLabel">BUNDLE B</p><h4>Agent 工具与身份平台</h4><p>托管 Runtime + MCP / API Gateway + 工作负载身份 + 密钥 + 策略引擎 + 沙箱。</p><small>价值：把零散 API 整理成可发现、可授权、可审计的工具入口</small></article>
                      <article><p className="miniLabel">BUNDLE C</p><h4>AgentOps 管理与监控</h4><p>Tracing / APM + 评估平台 + 日志 / SIEM + 发布回滚 + 配额预算 + FinOps。</p><small>价值：把长轨迹失败、风险和成本变成持续运营指标</small></article>
                    </BalancedGrid>
                  </div>
                  <div className="subsection" id="evidence" data-quality-section="evidence"><div className="subHead"><span>F2</span><div><p className="kicker">DATA WITH CAVEATS</p><h3>可引用事实及适用边界</h3></div></div><ModuleEvidenceGrid cards={evidenceCards} sourceLedger={sourceLedger} /></div>
                  <div className="subsection qaSection" id="qa" data-quality-section="qa"><div className="subHead"><span>F3</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h3>客户高频问题与深度回答</h3></div></div><ModuleQaList items={qa} sourceLedger={sourceLedger} directoryHref="/questions?module=ai-agent" /></div></>
              )}
            /></div></section></div>
      <footer><div><strong>云计算 × AI 平台售前知识库</strong></div><p>Agent 独立模块<ModuleUpdatedAt value={agentPublication?.updatedAt ?? undefined} /></p><a href="#agent">返回顶部 ↑</a></footer>
    </UnifiedModuleScaffold>
  );
}
