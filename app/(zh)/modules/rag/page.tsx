import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { balanceGridRows, gridSpan } from "../../../layout-utils.mjs";
import {
  BalancedGrid,
  CriticalBoundary,
  ModuleDeepDiveBlocks,
  ModuleEvidenceGrid,
  ModuleLearningStudio,
  ModuleQaList,
  ModuleUpdatedAt,
} from "../../../module-content-components";
import { ModuleReadingNav, ReadingProgress, type ReadingSection } from "../../../fieldbook-interactions";
import { RagRetrievalLab } from "../../../flagship-labs";
import { sourceLedger } from "../../../reference-content.mjs";
import { evidenceCards, ragDeepDives, ragLearningContent, ragQa } from "../../../rag-content.mjs";
import { RagArchitecturePrimer } from "../../../module-pilot-views";
import { getPublishedModule } from "../../../module-publication.mjs";
import { englishModulePath } from "../../../i18n/locale-config.mjs";

export const metadata: Metadata = {
  title: "RAG · 检索增强生成 | 云计算 × AI 平台售前知识库",
  description: "从适用性、证据契约、离线与在线生命周期、模型选型、评估、生产控制和经济性系统理解 RAG。",
};

const ragPublication = getPublishedModule("rag");
const ragEnglishPath = englishModulePath("rag");

const conceptLinks = [
  { concept: "参数化知识与上下文窗口", owner: "大语言模型原理", href: "/modules/llm", relation: "模型边界", local: "解释模型权重、Token 与长上下文能做什么，不能替代外部证据治理。" },
  { concept: "接入、解析、清洗与索引生命周期", owner: "AI 数据工程", href: "/modules/data-engineering", relation: "知识供给", local: "负责把源资料变成带稳定 ID、版本、血缘和权限的检索产物。" },
  { concept: "版面、图表与视觉证据", owner: "多模态", href: "/modules/multimodal", relation: "复杂文档", local: "负责 OCR、版面和页面图像表示；RAG 负责怎样检索和使用这些证据。" },
  { concept: "指令、证据包与输出契约", owner: "提示词工程", href: "/modules/prompt-engineering", relation: "生成约束", local: "负责把检索结果、引用格式、拒答条件和结构化输出装配成模型输入。" },
  { concept: "黄金集、Judge 与发布门槛", owner: "评估", href: "/modules/evaluation", relation: "质量治理", local: "RAG 定义每一层要测什么；评估模块负责数据集、统计、校准与持续评估方法。" },
  { concept: "投毒、注入与数据泄漏", owner: "AI 安全", href: "/modules/security", relation: "威胁控制", local: "RAG 说明检索链上的攻击面；安全模块负责完整威胁模型、控制验证和事件响应。" },
  { concept: "版本、Trace、灰度与事故恢复", owner: "AI 应用运营", href: "/modules/ai-ops", relation: "生产运营", local: "RAG 提供专属 Span 与降级信号；AI Ops 负责跨组件发布、回滚和事故闭环。" },
  { concept: "业务基线、TCO 与 ROI", owner: "场景解决方案", href: "/modules/solution-patterns", relation: "投资判断", local: "RAG 解释技术成本驱动；完整价值、采用率、Build / Buy 和 ROI 由场景方案统领。" },
  { concept: "多步、自适应检索", owner: "Agent · 智能体", href: "/modules/ai-agent", relation: "可选控制", local: "只有问题确实需要动态分解、选源、循环和工具调用时，才把 RAG 作为 Agent 的知识工具。" },
  { concept: "把检索能力暴露给 Host", owner: "MCP", href: "/modules/mcp", relation: "可选协议", local: "MCP 可把检索服务标准化为 Resource 或 Tool，但不会自动增加检索质量、权限正确性或回答忠实度。" },
  { concept: "把完整任务委派给另一 Agent", owner: "A2A", href: "/modules/a2a", relation: "可选协议", local: "A2A 适合跨 Agent 的任务委派、状态与产物交换；只读知识问答通常不需要这层复杂度。" },
];

const conceptRows = balanceGridRows(conceptLinks, 4);

const adoptionChoices = [
  { route: "关键词搜索", fit: "编号、错误码、精确术语和短文档查找", change: "索引可独立更新", evidence: "命中文档或段落", limit: "不负责综合回答与主张级引用" },
  { route: "直接长上下文", fit: "语料小、稳定、可整体安全传入", change: "每次请求重新提供", evidence: "可设计引用", limit: "输入成本、位置敏感与权限装配仍需验证" },
  { route: "RAG", fit: "知识动态、跨源、需权限、引用或撤回", change: "证据链可独立发布", evidence: "回答可回到当前证据", limit: "增加数据链、检索链和评估复杂度" },
  { route: "SQL / API / 规则", fit: "实时交易、精确计算和确定性状态", change: "直接读取事实源", evidence: "结果来自权威系统", limit: "不适合把开放文档理解全部改写成查询" },
  { route: "微调", fit: "稳定语气、格式、行为或窄任务模式", change: "通过训练版本更新", evidence: "难以逐条归因", limit: "不适合作为频繁知识更新和撤回机制" },
  { route: "人工流程", fit: "证据不成熟、风险极高或必须专业签署", change: "由流程和人员维护", evidence: "人工记录", limit: "可作为基线、审批点或最终兜底" },
];

