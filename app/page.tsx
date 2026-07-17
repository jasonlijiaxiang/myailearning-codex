import type { CSSProperties } from "react";

import { balanceRows } from "./layout-utils.mjs";
import { evidenceCards, ragQa, sourceLedger } from "./rag-content.mjs";

const layers = [
  {
    no: "01",
    name: "解决方案层",
    en: "Solution Plays",
    purpose: "把技术能力翻译成客户价值、路线与采购边界。",
    modules: [
      { zh: "场景方案库", en: "Scenario Solution Library" },
      { zh: "模型选型格局", en: "Model Selection Landscape" },
      { zh: "行业蓝图", en: "Industry Blueprint" },
      { zh: "商业价值与 TCO", en: "Business Value & TCO" },
    ],
  },
  {
    no: "02",
    name: "应用模式层",
    en: "Application Patterns",
    purpose: "掌握用模型解决问题的主流模式与组合方式。",
    modules: [
      { zh: "RAG · 检索增强生成", en: "Retrieval-Augmented Generation", href: "#rag" },
      { zh: "Agent · 智能体", en: "AI Agent" },
      { zh: "多模态", en: "Multimodality" },
      { zh: "工作流与结构化生成", en: "Workflow & Structured Generation" },
    ],
  },
  {
    no: "03",
    name: "协议与互操作层",
    en: "Protocols & Interoperability",
    purpose: "理解模型、工具、Agent 与系统间如何发现、协作和治理。",
    modules: [
      { zh: "MCP · 模型上下文协议", en: "Model Context Protocol" },
      { zh: "A2A · 智能体间协议", en: "Agent2Agent Protocol" },
      { zh: "API / 事件", en: "API / Event" },
      { zh: "身份与授权边界", en: "Identity & Authorization Boundaries" },
    ],
  },
  {
    no: "04",
    name: "工程保障层",
    en: "Engineering Assurance",
    purpose: "让 PoC 从“能回答”走向“可上线、可治理、可运营”。",
    modules: [
      { zh: "评估", en: "Evaluation" },
      { zh: "安全与治理", en: "Safety & Governance" },
      { zh: "推理与 AI 网关", en: "Inference & AI Gateway" },
      { zh: "可观测与 FinOps", en: "Observability & FinOps" },
    ],
  },
  {
    no: "05",
    name: "模型基础层",
    en: "Model Foundations",
    purpose: "建立解释模型能力、局限与优化手段所需的理论底座。",
    modules: [
      { zh: "模型原理", en: "Model Principles" },
      { zh: "提示词工程", en: "Prompt Engineering" },
      { zh: "训练与微调", en: "Training & Fine-tuning" },
      { zh: "模型压缩与对齐", en: "Model Compression & Alignment" },
    ],
  },
  {
    no: "06",
    name: "数据底座层",
    en: "Data Foundation",
    purpose: "把非结构化与结构化数据转成可信、可检索、可运营的知识。",
    modules: [
      { zh: "解析 / OCR", en: "Parsing & OCR" },
      { zh: "同步 / CDC", en: "Synchronization & CDC" },
      { zh: "向量库与检索", en: "Vector Database & Retrieval" },
      { zh: "质量与知识运营", en: "Quality & Knowledge Operations" },
    ],
  },
  {
    no: "07",
    name: "算力底座层",
    en: "Compute Foundation",
    purpose: "理解模型以下的硬件、集群、存储、网络与平台能力。",
    modules: [
      { zh: "加速器与异构算力", en: "Accelerators & Heterogeneous Compute" },
      { zh: "集群与调度", en: "Clusters & Scheduling" },
      { zh: "推理栈", en: "Inference Stack" },
      { zh: "存储与网络", en: "Storage & Networking" },
    ],
  },
];

const layerCount = layers.length;
const moduleCount = layers.reduce((total, layer) => total + layer.modules.length, 0);


