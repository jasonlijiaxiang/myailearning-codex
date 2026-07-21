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
    lead: "场景方案不是一张通用架构图，而是把业务结果、数据与系统、风险控制、验收证据、完整成本和后续运营连成一条能落地的路径。",
    chapters: [
      { title: "先把需求写成完整任务", en: "Outcome to Workflow", explanation: "明确使用者、触发条件、输入、要完成的工作、最终业务状态和异常去向，再判断检索、生成、规则、工具与人工各承担哪一段。这样可以把“做一个智能助手”改写成可验证任务。", decision: "先确认谁的工作发生什么变化，再讨论模型与云产品。", boundary: "界面相似不代表责任相同；给建议、生成资产和改变系统状态需要不同控制。", sourceIds: ["anthropic-effective-agents", "nist-genai-profile"] },
      { title: "一张架构图要能解释责任", en: "Reference Architecture", explanation: "入口、身份、上下文、模型、工具、数据、护栏、观测和人工控制构成常见骨架。每条连线还要说明数据格式、权限主体、超时重试、失败补偿和责任团队，否则只能说明组件共存。", decision: "只保留能改变质量、风险、成本或维护方式的组件。", boundary: "组件齐全不等于端到端正确，跨层约定和故障恢复要单独验证。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
      { title: "客服要验收解决问题，不只验收回答", en: "Customer Service", explanation: "客服通常包含意图识别、知识检索、答复、业务查询、工单和人工转接。应按自助解决率、首次解决率、转人工质量、平均处理时间和错误补偿观察完整漏斗，并区分文字与语音渠道。", decision: "根据问题风险把请求分为自助回答、辅助坐席和人工处理。", boundary: "自助率升高可能来自用户放弃；流畅答复也可能造成错误承诺。", sourceIds: ["ragas", "nist-genai-profile"] },
      { title: "企业搜索的核心是权限和证据", en: "Enterprise Search", explanation: "连接器、解析、索引、权限同步、检索、重排、生成和引用共同形成企业搜索链。部门问答可从有限知识域开始；全公司搜索还要解决跨系统身份、版本冲突、撤权传播和结果解释。", decision: "先选权威资料和高价值查询，再逐步扩大连接器范围。", boundary: "搜得到不等于有权看，引用存在也不等于答案正确。", sourceIds: ["ragas", "nist-zero-trust", "owasp-vector-weaknesses"] },
      { title: "内容生成要建立发布流水线", en: "Content Production", explanation: "营销文案、图片和视频要经过素材授权、品牌资料、生成、事实与版权检查、人工审核、渠道发布和效果反馈。Prompt、RAG 与微调可分别处理临时要求、可更新知识和稳定风格。", decision: "把目标定义为可安全发布的资产，不是一次生成成功。", boundary: "视觉或语言质量好不能证明事实、版权、肖像和品牌合规。", sourceIds: ["nist-genai-profile", "owasp-prompt-injection"] },
      { title: "AI Coding 要接入现有工程门禁", en: "AI Coding", explanation: "补全适合局部编码，任务型 Agent 可搜索代码、修改多文件并运行工具。生产试点要纳入仓库权限、依赖与密钥扫描、测试、代码审查、分支保护和变更追踪，并以交付周期和返工率衡量。", decision: "从低风险仓库和可自动验证任务开始，逐步增加动作权限。", boundary: "代码能编译不表示需求正确、安全或便于维护。", sourceIds: ["anthropic-effective-agents", "nist-zero-trust"] },
      { title: "数字人先分内容工厂与实时交互", en: "Digital Human", explanation: "离线内容工厂关注脚本、声音、形象、渲染、审核和发布；实时数字人还包含语音识别、对话、语音合成、口型渲染、打断和人工接管。两类架构的时延、成本、同意和风险完全不同。", decision: "先判断是批量生产资产，还是实时完成服务任务。", boundary: "形象和声音授权、生成内容标识及高风险话术需要单独审查。", sourceIds: ["nist-genai-profile"] },
      { title: "ChatBI 要把自然语言锁进语义口径", en: "ChatBI", explanation: "自然语言提问要经过意图、指标与维度解析、受控查询生成、只读执行、结果校验、归因和报告。语义层负责定义收入、客户、时间等口径，查询层负责权限、成本上限和禁止操作。", decision: "先覆盖少量有权威口径的指标，再扩大自由查询范围。", boundary: "SQL 可以运行不表示业务口径正确；模型也不应获得任意写权限。", sourceIds: ["nist-zero-trust", "nist-genai-profile"] },
      { title: "会议助手要跟踪行动是否落实", en: "Meeting Assistant", explanation: "采集、语音识别、说话人区分、摘要、决定与行动项抽取、确认、通知和后续系统写入组成完整链。指标不仅包括转写准确率，还包括关键决定召回、责任人与截止时间正确率。", decision: "先决定会议内容可否采集、保存和进入哪些后续系统。", boundary: "摘要会省时间，但不能自动代表参会者同意或替代正式决策记录。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
      { title: "PoC 要优先验证最可能失败的地方", en: "PoC & Baseline", explanation: "先记录人工或现有系统表现，再用代表性和反例样本分别检查任务成功、集成、权限、失败恢复和运营。样本、数据版本、环境、评审规则和停止条件都要在试验前固定。", decision: "先验证最大不确定性，不先做最容易演示的路径。", boundary: "几个漂亮答案只能证明演示路径可走，不能支持生产决策。", sourceIds: ["ragas", "nist-genai-profile"] },
      { title: "用每次成功结果计算全部成本", en: "TCO & Production", explanation: "模型与云资源只是成本的一部分；还要计入数据准备、集成、评估、监控、人工复核、失败重试、客户补偿和持续维护。上线门要同时覆盖质量、风险、容量、恢复和责任交接。", decision: "以每个成功业务结果的全部成本比较方案。", boundary: "缺少最终状态样本时只能报告假设与区间，不能给出虚假的精确 ROI。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
      ...applicationFinopsCurriculum["ai-finops"].chapters,
    ],
  },
  "model-landscape": {
    lead: "模型格局学习的目标不是记住一次排名，而是建立面对版本、价格和产品形态持续变化时仍有效的选型方法。",
    chapters: [
      { title: "模型、产品与服务形态", en: "Model, Product, Service", explanation: "同一模型名称可能对应 API、托管平台、消费端产品或开放权重制品。上下文、工具、数据处理、区域、配额和支持策略属于产品能力的一部分，不能只比较基础模型。", decision: "先确定采购对象和责任边界，再比较能力。", boundary: "厂商页面中的模型能力不能自动外推到所有地区、账户层级和集成形态。", sourceIds: ["openai-models", "google-models", "anthropic-models"] },
      { title: "闭源、开放权重与开源", en: "Access Spectrum", explanation: "API 服务提供托管运行与持续更新；开放权重允许本地部署和修改；真正开源还涉及训练代码、数据与许可。开放程度改变可控性、透明度、维护负担和供应链责任。", decision: "把许可、数据边界、运维能力和可审计要求一起纳入选型。", boundary: "可下载不代表可任意商用，也不代表训练过程、数据或安全属性完全透明。", sourceIds: ["nist-genai-profile", "openai-models"] },
      { title: "能力矩阵与任务切片", en: "Capability Matrix", explanation: "文本、代码、视觉、语音、工具调用、长上下文和推理预算需要按客户任务分别验证。当产品暴露 reasoning effort 等控制时，同一模型与不同配置也应视作不同候选：同时测任务成功、推理 Token、TTFT、总时延和每次有效结果成本。", decision: "用客户任务集决定模型、可用的推理配置与分工，不寻找无条件最强模型。", boundary: "不是所有模型都支持显式推理预算；更长测试时计算也不保证正确，公开基准只能用于形成验证假设。", sourceIds: ["nist-genai-profile", "deepseek-r1-2025", "openai-reasoning-guide", "openai-models", "google-models"] },
      { title: "价格带与上下文经济学", en: "Cost Structure", explanation: "输入、输出、缓存、批处理、长上下文、工具循环和失败重试共同决定成本。输出通常更慢更贵；简单请求和复杂请求混用一个模型，会让成本优化和质量保障互相牵制。", decision: "按任务层级报告成功率、延迟和每次成功结果成本。", boundary: "公开单价和上下文上限变化很快，采购时需要按当期产品资料复核。", sourceIds: ["openai-models", "anthropic-models", "google-models"] },
      { title: "路由、回退与组合", en: "Routing & Fallback", explanation: "规则路由处理明确约束，分类器或模型路由处理复杂度判断，人工或高能力模型承接高风险和低置信请求。回退不仅是换供应商，还要明确允许牺牲的质量、功能和数据边界。", decision: "为每类请求预先定义主路径、保护组、回退和停止条件。", boundary: "动态路由本身会误判，必须独立评估、观测并可快速关闭。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
      { title: "版本发布与可替换性", en: "Release Discipline", explanation: "模型版本改变会影响输出、拒答、工具 Schema、Token 使用和延迟。可替换性来自统一契约、代表性回归、影子验证和数据可迁移，而不是在配置里保留第二个模型名称。", decision: "把模型升级当作软件与风险策略共同变更。", boundary: "同一家族的新版本也可能出现行为漂移，不能因厂商兼容承诺跳过客户回归。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
    ],
  },
  multimodal: {
    lead: "多模态系统要分别解释感知、表示、对齐、推理与生成，才能判断信息在哪一层丢失。",
    chapters: [
      { title: "模态与任务契约", en: "Modality Contract", explanation: "图像、文档、视频和语音并不是一种输入；每种模态都有采样、分辨率、时间、说话人、版式和来源定位要求。理解、检索、生成和实时对话也需要不同输出与验收。", decision: "先定义模态输入和业务输出，再选择模型或管线。", boundary: "支持某种文件格式不等于可靠理解其中所有结构和业务语义。", sourceIds: ["nist-genai-profile", "docling-report"] },
      { title: "视觉表示：ViT 与 Patch", en: "Vision Transformer", explanation: "ViT 把图像切成 Patch 并映射为序列表示，再用 Transformer 聚合全局关系。它说明视觉信息可以进入通用序列架构，但分辨率、细节和位置仍会影响 Token 数与可见性。", decision: "对小字、密集表格和局部证据单独做分辨率与裁剪验证。", boundary: "视觉编码器的基准表现不能直接代表客户扫描件、语言和版式。", sourceIds: ["vit-2021", "colpali-2025"] },
      { title: "跨模态对齐：CLIP", en: "Contrastive Alignment", explanation: "CLIP 用对比学习把图像和文本映射到可比较空间，支持开放词汇匹配和检索。对齐空间适合找相似语义，不等于细粒度 OCR、逻辑推理或事实核验。", decision: "用跨模态检索解决候选发现，用专用解析或推理处理精确结构。", boundary: "相似度高只表示表示空间接近，不证明图像内容满足业务条件。", sourceIds: ["clip-2021"] },
      { title: "原生融合与专用管线", en: "Native vs Pipeline", explanation: "原生模型在统一上下文中处理多模态，适合开放式理解；OCR、ASR、版面、检测和结构化管线提供可控中间产物。生产系统常把两者组合，用管线保留证据，用模型处理模糊语义。", decision: "由可追溯、时延、成本和结构精度决定融合方式。", boundary: "增加模型层不能恢复采集或解析阶段已经丢失的信息。", sourceIds: ["docling-report", "pp-ocr-2020", "colpali-2025"] },
      { title: "理解侧与生成侧", en: "Understand vs Generate", explanation: "理解侧关注识别、描述、问答、检索和时间定位；生成侧关注图像、视频、语音与 any-to-any 输出。两侧的风险不同：理解错误会误导决策，生成错误还涉及品牌、版权、标识和内容安全。", decision: "把理解准确性和生成可发布性分成两套门禁。", boundary: "视觉质量好不等于事实、版权或品牌合规，生成资产仍需业务审核。", sourceIds: ["nist-genai-profile", "owasp-prompt-injection"] },
      { title: "显式标识、水印与内容凭证", en: "Content Provenance", explanation: "显式标识负责向人告知，水印或 Soft Binding 帮助资产与凭证重关联，C2PA 签名 Manifest 则记录可验证的来源与编辑声明。三者解决的问题不同，发布和接收侧都要定义缺失、失效与验证失败时如何处置。", decision: "把‘是否告知、能否重关联、能否验证来源链’拆成三项验收。", boundary: "内容凭证只证明声明、签名和资产绑定的验证结果，不证明内容为真、拥有版权或已经合规；凭证也可能被移除。", sourceIds: ["c2pa-2-4", "china-ai-content-labeling"] },
      { title: "实时语音与视频链路", en: "Real-time Loop", explanation: "实时体验由采集、端点检测、识别、推理、合成、网络和打断策略共同决定。平均时延无法解释卡顿、抢话、误唤醒和多轮修复，需要按阶段和任务终态观测。", decision: "用端到端任务完成率和分阶段尾延迟共同验收。", boundary: "模型首包速度不能代表客户端播放、网络和交互策略后的真实体验。", sourceIds: ["opentelemetry-semconv", "nist-genai-profile"] },
      { title: "安全、隐私与证据", en: "Trust & Evidence", explanation: "图片、音频和文档都可能携带敏感信息、不可信指令和难以察觉的操纵内容。生产系统需要来源、页码、区域、时间戳、权限和原始资产版本，才能审核回答和追踪影响。", decision: "让多模态内容成为可审计证据，而不是无来源的上下文块。", boundary: "把文本从图片中识别出来不会自动使其可信，也不能授予工具权限。", sourceIds: ["owasp-prompt-injection", "nist-zero-trust"] },
    ],
  },
  mcp: {
    lead: "MCP 解决能力如何被发现和调用；生产落地还必须补上身份、授权、网络与业务事务语义。",
    chapters: [
      { title: "Host、Client 与 Server", en: "Protocol Roles", explanation: "Host 承载用户体验与安全决策，Client 维护与某个 Server 的协议会话，Server 暴露能力。角色分离允许多个 Server 被组合，也意味着信任、生命周期和错误不能由单一进程假设。", decision: "明确每个角色由谁运行、升级、认证和审计。", boundary: "协议角色不是部署拓扑；同一机器和跨组织网络会产生不同风险。", sourceIds: ["mcp-architecture"] },
      { title: "Tools、Resources 与 Prompts", en: "Server Primitives", explanation: "Tool 面向可执行动作，Resource 面向可读取上下文，Prompt 面向可复用交互模板。正确分类能让客户端呈现适当控制，但三种原语都不能绕过下游业务权限。", decision: "按副作用和用户意图选择原语，而不是把所有 API 都包装成 Tool。", boundary: "只读 Resource 也可能包含敏感信息，Prompt 也可能引入不可信内容。", sourceIds: ["mcp-architecture", "mcp-security"] },
      { title: "初始化与能力协商", en: "Lifecycle & Capability", explanation: "Client 与 Server 在初始化阶段协商协议版本和能力，再进入正常请求、通知与关闭。能力协商让实现可演进，但客户端仍需为缺失能力、版本差异和断线准备降级。", decision: "把协议版本与业务能力版本分别管理。", boundary: "完成握手只证明协议兼容，不证明每个 Tool 的业务语义和权限正确。", sourceIds: ["mcp-architecture"] },
      { title: "传输与部署形态", en: "stdio & Streamable HTTP", explanation: "stdio 常用于本地子进程，边界靠操作系统用户和进程；Streamable HTTP 面向远程共享服务，需要网络身份、会话、重试、负载均衡和边缘治理。传输选择会改变凭据和故障半径。", decision: "先画信任边界，再选择本地或远程传输。", boundary: "本地开发安全假设不能原样复制到远程服务。", sourceIds: ["mcp-architecture", "mcp-authorization"] },
      { title: "身份、授权与同意", en: "Identity & Authorization", explanation: "客户端身份、最终用户身份和 Server 自身身份可能同时存在。生产调用要明确代表谁、允许做什么、Token 面向哪个资源，以及何时需要用户确认或审批。", decision: "让每次高影响调用可追到主体、授权依据和参数。", boundary: "OAuth 登录成功不等于 Tool 内部业务授权已完成，也不能信任客户端自报角色。", sourceIds: ["mcp-authorization", "nist-zero-trust"] },
      { title: "Elicitation 与敏感交互", en: "Form & URL Elicitation", explanation: "Server 可向 MCP Client 发送 Elicitation 请求，由 Host 负责用户界面：Form 收集结构化输入，URL 把敏感交互留在外部页面。密码、API Key、访问令牌和支付凭据不得经 Form 收集；URL 模式要展示目标域名并取得用户同意。", decision: "按信息敏感性选择交互模式，并保留拒绝、取消和回到原任务的路径。", boundary: "Elicitation 负责用户交互，不替代 MCP 授权、第三方授权或业务后置条件；同意打开 URL 也不代表外部流程完成。", sourceIds: ["mcp-elicitation-2025-11-25", "mcp-authorization"] },
      { title: "长调用与实验性 Tasks", en: "Durable MCP Requests", explanation: "2025-11-25 规范引入实验性 Tasks，把一次 MCP 请求包装为可轮询、可延迟取回结果的耐久状态机。能力必须在初始化和具体请求类型上协商，客户端不能把通知当作唯一状态来源。", decision: "仅在双方声明支持且业务确需耐久执行时采用，并准备协议变化与回退。", boundary: "MCP Task 是 client / server 请求的耐久包装；A2A Task 是独立 Agent 间带 Message 与 Artifact 的协作对象，二者只能显式映射，不能共用语义或 ID。", sourceIds: ["mcp-tasks-2025-11-25", "a2a-spec-1-0-0"] },
      { title: "生产工程与供应链", en: "Production Operations", explanation: "Schema 版本、超时、幂等、限流、沙箱、日志、撤销、密钥轮换和 Server 来源共同决定可运营性。公共 Server 与高权限插件类似，需要清单、审查、隔离和快速停用。", decision: "把 Server 当作可执行供应链组件管理。", boundary: "发现能力和调用成功不能证明副作用可逆、结果正确或第三方可信。", sourceIds: ["mcp-security", "nist-zero-trust"] },
    ],
  },
  a2a: {
    lead: "A2A 面向独立 Agent 之间的任务协作，重点是能力发现、长任务状态、消息与产物交付，而不是共享内部思维过程。",
    chapters: [
      { title: "A2A 与 MCP 的分工", en: "Agent vs Tool Boundary", explanation: "MCP 让模型或应用调用工具和读取资源；A2A 让独立 Agent 以任务为单位协作。一个 Agent 可以内部使用 MCP，也可以通过 A2A 把目标交给另一个拥有独立策略和生命周期的 Agent。", decision: "按独立责任、状态所有权和组织边界决定使用哪种协议。", boundary: "多 Agent 框架内部调用不一定需要 A2A，跨 Agent 协作也不能代替工具授权。", sourceIds: ["a2a-concepts", "mcp-architecture"] },
      { title: "Agent Card 与能力发现", en: "Agent Card", explanation: "Agent Card 描述身份、入口、技能和交互能力，帮助客户端发现可委派对象。发现信息应被验证、缓存和版本化，不能仅因公开可访问就被信任。", decision: "把能力声明当作候选信息，再通过组织信任和运行证据决定调用。", boundary: "声明支持某技能不等于对特定客户数据、权限和质量负责。", sourceIds: ["a2a-concepts", "a2a-specification"] },
      { title: "Task、Message 与 Artifact", en: "Core Objects", explanation: "Message 承载交互内容，Task 承载有状态工作，Artifact 承载可交付结果。把消息和产物分开，能让长任务在多轮输入、等待和多版本结果中保持清楚。", decision: "用 Task 管理生命周期，用 Artifact 管理可消费结果。", boundary: "Artifact 仍需版本、权限、保留和内容安全，不能因协议交付而默认可信。", sourceIds: ["a2a-concepts", "a2a-specification"] },
      { title: "任务状态机", en: "Task Lifecycle", explanation: "长任务会经历提交、处理中、等待输入、完成、失败或取消。客户端需要处理重复事件、断线恢复、迟到结果和幂等，Server 需要明确终态与可重试边界。", decision: "先定义状态和恢复语义，再选择同步、流式或异步交付。", boundary: "网络重试不能自动等同于业务重试，重复执行可能产生不可逆副作用。", sourceIds: ["a2a-specification", "opentelemetry-semconv"] },
      { title: "1.0 版本与绑定协商", en: "Version & Binding Negotiation", explanation: "A2A 1.0 通过 A2A-Version 明确 Major.Minor 请求语义，AgentInterface 同时声明 URL、Binding 与协议版本；同一能力可经 HTTP+JSON、JSON-RPC 或 gRPC 暴露，但兼容性需要按绑定和版本分别验证。", decision: "把协议版本、Binding、SDK 和 Agent 能力版本分别纳入发布与兼容矩阵。", boundary: "网络连通不证明绑定功能等价；协议要求各绑定保持功能与错误映射一致，但这仍不保证模型结果或业务终态相同。不支持的版本应明确失败，不能静默降级。", sourceIds: ["a2a-spec-1-0-0"] },
      { title: "协作拓扑与编排边界", en: "Collaboration Topology", explanation: "中心协调、点对点委派和分层协作适合不同治理强度。内部编排可以共享更多状态，跨组织 A2A 应最小化契约和数据暴露，并允许各方独立演进。", decision: "把稳定外部契约放在组织边界，把高频细粒度协作留在内部。", boundary: "增加 Agent 数量会增加协调、追踪和错误传播，不会自动提升质量。", sourceIds: ["anthropic-effective-agents", "a2a-concepts"] },
      { title: "身份、产物与审计", en: "Trust & Audit", explanation: "跨 Agent 调用要验证调用主体、目标 Agent、任务权限和 Artifact 访问，并保留任务、消息、事件和外部动作的关联证据。审计关注可观察输入输出和责任，而非要求暴露隐藏思维。", decision: "用任务证据、策略版本和外部动作记录证明边界。", boundary: "不透明内部实现不免除安全和质量责任，但也不应通过索取隐藏思维链伪装审计。", sourceIds: ["a2a-specification", "opentelemetry-semconv"] },
    ],
  },
  evaluation: {
    lead: "评估不是给模型一个总分，而是建立能支持选型、发布、诊断和持续运营的量尺系统。",
    chapters: [
      { title: "为什么生成式 AI 难评", en: "Non-determinism", explanation: "同一输入可能产生多个合理答案，输出质量还受上下文、采样、工具和外部状态影响。传统精确匹配不足以覆盖语义正确、事实依据、风险和任务完成。", decision: "先定义可接受结果集合和不可接受行为，再选择评分方法。", boundary: "非确定性不意味着无法测试，而是需要分层样本、重复运行和不确定性报告。", sourceIds: ["nist-genai-profile", "ragas"] },
      { title: "模型、组件与业务三层", en: "Three Evaluation Layers", explanation: "模型层检查通用或任务能力，组件层检查检索、路由、工具和护栏，业务层检查终态、风险和用户价值。三层共同变化时，只看最终分数无法定位责任。", decision: "每个发布门同时保留端到端结果和关键组件诊断。", boundary: "组件指标好不保证业务成功，业务结果下降也不一定由模型造成。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
      { title: "公开基准与竞技场", en: "Benchmarks & Arenas", explanation: "基准提供可复现任务和历史比较，竞技场提供偏好信号，但二者都受任务分布、数据污染、提示、评审人群和版本时点影响。它们适合筛选候选，不适合替代客户验收。", decision: "用公开结果形成假设，用客户任务集做最终决策。", boundary: "榜单名次差异可能不具业务意义，也不能证明安全、成本和集成表现。", sourceIds: ["nist-genai-profile"] },
      { title: "规则、Judge 与人工", en: "Scoring Spectrum", explanation: "规则适合结构和确定约束，LLM Judge 扩展语义评分，人工负责高风险、模糊和校准样本。上线前要用人工双评样本检查一致性，并通过答案顺序交换、长度扰动和跨模型抽检暴露位置与冗长偏差。", decision: "把评分器当作需要评估、校准和版本化的模型组件。", boundary: "同一个模型生成又自证会产生相关偏差，Judge 分数不是业务真值，也不能独立授权高风险动作。", sourceIds: ["llm-as-judge-2023", "nist-genai-profile", "ragas"] },
      { title: "黄金集与失败分类", en: "Golden Set", explanation: "黄金集由输入、上下文、期望、不可接受行为、标签、来源和版本组成。按场景、风险、难度和失败机制分层，能避免平均分掩盖关键退化，并让真实失败进入回归。", decision: "少量高质量、可解释样本优先于大量未治理数据。", boundary: "线上反馈不能未经去重、裁决和隐私处理直接成为权威答案。", sourceIds: ["nist-genai-profile", "ragas"] },
      { title: "场景验收与生产闭环", en: "Release & Monitoring", explanation: "RAG 要分检索与生成，Agent 要检查过程、工具与终态，微调要比较未见切片和基座。上线后用抽样、业务指标和失败回流持续巡检，并把每次变更关联到版本。", decision: "离线门禁决定能否放量，在线证据决定是否继续、回滚或修复。", boundary: "线上自动评分无法覆盖所有风险，低反馈量也不表示系统成功。", sourceIds: ["opentelemetry-semconv", "nist-genai-profile"] },
    ],
  },
  security: {
    lead: "AI 安全要覆盖不可信内容、概率输出、可执行工具、敏感数据和快速变化供应链，任何单一护栏都不是完整防线。",
    chapters: [
      { title: "先用风险目录盘点攻击面", en: "Risk Landscape", explanation: "提示注入、敏感信息泄露、供应链、数据与模型投毒、输出处理、过度授权和向量检索弱点可能跨越模型、应用与平台。风险目录用于防止漏项，真正的威胁模型仍要落到资产、主体、数据流和高影响动作。", decision: "先列出可能损失，再沿数据和动作路径寻找攻击入口。", boundary: "风险清单不是合规证明，也不能代替具体系统测试。", sourceIds: ["owasp-llm-top-ten", "nist-genai-profile"] },
      { title: "把应用注入与模型攻击分层", en: "Adversarial ML Surface", explanation: "Prompt Injection 主要利用应用把不可信内容与控制指令交给模型；规避（Evasion）、数据或模型投毒、隐私攻击和滥用则可能发生在训练、部署与使用的不同阶段。各层需要不同资产清单、攻击者能力、检测、隔离和恢复证据。", decision: "先判断攻击发生在哪个生命周期与资产层，再选择控制和测试。", boundary: "NIST 攻击分类提供共同语言，不是安全认证；防住提示注入也不代表模型、数据和供应链攻击面已关闭。", sourceIds: ["nist-aml-100-2e2025", "owasp-prompt-injection"] },
      { title: "直接与间接提示注入", en: "Prompt Injection", explanation: "直接注入来自用户，间接注入藏在网页、文档、邮件或工具返回中。根因是模型同时处理指令和不可信数据；更强系统提示能降低部分攻击成功率，但不能建立确定权限边界。", decision: "按 Source—Sink 路径限制不可信内容能触发的高影响动作。", boundary: "RAG、微调和输入检测都不能单独消除提示注入。", sourceIds: ["owasp-prompt-injection", "mcp-security"] },
      { title: "数据、隐私与向量资产", en: "Data & Privacy", explanation: "原文、Prompt、日志、Embedding、索引、缓存和评估样本都可能包含敏感信息。权限和删除需要穿过所有派生层，日志保留要平衡诊断、用途限制和最小化。", decision: "为每种数据形态定义所有者、用途、访问、地域、保留和删除证明。", boundary: "Embedding 不是自动匿名化，向量相似检索也不能替代访问控制。", sourceIds: ["owasp-vector-weaknesses", "nist-zero-trust"] },
      { title: "模型与组件供应链", en: "AI Supply Chain", explanation: "模型权重、数据集、容器、插件、MCP Server、评估器和托管 API 都是依赖。需要来源、版本、许可证、漏洞、签名、部署清单、隔离和替代路径，才能在公告或异常发生时定位影响。", decision: "把可执行 AI 组件纳入与代码依赖相同甚至更严格的发布治理。", boundary: "开放权重不等于可信，官方托管也不免除配置、数据和业务使用责任。", sourceIds: ["nist-genai-profile", "mcp-security"] },
      { title: "Agent、工具与爆炸半径", en: "Agentic Risk", explanation: "Agent 把概率输出连接到外部动作，风险由权限范围、动作可逆性、执行速度和自主循环共同放大。Schema、参数校验、最小权限、沙箱、审批、限额和补偿应位于模型之外。", decision: "按后果把动作分成建议、草稿、可逆执行和高影响审批。", boundary: "模型会调用 API 不等于模型拥有 API 权限，也不证明参数符合业务规则。", sourceIds: ["nist-zero-trust", "mcp-security"] },
      { title: "把身份、授权和凭据拆开检查", en: "Identity, Policy, Credential", explanation: "最终用户、应用、Agent、工具服务和下游系统可能是不同主体。身份说明是谁，授权说明此刻能做什么，凭据只是向目标系统证明某个主体；三者混在一起容易产生共享密钥和权限继承。", decision: "每次高影响动作都记录主体、授权依据、目标资源和实际参数。", boundary: "登录成功不表示具备业务权限，模型也不能决定给自己扩大权限。", sourceIds: ["nist-zero-trust", "mcp-authorization"] },
      { title: "纵深防御与红队", en: "Defense in Depth", explanation: "输入处理、上下文隔离、模型策略、输出校验、工具授权、运行沙箱、监控和人工控制形成多层防线。红队应从业务威胁出发，覆盖绕过、组合攻击和控制失败后的残余影响。", decision: "验证控制能限制后果，而不是只统计检测率。", boundary: "Guardrail 服务覆盖有限类别和时点，不能替代应用安全测试与事件响应。", sourceIds: ["nist-genai-profile", "owasp-prompt-injection"] },
      { title: "治理框架要落到日常工作", en: "Governance Operations", explanation: "NIST AI RMF 的治理、识别、度量和管理可以连接风险分级、系统与数据清单、责任人、发布门、监控和事件响应。框架的价值在于统一问题和证据，不是增加一层抽象口号。", decision: "让每项治理要求落到可执行控制、证据和负责人。", boundary: "采用框架或通过认证不能自动证明某个应用安全。", sourceIds: ["nist-genai-profile", "nist-zero-trust"] },
      { title: "按部署地判断适用法规", en: "Regulatory Triage", explanation: "上线前要根据用户地区、行业、用途、数据类型和内容传播方式判断适用要求。例如中国的生成合成内容标识要求与强制性国家标准已在 2025 年 9 月实施；跨境或高风险用途还需继续核对专项规定。", decision: "把地区和用途问题在方案阶段交给法务、安全与业务共同确认。", boundary: "本页不是法律意见；欧盟、中国及行业规定均需按部署时点复核官方文本。", sourceIds: ["china-ai-content-labeling", "gb-45438-2025", "eu-ai-act"] },
      { title: "事件响应从停止扩散开始", en: "Incident Response", explanation: "发现泄漏、越权、投毒或供应链问题后，应能隔离模型或组件、撤销凭据、停止队列和外部写入、保存证据、判断受影响用户并验证恢复。随后把事件样本和控制缺口写回回归集。", decision: "事故前就约定谁能停、停什么、怎样恢复和通知。", boundary: "恢复服务不等于业务状态已修复，已发生的动作可能需要补偿。", sourceIds: ["nist-genai-profile", "nist-zero-trust"] },
    ],
  },
  "ai-gateway": {
    lead: "AI 网关把多模型调用的接入、身份、策略、成本与观测集中起来，但集中化也带来新的性能和故障责任。",
    chapters: [
      { title: "统一接入与协议归一", en: "Unified Access", explanation: "不同模型提供方在请求格式、流式、错误、用量、工具和内容策略上存在差异。网关可以提供稳定应用契约，并保留提供方特性作为显式能力，而不是抹平成最低公共集合。", decision: "统一稳定语义，暴露会改变质量或风险的差异。", boundary: "格式兼容不等于模型行为兼容，切换提供方仍需回归。", sourceIds: ["cloudflare-ai-gateway", "opentelemetry-semconv"] },
      { title: "身份、虚拟凭据与租户", en: "Identity & Credentials", explanation: "应用不应直接持有所有提供方密钥。网关可用虚拟凭据映射租户、项目、预算和允许模型，同时把最终用户主体传到策略与审计链。", decision: "把人、应用、项目和提供方凭据分层，分别轮换与撤销。", boundary: "虚拟密钥只解决接入治理，不能替代下游数据和业务权限。", sourceIds: ["mcp-authorization", "nist-zero-trust"] },
      { title: "路由、负载与容灾", en: "Routing & Fallback", explanation: "路由可基于任务、风险、区域、容量、价格或健康；容灾需要定义重试、替代模型、功能降级和停止条件。为了可用而切换模型时，质量和数据边界也可能改变。", decision: "为每条回退路径预先声明允许牺牲什么并持续演练。", boundary: "跨模型重试可能产生重复费用、不同输出或重复工具动作，不能盲目自动化。", sourceIds: ["cloudflare-ai-gateway", "nist-genai-profile"] },
      { title: "配额、预算与缓存", en: "Traffic & Cost", explanation: "限流保护容量，预算控制归属，精确缓存复用相同请求，语义缓存复用相似结果。缓存收益取决于时效、权限、版本和误命中成本，不能只看命中率。", decision: "用每个成功任务成本优化，并为缓存定义禁止区与失效规则。", boundary: "缓存必须纳入租户、身份、模型、Prompt 和数据版本，敏感或动态结果不应默认复用。", sourceIds: ["cloudflare-ai-gateway", "nist-zero-trust"] },
      { title: "前后置护栏与审计", en: "Guardrails & Audit", explanation: "前置策略检查输入、身份和允许能力，后置策略检查输出、结构和敏感内容；工具动作还需单独授权与参数校验。审计应关联策略版本、命中原因和最终处置。", decision: "把确定规则放在网关或应用外部控制，把语义检测作为辅助信号。", boundary: "全量缓冲才能检查的策略会改变流式体验，需要明确取舍。", sourceIds: ["nist-genai-profile", "mcp-authorization"] },
      { title: "端到端可观测", en: "GenAI Telemetry", explanation: "网关知道请求、提供方、延迟、错误、Token、缓存和策略，但不知道最终业务是否成功。需要与应用 Trace、检索、工具和终态关联，才能分辨网关优化是否真正有效。", decision: "让网关 Span 成为任务 Trace 的一段，而不是独立报表。", boundary: "标准字段不自动提供业务成功、风险标签和成本责任，需要组织扩展。", sourceIds: ["opentelemetry-semconv"] },
      { title: "MCP 网关与工具治理", en: "MCP Gateway", explanation: "MCP 网关可以集中 Server 发现、身份、网络、策略和观测，但 Tool Schema、业务权限、事务、审批与补偿仍属于具体服务和应用。模型流量与工具流量的后果不同。", decision: "共享基础治理，但分别为模型生成和工具副作用设置门禁。", boundary: "接入网关不表示远程 Server 可信，也不使调用自动符合业务规则。", sourceIds: ["mcp-authorization", "nist-zero-trust"] },
    ],
  },
  "ai-ops": {
    lead: "AI 应用工程与运营把制品、评估、发布、观测、成本和事故放进同一生命周期，管理的不只是服务可用性。",
    chapters: [
      ...applicationFinopsCurriculum["ai-application-engineering"].chapters,
      { title: "任务级 Trace 与 OTel", en: "End-to-end Tracing", explanation: "一次任务可能穿过网关、检索、多个模型、工具和人工等待。OpenTelemetry 的 GenAI 语义已迁入独立仓库并继续演进；团队应固定约定版本，在 Collector 归一化字段，并把业务终态与审批作为项目扩展。", decision: "以任务为根关联所有技术调用和业务结果，同时治理遥测 Schema 版本。", boundary: "Trace 完整不代表应永久保存敏感原文；标准字段也不自动表达业务成功、风险和责任。", sourceIds: ["opentelemetry-semconv", "opentelemetry-genai-semconv", "nist-zero-trust"] },
      { title: "离线验收与在线巡检", en: "Offline & Online Evaluation", explanation: "离线评估使用可控样本比较版本，在线评估观察真实分布、反馈和业务结果。规则、Judge、人工抽样和用户行为共同形成漏斗，线上失败再进入治理后的回归集。", decision: "离线决定能否放量，在线决定是否继续、回滚或修复。", boundary: "自动 Judge 不能覆盖所有风险，反馈缺失也不表示成功。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
      { title: "三类漂移与静默退化", en: "Drift", explanation: "输入分布、数据内容和系统行为都可能漂移；外部 API、Prompt、检索和工具变化会让基础设施指标仍绿色但任务成功下降。分层切片和变更时间线比单一阈值更可靠。", decision: "把漂移信号连接到可重现样本和具体责任层。", boundary: "统计变化不一定有业务影响，业务退化也可能没有明显分布漂移。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
      { title: "版本、灰度与回滚", en: "Release Management", explanation: "模型、Prompt、数据、索引、工具 Schema、路由和护栏都要进入版本注册。离线回放、影子、金丝雀、分组放量和自动回退组成发布链，并保留回滚后的数据兼容。", decision: "任何影响输出或动作的变化都作为可审计发布。", boundary: "回滚配置不能撤销已经发生的外部副作用，需要补偿和客户处置。", sourceIds: ["opentelemetry-semconv", "nist-genai-profile"] },
      { title: "成本、容量与单位经济", en: "Cost & Capacity", explanation: "Token、工具、检索、人工和失败重试共同决定成本。容量需要按交互、长上下文、Agent 和批处理分别建模，把预留余量与低效空闲区分。", decision: "报告每个成功业务终态的成本和分层 SLO。", boundary: "低利用率可能是尾延迟保障，满载也可能降低成功率。", sourceIds: ["opentelemetry-semconv", "nist-genai-profile"] },
      { title: "事件、HITL 与急停", en: "Incident & Stop", explanation: "高风险系统需要可停止模型调用、工具执行、队列消费或外部写入的多级开关。Human-in/on/out-of-the-loop 按风险和时效分工，事故证据进入复盘和新回归。", decision: "在事故前定义谁能停、停什么、如何恢复和如何补偿。", boundary: "停止模型不一定停止已排队动作或第三方副作用，恢复也不等于业务状态正确。", sourceIds: ["nist-zero-trust", "nist-genai-profile"] },
    ],
  },
  llm: {
    lead: "大语言模型从序列表示、注意力和 Transformer 块出发，以自回归方式逐 Token 生成；工程边界来自上下文、内存和概率输出。",
    chapters: [
      { title: "Token、Embedding 与位置", en: "Input Representation", explanation: "文本先被分词成 Token，再映射为向量；位置编码或位置机制让模型区分顺序。不同语言、数字和代码的 Token 密度不同，会直接改变上下文占用、成本和截断。", decision: "用真实语料测 Token 分布，不按字符或词数粗略承诺容量。", boundary: "Embedding 表示相似性和上下文特征，不是可直接读取的事实数据库。", sourceIds: ["transformer-2017"] },
      { title: "Q/K/V 与注意力头", en: "MHA, MQA & GQA", explanation: "Query 表示当前位置要寻找什么，Key 表示可匹配特征，Value 表示被聚合的信息。MHA 为每个 Query Head 保留独立 KV Head；MQA 共享一组，GQA 在两者之间分组共享，因而把表示能力与 KV Cache、带宽和服务成本连接起来。", decision: "解释模型架构时同时记录 Query / KV Head 组织和运行时影响。", boundary: "更少 KV Head 不保证目标任务质量不变，注意力权重也不是完整因果解释或答案来源证明。", sourceIds: ["transformer-2017", "gqa-2023"] },
      { title: "Transformer 块", en: "Block Anatomy", explanation: "注意力、前馈网络、残差连接和归一化反复堆叠。注意力混合上下文，前馈网络逐位置变换表示，残差与归一化帮助深层训练；参数和计算在各部分的分布影响模型能力与成本。", decision: "把架构名词连接到训练稳定、推理计算和内存，而不是只背组件。", boundary: "相同‘Transformer’标签下的层数、宽度、注意力和训练数据差异巨大。", sourceIds: ["transformer-2017"] },
      { title: "Decoder-only、因果掩码与 MoE", en: "Architecture Variants", explanation: "Decoder-only 用因果掩码保证每个位置只看此前 Token，适合统一生成；MoE 让每个 Token 只激活部分专家，增加参数容量但引入路由、负载均衡和分布式通信。", decision: "从任务和服务特性理解架构取舍，不用参数量独立判断质量。", boundary: "总参数、激活参数和实际推理成本不是同一指标，MoE 也不自动更快。", sourceIds: ["transformer-2017", "nist-genai-profile"] },
      { title: "自回归生成、采样与测试时计算", en: "Autoregressive & Test-time Compute", explanation: "模型逐 Token 生成，温度、top-p 和停止条件改变多样性与稳定性；推理模型还可能在最终答案前消耗额外测试时计算。模型、采样、可用的推理配置和工具集共同定义一次运行候选。", decision: "把生成参数和可用的推理配置版本化，并同时回归质量、延迟与 Token。", boundary: "更多内部推理不保证正确，可见摘要也不等于真实思维链或可审计解释。", sourceIds: ["deepseek-r1-2025", "openai-model-spec-hidden-cot", "nist-genai-profile"] },
      { title: "上下文、Prefill 与 KV Cache", en: "Runtime Context", explanation: "输入上下文在 Prefill 阶段并行处理，历史 Key/Value 被缓存以避免每个新 Token 重算全部前缀；Decode 仍逐步生成。长上下文同时增加预填充计算、缓存内存和信息利用难度。", decision: "区分缺知识、缺上下文、上下文组织差和推理容量不足。", boundary: "上下文上限是允许值，不是模型会可靠使用全部信息的保证。", sourceIds: ["vllm-2023", "flashattention-2022"] },
    ],
  },
  "fine-tuning": {
    lead: "微调适合稳定行为和特定能力塑形；新鲜知识、确定规则和外部动作权限通常应由 RAG、应用代码或身份系统承担。",
    chapters: [
      { title: "定制光谱与关键分叉", en: "Customization Ladder", explanation: "Prompt 改变当次指令，RAG 提供外部知识，工具提供确定能力，微调改变权重中的行为倾向。先区分知识、风格、格式、领域技能和安全边界，才能避免用训练解决错误问题。", decision: "只有稳定、重复且难以用更轻手段解决的行为问题才进入微调。", boundary: "微调不能保证记住所有事实，也不能替代实时数据和硬业务规则。", sourceIds: ["nist-genai-profile", "lora-2021"] },
      { title: "全参、LoRA 与 QLoRA", en: "Adaptation Methods", explanation: "全参更新全部权重，投资和制品管理最重；LoRA 学习低秩增量，便于多 Adapter；QLoRA 在量化基座上训练 Adapter，降低显存但增加数值和部署组合。", decision: "按能力变化、数据量、算力和部署约束选择最小充分方法。", boundary: "参数效率不等于数据要求低或质量自动保持，结果取决于任务与基座。", sourceIds: ["lora-2021", "qlora-2023"] },
      { title: "数据先满足对话格式，再谈数量", en: "Dataset & Chat Template", explanation: "训练样本要明确是文本、提示—回答、对话还是偏好对，并使用与基座模型一致的角色和聊天模板。还要覆盖真实输入、拒答、边界和困难切片，与评估集隔离并保留来源、许可、去重和版本。", decision: "先用少量高价值样本跑通格式和学习目标，再扩大数量。", boundary: "模板或特殊 Token 错误会让模型学到错误边界；合成数据也会复制教师偏差。", sourceIds: ["hf-trl-data-formats", "hf-trl-chat-templates", "nist-genai-profile"] },
      { title: "训练曲线用于诊断，不是成绩单", en: "Training Diagnostics", explanation: "训练与评估 Loss、学习率、梯度、吞吐和样本切片共同帮助判断欠拟合、过拟合、数据异常和数值问题。曲线变化要与固定任务集的目标行为、通用能力和安全表现一起解释。", decision: "每个训练实验只改变少量关键变量，并完整记录数据、代码、超参数和环境。", boundary: "训练 Loss 下降只能说明更贴近训练目标，不能证明线上任务或安全表现变好。", sourceIds: ["hf-trl-sft-trainer", "nist-genai-profile"] },
      { title: "SFT 用示范建立基本行为", en: "Supervised Fine-tuning", explanation: "SFT 让模型从高质量示范学习任务步骤、格式、风格、拒答和边界。它适合期望答案可直接写出的场景，也是进一步做偏好或奖励训练前的常见起点。", decision: "用未见任务和原有能力回归决定是否继续训练。", boundary: "更低验证 Loss 不一定对应更好的业务偏好、安全或推理稳定性。", sourceIds: ["instructgpt-2022", "hf-trl-sft-trainer"] },
      { title: "偏好优化与可验证奖励", en: "Preference & Verifiable Reward", explanation: "DPO 用 chosen / rejected 偏好对改变相对倾向；RLVR 或奖励微调要求结果能被规则、执行器或可靠 Grader 验证。采用前要检查 Grader 一致性、奖励投机、独立留出集以及域外行为和安全回归。", decision: "好坏可比较用偏好优化；结果可验证且奖励抗投机时才考虑奖励训练。", boundary: "高 Reward 不等于真实正确率，RLVR 也不取代高质量示范、开放任务人工量尺或通用能力回归。", sourceIds: ["deepseek-r1-2025", "dpo-2023", "hf-trl-dpo-trainer", "nist-genai-profile"] },
      { title: "托管与自建交换的是控制和责任", en: "Managed vs Self-hosted", explanation: "托管服务减少环境、调度和服务化负担，但会限定模型、训练方法、区域和可观察细节；自建提供更多控制，也要承担算力、镜像、分布式、故障恢复、制品安全和推理兼容。", decision: "按数据边界、方法灵活性、团队能力和持续运营成本选型。", boundary: "能提交训练任务不表示训练数据、部署区域和基础模型都满足要求。", sourceIds: ["nist-genai-profile", "lora-2021"] },
      { title: "四层评估决定是否值得发布", en: "Evaluation & Release", explanation: "数据层检查覆盖与泄漏，训练层检查收敛与稳定，任务层比较目标、未见切片、通用能力和安全拒答，服务层检查延迟、吞吐、显存和成本。所有结果都要相对同一基座和更轻方案比较。", decision: "以分层证据和实际业务收益决定发布，不用单一平均分。", boundary: "目标提升可能伴随灾难性遗忘，小样本提升也可能无法稳定复现。", sourceIds: ["nist-genai-profile", "openai-eval-best-practices"] },
      { title: "Adapter 是需要治理的发布制品", en: "Adapter Operations", explanation: "Adapter 要绑定基础模型、Tokenizer、聊天模板、量化、推理运行时、训练数据和评估报告。动态加载便于多版本和回滚；合并权重简化单模型部署但会产生新的完整制品。", decision: "把训练、评估、服务、灰度和回滚信息写入同一发布清单。", boundary: "更换基座或模板后不能假设原 Adapter 的行为、兼容与安全表现不变。", sourceIds: ["lora-2021", "qlora-2023", "hf-trl-peft"] },
    ],
  },
  "llm-training": {
    lead: "大模型训练是数据、目标函数、分布式系统和评估共同驱动的长期实验，不是简单地增加参数与 GPU。",
    chapters: [
      { title: "训练全景与阶段目标", en: "Training Pipeline", explanation: "预训练学习通用模式，SFT 学习按示范工作，偏好优化学习相对好坏，推理强化使用可验证奖励塑造搜索与解题。每阶段的数据、损失和评估都不同。", decision: "为每个阶段写清新增能力、数据来源和退出门槛。", boundary: "阶段名称相同不代表厂商使用相同数据、算法或效果。", sourceIds: ["instructgpt-2022", "dpo-2023"] },
      { title: "数据、去重与分词", en: "Data Foundation", explanation: "数据来源、质量、混合比例、去重、污染、过滤和 Tokenizer 决定模型看到什么以及如何表示。重复数据会浪费计算并放大记忆，评估污染会产生虚假能力。", decision: "把数据版本和治理证据作为训练制品的一部分。", boundary: "更多原始数据不等于更多有效学习信号，过滤也可能删除少数语言和专业内容。", sourceIds: ["chinchilla-2022", "nist-genai-profile"] },
      { title: "预训练、Scaling 与 MoE", en: "Pretraining", explanation: "下一个 Token 预测从大规模语料学习统计结构。Scaling Law 描述特定设定下模型、数据和计算的经验关系；MoE 增加总参数但只激活部分专家，改变通信和负载。", decision: "用计算最优与数据可得性约束规模，不以单一参数量设目标。", boundary: "经验 Scaling 关系不能直接外推到任意数据质量、架构、语言和预算。", sourceIds: ["chinchilla-2022", "nist-genai-profile"] },
      { title: "SFT、RLHF 与 DPO", en: "Alignment", explanation: "SFT 建立基本指令行为；RLHF 用奖励模型和强化学习优化偏好；DPO 用成对偏好直接优化。选择取决于目标是否可示范、可比较或需要在线探索。", decision: "从最简单能验证目标的方法开始，并保留基座能力回归。", boundary: "对齐提高期望行为概率，不会产生绝对安全或消除事实错误。", sourceIds: ["instructgpt-2022", "dpo-2023"] },
      { title: "推理训练与可验证奖励", en: "Reasoning Training", explanation: "推理训练可以组合冷启动示范、强化学习、再监督与蒸馏；可验证奖励适合数学、代码等有明确判定的问题，开放任务仍需要谨慎的量尺与人工判断。实验要同时检查 Reward、未见任务、奖励投机和服务成本。", decision: "只有验证器可靠且任务价值能覆盖训练与推理成本时采用推理强化。", boundary: "强化学习不是独立解决一切的阶段，更长内部推理也不保证正确，隐藏思维链不能充当外部审计依据。", sourceIds: ["deepseek-r1-2025", "openai-model-spec-hidden-cot", "nist-genai-profile"] },
      { title: "并行、通信与 Checkpoint", en: "Distributed Systems", explanation: "数据、张量、流水线和专家并行在显存、通信、气泡和实现复杂度间取舍。长训练还受数据加载、网络、存储、Checkpoint 和故障恢复影响，应报告有效训练时间而非只看 GPU 小时。", decision: "先用剖析定位计算、通信和 I/O，再调整并行或集群。", boundary: "卡数翻倍不会带来线性加速，短时吞吐也不代表长作业稳定。", sourceIds: ["opentelemetry-semconv", "nist-genai-profile"] },
      { title: "评估与发布门", en: "Training Evidence", explanation: "每个阶段都要比较未见任务、关键切片、安全、能力保留、资源和不确定性。训练结束只是候选制品产生，仍需推理部署、线上影子和持续监控。", decision: "用预先定义的证据门决定继续训练、回退数据或进入发布。", boundary: "公开基准提升不能替代客户任务、服务性能和风险验证。", sourceIds: ["nist-genai-profile"] },
    ],
  },
  "llm-inference": {
    lead: "推理优化要同时管理单请求阶段、多请求调度、模型质量、硬件内存和生产可靠性。",
    chapters: [
      { title: "Prefill、Decode 与服务指标", en: "Request Lifecycle", explanation: "Prefill 并行处理输入，决定首 Token 前的大部分计算；Decode 逐 Token 生成，受内存带宽和串行循环影响。TTFT、TPOT/ITL、总时延和吞吐分别描述不同体验。", decision: "按交互意图选择指标，不用平均响应时间概括所有阶段。", boundary: "客户端首字还会受网关缓冲、网络和渲染影响，不能只看引擎内部。", sourceIds: ["vllm-2023", "opentelemetry-semconv"] },
      { title: "KV Cache 与显存账", en: "Runtime Memory", explanation: "权重决定固定内存，KV Cache 随层数、头维度、序列和并发增长，激活、工作区和碎片也占空间。模型权重放得下只说明能加载，不代表有足够并发和稳定余量。", decision: "分别计算权重、KV、运行时和安全余量，再谈并发。", boundary: "缓存公式依赖架构与精度，最大上下文不能与最大并发同时兑现。", sourceIds: ["vllm-2023"] },
      { title: "连续批处理、分页与前缀缓存", en: "Scheduling, Paging & Prefix Cache", explanation: "连续批处理动态加入和退出请求，PagedAttention 以块管理 KV，前缀缓存复用相同开头的已计算 KV。验收要测前缀命中率、缓存局部性、租户隔离、P95 和总体 Goodput，而不是只看单一 Tokens/s。", decision: "按真实前缀重复度和负载分布决定缓存、路由与批处理策略。", boundary: "前缀缓存主要减少命中部分的 Prefill，不会缩短新 Token 的长 Decode；跨租户复用还需明确公共内容和隔离。", sourceIds: ["vllm-2023", "vllm-prefix-caching"] },
      { title: "框架与服务栈", en: "Inference Engines", explanation: "推理引擎负责算子、内存、调度和模型执行；服务层还需 API、路由、认证、发布、观测和多租户；平台层管理设备、容量与恢复。框架选型应基于模型支持和目标硬件。", decision: "区分引擎、模型服务和完整平台的责任。", boundary: "安装 vLLM 或同类引擎不等于具备生产多租户、安全和运营能力。", sourceIds: ["vllm-2023", "kubernetes-dra"] },
      { title: "量化与质量账", en: "Quantization", explanation: "降低权重或激活精度可减少内存与带宽，并腾出 KV 空间；收益取决于硬件内核、量化格式和工作负载。质量损失可能集中在少数任务、长上下文或异常输入。", decision: "在目标硬件和客户任务集上同时测质量、延迟、吞吐与稳定。", boundary: "更小不等于必然更快，也不能把公开平均精度损失外推到客户关键切片。", sourceIds: ["vllm-2023", "nist-genai-profile"] },
      { title: "投机解码与算法加速", en: "Speculative Decoding", explanation: "小模型、同模型多头或检索草稿可先提出多个 Token，再由目标模型验证，从而减少串行步骤。接受率、草稿成本和验证并行度决定收益，任务分布变化会改变效果。", decision: "先测接受率和端到端尾延迟，再决定是否增加复杂度。", boundary: "投机解码不改变目标分布的前提依赖正确实现，也不解决 Prefill 或容量全部问题。", sourceIds: ["vllm-2023"] },
      { title: "P/D 分离与分布式推理", en: "Disaggregated Serving", explanation: "Prefill 和 Decode 资源画像不同，分离可独立扩容并减少干扰，但会引入 KV 传输、调度和网络依赖。验收应在 TTFT 与 TPOT 双重 SLO 下比较 Goodput，而不是只比较聚合吞吐。", decision: "只有阶段资源冲突或模型规模确实需要时采用分布式复杂度。", boundary: "网络、KV 传输和调度开销可能抵消收益，论文结果不能跨硬件和负载直接照搬。", sourceIds: ["distserve-2024", "vllm-2023"] },
      { title: "容量、SLO 与故障恢复", en: "Production Serving", explanation: "短交互、长上下文、Agent 和批处理需要不同容量基线。生产还要验证冷启动、模型加载、节点故障、限流、降级、版本灰度和恢复后业务正确性。", decision: "用分层负载曲线和尾部 SLO 决定资源池与余量。", boundary: "自动重启只恢复进程或容量，不证明请求状态、缓存和业务副作用已正确恢复。", sourceIds: ["opentelemetry-semconv", "nist-genai-profile"] },
    ],
  },
  "data-engineering": {
    lead: "AI 数据工程要把原始资料变成有结构、权限、版本、质量和可追溯性的长期数据产品。",
    chapters: [
      { title: "数据就绪度与契约", en: "Data Readiness", explanation: "来源所有者、业务语义、格式、更新、权限、地域、保留和质量目标构成数据契约。先确认权威版本和使用目的，才能决定解析、索引、评估或训练。", decision: "把数据问题写成可验证契约，不用‘数据很乱’作为永久状态。", boundary: "同一数据用于 RAG、评估和训练时，许可、时效和泄漏风险并不相同。", sourceIds: ["nist-genai-profile", "nist-zero-trust"] },
      { title: "文档解析与结构恢复", en: "Document Parsing", explanation: "抽取不仅是文字识别，还包括版面、阅读顺序、表格、标题、页码、图片和元数据。通用解析器、文档 AI 和视觉语言模型各有优势，应按文档分层组合。", decision: "用客户最难版式验证结构和证据定位，不只测字符准确率。", boundary: "OCR 识别出所有数字也不能证明表格行列和业务含义正确。", sourceIds: ["docling-report", "pp-ocr-2020"] },
      { title: "连接器与增量同步", en: "Connect & Sync", explanation: "连接器需要认证、分页、增量游标、重试、幂等、限流、删除和权限事件。批量适合低频全量，CDC 或事件适合及时变化，但都需要对账和重建路径。", decision: "由业务新鲜度和源系统能力选择同步模式，并保留全量校验。", boundary: "API 返回成功不代表所有对象、权限和删除都已完整传播。", sourceIds: ["nist-zero-trust", "opentelemetry-semconv"] },
      { title: "切分、Embedding 与索引", en: "Retrieval Preparation", explanation: "切分决定语义单元和证据边界，Embedding 提供向量表示，索引在召回、延迟、内存和更新之间取舍。元数据、权限和版本过滤应与向量召回共同设计。", decision: "按任务和文档结构调切分与索引，而不是先采购向量库。", boundary: "HNSW 等 ANN 算法解决相似搜索，不负责权威版本、权限或答案正确。", sourceIds: ["hnsw-2016", "nist-zero-trust"] },
      { title: "质量、血缘与反馈", en: "Data Quality", explanation: "完整性、正确性、时效、唯一性和可追溯需要在管道各阶段测量。回答失败应区分源数据缺失、解析错误、切分、权限、索引和模型问题，把可修复样本回到责任层。", decision: "优先修复产生错误的数据机制，不用 Prompt 补丁长期掩盖。", boundary: "模型或解析器置信度不是事实正确率，阈值必须用客户材料校准。", sourceIds: ["docling-report", "nist-genai-profile"] },
      { title: "标注、合成与双线运营", en: "Label & Synthesize", explanation: "专家标注建立权威样本，弱监督和合成扩展覆盖。坏案例可进入数据修复线或模型/应用评估线，两条线共享身份和来源，但不能让自动生成结果未经裁决成为真值。", decision: "把专家时间投入高风险、争议和校准样本。", boundary: "合成数据会继承教师和提示偏差，规模扩大前必须抽样审核。", sourceIds: ["nist-genai-profile"] },
      { title: "权限、删除与生命周期", en: "Governance", explanation: "权限要在查询时结合当前主体执行，删除和撤权要传播到缓存、对象、切块、Embedding、索引和评估资产。血缘与完成证明帮助审计传播窗口和例外。", decision: "为所有派生层定义传播 SLO、重试和验证。", boundary: "删除源文档不表示训练权重自动遗忘，法律保留冲突需要数据所有者裁决。", sourceIds: ["nist-zero-trust", "hnsw-2016"] },
    ],
  },
  "ai-infra-platform": {
    lead: "AI 基础设施平台把异构设备、调度、共享、环境、恢复和服务化变成可重复运营能力。",
    chapters: [
      { title: "平台职责与资源契约", en: "Platform Duties", explanation: "平台负责设备发现、资源声明、队列、环境、数据通路、故障恢复、服务发布和观测。工作负载需要声明设备、拓扑、网络、存储、镜像和时间约束，调度器才能做正确匹配。", decision: "先定义工作负载与平台契约，再选择 Kubernetes、Slurm 或托管形态。", boundary: "安装编排器不能自动形成数据、模型和业务全生命周期平台。", sourceIds: ["kubernetes-dra", "nvidia-gpu-operator"] },
      { title: "Kubernetes GPU 栈", en: "Device Plugin, DRA, Operator", explanation: "Device Plugin 提供传统设备资源，DRA 核心 API 已在 Kubernetes 1.34 进入稳定 v1，用 ResourceClaim 与驱动表达更丰富的设备选择和准备；GPU Operator 管理驱动、插件和监控等运行栈。三者位于不同层。", decision: "把 DRA GA 视作可采用的资源模型，再按集群版本、驱动和目标能力逐项验证迁移。", boundary: "核心 API 稳定不代表所有新增特性、设备驱动和厂商支持都已 GA；DRA 也不替代队列、模型服务或业务授权。", sourceIds: ["kubernetes-dra-1-34-ga", "kubernetes-dra", "nvidia-gpu-operator"] },
      { title: "队列、Gang 与碎片", en: "Scheduling", explanation: "分布式作业需要多设备同时可用，Gang Scheduling 避免部分启动；配额、优先级、抢占、拓扑和不同请求形状会造成空闲但不可调度。利用率与作业完成时间必须一起看。", decision: "用排队原因和业务优先级优化，不机械追求满载。", boundary: "抢占会浪费进度并增加恢复压力，碎片也不一定能靠时间共享解决。", sourceIds: ["kubernetes-dra", "opentelemetry-semconv"] },
      { title: "GPU 切分与多租户", en: "MIG, Time-slicing, MPS", explanation: "整卡隔离最强，MIG 提供硬件分区，时间共享提升利用但干扰更大，MPS 等机制改善并发执行。选择要考虑显存、计算、故障、侧信道、可预测性和作业特性。", decision: "按隔离和 SLO 选择共享方式，并对干扰做压力测试。", boundary: "逻辑配额不等于性能隔离，切分也可能增加碎片和调度复杂度。", sourceIds: ["nvidia-gpu-operator", "nist-zero-trust"] },
      { title: "训练容错与 Checkpoint", en: "Resilience", explanation: "大规模长作业把节点故障变成常态。Checkpoint 周期在写入成本与丢失进度间取舍，自愈还要恢复数据游标、随机状态、优化器和拓扑，并验证结果连续。", decision: "用失败率、恢复时间和有效训练进度共同设置策略。", boundary: "Pod 重启或节点替换不表示训练状态已经正确恢复。", sourceIds: ["opentelemetry-semconv", "nvidia-gpu-operator"] },
      { title: "利用率、MFU 与 Goodput", en: "Observability", explanation: "设备利用率只说明某时段有工作，MFU 衡量有效模型计算，Goodput 关注满足 SLO 的有效工作。排队、数据等待、通信、Checkpoint、重试和不合格输出都可能让表面忙碌失去价值。", decision: "用作业与业务有效产出解释资源指标。", boundary: "不同工具和框架口径不完全一致，跨团队比较前必须统一定义。", sourceIds: ["opentelemetry-semconv", "nvidia-gpu-operator"] },
      { title: "推理平台化与发布", en: "Serving Platform", explanation: "推理服务需要模型仓库、引擎、路由、自动扩缩、灰度、配额、观测和回滚。训练调度追求长作业吞吐和恢复，推理调度更关注尾延迟、优先级和弹性，通常需要不同资源池。", decision: "共享底层设备治理，分开设计训练与在线服务 SLO。", boundary: "同一集群混部能提高共享，但批处理作业可能破坏在线容量保障。", sourceIds: ["vllm-2023", "kubernetes-dra"] },
    ],
  },
  "ai-infra-compute": {
    lead: "AI 算力是一条从模型数值、加速器和内存到互联、存储、电力与软件生态的完整数据通路。",
    chapters: [
      { title: "工作负载画像与五层栈", en: "Workload First", explanation: "训练、在线推理、长上下文、批处理和 Agent 对计算、内存、网络和时延要求不同。模型、精度、序列、批量、并行、数据、SLO 和增长构成容量输入。", decision: "先冻结负载假设和验收方法，再比较硬件。", boundary: "用参数量或卡数直接报价会遗漏 KV、激活、并行和运营余量。", sourceIds: ["vllm-2023", "nist-genai-profile"] },
      { title: "GPU、精度与 Roofline", en: "Compute & Precision", explanation: "Tensor Core 等单元提供低精度矩阵计算，Roofline 用计算峰值和内存带宽判断工作负载偏计算还是带宽受限。精度改变吞吐、内存和质量，软件内核决定能否接近硬件能力。", decision: "用目标算子和框架剖析判断瓶颈，不按峰值 FLOPS 排名。", boundary: "厂商峰值通常基于特定精度和稀疏条件，不能直接代表端到端持续性能。", sourceIds: ["flashattention-2022", "nist-genai-profile"] },
      { title: "HBM 与内存层级", en: "Memory System", explanation: "权重、激活、优化器和 KV Cache 占用不同；HBM 容量决定能否放下，带宽决定大量搬运的速度，主机内存和本地存储影响加载与溢出。训练和推理需要分别记账。", decision: "同时评估容量、带宽、碎片和安全余量。", boundary: "显存更大解决容量，不必然提供更高带宽、互联或端到端速度。", sourceIds: ["flashattention-2022", "vllm-2023"] },
      { title: "芯片、软件生态与异构", en: "Accelerator Choice", explanation: "GPU、云自研 ASIC 和其他加速器在硬件、编译器、算子、框架、调试和人才生态上共同竞争。迁移成本来自模型支持、内核、运维和供应，而不只是重编译。", decision: "用代表模型跑通训练/推理、故障和升级全链，再考虑规模采购。", boundary: "一次 benchmark 成功不能证明全部模型、算子和未来版本兼容。", sourceIds: ["nvidia-gpu-operator", "nist-genai-profile"] },
      { title: "Scale-up 节点内互联", en: "Scale-up", explanation: "当模型或并行状态跨设备时，节点内高带宽互联和交换减少同步成本。拓扑、链路带宽、集合通信和内存访问共同影响可扩展性，设备数增加会放大通信。", decision: "根据并行策略和通信画像选择节点内规模。", boundary: "互联规格高不等于目标框架能持续利用，单节点结果也不能外推多节点。", sourceIds: ["nvidia-gpu-operator", "flashattention-2022"] },
      { title: "Scale-out 网络与集合通信", en: "Scale-out", explanation: "多节点训练和分布式推理依赖 RDMA、拥塞控制、拓扑和集合通信。IB 与 RoCE 等路线的差别还包括运营经验、可观测、故障域和现有网络，而非只有峰值带宽。", decision: "用 AllReduce/All-to-All 和真实作业长跑验证网络设计。", boundary: "短时链路测试不会暴露拥塞、尾延迟、故障恢复和跨租户干扰。", sourceIds: ["opentelemetry-semconv", "nist-genai-profile"] },
      { title: "存储、数据管线与供电", en: "Feed the Cluster", explanation: "训练读取、Checkpoint、模型分发和推理加载需要对象、并行文件系统、本地缓存和网络协同。电力、散热、机柜密度和交付周期决定物理可部署规模。", decision: "把数据到设备的持续吞吐和恢复路径纳入容量验收。", boundary: "缓存后的稳态速度不能掩盖首次加载、数据更新、故障恢复和峰值供电。", sourceIds: ["nvidia-gpu-operator", "opentelemetry-semconv"] },
      { title: "算力经济与采购证据", en: "TCO & Supply", explanation: "采购、长期租用、按需云和模型 API 分别承担资本、利用率、弹性和运维风险。TCO 还包括软件适配、网络存储、能耗、闲置、故障、人才和供应周期。", decision: "用每个达标训练或推理结果的全成本和交付风险比较。", boundary: "当前小时价、一次库存和单次 benchmark 都不能代表长期可交付容量。", sourceIds: ["nist-genai-profile", "vllm-2023"] },
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
