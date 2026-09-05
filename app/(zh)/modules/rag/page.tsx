import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { chinesePageMetadata } from "../../../i18n/chinese-page-metadata";
import Link from "next/link";

import { balanceGridRows, gridSpan } from "../../../layout-utils.mjs";
import { BalancedGrid, CriticalBoundary, ModuleDeepDiveBlocks, ModuleEvidenceGrid, ModuleLearningStudio, ModuleQaList, ModuleUpdatedAt } from "../../../module-content-components";
import { DenseModuleReadingModes } from "../../../dense-module-reading-modes";
import { RagRetrievalLab } from "../../../flagship-labs";
import { sourceLedger } from "../../../reference-content.mjs";
import { RagArchitecturePrimer } from "../../../module-pilot-views";
import { getPublishedModule } from "../../../module-publication.mjs";
import { requireModuleContent } from "../../../module-content-registry.mjs";
import type { RagModuleBrief } from "../../../content-types";
import { UnifiedModuleScaffold } from "../../../unified-module-hero";

export const metadata: Metadata = chinesePageMetadata({
  title: "RAG · 检索增强生成 | 云计算 × AI 平台售前知识库",
  description: "从适用性、证据契约、离线与在线生命周期、模型选型、评估、生产控制和经济性系统理解 RAG。",
  path: "/modules/rag",
  enPath: "/en/modules/rag",
});

const ragPublication = getPublishedModule("rag");
const brief = requireModuleContent("rag") as unknown as RagModuleBrief;
const { facts, quickDirectory, learnDirectory, fieldDirectory, conceptLinks, adoptionChoices, evidenceContract, offlineLifecycle, onlineLifecycle, modelStack, failureChain, productionControls, cloudHooks, economicsStages, extensionChoices, protocolBoundaries, qa, evidenceCards, deepDives, learning } = brief;
const chapters = [...quickDirectory, ...learnDirectory, ...fieldDirectory];
const conceptRows = balanceGridRows(conceptLinks, 4);

function SourceLinks({ sourceIds, label }: { sourceIds: readonly string[]; label: string }) {
  return (
    <div className="deepDiveSources" aria-label={label}><span>来源</span>{sourceIds.map((sourceId) => {
      const source = sourceLedger[sourceId as keyof typeof sourceLedger];
      if (!source) throw new Error(`RAG 页面引用未知来源：${sourceId}`);
      return <Link href={`/references#source-${sourceId}`} key={sourceId}>{source.shortTitle} ↗</Link>;
    })}</div>
  );
}

