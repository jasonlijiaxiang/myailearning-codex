const evidence = (sourceId, supports) => ({ sourceId, supports: supports.includes("支持") ? supports : `支持${supports}` });

export const aiApplicationEngineeringBrief = {
  slug: "ai-application-engineering",
  definition: "AI 应用工程（AI Application Engineering）把模型、Prompt、检索、工具、工作流、策略、评估和运行配置视为一个可版本化、可测试、可发布、可回滚的软件系统；GenAIOps 则把这些非确定性组件的变更接入持续交付与运行改进。",
  position: "位于应用模式与工程保障之间，负责把 RAG、Agent、多模态和模型能力组合成可交付应用；它复用评估、安全、网关和可观测能力，但重点回答一次跨组件变更如何形成同一个发布单元。",
  presentation: "lifecycle",
  principleTitle: "一个生成式 AI 应用如何从实验进入可控生产",
  principles: [
    { zh: "任务契约", en: "Task Contract", explanation: "先固定用户、输入、业务终态、不可接受错误与人工接管，再决定模型和组件。", decision: "用可验证任务成功定义应用，而不是用一次回答看起来不错定义成功。" },
    { zh: "配置成套", en: "Configuration Bundle", explanation: "模型、Prompt、检索索引、工具 Schema、编排、护栏和运行参数共同决定行为，必须保留兼容关系。", decision: "把跨组件配置绑定成发布清单，不单独升级其中一个名称。" },
    { zh: "分层测试", en: "Layered Testing", explanation: "确定性代码用单元与集成测试，非确定输出用数据集、规则、模型裁判和人工复核，端到端再验证业务终态。", decision: "失败先归因到组件或契约，再决定修模型、数据、代码或策略。" },
    { zh: "受控发布", en: "Controlled Release", explanation: "离线回归、影子、灰度、保护组和回滚共同管理真实分布与供应商变化。", decision: "每次发布都绑定评估证据、风险门槛、观察窗口和停止条件。" },
    { zh: "持续改进", en: "Continuous Improvement", explanation: "线上失败经脱敏与裁决后进入回归集，变更仍需重新通过发布门。", decision: "生产数据是待审证据，不是可以自动训练或调参的真值。" },
  ],
  decisions: [
    { question: "是否需要独立的 GenAIOps 流水线？", signal: "模型、Prompt、检索、工具或编排经常变化，现有 CI/CD 只能证明代码构建成功。", recommendation: "保留软件 CI/CD，再增加应用成套版本、评估数据、风险门和线上证据；从一个高价值应用建立最小流水线。", boundary: "GenAIOps 不是替换 DevOps、DataOps 或 MLOps，而是连接它们在生成式应用中的职责。" },
    { question: "什么应该算作一个发布版本？", signal: "团队能看到模型版本，却无法解释 Prompt、索引、工具或策略何时变化。", recommendation: "使用发布清单绑定应用代码、模型与参数、Prompt、数据/索引、工具契约、策略、评估和基础设施配置。", boundary: "同一代码提交不表示外部模型、检索内容或远程工具没有变化。" },
    { question: "影子流量还是直接 A/B 测试？", signal: "新版本需要接触真实分布，但结果可能影响用户或产生工具副作用。", recommendation: "先用回放和无副作用影子验证，再对低风险、可撤销流量灰度；高影响动作只记录拟议结果。", boundary: "影子不能执行不可逆动作，也不能未经治理保存全部生产输入。" },
    { question: "模型升级能否与应用无关？", signal: "供应商升级、停服或新能力要求改变 Prompt、工具或上下文格式。", recommendation: "把模型变更视为应用变更，重跑兼容、质量、安全、成本和容量测试，并保留旧版本或已验证回退。", boundary: "API 兼容不等于行为、Token、拒答和工具调用兼容。" },
    { question: "平台应统一到什么程度？", signal: "各团队重复建设评估、发布、观测和凭据，但应用模式与风险不同。", recommendation: "统一清单、评估执行、发布门、遥测和证据接口，允许 RAG、Agent、多模态保留专用流水线。", boundary: "统一控制面不应把所有应用强制成同一模型、框架、指标或卡片数量。" },
  ],
  deepDiveTitle: "从组件版本走向可重放的应用发布单元",
  deepDiveLead: "生成式 AI 的生产风险常来自组件组合而非单个模型。应用工程要能回答某次输出到底由哪组资产、策略和外部状态共同产生。",
  deepDives: [
    { kind: "sequence", eyebrow: "GENAI DELIVERY", title: "生成式 AI 应用的七段交付链", intro: "每一段都要有输入、输出、负责人、证据和回退，而不是只把 Prompt 放进 Git。", sourceIds: ["google-genai-app-lifecycle", "azure-foundation-model-lifecycle", "aws-genai-lifecycle"], items: [
      { name: "定义与选型", en: "Frame & Select", mechanism: "固定任务、风险、质量、时延和成本，再选择模型与应用模式。", decision: "保留非生成式基线。", boundary: "模型榜单不能替代客户任务。" },
      { name: "组装与实验", en: "Compose & Experiment", mechanism: "组合 Prompt、上下文、检索、工具、工作流和策略，在固定数据集上比较。", decision: "单变量实验优先。", boundary: "局部提升可能破坏其他组件契约。" },
      { name: "验证与发布", en: "Validate & Release", mechanism: "分层测试后形成配置清单，经影子、灰度和保护组进入生产。", decision: "Go / No-Go 绑定版本证据。", boundary: "构建成功不能证明语义正确。" },
      { name: "监控与改进", en: "Observe & Improve", mechanism: "关联版本、质量、风险、时延、成本和业务结果，裁决新失败后再进入下一轮。", decision: "先恢复业务，再优化模型。", boundary: "线上反馈不是自动真值。" },
    ] },
    { kind: "matrix", eyebrow: "CHANGE IMPACT", title: "一次变化需要重测哪些层", intro: "变化半径由兼容关系决定，不能只按改动文件数量判断。", sourceIds: ["azure-foundation-model-lifecycle", "azure-genaiops", "google-genai-app-lifecycle"], items: [
      { name: "模型或版本", en: "Model", mechanism: "影响能力、Token、Prompt、工具调用、拒答、延迟和价格。", decision: "重跑全应用基线与容量测试。", boundary: "同一家族小版本也可能行为漂移。" },
      { name: "Prompt 或编排", en: "Prompt / Orchestration", mechanism: "改变指令、上下文顺序、分支、重试和停止条件。", decision: "测试任务切片、工具副作用和失败恢复。", boundary: "更短轨迹不必然更可靠。" },
      { name: "检索或工具", en: "Data / Tool", mechanism: "改变可见事实、权限、Schema、错误和业务状态。", decision: "验证时效、撤权、契约与幂等。", boundary: "接口可用不表示业务结果正确。" },
      { name: "策略或运行环境", en: "Policy / Runtime", mechanism: "改变路由、护栏、缓存、并发、地域和观测。", decision: "回放策略并验证保护组与回滚。", boundary: "基础设施健康不表示质量未退化。" },
    ] },
  ],
  criticalBoundary: "AI 应用工程不是把所有 AI 组件塞进一条流水线。它要保留 DevOps、DataOps、MLOps、评估、安全和业务系统各自的事实源，同时用一个发布清单和端到端任务证据管理它们的兼容关系。",
  cloudHooks: [
    { stage: "开发与实验（Develop）", services: "代码仓库、Prompt 管理、实验跟踪、数据集与沙箱", value: "让任务、组件和实验结果可复现。", discover: "现在一次效果提升能否回到具体模型、Prompt、数据和工具版本？" },
    { stage: "验证与门禁（Validate）", services: "评估平台、安全测试、合约测试、策略即代码", value: "把质量、风险、性能和成本变成发布证据。", discover: "哪些错误必须单独阻断发布？裁判与人工如何校准？" },
    { stage: "发布与流量（Release）", services: "CI/CD、模型路由、AI 网关、影子、灰度与回滚", value: "让跨组件版本以可控流量进入生产。", discover: "模型升级时 Prompt、索引、工具与策略怎样保持正确配套？" },
    { stage: "观测与反馈（Operate）", services: "Trace、日志、在线评估、工单与事件响应", value: "把线上任务、版本和业务终态形成改进闭环。", discover: "一次客户失败能否定位到负责组件，并验证恢复后的业务状态？" },
  ],
  relatedSlugs: ["evaluation", "prompt-engineering", "rag", "ai-agent", "ai-ops", "ai-gateway", "security", "ai-finops"],
  qa: [
    { q: "GenAIOps 与传统 DevOps 有什么不同？", a: "DevOps 管理软件代码和基础设施交付；GenAIOps 还要管理模型、Prompt、检索数据、工具、评估和非确定输出的组合变化。", depth: "两者应叠加而不是替代。单元测试仍验证确定性代码，数据集与人工裁决验证语义质量，端到端测试验证业务终态，发布清单把它们绑定到同一版本。", ask: "追问客户：当前流水线能证明哪些组件没有退化，哪些只证明构建和部署成功？", tag: "职责边界", basis: "生成式应用生命周期 + DevOps 边界", evidence: [evidence("google-genai-app-lifecycle", "生成式应用需要适配 DevOps 与 MLOps，并管理 Prompt、检索库和 Adapter 等多类制品。"), evidence("azure-genaiops", "AI 工作负载同时需要 DevOps、DataOps、MLOps 与 GenAIOps。")], addedAt: "2026-07-21" },
    { q: "为什么只版本化 Prompt 还不够？", a: "因为同一 Prompt 在不同模型、检索数据、工具 Schema、策略和运行参数下可能产生不同结果。", depth: "发布清单至少绑定应用代码、模型与参数、Prompt、数据或索引、工具契约、编排、策略和评估报告。外部服务还要记录可获得的稳定版本或变更时间。", ask: "追问客户：今天能否从一次生产输出还原当时完整配置和外部依赖？", tag: "发布清单", basis: "成套配置 + 可重放性", evidence: [evidence("azure-foundation-model-lifecycle", "Prompt、配置、编排和模型版本需要正确配套。"), evidence("google-genai-app-lifecycle", "部署需要管理 Prompt、Chain、Embedding 模型、检索存储和 Adapter 等制品。")], addedAt: "2026-07-21" },
    { q: "模型供应商宣布兼容升级，是否可以跳过回归？", a: "不可以。接口兼容不保证行为、Token、工具调用、拒答、延迟、成本或安全表现一致。", depth: "先在固定任务与保护组上比较新旧版本，再验证 Prompt、工具和数据兼容；必要时调整应用并作为一组发布。对停服升级还要预先演练替代、回退和数据迁移。", ask: "追问客户：升级最可能改变哪些关键任务和工具副作用？旧版本能保留多久？", tag: "模型升级", basis: "模型生命周期设计", evidence: [evidence("azure-foundation-model-lifecycle", "模型变化可能要求同步修改 Prompt、编排、Grounding 数据和硬件。")], addedAt: "2026-07-21" },
    { q: "怎样测试一个输出不确定的 AI 应用？", a: "把确定性契约与语义质量分开：前者使用断言，后者使用代表性数据、量表、模型裁判和人工复核。", depth: "端到端还要验证工具后置条件、权限、失败恢复和业务终态。总体平均分不能掩盖高风险错误，Judge 需要与人工校准并保存版本。", ask: "追问客户：哪些结果可以确定性验证，哪些需要人工裁决，哪些错误零容忍？", tag: "测试方法", basis: "分层评估 + 业务终态", evidence: [evidence("aws-genai-lifecycle", "生成式应用生命周期需要持续评估集成组件和生产表现。"), evidence("openai-eval-best-practices", "任务特定、持续评估和人工校准是可靠评估基础。")], addedAt: "2026-07-21" },
    { q: "影子发布会不会造成重复业务动作？", a: "如果影子路径可以调用真实写工具，就会。影子只应产生可审计的拟议结果，副作用必须被隔离、替换或阻断。", depth: "读取也要遵守身份和数据最小化。对写入工具使用模拟端点、事务回滚或只比较动作计划；任何真实灰度都需要幂等键、预算、审批与补偿。", ask: "追问客户：影子流量会访问哪些真实数据和工具？怎样证明没有产生副作用？", tag: "影子发布", basis: "副作用隔离 + 受控流量", evidence: [evidence("azure-foundation-model-lifecycle", "路由、流量镜像和蓝绿发布可用于验证变更。"), evidence("nist-zero-trust", "每次资源访问仍需按真实主体和策略验证。")], addedAt: "2026-07-21" },
    { q: "线上失败是否应该自动加入评估集？", a: "不应该直接加入。需要先脱敏、去重、确认来源并裁决真正期望结果。", depth: "未经确认的用户反馈、模型输出或业务结果可能包含噪声、攻击、隐私和错误标签。只有能代表新分布或系统缺陷的案例才进入冻结回归集，并记录采集条件和责任人。", ask: "追问客户：谁判断一条线上失败属于数据、模型、工具还是业务规则问题？", tag: "反馈治理", basis: "持续评估 + 数据治理", evidence: [evidence("google-genai-app-lifecycle", "开发、评估、监控和持续改进形成反馈循环。"), evidence("openai-eval-best-practices", "生产分布样本应经过任务化评估设计。")], addedAt: "2026-07-21" },
    { q: "RAG、Agent 和多模态应用能共用一套发布门吗？", a: "可以共用版本、审批、遥测和风险底线，但必须保留专用质量与失败测试。", depth: "RAG 要测检索与引用，Agent 要测工具、状态和副作用，多模态要测采集、解析和证据坐标。平台提供共同执行框架，各应用对自己的业务终态负责。", ask: "追问客户：希望统一的是控制面、工具链，还是把所有应用强行使用同一指标？", tag: "平台边界", basis: "共同控制 + 专用证据", evidence: [evidence("aws-genai-lifecycle", "生成式生命周期覆盖 Prompt、RAG、Agent 和模型定制等不同组件。"), evidence("azure-genaiops", "不同运营方法按应用、数据和模型职责组合使用。")], addedAt: "2026-07-21" },
    { q: "出现质量事故时应该先调 Prompt 还是先换模型？", a: "都不是默认答案。先恢复业务并沿版本、输入、检索、工具、策略和模型逐层归因。", depth: "可先回滚、降级或转人工，再用同一失败样本验证假设。未经归因同时调整多个组件，会让修复不可证实并可能引入新退化。", ask: "追问客户：事故发生前哪些组件发生了变化？有没有可用的已验证发布清单？", tag: "事故归因", basis: "可重放发布 + 单变量验证", evidence: [evidence("google-genai-app-lifecycle", "持续监控与改进需要管理应用各类制品和变化。"), evidence("azure-foundation-model-lifecycle", "模型、Prompt、编排与数据变化具有联动影响。")], addedAt: "2026-07-21" },
    { q: "什么时候不值得建设完整 GenAIOps 平台？", a: "只有少量低风险试验、变化很少且人工发布可可靠复核时，不必先建大平台。", depth: "仍要保留最小版本、数据集、发布记录和停止条件。随着应用、团队、供应商或风险增加，再把重复控制平台化；平台投资应由减少交付风险和重复劳动的证据支持。", ask: "追问客户：当前最频繁、最昂贵、最难解释的发布失败是什么？", tag: "建设边界", basis: "渐进成熟度 + 平台投资", evidence: [evidence("azure-genaiops", "运营方法按工作负载任务和成熟度组合采用。"), evidence("aws-genai-lifecycle", "生命周期从范围界定到持续改进逐步建立。")], addedAt: "2026-07-21" },
  ],
  evidenceCards: [
    { metric: "应用制品", title: "生成式应用的发布对象不止模型", finding: "Google Cloud 的生命周期文档把 Prompt 模板、Chain、Embedding 模型、检索存储和微调 Adapter 都列入部署制品。", boundary: "列出制品类别不等于提供跨厂商统一清单格式。", sourceId: "google-genai-app-lifecycle", accent: true },
    { metric: "版本配套", title: "Prompt、配置、编排与模型需要成套版本", finding: "Azure 架构指南要求架构能把特定 Prompt 和配置发送给正确模型版本，并通过流水线验证变化。", boundary: "产品示例不能替代客户自己的兼容与回滚测试。", sourceId: "azure-foundation-model-lifecycle" },
    { metric: "生命周期", title: "生成式 AI 需要从范围界定到持续改进", finding: "AWS Generative AI Lens 把范围、选型、定制、集成、部署和持续改进置于同一生命周期。", boundary: "Well-Architected 指南不是某个应用已经达到生产要求的认证。", sourceId: "aws-genai-lifecycle" },
    { metric: "方法边界", title: "GenAIOps 与 DevOps、DataOps、MLOps 协同", finding: "Microsoft 的架构指南把 AI 工作负载拆为应用开发、数据处理和模型管理，并组合相应运营方法。", boundary: "方法名称不能替代清晰的资产、责任和验收契约。", sourceId: "azure-genaiops" },
  ],
};