const evidenceContract = [
  { field: "权威来源", question: "谁有资格定义这个事实？", output: "来源系统、内容负责人、允许用途", acceptance: "非权威副本不能覆盖正式版本" },
  { field: "稳定坐标", question: "回答怎样回到原文？", output: "文档 ID、版本、页码 / 区域、Chunk ID", acceptance: "每个关键主张可定位到原始证据" },
  { field: "生效范围", question: "它在何时、何地、对谁有效？", output: "valid_from / valid_to、产品、地区、客户范围", acceptance: "过期或范围不符的证据不能进入最终上下文" },
  { field: "授权边界", question: "当前用户能否看到这条证据？", output: "租户、主体、组、文档 / 字段 ACL", acceptance: "候选、缓存、上下文与返回都执行同一授权语义" },
  { field: "冲突规则", question: "两个来源不一致时怎么办？", output: "优先级、并列披露、人工裁决", acceptance: "系统不会静默拼接出一个不存在的结论" },
  { field: "回答契约", question: "证据能支持到什么程度？", output: "允许主张、引用格式、限定说明", acceptance: "事实、推断和建议在输出中可区分" },
  { field: "停止条件", question: "何时追问、限定回答、拒答或转人工？", output: "缺条件、低覆盖、冲突、高风险规则", acceptance: "证据不足不会被流畅表达掩盖" },
];

const offlineLifecycle = [
  { stage: "来源盘点与许可", output: "权威源、负责人、使用范围和同步方式", failure: "把草稿、个人副本或无权使用资料当事实", acceptance: "每个知识域有唯一裁决责任" },
  { stage: "连接与变化捕获", output: "新增、修改、删除、撤权事件", failure: "只同步新增，旧内容和旧权限长期残留", acceptance: "正向与负向变化都能证明已传播" },
  { stage: "解析与质量隔离", output: "文本、表格、标题、页码、版面和失败队列", failure: "解析成功状态掩盖表格错位或段落缺失", acceptance: "关键字段与原页抽样对账" },
  { stage: "清洗、去重与版本裁决", output: "规范内容、重复簇、正式版本和替代关系", failure: "多个近似版本同时进入召回", acceptance: "冲突内容有明确保留、降权或撤回规则" },
  { stage: "切片与元数据", output: "可召回单元、父子关系、坐标、版本和 ACL", failure: "条件、标题或表格被切断", acceptance: "真实问题能召回完整而非孤立的证据" },
  { stage: "Embedding 与索引发布", output: "可版本化的稀疏 / 稠密索引和别名", failure: "模型、Chunk 与索引版本无法配套回滚", acceptance: "新旧版本可并行比较并受控切换" },
  { stage: "更新、删除与撤权证明", output: "传播状态、缓存失效和完成证据", failure: "源文件已删但索引、摘要或缓存仍可命中", acceptance: "在约定目标内不可再检索或返回旧权限内容" },
];

const onlineLifecycle = [
  { stage: "查询契约", output: "原问题、身份、时间、产品、地区和风险", failure: "改写丢失否定、型号或硬约束", signal: "原问题与每次改写均进入 Trace" },
  { stage: "澄清与路由", output: "直接回答、追问、关键词、向量、SQL、图谱或不检索", failure: "所有请求无差别走最复杂链路", signal: "每条路线有启用原因、预算和停止条件" },
  { stage: "候选召回", output: "尽量不漏的权限内候选集合", failure: "标准证据没有进入 Top-K", signal: "按查询类型与身份切片的 Candidate Recall@K" },
  { stage: "过滤、融合与重排", output: "版本正确、可授权且真正相关的排序", failure: "正确证据被噪声、旧版本或错误过滤挤走", signal: "过滤前后召回、nDCG / MRR、重排增益和时延" },
  { stage: "证据编排", output: "去重、冲突处理、顺序和 Token 预算后的证据包", failure: "召回正确但最终上下文缺关键条件", signal: "最终上下文覆盖、来源 ID 和冲突状态" },
  { stage: "回答决策", output: "回答、限定回答、追问、拒答或人工接管", failure: "证据不足仍生成确定语气", signal: "忠实度、引用正确性 / 完整性、拒答与任务成功" },
];

