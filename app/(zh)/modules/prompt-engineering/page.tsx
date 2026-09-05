import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { chinesePageMetadata } from "../../../i18n/chinese-page-metadata";
import Link from "next/link";
import { balanceGridRows, gridSpan } from "../../../layout-utils.mjs";
import { BalancedGrid, CriticalBoundary, ModuleDeepDiveBlocks, ModuleEvidenceGrid, ModuleQaList, ModuleUpdatedAt } from "../../../module-content-components";
import { SystemLens } from "../../../fieldbook-interactions";
import { PromptAssemblyLab } from "../../../flagship-labs";
import { ModuleExtensionPrimer } from "../../../module-pilot-views";
import { getModuleExtensionView } from "../../../module-extension-views.mjs";
import { sourceLedger } from "../../../reference-content.mjs";
import { getPublishedModule } from "../../../module-publication.mjs";
import { DenseModuleReadingModes } from "../../../dense-module-reading-modes";
import { requireModuleContent } from "../../../module-content-registry.mjs";
import type { PromptModuleBrief } from "../../../content-types";
import { UnifiedModuleScaffold } from "../../../unified-module-hero";

export const metadata: Metadata = chinesePageMetadata({
  title: "提示词工程 · Prompt Engineering | 云计算 × AI 平台售前知识库",
  description: "提示词与上下文工程的基础机制、核心模式、版本治理、云服务连接、PoC 评估及售前深度问答。",
  path: "/modules/prompt-engineering",
  enPath: "/en/modules/prompt-engineering",
});

const promptPublication = getPublishedModule("prompt-engineering");
const promptExtensionView = getModuleExtensionView("prompt-engineering") ?? undefined;
const brief = requireModuleContent("prompt-engineering") as unknown as PromptModuleBrief;
const { facts, directories, conceptLinks, promptPatterns, messageResponsibilities, techniqueLadder, contextBudgetZones, promptSecurityScenarios, cloudHooks, systemLens, qa, evidenceCards, deepDives, caseStudy } = brief;
const chapters = [...directories.quick, ...directories.learn, ...directories.field];
const conceptRows = balanceGridRows(conceptLinks, 4);
const messageResponsibilityRows = balanceGridRows(messageResponsibilities, 4);

