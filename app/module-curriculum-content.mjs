import { completionCurriculum } from "./module-completion-content.mjs";
import { applicationFinopsCurriculum } from "./module-briefs-application-finops.mjs";
import { governanceMlopsCurriculum } from "./module-briefs-governance-mlops.mjs";

/**
 * 共享模块的课程地图。
 *
 * 它补足“原则卡”和“深挖区”之间的知识跨度：读者可以先看到一门课的
 * 完整概念版图，再进入机制、决策、实验和问答。内容按网页学习逻辑重组，
 * 只保存稳定 sourceId，不复制来源元数据或外部材料结构。
 */
const baseModuleCurriculumContent = Object.freeze({
  ...governanceMlopsCurriculum,
  "solution-patterns": {
    lead: "场景方案不是通用架构图，而是从业务结果与当前基线出发，用可测约束选择最小充分闭环，再把责任、证据、运营、完整成本与退出连成一条可决策路径。",
    chapters: [
      { title: "先冻结结果、基线与权威终态", en: "Outcome & Baseline", explanation: "明确使用者、触发、当前流程与成本、要改变的工作、权威完成状态、异常去向、责任人和不可接受损失。这样才能把“做一个智能助手”改写成可验证任务，并知道 AI 相对什么改善。", decision: "先确认谁的什么工作如何变化、由哪个系统或负责人确认，再讨论模型与云产品。", boundary: "模型输出、用户离开页面或理论节省都不能自动代表业务成功。", sourceIds: ["nist-genai-profile", "finops-unit-economics"] },
      { title: "明确非功能要求及其约束", en: "Constraint Envelope", explanation: "为质量、P95/P99 时延、吞吐、可用性、恢复、隐私、驻留、授权、审计、成本、维护与迁移分别写触发场景、度量、阈值优先级和 Owner。", decision: "硬约束先划定可行域；未知项进入 PoC 或 Pilot 验证，不在报价中默认为通过。", boundary: "一张没有场景、优先级和观察方法的 NFR 清单无法指导架构权衡。", sourceIds: ["nist-genai-profile", "nist-zero-trust"] },
      { title: "从最小充分闭环选择能力", en: "Minimum Sufficient Loop", explanation: "先比较现有流程、无 AI、确定性规则与单次模型调用。当前且可归因的知识缺口才增加 RAG；新证据会改变路径才增加 Agent；多个 Host 重复接入工具才考虑 MCP；独立 Agent 域需要可持续任务委托才考虑 A2A；跨应用需要统一模型入口、身份、路由、限流预算与遥测才考虑 Gateway；多团队需要自助、准入调度、隔离恢复与资源经济才建设平台能力。", decision: "每个组件都要说明必要条件、Owner、失败响应和移除条件。", boundary: "技术名称不是成熟度阶梯；本模块只负责采用判断，具体机制回到相关模块。", sourceIds: ["rag-original-2020", "anthropic-effective-agents", "mcp-architecture", "a2a-concepts", "cloudflare-ai-gateway", "cncf-platforms-whitepaper", "nist-genai-profile"] },
      { title: "责任架构要能支持失败和替换", en: "Responsibility Architecture", explanation: "业务结果、数据证据、模型、编排状态、确定性控制、人工判断、评估运营以及经济退出形成八层责任。每条连线说明主体、数据、Schema、超时、重试、幂等或补偿、观测、Owner 和替换方式。", decision: "只保留能改变质量、风险、成本或可运营性的组件，并对它做移除测试。", boundary: "组件齐全不等于端到端正确，接口成功也不等于权威业务状态成立。", sourceIds: ["nist-genai-profile", "nist-zero-trust", "opentelemetry-genai-semconv"] },
      { title: "客服要验收解决问题，不只验收回答", en: "Customer Service", explanation: "客服通常包含意图识别、知识检索、答复、业务查询、工单和人工转接。应按自助解决率、首次解决率、转人工质量、平均处理时间和错误补偿观察完整漏斗，并区分文字与语音渠道。", decision: "根据问题风险把请求分为自助回答、辅助坐席和人工处理。", boundary: "自助率升高可能来自用户放弃；流畅答复也可能造成错误承诺。", sourceIds: ["ragas", "nist-genai-profile"] },
      { title: "企业搜索的核心是权限和证据", en: "Enterprise Search", explanation: "连接器、解析、索引、权限同步、检索、重排、生成和引用共同形成企业搜索链。部门问答可从有限知识域开始；全公司搜索还要解决跨系统身份、版本冲突、撤权传播和结果解释。", decision: "先选权威资料和高价值查询，再逐步扩大连接器范围。", boundary: "搜得到不等于有权看，引用存在也不等于答案正确。", sourceIds: ["ragas", "nist-zero-trust", "owasp-vector-weaknesses"] },
      { title: "内容生成要建立发布流水线", en: "Content Production", explanation: "营销文案、图片和视频要经过素材授权、品牌资料、生成、事实与版权检查、人工审核、渠道发布和效果反馈。Prompt、RAG 与微调可分别处理临时要求、可更新知识和稳定风格。", decision: "把目标定义为可安全发布的资产，不是一次生成成功。", boundary: "视觉或语言质量好不能证明事实、版权、肖像和品牌合规。", sourceIds: ["nist-genai-profile", "owasp-prompt-injection"] },
      { title: "AI Coding 要接入现有工程门禁", en: "AI Coding", explanation: "补全适合局部编码，任务型 Agent 可搜索代码、修改多文件并运行工具。生产试点要纳入仓库权限、依赖与密钥扫描、测试、代码审查、分支保护和变更追踪，并以交付周期和返工率衡量。", decision: "从低风险仓库和可自动验证任务开始，逐步增加动作权限。", boundary: "代码能编译不表示需求正确、安全或便于维护。", sourceIds: ["anthropic-effective-agents", "nist-zero-trust"] },
      { title: "数字人先分内容工厂与实时交互", en: "Digital Human", explanation: "离线内容工厂关注脚本、声音、形象、渲染、审核和发布；实时数字人还包含语音识别、对话、语音合成、口型渲染、打断和人工接管。两类架构的时延、成本、同意和风险完全不同。", decision: "先判断是批量生产资产，还是实时完成服务任务。", boundary: "形象和声音授权、生成内容标识及高风险话术需要单独审查。", sourceIds: ["nist-genai-profile"] },
      { title: "ChatBI 要把自然语言锁进语义口径", en: "ChatBI", explanation: "自然语言提问要经过意图、指标与维度解析、受控查询生成、只读执行、结果校验、归因和报告。语义层负责定义收入、客户、时间等口径，查询层负责权限、成本上限和禁止操作。", decision: "先覆盖少量有权威口径的指标，再扩大自由查询范围。", boundary: "SQL 可以运行不表示业务口径正确；模型也不应获得任意写权限。", sourceIds: ["nist-zero-trust", "nist-genai-profile"] },
      { title: "会议助手要确认行动是否落实", en: "Meeting Assistant", explanation: "采集、语音识别、说话人区分、摘要、决定与行动项抽取、确认、通知和后续系统写入组成完整链。指标不仅包括转写准确率，还包括关键决定召回、责任人与截止时间正确率。", decision: "先决定会议内容可否采集、保存和进入哪些后续系统。", boundary: "摘要会省时间，但不能自动代表参会者同意或替代正式决策记录。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv", "opentelemetry-genai-semconv"] },
      { title: "四个阶段门回答四类问题", en: "Discovery to Production", explanation: "Discovery 判断是否有值得改变的结果，PoC 证伪最大技术或数据不确定性，Pilot 验证真实负载、边界样本与约束，Production 验证持续责任、恢复、单位经济与业务结果。", decision: "每一阶段预先写明 Go、Hold、No-Go、修复、扩展与 Exit 条件。", boundary: "几个漂亮答案只能证明演示路径可走；硬门缺证据时不能以更多资源换取放行。", sourceIds: ["ragas", "nist-genai-profile"] },
      { title: "用单位达标结果决定运营与退出", en: "Economics & Exit", explanation: "模型与云资源只是成本的一部分；还要计入数据、集成、评估、安全、人工、失败、补偿、维护、迁移和退役。把完整成本连接到权威业务终态，并保留扩展、限制、回滚、迁移和停止决定。", decision: "以每个达标业务结果的完整成本和投资状态比较方案。", boundary: "缺少最终状态和客户基线时只能报告假设与区间；单位经济不能单独证明因果 ROI。", sourceIds: ["finops-unit-economics", "finops-ai-tools-considerations", "nist-genai-profile"] },
      ...applicationFinopsCurriculum["ai-finops"].chapters,
    ],
  },
  "model-landscape": {
    lead: "模型格局学习的目标不是记住一次排名，而是沿理赔初审案例建立可复现的选型链：任务与损失、硬门、候选身份、同条件试点、组合、发布与退出。",
    chapters: [
      { title: "模型、产品与服务形态", en: "Model, Product, Service", explanation: "同一模型名称可能对应 API、托管平台、消费端产品或开放权重制品。上下文、工具、数据处理、区域、配额和支持策略属于产品能力的一部分，不能只比较基础模型。", decision: "先确定采购对象和责任边界，再比较能力。", boundary: "厂商页面中的模型能力不能自动外推到所有地区、账户层级和集成形态。", sourceIds: ["openai-models", "google-models", "anthropic-models"] },
      { title: "闭源、开放权重与开源", en: "Access Spectrum", explanation: "API 服务提供托管运行；开放权重允许在许可范围内获取和运行参数；开放源代码 AI 还要求使用、研究、修改和分享自由，以及足够的数据说明、代码和参数。开放程度改变可控范围，也改变维护与供应链责任。", decision: "把许可原文、数据边界、运维能力和可审计要求一起纳入选型。", boundary: "可下载不代表可任意商用、满足开放源代码 AI 定义，或自动获得更高透明度与安全性。", sourceIds: ["osi-open-source-ai-definition-1-0", "nist-genai-profile"] },
      { title: "能力矩阵与任务切片", en: "Capability Matrix", explanation: "文本、代码、视觉、语音、工具调用、长上下文和推理预算需要按客户任务分别验证。当产品暴露 reasoning effort 等控制时，同一模型与不同配置也应视作不同候选：同时测任务成功、推理 Token、TTFT、总时延和每次有效结果成本。", decision: "用客户任务集决定模型、可用的推理配置与分工，不寻找无条件最强模型。", boundary: "不是所有模型都支持显式推理预算；更长测试时计算也不保证正确，公开基准只能用于形成验证假设。", sourceIds: ["nist-genai-profile", "deepseek-r1-2025", "openai-reasoning-guide", "openai-models", "google-models"] },
      { title: "运行经济与结果单位", en: "Operating Economics", explanation: "输入、输出、缓存、批处理、工具循环、重试、人工复核和失败返工共同决定成本；具体计价与性能必须按候选当期产品资料和目标负载测量。", decision: "在相同质量门下报告 P95、成功率与每个被接受业务结果成本。", boundary: "Token 单价、一次调用成本和客户 ROI 是三个不同层次；公开单价与上下文上限变化很快。", sourceIds: ["finops-unit-economics", "openai-models", "anthropic-models", "google-models"] },
      { title: "路由、回退与组合", en: "Routing & Fallback", explanation: "规则路由处理明确约束，分类器或模型路由处理复杂度判断，人工或高能力模型承接高风险和低置信请求。回退不仅是换供应商，还要明确允许牺牲的质量、功能和数据边界。", decision: "为每类请求预先定义主路径、保护组、回退和停止条件。", boundary: "动态路由本身会误判，必须独立评估、观测并可快速关闭。", sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv"] },
      { title: "版本发布与可替换性", en: "Release Discipline", explanation: "模型版本改变会影响输出、拒答、工具 Schema、Token 使用和延迟。可替换性来自统一契约、代表性回归、影子验证和数据可迁移，而不是在配置里保留第二个模型名称。", decision: "把模型升级当作软件与风险策略共同变更。", boundary: "同一家族的新版本也可能出现行为漂移，不能因厂商兼容承诺跳过客户回归。", sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv"] },
    ],
  },
  multimodal: {
    lead: "从一次设备现场巡检出发：照片、铭牌、短视频、语音和巡检表只有形成可回跳原始证据的异常结论，才构成可用的多模态方案。",
    chapters: [
      { title: "业务任务与证据契约", en: "Task & Evidence Contract", explanation: "先定义巡检要识别的状态、不可接受漏检、允许的推断、原始证据坐标和人工责任，再判断文本基线究竟遗漏了布局、图像、声音还是时序。", decision: "先证明非文本证据对任务有增量价值，再引入对应模态。", boundary: "能上传图片或播放音频不等于系统已经完成多模态理解。", sourceIds: ["nist-genai-profile", "docling-report"] },
      { title: "采集质量与视觉表示", en: "Capture & Visual Representation", explanation: "模糊、截断、噪声、缺页和错误采样会在推理前丢失事实；ViT 的 Patch 序列也说明分辨率、裁剪和输入规模共同影响细节与成本。", decision: "为小字、密集表格、局部异常和低清媒体设置质量门、重传与裁剪策略。", boundary: "更大模型不能恢复未被采集或已在预处理阶段丢失的信息。", sourceIds: ["vit-2021", "nist-genai-profile"] },
      { title: "跨模态对齐：CLIP", en: "Contrastive Alignment", explanation: "CLIP 用对比学习把图像和文本映射到可比较空间，支持开放词汇匹配和检索。对齐空间适合找相似语义，不等于细粒度 OCR、逻辑推理或事实核验。", decision: "用跨模态检索解决候选发现，用专用解析或推理处理精确结构。", boundary: "相似度高只表示表示空间接近，不证明图像内容满足业务条件。", sourceIds: ["clip-2021"] },
      { title: "专用、原生与混合路线", en: "Specialist, Native & Hybrid", explanation: "OCR、ASR 和文档解析提供可检查中间结果，原生模型处理开放图文关系，混合路线按输入和风险组合两者。PP-OCRv5 说明专用小模型在其测试 OCR Benchmark 内仍可与多种大参数 VLM 竞争。", decision: "在同一客户任务、困难切片和门槛下比较任务成功、证据坐标、P95、成本与人工复核。", boundary: "论文结果不能外推到所有语言、版式、表格语义和生产 TCO，也不存在按任务名称自动选路的通用公式。", sourceIds: ["pp-ocrv5-2026", "docling-report", "colpali-2025"] },
      { title: "结构、对齐与证据坐标", en: "Structure & Evidence Coordinates", explanation: "OCR 字符、表格行列、图片关系、说话人和视频事件是不同层；每个派生观察都应绑定原资产、页码、区域、时间段或说话人。", decision: "把采集、解析、对齐和最终主张分层验收，让高影响结论可回看。", boundary: "字符正确不等于表格语义正确，有引用也不等于关系判断正确。", sourceIds: ["docling-report", "pp-ocr-2020"] },
      { title: "理解侧与生成侧", en: "Understand vs Generate", explanation: "理解侧关注识别、描述、问答、检索和时间定位；生成侧关注图像、视频、语音与 any-to-any 输出。两侧的风险不同：理解错误会误导决策，生成错误还涉及品牌、版权、标识和内容安全。", decision: "把理解准确性和生成可发布性分成两套门禁。", boundary: "视觉质量好不等于事实、版权或品牌合规，生成资产仍需业务审核。", sourceIds: ["nist-genai-profile", "c2pa-2-4", "china-ai-content-labeling"] },
      { title: "显式标识、水印与内容凭证", en: "Content Provenance", explanation: "显式标识负责向人告知，水印或 Soft Binding 帮助资产与凭证重关联，C2PA 签名清单（Manifest） 则记录可验证的来源与编辑声明。三者解决的问题不同，发布和接收侧都要定义缺失、失效与验证失败时如何处置。", decision: "把‘是否告知、能否重关联、能否验证来源链’拆成三项验收。", boundary: "内容凭证只证明声明、签名和资产绑定的验证结果，不证明内容为真、拥有版权或已经合规；凭证也可能被移除。", sourceIds: ["c2pa-2-4", "china-ai-content-labeling"] },
      { title: "实时语音与视频链路", en: "Real-time Loop", explanation: "实时体验由采集、端点检测、识别、推理、合成、网络和打断策略共同决定。平均时延无法解释卡顿、抢话、误唤醒和多轮修复，需要按阶段和任务终态观测。", decision: "用端到端任务完成率和分阶段尾延迟共同验收。", boundary: "模型首包速度不能代表客户端播放、网络和交互策略后的真实体验。", sourceIds: ["opentelemetry-semconv", "opentelemetry-genai-semconv", "nist-genai-profile"] },
      { title: "安全、降级与责任交接", en: "Trust, Degradation & Handoff", explanation: "媒体可能携带敏感信息和间接注入；不可读、证据冲突或低置信时要转专用解析、重传或人工复核。Multimodal 交付证据与失真信息，RAG、Agent、Security、Evaluation 和 AI Ops 各自接管后续责任。", decision: "让模型输出停留在可核验建议层，直到外部权限、业务终态和降级规则允许继续。", boundary: "图片中的文字仍是不可信数据；看见异常不等于获得工具权限，向量化也不等于自动降敏。", sourceIds: ["owasp-prompt-injection", "nist-zero-trust"] },
    ],
  },
  mcp: {
    lead: "MCP 解决能力如何被发现和调用；生产落地还必须补上身份、授权、网络与业务事务语义，并把当前正式版与旧版兼容路径分开管理。",
    chapters: [
      { title: "Host、Client 与 Server", en: "Protocol Roles", explanation: "Host 承载用户体验与安全决策，Client 连接某个 Server，Server 暴露能力。当前正式版 2026-07-28 已移除协议级 session；2025-11-25 等旧版由 Client 维护协议会话，但两者都不改变三类角色的责任边界。", decision: "明确每个角色由谁运行、升级、认证和审计，并把连接机制绑定到具体协议版本。", boundary: "协议角色不是部署拓扑；无状态核心也不表示应用状态或业务状态会消失。", sourceIds: ["mcp-architecture", "mcp-lifecycle-2025-11-25", "mcp-specification-2026-07-28"] },
      { title: "Tools、Resources 与 Prompts", en: "Server Primitives", explanation: "Tool 是模型控制的可调用操作，可以只读也可以写入；Resource 是应用控制并以 URI 标识的上下文；Prompt 是用户控制选择、由 Server 提供内容的模板。", decision: "先按控制主体选择原语，再独立标注数据范围、敏感性、副作用、授权、幂等与审计。", boundary: "原语类型不是读写或风险标签；Resource 与 Prompt 也可能包含敏感、过期或恶意内容。", sourceIds: ["mcp-tools-2026-07-28", "mcp-resources-2026-07-28", "mcp-prompts-2026-07-28"] },
      { title: "版本、初始化与能力发现", en: "Versioned Lifecycle & Discovery", explanation: "当前正式版 2026-07-28 不再使用 initialize/initialized，而由每次请求携带协议版本、客户端信息和能力，并要求 Server 实现 server/discover；2025-11-25 等旧版仍通过初始化握手和会话协商。", decision: "把协议版本与业务能力版本分别管理，为现代与旧版兼容路径建立独立契约测试。", boundary: "正式规范生效不等于具体实现已经兼容；发现成功也不证明 Tool 的业务语义与权限正确。", sourceIds: ["mcp-lifecycle-2025-11-25", "mcp-specification-2026-07-28", "mcp-changelog-2026-07-28"] },
      { title: "传输与部署形态", en: "stdio & Streamable HTTP", explanation: "stdio 常用于本地子进程，边界靠操作系统用户和进程；Streamable HTTP 面向远程共享服务。2026-07-28 采用无状态、自包含请求，2025-11-25 远程实现可能依赖协议会话；两者都需要网络身份、重试、负载均衡和边缘治理。", decision: "先固定协议版本并画出信任边界，再选择本地或远程传输与状态管理方式。", boundary: "无协议 session 不等于无业务状态，本地开发安全假设也不能原样复制到远程服务。", sourceIds: ["mcp-lifecycle-2025-11-25", "mcp-specification-2026-07-28", "mcp-authorization"] },
      { title: "身份、授权与同意", en: "Identity & Authorization", explanation: "客户端身份、最终用户身份和 Server 自身身份可能同时存在。生产调用要明确代表谁、允许做什么、Token 面向哪个资源，以及何时需要用户确认或审批；2026-07-28 正式规范加入 issuer 校验、客户端类型和凭据绑定等授权强化。", decision: "让每次高影响调用可追到主体、授权依据和参数，并在迁移测试中验证新的授权约束。", boundary: "规范要求已经生效，但不能假设所有 SDK 与产品都已实现；OAuth 登录成功也不等于 Tool 内部业务授权已完成。", sourceIds: ["mcp-authorization", "mcp-specification-2026-07-28", "nist-zero-trust"] },
      { title: "Elicitation 与敏感交互", en: "Form & URL Elicitation", explanation: "2025-11-25 中，Server 可直接向 MCP Client 发送 Form 或 URL Elicitation；当前 2026-07-28 正式规范改用 Multi Round-Trip Requests，把所需输入随 input_required 结果返回，并由 Client 在重试原请求时提交响应。", decision: "按协议版本和信息敏感性选择交互模式，分别测试拒绝、取消、重试和回到原任务的路径。", boundary: "任何版本的 Elicitation 都不替代 MCP 授权、第三方授权或业务后置条件。", sourceIds: ["mcp-elicitation-2025-11-25", "mcp-specification-2026-07-28", "mcp-authorization"] },
      { title: "长调用与 Tasks 扩展", en: "Durable MCP Requests", explanation: "当前 2026-07-28 正式规范把 Tasks 作为需双方显式支持的可选扩展，以 task handle、tasks/get、tasks/update 和 tasks/cancel 承载长调用；2025-11-25 则把实验性 Tasks 放在核心协议中。", decision: "仅在双方声明支持且业务确需耐久执行时采用；迁移时把 2026-07-28 扩展与 2025-11-25 旧版核心能力当作两套契约验证。", boundary: "取消是合作式意图，不证明副作用已经停止；MCP Task 与 A2A Task 也只能显式映射。", sourceIds: ["mcp-tasks-2025-11-25", "mcp-tasks-extension", "a2a-spec-1-0-0"] },
      { title: "生产工程与供应链", en: "Production Operations", explanation: "Schema 版本、超时、幂等、限流、沙箱、日志、撤销、密钥轮换和 Server 来源共同决定可运营性。公共 Server 与高权限插件类似，需要清单、审查、隔离和快速停用。", decision: "把 Server 当作可执行供应链组件管理。", boundary: "发现能力和调用成功不能证明副作用可逆、结果正确或第三方可信。", sourceIds: ["mcp-security", "nist-zero-trust"] },
    ],
  },
  a2a: {
    lead: "A2A 面向客户端与独立远端 Agent 的交互：即时请求可直接返回 Message，需要跟踪的工作才创建 Task，并按需交付 Artifact，而不是共享内部思维过程。",
    chapters: [
      { title: "A2A 与 MCP 的分工", en: "Agent vs Tool Boundary", explanation: "MCP 让模型或应用调用工具和读取资源；A2A 让客户端与独立远端 Agent 交换 Message 或有状态 Task。A2A Task 是核心协作对象，MCP Tasks 是可选的长请求扩展，两类 ID 只能显式映射。", decision: "按独立责任、状态所有权和组织边界决定协议，并分别治理生命周期与授权。", boundary: "多 Agent 框架内部调用不一定需要 A2A，A2A 也不能代替工具授权或业务终态。", sourceIds: ["a2a-mcp-boundary", "mcp-tasks-extension"] },
      { title: "Agent Card 与能力发现", en: "Agent Card", explanation: "Agent Card 描述服务元数据、入口、技能、协议和认证要求，帮助客户端发现候选远端 Agent。发现信息应验证来源、服务端身份、缓存和版本，不能仅因公开可访问就被信任。", decision: "把能力声明当作候选信息，再通过组织信任、契约测试和运行证据决定调用。", boundary: "Agent Card 自声明不证明真实身份、业务授权或能力质量。", sourceIds: ["a2a-concepts", "a2a-specification"] },
      { title: "Message、Task 与 Artifact", en: "Core Objects", explanation: "SendMessage 可直接得到 Message，也可得到服务端生成的 Task；Task 承载有状态工作，Artifact 是可选任务输出。Message 不保证全部持久保存，关键状态和结果不应只依赖消息。", decision: "即时交互走 Message，需要跟踪才创建 Task；有 Artifact 时由接收方独立验收。", boundary: "Artifact 的跨 Task 版本谱系、权限和业务接受由客户端与应用管理，不因协议交付自动成立。", sourceIds: ["a2a-concepts", "a2a-specification"] },
      { title: "任务状态机", en: "Task Lifecycle", explanation: "规范共有九个 TaskState 枚举：TASK_STATE_UNSPECIFIED 只表示未知；八个非 UNSPECIFIED 操作状态是 TASK_STATE_SUBMITTED、TASK_STATE_WORKING、TASK_STATE_INPUT_REQUIRED、TASK_STATE_AUTH_REQUIRED、TASK_STATE_COMPLETED、TASK_STATE_FAILED、TASK_STATE_CANCELED 与 TASK_STATE_REJECTED。下文短标签会省略 TASK_STATE_ 前缀。", decision: "中断态恢复原 Task；终态不可继续写入，修订工作创建新 Task 并由客户端维护关联。", boundary: "CancelTask 不保证远端已停止或副作用已撤销；网络重试也不等于业务重试。", sourceIds: ["a2a-specification", "opentelemetry-semconv"] },
      { title: "1.0 版本与绑定协商", en: "Version & Binding Negotiation", explanation: "截至 2026-08-01，最新标记发布为 v1.0.1，但线上兼容仍以 A2A-Version 的 Major.Minor 1.0 协商；AgentInterface 声明 URL、Binding 与协议版本。", decision: "把发布补丁、协商版本、Binding、SDK 和 Agent 能力版本分别纳入兼容矩阵。", boundary: "规范要求补丁号不应用于请求、响应或 Agent Card，且不得参与版本协商；网络连通和同为 1.0 也不证明各 Binding、SDK 或产品已采用相同修复与能力。", sourceIds: ["a2a-release-1-0-1", "a2a-specification"] },
      { title: "协作拓扑与编排边界", en: "Collaboration Topology", explanation: "中心协调、点对点委派和分层协作适合不同治理强度。内部编排可以共享更多状态，跨组织 A2A 应最小化契约和数据暴露，并允许各方独立演进。", decision: "把稳定外部契约放在组织边界，把高频细粒度协作留在内部。", boundary: "增加 Agent 数量会增加协调、追踪和错误传播，不会自动提升质量。", sourceIds: ["anthropic-effective-agents", "a2a-concepts"] },
      { title: "身份、产物与审计", en: "Trust & Audit", explanation: "跨 Agent 调用要验证调用主体、目标 Agent、任务权限和 Artifact 访问，并保留任务、消息、事件和外部动作的关联证据。审计关注可观察输入输出和责任，而非要求暴露隐藏思维。", decision: "用任务证据、策略版本和外部动作记录证明边界。", boundary: "不透明内部实现不免除安全和质量责任，但也不应通过索取隐藏思维链伪装审计。", sourceIds: ["a2a-specification", "opentelemetry-semconv", "opentelemetry-genai-semconv"] },
    ],
  },
  evaluation: {
    lead: "评估不是先找一个分数，而是先写清要支持的决定，再把被测版本、任务人群、量尺、样本、重复试验和行动规则冻结成契约。",
    chapters: [
      { title: "先定义决定与目标量", en: "Decision & Estimand", explanation: "初筛、验收、发布建议和故障诊断不是同一问题；固定 Benchmark 表现与对相似任务总体的外推也不是同一目标量。", decision: "先声明要做的决定、被测版本、目标人群、基线和结果将触发的动作。", boundary: "没有决策语境的分数不能说明是否值得上线，也不能自动外推到客户人群。", sourceIds: ["nist-ai-800-3", "nist-genai-profile"] },
      { title: "对象 × 生命周期二维地图", en: "Object × Lifecycle Matrix", explanation: "对象轴区分模型、组件、应用/工作流和业务结果；生命周期轴区分 Benchmark 初筛、离线验收与部署后监测。二维定位能同时保留局部诊断与端到端验收。", decision: "为每个关键结论写明测的是谁、证据来自哪个阶段，以及它不能替代哪一格。", boundary: "组件分数不能替代业务终态，部署前证据也不能证明真实流量持续有效。", sourceIds: ["nist-genai-profile", "nist-ai-800-4"] },
      { title: "公开基准与客户任务", en: "Benchmark vs Customer Tasks", explanation: "公开基准适合形成候选假设，但受任务分布、污染、提示、评审人群和版本时点影响；客户验收要在同一任务、环境、预算和硬门下比较完整候选。", decision: "用相关 Benchmark 缩小候选，用代表性客户任务和边界样本作最终判断。", boundary: "榜单名次、固定题集 Accuracy 与业务价值承诺是三件事。", sourceIds: ["nist-ai-800-3", "nist-genai-profile"] },
      { title: "规则、Judge 与人工", en: "Scoring Spectrum", explanation: "规则适合结构和确定约束，LLM Judge 扩展语义评分，人工负责高风险、模糊和校准样本。上线前要用人工双评样本检查一致性，并通过答案顺序交换、长度扰动和跨模型抽检暴露位置与冗长偏差。", decision: "把评分器当作需要评估、校准和版本化的模型组件。", boundary: "同一个模型生成又自证会产生相关偏差，Judge 分数不是业务真值，也不能独立授权高风险动作。", sourceIds: ["llm-as-judge-2023", "nist-genai-profile"] },
      { title: "开发集、回归集与盲留出集", en: "Development, Regression & Holdout", explanation: "开发集支持迭代，冻结回归集保护已知能力，盲留出集检查泛化；每条样本应保留来源、适用期、切片、期望行为和裁决。", decision: "让真实失败经过脱敏、去重和业务裁决后进入下一版回归集，同时保护留出集不被调参污染。", boundary: "更多样本不能修复错误标签和选择偏差，点赞或模型自评也不是自动真值。", sourceIds: ["nist-genai-profile"] },
      { title: "评估结果与运行责任交接", en: "Evaluation-to-Operations Handoff", explanation: "Evaluation 输出数据集、评分器、逐样本与切片结果、不确定性、硬门和未决失败；AI Ops 负责发布清单、影子/金丝雀、流量、告警、停止、回滚与恢复。", decision: "把 Go、Hold、No-Go 或补做建议连同未决失败交给明确责任人，不由评估团队自行批准例外。", boundary: "OpenTelemetry 只提供运行遥测语义，不是质量门、风险批准或发布证明。", sourceIds: ["nist-ai-800-4", "opentelemetry-genai-semconv"] },
    ],
  },
  security: {
    lead: "以一份藏有恶意指令的候选人简历为起点，沿解析、RAG、模型提案、确定性授权、ATS 执行和事件恢复建立可验证的安全边界。",
    chapters: [
      { title: "从不可接受损失建立威胁模型", en: "Threat Model", explanation: "先保护候选人隐私、职位边界、ATS 完整性、招聘决定和可追责性，再识别攻击者、信任边界、Source—Sink 路径与业务后果。", decision: "以损失和可达权限组织威胁，不以产品清单组织。", boundary: "OWASP 目录用于防漏项，不是系统验收清单或合规证明。", sourceIds: ["owasp-llm-top-ten", "nist-genai-profile"] },
      { title: "恶意简历与间接提示注入", en: "Malicious Resume", explanation: "PDF、隐藏文字、图片、OCR 与解析结果都可能携带间接注入；应用会把不可信内容与控制指令交给同一模型。", decision: "隔离解析、保留来源与信任标签，并限制简历可影响的高价值 Sink。", boundary: "系统提示、分隔符、RAG、微调和检测都不能单独消除注入。", sourceIds: ["owasp-prompt-injection"] },
      { title: "候选人数据、向量与删除边界", en: "Candidate Data Boundary", explanation: "原简历、切块、Embedding、索引、缓存、日志和评估样本都可能敏感，权限还要按招聘人员、职位、候选人和用途限制。Data Engineering 实现副本清单与撤权删除传播，Security 通过客户定义的时限和负向探针验证读取边界。", decision: "执行写入准入、检索时 ACL、隔离、撤权传播和负向测试。", boundary: "OWASP 支持向量访问、投毒和泄露风险，不规定通用删除 SLA；Embedding 也不是匿名化。", sourceIds: ["owasp-vector-weaknesses", "nist-zero-trust"] },
      { title: "模型提案与 ATS 业务授权", en: "Proposal vs Authorization", explanation: "模型可输出候选人、职位、允许字段、证据和不确定性提案；应用以真实主体、资源版本、职位范围和业务规则决定是否执行。", decision: "草稿可自动化，高影响状态变化保留明确业务授权。", boundary: "Tool Calling、MCP、合法 JSON 或共享服务账号都不构成 ATS 授权。", sourceIds: ["nist-zero-trust", "mcp-authorization"] },
      { title: "最小权限、执行与业务终态", en: "Least Privilege & End State", explanation: "短期限域凭据只允许批准字段和资源；执行器在调用后回读 ATS 权威状态，结果未知时先查询再重试，并准备补偿。", decision: "每次写入记录发起人、代表主体、授权依据、参数、结果和补偿。", boundary: "接口成功不等于候选人状态正确，Agent 编排不拥有业务终态。", sourceIds: ["nist-zero-trust", "mcp-security"] },
      { title: "第三方组件与供应链准入", en: "Supply-chain Admission", explanation: "解析器、模型、数据、插件、连接器和托管 API 都需要来源、版本、许可证、漏洞、完整性、权限、清单与替代路径。", decision: "在隔离环境验证并把批准版本绑定到发布证据。", boundary: "可下载、开放权重、官方托管或供应商认证都不自动证明客户集成安全；MCP 指南只适用于采用该协议的实现。", sourceIds: ["nist-genai-profile", "nist-sp-800-218a"] },
      { title: "验证控制措施并进行对抗测试", en: "Control Assurance", explanation: "测试普通与恶意简历、隐藏文本、跨候选人检索、参数篡改、审批绕过、供应链变化和控制失效后的残余影响。", decision: "验证每层能限制后果，并让已裁决事件进入回归集。", boundary: "Guardrail 命中率和一次红队通过不能证明未知攻击不存在。", sourceIds: ["nist-aml-100-2e2025", "owasp-prompt-injection", "nist-genai-profile"] },
      { title: "事件证据、遏制与恢复", en: "Incident Response", explanation: "发现泄露、越权或错误淘汰后，暂停高影响写入、撤销凭据、停止队列、保存来源与上下文证据、核对 ATS 状态、补偿并验证恢复。", decision: "事故前约定谁能停、停什么、保留哪些证据和怎样签署恢复。", boundary: "恢复接口不等于修复已发生的业务状态，具体阈值和时限需按系统定义。", sourceIds: ["nist-sp-800-61r3", "nist-genai-profile", "nist-zero-trust"] },
    ],
  },
  "ai-gateway": {
    lead: "AI 网关把多模型调用的接入、身份、策略、成本与观测集中起来，但集中化也带来新的性能和故障责任。",
    chapters: [
      { title: "统一接入与协议归一", en: "Unified Access", explanation: "不同模型提供方在请求格式、流式、错误、用量、工具和内容策略上存在差异。网关可以提供稳定应用契约，并保留提供方特性作为显式能力，而不是抹平成最低公共集合。", decision: "统一稳定语义，暴露会改变质量或风险的差异。", boundary: "格式兼容不等于模型行为兼容，切换提供方仍需回归。", sourceIds: ["cloudflare-ai-gateway", "opentelemetry-genai-semconv"] },
      { title: "身份、虚拟凭据与租户", en: "Identity & Credentials", explanation: "应用不应直接持有所有提供方密钥。网关可以验证入口令牌、集中保管提供方凭据，并把租户、工作负载与最终用户主体保留到策略和审计链。", decision: "分别标识最终用户、调用工作负载、网关与下游凭据，单独轮换、撤销和审计。", boundary: "网关代管凭据只解决接入治理，不能让共享账号获得用户未被授予的数据、模型或工具权限。", sourceIds: ["cloudflare-ai-gateway-authentication", "nist-zero-trust"] },
      { title: "路由、负载与容灾", en: "Routing & Fallback", explanation: "路由可基于任务、风险、区域、容量、价格或健康；容灾需要定义一个重试所有者、总 Deadline、候选端点、允许降级和停止条件。", decision: "为每条回退路径预先声明允许牺牲什么，限制 attempt 预算，并持续演练。", boundary: "多层重试会放大负载；跨模型切换还可能产生不同输出、地域变化或重复工具动作。", sourceIds: ["cloudflare-ai-gateway-dynamic-routing", "aws-builders-library-retries", "nist-genai-profile"] },
      { title: "配额、预算与缓存", en: "Traffic, Cost & Cache", explanation: "RPM、TPM、并发、排队、消费上限与提供方配额控制不同瓶颈。精确缓存复用相同请求，语义缓存复用相似结果，两者不能混为同一承诺。", decision: "按真实请求长度与并发分布规划容量，用每个成功任务成本优化，并为两类缓存分别定义资格、隔离与失效。", boundary: "请求限流不能防止 Token、并发或预算耗尽；语义相似也不能证明不同主体可共享结果。", sourceIds: ["azure-apim-ai-gateway", "cloudflare-ai-gateway-spend-limits", "cloudflare-ai-gateway-caching", "nist-zero-trust"] },
      { title: "前后置护栏与审计", en: "Guardrails & Audit", explanation: "前置策略检查输入、身份和允许能力，后置策略检查输出、结构和敏感内容；工具动作还需单独授权与参数校验。审计应关联策略版本、命中原因和最终处置。", decision: "把确定规则放在网关或应用外部控制，把语义检测作为辅助信号。", boundary: "全量缓冲才能检查的策略会改变流式体验，需要明确取舍。", sourceIds: ["nist-genai-profile", "mcp-authorization"] },
      { title: "端到端可观测", en: "GenAI Telemetry", explanation: "网关知道请求、提供方、延迟、错误、Token、缓存和策略，但不知道最终业务是否成功。需要与应用 Trace、检索、工具和终态关联，才能分辨网关优化是否真正有效。", decision: "让网关 Span 成为任务 Trace 的一段，而不是独立报表。", boundary: "标准字段不自动提供业务成功、风险标签和成本责任，需要组织扩展。", sourceIds: ["opentelemetry-genai-semconv"] },
      { title: "MCP 网关与工具治理", en: "MCP Gateway", explanation: "MCP 网关可以集中 Server 发现、身份、网络、策略和观测，但 Tool Schema、业务权限、事务、审批与补偿仍属于具体服务和应用。模型流量与工具流量的后果不同。", decision: "共享基础治理，但分别为模型生成和工具副作用设置门禁。", boundary: "接入网关不表示远程 Server 可信，也不使调用自动符合业务规则。", sourceIds: ["mcp-authorization", "nist-zero-trust"] },
    ],
  },
  "ai-ops": {
    lead: "AI 应用工程与运营把制品、评估、发布、观测、成本和事故放进同一生命周期，管理的不只是服务可用性。",
    chapters: [
      ...applicationFinopsCurriculum["ai-application-engineering"].chapters,
      { title: "任务级 Trace 与 OTel", en: "End-to-end Tracing", explanation: "一次任务可能穿过网关、检索、多个模型、工具和人工等待。OpenTelemetry 的 GenAI 语义已迁入独立仓库并继续演进；团队应固定约定版本，在 Collector 归一化字段，并把业务终态与审批作为项目扩展。", decision: "以任务为根关联所有技术调用和业务结果，同时治理遥测 Schema 版本。", boundary: "Trace 完整不代表应永久保存敏感原文；标准字段也不自动表达业务成功、风险和责任。", sourceIds: ["opentelemetry-semconv", "opentelemetry-genai-semconv", "nist-zero-trust"] },
      { title: "离线评估与线上观察", en: "Offline & Online Evaluation", explanation: "离线评估使用可控样本比较版本，在线评估观察真实分布、反馈和业务结果。规则、Judge、人工抽样和用户行为共同形成漏斗，线上失败再进入治理后的回归集。", decision: "离线决定能否放量，在线决定是否继续、回滚或修复。", boundary: "自动 Judge 不能覆盖所有风险，反馈缺失也不表示成功。", sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv"] },
      { title: "三类漂移与静默退化", en: "Drift", explanation: "输入分布、数据内容和系统行为都可能漂移；外部 API、Prompt、检索和工具变化会让基础设施指标仍绿色但任务成功下降。分层切片和变更时间线比单一阈值更可靠。", decision: "把漂移信号连接到可重现样本和具体责任层。", boundary: "统计变化不一定有业务影响，业务退化也可能没有明显分布漂移。", sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv"] },
      { title: "版本管理、灰度发布和回滚", en: "Release Management", explanation: "模型、Prompt、数据、索引、工具 Schema、路由和护栏都要进入版本注册。离线回放、影子、金丝雀、分组放量和自动回退组成发布链，并保留回滚后的数据兼容。", decision: "任何影响输出或动作的变化都作为可审计发布。", boundary: "回滚配置不能撤销已经发生的外部副作用，需要补偿和客户处置。", sourceIds: ["opentelemetry-genai-semconv", "nist-genai-profile"] },
      { title: "成本、容量与单位经济", en: "Cost & Capacity", explanation: "Token、工具、检索、人工和失败重试共同决定成本。容量需要按交互、长上下文、Agent 和批处理分别建模，把预留余量与低效空闲区分。", decision: "报告每个成功业务终态的成本和分层 SLO。", boundary: "低利用率可能是尾延迟保障，满载也可能降低成功率。", sourceIds: ["opentelemetry-genai-semconv", "nist-genai-profile"] },
      { title: "事件处理、人工介入与急停", en: "Incident & Stop", explanation: "高风险系统需要可停止模型调用、工具执行、队列消费或外部写入的多级开关。Human-in/on/out-of-the-loop 按风险和时效分工，事故证据进入复盘和新回归。", decision: "在事故前定义谁能停、停什么、如何恢复和如何补偿。", boundary: "停止模型不一定停止已排队动作或第三方副作用，恢复也不等于业务状态正确。", sourceIds: ["nist-zero-trust", "nist-genai-profile"] },
    ],
  },
  llm: {
    lead: "沿企业知识助手的一次请求理解模型：文本如何成为表示、上下文如何参与计算、下一 Token 如何生成，以及哪些失败属于模型、证据、服务或外部控制。",
    chapters: [
      { title: "Token、Embedding 与位置", en: "Input Representation", explanation: "文本先被分词成 Token，再映射为向量；位置编码或位置机制让模型区分顺序。不同语言、数字和代码的 Token 密度不同，会直接改变上下文占用、成本和截断。", decision: "用真实语料测 Token 分布，不按字符或词数粗略承诺容量。", boundary: "Embedding 表示相似性和上下文特征，不是可直接读取的事实数据库。", sourceIds: ["transformer-2017"] },
      { title: "Q/K/V 与注意力头", en: "MHA, MQA & GQA", explanation: "Query 表示当前位置要寻找什么，Key 表示可匹配特征，Value 表示被聚合的信息。MHA 为每个 Query Head 保留独立 KV Head；MQA 共享一组，GQA 在两者之间分组共享，因而把表示能力与 KV Cache、带宽和服务成本连接起来。", decision: "解释模型架构时同时记录 Query / KV Head 组织和运行时影响。", boundary: "更少 KV Head 不保证目标任务质量不变；研究也表明不能把标准注意力权重直接当作完整预测解释。", sourceIds: ["transformer-2017", "gqa-2023", "attention-not-explanation-2019"] },
      { title: "Transformer 块", en: "Block Anatomy", explanation: "注意力、前馈网络、残差连接和归一化反复堆叠。注意力混合上下文，前馈网络逐位置变换表示，残差与归一化帮助深层训练；参数和计算在各部分的分布影响模型能力与成本。", decision: "把架构名词连接到训练稳定、推理计算和内存，而不是只背组件。", boundary: "相同‘Transformer’标签下的层数、宽度、注意力和训练数据差异巨大。", sourceIds: ["transformer-2017"] },
      { title: "Decoder-only、因果掩码与 MoE", en: "Architecture Variants", explanation: "Decoder-only 用因果掩码保证每个位置只看此前 Token，适合统一生成；MoE 让每个 Token 只激活部分专家，增加参数容量但引入路由、负载均衡和分布式通信。", decision: "从任务和服务特性理解架构取舍，不用参数量独立判断质量。", boundary: "总参数、激活参数和实际推理成本不是同一指标，MoE 也不自动更快。", sourceIds: ["transformer-2017", "nist-genai-profile"] },
      { title: "自回归生成、采样与测试时计算", en: "Autoregressive & Test-time Compute", explanation: "模型逐 Token 生成，温度、top-p 和停止条件改变多样性与稳定性；推理模型还可能在最终答案前消耗额外测试时计算。模型、采样、可用的推理配置和工具集共同定义一次运行候选。", decision: "把生成参数和可用的推理配置版本化，并同时回归质量、延迟与 Token。", boundary: "更多内部推理不保证正确，可见摘要也不等于真实思维链或可审计解释。", sourceIds: ["deepseek-r1-2025", "openai-model-spec-hidden-cot", "nist-genai-profile"] },
      { title: "上下文、Prefill 与 KV Cache", en: "Runtime Context", explanation: "输入上下文在 Prefill 阶段并行处理，已处理 Token 的 Key/Value 被缓存以避免每个新 Token 重算全部前缀；Decode 仍逐步生成。长上下文同时增加预填充计算、缓存内存和信息利用难度。", decision: "区分缺知识、缺上下文、上下文组织差和推理容量不足，并用位置对照与真实负载分别验证。", boundary: "上下文上限是允许值，不是模型会可靠使用全部信息的保证；论文中的位置敏感结果也不能外推到所有模型。", sourceIds: ["vllm-2023", "flashattention-2022", "lost-middle"] },
    ],
  },
  "fine-tuning": {
    lead: "沿理赔材料初审案例判断微调是否值得：条款与证据归 RAG，案件状态与动作归 Tool/工作流，赔付规则归确定性代码；只有轻量路线后仍稳定存在的行为缺口进入训练。",
    chapters: [
      { title: "失败分流与不微调门", en: "Intervention Router", explanation: "指令或结构问题走 Prompt/Schema，当前且需引用的事实走 RAG，权威状态或动作走 Tool/API，资格与限额写成确定性规则，基础能力不足则换模型。微调只接收稳定、可重复、可标注的剩余行为差距。", decision: "同时满足可测基线、数据权利、冻结评测、版本回滚和单位经济假设后，才建立训练实验。", boundary: "没有可靠标注、数据权利不清、知识频繁变化或无法回滚时，应停止而不是先训练。", sourceIds: ["nist-genai-profile", "openai-structured-outputs", "lora-2021"] },
      { title: "全参、PEFT、LoRA 与 QLoRA", en: "Adaptation Methods", explanation: "PEFT 是只训练少量附加参数的一类方法；LoRA 学习低秩增量，QLoRA 在量化且冻结的底座上训练 LoRA。全参更新全部权重，投资和制品管理最重。", decision: "按模型控制权、运行时兼容、目标、数据、算力和回滚条件选择最小充分方法。", boundary: "PEFT 与 LoRA 不是同义词；参数效率也不保证数据需求低、质量保持或推理成本下降。", sourceIds: ["hf-trl-peft", "lora-2021", "qlora-2023"] },
      { title: "数据先满足对话格式，再谈数量", en: "Dataset & Chat Template", explanation: "训练样本要明确是文本、提示—回答、对话还是偏好对，并使用与基座模型一致的角色和聊天模板。还要覆盖真实输入、拒答、边界和困难切片，与评估集隔离并保留来源、许可、去重和版本。", decision: "先用少量高价值样本跑通格式和学习目标，再扩大数量。", boundary: "模板或特殊 Token 错误会让模型学到错误边界；合成数据也会复制教师偏差。", sourceIds: ["hf-trl-data-formats", "hf-trl-chat-templates", "nist-genai-profile"] },
      { title: "训练曲线用于诊断，不是成绩单", en: "Training Diagnostics", explanation: "训练与评估 Loss、学习率、梯度、吞吐和样本切片共同帮助判断欠拟合、过拟合、数据异常和数值问题。曲线变化要与固定任务集的目标行为、通用能力和安全表现一起解释。", decision: "每个训练实验只改变少量关键变量，并完整记录数据、代码、超参数和环境。", boundary: "训练 Loss 下降只能说明更贴近训练目标，不能证明线上任务或安全表现变好。", sourceIds: ["hf-trl-sft-trainer", "nist-genai-profile"] },
      { title: "SFT 用示范建立基本行为", en: "Supervised Fine-tuning", explanation: "SFT 让模型从高质量示范学习任务步骤、格式、风格、拒答和边界。它适合期望答案可直接写出的场景，也是进一步做偏好或奖励训练前的常见起点。", decision: "用未见任务和原有能力回归决定是否继续训练。", boundary: "更低验证 Loss 不一定对应更好的业务偏好、安全或推理稳定性。", sourceIds: ["instructgpt-2022", "hf-trl-sft-trainer"] },
      { title: "偏好优化与可验证奖励", en: "Preference & Verifiable Reward", explanation: "DPO 用 chosen / rejected 偏好对改变相对倾向；RLVR 或奖励微调要求结果能被规则、执行器或可靠 Grader 验证。采用前要检查 Grader 一致性、奖励投机、独立留出集以及域外行为和安全回归。", decision: "好坏可比较用偏好优化；结果可验证且奖励抗投机时才考虑奖励训练。", boundary: "高 Reward 不等于真实正确率，RLVR 也不取代高质量示范、开放任务人工量尺或通用能力回归。", sourceIds: ["deepseek-r1-2025", "dpo-2023", "hf-trl-dpo-trainer", "nist-genai-profile"] },
      { title: "托管与自建交换的是控制和责任", en: "Managed vs Self-hosted", explanation: "托管服务减少环境、调度和服务化负担，但会限定模型、训练方法、区域和可观察细节；自建提供更多控制，也要承担算力、镜像、分布式、故障恢复、制品安全和推理兼容。", decision: "按数据边界、方法灵活性、团队能力和持续运营成本选型。", boundary: "能提交训练任务不表示训练数据、部署区域和基础模型都满足要求。", sourceIds: ["nist-genai-profile", "lora-2021"] },
      { title: "验收标准与停止规则", en: "Acceptance & Stop Rule", explanation: "数据层检查权利、覆盖与泄漏，训练层检查收敛与复现，任务层比较目标、保留能力和安全，服务层检查延迟、吞吐、显存与成本；所有结果都相对基座和更轻路线比较。", decision: "只有硬门全部通过且每个被接受初审的增益能够覆盖标注、训练、评估、服务与重训成本时，才进入有限放量。", boundary: "目标提升不能补偿安全或关键能力退化；收益不稳定、完整成本过高或轻量基线反超时应停止。", sourceIds: ["nist-genai-profile", "openai-eval-best-practices", "finops-unit-economics"] },
      { title: "Adapter 是需要治理的发布制品", en: "Adapter Operations", explanation: "Adapter 要绑定基础模型、Tokenizer、聊天模板、量化、推理运行时、训练数据和评估报告。动态加载便于多版本和回滚；合并权重简化单模型部署但会产生新的完整制品。", decision: "把训练、评估、服务、灰度和回滚信息写入同一发布清单。", boundary: "更换基座或模板后不能假设原 Adapter 的行为、兼容与安全表现不变。", sourceIds: ["lora-2021", "qlora-2023", "hf-trl-peft"] },
    ],
  },
  "llm-training": {
    lead: "大模型训练是数据、目标函数、分布式系统和评估共同驱动的长期实验，不是简单地增加参数与 GPU。",
    chapters: [
      { title: "训练全景与阶段目标", en: "Training Pipeline", explanation: "预训练学习通用模式，SFT 学习按示范工作，偏好优化学习相对好坏，推理强化使用可验证奖励塑造搜索与解题。每阶段的数据、损失和评估都不同。", decision: "为每个阶段写清新增能力、数据来源和退出门槛。", boundary: "阶段名称相同不代表厂商使用相同数据、算法或效果。", sourceIds: ["instructgpt-2022", "dpo-2023"] },
      { title: "数据、去重与分词", en: "Data Foundation", explanation: "数据来源、质量、混合比例、去重、污染、过滤和 Tokenizer 决定模型看到什么以及如何表示。重复数据会浪费计算并放大记忆，评估污染会产生虚假能力。", decision: "把数据版本、去重阈值、Tokenizer 和治理证据作为训练制品的一部分。", boundary: "论文显示去重可减少记忆与训练—验证重叠，但没有通用阈值；激进过滤也可能删除少数语言和专业内容。", sourceIds: ["deduplicating-training-data-2022", "sentencepiece-2018", "chinchilla-2022"] },
      { title: "预训练、Scaling 与 MoE", en: "Pretraining", explanation: "下一个 Token 预测从大规模语料学习统计结构。Scaling Law 描述特定设定下模型、数据和计算的经验关系；MoE 用路由器为 Token 选择部分专家，增加总容量也引入负载均衡与跨设备通信。", decision: "用计算最优与数据可得性约束规模，并单独剖析专家负载和 All-to-All。", boundary: "Chinchilla 与 Switch Transformer 都只支持各自实验设定，不能直接外推到任意数据、架构、语言和预算。", sourceIds: ["chinchilla-2022", "switch-transformer-2022", "nccl-collectives"] },
      { title: "SFT、RLHF 与 DPO", en: "Alignment", explanation: "SFT 建立基本指令行为；RLHF 用奖励模型和强化学习优化偏好；DPO 用成对偏好直接优化。选择取决于目标是否可示范、可比较或需要在线探索。", decision: "从最简单能验证目标的方法开始，并保留基座能力回归。", boundary: "对齐提高期望行为概率，不会产生绝对安全或消除事实错误。", sourceIds: ["instructgpt-2022", "dpo-2023"] },
      { title: "推理训练与可验证奖励", en: "Reasoning Training", explanation: "推理训练可以组合冷启动示范、强化学习、再监督与蒸馏；可验证奖励适合数学、代码等有明确判定的问题，开放任务仍需要谨慎的量尺与人工判断。实验要同时检查 Reward、未见任务、奖励投机和服务成本。", decision: "只有验证器可靠且任务价值能覆盖训练与推理成本时采用推理强化。", boundary: "强化学习不是独立解决一切的阶段，更长内部推理也不保证正确，隐藏思维链不能充当外部审计依据。", sourceIds: ["deepseek-r1-2025", "openai-model-spec-hidden-cot", "nist-genai-profile"] },
      { title: "并行、通信与 Checkpoint", en: "Distributed Systems", explanation: "数据、张量、流水线和专家并行在显存、通信、气泡和实现复杂度间取舍。长训练还受数据加载、网络、存储、Checkpoint 完成语义和故障恢复影响，应报告有效训练时间而非只看 GPU 小时。", decision: "先用剖析定位计算、通信和 I/O，再用故障注入验证完整状态、异步写入完成与恢复容差。", boundary: "卡数翻倍不会带来线性加速；Checkpoint 框架也不会自动覆盖数据游标、拓扑或跨版本兼容。", sourceIds: ["megatron-3d-parallelism-2021", "nccl-collectives", "pytorch-distributed-checkpoint", "pytorch-reproducibility", "checkfreq-2021"] },
      { title: "训练评估与发布门槛", en: "Training Evidence", explanation: "每个阶段都要比较未见任务、关键切片、安全、能力保留、资源和不确定性。训练结束只是候选制品产生，仍需推理部署、线上影子和持续监控。", decision: "用预先定义的证据门决定继续训练、回退数据或进入发布。", boundary: "公开基准提升不能替代客户任务、服务性能和风险验证。", sourceIds: ["nist-genai-profile"] },
    ],
  },
  "llm-inference": {
    lead: "推理优化从真实工作负载与 SLO 契约开始，同时管理时间账、显存账、过载、质量、发布和单位达标结果成本。",
    chapters: [
      { title: "工作负载合同与阶段指标", en: "Workload & Request Lifecycle", explanation: "冻结模型、Tokenizer、模板、输入输出分布、到达率、优先级、质量与 SLO，再分解 queue、Prefill、TTFT、Decode、ITL/TPOT 和端到端交付。", decision: "声明每个指标的测量起点和终点，不用平均响应时间概括所有负载。", boundary: "引擎指标不自动包含网关、网络、客户端渲染或业务终态。", sourceIds: ["vllm-metrics-v0-12", "distserve-2024"] },
      { title: "KV Cache 与显存账", en: "Runtime Memory", explanation: "权重决定固定内存，KV Cache 随层数、头维度、序列和并发增长，激活、工作区和碎片也占空间。模型权重放得下只说明能加载，不代表有足够并发和稳定余量。", decision: "分别计算权重、KV、运行时和安全余量，再谈并发。", boundary: "缓存公式依赖架构与精度，最大上下文不能与最大并发同时兑现。", sourceIds: ["vllm-2023"] },
      { title: "连续批处理、分页与前缀缓存", en: "Scheduling, Paging & Prefix Cache", explanation: "连续批处理动态加入和退出请求，PagedAttention 以块管理 KV，前缀缓存复用相同开头的已计算 KV。验收要测前缀命中、缓存局部性、P95、租户服务份额和 Goodput。", decision: "按真实长度、优先级、前缀重复度和租户边界决定缓存、批处理、公平策略与隔离池。", boundary: "前缀缓存主要减少命中部分的 Prefill，不会缩短新 Token 的 Decode；cache_salt 也不是完整租户安全证明。", sourceIds: ["vllm-2023", "vllm-prefix-caching", "llm-serving-fairness-2024"] },
      { title: "框架与服务栈", en: "Inference Engines", explanation: "推理引擎负责算子、内存、调度和模型执行；服务层还需 API、路由、认证、发布、观测和多租户；平台层管理设备、容量与恢复。框架选型应基于模型支持和目标硬件。", decision: "区分引擎、模型服务和完整平台的责任。", boundary: "安装 vLLM 或同类引擎不等于具备生产多租户、安全和运营能力。", sourceIds: ["vllm-2023", "kubernetes-dra"] },
      { title: "量化与质量账", en: "Quantization", explanation: "降低权重或激活精度可减少内存与带宽，并腾出 KV 空间；收益取决于硬件内核、量化格式和工作负载。质量损失可能集中在少数任务、长上下文或异常输入。", decision: "在目标硬件和客户任务集上同时测质量、延迟、吞吐与稳定。", boundary: "更小不等于必然更快，也不能把公开平均精度损失外推到客户关键切片。", sourceIds: ["gptq-2023", "nist-genai-profile"] },
      { title: "投机解码与算法加速", en: "Speculative Decoding", explanation: "小模型、同模型多头或检索草稿可先提出多个 Token，再由目标模型验证，从而减少串行步骤。接受率、草稿成本和验证并行度决定收益，任务分布变化会改变效果。", decision: "先测接受率和端到端尾延迟，再决定是否增加复杂度。", boundary: "投机解码不改变目标分布的前提依赖正确实现，也不解决 Prefill 或容量全部问题。", sourceIds: ["speculative-decoding-2023"] },
      { title: "P/D 分离与分布式推理", en: "Disaggregated Serving", explanation: "Prefill 和 Decode 资源画像不同，分离可独立扩容并减少干扰，但会引入 KV 传输、调度和网络依赖。验收应在 TTFT 与 TPOT 双重 SLO 下比较 Goodput，而不是只比较聚合吞吐。", decision: "只有阶段资源冲突或模型规模确实需要时采用分布式复杂度。", boundary: "网络、KV 传输和调度开销可能抵消收益，论文结果不能跨硬件和负载直接照搬。", sourceIds: ["distserve-2024", "vllm-2023"] },
      { title: "过载、弹性与故障恢复", en: "Overload & Production Serving", explanation: "短交互、长上下文、Agent 和批处理需要不同容量基线。生产要区分 ready、loading 和 unavailable 容量，并验证突发、等待上限、背压、拒绝、冷启动、节点故障与恢复。", decision: "用分层负载曲线、尾部 SLO 和 Goodput 决定暖容量、准入、资源池与余量。", boundary: "扩容和自动重启只补容量或恢复进程，不证明请求状态、缓存和业务副作用正确。", sourceIds: ["serverlessllm-2024", "jitserve-2026", "nist-genai-profile"] },
    ],
  },
  "data-engineering": {
    lead: "AI 数据工程以权威业务来源为起点，管理解析、清洗、版本、策略引用、质量、血缘和生命周期，使数据能够发布、重建和撤回。",
    chapters: [
      { title: "数据就绪度与派生契约", en: "Data Readiness", explanation: "来源所有者、业务语义、格式、用途、策略引用、地域、保留和质量目标构成源契约；每个派生物还要绑定稳定源 ID、版本或有效期、父对象与坐标、加工版本、质量状态和生命周期。", decision: "把‘数据很乱’改写成可验收契约，并在加工前确认权威来源、用途和冲突裁决人。", boundary: "同一来源用于 RAG、评估和训练时，许可、时效、标签、泄漏与删除要求并不相同。", sourceIds: ["nist-genai-profile", "nist-zero-trust", "w3c-prov-o"] },
      { title: "文档解析与结构恢复", en: "Document Parsing", explanation: "抽取不仅是文字识别，还包括版面、阅读顺序、表格、标题、页码、图片和元数据。通用解析器、文档 AI 和视觉语言模型各有优势，应按文档分层组合。", decision: "用客户最难版式验证结构和证据定位，不只测字符准确率。", boundary: "OCR 识别出所有数字也不能证明表格行列和业务含义正确。", sourceIds: ["docling-report", "pp-ocr-2020"] },
      { title: "清洗、统一格式并裁决版本", en: "Clean & Reconcile", explanation: "去除模板噪声、统一格式和业务主键、识别近重复，并保留来源优先级、版本、有效期与冲突状态。算法发现相似后，业务 Owner 裁决权威语义，未裁决内容进入隔离。", decision: "把重复、修订、替代和冲突分开，不以简单覆盖或相似度阈值决定权威版本。", boundary: "清洗不能抹掉法律声明、版本信息或必要差异，也不能让数据平台代替业务裁决。", sourceIds: ["w3c-prov-o", "iso-iec-5259-2", "nist-genai-profile"] },
      { title: "连接器与增量同步", en: "Connect & Sync", explanation: "连接器需要认证、分页、增量游标、重试、幂等、限流、删除和权限事件。批量适合低频全量，CDC 或事件适合及时变化，但都需要对账和重建路径。", decision: "由业务新鲜度和源系统能力选择同步模式，并保留全量校验。", boundary: "API 返回成功不代表所有对象、权限和删除都已完整传播。", sourceIds: ["nist-zero-trust", "opentelemetry-semconv"] },
      { title: "派生单元、Embedding 与索引", en: "Retrieval Preparation", explanation: "数据工程把文本、表格或其他结构发布为带稳定身份、父子坐标、加工版本、策略引用和可重建信息的派生单元，并生成所需 Embedding 或索引制品。", decision: "保证派生物可追踪、可替换和可撤回；怎样切片能提高真实问题召回，由 RAG 在下游实验中决定。", boundary: "HNSW 等 ANN 算法解决相似搜索，不负责权威版本、授权、最终上下文或答案正确。", sourceIds: ["hnsw-2016", "nist-zero-trust", "w3c-prov-o"] },
      { title: "质量、血缘与反馈", en: "Data Quality", explanation: "覆盖、结构、时效、唯一性、冲突、策略完整性和可追溯要在各阶段测量。运行事件关联 Job、Run 与输入输出，业务失败再按来源、解析、清洗、版本、派生、检索或模型责任回流。", decision: "优先修复产生错误的数据机制，并报告隔离、重放、人工复核与每个合格数据单元成本。", boundary: "标准、事件、模型或解析器置信度都不能自动证明业务正确；阈值必须用客户材料和用途校准。", sourceIds: ["docling-report", "iso-iec-5259-2", "w3c-prov-o", "openlineage-spec"] },
      { title: "标注、合成与两条处理路径", en: "Label & Synthesize", explanation: "专家标注建立权威样本，弱监督和合成扩展覆盖。坏案例可进入数据修复线或模型/应用评估线，两条线共享身份和来源，但不能让自动生成结果未经裁决成为真值。", decision: "把专家时间投入高风险、争议和校准样本。", boundary: "合成数据会继承教师和提示偏差，规模扩大前必须抽样审核。", sourceIds: ["nist-genai-profile"] },
      { title: "权限引用、状态与生命周期", en: "Governance", explanation: "数据工程携带策略引用并传播 active、superseded、revoked、quarantined、retained-by-exception 与 physically-deleted 状态；Security/IAM 和应用在查询时按当前主体执行授权。", decision: "为所有派生层定义传播 SLO、重试、对账与负向验证，保留受控例外和完成证据。", boundary: "数据工程不定义授权策略；删除源文档也不表示训练权重自动遗忘，法律保留冲突由相应 Owner 裁决。", sourceIds: ["nist-zero-trust", "w3c-prov-o", "openlineage-spec"] },
    ],
  },
  "ai-infra-platform": {
    lead: "AI 基础设施平台是一项面向内部用户的产品：它用稳定自助契约把异构设备、准入、放置、开发环境、作业与服务生命周期、隔离、恢复和资源经济连成一条受支持路径。",
    chapters: [
      { title: "把平台作为可自助使用的产品", en: "Platform as a Product", explanation: "平台从用户与常见工作负载出发，以能力目录、API、模板、文档和受支持路径交付设备、环境、作业与服务。工作负载契约声明资源、拓扑、数据、运行时、时限、恢复和服务等级。", decision: "先选择一条高频开发到运行路径，把它做成可自助、可拒绝、可支持的产品，再扩展能力。", boundary: "部署 Kubernetes 或罗列组件不能证明用户获得了一致平台体验。", sourceIds: ["cncf-platforms-whitepaper", "kubernetes-dra"] },
      { title: "平台控制层与工作负载执行层", en: "Control & Execution", explanation: "控制层维护能力、期望状态、身份、策略、配额、版本与审计；执行层承载 Notebook、训练作业、批处理和模型服务副本及其计算、网络和存储。", decision: "为每个对象写明哪个控制器协调、哪个工作负载执行、失败时由谁恢复。", boundary: "控制器状态正常不能证明任务正确完成；执行层健康也不能证明策略、质量或业务结果成立。", sourceIds: ["cncf-platforms-whitepaper", "opentelemetry-semconv"] },
      { title: "DRA、Device Plugin 与设备运行栈", en: "Device Resource Stack", explanation: "Device Plugin 暴露传统扩展资源；DRA 核心 API 在 1.34 稳定，1.36 的可选能力仍分别处于 Stable、Beta 和 Alpha；GPU Operator 管理特定厂商驱动、插件与监控。", decision: "只为已确认的资源表达或生命周期缺口采用 DRA，并按集群、驱动、可选特性和工作负载分层迁移。", boundary: "核心 API GA 不表示所有能力和驱动 GA，也不替代队列、训练编排、模型服务或业务授权。", sourceIds: ["kubernetes-dra-1-34-ga", "kubernetes-dra-1-36", "kubernetes-dra", "nvidia-gpu-operator"] },
      { title: "准入、队列、Gang 与拓扑放置", en: "Admission & Placement", explanation: "准入先检查身份、策略、配额、资源形状和可选外部条件；队列、优先级、Gang、借用、抢占、设备属性和拓扑共同决定何时、在哪里运行。", decision: "把 pending 原因拆成配额、策略、形状、拓扑、健康与准备状态，再决定等待、回填、抢占、溢出或拒绝。", boundary: "Kueue 的具体机制不是 Kubernetes 原生统一保证；抢占会损失进度，时间共享也不能消除所有碎片。", sourceIds: ["kueue-all-or-nothing", "kueue-fair-sharing", "kubernetes-dra"] },
      { title: "四类多租户验收边界", en: "Four Tenant Acceptance Boundaries", explanation: "管理与控制层、身份数据网络、性能资源以及成本归属与问责必须分别验收。前三类讨论隔离与干扰，第四类明确共享成本怎样归属；整卡、分区与时间共享只改变设备共享方式，Namespace 与配额也只覆盖部分管理和公平问题。", decision: "按租户互信程度和 SLO 组合控制层、RBAC、网络存储、密钥、设备、缓存、日志与成本边界，并压测 Noisy Neighbor。", boundary: "共享集群原语不自动形成硬隔离；成本分配也不是安全隔离证明，高权限平台运维同样需要审计。", sourceIds: ["kubernetes-multi-tenancy", "nist-zero-trust", "nvidia-gpu-operator", "finops-unit-economics"] },
      { title: "版本化 Golden Path、恢复与升级", en: "Paved Path & Recovery", explanation: "开发环境、作业、流水线、制品、运行时配置和服务部署通过版本化交接连接；平台负责排空、重调度、健康、灰度与回滚原语。", decision: "用代表性训练和推理长链演练故障、升级与回退，并把训练状态正确性和推理发布语义交给对应模块验收。", boundary: "Pod 重启、节点替换或恢复权重都不能单独证明训练或服务状态正确。", sourceIds: ["cncf-platforms-whitepaper", "torchsnapshot-checkpoint", "checkfreq-2021"] },
      { title: "可移植性与退出演练", en: "Portability & Exit", explanation: "镜像格式、编排 API、设备资源契约和端到端工作负载是不同可移植层。驱动、内核、数据、IAM、网络、存储、观测和托管服务会继续形成目标环境依赖。", decision: "登记平台特有依赖，在目标环境重放构建、数据访问、运行、恢复、SLO、成本和回滚后，再声明具体范围可迁移。", boundary: "OCI 镜像或 Kubernetes YAML 不是跨云、跨加速器的迁移证明。", sourceIds: ["oci-image-spec-v1-1-1", "kubernetes-dra", "nist-zero-trust"] },
    ],
  },
  "ai-infra-compute": {
    lead: "AI 算力从工作负载包络出发，沿加速器、内存、紧耦合互联域、跨域网络、存储、设施和供给形成可验证的数据通路。",
    chapters: [
      { title: "工作负载包络与验收合同", en: "Workload First", explanation: "训练、在线推理、长上下文、批处理和 Agent 对计算、内存、网络和时延要求不同。模型版本、精度、序列或数据、批量、并行、并发、质量门、SLO、增长与恢复构成容量输入。", decision: "先冻结同口径负载和验收方法，再比较硬件、云容量或 API。", boundary: "用参数量或卡数直接报价会遗漏 KV、激活、并行、数据通路、设施和运营余量。", sourceIds: ["mlperf-training", "mlperf-inference-datacenter", "vllm-2023"] },
      { title: "GPU、精度与 Roofline", en: "Compute & Precision", explanation: "Roofline 用运算强度、计算峰值和内存带宽上界判断内核偏计算还是数据移动受限。精度改变吞吐、内存和质量，软件内核决定硬件路径能否被使用。", decision: "用目标算子和框架剖析判断瓶颈，不按峰值 FLOPS 排名。", boundary: "Roofline 是内核级推理模型；厂商峰值和算子结果都不能直接代表端到端持续性能。", sourceIds: ["roofline-2009", "flashattention-2022"] },
      { title: "HBM 与内存层级", en: "Memory System", explanation: "权重、激活、优化器和 KV Cache 占用不同；HBM 容量决定能否放下，带宽决定大量搬运的速度，主机内存和本地存储影响加载与溢出。训练和推理需要分别记账。", decision: "同时评估容量、带宽、碎片和安全余量。", boundary: "显存更大解决容量，不必然提供更高带宽、互联或端到端速度。", sourceIds: ["flashattention-2022", "vllm-2023"] },
      { title: "芯片、软件生态与异构", en: "Accelerator Choice", explanation: "GPU、云自研 ASIC 和其他加速器在硬件、编译器、算子、框架、调试和人才生态上共同竞争。迁移成本来自模型支持、内核、运维和供应，而不只是重编译。", decision: "用同一质量门和代表负载跑通训练、推理、故障和升级全链，再考虑规模采购。", boundary: "一次公开提交或 Demo 成功不能证明全部模型、算子、长期稳定和未来版本兼容。", sourceIds: ["mlperf-training", "mlperf-inference-datacenter"] },
      { title: "Scale-up 紧耦合互联域", en: "Scale-up", explanation: "当模型或并行状态跨设备时，同一高带宽、低时延互联域承载细粒度同步与集合通信；该域可以跨托盘或系统节点，不应机械等同于一台主机。", decision: "根据并行策略、通信画像与故障域选择紧耦合规模。", boundary: "NCCL 定义通信原语和诊断能力，不保证目标框架能持续利用链路规格；互联域内结果也不能外推跨域网络。", sourceIds: ["nccl-collectives", "megatron-3d-parallelism-2021"] },
      { title: "跨节点网络与集合通信", en: "Scale-out", explanation: "当工作负载跨越紧耦合加速器互联域时，数据、张量或流水线并行的通信进入跨域网络。RDMA、拥塞、拓扑与集合通信的实际占比决定网络是否成为瓶颈；IB 与 RoCE 的选择还受现有运营能力和故障域影响。", decision: "用 AllReduce/All-to-All 和真实作业长跑验证跨域网络设计。", boundary: "NCCL 和 Megatron 说明通信机制与特定实验，不证明跨节点就必然跨域，也不证明任意网络升级都会提高 Goodput；短时链路测试同样不会覆盖拥塞与恢复。", sourceIds: ["nccl-collectives", "megatron-3d-parallelism-2021"] },
      { title: "存储、数据管线与供电", en: "Feed the Cluster", explanation: "训练读取、Checkpoint 保存/加载、模型分发和推理加载需要对象、并行文件系统、本地缓存和网络协同。电力、散热、机柜密度、布线和故障容量限制物理规模。", decision: "把持续数据供给、Checkpoint、恢复路径和设施工程验收纳入容量计划。", boundary: "MLPerf Storage 是标准化存储工作负载，DGX H100 是产品参考架构；二者都不能替代客户站点与状态正确性验收。", sourceIds: ["mlperf-storage-v2", "nvidia-dgx-h100-data-center"] },
      { title: "算力经济与采购证据", en: "TCO & Supply", explanation: "采购、长期租用、按需云和模型 API 分别承担资本、利用率、弹性和运维风险。TCO 还包括软件适配、网络存储、能耗、闲置、故障、人才和供应周期。", decision: "用每个满足质量与 SLO 的达标训练或推理结果成本和交付风险比较。", boundary: "资源级 TCO 不等于项目 ROI；当前小时价、一次库存和单次 benchmark 也不能代表长期可交付容量。", sourceIds: ["finops-ai-category", "finops-unit-economics"] },
    ],
  },
});

export const moduleCurriculumContent = Object.freeze(Object.fromEntries(
  Object.entries(baseModuleCurriculumContent).map(([slug, content]) => [
    slug,
    Object.freeze({
      ...content,
      chapters: Object.freeze([...content.chapters, ...(completionCurriculum[slug] ?? [])]),
    }),
  ]),
));

export const moduleCurriculumSlugs = Object.freeze(Object.keys(moduleCurriculumContent));

export function requireModuleCurriculum(slug) {
  const content = moduleCurriculumContent[slug];
  if (!content) throw new Error(`Missing module curriculum content: ${slug}`);
  return content;
}