const modelStack = [
  { component: "解析 / OCR / VLM", choose: "文档类型、版面、表格、语言、扫描质量、部署边界", experiment: "原页坐标、关键字段完整率与失败分层", release: "解析器 + 配置 + 文档类型路由" },
  { component: "Embedding", choose: "语言、领域、查询长度、Chunk 长度、维度、吞吐和数据边界", experiment: "固定候选生成方式比较 Recall@K 与关键切片", release: "Embedding + 预处理 + Chunk + 索引版本" },
  { component: "稀疏搜索", choose: "字段权重、分词、语言、同义词、过滤和精确匹配能力", experiment: "编号、专名、日期、否定和错误码基线", release: "Schema + 分词器 + 字段 / 权重配置" },
  { component: "向量索引", choose: "过滤时机、ANN、删除一致性、多租户、容量、备份和地域", experiment: "Recall—时延—内存曲线与权限过滤后的结果", release: "引擎 + 索引参数 + 数据版本 + 切换方案" },
  { component: "Reranker", choose: "候选排序错误是否仍是主要瓶颈，新增延迟是否可接受", experiment: "固定候选集比较排序、最终上下文与业务成功增益", release: "模型 + 候选数 + 截断 + 阈值" },
  { component: "生成模型", choose: "证据遵循、引用、拒答、结构化输出、语言、上下文、时延和成本", experiment: "固定证据包比较主张支持、严重错误与任务成功", release: "模型 + Prompt + 输出 Schema + 安全策略" },
  { component: "可选 Judge", choose: "开放回答是否无法由规则和人工抽样覆盖", experiment: "与双人标注对齐并测试位置、长度和模型家族偏差", release: "Judge + Rubric + 校准集 + 人工争议流程" },
];

const failureChain = [
  { stage: "来源与解析", symptom: "文档存在，标准段落从未进入索引", inspect: "连接事件、解析保真、失败队列、版本与删除状态", owner: "Data Engineering / Multimodal" },
  { stage: "切片与索引", symptom: "证据被拆断、重复或仍命中旧版本", inspect: "Chunk 边界、父子关系、重复簇、索引和 ACL 版本", owner: "Data Engineering；RAG 验证可召回性" },
  { stage: "候选召回", symptom: "正确证据不在候选 Top-K", inspect: "查询契约、路线、过滤前后 Recall@K", owner: "RAG" },
  { stage: "融合与重排", symptom: "证据已召回却排不进最终上下文", inspect: "融合名次、排序指标、阈值、候选数和新增时延", owner: "RAG" },
  { stage: "证据编排", symptom: "上下文缺版本、条件、冲突或稳定来源 ID", inspect: "最终证据包、去重、顺序、压缩和 Token 预算", owner: "RAG / Prompt Engineering" },
  { stage: "回答决策", symptom: "证据正确但回答误读、漏引或不该答却回答", inspect: "主张—证据对齐、引用、拒答、人工复核和业务结果", owner: "RAG / Evaluation" },
];

const productionControls = [
  { control: "身份与权限", local: "候选生成、过滤、缓存、上下文和返回使用同一当前主体", evidence: "越权测试、ACL 版本、拒绝原因", owner: "Security / 应用身份平台" },
  { control: "不可信内容", local: "检索证据始终按数据处理，不能覆盖系统指令或自动授权工具", evidence: "恶意文档、投毒、间接注入测试", owner: "Security / Prompt Engineering" },
  { control: "版本组合", local: "Parser、Chunk、Embedding、索引、Reranker、模型、Prompt 可成组追踪", evidence: "发布清单、影子对照、回滚证明", owner: "AI Ops / Data Engineering" },
  { control: "RAG Trace", local: "记录查询、路线、候选、过滤、重排、最终证据包和回答决策", evidence: "阶段 Span、版本、时延、Token、成本和失败原因", owner: "RAG 定义字段；AI Ops 治理链路" },
  { control: "容量与降级", local: "索引、Embedding、Reranker 或模型故障时保留权限和证据边界", evidence: "峰值、超时、区域故障、只搜不答、转人工演练", owner: "AI Infra / AI Gateway / AI Ops" },
  { control: "质量与经济性", local: "质量、风险、时延和成本按成功业务结果共同观察", evidence: "关键切片、严重错误、采用率、人工接管和单位成功成本", owner: "Evaluation / Solution Patterns / FinOps" },
];