export const aiFinopsBrief = {
  slug: "ai-finops",
  definition: "AI FinOps 把模型 API、训练与推理算力、数据、检索、工具、网络、软件和人工运营成本，归因到具体产品、任务和成功业务结果，由工程、产品、财务、采购与管理者共同持续决策。",
  position: "横跨方案、应用、模型、数据与基础设施层，负责把技术用量翻译为单位经济性、预算、预测、异常和价值；它复用网关与可观测数据，但不等同于账单报表或单纯压低 Token 单价。",
  presentation: "loop",
  principleTitle: "AI 成本如何从一次调用走向可经营的业务价值",
  principles: [
    { zh: "完整成本边界", en: "Cost Boundary", explanation: "成本包含 API、算力、存储、网络、数据、工具、评估、安全、人工和失败重试。", decision: "先画服务链和责任，再决定纳入哪些直接与间接成本。" },
    { zh: "稳定归因", en: "Allocation", explanation: "租户、产品、场景、任务、模型、环境和负责人形成共同标签，跨 Agent 与异步任务还要保持关联。", decision: "先覆盖能改变决策的维度，不追求无法维持的标签大全。" },
    { zh: "单位经济", en: "Unit Economics", explanation: "Token、GPU 小时和调用次数是技术用量，真正经营单位应接近合格回答、解决工单、完成任务或形成收入。", decision: "同时报告单位用量、成功率和每个成功结果的全成本。" },
    { zh: "优化有门", en: "Guardrailed Optimization", explanation: "路由、缓存、批处理、量化和预留可以降本，也可能损害质量、时延、隔离与恢复。", decision: "任何优化必须保持质量、风险和 SLO 门槛。" },
    { zh: "持续经营", en: "Operate", explanation: "实验、PoC、生产和退役阶段使用不同预算、预测窗口和决策节奏。", decision: "让异常、预算和价值复盘进入产品与架构路线，而不是月底解释账单。" },
  ],
  decisions: [
    { question: "AI 是否需要独立 FinOps 范围？", signal: "成本跨 API、GPU、SaaS、数据和人工，波动与创新容忍度明显不同于现有云范围。", recommendation: "只有独立范围能改善投资、归因或优化决策时才建立；否则在现有 FinOps 范围内增加 AI 维度。", boundary: "范围越多治理开销越大，不能因主题热门就单独建账。" },
    { question: "最重要的单位成本是什么？", signal: "团队能报告 Token 和 GPU 利用率，却无法说明业务产出。", recommendation: "为每个场景选择可验证成功单位，同时保留技术驱动项用于归因。", boundary: "没有可靠成功判定时只能报告成本区间和代理指标。" },
    { question: "API 还是自建推理更便宜？", signal: "调用规模、峰谷、模型组合、数据边界与团队能力已经相对稳定。", recommendation: "在同一质量和 SLO 下比较 API 全价、保底容量、自建 Goodput、闲置、软件、能耗、人员和退出成本。", boundary: "单价或峰值吞吐不能代表每个达标结果的持续成本。" },
    { question: "先路由、缓存还是换小模型？", signal: "成本结构已经能按任务、输入输出、命中、重试和失败切片。", recommendation: "优先消除无价值调用和重试，再测试缓存、上下文、路由与模型变化；每一步保留保护组。", boundary: "降本不能跨越隐私、质量、高风险任务或供应连续性底线。" },
    { question: "怎样给 Agent 设置预算？", signal: "轮次、工具、检索和子 Agent 使单任务成本长尾且可能循环。", recommendation: "同时设置总预算、步骤与时间上限、工具费用门槛、人工升级和业务完成条件。", boundary: "过早截断会把支出从模型转移到人工返工或客户失败。" },
  ],
  deepDiveTitle: "从账单维度走向单位成功成本",
  deepDiveLead: "AI FinOps 不是月底找贵资源，而是把任务、版本、质量、风险和成本放进同一个可行动的数据模型。",
  deepDives: [
    { kind: "sequence", eyebrow: "COST TO VALUE", title: "AI 成本经营的五段闭环", intro: "只有成本能回到消费者和结果，工程优化才有业务意义。", sourceIds: ["finops-ai-category", "finops-framework", "finops-ai-overview"], items: [
      { name: "界定范围", en: "Scope", mechanism: "确定产品、团队、环境、技术类别和生命周期阶段。", decision: "由要改善的业务决策定义范围。", boundary: "AI 费用可能同时属于多个经营视角。" },
      { name: "采集与归因", en: "Ingest & Allocate", mechanism: "连接账单、模型用量、基础设施、Trace、合同和人工成本。", decision: "优先打通高价值场景。", boundary: "无消费者和任务 ID 的费用只能共享分摊。" },
      { name: "建立单位经济", en: "Unit Economics", mechanism: "把总成本除以经过质量和业务确认的成功单位。", decision: "技术单位与业务单位成对展示。", boundary: "低质量输出不能计为成功产出。" },
      { name: "优化与验证", en: "Optimize", mechanism: "调整架构、用量、价格和运营流程，并用保护组验证。", decision: "先去浪费，再改变能力。", boundary: "成本下降可能伴随质量或风险转移。" },
      { name: "预算与复盘", en: "Operate", mechanism: "按实验、规模化和生产稳定阶段预测、预警与复盘投资。", decision: "让预算跟随学习证据。", boundary: "创新期预测误差不能用生产稳定期标准解释。" },
    ] },
    { kind: "matrix", eyebrow: "COST STACK", title: "AI 全成本的六个责任域", intro: "同一任务可能同时消耗托管模型、基础设施、数据、工具和人工。", sourceIds: ["finops-ai-category", "finops-ai-overview", "opentelemetry-semconv"], items: [
      { name: "模型与 Token", en: "Model", mechanism: "输入、输出、缓存、批处理、微调和供应商费率。", decision: "按任务与版本归因。", boundary: "每 Token 单价不等于每次成功成本。" },
      { name: "算力与平台", en: "Compute", mechanism: "GPU、CPU、内存、存储、网络、队列、闲置与软件。", decision: "用 Goodput 与 SLO 衡量。", boundary: "高利用率可能损害在线余量。" },
      { name: "数据与检索", en: "Data", mechanism: "采集、清洗、Embedding、索引、查询、更新与删除传播。", decision: "按数据产品和使用者分摊。", boundary: "少检索可能增加错误和人工。" },
      { name: "工具与工作流", en: "Tooling", mechanism: "外部 API、沙箱、Agent 轮次、重试和事件处理。", decision: "按端到端任务归因。", boundary: "重复调用可能来自跨层重试放大。" },
      { name: "质量与风险", en: "Assurance", mechanism: "评估、红队、监控、审批、审计和事故处置。", decision: "作为交付成本而非可选开销。", boundary: "省略保证会把成本延后为故障。" },
      { name: "人工与变更", en: "People", mechanism: "数据准备、集成、复核、支持、采购、迁移和供应商管理。", decision: "在 TCO 中显式计入。", boundary: "自动化可能把工作转移而非消除。" },
    ] },
  ],
  criticalBoundary: "AI FinOps 的目标是最大化经过质量与风险门槛的业务价值，不是把模型调用压到最低。没有任务、消费者、版本和业务终态的成本数据只能解释账单，不能可靠指导架构。",
  cloudHooks: [
    { stage: "采集与分配（Inform）", services: "云账单、模型用量、标签、Trace、合同与成本数据仓库", value: "把费用连接到产品、任务、模型、租户和环境。", discover: "当前有多少 AI 费用无法回答由谁、为哪个任务消耗？" },
    { stage: "价值与预算（Value）", services: "BI、规划、预算、Showback / Chargeback、业务指标", value: "建立单位经济、预测和投资阶段。", discover: "一个合格结果怎样确认？PoC 与生产使用同一预算逻辑吗？" },
    { stage: "工程优化（Optimize）", services: "模型路由、缓存、批处理、量化、调度、容量与采购", value: "在质量和 SLO 门槛内减少浪费与改善费率。", discover: "最大成本来自有效需求、失败重试、过度能力还是闲置供给？" },
    { stage: "持续经营（Operate）", services: "预算告警、异常检测、策略、评审与投资委员会", value: "让异常、变更和价值证据进入产品决策。", discover: "谁有权扩大、限制或停止一个持续不达标的 AI 投资？" },
  ],
  relatedSlugs: ["solution-patterns", "model-landscape", "ai-application-engineering", "ai-gateway", "ai-ops", "llm-inference", "ai-infra-platform", "ai-infra-compute"],
  qa: [
    { q: "AI FinOps 是否就是统计 Token 成本？", a: "不是。Token 只是部分模型服务的技术用量，AI 全成本还包括算力、数据、检索、工具、网络、评估、安全、人工和失败。", depth: "Token 数据适合解释输入输出结构和供应商账单，但不能覆盖自建 GPU、固定承诺、SaaS 席位或人工复核。最终应回到产品、任务和成功业务结果。", ask: "追问客户：除模型账单外，哪些团队和系统正在为同一 AI 任务付费？", tag: "成本边界", basis: "AI 技术类别 + TCO", evidence: [evidence("finops-ai-category", "AI 支出跨越模型服务、云、数据中心、SaaS 和多类供应商。"), evidence("finops-ai-overview", "AI 成本治理需要连接业务价值和完整技术使用。")], addedAt: "2026-07-21" },
    { q: "什么时候应该建立独立 AI FinOps 范围？", a: "只有当 AI 的业务目标、波动、归因或治理要求需要不同决策时；不是所有 AI 费用都要另立范围。", depth: "可以先在现有云或产品范围增加 AI 标签与指标。如果领导层需要独立投资节奏、跨技术类别归因或不同创新容忍度，再建立有明确退出条件的范围。", ask: "追问客户：独立范围将改善哪一项预算、架构或投资决定？", tag: "范围设计", basis: "FinOps Scopes", evidence: [evidence("finops-scopes", "新范围只应在不同业务结果、约束或决策情境需要时建立。"), evidence("finops-ai-category", "AI 费用可按组织目标形成差异化关注范围，但不要求全部纳入。")], addedAt: "2026-07-21" },
    { q: "每百万 Token 更便宜的模型，为什么总成本可能更高？", a: "因为它可能需要更长 Prompt、更多输出、更多重试、检索或人工修正，最终成功率也可能更低。", depth: "应在同一任务和质量门槛下比较输入、输出、缓存、工具、重试、P95、失败和人工成本。更高单价模型若减少轮次和返工，单位成功成本反而可能更低。", ask: "追问客户：当前成本按调用、Token，还是按合格业务结果比较？", tag: "单位经济", basis: "技术用量 + 成功结果", evidence: [evidence("finops-framework", "Unit Economics 属于量化业务价值的核心能力。"), evidence("finops-ai-category", "AI 需要把成本与模型输出消费者和业务产出连接。")], addedAt: "2026-07-21" },
    { q: "GPU 利用率低是否表示应该减少容量？", a: "不一定。在线服务可能为尾部时延、故障和突发流量保留余量，训练也可能受数据、网络或成组调度限制。", depth: "同时看 Goodput、排队、SLO、拓扑碎片、故障、峰谷和单位达标结果成本。先定位闲置原因，再决定共享、调度、预留或缩容。", ask: "追问客户：低利用期间是否仍满足必要余量？等待的是计算、数据、网络还是成组资源？", tag: "容量经济", basis: "有效产出 + 服务余量", evidence: [evidence("finops-ai-overview", "AI 成本治理需要优化 GPU 分配并持续关联使用和结果。"), evidence("finops-ai-category", "架构与工作负载放置应服务成本和业务价值。")], addedAt: "2026-07-21" },
    { q: "怎样给多 Agent 任务分摊成本？", a: "先用统一父任务 ID 关联子 Agent、模型、检索、工具与人工，再按可解释的消费者或业务结果归集。", depth: "共享组件可按请求、资源时间或约定比例分摊，但要公开规则和未分配金额。不要把子调用成本丢给平台公共池，否则无法比较编排收益和循环浪费。", ask: "追问客户：一次最终任务能否追到所有子任务、重试、工具和人工升级？", tag: "Agent 归因", basis: "端到端任务 + 分摊规则", evidence: [evidence("finops-ai-category", "多层 AI 架构和多 Agent 工作负载会增加成本分配复杂度。"), evidence("opentelemetry-semconv", "生成式 AI Trace 可关联模型调用和使用量属性。")], addedAt: "2026-07-21" },
    { q: "成本异常应该自动停掉 AI 服务吗？", a: "通常不应仅凭费用阈值自动全停。应结合任务、风险、业务影响和异常来源采取限流、降级、审批或隔离。", depth: "突增可能来自攻击、循环、供应商计费变化，也可能是正常业务高峰。高风险写操作可快速阻断，核心服务则优先使用预算上限、保护组和已验证降级。", ask: "追问客户：哪些支出异常意味着攻击或故障，哪些代表正常业务增长？", tag: "异常管理", basis: "成本异常 + 业务连续性", evidence: [evidence("finops-ai-category", "AI 支出波动和异常管理需要更高频、情境化处理。"), evidence("finops-framework", "异常管理属于理解使用与成本的能力。")], addedAt: "2026-07-21" },
    { q: "缓存命中率提高是否一定降本？", a: "不一定。误命中、过期、跨租户泄漏和失效维护可能增加业务风险与人工成本。", depth: "只对可复用、权限一致、时效明确的请求测净收益，同时记录命中后的任务成功、错误复用、存储、检索和失效成本。高命中率不能替代正确性。", ask: "追问客户：哪些响应可被谁复用、多久有效，错误复用的代价是什么？", tag: "优化边界", basis: "缓存收益 + 风险门槛", evidence: [evidence("finops-ai-category", "使用优化需与业务价值和风险共同判断。"), evidence("nist-zero-trust", "资源访问不能因技术复用绕过身份与策略验证。")], addedAt: "2026-07-21" },
    { q: "API 与自建模型应该怎样做成本比较？", a: "在同一质量、容量和责任边界下比较全成本，而不是拿 API 标价对比 GPU 采购价。", depth: "API 要计调用、数据、配额、地域和供应连续性；自建要计设备、闲置、能耗、网络、软件、团队、升级、故障和退出。结果以稳定工作负载下每个达标任务成本呈现。", ask: "追问客户：负载、质量和增长是否已稳定到足以支持长期容量承诺？", tag: "采购选型", basis: "TCO + 工作负载放置", evidence: [evidence("finops-framework", "架构与工作负载放置、费率优化和单位经济共同支持技术价值。"), evidence("finops-ai-category", "AI 支出横跨托管服务、基础设施和多种采购渠道。")], addedAt: "2026-07-21" },
    { q: "AI 项目没有直接收入，怎样衡量价值？", a: "使用与业务目标相连的可验证结果，如处理时间、解决率、产能、风险避免、体验或韧性，并同时报告质量和归因边界。", depth: "建立人工或现有系统基线，记录采用率、节省时间是否转化为实际容量，以及副作用与维护成本。不能把生成次数、活跃用户或理论节省自动等同于价值。", ask: "追问客户：如果项目成功，哪个业务流程或风险状态会真实改变，如何观测？", tag: "价值衡量", basis: "业务价值 + 基线", evidence: [evidence("finops-ai-overview", "AI 投资需要与成本效率、韧性、体验、生产率、可持续性和增长等业务价值连接。"), evidence("finops-framework", "FinOps 以最大化技术业务价值为目标。")], addedAt: "2026-07-21" },
  ],
  evidenceCards: [
    { metric: "正式类别", title: "FinOps Framework 已单列 AI 技术类别", finding: "FinOps Foundation 当前框架把 AI 与公共云、SaaS、数据平台、私有云、许可证和数据中心并列为技术类别。", boundary: "列为类别不表示每个组织都必须建立独立 AI Scope。", sourceId: "finops-framework", accent: true },
    { metric: "AI 差异", title: "AI 支出跨类别且归因更复杂", finding: "FinOps for AI 页面强调 AI 成本粒度、波动、跨供应商和多层架构会增加分配、预测与治理难度。", boundary: "这些行业指导不能替代组织自己的账单、架构和业务基线。", sourceId: "finops-ai-category" },
    { metric: "范围纪律", title: "只有改善决策时才建立新 Scope", finding: "FinOps Scopes 指南要求新范围由不同业务结果、约束或决策情境驱动，并保持少而有目的。", boundary: "AI 费用可同时出现在多个视角，分摊规则仍需组织定义。", sourceId: "finops-scopes" },
    { metric: "价值连接", title: "AI FinOps 不能停留在 Token 和 GPU", finding: "FinOps for AI Overview 把成本治理连接到业务影响、持续复盘与多类价值指标。", boundary: "行业框架不能证明某个 AI 项目已经产生 ROI。", sourceId: "finops-ai-overview" },
  ],
};