export default function PromptEngineeringModulePage() {
  return (
    <UnifiedModuleScaffold
      className="fieldbookTheme modulePage modulePilot modulePilot--dedicated promptModulePage"
      hero={{ anchorId: "prompt-engineering", definition: brief.definition, enTitle: "Prompt Engineering", evidenceCount: evidenceCards.length, facts, position: brief.position, questionCount: qa.length, shortTitle: "提示词", slug: "prompt-engineering", titleId: "prompt-title", zhTitle: "提示词工程" }}
    >
      <div className="dedicatedArticleLayout moduleReadingHost">
        <section className="section ragBody" aria-label="提示词工程核心内容">
          <div className="sectionNumber">05</div>
          <div className="sectionBody">
            <DenseModuleReadingModes
              moduleName="提示词工程"
              chapters={chapters}
              criticalBoundary={brief.criticalBoundary}
              directories={directories}
              hashGroups={{
                quick: ["context-assembly", "prompt-engineering-extension-primer-title", "quick-triage"],
                learn: ["learn-input", "prompt-foundation", "message-hierarchy", "learn-diagnose", "patterns", "prompt-diagnostics", "templates", "fit-check", "learn-release", "version-governance", "prompt-independent-depth", "poc", "concept-map"],
                field: ["evidence", "cloud-opportunities", "qa"],
              }}
              readerId="module-reading"
              quick={(
                <><div id="context-assembly"><ModuleExtensionPrimer slug="prompt-engineering" view={promptExtensionView} /></div>
                  <div className="decisionBanner"><p className="kicker">PRESALES POSITION</p><h3>Prompt 的发布范围</h3><p>生产级提示工程把提示、模型、上下文和工具作为同一发布单元，持续完成测试、审计、回滚和运营。</p></div>
                  <div className="subsection" id="quick-triage" data-quality-section="decisions">
                    <div className="subHead"><span>Q1</span><div><p className="kicker">FAILURE ROUTING</p><h3>失败症状与处理层</h3></div></div>
                    <p className="sectionLead">按症状选择处理层；知识、权限、工具或基础模型的问题不应继续堆叠提示文字。</p>
                    <div className="tableWrap" role="region" aria-label="提示词失败症状与优先处理层" tabIndex={0}><table><caption className="srOnly">提示词失败症状、优先路线与主要责任模块</caption><thead><tr><th scope="col">观察到的失败</th><th scope="col">优先路线</th><th scope="col">主要责任模块</th></tr></thead><tbody>{caseStudy.failureRoutes.map((route) => (<tr key={route.symptom}><th scope="row">{route.symptom}</th><td>{route.route}</td><td>{route.owner}</td></tr>))}</tbody></table></div>
                  </div></>
              )}
              learn={(
                <>
                  <section className="learningStage" id="learn-input" aria-labelledby="prompt-learn-input-title"><div className="subHead"><span>L1</span><div><p className="kicker">INPUT CONTRACT</p><h2 id="prompt-learn-input-title">调用输入与责任边界</h2><p className="sectionLead">拆开 Prompt、动态上下文、工具接口和应用控制，形成一次可验证调用的输入合同。</p></div></div>
                    <div className="subsection foundationSection" id="prompt-foundation" data-quality-section="principle"><div className="subHead"><span>5.2</span><div><p className="kicker">FOUNDATION &amp; BOUNDARY</p><h3>Prompt 是什么，以及 Context Engineering 的边界</h3></div></div>
                      <div className="memoryCompare">
                        <article><p className="miniLabel">PROMPT ENGINEERING</p><h4>提示词工程 · Prompt Engineering</h4><p>设计任务、规则、示例和输出要求，让模型更稳定地完成一个已定义任务；主要优化“怎么表达、怎样验证”。</p></article>
                        <article className="externalMemory"><p className="miniLabel">CONTEXT ENGINEERING</p><h4>上下文工程 · Context Engineering</h4><p>在每次调用前动态选择并组装指令、身份、会话、证据、工具和结果；主要优化“此刻应该让模型看到什么”。</p></article>
                      </div>
                      <BalancedGrid className="technicalNotes" maxColumns={4}>
                        <article><p className="miniLabel">ONE TURN</p><h4>Prompt Engineering</h4><p>解决“这一轮应该怎样告诉模型”，主要设计任务说明、示例、约束和输出契约。</p></article>
                        <article><p className="miniLabel">EACH CALL</p><h4>Context Engineering</h4><p>解决“每一步让模型看到什么”，负责选择和组织身份、历史、证据、工具与当前状态。</p></article>
                        <article><p className="miniLabel">WHOLE RUN</p><h4>Harness Engineering</h4><p>解决“整个任务怎样运行、行动、验证、恢复和受控”，把模型置于可执行的反馈循环中。</p></article>
                        <article><p className="miniLabel">WHOLE PRODUCT</p><h4>Agent Engineering</h4><p>解决“怎样把模型、Harness、业务系统、体验、治理和运营做成完整产品”。</p></article>
                      </BalancedGrid>
                      <p className="paperBoundary"><strong>边界：</strong>四者不是互斥职位或成熟度等级。Prompt 与 Context 是 Harness 每次调用的重要输入；Harness 是 Agent 产品的运行与控制层；Agent Engineering 再把业务流程、用户体验和长期运营纳入交付。<Link href="/modules/ai-agent#harness">进入 Agent 模块查看 Harness 机制与评估方法 ↗</Link></p>
                      <div className="principleDepth">
                        <header className="principleDepthIntro"><p className="miniLabel">PRESALES MECHANISM</p><h4>从“写一句话”升级为“构造一次受控调用”</h4><p>生产请求不是单一文字，而是由不同责任方提供的多段输入。技术售前应先解释每段信息的来源、信任级别和生命周期，再讨论措辞优化。</p></header>
                        <div className="ragMechanism" aria-label="提示调用的三类输入">
                          <article><span>01</span><h5>明确且稳定的指令 · Instructions</h5><p>应用目标、行为边界、语气和输出契约；由产品与工程维护，并进入版本、审批和回归流程。</p></article>
                          <article><span>02</span><h5>动态上下文 · Context</h5><p>用户问题、身份、会话、检索证据和业务状态；每次调用都可能不同，必须做权限、长度和来源控制。</p></article>
                          <article><span>03</span><h5>能力接口 · Tools &amp; Schema</h5><p>工具定义告诉模型可提出哪些调用；Schema 约束结果形状。真正授权、执行与业务校验仍在应用侧。</p></article>
                        </div>
                        <SystemLens title="Prompt 的调用、退化与发布" lead="把提示词从一句文本还原为完整系统输入，才能判断问题该通过文字、上下文、工具、评估还是应用控制解决。" panels={systemLens} />
                        <PromptAssemblyLab />
                        <section aria-labelledby="prompt-case-title">
                          <header className="principleDepthIntro"><p className="miniLabel">CONTROLLED APPLICATION CASE</p><h4 id="prompt-case-title">{caseStudy.title}</h4><p>{caseStudy.intro}</p></header>
                          <BalancedGrid className="technicalNotes" maxColumns={3}>
                            {caseStudy.stages.map((stage) => (<article key={stage.code}><p className="miniLabel">{stage.code}</p><h4>{stage.title}</h4><p>{stage.detail}</p><small>{stage.gate}</small></article>))}
                          </BalancedGrid>
                          <CriticalBoundary>该案例只自动化材料初审与说明草稿。结构化输出正确不等于事实正确、业务有效或已获授权；赔付资格、金额、状态变化和最终批准始终留在模型外。</CriticalBoundary>
                        </section>
                      </div>
                    </div>
                    <div className="subsection" id="message-hierarchy"><div className="subHead"><span>5.3</span><div><p className="kicker">MESSAGE &amp; RESPONSIBILITY</p><h3>消息、指令与应用责任</h3></div></div>
                      <div className="mechanicGrid" data-count={messageResponsibilities.length} data-odd={messageResponsibilities.length % 2 === 1 ? "true" : "false"}>
                        {messageResponsibilityRows.flatMap((row) => row.map((item, index) => (
                          <article className={index === row.length - 1 ? "mechanicRowEnd" : undefined} key={item.code} style={{ "--mechanic-span": gridSpan(row.length) } as CSSProperties}><span className="mechanicNo">{item.code}</span><h4>{item.title}</h4><p>{item.body}</p><small>{item.control}</small></article>
                        )))}
                      </div>
                    </div>
                    <div className="architectureNotes"><p><strong>阶段产物：</strong>调用输入清单，标明每段内容的来源、信任级别、版本和执行责任。</p></div>
                  </section>
                  <section className="learningStage" id="learn-diagnose" aria-labelledby="prompt-learn-diagnose-title"><div className="subHead"><span>L2</span><div><p className="kicker">DIAGNOSIS &amp; TEMPLATE</p><h2 id="prompt-learn-diagnose-title">失败诊断与模板设计</h2><p className="sectionLead">按失败症状选择模式，控制上下文预算，并把稳定方案写成可维护模板。</p></div></div>
                    <div className="subsection" id="patterns"><div className="subHead"><span>5.4</span><div><p className="kicker">CORE PATTERNS</p><h3>五种常用模式及适用边界</h3></div></div>
                      <div className="variantList">{promptPatterns.map((item) => (<article key={item.name}><div><p className="miniLabel">{item.cue}</p><h4>{item.name}</h4></div><p className="variantPipeline">{item.pipeline}</p><p>{item.boundary}</p></article>))}</div>
                    </div>
                    <div className="subsection" id="prompt-diagnostics"><div className="subHead"><span>5.5</span><div><p className="kicker">TECHNIQUE DIAGNOSTICS</p><h3>失败症状与技术路线</h3></div></div>
                      <div className="tableWrap" role="region" aria-label="提示词技术选择诊断表" tabIndex={0}><table><caption className="srOnly">失败症状、优先技术、改变内容与选择边界</caption><thead><tr><th scope="col">失败症状</th><th scope="col">优先技术</th><th scope="col">实际改变什么</th><th scope="col">选择边界</th></tr></thead><tbody>{techniqueLadder.map((item) => <tr key={item.technique}><th scope="row">{item.symptom}</th><td>{item.technique}</td><td>{item.change}</td><td>{item.boundary}</td></tr>)}</tbody></table></div>
                      <div className="tableWrap" role="region" aria-label="上下文预算分区与治理方式" style={{ marginTop: 18 }} tabIndex={0}><table><caption className="srOnly">上下文预算区、内容与治理方式</caption><thead><tr><th scope="col">上下文预算区</th><th scope="col">放什么</th><th scope="col">治理方式</th></tr></thead><tbody>{contextBudgetZones.map((item) => <tr key={item.en}><th scope="row">{item.zone}<small>{item.en}</small></th><td>{item.content}</td><td>{item.control}</td></tr>)}</tbody></table></div>
                      <div className="tableWrap" role="region" aria-label="提示词安全威胁与控制" style={{ marginTop: 18 }} tabIndex={0}><table><caption className="srOnly">提示词安全威胁、进入来源与主要控制</caption><thead><tr><th scope="col">威胁</th><th scope="col">从哪里进入</th><th scope="col">主要控制</th></tr></thead><tbody>{promptSecurityScenarios.map((item) => <tr key={item.threat}><th scope="row">{item.threat}</th><td>{item.source}</td><td>{item.control}</td></tr>)}</tbody></table></div>
                      <CriticalBoundary>Prompt Chaining、ReAct 与工具循环一旦涉及外部状态、重试和停止，就应进入工作流或 Agent 编排层。推理模型也不需要售前人员要求公开完整思维链；应评估的是可验证答案、证据、工具轨迹与业务终态。</CriticalBoundary>
                    </div>
                    <div className="subsection" id="templates"><div className="subHead"><span>5.6</span><div><p className="kicker">TEMPLATES &amp; VARIABLES</p><h3>可维护的提示模板 · Prompt Template</h3></div></div>
                      <div className="tableWrap" role="region" aria-label="提示模板组成与治理方式" tabIndex={0}><table><caption className="srOnly">提示模板组成、内容边界、治理方式与售前发现问题</caption><thead><tr><th scope="col">组成</th><th scope="col">放什么</th><th scope="col">不要放什么</th><th scope="col">治理方式</th><th scope="col">售前发现问题</th></tr></thead><tbody>
                        <tr><th scope="row">目标 / Task</th><td>单一可验证任务与成功定义</td><td>多个互相冲突的目标</td><td>任务 ID + 负责人</td><td>成功由谁判断？</td></tr>
                        <tr><th scope="row">约束 / Constraints</th><td>适用范围、拒答和输出规则</td><td>真正的授权或密钥</td><td>策略版本 + 安全评审</td><td>哪些规则必须硬执行？</td></tr>
                        <tr><th scope="row">变量 / Variables</th><td>已校验输入、身份与业务状态</td><td>未分隔的不可信字符串</td><td>类型、长度、来源、脱敏</td><td>变量来自谁？能否被篡改？</td></tr>
                        <tr><th scope="row">示例 / Examples</th><td>主路径、边界和拒答样例</td><td>偶然 Demo 或过时政策</td><td>与评估集联动复核</td><td>示例覆盖哪些真实分组？</td></tr>
                        <tr><th scope="row">输出 / Output Contract</th><td>面向用户的格式或系统 Schema</td><td>只写“请输出 JSON”</td><td>Schema + 应用校验</td><td>下游如何处理失败？</td></tr>
                      </tbody></table></div>
                      <BalancedGrid className="technicalNotes" maxColumns={3}>
                        <article><p className="miniLabel">SEPARATION</p><h4>指令与数据分离</h4><p>使用清晰字段、标签或消息边界标记指令、示例和外部数据；分隔有助理解，但本身不能阻止提示注入。</p></article>
                        <article><p className="miniLabel">TYPED INPUT</p><h4>变量校验与注入</h4><p>动态值应经过类型、长度、权限和敏感级别校验；模板字符串拼接需要作为潜在数据入口治理。</p></article>
                        <article><p className="miniLabel">REUSABLE PREFIX</p><h4>稳定前缀便于缓存</h4><p>把明确且稳定的指令和常用示例放在前部、动态数据放在后部，既便于维护，也可能利用模型服务的提示缓存（Prompt Caching）。</p></article>
                      </BalancedGrid>
                    </div>
                    <div className="subsection" id="fit-check"><div className="subHead"><span>5.7</span><div><p className="kicker">FIT CHECK</p><h3>什么问题适合由 Prompt 解决</h3></div></div>
                      <div className="fitGrid">
                        <article className="fit yes"><h4><span>✓</span> 优先提示优化</h4><ul><li>任务目标、语气或输出要求表达不清</li><li>模型需要少量示例理解标签或边界</li><li>证据已进入上下文但使用方式不稳定</li><li>需要结构化输出或明确拒答条件</li><li>同一任务需要可维护模板和变量</li></ul></article>
                        <article className="fit maybe"><h4><span>△</span> 应先改其他层</h4><ul><li>缺少最新、权威或有权限的知识</li><li>任务超过模型能力或上下文容量</li><li>需要确定性计算、授权或事务执行</li><li>检索、工具或源数据本身错误</li><li>核心瓶颈是延迟、容量或成本</li></ul></article>
                      </div>
                    </div>
                    <div className="architectureNotes"><p><strong>阶段产物：</strong>失败路由表和可维护模板，包含变量校验、上下文预算与模型外控制项。</p></div>
                  </section>
                  <section className="learningStage" id="learn-release" aria-labelledby="prompt-learn-release-title"><div className="subHead"><span>L3</span><div><p className="kicker">RELEASE &amp; VALIDATION</p><h2 id="prompt-learn-release-title">版本发布与验证</h2><p className="sectionLead">把完整调用配置纳入版本、回归、灰度和 PoC，并明确需要转交的责任模块。</p></div></div>
                    <div className="subsection" id="version-governance"><div className="subHead"><span>5.8</span><div><p className="kicker">MODEL &amp; VERSION GOVERNANCE</p><h3>模型差异、提示版本与发布控制</h3></div></div>
                      <div className="tableWrap" role="region" aria-label="Prompt 完整调用配置的版本与发布控制" tabIndex={0}><table><caption className="srOnly">变化项、可能影响、记录字段、发布检查与回滚单位</caption><thead><tr><th scope="col">变化项</th><th scope="col">可能影响</th><th scope="col">必须记录</th><th scope="col">发布检查</th><th scope="col">回滚单位</th></tr></thead><tbody>
                        <tr><th scope="row">Prompt 模板</th><td>指令遵循、语气、拒答、token</td><td>prompt_version、变更人、目的</td><td>任务集 + 边界集回归</td><td>模板版本</td></tr>
                        <tr><th scope="row">模型 / 快照</th><td>能力、角色处理、时延、价格</td><td>provider、model_id、snapshot</td><td>同输入影子对比</td><td>模型路由</td></tr>
                        <tr><th scope="row">上下文策略</th><td>证据覆盖、噪声、位置与成本</td><td>检索、组装和截断版本</td><td>证据覆盖与忠实度</td><td>上下文策略</td></tr>
                        <tr><th scope="row">Tool / Schema</th><td>工具选择、参数与下游兼容</td><td>tool_set、schema_version</td><td>模拟执行 + 负例</td><td>工具 / Schema</td></tr>
                        <tr className="highlight"><th scope="row">完整调用配置</th><td>端到端任务成功与风险</td><td>以上全部 + eval_set</td><td>灰度、告警、人工签署</td><td>发布 Bundle</td></tr>
                      </tbody></table></div>
                      <p className="sectionFootnote">Prompt 的可迁移部分是业务意图与测试集；角色名称、工具协议、结构化输出和模型特有技巧应放在薄适配层，不应假设跨模型逐字复制仍然等价。</p>
                    </div>
                    <div className="subsection" id="prompt-independent-depth" data-quality-section="deep-dive"><div className="subHead"><span>5.9</span><div><p className="kicker">INDEPENDENT KNOWLEDGE EXPANSION</p><h3>提示词如何融入输入、发布与安全工程</h3></div></div>
                      <p className="sectionLead">本节不按技巧名单展开，而是回答生产系统更难的问题：冲突指令如何处理、Context 如何装配、输出何时可执行，以及提示注入成功时如何仍然限制真实影响。</p>
                      <ModuleDeepDiveBlocks blocks={deepDives} sourceLedger={sourceLedger} />
                    </div>
                    <div className="subsection" id="poc"><div className="subHead"><span>L3.3</span><div><p className="kicker">POC PLAYBOOK</p><h3>按发布风险组织 Prompt PoC</h3></div></div>
                      <div className="pocGrid">
                        <article><span>OBJECTIVE</span><h4>任务与基线</h4><p>按业务分布冻结真实输入、期望输出、错误成本、边界和现有流程表现；先判断问题是否应由 Prompt 改善。</p></article>
                        <article><span>CONTROLLED CHANGE</span><h4>单变量迭代</h4><p>从最小提示开始；按失败加入示例、Grounding、Schema 或工具定义，一次只改变一个主要因素并保留归因。</p></article>
                        <article><span>RELEASE BUNDLE</span><h4>完整配置比较</h4><p>把模型、Prompt、Context 组装、工具、Schema 与安全策略作为发布包，比较任务质量、P95、token 和成功成本。</p></article>
                        <article><span>CANARY</span><h4>安全与灰度</h4><p>测试冲突指令、Source–Sink 注入、敏感数据、错误工具参数和回滚；达到当前门禁后再放量，周期由风险决定。</p></article>
                      </div>
                      <div className="gates"><h4>建议的 Go / No-Go 门槛结构</h4><div className="gateList"><span>任务成功率</span><span>关键字段正确率</span><span>Schema 通过率</span><span>拒答正确率</span><span>工具选择 / 参数</span><span>注入与越权</span><span>P95 / token</span><span>单次成功成本</span></div><p>具体阈值由客户风险、现有基线和候选云服务实测共同确定；平均分不能掩盖高风险场景失败。</p></div>
                    </div>
                    <div className="subsection" id="concept-map" data-quality-section="related-modules"><div className="subHead"><span>L3.4</span><div><p className="kicker">KNOWLEDGE CONNECTIONS</p><h3>提示词工程在知识地图中的位置与相关模块</h3></div></div>
                      <p className="sectionLead">本模块聚焦“如何表达任务并治理模型输入”。知识检索、Agent 规划、API 授权、模型推理和评估各有独立主模块；这里给出必要连接，避免把整个 AI 应用都误称为 Prompt Engineering。</p>
                      <div className="conceptGrid" data-count={conceptLinks.length} data-odd={conceptLinks.length % 2 === 1 ? "true" : "false"}>
                        {conceptRows.flatMap((row) => row.map((item) => (
                          <article key={item.concept} style={{ "--concept-span": gridSpan(row.length) } as CSSProperties}><div className="conceptCard"><div className="conceptMeta"><span>{item.relation}</span><Link href={item.href}>{item.owner} ↗</Link></div><h4>{item.concept}</h4><p>{item.local}</p></div></article>
                        )))}
                      </div>
                    </div>
                    <div className="architectureNotes"><p><strong>阶段产物：</strong>版本化发布包、PoC 门槛和责任转交清单，可直接进入灰度评审。</p></div>
                  </section>
                </>
              )}
              field={(
                <><div className="subsection" id="evidence" data-quality-section="evidence"><div className="subHead"><span>F1</span><div><p className="kicker">EVIDENCE WITH BOUNDARIES</p><h3>可引用事实及适用边界</h3></div></div><ModuleEvidenceGrid cards={evidenceCards} sourceLedger={sourceLedger} maxColumns={3} /></div>
                  <div className="subsection cloudSection" id="cloud-opportunities" data-quality-section="cloud"><div className="subHead"><span>F2</span><div><p className="kicker">CLOUD OPPORTUNITY MAP</p><h3>提示词工程与云服务机会</h3></div></div>
                    <div className="cloudIntro"><p>Prompt 是整体方案中的一个配置面。真正可销售、可验收的能力来自模型接入、上下文供给、工具编排、安全、发布和持续运营的组合。</p><span>能力先于产品名</span><span>模型与提示共同验收</span><span>当期规格单独核验</span></div>
                    <div className="cloudTable tableWrap" role="region" aria-label="提示词工程云能力与客户价值" tabIndex={0}><table><caption className="srOnly">交付环节、可连接的云服务、客户价值与售前发现问题</caption><thead><tr><th scope="col">环节</th><th scope="col">可连接的云服务</th><th scope="col">客户价值</th><th scope="col">售前发现问题</th></tr></thead><tbody>{cloudHooks.map((item) => <tr key={item.stage}><th scope="row">{item.stage}</th><td>{item.services}</td><td>{item.value}</td><td>{item.discover}</td></tr>)}</tbody></table></div>
                    <BalancedGrid className="solutionBundles" maxColumns={3}>
                      <article><p className="miniLabel">BUNDLE A</p><h4>生产级模型接入</h4><p>模型服务 + AI 网关 + Prompt / 配置管理 + 密钥 + 限流 + Tracing。</p><small>购买角色：应用平台、云平台、安全与架构团队</small></article>
                      <article><p className="miniLabel">BUNDLE B</p><h4>可评估发布流水线</h4><p>评估集 + CI/CD + 模型 / Prompt 注册 + 灰度 + 回滚 + 质量告警。</p><small>购买角色：AI 平台、测试、产品与业务负责人</small></article>
                      <article><p className="miniLabel">BUNDLE C</p><h4>安全工具与数据连接</h4><p>API 网关 + IAM + 工作流 / 函数 + DLP + 审批 + 审计 + 私网连接。</p><small>购买角色：集成团队、安全、数据与业务系统负责人</small></article>
                    </BalancedGrid>
                  </div>
                  <div className="subsection qaSection" id="qa" data-quality-section="qa"><div className="subHead"><span>F3</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h3>客户高频问题与深度回答</h3></div></div><ModuleQaList items={qa} sourceLedger={sourceLedger} directoryHref="/questions?module=prompt-engineering" /></div></>
              )}
            /></div></section></div>
      <footer><div><strong>云计算 × AI 平台售前知识库</strong></div><p>提示词工程独立模块<ModuleUpdatedAt value={promptPublication?.updatedAt ?? undefined} /></p><a href="#prompt-engineering">返回顶部 ↑</a></footer>
    </UnifiedModuleScaffold>
  );
}
