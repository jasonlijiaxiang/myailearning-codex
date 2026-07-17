import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { balanceRows } from "../../layout-utils.mjs";
import { BalancedGrid, CriticalBoundary, ModuleDeepDiveBlocks, ModuleEvidenceGrid, ModuleQaList } from "../../module-content-components";
import { sourceLedger } from "../../reference-content.mjs";
import { evidenceCards, ragDeepDives, ragQa } from "../../rag-content.mjs";

export const metadata: Metadata = {
  title: "RAG · 检索增强生成 | 云计算 × AI 平台售前知识库",
  description: "RAG 的基础原理、检索与生成机制、云服务连接、评估方法和售前高频问题深度回答。",
};

const conceptLinks = [
  { concept: "LLM 与上下文窗口", owner: "大语言模型原理", href: "/modules/llm", relation: "前置知识", local: "理解模型的参数化记忆、token 与注意力边界。" },
  { concept: "Embedding", owner: "大语言模型原理", href: "/modules/llm", relation: "前置知识", local: "理解文本如何映射到向量空间，以及相似度为何不等于事实正确。" },
  { concept: "解析、OCR 与 Chunk", owner: "AI 数据工程", href: "/modules/data-engineering", relation: "知识供给", local: "决定原始资料能否变成完整、可定位、可撤回的检索单元。" },
  { concept: "搜索与向量数据库", owner: "AI 数据工程", href: "/modules/data-engineering", relation: "检索引擎", local: "负责稀疏、稠密、过滤、索引与增量更新，不等同于完整 RAG。" },
  { concept: "Prompt 与 Grounding", owner: "提示词工程", href: "/modules/prompt-engineering", relation: "生成约束", local: "把检索证据、回答规则、引用格式和拒答条件组装成模型输入。" },
  { concept: "评估、安全与网关", owner: "评估", href: "/modules/evaluation", relation: "生产控制", local: "把检索、生成、权限、风险、成本和 SLA 变成可观测控制面。" },
  { concept: "Agent 与 GraphRAG", owner: "Agent · 智能体", href: "/modules/ai-agent", relation: "下游演进", local: "多步检索、工具调用与全局主题分析属于 RAG 的组合或扩展。" },
  { concept: "容器、Serverless 与算力", owner: "AI 基础设施平台", href: "/modules/ai-infra-platform", relation: "运行底座", local: "承载解析任务、检索服务、模型推理和峰值弹性。" },
];

const conceptRows = balanceRows(conceptLinks, 4);

const ragVariants = [
  { name: "Naive RAG", cue: "单次查询、单一知识源、快速基线", pipeline: "切块 → 向量检索 → Top-K → 生成", boundary: "实现快，但容易受切块、召回和噪声影响。" },
  { name: "Advanced RAG", cue: "企业知识问答与可控质量", pipeline: "查询改写 → 混合召回 → 过滤 → 重排 → 压缩 → 生成", boundary: "质量更稳，但组件、时延和评估复杂度增加。" },
  { name: "Modular / Agentic RAG", cue: "跨系统、多步问题与动态工具", pipeline: "计划 → 选择知识源 → 多轮检索 / 工具 → 汇总", boundary: "适合复杂任务；必须加强预算、权限和轨迹评估。" },
  { name: "GraphRAG", cue: "关系密集、主题归纳与全局问题", pipeline: "实体 / 关系抽取 → 社区 → 摘要 → 局部或全局检索", boundary: "索引成本高，不应替代所有普通事实检索。" },
];