export default function RagModulePage() {
  return (
    <UnifiedModuleScaffold
      className="fieldbookTheme modulePage modulePilot modulePilot--dedicated moduleFocused"
      hero={{
        anchorId: "rag", definition: brief.definition, enTitle: "Retrieval-Augmented Generation", evidenceCount: evidenceCards.length,
        facts, position: brief.position, questionCount: qa.length, shortTitle: "RAG", slug: "rag", titleId: "rag-title", zhTitle: "检索增强生成",
      }}
    >
      <div className="dedicatedArticleLayout moduleReadingHost">
        <section className="section ragBody" aria-label="RAG 核心内容">
          <div className="sectionNumber">02</div>
          <div className="sectionBody">
            <DenseModuleReadingModes
              chapters={chapters}
              criticalBoundary={brief.criticalBoundary}
              directories={{ quick: quickDirectory, learn: learnDirectory, field: fieldDirectory }}
              moduleName="RAG · 检索增强生成"
              hashGroups={{
                quick: ["fit", "knowledge-location"],
                learn: ["evidence-contract", "evidence-lifecycle", "model-selection", "measurement", "production", "extensions", "practice"],
                field: ["cloud", "evidence", "qa", "related-modules"],
              }}
              readerId="module-reading"
              quick={(
                <>
                  <div className="decisionBanner"><p className="kicker">THE MAIN QUESTION</p><h2>核心问题</h2><p>如何让一条回答只使用当前用户有权访问、仍然有效、能够回到原文的证据，并在证据不足时停下来？</p></div>
                  <RagArchitecturePrimer />
                  <div className="subsection foundationSection" id="knowledge-location" data-quality-section="principle">
                    <div className="subHead"><span>Q1</span><div><p className="kicker">KNOWLEDGE LOCATION</p><h3>知识应放在模型权重还是外部证据中</h3></div></div>
                    <div className="memoryCompare">
                      <article><p className="miniLabel">PARAMETRIC MEMORY</p><h4>参数化知识 · Parametric Knowledge</h4><p>模型训练时压缩进权重的语言规律与知识。调用快、泛化强，但单条知识何时写入、能否撤回、来源在哪里，通常不能由应用精确控制。</p></article>
                      <article className="externalMemory"><p className="miniLabel">EXTERNAL EVIDENCE</p><h4>外部证据 · External Evidence</h4><p>文档、数据库、搜索索引或知识图谱中的当前资料。它们可以独立更新、授权、撤回和审计，RAG 在请求发生时只取回与当前问题相关的部分。</p></article>
                    </div>
                  </div>
                </>
              )}
              learn={(
                <>
                  <div className="subsection foundationSection" id="evidence-contract" data-quality-section="principle">
                    <div className="subHead"><span>01</span><div><p className="kicker">EVIDENCE CONTRACT</p><h3>回答证据的成立条件</h3></div></div>
                    <p className="sectionLead">RAG 改变的是本次回答可使用的外部上下文，不会把资料永久写入模型权重。起点是由来源、版本、权限、引用和停止条件组成的证据契约。</p>
                    <section className="focusedDecisionLedger" aria-labelledby="route-baseline-title"><header><p className="kicker">SIMPLEST VIABLE ROUTE</p><h3 id="route-baseline-title">RAG 与更简单路线的采用比较</h3><p>同一个需求可能需要搜索、长上下文、RAG、SQL / API、微调或人工流程，也可能组合使用。业务问题与基线确定后，再比较必要能力。</p></header>
                      <div className="tableWrap" role="region" aria-label="RAG 与替代路线比较表" tabIndex={0}><table><caption className="srOnly">RAG 与替代路线比较</caption><thead><tr><th scope="col">路线</th><th scope="col">最适合</th><th scope="col">变化怎样生效</th><th scope="col">证据形态</th><th scope="col">不能忽略</th></tr></thead><tbody>{adoptionChoices.map((item) => <tr key={item.route}><th scope="row">{item.route}</th><td>{item.fit}</td><td>{item.change}</td><td>{item.evidence}</td><td>{item.limit}</td></tr>)}</tbody></table></div>
                    </section>
                    <div className="ragMechanism" aria-label="RAG 三步工作机制">
                      <article><span>01</span><h5>检索 · Retrieval</h5><p>从当前用户有权访问的知识源中找候选证据。相关性分数只能说明“与问题像不像”，不能证明来源真实、权威或仍然有效。</p></article>
                      <article><span>02</span><h5>增强 · Augmentation</h5><p>把通过权限、版本、去重和冲突处理的证据，与问题、引用格式和拒答规则一起组装成最终证据包。</p></article>
                      <article><span>03</span><h5>生成 · Generation</h5><p>模型基于证据回答、引用、限定或拒答；它仍可能忽略、误读或错误组合证据，因此生成环节必须单独验收。</p></article>
                    </div>
                    <div className="tableWrap" role="region" aria-label="回答证据契约表" tabIndex={0}><table><caption className="srOnly">回答证据契约</caption><thead><tr><th scope="col">证据契约字段</th><th scope="col">必须回答的问题</th><th scope="col">需要形成的产物</th><th scope="col">最低验收</th></tr></thead><tbody>{evidenceContract.map((item) => <tr key={item.field}><th scope="row">{item.field}</th><td>{item.question}</td><td>{item.output}</td><td>{item.acceptance}</td></tr>)}</tbody></table></div>
                    <SourceLinks sourceIds={["rag-original-2020", "alce-2023", "nist-zero-trust"]} label="证据契约来源" />
                  </div>

                  <div className="subsection" id="evidence-lifecycle">
                    <div className="subHead"><span>02</span><div><p className="kicker">TWO EVIDENCE LIFECYCLES</p><h3>离线证据与在线回答生命周期</h3></div></div>
                    <p className="sectionLead">两条链通过同一套稳定 ID、版本和权限语义衔接。Data Engineering 负责生产可靠的知识产物；RAG 负责证明这些产物能被正确召回、编排和用于回答。</p>
                    <section className="focusedDecisionLedger" aria-labelledby="offline-lifecycle-title"><header><p className="kicker">OFFLINE EVIDENCE LIFECYCLE</p><h3 id="offline-lifecycle-title">索引前的资料验收</h3><p>切片只是其中一步。没有权威源、版本裁决和负向变化传播，再精细的向量检索也会返回错误证据。</p></header>
                      <div className="tableWrap" role="region" aria-label="索引前资料验收表" tabIndex={0}><table><caption className="srOnly">索引前的资料验收</caption><thead><tr><th scope="col">阶段</th><th scope="col">输出</th><th scope="col">典型失败</th><th scope="col">RAG 所需验收</th></tr></thead><tbody>{offlineLifecycle.map((item) => <tr key={item.stage}><th scope="row">{item.stage}</th><td>{item.output}</td><td>{item.failure}</td><td>{item.acceptance}</td></tr>)}</tbody></table></div>
                    </section>
                    <section className="focusedDecisionLedger" aria-labelledby="online-lifecycle-title"><header><p className="kicker">ONLINE ANSWER LIFECYCLE</p><h3 id="online-lifecycle-title">在线回答的完整动作链</h3><p>问题含糊、条件缺失或证据冲突时，正确结果可能是追问、限定回答或转人工，而不是继续增加 Token。</p></header>
                      <div className="tableWrap" role="region" aria-label="在线回答动作链表" tabIndex={0}><table><caption className="srOnly">在线回答的完整动作链</caption><thead><tr><th scope="col">阶段</th><th scope="col">输出</th><th scope="col">典型失败</th><th scope="col">可观察信号</th></tr></thead><tbody>{onlineLifecycle.map((item) => <tr key={item.stage}><th scope="row">{item.stage}</th><td>{item.output}</td><td>{item.failure}</td><td>{item.signal}</td></tr>)}</tbody></table></div>
                    </section>
                    <CriticalBoundary>清洗、解析、Chunk 产物、索引发布和删除传播的完整方法归 AI 数据工程；RAG 只保留足以定义输入契约、检索实验和端到端验收的局部解释。</CriticalBoundary>
                  </div>

                  <div className="subsection" id="model-selection">
                    <div className="subHead"><span>03</span><div><p className="kicker">MODEL &amp; COMPONENT SELECTION</p><h3>RAG 组件选型</h3></div></div>
                    <p className="sectionLead">解析、Embedding、搜索、向量索引、Reranker、生成模型和可选 Judge 是不同采购与发布对象。每一项都应使用同一套“任务—约束—候选—实验—通过条件”方法，而不是用开源 / 商业二分法替代工程判断。</p>
                    <div className="tableWrap" role="region" aria-label="RAG 组件选型表" tabIndex={0}><table><caption className="srOnly">RAG 组件选型</caption><thead><tr><th scope="col">组件</th><th scope="col">主要选择维度</th><th scope="col">最小对比实验</th><th scope="col">必须一起版本化</th></tr></thead><tbody>{modelStack.map((item) => <tr key={item.component}><th scope="row">{item.component}</th><td>{item.choose}</td><td>{item.experiment}</td><td>{item.release}</td></tr>)}</tbody></table></div>
                    <CriticalBoundary>先固定任务数据、候选生成方式和验收切片，再比较模型。公开榜单、厂商实验和模型卡只能帮助形成候选，不能替代客户语料上的控制实验。</CriticalBoundary>
                    <SourceLinks sourceIds={["dpr-2020", "bert-reranker", "hnsw-2016", "rrf-2009", "beir-2021", "mteb-2023", "miracl-2023", "clirmatrix-2020"]} label="模型与检索选型来源" />
                    <RagRetrievalLab />
                  </div>

                  <div className="subsection" id="measurement" data-quality-section="deep-dive">
                    <div className="subHead"><span>04</span><div><p className="kicker">MEASUREMENT &amp; DIAGNOSIS</p><h3>证据链测量与失效定位</h3></div></div>
                    <p className="sectionLead">最终答案只是结果。诊断需要同时保存候选集、过滤结果、排序、最终证据包和回答主张；换更大模型只可能修复最后一段中的部分问题。</p>
                    <div className="tableWrap" role="region" aria-label="RAG 失效定位表" tabIndex={0}><table><caption className="srOnly">证据链失效定位</caption><thead><tr><th scope="col">失效层</th><th scope="col">客户看到的症状</th><th scope="col">先检查什么</th><th scope="col">主要责任</th></tr></thead><tbody>{failureChain.map((item) => <tr key={item.stage}><th scope="row">{item.stage}</th><td>{item.symptom}</td><td>{item.inspect}</td><td>{item.owner}</td></tr>)}</tbody></table></div>
                    <CriticalBoundary>平均分提高不能掩盖越权、错误承诺、关键证据缺失或高风险拒答失败。候选召回、最终上下文、引用和业务结果必须分别观察，并按风险切片。</CriticalBoundary>
                    <ModuleDeepDiveBlocks blocks={deepDives} sourceLedger={sourceLedger} />
                  </div>

                  <div className="subsection" id="production" data-quality-section="learning">
                    <div className="subHead"><span>05</span><div><p className="kicker">PRODUCTION CONTROL &amp; ECONOMICS</p><h3>生产控制、Trace 与经济性</h3></div></div>
                    <p className="sectionLead">生产控制不是问答列表的附录。每个控制都要落到证据链的输入、输出、版本、负责人和恢复动作；云服务只提供部分能力，不能转移客户的数据、授权和业务责任。</p>
                    <div className="tableWrap" role="region" aria-label="RAG 生产控制表" tabIndex={0}><table><caption className="srOnly">RAG 生产控制</caption><thead><tr><th scope="col">贯穿控制</th><th scope="col">RAG 本地要求</th><th scope="col">验收证据</th><th scope="col">责任主模块</th></tr></thead><tbody>{productionControls.map((item) => <tr key={item.control}><th scope="row">{item.control}</th><td>{item.local}</td><td>{item.evidence}</td><td>{item.owner}</td></tr>)}</tbody></table></div>
                    <section className="focusedDecisionLedger" aria-labelledby="economics-title"><header><p className="kicker">RISK-ADJUSTED ROI</p><h3 id="economics-title">风险调整后的 ROI</h3><p>PoC 从现状基线开始，并用生产数据逐步替换假设。模型分数不能直接变成采购回报。</p></header>
                      <div className="focusedDecisionRows">{economicsStages.map((item, index) => (<article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{item.title}</h4><p>{item.body}</p></div><div><strong>{item.decision}</strong></div></article>))}</div>
                    </section>
                    <BalancedGrid className="technicalNotes" maxColumns={3}>
                      <article><p className="miniLabel">GO</p><h4>扩大范围</h4><p>关键任务优于基线，严重错误受控，单位成功成本可接受，责任团队能够运营和恢复。</p></article>
                      <article><p className="miniLabel">REPAIR</p><h4>限定范围并整改</h4><p>业务假设仍成立，但失败集中在可定位的数据、检索、权限、模型或流程环节；先修复再复测。</p></article>
                      <article><p className="miniLabel">STOP</p><h4>停止或改用更简单路线</h4><p>没有权威资料、风险无法控制、价值不高于基线，或长上下文、搜索、SQL、规则和人工流程更合适。</p></article>
                    </BalancedGrid>
                    <SourceLinks sourceIds={["nist-genai-profile", "nist-aml-100-2e2025", "opentelemetry-genai-semconv", "opentelemetry-genai-observability-2026", "finops-unit-economics", "finops-ai-tools-considerations"]} label="生产控制与经济性来源" />
                  </div>

                  <div className="subsection" id="extensions">
                    <div className="subHead"><span>06</span><div><p className="kicker">OPTIONAL PATTERNS &amp; PROTOCOL BOUNDARIES</p><h3>RAG 扩展模式与采用条件</h3></div></div>
                    <p className="sectionLead">Naive / Advanced 描述检索管线复杂度，Graph 描述知识表示，Multimodal 描述输入与证据形态，Structured 描述事实源，Agentic 描述运行时控制。它们可以组合，但不是一条从低到高的成熟度阶梯。</p>
                    <div className="tableWrap" role="region" aria-label="RAG 扩展模式选择表" tabIndex={0}><table><caption className="srOnly">RAG 扩展模式选择</caption><thead><tr><th scope="col">模式</th><th scope="col">采用触发</th><th scope="col">新增能力</th><th scope="col">新增风险 / 成本</th><th scope="col">主要责任</th></tr></thead><tbody>{extensionChoices.map((item) => <tr key={item.pattern}><th scope="row">{item.pattern}</th><td>{item.trigger}</td><td>{item.adds}</td><td>{item.risk}</td><td>{item.owner}</td></tr>)}</tbody></table></div>
                    <section className="focusedDecisionLedger" aria-labelledby="protocol-boundary-title"><header><p className="kicker">AGENT · MCP · A2A</p><h3 id="protocol-boundary-title">Agent、MCP 与 A2A 的适用边界</h3><p>采用依据是系统是否出现动态控制、标准能力连接或跨 Agent 任务委派的真实需要，而非技术热度。</p></header>
                      <div className="tableWrap" role="region" aria-label="Agent、MCP 与 A2A 能力边界表" tabIndex={0}><table><caption className="srOnly">Agent、MCP 与 A2A 能力边界</caption><thead><tr><th scope="col">能力</th><th scope="col">什么时候需要</th><th scope="col">什么时候不需要</th><th scope="col">它真正负责什么</th></tr></thead><tbody>{protocolBoundaries.map((item) => <tr key={item.name}><th scope="row">{item.name}</th><td>{item.need}</td><td>{item.notNeed}</td><td>{item.responsibility}</td></tr>)}</tbody></table></div>
                    </section>
                    <CriticalBoundary>Agent 可以调用 RAG；MCP 可以暴露检索能力；A2A 可以委派完整任务。三者都不会自动改善资料质量、检索召回、证据忠实度、用户授权或生产可靠性。</CriticalBoundary>
                  </div>

                  <div className="subsection" id="practice" data-quality-section="learning">
                    <div className="subHead"><span>07</span><div><p className="kicker">LEARNING BY DELIVERABLE</p><h3>RAG 实战产物与通过标准</h3></div></div>
                    <ModuleLearningStudio content={learning} sourceLedger={sourceLedger} />
                  </div>
                </>
              )}
              field={(
                <>
                  <div className="subsection cloudSection" id="cloud" data-quality-section="cloud">
                    <div className="subHead"><span>F1</span><div><p className="kicker">CLOUD CAPABILITY CONTRACT</p><h3 id="cloud-capability-title">云能力、验收与责任映射</h3></div></div>
                    <p className="sectionLead">具体产品按实施当天的地域、生命周期状态、配额、SLA、网络和计费单位复核。</p>
                    <div className="tableWrap cloudTable" role="region" aria-label="RAG 云能力与交付责任表" tabIndex={0}><table><caption className="srOnly">RAG 云能力与交付责任</caption><thead><tr><th scope="col">技术环节</th><th scope="col">可连接的云能力</th><th scope="col">客户价值</th><th scope="col">发现问题</th><th scope="col">验收</th><th scope="col">责任边界</th></tr></thead><tbody>{cloudHooks.map((item) => <tr key={item.stage}><th scope="row">{item.stage}</th><td>{item.capability}</td><td>{item.value}</td><td>{item.discover}</td><td>{item.acceptance}</td><td>{item.responsibility}</td></tr>)}</tbody></table></div>
                  </div>
                  <div className="subsection" id="evidence" data-quality-section="evidence">
                    <div className="subHead"><span>F2</span><div><p className="kicker">EVIDENCE WITH LIMITS</p><h3>证据类型与适用范围</h3></div></div>
                    <ModuleEvidenceGrid cards={evidenceCards} sourceLedger={sourceLedger} />
                  </div>
                  <div className="subsection qaSection" id="qa" data-quality-section="qa">
                    <div className="subHead"><span>F3</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h3>客户高频问题与深度回答</h3></div></div>
                    <ModuleQaList items={qa} sourceLedger={sourceLedger} directoryHref="/questions?module=rag" />
                  </div>
                  <div className="subsection focusedRelated" id="related-modules" data-quality-section="related-modules">
                    <div className="subHead"><span>F4</span><div><p className="kicker">RELATED MODULES</p><h3>相关模块与责任归属</h3></div></div>
                    <p className="sectionLead">RAG 保留完成当前方案判断所需的局部解释；完整机制、治理与运营方法仍由以下模块负责，避免在一个页面复制整套知识库。</p>
                    <div className="conceptGrid" data-count={conceptLinks.length} data-odd={conceptLinks.length % 2 === 1 ? "true" : "false"}>
                      {conceptRows.flatMap((row) => row.map((item) => (
                        <article key={item.concept} style={{ "--concept-span": gridSpan(row.length) } as CSSProperties}>
                          <div className="conceptCard"><div className="conceptMeta"><span>{item.relation}</span><Link href={item.href}>{item.owner} ↗</Link></div><h4>{item.concept}</h4><p>{item.local}</p></div>
                        </article>
                      )))}
                    </div>
                  </div>
                </>
              )}
            />
          </div>
        </section>
      </div>
      <footer><div><strong>云计算 × AI 平台售前知识库</strong></div><p>RAG 深度模块<ModuleUpdatedAt value={ragPublication?.updatedAt ?? undefined} /></p><a href="#rag">返回顶部 ↑</a></footer>
    </UnifiedModuleScaffold>
  );
}