export const applicationFinopsCurriculum = {
  "ai-application-engineering": {
    lead: "AI 应用工程的核心不是选择一个编排框架，而是让模型、上下文、工具和策略在变化时仍能一起测试、发布、观察和回滚。",
    chapters: [
      { title: "任务契约与系统边界", en: "Task Contract", explanation: "明确用户、输入、权威状态、业务终态、风险、人工接管和非生成式基线，形成端到端验收对象。", decision: "先定义完成什么工作，再选择 RAG、Agent 或多模态。", boundary: "回答流畅不能代替业务系统确认完成。", sourceIds: ["aws-genai-lifecycle", "google-genai-app-lifecycle"] },
      { title: "生成式应用制品图", en: "Artifact Graph", explanation: "代码、模型、Prompt、检索数据、Embedding、工具 Schema、编排、策略和运行配置构成有兼容关系的制品图。", decision: "用发布清单绑定一次可重放组合。", boundary: "Git 提交无法自动固定外部服务和数据状态。", sourceIds: ["google-genai-app-lifecycle", "azure-foundation-model-lifecycle"] },
      { title: "实验与内循环", en: "Inner Loop", explanation: "在固定数据集上做可比较实验，记录假设、单变量变化、评估器和失败样本，避免凭主观挑选结果。", decision: "优先证伪最不确定假设。", boundary: "调参样本不能继续充当无偏测试集。", sourceIds: ["azure-foundation-model-lifecycle", "openai-eval-best-practices"] },
      { title: "分层测试与契约", en: "Layered Tests", explanation: "分别验证代码、Prompt、检索、工具、策略、性能和端到端业务结果，并为非确定输出设置量表与人工校准。", decision: "让失败指向可负责组件。", boundary: "总分不能掩盖高风险小切片。", sourceIds: ["aws-genai-lifecycle", "openai-eval-best-practices"] },
      { title: "外循环与成套发布", en: "Outer Loop", explanation: "通过离线门、影子、灰度、保护组和回滚，把评估通过的配置组合送入生产并保留版本证据。", decision: "每次放量都有停止条件。", boundary: "部署成功不代表真实分布下可接受。", sourceIds: ["azure-foundation-model-lifecycle", "azure-genaiops"] },
      { title: "模型与依赖变化", en: "Change Management", explanation: "模型升级会影响 Prompt、工具、数据、硬件和成本；远程工具、知识库与策略变化也可能使原批准失效。", decision: "按影响半径决定重测范围。", boundary: "API 兼容不是语义兼容。", sourceIds: ["azure-foundation-model-lifecycle"] },
      { title: "线上证据与事故", en: "Production Evidence", explanation: "Trace 连接版本、输入类别、检索、工具、质量、风险、成本和业务终态，事故先恢复再归因。", decision: "用已验证发布清单完成回滚。", boundary: "告警消失不代表客户影响结束。", sourceIds: ["azure-genaiops", "opentelemetry-semconv"] },
      { title: "平台化与团队责任", en: "Platform & Ownership", explanation: "平台统一制品登记、评估执行、发布、策略和遥测，应用团队负责任务、数据、失败和业务结果。", decision: "从重复控制和高风险变更中提炼平台能力。", boundary: "平台不能替应用团队接受业务风险。", sourceIds: ["azure-genaiops", "google-genai-app-lifecycle"] },
    ],
  },
  "ai-finops": {
    lead: "AI FinOps 的学习目标是让每笔技术消耗都能连接到任务、消费者、质量和价值，从而支持投资、架构与运营决策。",
    chapters: [
      { title: "FinOps 框架与 AI 范围", en: "Framework & Scope", explanation: "FinOps 通过工程、财务和业务协作最大化技术价值；AI 可作为技术类别或特定业务 Scope，但范围由要改善的决策定义。", decision: "只在独立范围能改善决策时建立。", boundary: "AI 标签不是新的组织孤岛。", sourceIds: ["finops-framework", "finops-scopes", "finops-ai-category"] },
      { title: "AI 全成本地图", en: "Cost Map", explanation: "模型、算力、数据、工具、网络、软件、保证和人工共同构成 Cost to Serve，并跨实验、生产和退役变化。", decision: "从服务链确定直接与间接成本边界。", boundary: "账单只覆盖部分真实投入。", sourceIds: ["finops-ai-category", "finops-ai-overview"] },
      { title: "用量采集与任务归因", en: "Usage & Allocation", explanation: "把供应商用量、基础设施、Trace、标签、合同和共享平台费用连接到产品、任务、租户、版本和负责人。", decision: "优先覆盖能改变决定的维度。", boundary: "无法归因的共享费应显式报告。", sourceIds: ["finops-ai-category", "opentelemetry-semconv"] },
      { title: "单位经济与成功定义", en: "Unit Economics", explanation: "Token、GPU 小时和调用是成本驱动项，成功回答、解决工单和完成任务才是价值单位。", decision: "技术单位与业务单位同时保留。", boundary: "没有质量门的输出数量不是价值。", sourceIds: ["finops-framework", "finops-ai-category"] },
      { title: "预算、预测与生命周期", en: "Budget & Forecast", explanation: "探索期不确定性高，生产期需要稳定预测和异常门槛；投资阶段改变预算周期、承诺方式和允许偏差。", decision: "用证据决定扩大、限制或停止。", boundary: "实验波动不能直接套用成熟生产预算。", sourceIds: ["finops-ai-category", "finops-scopes"] },
      { title: "架构与使用优化", en: "Architect & Optimize", explanation: "路由、缓存、上下文、批处理、量化、调度和工作负载放置从不同环节改变成本，并会重新分配质量、容量与运营责任。", decision: "先消除失败、重复和闲置，再改变能力。", boundary: "优化必须通过质量、风险和 SLO 门。", sourceIds: ["finops-framework", "finops-ai-overview"] },
      { title: "费率、采购与退出", en: "Rates & Procurement", explanation: "按需、承诺、API、自建和 SaaS 组合需要考虑规模稳定性、供应连续性、许可、人员和迁移。", decision: "在同一责任边界下比较 TCO。", boundary: "长期承诺会把预测误差转成闲置。", sourceIds: ["finops-ai-category", "finops-framework"] },
      { title: "异常、治理与价值复盘", en: "Operate & Review", explanation: "成本异常与质量、风险、业务需求和版本事件联合判断；产品、工程和财务共同复盘单位经济与投资状态。", decision: "让成本信号进入产品和架构路线。", boundary: "自动停服可能扩大业务损失。", sourceIds: ["finops-ai-category", "finops-ai-overview"] },
    ],
  },
};