const cloudHooks = [
  { stage: "数据进入", services: "对象存储、数据库、文件服务、SaaS 连接器、CDC、消息队列", value: "统一沉淀知识源并建立增量同步", discover: "数据在哪里？新增、修改、删除多久必须生效？" },
  { stage: "文档理解", services: "OCR、文档智能、批处理、函数计算、容器任务", value: "把 PDF、扫描件、表格和图片转成可追溯内容", discover: "扫描件、复杂表格、多栏文档各占多少？" },
  { stage: "数据治理", services: "数据目录、元数据、质量、脱敏、主数据、血缘", value: "明确权威来源、版本、负责人和保留策略", discover: "谁批准内容？冲突版本以谁为准？" },
  { stage: "检索与索引", services: "托管搜索、向量数据库、关系数据库、缓存、知识图谱", value: "承载关键词、语义、过滤与关系查询", discover: "精确编号、语义问题、关系问题分别占多少？" },
  { stage: "模型能力", services: "模型即服务、Embedding、Reranker、模型微调与推理", value: "提供向量化、重排、生成和模型可替换性", discover: "数据能否出域？质量、语言、时延如何排序？" },
  { stage: "应用运行", services: "Serverless、容器、Kubernetes、API 网关、负载均衡", value: "把知识链和问答链变成弹性在线服务", discover: "并发、峰值系数、P95 和可用性目标是什么？" },
  { stage: "安全合规", services: "IAM、KMS、密钥管理、WAF、私网连接、审计", value: "让身份、权限和密钥贯穿检索与生成", discover: "权限来自哪里？是否要求租户、文档或字段级隔离？" },
  { stage: "运营优化", services: "日志、Tracing、APM、评估平台、告警、FinOps", value: "定位失败、持续评测并核算每个成功回答成本", discover: "谁运营质量？如何发现退化并形成改进闭环？" },
];

const knowledgeFlow = [
  { zh: "源系统", en: "Source Systems" },
  { zh: "解析 / OCR", en: "Parsing & OCR" },
  { zh: "切块与元数据", en: "Chunking & Metadata" },
  { zh: "权限映射", en: "Access Mapping" },
  { zh: "稀疏 + 向量索引", en: "Sparse + Vector Indexing" },
];

const servingFlow = [
  { zh: "查询理解", en: "Query Understanding" },
  { zh: "混合召回", en: "Hybrid Retrieval" },
  { zh: "过滤与重排", en: "Filtering & Reranking" },
  { zh: "上下文组装", en: "Context Assembly" },
  { zh: "生成 / 引用 / 拒答", en: "Generation / Citation / Abstention" },
];

const ragFailureChain = [
  { stage: "源数据与解析", symptom: "文档存在，但正确段落从未出现在索引", check: "解析保真、页码 / 表格 / 标题、版本与删除状态", action: "按文档类型路由解析，保留来源坐标与失败队列" },
  { stage: "切块与索引", symptom: "证据被拆断、过大噪声或更新后仍命中旧块", check: "Chunk 边界、父子关系、重复率、索引版本", action: "用真实问题比较结构切分、语义切分与父子块" },
  { stage: "候选召回", symptom: "标准证据不在候选 Top-K", check: "Candidate Recall@K、过滤前后召回、查询类型", action: "关键词 + 向量双路召回，按身份和元数据过滤" },
  { stage: "融合与重排", symptom: "正确证据有召回，却排不进最终上下文", check: "融合排名、MRR / nDCG、Reranker 增益与延迟", action: "用 RRF 融合不同分数空间，再对有限候选精排" },
  { stage: "上下文组装", symptom: "引用缺版本、冲突、顺序错误或证据被截断", check: "最终上下文覆盖、token 预算、版本与冲突策略", action: "去重、压缩、排序并保留稳定来源 ID" },
  { stage: "生成与引用", symptom: "证据正确但回答误读、漏引或不应答却回答", check: "Faithfulness、引用正确性、拒答与事实正确性", action: "强化输出契约、证据不足拒答，并对高风险答案复核" },
];

const ragExtensionChoices = [
  { pattern: "普通 / Advanced RAG", use: "单跳事实、制度、产品与知识问答", adds: "混合检索、过滤、重排、引用", cost: "生产基线", boundary: "不要被复杂名称诱导跳过基础质量链。" },
  { pattern: "Agentic RAG", use: "多步拆解、选源、查询改写或工具联动", adds: "路由、计划、循环、预算和轨迹评估", cost: "调用次数和故障路径增加", boundary: "只对复杂问题路由启用，不默认覆盖所有请求。" },
  { pattern: "GraphRAG", use: "关系密集、跨文档归纳与全局主题问题", adds: "实体关系、社区与分层摘要", cost: "索引、更新和运营链更重", boundary: "精确事实与常规问答通常仍需普通检索。" },
  { pattern: "Multimodal RAG", use: "答案依赖页面布局、图表、图纸或图像", adds: "OCR / Caption、统一嵌入或页面多向量", cost: "视觉处理、存储和评测增加", boundary: "固定字段优先专业解析；开放视觉理解才交给 VLM。" },
  { pattern: "Structured Data RAG", use: "答案来自指标、交易与关系数据库", adds: "语义层、Text-to-SQL、权限与结果验证", cost: "口径治理和 SQL 安全成为主成本", boundary: "查文与查数必须分流，不能把表数据简单切块后向量化。" },
];

