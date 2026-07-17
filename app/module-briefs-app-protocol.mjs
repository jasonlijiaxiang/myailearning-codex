export const solutionPatternsBrief = {
  slug: "solution-patterns",
  definition:
    "场景解决方案（Solution Pattern）把客户目标、业务流程、数据、风险与技术能力组织成可验证、可采购、可运营的实施路径。",
  position:
    "位于方案与选型层，负责从客户问题进入知识库，再把 RAG、Agent、多模态、模型、数据与云平台组合成端到端方案。",
  presentation: "decision",
  principleTitle: "从客户结果出发，而不是从产品清单出发",
  principles: [
    {
      zh: "需求决策契约",
      en: "Decision Contract",
      explanation:
        "在讨论架构前先确认业务结果（Outcome）、使用者与责任人（User & Owner）、数据与权利（Data & Rights）、风险边界（Risk）。",
      decision:
        "四项中有一项无法回答时，先补需求发现，不急于推荐模型或云产品。",
    },
    {
      zh: "场景与能力组合",
      en: "Scenario × Building Blocks",
      explanation:
        "一个方案通常由检索、生成、行动、多模态理解、数据工程、模型服务和工程保障共同组成，而不是单一模型 API。",
      decision:
        "先判断问题需要检索、生成、行动还是它们的组合，再映射到技术与云服务。",
    },
    {
      zh: "分阶段交付门",
      en: "Delivery Gates",
      explanation:
        "价值验证、技术 PoC、非功能试点和生产运营分别回答值得做、能否做、能否稳定运行、能否长期负责。",
      decision:
        "上一阶段未形成可验证结论时，不以扩大资源投入代替问题澄清。",
    },
    {
      zh: "真实数据验收",
      en: "Evidence-based Acceptance",
      explanation:
        "PoC 应使用有代表性的真实数据，并提前约定指标、通过线、失败样本和复测规则。",
      decision:
        "只在演示数据上表现良好的方案，不能直接进入生产承诺和容量报价。",
    },
    {
      zh: "全成本视角",
      en: "Total Cost of Ownership",
      explanation:
        "成本同时来自模型与 Token、并发和基础设施、集成与人工运营；初始 API 单价只是其中一部分。",
      decision:
        "用每个成功业务任务的成本评估方案，而不是只比较每百万 Token 的价格。",
    },
  ],
  decisions: [
    {
      question: "这个需求已经适合进入方案设计了吗？",
      signal:
        "客户能说清目标用户、当前流程、成功结果、数据来源、责任人和不可接受风险。",
      recommendation:
        "形成一页需求决策契约，并把未知项列为验证假设。",
      boundary:
        "“想用大模型”不是业务结果；没有负责人和验收方式的需求仍处于探索期。",
    },
    {
      question: "应该选择检索、生成、行动还是组合方案？",
      signal:
        "问题是否依赖企业知识、是否要改变外部系统状态、输入是否包含文档/图像/语音，以及错误是否可逆。",
      recommendation:
        "知识取证优先 RAG，跨系统执行考虑 Agent，非文本理解考虑多模态；必要时组合，但为每个能力定义清晰责任。",
      boundary:
        "不要因为平台具备某项能力，就把它加入所有场景。",
    },
    {
      question: "PoC 应验证什么？",
      signal:
        "客户已提供代表性样本、人工基线、业务指标和风险样本。",
      recommendation:
        "同时验证任务质量、P95 时延、失败恢复、安全边界和每个成功任务成本。",
      boundary:
        "演示流畅、单个样例正确或公开 Benchmark 较高都不能单独构成验收。",
    },
    {
      question: "先用托管服务还是自建？",
      signal:
        "比较上线速度、数据与网络边界、定制深度、团队运维能力、规模和现有云资产。",
      recommendation:
        "不确定阶段先用托管能力缩短验证周期；当规模、合规或差异化足以覆盖运维成本时再评估自建。",
      boundary:
        "托管与开源不是绝对二选一，自定义框架也可以运行在托管容器和云基础设施上。",
    },
    {
      question: "报价应怎样避免低估？",
      signal:
        "已有请求量、峰值并发、上下文长度、工具调用次数、数据增量、人工审核和可用性目标。",
      recommendation:
        "分别建立模型、平台资源、集成、评估安全和人工运营成本模型，并给出规模变化的敏感性区间。",
      boundary:
        "PoC 账单不能直接外推生产 TCO；失败重试、峰值容量和人工接管必须计入。",
    },
  ],
  criticalBoundary:
    "场景解决方案不是把产品图标排成架构图，而是把客户结果、责任边界、可验证指标和可运营控制连接起来；Demo 成功不等于生产可用。",
  cloudHooks: [
    {
      stage: "接入与身份（Access & Identity）",
      services: "API Gateway、IAM、OAuth/OIDC、私网接入、密钥管理",
      value: "统一入口、身份传递、流量控制和审计边界。",
      discover: "客户现有渠道、租户模型、身份源、网络区和 API 管理体系是什么？",
    },
    {
      stage: "编排与执行（Orchestration & Execution）",
      services: "Serverless、容器、工作流、消息队列、事件总线、Agent Runtime",
      value: "承载确定性流程、异步任务、弹性执行和失败恢复。",
      discover: "哪些步骤同步完成，哪些可异步；哪些动作需要审批、补偿或人工接管？",
    },
    {
      stage: "模型与数据（Models & Data）",
      services: "模型服务、向量检索、搜索、数据库、对象存储、数据集成",
      value: "把模型能力和企业知识、业务事实及多模态资产连接起来。",
      discover: "数据位于哪里、如何更新、由谁授权，是否要求地域、加密和删除？",
    },
    {
      stage: "工程保障（Engineering Assurance）",
      services: "评估平台、内容安全、DLP、Tracing、日志、监控、FinOps",
      value: "把质量、风险、成本和可用性转成持续运营控制面。",
      discover: "上线门槛、零容忍错误、SLA、审计周期和成本责任人分别是什么？",
    },
  ],
  relatedSlugs: [
    "model-landscape",
    "rag",
    "ai-agent",
    "multimodal",
    "ai-gateway",
    "evaluation",
    "security",
    "ai-ops",
  ],
  qa: [
    {
      q: "场景解决方案和直接采购模型 API 有什么区别？",
      a: "模型 API 只提供一项能力；场景解决方案还要解决数据、流程、身份、工具、验收、安全和运营责任。",
      depth:
        "例如企业客服不仅需要模型回答，还要连接知识库、识别用户权限、调用工单系统、处理失败与人工升级，并持续评估解决率和风险。售前方案应说明每层由谁负责、如何验收，而不是只展示模型能力。",
      ask: "追问客户：最终要改变哪个业务指标？哪些系统状态可以证明任务完成？",
      tag: "方案边界",
      basis: "场景架构 + 风险治理",
      evidence: [
        {
          sourceId: "anthropic-effective-agents",
          supports: "支持根据任务复杂度选择简单工作流或 Agent，而不是默认堆叠自治能力。",
        },
        {
          sourceId: "nist-genai-profile",
          supports: "支持从治理、测量和管理角度覆盖生成式 AI 全生命周期风险。",
        },
      ],
    },
    {
      q: "一个 PoC 做到什么程度才值得进入生产试点？",
      a: "真实数据上的任务质量达到约定线，并且关键失败模式、时延、成本、安全和恢复路径已经被验证。",
      depth:
        "先冻结代表性样本和业务基线，再约定质量、P95、成本和零容忍风险。PoC 不必模拟全部生产规模，但必须证明架构不会在权限、失败恢复和运营责任上留下未知黑洞。",
      ask: "追问客户：谁签署验收？哪些错误即使很少发生也不可接受？",
      tag: "PoC 验收",
      basis: "应用评估 + 发布门禁",
      evidence: [
        {
          sourceId: "nist-genai-profile",
          supports: "支持按场景风险设置部署前后评估与 Go/No-Go 决策。",
        },
        {
          sourceId: "ragas",
          supports: "支持将 RAG 质量拆解为可诊断的检索与生成维度。",
        },
      ],
    },
    {
      q: "为什么不能按模型 Token 单价直接报价？",
      a: "因为客户购买的是成功完成的业务任务，真实成本还包括多轮调用、工具、检索、并发资源、失败重试、评估安全和人工运营。",
      depth:
        "相同模型在不同上下文长度、轨迹深度和缓存策略下成本差异很大。应以每个成功任务成本为主指标，并给出峰值并发、失败率和人工接管率变化时的成本区间。",
      ask: "追问客户：日均与峰值任务量、任务长度、成功率目标和人工复核比例是多少？",
      tag: "TCO",
      basis: "任务成本模型 + 可观测数据",
      evidence: [
        {
          sourceId: "opentelemetry-semconv",
          supports: "支持用标准化遥测关联模型、工具调用、时延和使用量。",
        },
        {
          sourceId: "anthropic-effective-agents",
          supports: "支持自治循环会增加成本与复合错误，需要相应控制。",
        },
      ],
    },
    {
      q: "客户有很多想法，应该从哪个场景开始？",
      a: "优先选择价值明确、数据可得、风险可控、结果可验证且能在有限周期内闭环的场景。",
      depth:
        "高频不一定等于高价值，技术可行也不一定适合首发。可以按业务价值、数据准备度、集成复杂度、错误可逆性和责任人意愿排序，先做能积累评估集和运营能力的场景。",
      ask: "追问客户：哪个问题现在有人持续付出成本解决，并且结果能被系统或负责人验证？",
      tag: "场景选择",
      basis: "价值发现 + 风险分级",
      evidence: [
        {
          sourceId: "nist-genai-profile",
          supports: "支持按用途、影响对象与风险上下文进行治理和优先级判断。",
        },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "场景 × 能力",
      title: "方案不是单一模型",
      finding: "客户场景需要把模型、数据、流程、身份、工具和工程保障组合为可运行系统。",
      boundary: "能力越多并不必然更好，每一层都必须对应明确需求和责任。",
      sourceId: "anthropic-effective-agents",
      accent: true,
    },
    {
      metric: "价值 → 运营",
      title: "分阶段设置交付门",
      finding: "价值、技术、非功能和运营问题应分别验证，避免把 Demo 成功直接解释为生产可用。",
      boundary: "阶段划分是交付方法，不是固定项目周期；应根据风险调整。",
      sourceId: "nist-genai-profile",
    },
    {
      metric: "真实数据",
      title: "验收建立在客户样本上",
      finding: "公开 Benchmark 适合初筛，客户 Golden Set 和真实流程才决定场景可用性。",
      boundary: "评估集需要代表高价值、边界和失败样本，不能只选容易问题。",
      sourceId: "ragas",
    },
    {
      metric: "每个成功任务",
      title: "用业务单位计算 TCO",
      finding: "把模型、工具、基础设施、失败重试和人工运营合并，才能比较方案的真实经济性。",
      boundary: "成本结论依赖客户负载和架构，不能把单一 PoC 账单外推为采购承诺。",
      sourceId: "opentelemetry-semconv",
    },
  ],
};

export const multimodalBrief = {
  slug: "multimodal",
  definition:
    "多模态 AI（Multimodal AI）让系统理解或生成文本之外的图像、文档、语音与视频，并把不同模态的信息用于同一业务任务。",
  position:
    "位于应用模式层，负责非文本信息的感知与内容生成；可为 RAG 提供可检索内容，也可为 Agent 提供环境感知和交互通道。",
  presentation: "pipeline",
  principleTitle: "先判断任务，再决定原生多模态还是专业管线",
  principles: [
    {
      zh: "理解与生成分离",
      en: "Understanding vs Generation",
      explanation:
        "图像问答、文档理解、语音识别属于理解；图像、视频和语音合成属于生成，两者模型、指标、价格和风险不同。",
      decision:
        "分别定义输入、输出、验收指标和治理流程，不以“支持多模态”概括全部能力。",
    },
    {
      zh: "视觉标记化",
      en: "Visual Tokenization",
      explanation:
        "视觉 Transformer（ViT）把图像切成 Patch 并转换为视觉 Token；分辨率、裁剪和 Patch 规模会影响细节、上下文和成本。",
      decision:
        "小字、图表和复杂页面需要针对分辨率与区域切分测试，不能只看普通图片样例。",
    },
    {
      zh: "跨模态语义对齐",
      en: "Cross-modal Alignment",
      explanation:
        "CLIP 等对比学习路线把图像与文本映射到共享语义空间，为跨模态检索、分类和视觉语言模型提供基础。",
      decision:
        "语义相似不等于事实一致；检索、分类和生成需要分别验收。",
    },
    {
      zh: "原生与管线互补",
      en: "Native vs Pipeline",
      explanation:
        "原生多模态适合开放理解和跨模态推理；OCR/ASR→文本模型管线更容易审计、替换和优化固定任务。",
      decision:
        "固定字段、强审计和成本敏感场景优先专业管线，复杂开放问题再使用原生模型或混合回退。",
    },
    {
      zh: "输入契约与来源定位",
      en: "Input Contract & Provenance",
      explanation:
        "生产系统应保留原始资产、转换过程、编码方式、页码/区域/时间位置和模型输出之间的关系。",
      decision:
        "无法定位到原始页面、图像区域或音视频时间段的输出，不应作为高风险业务证据。",
    },
    {
      zh: "实时交互闭环",
      en: "Real-time Interaction Loop",
      explanation:
        "实时语音不仅是 ASR 和 TTS，还包括端点检测、轮次判断、打断、网络传输、状态同步和失败恢复。",
      decision:
        "按端到端首响、打断成功和任务完成评估体验，而不是只比较单个模型速度。",
    },
  ],
  decisions: [
    {
      question: "这个任务真的需要多模态模型吗？",
      signal:
        "关键信息只存在于布局、图表、图像、声学特征或视频时序中，纯文本转写会丢失任务所需信息。",
      recommendation:
        "先定义文本方案无法解决的具体信息缺口，再引入对应模态能力。",
      boundary:
        "只是上传图片或附件，不代表需要原生多模态；固定 OCR 可能更便宜、更稳定。",
    },
    {
      question: "选择原生多模态还是 OCR/ASR 管线？",
      signal:
        "任务是固定抽取与审计，还是开放问答、跨区域关联和语义推理。",
      recommendation:
        "固定任务用专业解析管线，开放任务用原生模型；生产中常采用管线主干加原生模型处理例外。",
      boundary:
        "原生模型能读取文档，不代表能稳定替代所有版面解析、表格抽取和字段校验。",
    },
    {
      question: "托管 API 还是自托管视觉语言模型？",
      signal:
        "比较数据敏感度、规模、时延、定制需求、硬件利用率和团队推理运维能力。",
      recommendation:
        "验证阶段优先托管 API；稳定高负载、数据边界或定制充分时再评估 GPU 自托管。",
      boundary:
        "自托管模型权重不等于获得完整文档解析、弹性、监控和安全能力。",
    },
    {
      question: "实时语音选择级联还是端到端语音模型？",
      signal:
        "客户更看重可审计、模块可替换和术语控制，还是自然打断、情感和低交互延迟。",
      recommendation:
        "强控制场景优先 ASR→LLM→TTS 级联；自然交互优先端到端语音，并为敏感动作增加结构化确认。",
      boundary:
        "更自然的声音不等于更高任务成功率；电话网络、VAD、工具时延都会影响体验。",
    },
    {
      question: "视频生成可以直接替代内容制作吗？",
      signal:
        "客户是否接受分镜、参考素材、人工审核、后期编辑、授权和内容标识流程。",
      recommendation:
        "定位为素材生产和创意加速能力，采用生成—审核—标识—发布的内容供应链。",
      boundary:
        "生成完成不等于可以发布；人物肖像、品牌、版权和深度合成要求必须单独审查。",
    },
  ],
  criticalBoundary:
    "多模态不等于把所有媒体交给一个大模型：转写不等于理解，语义相似不等于事实正确，生成不等于可发布。",
  cloudHooks: [
    {
      stage: "媒体接入与解析（Ingestion & Parsing）",
      services: "对象存储、CDN、Document AI、OCR、ASR、媒体转码",
      value: "稳定接收大文件，保留原始资产与派生内容的来源关系。",
      discover: "媒体类型、尺寸、格式、语言、更新频率和保留要求是什么？",
    },
    {
      stage: "模型理解与生成（Inference & Generation）",
      services: "多模态模型 API、图像/视频生成、GPU、推理服务、模型网关",
      value: "按场景选择托管模型或自托管模型，并统一配额、路由和成本。",
      discover: "质量、P95、并发、地域、私网和成本目标是什么？",
    },
    {
      stage: "实时音视频（Real-time Media）",
      services: "WebRTC、SIP、云联络中心、STT/TTS、流式计算",
      value: "承载低延迟双向语音、打断、电话网络与会话状态。",
      discover: "已有电话或会议平台是什么，是否要求打断、录音、转人工和合规告知？",
    },
    {
      stage: "内容治理（Content Governance）",
      services: "内容审核、水印与凭证、DLP、KMS、访问控制、审计存储",
      value: "控制敏感数据、侵权、冒用、提示注入和错误发布风险。",
      discover: "谁有权上传和发布，哪些内容必须人工审核或显式标识？",
    },
    {
      stage: "质量与运营（Quality & Operations）",
      services: "评估平台、Tracing、日志、媒体质量监控、成本分析",
      value: "分别监控解析、模型、网络和业务任务的质量与成本。",
      discover: "失败如何分类，能否定位到页面、区域、时间段和具体模型步骤？",
    },
  ],
  relatedSlugs: [
    "rag",
    "ai-agent",
    "data-engineering",
    "llm-inference",
    "evaluation",
    "security",
    "ai-ops",
  ],
  qa: [
    {
      q: "多模态模型能否直接替代 OCR 和文档解析？",
      a: "不能一概而论。开放问答和复杂版面理解适合多模态模型，固定字段抽取、强审计和大规模低成本处理通常仍需要专业解析管线。",
      depth:
        "可以先用解析服务获得文字、结构、页码和区域，再由模型做语义理解；对解析失败或开放问题使用原生多模态回退。两条路径都要保留到原始页面和区域的定位，才能复核。",
      ask: "追问客户：需要开放理解还是固定字段？错误能否人工复核，必须保留哪些位置信息？",
      tag: "方案选择",
      basis: "视觉模型原理 + 生产可审计性",
      evidence: [
        {
          sourceId: "vit-2021",
          supports: "支持视觉 Transformer 通过图像 Patch 构造视觉 Token 的基本机制。",
        },
        {
          sourceId: "nist-genai-profile",
          supports: "支持保留来源、测量限制并按风险设置人工监督。",
        },
      ],
    },
    {
      q: "为什么多模态输入通常更贵、更慢？",
      a: "图像、文档、音频和视频需要额外编码、解析或大量视觉与时间 Token，且长媒体还会增加存储、网络和预处理成本。",
      depth:
        "成本优化应从裁剪、分辨率、关键帧、去重、缓存和专业预处理开始，而不只是换更小模型。报告应拆开媒体处理、模型推理、网络和人工审核成本。",
      ask: "追问客户：平均页数、图片数量、音视频时长、并发和可接受处理时限是多少？",
      tag: "成本与性能",
      basis: "视觉标记化 + 端到端成本",
      evidence: [
        {
          sourceId: "vit-2021",
          supports: "支持图像通过 Patch 序列进入 Transformer，说明分辨率与序列规模相关。",
        },
        {
          sourceId: "opentelemetry-semconv",
          supports: "支持用端到端遥测拆分模型和处理链路的时延与用量。",
        },
      ],
    },
    {
      q: "实时语音为什么不能只比较模型首包速度？",
      a: "用户体验由端点检测、网络、模型、工具、语音合成、打断和状态恢复共同决定。",
      depth:
        "应测从用户停止说话到系统开始回应的端到端延迟，并测试用户打断后能否停止播报、取消旧任务和正确续接上下文。涉及查询或交易时，还要把工具执行和人工转接纳入任务成功率。",
      ask: "追问客户：电话还是 App？是否需要打断、转人工、录音、工具调用和多语言？",
      tag: "实时交互",
      basis: "端到端系统评估",
      evidence: [
        {
          sourceId: "opentelemetry-semconv",
          supports: "支持以 Trace 关联多个处理阶段，而不是只观察单个模型请求。",
        },
        {
          sourceId: "nist-genai-profile",
          supports: "支持按实际使用情境持续测量系统性能与风险。",
        },
      ],
    },
    {
      q: "图片或文档里的文字会不会攻击 Agent？",
      a: "会。间接提示注入（Indirect Prompt Injection）可以藏在网页、文档、图片文字、邮件或工具结果中。",
      depth:
        "媒体内容应视为不可信数据，先解析并标记来源，再与系统指令和工具授权隔离。模型看到内容不应自动获得执行权限；高风险动作需要独立策略、参数校验和人工确认。",
      ask: "追问客户：模型会读取哪些外部媒体，读取后能调用哪些工具或访问哪些数据？",
      tag: "多模态安全",
      basis: "提示注入风险 + 最小权限",
      evidence: [
        {
          sourceId: "owasp-prompt-injection",
          supports: "支持外部内容触发间接提示注入的威胁与分层缓解原则。",
        },
        {
          sourceId: "nist-zero-trust",
          supports: "支持资源访问前持续验证主体和权限，而不信任内容来源。",
        },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "Patch → Token",
      title: "视觉内容也要进入上下文预算",
      finding: "ViT 把图像 Patch 转为序列，说明分辨率和切分策略会同时影响细节、时延和成本。",
      boundary: "这是视觉编码原理，不等于所有商业模型采用完全相同的 Token 计费方式。",
      sourceId: "vit-2021",
      accent: true,
    },
    {
      metric: "图像 ↔ 文本",
      title: "共享语义空间支撑跨模态检索",
      finding: "CLIP 通过对比学习对齐图像与文本表征，可用于检索、分类和视觉语言模型底座。",
      boundary: "语义对齐不能证明图像中的事实、数量和空间关系一定判断正确。",
      sourceId: "clip-2021",
    },
    {
      metric: "管线 + 原生",
      title: "混合架构通常更可运营",
      finding: "专业解析承担稳定主干，原生多模态处理开放问题和例外，可兼顾控制与能力。",
      boundary: "具体组合必须通过客户数据验证，不能把混合架构当固定模板。",
      sourceId: "nist-genai-profile",
    },
    {
      metric: "媒体即输入",
      title: "多模态内容同样可能包含恶意指令",
      finding: "网页、文档和图片文字可形成间接提示注入，不能因其不是纯文本输入而默认可信。",
      boundary: "输入检测不能单独消除风险，工具权限和动作控制仍需在模型外执行。",
      sourceId: "owasp-prompt-injection",
    },
  ],
};

export const mcpBrief = {
  slug: "mcp",
  definition:
    "模型上下文协议（Model Context Protocol, MCP）定义 AI 应用发现、读取和调用外部工具与数据的通用交互方式，减少客户端与服务端逐对定制。",
  position:
    "位于协议与互操作层，连接 AI 应用或 Agent 与工具、资源和提示模板；它复用而不取代现有 API、身份、安全和网关体系。",
  presentation: "stack",
  principleTitle: "协议统一交互，应用仍然负责信任与执行",
  principles: [
    {
      zh: "主机、客户端与服务端",
      en: "Host, Client & Server",
      explanation:
        "Host 管理用户体验、权限和多个连接；Client 与一个 Server 建立协议会话；Server 暴露受控能力。",
      decision:
        "设计时明确哪一层持有身份、呈现确认、执行策略并记录审计，不能把责任交给协议名称。",
    },
    {
      zh: "三类服务端原语",
      en: "Tools, Resources & Prompts",
      explanation:
        "Tools 表达可调用动作，Resources 提供可读取上下文，Prompts 提供可选择模板；三者的控制主体与风险不同。",
      decision:
        "会改变状态的能力使用 Tool；只读内容优先 Resource；面向用户选择的交互模板使用 Prompt。",
    },
    {
      zh: "能力协商与生命周期",
      en: "Capability Negotiation & Lifecycle",
      explanation:
        "连接初始化时交换版本与能力，随后发现可用原语并发起调用；客户端不能假设所有 Server 支持相同功能。",
      decision:
        "客户端必须处理能力缺失、版本差异、调用失败、取消和断线，而不是只实现成功路径。",
    },
    {
      zh: "传输决定信任边界",
      en: "Transport Defines Trust Boundary",
      explanation:
        "stdio 常用于本机受控子进程；Streamable HTTP 面向远程服务，会引入网络、身份、租户和回调风险。",
      decision:
        "从本地迁移远程时重新完成威胁建模、认证授权、限流和审计，不把它视为只改 URL。",
    },
    {
      zh: "MCP 与函数调用互补",
      en: "MCP + Function Calling",
      explanation:
        "Function Calling 定义模型如何表达一次工具选择和参数；MCP 统一工具如何被发现、描述与调用。",
      decision:
        "单应用、少量稳定工具可直接函数调用；多个客户端或工具提供方需要复用时再引入 MCP。",
    },
  ],
  decisions: [
    {
      question: "现有系统是否真的需要 MCP？",
      signal:
        "同一工具要服务多个 AI 客户端，或同一客户端需要接入多个独立工具提供方，并且发现与调用接口正在重复建设。",
      recommendation:
        "在已有 API 上增加薄 MCP 适配层，先标准化高价值、边界清楚的能力。",
      boundary:
        "单一应用连接少量固定 API 时，直接函数调用可能更简单。",
    },
    {
      question: "使用 stdio 还是 Streamable HTTP？",
      signal:
        "Server 是本地开发工具或受控桌面进程，还是跨主机、多人、多租户的共享服务。",
      recommendation:
        "本地进程优先 stdio；远程共享服务使用 HTTP，并接入企业 OAuth、API Gateway、限流和审计。",
      boundary:
        "stdio 不等于无风险，HTTP 也不自动具备认证；安全取决于完整部署边界。",
    },
    {
      question: "能力应建成 Tool、Resource 还是 Prompt？",
      signal:
        "能力是否改变外部状态、是否只是读取内容、由模型还是用户决定使用。",
      recommendation:
        "状态变更用 Tool 并设置授权；只读上下文用 Resource；可复用交互模板用 Prompt。",
      boundary:
        "把写操作伪装成只读 Resource，或把任意数据读取包装成高权限 Tool，都会破坏治理边界。",
    },
    {
      question: "应该重写服务还是包装现有 API？",
      signal:
        "现有 API 已具备稳定业务语义、授权、幂等和审计，只缺少 MCP 发现与调用接口。",
      recommendation:
        "优先薄适配，保留原 API 作为业务事实源；只有底层接口本身不稳定时才同步重构。",
      boundary:
        "MCP Server 不应复制业务规则或绕过原系统授权。",
    },
    {
      question: "远程 MCP 如何进入生产？",
      signal:
        "已有明确的服务身份、用户授权、租户隔离、工具风险分级、配额、版本和审计要求。",
      recommendation:
        "通过网关集中执行认证、授权、Allowlist、限流、版本控制、日志和异常隔离。",
      boundary:
        "能在 Registry 中发现，或能被客户端成功连接，都不代表 Server 已通过企业安全审查。",
    },
  ],
  criticalBoundary:
    "MCP 标准化的是发现与调用，不会自动授予信任、权限或安全保证；协议可互操作不等于服务可安全使用。",
  cloudHooks: [
    {
      stage: "服务运行（Server Runtime）",
      services: "Serverless、容器、托管 MCP Runtime、服务网格",
      value: "把 MCP Server 作为可弹性伸缩、可隔离和可发布的服务运行。",
      discover: "Server 是本地、单租户还是共享远程服务，是否有长连接和状态要求？",
    },
    {
      stage: "身份与网关（Identity & Gateway）",
      services: "OAuth/OIDC、IAM、API Gateway、WAF、密钥与证书管理",
      value: "统一认证、细粒度授权、限流、版本、网络策略和审计。",
      discover: "调用以用户身份还是工作负载身份执行，Scope 和租户如何传递？",
    },
    {
      stage: "API 与数据适配（API & Data Adapters）",
      services: "API 管理、数据库、对象存储、搜索、企业 SaaS 连接器",
      value: "复用现有业务 API 和数据控制面，避免 MCP Server 复制业务逻辑。",
      discover: "哪些现有接口已具备稳定 Schema、授权、幂等和审计？",
    },
    {
      stage: "运营与安全（Operations & Security）",
      services: "Tracing、日志、SIEM、策略引擎、漏洞管理、私有目录",
      value: "观察每次发现与调用，控制工具版本、异常行为和供应链风险。",
      discover: "谁批准工具上架，如何处理描述变化、撤销、漏洞和调用争议？",
    },
  ],
  relatedSlugs: ["ai-agent", "a2a", "ai-gateway", "security", "ai-ops"],
  qa: [
    {
      q: "已经有 Function Calling，为什么还需要 MCP？",
      a: "Function Calling 解决模型如何提出一次调用；MCP 解决不同客户端如何统一发现、描述和调用由不同 Server 提供的能力。",
      depth:
        "一个应用连接几个固定工具时，直接函数调用足够。随着客户端、工具和团队增加，MCP 可以复用协议适配，但底层 API、身份和业务规则仍然存在。是否采用取决于重复集成成本，而不是市场热度。",
      ask: "追问客户：有多少 AI 客户端、工具提供方和重复适配？工具是否需要跨团队复用？",
      tag: "协议边界",
      basis: "MCP 架构 + 工具调用机制",
      evidence: [
        {
          sourceId: "mcp-architecture",
          supports: "支持 Host、Client、Server 的分工，以及 MCP 对上下文交换与能力发现的标准化。",
        },
        {
          sourceId: "openai-function-calling",
          supports: "支持函数调用以工具 Schema 表达模型可选择的动作和参数。",
        },
      ],
    },
    {
      q: "MCP Server 能否直接使用现有用户权限？",
      a: "只有建立明确授权链后才可以。Server 必须知道主体、受众、Scope、租户和授权时效，不能仅凭模型声称代用户执行。",
      depth:
        "远程 MCP 应使用 OAuth/OIDC 等机制获得短期、限域凭据，并由资源服务再次校验。Host 负责呈现授权和高风险确认，Server 负责执行资源级授权；模型不应看到长期凭证。",
      ask: "追问客户：用户身份怎样传到 Server，资源端如何验证 Scope 和租户？",
      tag: "身份授权",
      basis: "MCP 授权规范 + 零信任",
      evidence: [
        {
          sourceId: "mcp-authorization",
          supports: "支持远程 MCP 的授权角色、受保护资源元数据和 OAuth 相关流程。",
        },
        {
          sourceId: "nist-zero-trust",
          supports: "支持资源访问前验证主体、设备和授权，不提供隐式信任。",
        },
      ],
    },
    {
      q: "接入公共 MCP Server 是否等于接入普通 SaaS API？",
      a: "不等于。除了 API 风险，还要评估工具描述影响模型选择、能力变化、返回内容注入和自动执行范围。",
      depth:
        "应核验发布者、代码与部署来源，固定版本和允许的 Tool，监控描述变化，并限制输出进入高权限上下文。高风险调用需要预览或确认，公共目录只能作为发现线索。",
      ask: "追问客户：谁批准外部 Server，版本如何固定，工具描述变化时如何复核？",
      tag: "供应链安全",
      basis: "MCP 威胁模型",
      evidence: [
        {
          sourceId: "mcp-security",
          supports: "支持工具描述投毒、混淆代理和令牌相关风险需要额外控制。",
        },
        {
          sourceId: "owasp-prompt-injection",
          supports: "支持外部工具返回内容可形成间接提示注入。",
        },
      ],
    },
    {
      q: "MCP 会不会造成新的平台锁定？",
      a: "协议可以降低接口层锁定，但运行时、身份、网关、扩展能力和业务数据模型仍可能形成平台差异。",
      depth:
        "应把核心业务 API 与 MCP 适配层分离，使用标准原语和传输，避免依赖未经验证的私有扩展；同时测试 Server 在多个兼容客户端上的行为。",
      ask: "追问客户：哪些能力属于标准协议，哪些依赖特定平台的托管扩展？",
      tag: "选型与锁定",
      basis: "协议互操作边界",
      evidence: [
        {
          sourceId: "mcp-architecture",
          supports: "支持以标准 Host、Client、Server 和协议消息实现互操作。",
        },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "Host–Client–Server",
      title: "三层角色拆分连接责任",
      finding: "MCP 用 Host 管理体验和权限、Client 维护协议连接、Server 提供能力。",
      boundary: "具体产品可以合并进程，但逻辑责任仍需清楚。",
      sourceId: "mcp-architecture",
      accent: true,
    },
    {
      metric: "Tool / Resource / Prompt",
      title: "原语对应不同控制主体",
      finding: "动作、只读上下文和交互模板应使用不同原语表达，便于授权和用户控制。",
      boundary: "原语名称不能代替业务风险分类，Tool 仍需逐项授权。",
      sourceId: "mcp-architecture",
    },
    {
      metric: "stdio ↔ HTTP",
      title: "传输变化会改变威胁模型",
      finding: "本地进程和远程共享服务面对不同的身份、网络、租户和运营风险。",
      boundary: "任何传输都需要与部署环境匹配的安全控制。",
      sourceId: "mcp-authorization",
    },
    {
      metric: "互操作 ≠ 可信",
      title: "成功连接不代表安全可用",
      finding: "工具描述、外部内容、凭据和自动执行范围仍可能造成投毒与越权。",
      boundary: "必须由网关、身份、Allowlist、审批与审计补足协议之外的控制。",
      sourceId: "mcp-security",
    },
  ],
};

export const a2aBrief = {
  slug: "a2a",
  definition:
    "智能体间协议（Agent2Agent Protocol, A2A）让独立 Agent 跨框架、系统或组织发现能力、委派任务、交换状态并交付结果。",
  position:
    "位于协议与互操作层，解决 Agent 与 Agent 的水平协作；单个 Agent 内部编排由本地框架负责，工具和数据接入通常由 MCP 或 API 负责。",
  presentation: "loop",
  principleTitle: "以可追踪任务协作，而不是共享内部推理",
  principles: [
    {
      zh: "能力发现",
      en: "Agent Card & Discovery",
      explanation:
        "Agent Card 描述身份、地址、技能、输入输出和安全要求，让调用方在委派前判断能力与接入方式。",
      decision:
        "生产环境需要验证 Card 的来源、域名、签名和有效期，不能把自声明能力当认证结果。",
    },
    {
      zh: "有状态任务",
      en: "Stateful Task",
      explanation:
        "Task 是跨轮次、跨时间的工作单元，拥有明确状态；服务端任务存储是异步协作的事实源。",
      decision:
        "为状态转换、终态、取消、重试和超时建立规则；失败后是否创建新 Task 应可审计。",
    },
    {
      zh: "消息与产物分离",
      en: "Messages, Parts & Artifacts",
      explanation:
        "Message 表达交互，Part 承载文本、文件或结构化数据，Artifact 表达可交付结果。",
      decision:
        "对大型文件传递受控对象地址和元数据，避免把敏感二进制内容无边界嵌入消息。",
    },
    {
      zh: "多种结果交付",
      en: "Blocking, Polling, Streaming & Push",
      explanation:
        "短任务可以同步等待，长任务可轮询、流式接收或由服务端回调；交付方式决定恢复和安全设计。",
      decision:
        "按任务时长、网络边界和客户端在线能力选择，并为回调设置签名、地址验证和幂等。",
    },
    {
      zh: "不透明协作边界",
      en: "Opaque Collaboration Boundary",
      explanation:
        "Agent 可以只暴露能力、输入、状态和产物，不必共享内部 Prompt、工具和推理过程。",
      decision:
        "跨组织协作以契约、状态和产物验收为主，不以暴露内部实现换取可调试性。",
    },
  ],
  decisions: [
    {
      question: "是否需要 A2A，而不是单个 Agent？",
      signal:
        "任务必须委派给独立部署、独立所有者、不同框架或不同云上的专业 Agent。",
      recommendation:
        "只有跨系统边界确实存在时采用 A2A；同一应用内的子任务先用本地编排。",
      boundary:
        "把一个应用人为拆成多个 Agent 不会自动提高质量，只会增加交接与评估成本。",
    },
    {
      question: "A2A 与内部编排框架如何分工？",
      signal:
        "内部节点是否共享状态、代码仓库和信任域，还是由不同服务或组织独立运营。",
      recommendation:
        "信任域内使用框架管理细粒度状态；跨边界通过 A2A 暴露稳定任务契约。",
      boundary:
        "A2A 不替代 LangGraph 等内部运行时，也不要求暴露内部节点。",
    },
    {
      question: "任务应同步返回还是异步交付？",
      signal:
        "任务是否可能长时间运行、等待人或外部系统，以及客户端能否维持连接。",
      recommendation:
        "短任务用 Blocking；可查询长任务用 Polling；渐进结果用 Streaming；离线通知用受控 Push。",
      boundary:
        "Push 需要回调地址验证、签名、幂等和限流，不能接受任意模型生成 URL。",
    },
    {
      question: "跨组织 Agent 如何建立信任？",
      signal:
        "已有可验证 Agent 身份、调用主体、租户、Skill Scope、数据分类和任务审计要求。",
      recommendation:
        "验证 Agent Card，使用 OAuth2 或 mTLS，把授权限制到具体操作、租户和任务。",
      boundary:
        "发现某个 Agent 只证明找到服务，不证明调用方有权委派或接收其产物。",
    },
    {
      question: "大文件和敏感产物怎样传递？",
      signal:
        "Artifact 包含大文件、受监管数据、跨区域数据或需要长期留存的输出。",
      recommendation:
        "通过受控对象存储传递短期访问地址、校验值和元数据，独立执行访问与保留策略。",
      boundary:
        "A2A 消息不是数据治理绕行通道，底层存储权限和地域要求仍然有效。",
    },
  ],
  criticalBoundary:
    "A2A 解决 Agent 与 Agent 的任务协作，MCP 解决 Agent 与工具或数据的调用；发现、互操作和能力自声明都不等于身份可信或授权成立。",
  cloudHooks: [
    {
      stage: "Agent 运行与目录（Runtime & Directory）",
      services: "托管 Agent Runtime、容器、服务发现、私有目录、DNS",
      value: "运行独立 Agent，并向获准调用方发布稳定能力入口。",
      discover: "Agent 分属哪些团队、云和信任域，目录是公开还是私有？",
    },
    {
      stage: "任务与消息（Tasks & Messaging）",
      services: "任务存储、数据库、消息队列、事件总线、工作流",
      value: "保存任务状态，支持长任务、重试、取消、回调和故障恢复。",
      discover: "任务最长多久，是否等待人工，终态、重试和补偿规则是什么？",
    },
    {
      stage: "身份与边界（Identity & Boundary）",
      services: "API Gateway、OAuth/OIDC、mTLS、IAM、WAF、策略引擎",
      value: "验证 Agent 与调用者身份，限制 Skill、租户、操作和流量。",
      discover: "谁有权委派哪个任务，跨组织和跨租户身份如何映射？",
    },
    {
      stage: "产物与可观测（Artifacts & Observability）",
      services: "对象存储、KMS、Tracing、日志、审计、成本监控",
      value: "安全交付大文件，并把跨 Agent 状态、调用链、错误和成本关联起来。",
      discover: "产物如何加密、保留和删除，哪个 Trace 能关联多个 Agent 的同一任务？",
    },
  ],
  relatedSlugs: ["ai-agent", "mcp", "ai-gateway", "security", "ai-ops"],
  qa: [
    {
      q: "A2A 和 MCP 到底有什么区别？",
      a: "A2A 面向独立 Agent 之间的任务委派与状态协作；MCP 面向 AI 应用与工具、资源和提示模板的连接。",
      depth:
        "一个采购 Agent 可以通过 A2A 把合同审查委派给法务 Agent，法务 Agent 再通过 MCP 调用合同库和审批工具。两者可以组合，但任务状态、工具权限和审计责任要分别设计。",
      ask: "追问客户：对方是能独立接任务并交付产物的 Agent，还是一个数据库/API 工具？",
      tag: "协议边界",
      basis: "A2A 概念模型 + MCP 架构",
      evidence: [
        {
          sourceId: "a2a-concepts",
          supports: "支持 A2A 围绕 Agent Card、Task、Message、Part 与 Artifact 进行协作。",
        },
        {
          sourceId: "mcp-architecture",
          supports: "支持 MCP 以 Host、Client、Server 连接工具与上下文能力。",
        },
      ],
    },
    {
      q: "已经使用多 Agent 框架，还需要 A2A 吗？",
      a: "只有需要跨系统或跨信任域协作时才需要。单个系统内部共享状态和代码的 Agent，继续使用本地框架更直接。",
      depth:
        "A2A 的价值是稳定外部契约和异步任务边界，而不是替换内部状态机。可以让一个内部编排系统整体作为 A2A Agent 暴露，内部节点不必逐一对外。",
      ask: "追问客户：协作方是否独立部署、独立升级、独立授权或由不同组织负责？",
      tag: "架构选择",
      basis: "协议边界 + 内部编排",
      evidence: [
        {
          sourceId: "a2a-specification",
          supports: "支持 A2A 通过外部协议契约交换任务、消息和产物。",
        },
        {
          sourceId: "anthropic-effective-agents",
          supports: "支持在单个应用内按任务复杂度选择编排模式。",
        },
      ],
    },
    {
      q: "长任务如何避免断线后丢失？",
      a: "服务端应持久化 Task 状态，客户端通过 Task ID 恢复查询或订阅，而不是把网络连接当作唯一状态。",
      depth:
        "状态转换、终态、取消、输入等待和授权等待都要被记录。流式连接中断后可重新查询任务；Push 失败要重试且保持幂等；Artifact 应与 Task 和版本关联。",
      ask: "追问客户：任务状态存在哪里，断线、重复回调和服务重启后如何恢复？",
      tag: "可靠性",
      basis: "A2A Task 模型",
      evidence: [
        {
          sourceId: "a2a-concepts",
          supports: "支持 Task 作为有状态工作单元并具有明确生命周期。",
        },
        {
          sourceId: "a2a-specification",
          supports: "支持同步、流式和异步任务交互及对应状态语义。",
        },
      ],
    },
    {
      q: "A2A Agent 不公开内部工具和 Prompt，怎么审计？",
      a: "跨系统审计应围绕身份、任务契约、状态变化、输入输出、策略决策和 Artifact 验收，而不是索取完整内部思维链。",
      depth:
        "调用方记录谁在何时委派了什么、依据哪个 Agent Card、使用何种授权、收到哪些状态和产物；提供方记录内部执行与策略。双方用 Task ID 和 Trace Context 关联，敏感内部实现仍可隔离。",
      ask: "追问客户：争议发生时，双方必须共同证明哪些事实，哪些内部信息不能跨组织共享？",
      tag: "审计与可观测",
      basis: "任务契约 + 分布式追踪",
      evidence: [
        {
          sourceId: "a2a-specification",
          supports: "支持通过标准任务、消息和产物交换跨 Agent 状态。",
        },
        {
          sourceId: "opentelemetry-semconv",
          supports: "支持使用 Trace Context 和统一遥测关联跨服务调用。",
        },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "Card → Task → Artifact",
      title: "从能力发现走到可交付任务",
      finding: "Agent Card 描述可做什么，Task 保存协作状态，Artifact 承载可验收产物。",
      boundary: "能力自声明不等于通过身份验证或质量认证。",
      sourceId: "a2a-concepts",
      accent: true,
    },
    {
      metric: "同步 ↔ 异步",
      title: "交付方式匹配任务时长",
      finding: "Blocking、Polling、Streaming 与 Push 支持不同在线状态和结果节奏。",
      boundary: "异步能力需要持久任务状态、幂等和恢复机制配合。",
      sourceId: "a2a-specification",
    },
    {
      metric: "Agent ↔ Agent",
      title: "A2A 与 MCP 的方向不同",
      finding: "A2A 负责独立 Agent 间协作，MCP 负责应用与工具、资源之间的互操作。",
      boundary: "一个系统可能同时使用两者，但不能共用一套授权假设。",
      sourceId: "mcp-architecture",
    },
    {
      metric: "契约而非思维链",
      title: "不透明 Agent 也可以被治理",
      finding: "通过身份、Task、状态、消息和 Artifact 建立可观察协作，不要求公开内部推理。",
      boundary: "不公开内部实现不代表免除提供方的内部审计和质量责任。",
      sourceId: "a2a-concepts",
    },
  ],
};

export const evaluationBrief = {
  slug: "evaluation",
  definition:
    "评估（Evaluation）把“效果好”转成可重复的数据集、评分方法、发布门槛和线上监控，用于比较方案、诊断问题并控制变更风险。",
  position:
    "位于工程保障层，横跨模型选择、Prompt、RAG、Agent、微调和生产运营；它负责测量系统是否达到客户约定，而不是为方案补一张排行榜。",
  presentation: "loop",
  principleTitle: "从客户任务定义质量，再让每次变更接受复测",
  principles: [
    {
      zh: "三层评估",
      en: "Benchmark, Application Eval & Production Monitoring",
      explanation:
        "公开 Benchmark 用于通用初筛，客户应用评估验证真实场景，生产监控发现数据与行为漂移。",
      decision:
        "模型采购不能只看排行榜；最终选择必须通过客户 Golden Set 和上线门。",
    },
    {
      zh: "评分方法分工",
      en: "Code, Judge & Human",
      explanation:
        "确定性约束优先代码校验，主观质量可用 LLM-as-a-Judge，人工负责标准制定、校准、争议和高风险审核。",
      decision:
        "先用最便宜、最可复现的方法；Judge 不应替代可由业务规则直接验证的事实。",
    },
    {
      zh: "评估集是长期资产",
      en: "Evaluation Set as an Asset",
      explanation:
        "Golden Set 应覆盖常见、高价值、边界、安全和历史失败样本，并随着生产问题持续增长。",
      decision:
        "评估集进入版本控制，保留独立留出集，防止团队只对公开样例或已知测试调优。",
    },
    {
      zh: "按系统机制拆指标",
      en: "Mechanism-specific Metrics",
      explanation:
        "RAG 要区分检索与生成，Agent 要区分结果、轨迹、工具、安全与效率，微调还要检查通用能力回退。",
      decision:
        "先定位失败发生在哪个机制，再决定改 Prompt、数据、模型、检索还是工具。",
    },
    {
      zh: "质量飞轮",
      en: "Quality Flywheel",
      explanation:
        "坏案例进入错误分析与数据集，修复后经过回归门，再部署并持续监控，形成可追踪闭环。",
      decision:
        "任何模型、Prompt、检索、工具和策略变化都触发相应回归，而不是依靠人工抽看。",
    },
  ],
  decisions: [
    {
      question: "公开 Benchmark 能否决定模型选型？",
      signal:
        "Benchmark 任务、语言、工具环境和客户真实工作是否相似，是否存在饱和、污染或选择偏差。",
      recommendation:
        "用相关 Benchmark 缩小候选，再在客户 Golden Set 上比较质量、时延、成本和风险。",
      boundary:
        "排行榜名次不构成客户场景的准确率或 ROI 承诺。",
    },
    {
      question: "没有历史标注数据怎样开始？",
      signal:
        "存在领域专家、真实日志、SOP、历史工单或可验证业务状态。",
      recommendation:
        "由专家定义少量高价值与边界样本，再从日志抽样和合成扩展；所有合成样本都需人工筛选。",
      boundary:
        "合成问题可以补覆盖，不能替代真实分布和真实失败。",
    },
    {
      question: "该用规则、Judge 还是人工？",
      signal:
        "输出是否有 Schema、事实字段或可执行测试，质量是否主观，错误风险是否需要责任人裁决。",
      recommendation:
        "Schema、权限和业务状态用代码；相关性、完整性和风格用校准后的 Judge；高风险与争议由人工。",
      boundary:
        "Judge 给出高分不等于事实正确，也不能为越权动作免责。",
    },
    {
      question: "什么样的结果可以发布？",
      signal:
        "合同接口、任务质量、零容忍风险和生产指标分别有明确通过线。",
      recommendation:
        "设置 Contract、Quality、Risk、Production 四类门，任一硬门失败则停止发布。",
      boundary:
        "总体平均分不能掩盖越权、敏感信息泄露或关键任务失败。",
    },
    {
      question: "上线后还需要离线评估吗？",
      signal:
        "数据、用户、模型、知识库或工具会持续变化，线上反馈又受选择偏差和延迟影响。",
      recommendation:
        "保留冻结回归集，同时采样线上 Trace、人工反馈和坏案例，定期扩充评估集。",
      boundary:
        "线上点赞率不能单独解释任务质量；静态离线集也无法覆盖生产漂移。",
    },
  ],
  criticalBoundary:
    "公开 Benchmark 是初筛工具，不是生产验收；平均分是摘要，不是安全豁免。客户任务、可验证终态和硬风险门才决定能否上线。",
  cloudHooks: [
    {
      stage: "数据集与实验（Datasets & Experiments）",
      services: "对象存储、数据仓库、评估集管理、实验追踪、版本控制",
      value: "保存样本、标准、运行配置和结果，使比较可重复。",
      discover: "谁提供样本和标签，哪些数据可离开生产环境，如何版本化？",
    },
    {
      stage: "离线评估（Offline Evaluation）",
      services: "托管模型评估、批处理、Judge 服务、RAG/Agent 评测框架",
      value: "在发布前批量比较模型、Prompt、检索、工具和安全策略。",
      discover: "哪些指标可代码校验，哪些需要 Judge 或人工，运行成本上限是什么？",
    },
    {
      stage: "发布门禁（Release Gates）",
      services: "CI/CD、策略引擎、模型注册表、审批工作流",
      value: "把评估结果转成自动阻断、审批、灰度和回滚条件。",
      discover: "哪些硬门失败必须阻断，谁可以批准例外，如何保留证据？",
    },
    {
      stage: "线上监控（Production Monitoring）",
      services: "Tracing、日志、指标、在线采样评估、A/B、告警、FinOps",
      value: "发现漂移、异常轨迹、质量下降和每个成功任务成本变化。",
      discover: "线上 ground truth 从哪里来，样本如何脱敏，告警后谁负责处置？",
    },
  ],
  relatedSlugs: [
    "rag",
    "ai-agent",
    "prompt-engineering",
    "fine-tuning",
    "security",
    "ai-ops",
  ],
  qa: [
    {
      q: "模型在公开 Benchmark 上排名很高，为什么还要做客户评估？",
      a: "因为 Benchmark 测的是特定数据和任务，客户关心的是自己的语言、知识、流程、工具、风险和成本。",
      depth:
        "公开基准适合初筛通用能力，但无法覆盖企业权限、数据质量、工具错误、品牌规则和真实用户分布。应在同一 Golden Set、同一工具环境和同一成本约束下比较候选方案。",
      ask: "追问客户：哪些真实任务代表价值，哪些错误即使少量发生也不可接受？",
      tag: "模型选型",
      basis: "场景化评估 + 风险治理",
      evidence: [
        {
          sourceId: "nist-genai-profile",
          supports: "支持按具体使用情境、受影响主体和风险容忍度评估生成式 AI。",
        },
      ],
    },
    {
      q: "LLM-as-a-Judge 可以完全代替人工吗？",
      a: "不能。Judge 适合扩展主观质量评估，但需要人工定义 Rubric、校准偏差、处理争议和审核高风险样本。",
      depth:
        "先用人工 Gold Set 校准 Judge，再检查与人工的一致性、位置和冗长偏差。可以由较强模型校准较低成本 Judge，但应定期抽样复核；业务状态、Schema 和权限仍用代码验证。",
      ask: "追问客户：哪些判断是主观质量，哪些有确定业务事实，谁是争议裁决者？",
      tag: "评估方法",
      basis: "评分方法分工",
      evidence: [
        {
          sourceId: "nist-genai-profile",
          supports: "支持结合自动化测量、领域专家与人工监督管理评估局限。",
        },
      ],
    },
    {
      q: "RAG 回答错了，怎样判断是检索还是模型的问题？",
      a: "先评检索是否找到并排序了必要证据，再评生成是否忠实使用证据；两层不能混成一个总分。",
      depth:
        "检索层看必要内容是否进入候选、无关内容是否占据上下文；生成层看回答是否由上下文支持、是否正确引用和拒答。召回失败时换模型通常无效，生成失真时单纯增加 Top-K 也可能更差。",
      ask: "追问客户：正确证据是否存在、是否被检索、是否进入最终上下文、回答是否引用了它？",
      tag: "RAG 诊断",
      basis: "RAG 分层评估",
      evidence: [
        {
          sourceId: "ragas",
          supports: "支持用 Context Recall、Context Precision 与 Faithfulness 等维度区分检索和生成问题。",
        },
      ],
    },
    {
      q: "Agent 为什么不能只评最终回答？",
      a: "因为 Agent 可能碰巧得到正确文字，却经历越权、无效调用、隐藏失败或未真正改变业务状态。",
      depth:
        "评估应同时检查 Outcome、Trajectory、Tools、Safety 和 Efficiency。终态由业务系统验证，轨迹检查工具选择、参数、重试和停止，安全检查策略违规，效率检查时延和每个成功任务成本。",
      ask: "追问客户：哪个系统状态证明完成，哪些步骤和权限必须正确，允许多少重试与人工接管？",
      tag: "Agent 评估",
      basis: "任务轨迹 + 端到端结果",
      evidence: [
        {
          sourceId: "react-2023",
          supports: "支持通过交替推理、行动和观察形成可分析的任务轨迹。",
        },
        {
          sourceId: "anthropic-effective-agents",
          supports: "支持按任务复杂度控制 Agent 循环、工具使用和停止条件。",
        },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "基准 → 场景 → 生产",
      title: "三层证据回答不同问题",
      finding: "公开基准用于初筛，客户评估用于验收，生产监控用于发现真实漂移和异常。",
      boundary: "三者不能相互替代，也不能使用不同任务的数据直接横向比较。",
      sourceId: "nist-genai-profile",
      accent: true,
    },
    {
      metric: "代码 → Judge → 人工",
      title: "按可验证程度选择评分方法",
      finding: "确定规则优先代码，主观质量使用校准 Judge，高风险和争议保留人工裁决。",
      boundary: "Judge 是可扩展评估器，不是业务事实源或责任主体。",
      sourceId: "nist-genai-profile",
    },
    {
      metric: "检索 + 生成",
      title: "RAG 必须分层诊断",
      finding: "Context Recall、Context Precision 与 Faithfulness 帮助区分没有找到、噪声过多和没有忠实使用证据。",
      boundary: "指标仍依赖数据集和 Judge 质量，应结合人工错误分析。",
      sourceId: "ragas",
    },
    {
      metric: "Trace → Gate",
      title: "评估结果要进入发布决策",
      finding: "模型、检索、工具和策略变更都应触发回归，并以硬门控制发布。",
      boundary: "可观测数据提供证据，但业务成功和风险门槛仍需客户定义。",
      sourceId: "opentelemetry-semconv",
    },
  ],
};

export const securityBrief = {
  slug: "security",
  definition:
    "AI 安全（AI Security）保护模型、数据、应用、Agent、工具和供应链，使系统在不可信输入、动态生成与自主行动下仍保持最小权限、可控影响和可审计责任。",
  position:
    "位于工程保障层，贯穿数据进入、模型调用、工具行动、输出交付和持续运营；安全控制与 Evaluation 相互配合，但不能由评估分数代替。",
  presentation: "stack",
  principleTitle: "把模型放进受控系统，而不是要求模型自己保证安全",
  principles: [
    {
      zh: "分层威胁模型",
      en: "Layered Threat Model",
      explanation:
        "风险来自模型、应用和 Agent 系统：同一输入可能影响回答、泄露数据，也可能触发外部动作。",
      decision:
        "按数据、模型、上下文、工具、身份和输出逐层分析攻击路径与影响范围。",
    },
    {
      zh: "提示注入是系统问题",
      en: "Prompt Injection as a System Risk",
      explanation:
        "模型难以稳定区分指令与数据，恶意内容可通过用户输入、网页、邮件、文档、RAG 和工具结果间接进入。",
      decision:
        "把外部内容标记为不可信，并在模型外限制其可以触发的权限和动作。",
    },
    {
      zh: "数据与向量治理",
      en: "Data & Vector Governance",
      explanation:
        "向量化不是匿名化；知识库仍可能发生投毒、越权检索、跨租户泄露和来源失真。",
      decision:
        "执行知识准入、来源追踪、写权限、检索时 ACL、租户隔离、保留与删除。",
    },
    {
      zh: "AI 供应链",
      en: "AI Supply Chain",
      explanation:
        "风险覆盖代码依赖、模型权重、数据集、插件和发布证据，包括恶意序列化、后门与许可证问题。",
      decision:
        "使用安全格式、扫描、沙箱、签名与哈希，并保留模型卡、数据卡和物料清单。",
    },
    {
      zh: "自主性放大风险",
      en: "Autonomy Expands Blast Radius",
      explanation:
        "Agent 的工具和记忆会把错误从一段回答扩大为真实系统状态变化，权限越大、记忆越长，影响范围越大。",
      decision:
        "模型只提出意图，应用执行身份绑定、授权、校验、审批和补偿；高风险动作必须人工确认。",
    },
    {
      zh: "四道外部控制门",
      en: "Input, Action, Output & Monitoring Gates",
      explanation:
        "输入门处理内容与来源，行动门控制权限，输出门处理泄露与不当内容，监控门发现异常和漂移。",
      decision:
        "Guardrail 只覆盖部分风险，应与 IAM、DLP、沙箱、网关、审计和响应流程组合。",
    },
  ],
  decisions: [
    {
      question: "系统面对哪类提示注入？",
      signal:
        "模型是否读取用户输入之外的网页、文档、邮件、RAG、屏幕或工具结果，并能否据此调用工具。",
      recommendation:
        "同时测试直接与间接注入，隔离不可信内容，并对动作实施独立策略和最小权限。",
      boundary:
        "更长的系统提示、关键词过滤或单个检测模型都不能单独解决提示注入。",
    },
    {
      question: "敏感企业知识应该微调还是 RAG？",
      signal:
        "知识是否频繁变化、需要权限过滤、引用、纠正、删除和审计。",
      recommendation:
        "动态敏感知识优先 RAG，训练只用于需要稳定行为或能力迁移的内容，并执行数据治理。",
      boundary:
        "RAG 更易撤回和授权，但知识库、向量库和检索链本身仍需安全控制。",
    },
    {
      question: "Agent 可以获得多大权限？",
      signal:
        "动作是否只读、可逆、涉及资金、生产、删除、外部发送或受监管数据。",
      recommendation:
        "按工具分级，使用短期、限域、与用户或工作负载绑定的凭据，高风险动作预览并审批。",
      boundary:
        "模型看到凭据或拥有通用服务账号会破坏身份链、授权链和审计链。",
    },
    {
      question: "开源模型和第三方插件如何进入生产？",
      signal:
        "可确认来源、许可证、哈希、格式、依赖、漏洞、模型卡和数据说明，并可在隔离环境验证。",
      recommendation:
        "进入私有注册表前完成扫描、签名、沙箱测试和批准，发布时关联物料清单与回滚版本。",
      boundary:
        "能下载、能加载或在公共目录中流行，都不是供应链可信证明。",
    },
    {
      question: "一个 Guardrail 服务是否足够？",
      signal:
        "风险是否只涉及已知内容类别，还是同时包含身份、数据、工具、供应链和业务副作用。",
      recommendation:
        "按四道控制门组合内容检测、IAM、DLP、策略引擎、沙箱、审计和人工审批，并持续红队测试。",
      boundary:
        "Guardrail 可以降低风险，不能消除模型不确定性或替代传统安全控制。",
    },
  ],
  criticalBoundary:
    "安全模型不等于安全应用，系统提示不等于安全策略，向量化不等于匿名化。凡是身份、授权、凭据、数据访问和不可逆动作，都必须由模型外的确定性控制执行。",
  cloudHooks: [
    {
      stage: "身份与凭据（Identity & Credentials）",
      services: "IAM、OAuth/OIDC、工作负载身份、KMS、Secrets Manager、PAM",
      value: "提供短期、限域、可撤销身份，避免凭据进入 Prompt 和模型上下文。",
      discover: "模型以谁的身份行动，凭据存在哪里，Scope、租户和有效期如何限制？",
    },
    {
      stage: "网络与运行隔离（Network & Runtime Isolation）",
      services: "私网、WAF、API Gateway、容器沙箱、虚拟桌面、服务网格",
      value: "限制模型、Agent、工具和外部内容之间的通信与影响范围。",
      discover: "哪些资源允许出网、写入或执行代码，环境能否按任务隔离和销毁？",
    },
    {
      stage: "数据保护（Data Protection）",
      services: "DLP、数据分类、加密、访问控制、向量数据库、审计存储",
      value: "保护 Prompt、日志、知识库、Embedding 和模型输出中的敏感信息。",
      discover: "哪些数据可进入模型、向量库和日志，如何执行租户隔离、保留与删除？",
    },
    {
      stage: "AI 防护（AI Guardrails）",
      services: "内容安全、Prompt 防护、策略引擎、模型安全过滤、人工审批",
      value: "在输入、行动和输出位置检测风险并阻断不允许的行为。",
      discover: "哪些内容和动作必须阻断，误报如何处理，策略由谁批准和更新？",
    },
    {
      stage: "安全运营与治理（SecOps & Governance）",
      services: "SIEM、Tracing、威胁检测、红队平台、漏洞管理、资产与物料清单",
      value: "持续发现注入、越权、异常调用、供应链变化和控制失效。",
      discover: "谁负责 AI 资产、告警、事件响应、证据保留和定期复核？",
    },
  ],
  relatedSlugs: [
    "rag",
    "ai-agent",
    "multimodal",
    "mcp",
    "a2a",
    "data-engineering",
    "ai-gateway",
    "evaluation",
    "ai-ops",
  ],
  qa: [
    {
      q: "模型已经做过安全对齐，应用还需要哪些安全工作？",
      a: "仍需传统安全和 AI 专用控制。模型对齐只能影响生成行为，不能替应用完成身份、授权、数据隔离、工具审批和事件响应。",
      depth:
        "应用要对输入来源、知识库权限、工具调用、凭据、输出处理和日志负责。Agent 还能改变外部状态，因此需要短期身份、动作分级、幂等、审批和补偿。",
      ask: "追问客户：模型能够访问哪些数据和工具，最坏错误会改变什么真实状态？",
      tag: "共享责任",
      basis: "生成式 AI 风险框架 + 零信任",
      evidence: [
        {
          sourceId: "nist-genai-profile",
          supports: "支持组织在生成式 AI 全生命周期识别、测量和管理系统级风险。",
        },
        {
          sourceId: "nist-zero-trust",
          supports: "支持不依赖隐式信任，而在资源访问前验证主体和授权。",
        },
      ],
    },
    {
      q: "Prompt Injection 能不能通过写更强的系统提示解决？",
      a: "不能保证。提示可以降低部分风险，但模型仍可能把不可信内容误当指令，必须在模型外限制权限和影响范围。",
      depth:
        "将系统指令与外部内容结构化分隔、检测可疑内容、最小化上下文，并让高权限动作经过独立策略、参数校验和人工确认。红队应覆盖网页、文档、RAG、工具结果和多轮诱导。",
      ask: "追问客户：模型会读取哪些不可信来源，读取后最危险的可执行动作是什么？",
      tag: "提示注入",
      basis: "OWASP 威胁定义 + 外部控制",
      evidence: [
        {
          sourceId: "owasp-prompt-injection",
          supports: "支持直接与间接提示注入的威胁，以及单纯依赖模型内指令的局限。",
        },
      ],
    },
    {
      q: "Embedding 存进向量库后还算敏感数据吗？",
      a: "仍可能敏感。向量化不是匿名化，向量、元数据、原文和检索结果都需要访问控制与生命周期治理。",
      depth:
        "必须执行租户隔离、检索时 ACL、写入准入、来源和版本记录、删除传播与审计。攻击者还可能通过投毒内容影响检索，或利用权限缺陷推断敏感信息。",
      ask: "追问客户：向量、原文和元数据分别存在哪里，权限变化和删除如何同步？",
      tag: "RAG 安全",
      basis: "向量与 Embedding 风险",
      evidence: [
        {
          sourceId: "owasp-vector-weaknesses",
          supports: "支持向量与 Embedding 系统的访问控制、投毒、跨租户和数据泄露风险。",
        },
      ],
    },
    {
      q: "怎样避免 Agent 越权或造成不可逆损失？",
      a: "模型只提出动作意图，应用使用真实身份做授权、参数校验和执行；按动作风险决定自动、确认或禁止。",
      depth:
        "只读查询可以自动化，可逆写入先预览并提供补偿，资金、生产、删除和外部发送保留人工审批。凭据不进入上下文，权限限制到具体工具、资源、租户和时效，所有执行与结果进入审计 Trace。",
      ask: "追问客户：哪些动作不可逆，谁有最终授权，失败如何回滚或补偿？",
      tag: "Agent 安全",
      basis: "最小权限 + 行动控制",
      evidence: [
        {
          sourceId: "nist-zero-trust",
          supports: "支持资源访问前验证身份与授权，并持续限制访问范围。",
        },
        {
          sourceId: "mcp-security",
          supports: "支持工具调用场景中的混淆代理、令牌和权限风险需要独立控制。",
        },
      ],
    },
    {
      q: "采用云上 Guardrail 后，是否可以减少安全测试？",
      a: "不能。Guardrail 是控制组件，仍需用客户数据、对抗输入和真实工具路径验证其覆盖、误报、绕过与性能影响。",
      depth:
        "测试应覆盖输入、RAG 内容、工具返回、长对话、多模态输入和高风险动作；同时验证被阻断后的用户体验、人工接管和告警响应。控制变化也要进入回归评估。",
      ask: "追问客户：Guardrail 要阻断什么，允许什么，误报由谁处理，绕过后最大影响是什么？",
      tag: "安全验证",
      basis: "风险测量 + 持续评估",
      evidence: [
        {
          sourceId: "nist-genai-profile",
          supports: "支持部署前后持续测量、红队测试和控制有效性复核。",
        },
        {
          sourceId: "owasp-prompt-injection",
          supports: "支持采用多层缓解而非依赖单一检测或提示。",
        },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "模型 + 应用 + Agent",
      title: "安全风险存在于完整系统",
      finding: "模型输出、应用数据流和 Agent 工具行动形成不同攻击面，需要分层控制。",
      boundary: "通过模型安全测试不能证明数据、身份、工具和供应链同样安全。",
      sourceId: "nist-genai-profile",
      accent: true,
    },
    {
      metric: "直接 + 间接",
      title: "外部内容也能形成提示注入",
      finding: "网页、文档、邮件、RAG 与工具返回可把恶意指令间接带入模型上下文。",
      boundary: "检测降低风险但不提供绝对防护，必须限制模型可以触发的动作。",
      sourceId: "owasp-prompt-injection",
    },
    {
      metric: "向量化 ≠ 匿名化",
      title: "Embedding 仍需数据治理",
      finding: "向量数据库可能发生投毒、越权检索、跨租户泄露与敏感信息推断。",
      boundary: "加密存储不能替代检索时 ACL、租户隔离和来源治理。",
      sourceId: "owasp-vector-weaknesses",
    },
    {
      metric: "输入 / 行动 / 输出 / 监控",
      title: "四道控制门共同降低风险",
      finding: "把检测、身份、策略、DLP、审批和审计放在不同控制点，避免单点失效。",
      boundary: "控制组合需要按场景测试，不能承诺消除所有生成式 AI 风险。",
      sourceId: "nist-genai-profile",
    },
  ],
};