export const applicationFinopsLearning = {
  "ai-application-engineering": {
    outcomes: ["定义生成式 AI 应用的完整发布单元", "设计确定性与非确定性分层测试", "使用影子、灰度与回滚管理变化", "把生产失败转成受治理的改进证据"],
    route: [
      { title: "应用制品图", learn: "标出模型、Prompt、数据、工具、编排、策略和环境。", checkpoint: "能解释任一输出由哪组版本产生。" },
      { title: "评估与发布门", learn: "按组件、风险和业务终态设计测试与保护组。", checkpoint: "每次放量都有证据和停止条件。" },
      { title: "变化运营", learn: "关联线上版本、失败、回滚和裁决后的回归样本。", checkpoint: "供应商或数据变化后能定位影响并安全恢复。" },
    ],
    labs: [
      { title: "制作一个 AI 发布清单", scenario: "RAG Agent 的模型、Prompt、索引和工具分别由不同团队更新。", tasks: ["列出全部运行制品与负责人", "定义兼容关系和版本标识", "绑定评估、审批、灰度和回滚"], deliverable: "可重放的发布清单与责任矩阵", acceptance: "任一生产请求能回到完整配置，单组件变更会触发正确重测。", sourceIds: ["google-genai-app-lifecycle", "azure-foundation-model-lifecycle"] },
      { title: "设计无副作用影子测试", scenario: "团队希望用真实流量比较新 Agent，但它会创建工单和发送消息。", tasks: ["划分读取与写入工具", "为副作用设计模拟、阻断和审计", "定义保护组、数据最小化和晋升门"], deliverable: "影子架构与副作用测试表", acceptance: "新版本接触真实分布但不会改变业务状态或泄露跨租户数据。", sourceIds: ["azure-foundation-model-lifecycle", "nist-zero-trust"] },
      { title: "演练一次模型停服升级", scenario: "当前模型将在一个月后退役，新版本改变工具调用和 Token 使用。", tasks: ["建立任务与接口兼容矩阵", "重跑质量、安全、容量与成本基线", "设计分批迁移、回退与客户影响观察"], deliverable: "升级计划、评估证据与回滚手册", acceptance: "新旧版本可解释比较，关键任务在截止日前完成受控迁移。", sourceIds: ["azure-foundation-model-lifecycle", "aws-genai-lifecycle"] },
    ],
  },
  "ai-finops": {
    outcomes: ["建立跨 API、算力、数据与人工的 AI 成本地图", "把成本归因到产品、任务和版本", "设计单位成功成本与价值指标", "在质量和风险门槛内优化预算与架构"],
    route: [
      { title: "经营问题与决策", learn: "明确要支持投资、预算、选型还是优化决定。", checkpoint: "AI Scope 有业务目标和退出条件。" },
      { title: "成本到任务归因", learn: "连接账单、用量、Trace、标签、合同和共享分摊。", checkpoint: "主要费用有消费者、版本和责任人。" },
      { title: "单位价值优化", learn: "用保护组比较成本、质量、风险、SLO 和业务结果。", checkpoint: "降本不会把代价转移给客户、人工或未来事故。" },
    ],
    labs: [
      { title: "计算一个客服 Agent 的单位成功成本", scenario: "团队只知道月度模型账单，不知道每次解决问题的成本。", tasks: ["连接会话、检索、模型、工具、人工和工单终态", "定义成功、转人工和失败", "按场景与版本计算成本区间"], deliverable: "成本地图、分摊规则与单位经济看板", acceptance: "主要成本可追到业务结果，未分配与假设被明确展示。", sourceIds: ["finops-ai-category", "finops-framework"] },
      { title: "比较 API 与自建推理", scenario: "调用量增长后团队计划采购 GPU 替代托管 API。", tasks: ["固定模型质量、长度、并发与 SLO", "计算 API、设备、闲置、能耗、网络、软件和人员", "做规模、利用率和供应变化敏感性分析"], deliverable: "同责任边界的 TCO 与决策区间", acceptance: "结论基于每个达标任务成本，并给出规模不确定时的停止条件。", sourceIds: ["finops-framework", "finops-ai-category"] },
      { title: "处置一次 Agent 成本异常", scenario: "夜间成本突然增长十倍，但接口错误率保持正常。", tasks: ["按任务、模型、版本、轮次、重试和工具切片", "区分业务增长、攻击、循环和计费变化", "设计限流、隔离、降级与恢复验证"], deliverable: "异常归因、处置记录和防回归门", acceptance: "在不盲目停掉核心业务的情况下阻止浪费并确认业务恢复。", sourceIds: ["finops-ai-category", "opentelemetry-semconv"] },
    ],
  },
};