const ragOriginalSource = sourceLedger["rag-original-2020"];


export default function RagModulePage() {
  return (
    <main>
      <section className="ragHero" id="rag" aria-labelledby="rag-title">
        <nav className="topbar" aria-label="模块导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页">
            <span className="brandMark">CA</span>
            <span>Cloud × AI / Presales Fieldbook</span>
          </Link>
          <div className="toplinks">
            <Link href="#rag-principle">RAG 原理</Link>
            <Link href="#qa">高频问答</Link>
            <Link href="/references">Reference</Link>
          </div>
        </nav>
        <div className="ragHeader">
          <div>
            <p className="kicker light">MODULE · APPLICATION PATTERN · V1.1</p>
            <h1 className="moduleHeroTitle" id="rag-title">RAG<br /><span>检索增强生成 · Retrieval-Augmented Generation</span></h1>
          </div>
          <div className="ragDefinition">
            <p>用可更新、可追溯的外部证据增强模型回答；核心不是“接一个向量库”，而是建立一条可评估、可授权、可运营的知识供应链。</p>
          </div>
        </div>
      </section>

      <section className="section ragBody" aria-label="RAG 核心内容">
        <div className="sectionNumber">02</div>
        <div className="sectionBody">
          <div className="decisionBanner">
            <p className="kicker">PRESALES POSITION</p>
            <h3>一句话定位</h3>
            <p>客户要的不是一个“会聊天的搜索框”，而是一套能在正确权限下找到正确证据、生成可核验回答，并持续知道哪里做错了的系统。</p>
          </div>

          <div className="subsection" id="concept-map" data-quality-section="related-modules">
            <div className="subHead"><span>2.1</span><div><p className="kicker">KNOWLEDGE CONNECTIONS</p><h3>RAG 在知识地图中的位置与相关模块</h3></div></div>
            <p className="sectionLead">RAG 模块聚焦“检索增强生成的组合逻辑”。底层概念各有唯一的主要归属；本节提供理解 RAG 所需的局部解释，并将完整知识链接至对应主模块，以减少重复和版本漂移。</p>
            {conceptRows.length > 0 && (
              <div className="conceptGrid" data-count={conceptLinks.length} data-odd={conceptLinks.length % 2 === 1 ? "true" : "false"}>
                {conceptRows.flatMap((row) =>
                  row.map((item) => (
                    <article
                      key={item.concept}
                      style={{ "--concept-span": 12 / row.length } as CSSProperties}
                    >
                      <div className="conceptCard">
                        <div className="conceptMeta"><span>{item.relation}</span><Link href={item.href}>{item.owner} ↗</Link></div>
                        <h4>{item.concept}</h4>
                        <p>{item.local}</p>
                      </div>
                    </article>
                  )),
                )}
              </div>
            )}
          </div>

          <div className="subsection foundationSection" id="rag-principle" data-quality-section="principle">
            <div className="subHead"><span>2.2</span><div><p className="kicker">FOUNDATION &amp; MECHANICS</p><h3>RAG 的工作原理与工程机制</h3></div></div>
            <div className="memoryCompare">
              <article>
                <p className="miniLabel">PARAMETRIC MEMORY</p>
                <h4>参数化记忆 · Parametric Memory</h4>
                <p>模型训练时压缩进权重的语言规律与世界知识。调用快、泛化强，但知识何时写入、能否精确更新、来源在哪里，都难以直接控制。</p>
              </article>
              <article className="externalMemory">
                <p className="miniLabel">EXTERNAL KNOWLEDGE</p>
                <h4>外部知识 · External Knowledge</h4>
                <p>文档、数据库、搜索索引和知识图谱等模型外的数据。可以独立新增、撤回、授权和审计，RAG 在回答当前问题时把相关部分临时交给模型。</p>
              </article>
            </div>

            <div className="principleDepth">
              <header className="principleDepthIntro">
                <p className="miniLabel">PRESALES MECHANISM</p>
                <h4>技术售前需要理解的 RAG 原理</h4>
                <p>RAG 在模型回答之前，先从外部知识中找到可能相关的证据，再把问题、证据和回答要求一起交给模型。它改变的是<strong>本次回答可使用的上下文</strong>，不是重新训练模型，也不会把文档永久写入模型参数。</p>
              </header>

              <div className="ragMechanism" aria-label="RAG 三步工作机制">
                <article>
                  <span>01</span>
                  <h5>检索 · Retrieval</h5>
                  <p>从当前用户有权访问的知识源中找出候选证据。检索分数表示“与问题有多相关”，不证明内容真实、权威或仍然有效。</p>
                </article>
                <article>
                  <span>02</span>
                  <h5>增强 · Augmentation</h5>
                  <p>把经过权限、版本、去重和冲突处理的证据，与问题、引用格式及拒答规则一起组装成模型上下文。</p>
                </article>
                <article>
                  <span>03</span>
                  <h5>生成 · Generation</h5>
                  <p>模型基于问题与证据组织回答、引用或拒答，但仍可能忽略、误读或错误组合证据，因此生成环节必须单独评估。</p>
                </article>
              </div>
              <p className="paperBoundary"><strong>售前判断：</strong>RAG 的价值是给模型增加一条可更新、可授权、可追溯的外部证据通道；它不改变“模型仍可能犯错”这一事实。<strong>检索到不等于回答正确</strong>，还要检查证据是否进入最终上下文、模型是否忠实使用，以及来源本身是否可靠。</p>

              <div className="engineeringBridge">
                <div className="engineeringBridgeHead">
                  <div><p className="miniLabel">MODERN ENGINEERING VIEW</p><h5>企业 RAG 为什么通常拆成四段</h5></div>
                  <p>这不是为了多摆组件，而是为了让每类失败都有独立指标、责任边界和云服务落点。</p>
                </div>
                <div className="engineeringPipeline">
                  <article><span>01</span><h6>候选召回<small>Candidate Retrieval</small></h6><p>优先找全可能支持回答的证据；核心观察 Recall@K 与权限过滤后的召回。</p></article>
                  <article><span>02</span><h6>过滤与重排<small>Filtering & Reranking</small></h6><p>把真正可用的证据排到前面；观察排序质量、过滤正确率与新增时延。</p></article>
                  <article><span>03</span><h6>上下文组装<small>Context Assembly</small></h6><p>处理去重、版本、冲突、顺序、token 预算和来源 ID；不是简单拼接 Top-K。</p></article>
                  <article><span>04</span><h6>有据生成<small>Grounded Generation</small></h6><p>区分事实、推断和建议；证据不足时拒答，重要结论必须能回到原文。</p></article>
                </div>
              </div>

              <div className="principleLimits">
                <article><span>A</span><h5>召回是证据可用性的上限</h5><p>标准证据没有进入候选集，生成器就无法形成可核验引用；即使凭参数记忆猜对，也不能算证据链成功。</p></article>
                <article><span>B</span><h5>相关性不等于真实性</h5><p>检索分数回答“像不像当前问题”，不能证明来源正确、最新或适用于当前客户范围。</p></article>
                <article><span>C</span><h5>增强发生在上下文，不在权重</h5><p>常见企业 RAG 把证据序列化为输入 token，改变本次生成条件；它不会因此把知识永久写入模型参数。</p></article>
              </div>

              <Link className="paperAnchor" href="/references#source-rag-original-2020">原理来源：Lewis et al., {ragOriginalSource.title} ↗</Link>
            </div>

            <div className="workedExample">
              <div className="exampleQuestion"><span>客户问题</span><strong>“企业版产品的数据保留期是多少？”</strong></div>
              <div className="exampleSteps">
                <article><span>01</span><h4>检索<small>Retrieval</small></h4><p>从产品文档、合同条款和最新公告中找候选证据，并按身份过滤。</p></article>
                <article><span>02</span><h4>增强<small>Augmentation</small></h4><p>把有效日期、产品版本、原文片段和引用要求组装成上下文。</p></article>
                <article><span>03</span><h4>生成<small>Generation</small></h4><p>模型比较证据、说明适用范围；证据不足或冲突时拒答并提示人工确认。</p></article>
              </div>
            </div>
            <CriticalBoundary>RAG 的质量不是一个模型分数，而是一条证据链：找得到、排得准、装得下、用得对、引得出。任何一段失效，都可能得到流畅但不可核验的回答。</CriticalBoundary>
          </div>

          <div className="subsection" id="retrieval-basics">
            <div className="subHead"><span>2.3</span><div><p className="kicker">RETRIEVAL MECHANICS</p><h3>检索链的证据形成与失效机制</h3></div></div>
            <div className="mechanicGrid">
              <article><span className="mechanicNo">A</span><h4>解析与切块</h4><p>解析保留文字、表格、标题、页码和版面关系；切块把文档变成可召回单元。块太小会丢上下文，太大则稀释相关信息并增加 token。</p><small>主归属：数据解析 / OCR / 质量运营</small></article>
              <article><span className="mechanicNo">B</span><h4>稀疏检索 · Sparse Retrieval</h4><p>BM25 根据查询词在文档中的出现、稀有程度和文档长度评分。对编号、专有名词、错误码、日期和精确短语通常很强。</p><small>主归属：搜索与索引</small></article>
              <article><span className="mechanicNo">C</span><h4>稠密检索 · Dense Retrieval</h4><p>双编码器把查询与文档映射为向量，以距离寻找语义相近内容。能跨同义表达，但会混淆“语义相似”和“事实相关”。</p><small>主归属：Embedding / 向量数据库</small></article>
              <article><span className="mechanicNo">D</span><h4>过滤与重排</h4><p>先用高吞吐检索取候选，再用更精细模型比较问题与候选；权限、时间、产品和地区过滤必须在上下文组装前生效。</p><small>主归属：检索工程 / 安全</small></article>
            </div>

            <div className="retrievalCompare tableWrap">
              <table>
                <thead><tr><th>机制</th><th>它实际比较什么</th><th>擅长</th><th>常见盲点</th><th>设计建议</th></tr></thead>
                <tbody>
                  <tr><th>BM25 / Sparse</th><td>词项、词频、稀有度与长度</td><td>精确术语、编号、名称</td><td>同义改写、跨语言表达</td><td>保留原始字段与关键词索引</td></tr>
                  <tr><th>Dense / Embedding</th><td>向量空间中的语义距离</td><td>自然语言、同义表达、模糊意图</td><td>精确值、否定、细粒度条件</td><td>用任务数据选择 embedding</td></tr>
                  <tr className="highlight"><th>Hybrid</th><td>融合稀疏与稠密候选</td><td>企业混合语料</td><td>融合权重需要评估</td><td>通常作为企业 PoC 的主对比路线</td></tr>
                  <tr><th>Reranker</th><td>问题与候选的联合相关性</td><td>提高候选排序精度</td><td>增加时延与成本</td><td>只重排有限候选并监测收益</td></tr>
                </tbody>
              </table>
            </div>

            <BalancedGrid className="technicalNotes" maxColumns={3}>
              <article><p className="miniLabel">VECTOR SIMILARITY</p><h4>余弦相似度 · Cosine Similarity</h4><p>直观理解是比较查询向量与文档向量的方向是否接近；分数越高通常表示语义越相近。但分数只在同一 Embedding、同一任务和同一索引配置下有意义，不能跨模型直接比较。</p></article>
              <article><p className="miniLabel">APPROXIMATE SEARCH</p><h4>ANN / HNSW</h4><p>大规模向量库不会逐条精确比较。HNSW 通过分层近邻图快速逼近最近向量，用索引内存、构建时间和召回率换取查询速度。</p></article>
              <article><p className="miniLabel">CHUNKING</p><h4>Chunk Size 的任务依赖性</h4><p>固定长度、按标题、语义切分、父子块各适合不同文档。参数必须用真实问题集同时测召回、上下文完整性、时延和 token。</p></article>
            </BalancedGrid>
          </div>

          <div className="subsection" id="production-rag">
            <div className="subHead"><span>2.4</span><div><p className="kicker">PRODUCTION DIAGNOSTICS</p><h3>从宽召回到可解释诊断</h3></div></div>
            <p className="sectionLead">企业 RAG 常让关键词与向量检索各自“尽量不漏”，再用倒数排名融合（Reciprocal Rank Fusion, RRF）合并不同分数空间的候选，最后用 Reranker 做更精细的查询—证据判断。RRF 解决“怎样合并排名”，Reranker 解决“候选中谁更相关”；二者都不能补回未召回证据。</p>
            <div className="engineeringPipeline">
              <article><span>01</span><h6>双路宽召回<small>Sparse + Dense</small></h6><p>关键词保住编号与专名，向量补足同义表达；两路都按当前身份过滤。</p></article>
              <article><span>02</span><h6>排名融合<small>Rank Fusion / RRF</small></h6><p>基于各自名次融合候选，避免直接比较不可通用的 BM25 与向量原始分数。</p></article>
              <article><span>03</span><h6>精细重排<small>Cross-encoder Rerank</small></h6><p>只在有限候选上做更贵的联合判断，并衡量排序收益与新增延迟。</p></article>
              <article><span>04</span><h6>证据组装<small>Context &amp; Citation</small></h6><p>只把版本正确、无冲突、可引用的证据交给生成器。</p></article>
            </div>
            <div className="tableWrap" style={{ marginTop: 18 }}>
              <table>
                <thead><tr><th>失效环节</th><th>客户看到的症状</th><th>先检查什么</th><th>典型控制</th></tr></thead>
                <tbody>{ragFailureChain.map((item) => <tr key={item.stage}><th>{item.stage}</th><td>{item.symptom}</td><td>{item.check}</td><td>{item.action}</td></tr>)}</tbody>
              </table>
            </div>
            <CriticalBoundary>换更大的生成模型只能改善“证据已经正确进入上下文但模型没用好”的一部分问题。证据在解析、切块、召回或权限过滤阶段丢失时，升级模型不会把它找回来。</CriticalBoundary>
          </div>

          <div className="subsection" id="rag-variants">
            <div className="subHead"><span>2.5</span><div><p className="kicker">RAG PATTERNS</p><h3>基础架构与扩展模式</h3></div></div>
            <div className="variantList">
              {ragVariants.map((item) => (
                <article key={item.name}>
                  <div><p className="miniLabel">{item.cue}</p><h4>{item.name}</h4></div>
                  <p className="variantPipeline">{item.pipeline}</p>
                  <p>{item.boundary}</p>
                </article>
              ))}
            </div>
            <p className="sectionFootnote">术语归属：Naive / Advanced / Modular 属于 RAG 模块；Agent 的规划和工具调用深入应用模式层；知识图谱构建与治理深入数据工程层。</p>
            <div className="tableWrap" style={{ marginTop: 18 }}>
              <table>
                <thead><tr><th>模式</th><th>适合的问题</th><th>新增能力</th><th>主要成本</th><th>选择边界</th></tr></thead>
                <tbody>{ragExtensionChoices.map((item) => <tr key={item.pattern}><th>{item.pattern}</th><td>{item.use}</td><td>{item.adds}</td><td>{item.cost}</td><td>{item.boundary}</td></tr>)}</tbody>
              </table>
            </div>
          </div>

          <div className="subsection" id="when-to-use">
            <div className="subHead"><span>2.6</span><div><p className="kicker">FIT CHECK</p><h3>RAG 适用性判断</h3></div></div>
            <div className="fitGrid">
              <article className="fit yes">
                <h4><span>✓</span> 高匹配</h4>
                <ul>
                  <li>知识频繁变化，需要分钟 / 小时级更新</li>
                  <li>答案必须附来源、页码或原文证据</li>
                  <li>数据按用户、部门或租户分权限</li>
                  <li>语料规模持续增长，无法稳定整体放入上下文</li>
                  <li>需要知道失败发生在检索还是生成</li>
                </ul>
              </article>
              <article className="fit maybe">
                <h4><span>△</span> 需基线对比</h4>
                <ul>
                  <li>语料很小、稳定，可整体放入上下文</li>
                  <li>核心需求是固定格式、语气或专门行为</li>
                  <li>问题依赖实时交易数据与复杂计算</li>
                  <li>没有可用的权威知识源或内容所有者</li>
                  <li>错误代价极高，却不允许拒答或人工复核</li>
                </ul>
              </article>
            </div>
          </div>

          <div className="subsection" id="architecture">
            <div className="subHead"><span>2.7</span><div><p className="kicker">REFERENCE ARCHITECTURE</p><h3>RAG 双链参考架构</h3></div></div>
            <div className="chainWrap">
              <div className="chainLabel"><strong>离线知识链</strong><span>Knowledge pipeline</span></div>
              <div className="flow">
                {knowledgeFlow.map((step, i) => <div className="flowStep" key={step.zh}><span className="flowNo">{String(i+1).padStart(2,'0')}</span><div className="flowTerm"><strong>{step.zh}</strong><small>{step.en}</small></div></div>)}
              </div>
              <div className="chainLabel runtime"><strong>在线问答链</strong><span>Serving pipeline</span></div>
              <div className="flow runtimeFlow">
                {servingFlow.map((step, i) => <div className="flowStep" key={step.zh}><span className="flowNo">{String(i+1).padStart(2,'0')}</span><div className="flowTerm"><strong>{step.zh}</strong><small>{step.en}</small></div></div>)}
              </div>
            </div>
            <div className="architectureNotes">
              <p><strong>共同控制面</strong>：评测集、提示版本、来源谱系、权限策略、日志追踪、成本与 SLA。</p>
              <p><strong>关键分界</strong>：模型负责基于证据生成；应用负责身份、权限、工具调用和最终业务动作。</p>
            </div>
          </div>

          <div className="subsection" id="choice">
            <div className="subHead"><span>2.8</span><div><p className="kicker">CHOICE MATRIX</p><h3>四类知识增强路线对比</h3></div></div>
            <div className="tableWrap">
              <table>
                <thead><tr><th>路线</th><th>最适合</th><th>更新 / 引用</th><th>主要代价</th><th>售前判断</th></tr></thead>
                <tbody>
                  <tr><th>长上下文<br /><small>Long context</small></th><td>小而稳定的封闭语料</td><td>更新简单；可引用但需额外设计</td><td>输入成本、时延、位置偏差</td><td>先做最小基线</td></tr>
                  <tr className="highlight"><th>RAG</th><td>动态、跨源、需权限与证据</td><td>强；可增量更新与撤回</td><td>数据链路与评估复杂度</td><td>默认企业知识路线</td></tr>
                  <tr><th>微调<br /><small>Fine-tuning</small></th><td>稳定行为、风格、格式与领域模式</td><td>知识更新慢；来源难追溯</td><td>数据构造、训练与回归</td><td>针对行为，不替代检索</td></tr>
                  <tr><th>Agentic retrieval</th><td>多步查询、跨系统、需计划与工具</td><td>强，但链路更长</td><td>时延、不可预测性与权限风险</td><td>复杂任务再引入</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="subsection" id="rag-independent-depth" data-quality-section="deep-dive">
            <div className="subHead"><span>2.9</span><div><p className="kicker">INDEPENDENT KNOWLEDGE EXPANSION</p><h3>从检索 Demo 到可持续的证据系统</h3></div></div>
            <p className="sectionLead">本节从生产问题反向组织知识：查询怎样规划、删除与撤权怎样传播、回答怎样绑定主张级证据，以及索引如何无停机迁移。</p>
            <ModuleDeepDiveBlocks blocks={ragDeepDives} sourceLedger={sourceLedger} />
          </div>

          <div className="subsection" id="evidence" data-quality-section="evidence">
            <div className="subHead"><span>2.10</span><div><p className="kicker">DATA WITH CAVEATS</p><h3>可引用数据及适用边界</h3></div></div>
            <ModuleEvidenceGrid cards={evidenceCards} sourceLedger={sourceLedger} />
          </div>

          <div className="subsection cloudSection" id="cloud-opportunities" data-quality-section="cloud">
            <div className="subHead"><span>2.11</span><div><p className="kicker">CLOUD OPPORTUNITY MAP</p><h3>RAG 技术环节与云服务机会</h3></div></div>
            <div className="cloudIntro">
              <p>先用厂商中立能力描述问题，再映射到实际销售的产品。云服务不是附录：它贯穿数据进入、知识处理、模型调用、在线运行、安全和持续运营。</p>
              <span>能力优先</span><span>产品后映射</span><span>以客户约束决定组合</span>
            </div>
            <div className="cloudTable tableWrap">
              <table>
                <thead><tr><th>RAG 环节</th><th>可连接的云服务</th><th>客户价值</th><th>售前发现问题</th></tr></thead>
                <tbody>
                  {cloudHooks.map((item) => (
                    <tr key={item.stage}><th>{item.stage}</th><td>{item.services}</td><td>{item.value}</td><td>{item.discover}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <BalancedGrid className="solutionBundles" maxColumns={3}>
              <article><p className="miniLabel">BUNDLE A</p><h4>安全企业知识助手</h4><p>对象存储 / 文档智能 + 托管搜索 / 向量库 + 模型服务 + API 网关 + IAM / KMS + 可观测。</p><small>购买角色：业务部门、数据负责人、安全与应用团队</small></article>
              <article><p className="miniLabel">BUNDLE B</p><h4>实时知识同步</h4><p>数据库 / SaaS + CDC / 事件总线 + Serverless 处理 + 增量索引 + 缓存失效 + 审计。</p><small>购买角色：数据平台、集成团队、业务运营</small></article>
              <article><p className="miniLabel">BUNDLE C</p><h4>私有化规模运行</h4><p>Kubernetes / GPU 推理 + 私网模型网关 + 向量检索 + 弹性缓存 + APM / FinOps。</p><small>购买角色：平台团队、基础设施、信息安全与采购</small></article>
            </BalancedGrid>
            <p className="sectionFootnote">后续可在不改正文的情况下，为目标云厂商增加“能力 → 产品名称 → 限制 → 计费单位”映射表；表中应显式标注产品版本、适用地域与核验日期。</p>
          </div>

          <div className="subsection" id="poc">
            <div className="subHead"><span>2.12</span><div><p className="kicker">POC PLAYBOOK</p><h3>按风险门禁组织 RAG PoC</h3></div></div>
            <div className="pocGrid">
              <article><span>BASELINE</span><h4>问题与权威基线</h4><p>按业务风险选代表性任务；冻结真实问题、正确答案、证据位置、身份和现有流程表现。样本规模由业务分布决定。</p></article>
              <article><span>DATA PROOF</span><h4>知识与权限证明</h4><p>接入最小权威语料；验证解析、切块、版本、权限、新增、删除与撤权传播，并记录每个处理版本。</p></article>
              <article><span>QUALITY PROOF</span><h4>检索与回答证明</h4><p>一次改变一个主要变量，比较候选召回、重排、最终上下文、主张级引用和拒答，而不是只看最终观感。</p></article>
              <article><span>OPERATIONS</span><h4>负载、安全与交接</h4><p>测试冲突、越权、恶意文档、过期内容、峰值和回滚；达到当前门禁后再进入下一阶段，周期随范围和风险变化。</p></article>
            </div>
            <div className="gates">
              <h4>建议的 Go / No-Go 门槛结构</h4>
              <div className="gateList">
                <span>检索 Recall@K</span><span>引用正确率</span><span>关键任务成功率</span><span>P95 / 首 token</span><span>单次成功成本</span><span>越权泄漏 = 0</span><span>更新 / 删除 SLA</span><span>人工接受率</span>
              </div>
              <p>具体数值必须由客户风险与基线共同决定；不要把通用数字写成合同承诺。</p>
            </div>
          </div>

          <div className="subsection qaSection" id="qa" data-quality-section="qa">
            <div className="subHead"><span>2.13</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h3>客户高频问题与深度回答</h3></div></div>
            <ModuleQaList items={ragQa} sourceLedger={sourceLedger} />
          </div>

        </div>
      </section>

      <footer>
        <div><span className="brandMark">CA</span><strong>云计算 × AI 平台售前知识库</strong></div>
        <p>RAG 独立模块 V1.1 · 2026-07-17</p>
        <a href="#rag">返回顶部 ↑</a>
      </footer>
    </main>
  );
}