const conceptLinks = [
  { concept: "LLM 与上下文窗口", owner: "模型基础层", relation: "前置知识", local: "理解模型的参数化记忆、token 与注意力边界。" },
  { concept: "Embedding", owner: "模型基础层", relation: "前置知识", local: "理解文本如何映射到向量空间，以及相似度为何不等于事实正确。" },
  { concept: "解析、OCR 与 Chunk", owner: "数据底座层", relation: "知识供给", local: "决定原始资料能否变成完整、可定位、可撤回的检索单元。" },
  { concept: "搜索与向量数据库", owner: "数据底座层", relation: "检索引擎", local: "负责稀疏、稠密、过滤、索引与增量更新，不等同于完整 RAG。" },
  { concept: "Prompt 与 Grounding", owner: "模型基础层", relation: "生成约束", local: "把检索证据、回答规则、引用格式和拒答条件组装成模型输入。" },
  { concept: "评估、安全与网关", owner: "工程保障层", relation: "生产控制", local: "把检索、生成、权限、风险、成本和 SLA 变成可观测控制面。" },
  { concept: "Agent 与 GraphRAG", owner: "应用模式层", relation: "下游演进", local: "多步检索、工具调用与全局主题分析属于 RAG 的组合或扩展。" },
  { concept: "容器、Serverless 与算力", owner: "算力底座层", relation: "运行底座", local: "承载解析任务、检索服务、模型推理和峰值弹性。" },
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

const sourceEntries = Object.entries(sourceLedger);
const evidenceRows = balanceRows(evidenceCards, 4);
const ragOriginalSource = sourceLedger["rag-original-2020"];


export default function Home() {
  return (
    <main>
      <header className="hero" id="top">
        <nav className="topbar" aria-label="主导航">
          <a className="brand" href="#top" aria-label="云与 AI 售前知识库首页">
            <span className="brandMark">CA</span>
            <span>Cloud × AI / Presales Fieldbook</span>
          </a>
          <div className="toplinks">
            <a href="#map">知识地图</a>
            <a href="#rag">RAG 实战包</a>
            <a href="#rag-principle">RAG 原理</a>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="eyebrow">READING EDITION · V0.7</p>
            <h1>云计算 × AI 平台<br />售前知识库</h1>
            <p className="heroLead">
              从客户问题出发，把概念、架构、选择、证据和回答话术连成一条可复用的售前路径。
              中文为主，关键术语中英对照；兼顾理论深度与客户现场可用性。
            </p>
            <div className="heroActions">
              <a className="primaryButton" href="#rag">进入 RAG 实战包</a>
              <a className="textButton" href="#map">浏览完整框架 <span>↘</span></a>
            </div>
          </div>
        </div>
      </header>

      <section className="principles section" aria-labelledby="principles-title">
        <div className="sectionNumber">00</div>
        <div className="sectionBody">
          <div className="sectionIntro">
            <p className="kicker">HOW TO USE</p>
            <h2 id="principles-title">模块阅读框架</h2>
          </div>
          <div className="principleGrid">
            <article><span>01</span><h3>业务目标与边界</h3><p>业务问题、适用边界、非目标与价值假设。</p></article>
            <article><span>02</span><h3>架构判断与选型</h3><p>架构模式、关键变量、选型矩阵与反例。</p></article>
            <article><span>03</span><h3>证据与验收</h3><p>数据、评测、来源类别与验收门槛。</p></article>
            <article><span>04</span><h3>客户沟通</h3><p>客户问题、短答、深答、追问和风险提示。</p></article>
          </div>
        </div>
      </section>

      <section className="section mapSection" id="map" aria-labelledby="map-title">
        <div className="sectionNumber">01</div>
        <div className="sectionBody">
          <div className="sectionIntro splitIntro mapIntro">
            <div className="mapHeading">
              <p className="kicker">KNOWLEDGE MAP</p>
              <h2 id="map-title">知识地图</h2>
              <div className="mapStats" aria-label={`${layerCount} 层架构，${moduleCount} 个细分模块`}>
                <span className="mapStat"><strong>{layerCount}</strong><span>层架构</span></span>
                <span className="mapStat"><strong>{moduleCount}</strong><span>个细分模块</span></span>
              </div>
            </div>
            <p>目录按售前对话的自然顺序自上而下；学习时可从底座向上补齐。层与层之间通过相关能力与客户证据交叉链接。</p>
          </div>

          <div className="layerStack">
            {layers.map((layer) => (
              <article className="layer" key={layer.no}>
                <div className="layerIndex">{layer.no}</div>
                <div className="layerTitle">
                  <h3>{layer.name}</h3>
                  <p>{layer.en}</p>
                </div>
                <div className="layerContent">
                  <p className="layerPurpose">{layer.purpose}</p>
                  <div
                    className="chips"
                    data-count={layer.modules.length}
                    data-odd={layer.modules.length % 2 === 1 ? "true" : "false"}
                  >
                    {balanceRows(layer.modules, 4).flatMap((row) =>
                      row.map((module) => {
                        const content = <><strong>{module.zh}</strong><small>{module.en}</small></>;
                        const style = { "--module-span": 12 / row.length } as CSSProperties;
                        return module.href
                          ? <a key={module.zh} href={module.href} style={style} aria-label={`${module.zh}：跳转到对应模块`}>{content}</a>
                          : <span key={module.zh} style={style}>{content}</span>;
                      }),
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="curriculum">
            <div>
              <p className="kicker">LEARNING PATHS</p>
              <h3>任务导向的学习路径</h3>
            </div>
            <div className="pathCards">
              <article><strong>新入门 · 4 周</strong><p>模型基础 → RAG → 评估 → 场景方案</p></article>
              <article><strong>做 PoC · 2 周</strong><p>场景 → 数据 → RAG / Agent → 验收与安全</p></article>
              <article><strong>做平台规划</strong><p>方案组合 → 工程保障 → 数据 / 算力底座 → TCO</p></article>
            </div>
          </div>
        </div>
      </section>

      <section className="ragHero" id="rag" aria-labelledby="rag-title">
        <div className="ragHeader">
          <div>
            <p className="kicker light">MODULE SAMPLE · APPLICATION PATTERN</p>
            <h2 id="rag-title">RAG<br /><span>检索增强生成 · Retrieval-Augmented Generation</span></h2>
          </div>
          <div className="ragDefinition">
            <p>用可更新、可追溯的外部证据增强模型回答；核心不是“接一个向量库”，而是建立一条可评估、可授权、可运营的知识供应链。</p>
            <div className="moduleMeta"><span>基础原理 + 工程 + 售前</span><span>跨模块知识串联</span><span>{sourceEntries.length} 份核验来源</span></div>
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

          <div className="subsection" id="concept-map">
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
                        <div className="conceptMeta"><span>{item.relation}</span><a href="#map">{item.owner} ↗</a></div>
                        <h4>{item.concept}</h4>
                        <p>{item.local}</p>
                      </div>
                    </article>
                  )),
                )}
              </div>
            )}
          </div>

          <div className="subsection foundationSection" id="rag-principle">
            <div className="subHead"><span>2.2</span><div><p className="kicker">FOUNDATION &amp; MECHANICS</p><h3>RAG 的概率模型与工程机制</h3></div></div>
            <div className="memoryCompare">
              <article>
                <p className="miniLabel">PARAMETRIC MEMORY</p>
                <h4>参数化记忆</h4>
                <p>模型训练时压缩进权重的语言规律与世界知识。调用快、泛化强，但知识何时写入、能否精确更新、来源在哪里，都难以直接控制。</p>
              </article>
              <article className="externalMemory">
                <p className="miniLabel">NON-PARAMETRIC MEMORY</p>
                <h4>非参数化记忆</h4>
                <p>文档、数据库、搜索索引和知识图谱等外部数据。可以独立新增、撤回、授权和审计，RAG 在推理时把相关部分临时交给模型。</p>
              </article>
            </div>

            <div className="principleDepth">
              <header className="principleDepthIntro">
                <p className="miniLabel">ORIGINAL PROBABILISTIC VIEW</p>
                <h4>从概率模型理解 RAG</h4>
                <p>原始 RAG 把检索到的文档 <strong>z</strong> 视为潜变量（Latent Variable）：模型不预先指定由哪篇文档解释目标输出，而是让检索器给候选证据分配相关性概率，再让生成器估计“在该证据条件下生成答案”的概率，最后对候选证据做边缘化（Marginalization）。下式先用序列级的 RAG-Sequence 解释这一思想，随后再与 RAG-Token 对照。</p>
              </header>

              <div className="probabilityModel">
                <div className="probabilityFormula">
                  <p className="miniLabel">RAG-SEQUENCE · LATENT-DOCUMENT MARGINALIZATION</p>
                  <p className="formula">p(y | x) ≈ Σ<sub>z ∈ Top-K</sub> p<sub>η</sub>(z | x) · p<sub>θ</sub>(y | x, z)</p>
                  <p>这里的 <strong>y</strong> 是完整输出序列；Top-K 是对“遍历整个知识库并求和”的计算近似，而不是把第一条检索结果直接当成答案。它是原始 RAG-Sequence 的序列级形式，不是所有现代 RAG 实现的统一公式。</p>
                </div>
                <div className="probabilityTerms">
                  <div><strong>x</strong><span>输入 / 查询<br /><small>Input / Query</small></span></div>
                  <div><strong>z</strong><span>检索证据<br /><small>Retrieved Evidence</small></span></div>
                  <div><strong>y</strong><span>输出序列<br /><small>Output Sequence</small></span></div>
                </div>
              </div>

              <div className="componentTheory">
                <article>
                  <p className="miniLabel">RETRIEVER · pη(z | x)</p>
                  <h5>检索器决定“看什么”</h5>
                  <p className="deepFormula">p<sub>η</sub>(z | x) = softmax(q<sub>η</sub>(x) · d(z))</p>
                  <p>原始论文使用 DPR 双编码器（Bi-encoder）：查询向量与文档向量做最大内积搜索（MIPS），形成 Top-K 候选。这个概率表示<strong>任务相关性</strong>，不表示文档真实、权威或仍然有效。</p>
                </article>
                <article>
                  <p className="miniLabel">GENERATOR · pθ(y | x,z)</p>
                  <h5>生成器决定“怎么说”</h5>
                  <p className="deepFormula">p<sub>θ</sub>(y | x,z) = ∏<sub>i</sub> p<sub>θ</sub>(y<sub>i</sub> | x,z,y&lt;i)</p>
                  <p>生成器仍然逐 token 自回归预测。检索证据只是新的条件输入；模型可能正确使用、忽略、误读或与参数化记忆混合，因此“检到了”不等于“答对了”。</p>
                </article>
              </div>

              <div className="marginalizationIntro">
                <p className="miniLabel">TWO ORIGINAL FORMULATIONS</p>
                <h5>RAG-Sequence 与 RAG-Token 的差别在“何时对文档求和”</h5>
              </div>
              <div className="marginalizationGrid">
                <article>
                  <span>01</span><h5>RAG-Sequence</h5>
                  <p className="deepFormula">Σ<sub>z</sub> p<sub>η</sub>(z|x) · ∏<sub>i</sub> p<sub>θ</sub>(y<sub>i</sub>|x,z,y&lt;i)</p>
                  <p>整段输出共享同一个潜在文档假设；先分别计算每个文档条件下的完整序列概率，再在文档维度求和。</p>
                </article>
                <article>
                  <span>02</span><h5>RAG-Token</h5>
                  <p className="deepFormula">∏<sub>i</sub> Σ<sub>z</sub> p<sub>η</sub>(z|x) · p<sub>θ</sub>(y<sub>i</sub>|x,z,y&lt;i)</p>
                  <p>每个输出 token 都可以由不同文档影响；先在当前 token 上对文档求和，再进入下一个 token。</p>
                </article>
              </div>
              <p className="paperBoundary"><strong>论文边界：</strong>两者是 2020 年原始论文的概率建模方式，不是今天云平台上两种通用部署模板。常见的“检索多段内容—拼装 Prompt—调用大模型 API”通常没有显式计算上述边缘概率。</p>

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
                <div className="trainingCompare">
                  <article><strong>原始论文</strong><p>查询编码器与 BART 生成器联合微调；文档编码器和索引保持固定，避免反复重建索引。</p></article>
                  <article><strong>企业工程</strong><p>Embedding、搜索、Reranker 与大模型通常来自独立服务，分阶段评估、升级和回滚；权限也必须在模型外执行。</p></article>
                </div>
              </div>

              <div className="principleLimits">
                <article><span>A</span><h5>召回是证据可用性的上限</h5><p>标准证据没有进入候选集，生成器就无法形成可核验引用；即使凭参数记忆猜对，也不能算证据链成功。</p></article>
                <article><span>B</span><h5>相关性不等于真实性</h5><p>检索分数回答“像不像当前问题”，不能证明来源正确、最新或适用于当前客户范围。</p></article>
                <article><span>C</span><h5>增强发生在上下文，不在权重</h5><p>常见企业 RAG 把证据序列化为输入 token，改变本次生成条件；它不会因此把知识永久写入模型参数。</p></article>
              </div>

              <a className="paperAnchor" href={ragOriginalSource.href} target="_blank" rel="noreferrer">原始模型来源：Lewis et al., {ragOriginalSource.title} ↗</a>
            </div>

            <div className="workedExample">
              <div className="exampleQuestion"><span>客户问题</span><strong>“企业版产品的数据保留期是多少？”</strong></div>
              <div className="exampleSteps">
                <article><span>01</span><h4>检索<small>Retrieval</small></h4><p>从产品文档、合同条款和最新公告中找候选证据，并按身份过滤。</p></article>
                <article><span>02</span><h4>增强<small>Augmentation</small></h4><p>把有效日期、产品版本、原文片段和引用要求组装成上下文。</p></article>
                <article><span>03</span><h4>生成<small>Generation</small></h4><p>模型比较证据、说明适用范围；证据不足或冲突时拒答并提示人工确认。</p></article>
              </div>
            </div>
            <aside className="callout" aria-label="重要边界">
              <div className="calloutTitle"><span>必须记住</span><strong>重要边界</strong><small>Critical Boundary</small></div>
              <p>RAG 的质量不是一个模型分数，而是一条证据链：找得到、排得准、装得下、用得对、引得出。任何一段失效，都可能得到流畅但不可核验的回答。</p>
            </aside>
          </div>

          <div className="subsection" id="retrieval-basics">
            <div className="subHead"><span>2.3</span><div><p className="kicker">RETRIEVAL MECHANICS</p><h3>检索链的证据形成与失效机制</h3></div></div>
            <div className="mechanicGrid">
              <article><span className="mechanicNo">A</span><h4>解析与切块</h4><p>解析保留文字、表格、标题、页码和版面关系；切块把文档变成可召回单元。块太小会丢上下文，太大则稀释相关信息并增加 token。</p><small>主归属：数据解析 / OCR / 质量运营</small></article>
              <article><span className="mechanicNo">B</span><h4>稀疏检索</h4><p>BM25 根据查询词在文档中的出现、稀有程度和文档长度评分。对编号、专有名词、错误码、日期和精确短语通常很强。</p><small>主归属：搜索与索引</small></article>
              <article><span className="mechanicNo">C</span><h4>稠密检索</h4><p>双编码器把查询与文档映射为向量，以距离寻找语义相近内容。能跨同义表达，但会混淆“语义相似”和“事实相关”。</p><small>主归属：Embedding / 向量数据库</small></article>
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

            <div className="technicalNotes">
              <article><p className="miniLabel">VECTOR SIMILARITY</p><h4>余弦相似度</h4><p className="smallFormula">cos(q,d) = (q · d) / (‖q‖ ‖d‖)</p><p>衡量向量方向接近程度。分数只在同一 embedding、同一任务和同一索引配置下有意义，不能跨模型直接比较。</p></article>
              <article><p className="miniLabel">APPROXIMATE SEARCH</p><h4>ANN / HNSW</h4><p>大规模向量库不会逐条精确比较。HNSW 通过分层近邻图快速逼近最近向量，用索引内存、构建时间和召回率换取查询速度。</p></article>
              <article><p className="miniLabel">CHUNKING</p><h4>Chunk Size 的任务依赖性</h4><p>固定长度、按标题、语义切分、父子块各适合不同文档。参数必须用真实问题集同时测召回、上下文完整性、时延和 token。</p></article>
            </div>
          </div>

          <div className="subsection" id="rag-variants">
            <div className="subHead"><span>2.4</span><div><p className="kicker">RAG PATTERNS</p><h3>RAG 架构模式</h3></div></div>
            <div className="variantList">
              {ragVariants.map((item) => (
                <article key={item.name}>
                  <div><p className="miniLabel">{item.cue}</p><h4>{item.name}</h4></div>
                  <p className="variantPipeline">{item.pipeline}</p>
                  <p>{item.boundary}</p>
                </article>
              ))}
            </div>
            <p className="sectionFootnote">术语归属：Naive / Advanced / Modular 属于 RAG 模块；Agent 的规划和工具调用深入应用模式层；知识图谱构建与治理深入数据底座层。</p>
          </div>

          <div className="subsection" id="when-to-use">
            <div className="subHead"><span>2.5</span><div><p className="kicker">FIT CHECK</p><h3>RAG 适用性判断</h3></div></div>
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
            <div className="subHead"><span>2.6</span><div><p className="kicker">REFERENCE ARCHITECTURE</p><h3>RAG 双链参考架构</h3></div></div>
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
            <div className="subHead"><span>2.7</span><div><p className="kicker">CHOICE MATRIX</p><h3>四类知识增强路线对比</h3></div></div>
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

          <div className="subsection" id="evidence">
            <div className="subHead"><span>2.8</span><div><p className="kicker">DATA WITH CAVEATS</p><h3>可引用数据及适用边界</h3></div></div>
            <div className="evidenceGrid" data-count={evidenceCards.length} data-odd={evidenceCards.length % 2 === 1 ? "true" : "false"}>
              {evidenceRows.flatMap((row) =>
                row.map((card) => {
                  const source = sourceLedger[card.sourceId as keyof typeof sourceLedger];
                  return (
                    <article
                      className={`metricCard${card.accent ? " accent" : ""}`}
                      key={card.title}
                      style={{ "--evidence-span": 12 / row.length } as CSSProperties}
                    >
                      <p className="metric">{card.metric}</p>
                      <h4>{card.title}</h4>
                      <p className="metricFinding">{card.finding}</p>
                      <p className="metricBoundary"><strong>适用边界</strong>{card.boundary}</p>
                      <a href={`#source-${card.sourceId}`}>对应来源 · {source.shortTitle} ↓</a>
                    </article>
                  );
                }),
              )}
            </div>
          </div>

          <div className="subsection cloudSection" id="cloud-opportunities">
            <div className="subHead"><span>2.9</span><div><p className="kicker">CLOUD OPPORTUNITY MAP</p><h3>RAG 技术环节与云服务机会</h3></div></div>
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
            <div className="solutionBundles">
              <article><p className="miniLabel">BUNDLE A</p><h4>安全企业知识助手</h4><p>对象存储 / 文档智能 + 托管搜索 / 向量库 + 模型服务 + API 网关 + IAM / KMS + 可观测。</p><small>购买角色：业务部门、数据负责人、安全与应用团队</small></article>
              <article><p className="miniLabel">BUNDLE B</p><h4>实时知识同步</h4><p>数据库 / SaaS + CDC / 事件总线 + Serverless 处理 + 增量索引 + 缓存失效 + 审计。</p><small>购买角色：数据平台、集成团队、业务运营</small></article>
              <article><p className="miniLabel">BUNDLE C</p><h4>私有化规模运行</h4><p>Kubernetes / GPU 推理 + 私网模型网关 + 向量检索 + 弹性缓存 + APM / FinOps。</p><small>购买角色：平台团队、基础设施、信息安全与采购</small></article>
            </div>
            <p className="sectionFootnote">后续可在不改正文的情况下，为目标云厂商增加“能力 → 产品名称 → 限制 → 计费单位”映射表；表中应显式标注产品版本、适用地域与核验日期。</p>
          </div>

          <div className="subsection" id="poc">
            <div className="subHead"><span>2.10</span><div><p className="kicker">POC PLAYBOOK</p><h3>10 个工作日 PoC 验证包</h3></div></div>
            <div className="pocGrid">
              <article><span>D1–2</span><h4>定义问题与基线</h4><p>选 2–3 个高价值任务；冻结真实问题、正确答案、证据位置与风险等级；用长上下文 / 现有搜索建立基线。</p></article>
              <article><span>D3–5</span><h4>打通知识链</h4><p>接入最小权威语料；验证解析、切块、元数据、权限与增量更新；记录每个处理版本。</p></article>
              <article><span>D6–8</span><h4>对比检索与生成</h4><p>比较 sparse / dense / hybrid、Top-K 与 rerank；固定生成配置，避免同时改太多变量。</p></article>
              <article><span>D9–10</span><h4>红队与验收</h4><p>测试拒答、冲突、越权、恶意文档、过期内容和峰值延迟；输出差距清单、上线门槛与容量估算。</p></article>
            </div>
            <div className="gates">
              <h4>建议的 Go / No-Go 门槛结构</h4>
              <div className="gateList">
                <span>检索 Recall@K</span><span>引用正确率</span><span>关键任务成功率</span><span>P95 / 首 token</span><span>单次成功成本</span><span>越权泄漏 = 0</span><span>更新 / 删除 SLA</span><span>人工接受率</span>
              </div>
              <p>具体数值必须由客户风险与基线共同决定；不要把通用数字写成合同承诺。</p>
            </div>
          </div>

          <div className="subsection qaSection" id="qa">
            <div className="subHead"><span>2.11</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h3>客户高频问题与深度回答</h3></div></div>
            <p className="qaGuide">现场先给“结论短答”，客户继续追问时再展开“深一层”。每题同时标出具体依据、证据支持范围和售前必须确认的下一问。</p>
            <div className="qaList">
              {ragQa.map((item, index) => (
                <details key={item.q} open={index === 0}>
                  <summary><span className="qaNo">Q{String(index + 1).padStart(2, '0')}</span><strong>{item.q}</strong><span className="qaTag">{item.tag}</span><span className="plus">＋</span></summary>
                  <div className="qaAnswer">
                    <div><p className="answerLabel">结论短答</p><p>{item.a}</p></div>
                    <div><p className="answerLabel">深一层</p><p>{item.depth}</p></div>
                    <div className="qaBasis" aria-label="本题依据">
                      <div className="qaBasisHead">
                        <p className="answerLabel">本题依据 / Evidence</p>
                        <span>{item.basis}</span>
                      </div>
                      <div className="qaBasisList" data-count={item.evidence.length} data-odd={item.evidence.length % 2 === 1 ? "true" : "false"}>
                        {balanceRows(item.evidence, 3).flatMap((row) =>
                          row.map((reference) => {
                            const source = sourceLedger[reference.sourceId as keyof typeof sourceLedger];
                            return (
                              <a
                                href={`#source-${reference.sourceId}`}
                                key={reference.sourceId}
                                style={{ "--qa-evidence-span": 12 / row.length } as CSSProperties}
                              >
                                <span className="qaEvidenceMeta">{source.grade} · {source.kind}</span>
                                <strong>{source.shortTitle}</strong>
                                <small>{reference.supports}</small>
                              </a>
                            );
                          }),
                        )}
                      </div>
                    </div>
                    <div className="ask"><p className="answerLabel">售前下一问</p><p>{item.ask}</p></div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="subsection" id="sources">
            <div className="subHead"><span>2.12</span><div><p className="kicker">SOURCE LEDGER</p><h3>本模块的来源与证据类别</h3></div></div>
            <div className="sourceGuide">
              <p>问答中的“本题依据”只说明来源具体支撑哪一段结论；点击可回到此处查看完整边界，再打开原文。时延、成本、SLA 与 TCO 等客户相关数值仍须以当期产品资料和客户 PoC 为准。</p>
              <div className="sourceLegend" aria-label="证据类型说明">
                <span><strong>A</strong> 论文 / 教材 / 一手研究</span>
                <span><strong>B</strong> 可复核厂商实验</span>
                <span><strong>O</strong> 官方出版物 / 框架</span>
                <span><strong>G</strong> 行业社区指南</span>
              </div>
            </div>
            <div className="sourceList">
              {sourceEntries.map(([sourceId, source]) => (
                <a className="sourceItem" id={`source-${sourceId}`} href={source.href} target="_blank" rel="noreferrer" key={sourceId}>
                  <span className="sourceLevel">{source.grade} / {source.kind}</span>
                  <span className="sourceTitle"><strong>{source.title}</strong><small>{source.note}</small></span>
                  <span className="sourceDate">核验：{source.verifiedAt}<br />打开原文 ↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div><span className="brandMark">CA</span><strong>云计算 × AI 平台售前知识库</strong></div>
        <p>知识地图 + RAG 样板模块 V0.7 · 2026-07-17</p>
        <a href="#top">返回顶部 ↑</a>
      </footer>
    </main>
  );
}