const cloudHooks = [
  { stage: "资料进入与处理", capability: "对象存储、连接器、CDC、队列、文档智能、批处理", value: "让知识变化可追踪、可重放", discover: "数据在哪里，谁负责，新增、删除和撤权多久生效？", acceptance: "关键文档解析保真；正负变化完成证明", responsibility: "云提供连接与处理能力；客户定义权威源、许可和质量" },
  { stage: "检索与索引", capability: "托管搜索、向量数据库、关系 / 图谱查询、缓存", value: "按问题类型产生权限内候选", discover: "精确、语义、关系和结构化查询各占多少？", acceptance: "过滤后的 Recall、时延、删除一致性、备份恢复", responsibility: "平台实现索引能力；应用负责查询路由、ACL 语义和验收" },
  { stage: "模型能力", capability: "Embedding、Reranker、生成模型、模型路由", value: "把候选变成可用证据和回答", discover: "语言、质量、数据边界、P95 与成本如何排序？", acceptance: "固定任务和证据包上的质量—时延—成本结果", responsibility: "供应方说明模型与服务边界；客户负责场景选择和发布" },
  { stage: "安全运行", capability: "IAM、KMS、私网、WAF、API 网关、容器 / Serverless", value: "让身份、密钥和网络边界贯穿链路", discover: "谁能检索什么，谁能调用什么，日志可记录什么？", acceptance: "越权泄漏为零；凭据、缓存、日志和故障路径受控", responsibility: "共享责任；托管服务不替代业务授权和威胁建模" },
  { stage: "持续评估与日常运营", capability: "Tracing、评估平台、日志、告警、灰度、回滚", value: "定位失败并持续改进", discover: "谁对质量、事故、版本和恢复负责？", acceptance: "能从业务结果回到证据链阶段并恢复可信版本", responsibility: "平台提供观测和发布能力；团队定义业务状态与处置流程" },
  { stage: "成本与容量", capability: "用量计量、预算、配额、弹性、FinOps", value: "控制离线和在线完整成本", discover: "成本驱动来自解析、索引、模型、流量还是人工？", acceptance: "单位成功结果成本、峰值容量和预算异常可解释", responsibility: "云方提供计量；客户定义分摊、价值和投资门槛" },
];

const economicsStages = [
  { title: "现状基线", body: "记录当前处理时间、一次解决率、错误与返工、检索耗时、人工升级和不可接受损失。", decision: "没有现状就无法证明增量价值。" },
  { title: "价值变化", body: "测量节省时间、覆盖提升、错误减少、交付提速、风险降低和新增业务能力。", decision: "把模型指标转换成真实工作状态。" },
  { title: "完整成本", body: "同时计入接入、解析、Embedding、索引、重排、模型、网络、存储、评估、运营和人工复核。", decision: "区分一次建设、持续固定与按量成本。" },
  { title: "采用与人工", body: "观察真实使用率、放弃率、转人工质量、人工接受率和流程绕行。", decision: "技术准确但无人采用仍没有 ROI。" },
  { title: "风险调整", body: "把越权、错误承诺、过期知识和停机的预期损失及控制成本计入。", decision: "高风险场景不能只看平均节省。" },
  { title: "上线决定", body: "比较净收益、回收期、关键切片和责任准备度，形成 Go / Repair / Stop。", decision: "结论绑定当前样本和假设，不外推为行业比例。" },
];

const extensionChoices = [
  { pattern: "普通 / Advanced RAG", trigger: "单跳事实、制度、产品和知识问答", adds: "混合召回、过滤、重排、引用", risk: "数据链和评估复杂度", owner: "RAG 的生产基线" },
  { pattern: "GraphRAG", trigger: "跨文档关系、主题归纳和全局问题", adds: "实体关系、社区和分层摘要", risk: "索引、更新、摘要与权限治理更重", owner: "RAG 使用图证据；Data Engineering 管图数据" },
  { pattern: "Multimodal RAG", trigger: "答案依赖版面、图表、图纸或图像", adds: "OCR / VLM、页面或区域级表示", risk: "视觉成本和证据坐标更复杂", owner: "Multimodal 生产表示；RAG 检索和使用" },
  { pattern: "Structured Retrieval", trigger: "指标、交易、关系数据库和精确计算", adds: "语义层、SQL / API、结果验证", risk: "口径、查询安全和实时一致性", owner: "事实源 / Data Engineering；RAG 负责路由与编排" },
  { pattern: "Agentic RAG", trigger: "问题确需动态分解、选源、循环或工具", adds: "计划、预算、停止、轨迹和恢复", risk: "调用、时延和故障路径增加", owner: "Agent 拥有动态控制；RAG 仍拥有证据链" },
];

const protocolBoundaries = [
  { name: "Agent", need: "模型必须根据中间结果动态决定下一次检索或工具动作", notNeed: "单轮、预设检索链的只读知识问答", responsibility: "计划、循环、预算、停止和恢复" },
  { name: "MCP", need: "多个 Host / Agent 需要用标准协议发现和调用检索能力", notNeed: "应用可直接调用稳定内部 API", responsibility: "连接契约；不自动提供业务授权、质量或 SLA" },
  { name: "A2A", need: "独立 Agent 之间需要委派完整任务并交付 Artifact", notNeed: "一个 Agent 调用一次搜索或 RAG 工具", responsibility: "跨 Agent 任务状态、身份、产物和失败语义" },
];

const ragReadingSections: ReadingSection[] = [
  { id: "fit", label: "采用判断", eyebrow: "先判断是否值得做" },
  { id: "evidence-contract", label: "证据契约", eyebrow: "定义什么可以回答" },
  { id: "evidence-lifecycle", label: "证据双链", eyebrow: "离线与在线如何衔接" },
  { id: "model-selection", label: "模型与组件", eyebrow: "按任务实验选型" },
  { id: "measurement", label: "测量与诊断", eyebrow: "沿证据链定位失败" },
  { id: "production", label: "生产与经济性", eyebrow: "控制、云服务与 ROI" },
  { id: "extensions", label: "扩展边界", eyebrow: "复杂度由真实失败触发" },
  { id: "practice", label: "实战产物", eyebrow: "用交付证明掌握" },
  { id: "evidence", label: "证据与边界", eyebrow: "知道来源能证明什么" },
  { id: "qa", label: "客户问答", eyebrow: "现场快速使用" },
  { id: "related-modules", label: "相关模块", eyebrow: "回到责任主模块" },
];

function SourceLinks({ sourceIds, label }: { sourceIds: string[]; label: string }) {
  return (
    <div className="deepDiveSources" aria-label={label}>
      <span>来源</span>
      {sourceIds.map((sourceId) => {
        const source = sourceLedger[sourceId];
        if (!source) throw new Error(`RAG 页面引用未知来源：${sourceId}`);
        return <Link href={`/references#source-${sourceId}`} key={sourceId}>{source.shortTitle} ↗</Link>;
      })}
    </div>
  );
}

export default function RagModulePage() {
  return (
    <main className="fieldbookTheme modulePage modulePilot modulePilot--dedicated moduleFocused">
      <ReadingProgress />
      <section className="ragHero" id="rag" aria-labelledby="rag-title">
        <nav className="topbar" aria-label="模块导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页">
            <span>Cloud × AI / Presales Fieldbook</span>
          </Link>
          <div className="toplinks">
            <Link href="#fit">采用判断</Link>
            <Link href="#qa">本模块问答</Link>
            <Link href="/glossary">术语库</Link>
            <Link href="/questions">全部问题</Link>
            <Link href="/references">Reference</Link>
            {ragEnglishPath ? <Link href={ragEnglishPath} hrefLang="en" lang="en" prefetch={false}>English</Link> : null}
          </div>
        </nav>
        <div className="ragHeader">
          <div>
            <p className="kicker light">MODULE · EVIDENCE SYSTEM</p>
            <h1 className="moduleHeroTitle" id="rag-title">RAG<br /><span>检索增强生成 · Retrieval-Augmented Generation</span></h1>
          </div>
          <div className="ragDefinition">
            <p>把外部资料整理成当前用户可使用、能核对且可撤回的依据；向量检索只是候选发现手段之一。</p>
          </div>
        </div>
      </section>

      <div className="moduleArticleLayout dedicatedArticleLayout">
        <ModuleReadingNav moduleName="RAG · 检索增强生成" sections={ragReadingSections} quickLinks={[
          { href: "#fit", label: "判断是否采用" },
          { href: "#model-selection", label: "准备选型" },
          { href: "#practice", label: "完成实战" },
        ]} />
        <section className="section ragBody" aria-label="RAG 核心内容">
          <div className="sectionNumber">02</div>
          <div className="sectionBody">
            <div className="decisionBanner">
              <p className="kicker">THE MAIN QUESTION</p>
              <h3>本模块唯一主问题</h3>
              <p>如何让一条回答只使用当前用户有权访问、仍然有效、能够回到原文的证据，并在证据不足时停下来？</p>
            </div>

            <RagArchitecturePrimer />

            <div className="subsection foundationSection" id="evidence-contract" data-quality-section="principle">
              <div className="subHead"><span>01</span><div><p className="kicker">EVIDENCE CONTRACT</p><h3>先定义什么可以成为回答证据</h3></div></div>
              <p className="sectionLead">RAG 改变的是本次回答可使用的外部上下文，不会把资料永久写入模型权重。真正的起点不是向量库，而是来源、版本、权限、引用和停止条件共同组成的证据契约。</p>

              <section className="focusedDecisionLedger" aria-labelledby="route-baseline-title">
                <header><p className="kicker">SIMPLEST VIABLE ROUTE</p><h3 id="route-baseline-title">RAG 必须先证明自己优于更简单的路线</h3><p>同一个需求可能需要搜索、长上下文、RAG、SQL / API、微调或人工流程，也可能组合使用。先冻结业务问题和基线，再比较必要能力。</p></header>
                <div className="tableWrap">
                  <table>
                    <thead><tr><th>路线</th><th>最适合</th><th>变化怎样生效</th><th>证据形态</th><th>不能忽略</th></tr></thead>
                    <tbody>{adoptionChoices.map((item) => <tr key={item.route}><th>{item.route}</th><td>{item.fit}</td><td>{item.change}</td><td>{item.evidence}</td><td>{item.limit}</td></tr>)}</tbody>
                  </table>
                </div>
              </section>

              <div className="memoryCompare">
                <article>
                  <p className="miniLabel">PARAMETRIC MEMORY</p>
                  <h4>参数化知识 · Parametric Knowledge</h4>
                  <p>模型训练时压缩进权重的语言规律与知识。调用快、泛化强，但单条知识何时写入、能否撤回、来源在哪里，通常不能由应用精确控制。</p>
                </article>
                <article className="externalMemory">
                  <p className="miniLabel">EXTERNAL EVIDENCE</p>
                  <h4>外部证据 · External Evidence</h4>
                  <p>文档、数据库、搜索索引或知识图谱中的当前资料。它们可以独立更新、授权、撤回和审计，RAG 在请求发生时只取回与当前问题相关的部分。</p>
                </article>
              </div>

              <div className="ragMechanism" aria-label="RAG 三步工作机制">
                <article><span>01</span><h5>检索 · Retrieval</h5><p>从当前用户有权访问的知识源中找候选证据。相关性分数只能说明“与问题像不像”，不能证明来源真实、权威或仍然有效。</p></article>
                <article><span>02</span><h5>增强 · Augmentation</h5><p>把通过权限、版本、去重和冲突处理的证据，与问题、引用格式和拒答规则一起组装成最终证据包。</p></article>
                <article><span>03</span><h5>生成 · Generation</h5><p>模型基于证据回答、引用、限定或拒答；它仍可能忽略、误读或错误组合证据，因此生成环节必须单独验收。</p></article>
              </div>

              <CriticalBoundary>检索到不等于回答正确。标准证据还必须进入最终上下文，被模型忠实使用，并且来源本身权威、当前且适用于这位用户。</CriticalBoundary>

              <div className="tableWrap">
                <table>
                  <thead><tr><th>证据契约字段</th><th>必须回答的问题</th><th>需要形成的产物</th><th>最低验收</th></tr></thead>
                  <tbody>{evidenceContract.map((item) => <tr key={item.field}><th>{item.field}</th><td>{item.question}</td><td>{item.output}</td><td>{item.acceptance}</td></tr>)}</tbody>
                </table>
              </div>
              <SourceLinks sourceIds={["rag-original-2020", "alce-2023", "nist-zero-trust"]} label="证据契约来源" />
            </div>

            <div className="subsection" id="evidence-lifecycle">
              <div className="subHead"><span>02</span><div><p className="kicker">TWO EVIDENCE LIFECYCLES</p><h3>离线链生产证据，在线链决定怎样使用证据</h3></div></div>
              <p className="sectionLead">两条链通过同一套稳定 ID、版本和权限语义衔接。Data Engineering 负责生产可靠的知识产物；RAG 负责证明这些产物能被正确召回、编排和用于回答。</p>

              <section className="focusedDecisionLedger" aria-labelledby="offline-lifecycle-title">
                <header><p className="kicker">OFFLINE EVIDENCE LIFECYCLE</p><h3 id="offline-lifecycle-title">资料进入索引前，每一步都要有明确的验收结果</h3><p>切片只是其中一步。没有权威源、版本裁决和负向变化传播，再精细的向量检索也会返回错误证据。</p></header>
                <div className="tableWrap">
                  <table>
                    <thead><tr><th>阶段</th><th>输出</th><th>典型失败</th><th>RAG 所需验收</th></tr></thead>
                    <tbody>{offlineLifecycle.map((item) => <tr key={item.stage}><th>{item.stage}</th><td>{item.output}</td><td>{item.failure}</td><td>{item.acceptance}</td></tr>)}</tbody>
                  </table>
                </div>
              </section>

              <section className="focusedDecisionLedger" aria-labelledby="online-lifecycle-title">
                <header><p className="kicker">ONLINE ANSWER LIFECYCLE</p><h3 id="online-lifecycle-title">一次请求不只有“检索”与“生成”两个动作</h3><p>问题含糊、条件缺失或证据冲突时，正确结果可能是追问、限定回答或转人工，而不是继续增加 Token。</p></header>
                <div className="tableWrap">
                  <table>
                    <thead><tr><th>阶段</th><th>输出</th><th>典型失败</th><th>可观察信号</th></tr></thead>
                    <tbody>{onlineLifecycle.map((item) => <tr key={item.stage}><th>{item.stage}</th><td>{item.output}</td><td>{item.failure}</td><td>{item.signal}</td></tr>)}</tbody>
                  </table>
                </div>
              </section>

              <CriticalBoundary>清洗、解析、Chunk 产物、索引发布和删除传播的完整方法归 AI 数据工程；RAG 只保留足以定义输入契约、检索实验和端到端验收的局部解释。</CriticalBoundary>
            </div>

            <div className="subsection" id="model-selection">
              <div className="subHead"><span>03</span><div><p className="kicker">MODEL &amp; COMPONENT SELECTION</p><h3>RAG 选型不是只选一个生成模型</h3></div></div>
              <p className="sectionLead">解析、Embedding、搜索、向量索引、Reranker、生成模型和可选 Judge 是不同采购与发布对象。每一项都应使用同一套“任务—约束—候选—实验—通过条件”方法，而不是用开源 / 商业二分法替代工程判断。</p>
              <div className="tableWrap">
                <table>
                  <thead><tr><th>组件</th><th>主要选择维度</th><th>最小对比实验</th><th>必须一起版本化</th></tr></thead>
                  <tbody>{modelStack.map((item) => <tr key={item.component}><th>{item.component}</th><td>{item.choose}</td><td>{item.experiment}</td><td>{item.release}</td></tr>)}</tbody>
                </table>
              </div>
              <CriticalBoundary>先固定任务数据、候选生成方式和验收切片，再比较模型。公开榜单、厂商实验和模型卡只能帮助形成候选，不能替代客户语料上的控制实验。</CriticalBoundary>
              <SourceLinks sourceIds={["dpr-2020", "bert-reranker", "hnsw-2016", "rrf-2009", "beir-2021", "mteb-2023", "miracl-2023", "clirmatrix-2020"]} label="模型与检索选型来源" />
              <RagRetrievalLab />
            </div>

            <div className="subsection" id="measurement" data-quality-section="deep-dive">
              <div className="subHead"><span>04</span><div><p className="kicker">MEASUREMENT &amp; DIAGNOSIS</p><h3>沿证据链测量，才能知道应该修哪里</h3></div></div>
              <p className="sectionLead">最终答案只是结果。诊断需要同时保存候选集、过滤结果、排序、最终证据包和回答主张；换更大模型只可能修复最后一段中的部分问题。</p>
              <div className="tableWrap">
                <table>
                  <thead><tr><th>失效层</th><th>客户看到的症状</th><th>先检查什么</th><th>主要责任</th></tr></thead>
                  <tbody>{failureChain.map((item) => <tr key={item.stage}><th>{item.stage}</th><td>{item.symptom}</td><td>{item.inspect}</td><td>{item.owner}</td></tr>)}</tbody>
                </table>
              </div>
              <CriticalBoundary>平均分提高不能掩盖越权、错误承诺、关键证据缺失或高风险拒答失败。候选召回、最终上下文、引用和业务结果必须分别观察，并按风险切片。</CriticalBoundary>
              <ModuleDeepDiveBlocks blocks={ragDeepDives} sourceLedger={sourceLedger} />
            </div>

            <div className="subsection cloudSection" id="production" data-quality-section="cloud">
              <div className="subHead"><span>05</span><div><p className="kicker">PRODUCTION CONTROL &amp; ECONOMICS</p><h3>把安全、Trace、云服务和经济性放进同一上线决定</h3></div></div>
              <p className="sectionLead">生产控制不是问答列表的附录。每个控制都要落到证据链的输入、输出、版本、负责人和恢复动作；云服务只提供部分能力，不能转移客户的数据、授权和业务责任。</p>

              <div className="tableWrap">
                <table>
                  <thead><tr><th>贯穿控制</th><th>RAG 本地要求</th><th>验收证据</th><th>责任主模块</th></tr></thead>
                  <tbody>{productionControls.map((item) => <tr key={item.control}><th>{item.control}</th><td>{item.local}</td><td>{item.evidence}</td><td>{item.owner}</td></tr>)}</tbody>
                </table>
              </div>

              <section className="focusedDecisionLedger" aria-labelledby="cloud-capability-title">
                <header><p className="kicker">CLOUD CAPABILITY CONTRACT</p><h3 id="cloud-capability-title">先写能力、验收与责任，再对应具体云产品</h3><p>具体产品还要按实施当天的地域、生命周期状态、配额、SLA、网络和计费单位复核。</p></header>
                <div className="tableWrap cloudTable">
                  <table>
                    <thead><tr><th>技术环节</th><th>可连接的云能力</th><th>客户价值</th><th>发现问题</th><th>验收</th><th>责任边界</th></tr></thead>
                    <tbody>{cloudHooks.map((item) => <tr key={item.stage}><th>{item.stage}</th><td>{item.capability}</td><td>{item.value}</td><td>{item.discover}</td><td>{item.acceptance}</td><td>{item.responsibility}</td></tr>)}</tbody>
                  </table>
                </div>
              </section>

              <section className="focusedDecisionLedger" aria-labelledby="economics-title">
                <header><p className="kicker">RISK-ADJUSTED ROI</p><h3 id="economics-title">成本只是分母，ROI 还需要价值、采用率和风险</h3><p>PoC 从现状基线开始，并用生产数据逐步替换假设。模型分数不能直接变成采购回报。</p></header>
                <div className="focusedDecisionRows">
                  {economicsStages.map((item, index) => (
                    <article key={item.title}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div><h4>{item.title}</h4><p>{item.body}</p></div>
                      <div><strong>{item.decision}</strong></div>
                    </article>
                  ))}
                </div>
              </section>

              <BalancedGrid className="technicalNotes" maxColumns={3}>
                <article><p className="miniLabel">GO</p><h4>扩大范围</h4><p>关键任务优于基线，严重错误受控，单位成功成本可接受，责任团队能够运营和恢复。</p></article>
                <article><p className="miniLabel">REPAIR</p><h4>限定范围并整改</h4><p>业务假设仍成立，但失败集中在可定位的数据、检索、权限、模型或流程环节；先修复再复测。</p></article>
                <article><p className="miniLabel">STOP</p><h4>停止或改用更简单路线</h4><p>没有权威资料、风险无法控制、价值不高于基线，或长上下文、搜索、SQL、规则和人工流程更合适。</p></article>
              </BalancedGrid>
              <SourceLinks sourceIds={["nist-genai-profile", "nist-aml-100-2e2025", "opentelemetry-genai-semconv", "opentelemetry-genai-observability-2026", "finops-unit-economics", "finops-ai-tools-considerations"]} label="生产控制与经济性来源" />
            </div>

            <div className="subsection" id="extensions">
              <div className="subHead"><span>06</span><div><p className="kicker">OPTIONAL PATTERNS &amp; PROTOCOL BOUNDARIES</p><h3>复杂度由真实失败样本触发，不是统一升级阶梯</h3></div></div>
              <p className="sectionLead">Naive / Advanced 描述检索管线复杂度，Graph 描述知识表示，Multimodal 描述输入与证据形态，Structured 描述事实源，Agentic 描述运行时控制。它们可以组合，但不是一条从低到高的成熟度阶梯。</p>
              <div className="tableWrap">
                <table>
                  <thead><tr><th>模式</th><th>采用触发</th><th>新增能力</th><th>新增风险 / 成本</th><th>主要责任</th></tr></thead>
                  <tbody>{extensionChoices.map((item) => <tr key={item.pattern}><th>{item.pattern}</th><td>{item.trigger}</td><td>{item.adds}</td><td>{item.risk}</td><td>{item.owner}</td></tr>)}</tbody>
                </table>
              </div>

              <section className="focusedDecisionLedger" aria-labelledby="protocol-boundary-title">
                <header><p className="kicker">AGENT · MCP · A2A</p><h3 id="protocol-boundary-title">它们都不是普通 RAG 的默认组成</h3><p>判断标准不是技术是否流行，而是系统是否出现了动态控制、标准能力连接或跨 Agent 任务委派的真实需要。</p></header>
                <div className="tableWrap">
                  <table>
                    <thead><tr><th>能力</th><th>什么时候需要</th><th>什么时候不需要</th><th>它真正负责什么</th></tr></thead>
                    <tbody>{protocolBoundaries.map((item) => <tr key={item.name}><th>{item.name}</th><td>{item.need}</td><td>{item.notNeed}</td><td>{item.responsibility}</td></tr>)}</tbody>
                  </table>
                </div>
              </section>
              <CriticalBoundary>Agent 可以调用 RAG；MCP 可以暴露检索能力；A2A 可以委派完整任务。三者都不会自动改善资料质量、检索召回、证据忠实度、用户授权或生产可靠性。</CriticalBoundary>
            </div>

            <div className="subsection" id="practice" data-quality-section="learning">
              <div className="subHead"><span>07</span><div><p className="kicker">LEARNING BY DELIVERABLE</p><h3>用可评审产物证明真正掌握 RAG</h3></div></div>
              <ModuleLearningStudio content={ragLearningContent} sourceLedger={sourceLedger} />
            </div>

            <div className="subsection" id="evidence" data-quality-section="evidence">
              <div className="subHead"><span>08</span><div><p className="kicker">EVIDENCE WITH LIMITS</p><h3>数据、论文与产品文档分别能证明什么</h3></div></div>
              <ModuleEvidenceGrid cards={evidenceCards} sourceLedger={sourceLedger} />
            </div>

            <div className="subsection qaSection" id="qa" data-quality-section="qa">
              <div className="subHead"><span>09</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h3>客户高频问题与深度回答</h3></div></div>
              <ModuleQaList items={ragQa} sourceLedger={sourceLedger} />
            </div>

            <div className="subsection focusedRelated" id="related-modules" data-quality-section="related-modules">
              <div className="subHead"><span>10</span><div><p className="kicker">RELATED MODULES</p><h3>把局部判断交回责任主模块</h3></div></div>
              <p className="sectionLead">RAG 保留完成当前方案判断所需的局部解释；完整机制、治理与运营方法仍由以下模块负责，避免在一个页面复制整套知识库。</p>
              <div className="conceptGrid" data-count={conceptLinks.length} data-odd={conceptLinks.length % 2 === 1 ? "true" : "false"}>
                {conceptRows.flatMap((row) => row.map((item) => (
                  <article key={item.concept} style={{ "--concept-span": gridSpan(row.length) } as CSSProperties}>
                    <div className="conceptCard">
                      <div className="conceptMeta"><span>{item.relation}</span><Link href={item.href}>{item.owner} ↗</Link></div>
                      <h4>{item.concept}</h4>
                      <p>{item.local}</p>
                    </div>
                  </article>
                )))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer>
        <div><strong>云计算 × AI 平台售前知识库</strong></div>
        <p>RAG 深度模块<ModuleUpdatedAt value={ragPublication?.updatedAt ?? undefined} /></p>
        <a href="#rag">返回顶部 ↑</a>
      </footer>
    </main>
  );
}
