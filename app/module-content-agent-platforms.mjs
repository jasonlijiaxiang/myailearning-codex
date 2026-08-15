// Portable VeADK and AgentKit module content; central registries import these exports.
const freeze = Object.freeze;
const list = (values) => freeze(values.map((value) => freeze(value)));
const strings = (values) => freeze([...values]);
const datedQa = (value) => freeze({
  ...value,
  evidence: list(value.evidence.map((reference) => ({
    ...reference,
    supports: `该来源支持以下判断：${reference.supports.replace(/^(?:说明|支持)/, "").trim()}`,
  }))),
  addedAt: "2026-08-15",
});
const dive = (value) => freeze({
  ...value,
  sourceIds: strings(value.sourceIds),
  items: list(value.items),
});
const brief = (value) => freeze({
  ...value,
  principles: list(value.principles),
  decisions: list(value.decisions),
  deepDives: freeze(value.deepDives.map(dive)),
  cloudHooks: list(value.cloudHooks),
  relatedSlugs: strings(value.relatedSlugs),
  qa: freeze(value.qa.map(datedQa)),
  evidenceCards: list(value.evidenceCards),
});
const curriculum = (value) => freeze({
  ...value,
  chapters: freeze(value.chapters.map((chapter) => freeze({
    ...chapter,
    sourceIds: strings(chapter.sourceIds),
  }))),
});
const learning = (value) => freeze({
  outcomes: strings(value.outcomes),
  route: list(value.route),
  labs: freeze(value.labs.map((lab) => freeze({
    ...lab,
    tasks: strings(lab.tasks),
    sourceIds: strings(lab.sourceIds),
  }))),
});

const veadkSources = {
  agent: "veadk-agent-source-2026-08-15",
  runner: "veadk-runner-source-2026-08-15",
  integration: "veadk-agentkit-integration-2026-08-15",
  memory: "veadk-short-term-memory-2026-08-15",
  tools: "veadk-builtin-tools-2026-08-15",
};
const agentkitSources = {
  overview: "agentkit-platform-overview-2026-08-15",
  cli: "agentkit-cli-overview-2026-08-15",
  commands: "agentkit-cli-commands-2026-08-15",
  config: "agentkit-config-reference-2026-08-15",
  runtime: "agentkit-runtime-quickstart-2026-08-15",
  memory: "agentkit-memory-quickstart-2026-08-15",
  mem0Oss: "mem0-oss-overview-2026-08-15",
  mem0Compare: "mem0-platform-vs-oss-2026-08-15",
};

const veadkBrief = brief({
  slug: "veadk",
  definition: "VeADK 是面向 Agent 应用的开源 Python 开发套件，用代码组合模型、指令、工具、会话与记忆，并把一次请求交给 Runner 执行。",
  position: "它位于模型与业务服务之上、AgentKit 应用和云端 Runtime 之下，负责 Agent 逻辑与开发期执行，不替代企业身份、业务授权、共享状态、发布治理或权威业务系统。",
  presentation: "loop",
  principleTitle: "从 Agent 定义到可恢复执行的六个责任点",
  principles: [
    { zh: "版本化 Agent 定义", en: "Versioned Agent Definition", explanation: "Agent 把名称、模型、指令、工具和记忆配置形成可测试的代码对象。", decision: "把代码、模型、Prompt、工具 Schema 和运行配置作为同一候选版本验收。" },
    { zh: "Runner 执行循环", en: "Runner Execution Loop", explanation: "Runner 组织模型调用、工具请求、观察结果、事件与停止条件，使一次请求成为有状态执行。", decision: "区分模型输出、运行结束和业务终态，不用最终文本代替业务验收。" },
    { zh: "工具合同", en: "Tool Contract", explanation: "工具以明确用途、类型、错误和副作用合同连接外部能力，模型只提出调用。", decision: "应用在执行时重新校验身份、权限、参数、超时和幂等。" },
    { zh: "会话作用域", en: "Session Scope", explanation: "应用、用户和会话标识共同限定一段短期上下文与事件历史。", decision: "生产身份由可信服务端提供，不能直接采用可伪造的客户端声明。" },
    { zh: "分层状态", en: "Layered State", explanation: "短期会话、长期记忆和权威业务事实具有不同生命周期、隔离与纠错责任。", decision: "跨会话偏好进入受治理记忆；余额、订单和权限仍实时读取权威系统。" },
    { zh: "显式应用适配", en: "Explicit App Integration", explanation: "既有 root_agent 可通过集成入口封装为 AgentKit App，使开发定义进入应用合同。", decision: "分别验收本地应用适配和云端部署，不能把二者写成同一结果。" },
  ],
  decisions: [
    { question: "使用本地调试入口还是正式应用入口？", signal: "只需快速检查 Prompt/Tool，或需要稳定 API、资源绑定和后续部署。", recommendation: "开发期可用本地调试；集成验收使用显式 App 入口并固定依赖。", boundary: "本地页面可用不证明云端 Runtime、身份和网络可用。" },
    { question: "复用内置 Tool 还是自定义 Tool？", signal: "通用能力已覆盖，或业务系统需要专用 Schema、授权和错误语义。", recommendation: "通用读取与搜索优先复用官方 Tool；业务动作使用最小职责的自定义合同。", boundary: "可发现、可注册都不等于当前用户获准执行。" },
    { question: "短期会话使用什么存储？", signal: "单机实验、进程重启恢复，或多实例共享与故障切换。", recommendation: "本地实验可用 SQLite；多实例采用共享数据库或托管 Session 服务并做隔离回归。", boundary: "文件持久化不等于多实例一致性、备份和灾备。" },
    { question: "何时需要长期记忆？", signal: "确有跨会话偏好或任务连续性，且有主体、用途、纠错和删除规则。", recommendation: "先保留 Session 边界，再把少量合格候选写入持久化记忆后端。", boundary: "相似检索只能找相关内容，不能裁决真实性和当前有效性。" },
    { question: "何时接入 AgentKit？", signal: "本地 Agent 已稳定，需要应用合同、云端 Runtime、资源绑定和发布治理。", recommendation: "冻结 root_agent、入口、依赖和验收集后再进入 AgentKit 构建与部署。", boundary: "适配函数返回应用对象不等于已经上云。" },
  ],
  deepDiveTitle: "会话、记忆与应用适配的生产边界",
  deepDiveLead: "先沿交付与执行路径确认边界，再按症状定位身份、状态、工具、记忆或入口问题。",
  deepDives: [
    {
      kind: "sequence", eyebrow: "DELIVERY & EXECUTION CONTRACT", title: "VeADK 应用从定义到运行的五步验收路径", intro: "开发准备、应用适配和请求执行产生不同证据，不能只看最终回答。",
      sourceIds: [veadkSources.agent, veadkSources.runner, veadkSources.tools, veadkSources.integration, agentkitSources.memory],
      items: [
        { name: "冻结 Agent 定义", en: "Freeze Definition", mechanism: "绑定模型、指令、工具与状态配置。", decision: "记录候选版本与测试输入。", boundary: "名称一致不代表行为一致。" },
        { name: "封装应用合同", en: "Adapt Application", mechanism: "把 root_agent 交给 AgentKit 集成入口。", decision: "用 API、错误和版本合同验收。", boundary: "本地 API 不是云部署证据。" },
        { name: "建立会话", en: "Create Session", mechanism: "以应用、用户和会话范围读取事件。", decision: "先验证身份与作用域。", boundary: "会话 ID 不是认证凭据。" },
        { name: "运行模型与工具循环", en: "Run Loop", mechanism: "模型提出动作，应用执行后把结果送回下一轮判断。", decision: "限制调用、时间、Token 和副作用预算。", boundary: "Prompt 不能替代执行授权。" },
        { name: "保存必要状态", en: "Persist State", mechanism: "按后端保存会话事件；长期记忆走独立写入路径。", decision: "为重试、纠错和删除保留来源。", boundary: "事件写入不证明外部业务动作已经成功。" },
      ],
    },
    {
      kind: "diagnostic", eyebrow: "MEMORY TRIAGE", title: "无法召回时先区分五类机制", intro: "按作用域、后端、写入、调用和入口逐层排查。",
      sourceIds: [veadkSources.memory, veadkSources.runner, veadkSources.integration],
      items: [
        { name: "作用域不一致", en: "Scope Mismatch", mechanism: "应用、用户或会话标识变化。", decision: "记录实际三元组并做正反例。", boundary: "修正 ID 不能解决身份伪造。" },
        { name: "后端生命周期不匹配", en: "Backend Lifetime", mechanism: "进程内或文件后端不满足共享与恢复要求。", decision: "按实例数和恢复目标选后端。", boundary: "换后端仍需迁移与一致性验证。" },
        { name: "写入路径未闭环", en: "Write Path", mechanism: "应用完成写入请求后，目标后端是否保存并可检索仍需验证。", decision: "把写入确认与后续检索分成两项检查。", boundary: "等待不能掩盖写入失败。" },
        { name: "模型未调用记忆工具", en: "Tool Not Invoked", mechanism: "完整 Agent 路径受模型选择影响。", decision: "用直接搜索与 Agent 调用分层检查。", boundary: "强制业务步骤应由工作流保证。" },
        { name: "应用入口接线不同", en: "Integration Mismatch", mechanism: "调试入口与正式 App 可能使用不同服务装配。", decision: "显式打印并验收 Session/Memory 后端。", boundary: "临时兼容层不应成为生产架构。" },
      ],
    },
  ],
  criticalBoundary: "VeADK 管理 Agent 定义和开发期执行；身份、授权、共享状态与云端发布仍由应用和平台承担。最关键的两条边界是：工具注册不授予业务权限，本地调试通过也不代表 Runtime 已上线。版本升级后还要重新回归当前的继承与集成关系。",
  cloudHooks: [
    { stage: "模型与向量化", services: "模型 API、Embedding、密钥管理", value: "以受控配置连接模型推理和语义检索。", discover: "客户使用哪些模型、地域、配额和数据边界？" },
    { stage: "会话与记忆", services: "共享数据库、托管 Session、Mem0 或其他长期记忆服务", value: "使状态独立于单个进程生命周期。", discover: "哪些状态需要跨实例或跨会话，谁负责纠错和删除？" },
    { stage: "应用与 Runtime", services: "AgentKit App、构建与云端 Runtime", value: "把同一 Agent 定义连接到可部署应用合同。", discover: "入口、依赖、资源绑定和回退是否可重复？" },
    { stage: "身份与运行证据", services: "IAM、密钥、日志、Trace、指标与告警", value: "保留主体、调用、错误和版本证据。", discover: "一次请求能否追到模型、工具、状态和权威结果？" },
  ],
  relatedSlugs: ["agentkit", "ai-agent", "prompt-engineering", "mcp", "rag", "evaluation", "ai-ops"],
  qa: [
    { q: "VeADK 和 AgentKit 的职责有什么不同？", a: "VeADK 负责用代码定义和执行 Agent，AgentKit 负责把应用构建、部署并接入云端运行治理。", depth: "二者通过应用适配相连，但开发框架、应用合同和 Runtime 是三个独立验收面。", ask: "客户当前缺的是 Agent 逻辑、应用接口，还是云端运行治理？", tag: "产品定位", basis: "官方平台与集成文档", evidence: [{ sourceId: veadkSources.integration, supports: "说明 VeADK 到 AgentKit 应用的集成入口。" }, { sourceId: agentkitSources.overview, supports: "说明 AgentKit 的应用交付与运行范围。" }] },
    { q: "为什么使用 VeADK 时会出现 Google ADK 类型或日志？", a: "当前官方源码快照中的 VeADK Agent 与 Runner 复用或继承了 Google ADK 的部分类型和执行能力。", depth: "这是实现关系，不要求业务代码转为直接使用底层 API；升级任一依赖时应对 Agent、Runner、Session、Tool 和 Memory 做组合回归。", ask: "当前是否锁定了 VeADK 与底层依赖版本，并保留关键回归集？", tag: "继承与版本", basis: "当前官方源码快照", evidence: [{ sourceId: veadkSources.agent, supports: "支持当前 Agent 类的继承关系，不能外推未来版本。" }, { sourceId: veadkSources.runner, supports: "支持当前 Runner 实现关系，升级后需复核。" }] },
    { q: "Runner 和 Session 分别负责什么？", a: "Runner 负责一次执行循环，Session 保存特定应用、用户和会话范围内的事件与状态。", depth: "Runner 读取 Session、调用模型和工具并追加事件；Session 不授予业务权限，也不自动跨会话共享历史。", ask: "任务状态需要保留多久，哪些事件要跨实例恢复？", tag: "执行与状态", basis: "官方 Runner 与短期记忆文档", evidence: [{ sourceId: veadkSources.runner, supports: "说明 Runner 的执行职责。" }, { sourceId: veadkSources.memory, supports: "说明短期会话后端与作用域。" }] },
    { q: "Tool 已注册，是否代表当前用户获准使用且模型一定会调用？", a: "都不代表。注册只让模型看到能力，调用选择和执行授权仍是不同步骤。", depth: "可选工具可由模型判断；必须发生的控制放进确定性工作流。执行前仍要校验主体、资源、动作、参数和副作用。", ask: "该 Tool 是只读、可逆写入还是高影响动作，由谁授权？", tag: "工具边界", basis: "官方内置工具与 Agent 机制", evidence: [{ sourceId: veadkSources.tools, supports: "说明内置 Tool 的接入方式，不证明业务授权。" }, { sourceId: veadkSources.agent, supports: "说明 Agent 的工具配置关系。" }] },
    { q: "SQLite Session 能直接支撑多实例生产吗？", a: "通常不能；单机文件适合开发和恢复实验，多实例需要共享后端与一致性、备份和故障切换设计。", depth: "多实例还要验证同一会话的并发写、重复请求、路由切换、恢复点和隔离，不应把进程重启可恢复外推为分布式就绪。", ask: "目标实例数、并发写入、RPO/RTO 和数据地域要求是什么？", tag: "多实例状态", basis: "官方短期记忆后端边界", evidence: [{ sourceId: veadkSources.memory, supports: "说明短期记忆后端选项与本地数据库边界。" }] },
  ],
  evidenceCards: [
    { metric: "当前源码快照", title: "VeADK 扩展 Google ADK 的 Agent 抽象", finding: "固定版本的 VeADK Agent 当前继承 Google ADK LlmAgent，因此上游行为属于兼容性边界。", boundary: "该快照不保证未来继承关系、版本兼容或未经回归的应用行为。", sourceId: veadkSources.agent, accent: true },
    { metric: "多实例边界", title: "分布式持久化不同于进程本地状态", finding: "短期记忆文档把 MySQL 和 PostgreSQL 列为分布式持久化后端，区别于内存与本地文件选项。", boundary: "选择分布式后端也不自动证明故障切换、并发行为、租户隔离、保留和恢复。", sourceId: veadkSources.memory },
    { metric: "适配 ≠ 上云", title: "应用适配只是生产链的一段", finding: "官方集成提供把 VeADK Agent 封装为 AgentKit App 的入口。", boundary: "仍需独立完成构建、Runtime、身份、网络、资源绑定、观测和回退验收。", sourceId: veadkSources.integration, accent: true },
  ],
});

const agentkitBrief = brief({
  slug: "agentkit",
  definition: "AgentKit 是面向 Agent 应用的开发与运行平台，通过 SDK、CLI 和控制面管理应用配置、构建、部署、Runtime 与 Memory 等资源的云端生命周期。",
  position: "它上接 VeADK 等框架产出的 Agent 应用，下接模型、Memory、网络、身份和云基础设施，负责应用及资源生命周期，不替代 Agent 逻辑、业务授权、权威数据、外部压测或客户自己的上线决定。",
  presentation: "pipeline",
  principleTitle: "从应用合同到云端运行治理的六个环节",
  principles: [
    { zh: "应用合同", en: "Application Contract", explanation: "入口、依赖、配置和调用接口共同定义 AgentKit 能构建和运行的应用。", decision: "本地先验证启动、错误语义和核心调用，再进入云端构建。" },
    { zh: "配置与构建", en: "Configuration & Build", explanation: "CLI 和配置文件把代码、依赖、Region、环境变量与资源引用组合为部署输入。", decision: "把本地隐式状态转成可审计、可重复的构建材料。" },
    { zh: "Runtime 生命周期", en: "Runtime Lifecycle", explanation: "Runtime 承载部署后的应用版本并提供运行状态与调用入口。", decision: "分别验收 Ready、可调用、业务后置条件、恢复和回退。" },
    { zh: "部署目标", en: "Deployment Target", explanation: "目标标识、Region 与资源引用共同说明部署去向；实际资源访问、网络和数据边界还要在目标环境验证。", decision: "把目标配置、访问权限、网络隔离和数据地域分开确认。" },
    { zh: "外置状态", en: "Externalized State", explanation: "Session、Memory 和 Knowledge 不应依赖单个 Runtime 容器生命周期。", decision: "记录控制面资源关联与数据面访问配置，并做跨版本回归。" },
    { zh: "运行证据", en: "Operational Evidence", explanation: "日志、Trace、指标、评测和外部压力测试共同回答不同问题。", decision: "用 SLO、任务成功和恢复结果决定放量，不用一个平均值代替。" },
  ],
  decisions: [
    { question: "什么时候需要 AgentKit？", signal: "已有可运行 Agent，但缺少标准应用合同、云端 Runtime、资源管理与发布运营。", recommendation: "先冻结本地候选与验收集，再引入 AgentKit 管理构建和运行生命周期。", boundary: "平台不能替客户补齐错误的业务流程或授权。" },
    { question: "怎样核对部署目标与 Region？", signal: "已有获准的部署范围、地域要求、服务依赖和网络路径。", recommendation: "在配置中明确目标标识与 Region，再从目标 Runtime 验证资源访问、服务可用性、网络和数据控制。", boundary: "字段填写正确只证明控制面输入完整，不证明隔离、连通或数据驻留已经满足。" },
    { question: "Memory 采用托管还是自建？", signal: "团队在交付速度、数据边界、功能、可移植性和运维责任之间取舍。", recommendation: "若评估 Mem0 方案，在同一用户隔离、召回质量、延迟、删除和恢复合同下比较托管 Platform 与 OSS。", boundary: "Mem0 的官方对比不能证明 AgentKit Memory 使用或由 Mem0 运营，也不能证明特定地域、数据驻留或 SLA。自建 Mem0 仍可能把数据发送到外部模型、Embedding 或向量服务。" },
    { question: "何时允许 launch？", signal: "入口、依赖、配置、密钥、资源绑定和回退方案已冻结。", recommendation: "先运行配置检查和本地调用，再构建、部署并在云端执行相同回归。", boundary: "一条命令简化编排，不消除上线批准与生产验证。" },
    { question: "怎样建立可观测与容量基线？", signal: "需要定位慢请求、验证质量或确定并发上限。", recommendation: "平台遥测用于还原调用链，评测衡量任务质量，k6、Locust 等外部工具产生固定负载。", boundary: "有观测数据不等于已经定义 SLO，评测也不等于压力测试。" },
  ],
  deepDiveTitle: "Runtime 发布、Memory 绑定与验收分层",
  deepDiveLead: "把 CLI 生命周期、外置状态和运行证据放进一条可回退发布链。",
  deepDives: [
    {
      kind: "sequence", eyebrow: "RELEASE PATH", title: "从本地 App 到 Runtime 的六步发布链", intro: "每一步都要产生可复核材料，而不是只保留一次成功截图。",
      sourceIds: [agentkitSources.cli, agentkitSources.commands, agentkitSources.config, agentkitSources.runtime],
      items: [
        { name: "冻结应用入口", en: "Freeze Entry", mechanism: "确认启动对象、接口和错误合同。", decision: "在干净、可复现的环境中运行。", boundary: "本地运行依赖不能隐式进入构建。" },
        { name: "冻结配置", en: "Freeze Config", mechanism: "登记目标标识、Region、环境变量和资源引用。", decision: "敏感值只保留安全引用。", boundary: "配置文件不是凭据仓库。" },
        { name: "构建候选", en: "Build Candidate", mechanism: "解析依赖并生成可部署制品。", decision: "绑定源码、依赖与构建结果。", boundary: "构建成功不证明运行成功。" },
        { name: "部署 Runtime", en: "Deploy Runtime", mechanism: "创建或更新云端运行版本。", decision: "观察状态、日志和失败原因。", boundary: "Ready 不等于业务可用。" },
        { name: "执行云端回归", en: "Cloud Regression", mechanism: "验证模型、工具、Session、Memory、身份和网络。", decision: "使用与本地同源的任务集。", boundary: "一次调用不能形成 SLO。" },
        { name: "放量或回退", en: "Release or Roll Back", mechanism: "按质量、P95、错误、恢复和成本决定。", decision: "保留上一验证版本与状态兼容方案。", boundary: "回退应用不能撤销已产生的业务副作用。" },
      ],
    },
    {
      kind: "diagnostic", eyebrow: "RUNTIME TRIAGE", title: "Runtime Ready 之后仍可能失败的五个层面", intro: "状态正常只排除一部分控制面问题。",
      sourceIds: [agentkitSources.runtime, agentkitSources.memory, agentkitSources.config],
      items: [
        { name: "应用入口错误", en: "Entry Failure", mechanism: "构建对象与实际启动对象不一致。", decision: "在构建前执行相同入口。", boundary: "修正路径不保证依赖完整。" },
        { name: "环境与密钥缺失", en: "Config Failure", mechanism: "本地变量没有安全注入 Runtime。", decision: "启动时只验证变量存在性与权限。", boundary: "不得在日志打印秘密。" },
        { name: "资源只绑定一层", en: "Binding Failure", mechanism: "控制面关联与数据面连接未同时满足。", decision: "分别检查资源 ID、端点、凭据和网络。", boundary: "能列出资源不等于能读写数据。" },
        { name: "身份作用域错误", en: "Identity Failure", mechanism: "客户端声明被误当可信 user_id 或工作负载身份。", decision: "由认证系统验证并绑定主体，应用再传播用户、租户与审计上下文。", boundary: "Header 本身不是身份证明。" },
        { name: "观测没有验收合同", en: "Evidence Gap", mechanism: "有日志和指标，却没有任务成功、SLO 和回退阈值。", decision: "让 Trace、评测和压测结果都关联同一发布版本。", boundary: "平均延迟不能代表尾部体验。" },
      ],
    },
  ],
  criticalBoundary: "AgentKit 管理应用交付、Runtime 和资源关联；Agent 逻辑、可信身份、共享状态、业务授权与上线决定仍由应用团队负责。Runtime Ready 只是开始目标环境验收：部署记录、遥测完整性、外部负载与恢复测试提供证据，客户 SLO 提供验收门槛。",
  cloudHooks: [
    { stage: "应用构建与 Runtime", services: "AgentKit SDK/CLI、构建、制品与 Runtime", value: "把可运行 Agent 交付成版本化云端应用。", discover: "入口、依赖、启动、版本和恢复目标是否明确？" },
    { stage: "Memory 与 Knowledge", services: "AgentKit Memory、知识库、共享 Session；另行评估的 Mem0 OSS 或 Platform", value: "让长期状态独立于 Runtime 容器，并明确每种方案的运营责任。", discover: "谁负责隔离、纠错、删除、备份和跨版本兼容？" },
    { stage: "部署目标、网络与身份", services: "目标配置、Region、网络、IAM、密钥与网关", value: "把目标环境、网络路径和可信主体链纳入验收。", discover: "资源访问、网络隔离和数据地域分别由什么保证？" },
    { stage: "观测、评测与发布", services: "日志、Trace、指标、评测、告警、版本与灰度", value: "用证据决定放量、暂停、回退或退出。", discover: "客户如何定义任务成功、P95、错误预算和恢复时间？" },
  ],
  relatedSlugs: ["veadk", "ai-agent", "ai-infra-platform", "ai-ops", "evaluation", "security", "ai-gateway", "solution-patterns"],
  qa: [
    { q: "AgentKit 和 VeADK 的职责有什么差异？", a: "VeADK 负责开发 Agent，AgentKit 负责把 Agent 应用配置、构建、部署并接入云端运行治理。", depth: "框架定义、应用合同和 Runtime 生命周期可以组合，但必须分别验收和版本化。", ask: "客户已有哪一层，真正缺的是开发、部署还是持续运营？", tag: "产品定位", basis: "官方平台与集成文档", evidence: [{ sourceId: agentkitSources.overview, supports: "说明 AgentKit 的平台定位。" }, { sourceId: veadkSources.integration, supports: "说明 VeADK 与 AgentKit 的集成入口。" }] },
    { q: "AgentKit App 合同至少包含什么？", a: "至少包含稳定入口、依赖、运行配置、调用接口、错误语义和需要的外部资源。", depth: "本地与云端应使用同一入口和任务集；密钥通过安全配置注入，不能依赖开发机隐式环境。", ask: "当前能否在全新环境中重建并调用同一 App？", tag: "应用合同", basis: "官方平台与配置参考", evidence: [{ sourceId: agentkitSources.overview, supports: "说明 Agent 应用是平台交付的基本单位。" }, { sourceId: agentkitSources.config, supports: "说明应用配置字段与资源绑定。" }] },
    { q: "build、deploy 和 launch 有什么区别？", a: "build 生成部署候选，deploy 执行部署，launch 将常用构建与部署步骤编排成快捷流程。", depth: "具体命令语义以当前 CLI 为准；无论使用哪条路径，都要保留配置、制品、Runtime 版本、云端回归和回退证据。", ask: "客户需要单步控制还是快捷发布，失败时怎样定位到构建或部署阶段？", tag: "CLI 生命周期", basis: "官方 CLI 命令参考", evidence: [{ sourceId: agentkitSources.cli, supports: "说明 CLI 生命周期定位。" }, { sourceId: agentkitSources.commands, supports: "说明当前 build、deploy、launch 等命令语义。" }] },
    { q: "Runtime 显示 Ready，是否可以宣布业务上线？", a: "不可以。Ready 只说明 Runtime 达到平台定义的运行状态，不证明模型、工具、Memory、身份、SLO 和业务后置条件通过。", depth: "还需执行云端任务回归、故障与恢复、尾延迟、权限负例和人工接管，再由有权责任人决定放量。", ask: "哪些云端证据会触发 Go、Hold 或回退？", tag: "上线门禁", basis: "Runtime 快速开始 + 生产验收边界", evidence: [{ sourceId: agentkitSources.runtime, supports: "说明 Runtime 创建与调用流程，不能单独证明业务上线。" }, { sourceId: agentkitSources.overview, supports: "说明平台能力范围，不能替客户完成生产验收。" }] },
    { q: "多实例 Runtime 怎样避免 Session 串话或丢失？", a: "使用共享 Session 后端，并把用户范围绑定到认证系统已经验证的主体；客户端自报的 user_id 不能证明身份。", depth: "还要验证并发写、重复请求、路由切换、重启、备份和删除传播，使应用、用户和会话作用域在所有实例保持一致。", ask: "共享状态后端、身份来源、并发模型和 RPO/RTO 分别是什么？", tag: "状态与身份", basis: "AgentKit Runtime、共享 Session 与用户范围", evidence: [{ sourceId: agentkitSources.runtime, supports: "说明 Runtime 是云端运行环境，外部状态仍需单独设计。" }, { sourceId: veadkSources.memory, supports: "说明短期会话后端，并区分本地与分布式持久化选项。" }, { sourceId: agentkitSources.memory, supports: "说明按用户范围接入 Memory；调用方标识仍需由可信认证建立。" }] },
  ],
  evidenceCards: [
    { metric: "build → deploy", title: "launch 组合常规构建与部署流程", finding: "官方 CLI 概览区分镜像构建、目标部署和组合执行的 launch。", boundary: "命令选项可能改变阶段行为；命令成功也不证明制品来源、Runtime 健康或业务验收。", sourceId: agentkitSources.cli, accent: true },
    { metric: "外置状态", title: "Memory 接入是资源与数据面合同", finding: "官方文档把 Memory 作为独立资源，并提供应用接入路径。", boundary: "资源绑定不证明连接、召回新鲜度、租户隔离、删除或权威事实状态；多实例 Session 仍是另一项设计。", sourceId: agentkitSources.memory },
    { metric: "目标 Runtime", title: "云部署和运行证据需要目标环境实测", finding: "Runtime 快速开始给出了部署与调用路径，可在此基础上执行应用、依赖和运营测试。", boundary: "本模块只给出待执行实验；未产生云端回归、Trace、负载和恢复结果前，不应声明生产就绪。", sourceId: agentkitSources.runtime, accent: true },
  ],
});

export const agentPlatformBriefs = freeze({ veadk: veadkBrief, agentkit: agentkitBrief });

export const agentPlatformCurriculum = freeze({
  veadk: curriculum({
    lead: "VeADK 课程从 Agent 定义与 Runner 循环出发，逐步连接工具、Session、上下文、长期记忆和 AgentKit 应用适配，并始终保留身份、状态与业务权限边界。",
    chapters: [
      { title: "Agent 定义与版本", en: "Agent Definition", explanation: "VeADK Agent 当前在 Google ADK 的 LlmAgent 接口上增加模型、记忆与平台适配配置，这些字段共同形成可运行候选。", decision: "把模型与所有模型外配置绑定到同一评估版本。", boundary: "对象可导入不证明行为、权限或业务结果。", sourceIds: [veadkSources.agent] },
      { title: "Runner、事件与停止", en: "Runner & Events", explanation: "Runner 接收根 Agent、会话与记忆服务，执行模型—工具—观察循环，并以事件流输出模型与工具处理过程。", decision: "为调用、时间、Token、失败和停止设置预算。", boundary: "运行结束不等于业务终态成立。", sourceIds: [veadkSources.runner] },
      { title: "Tool 接入与控制", en: "Tools", explanation: "官方内置 Tool 通过明确函数入口提供常用能力，Agent 的 tools 配置再把选定函数暴露给模型调用。", decision: "通用能力复用官方实现，业务动作使用明确合同。", boundary: "模型可见不等于用户授权。", sourceIds: [veadkSources.tools, veadkSources.agent] },
      { title: "Session 与短期记忆", en: "Session & Short-term Memory", explanation: "应用、用户和会话标识共同限定事件历史的读取范围，具体后端决定持久化、实例间共享和恢复能力。", decision: "按实例数、恢复和隔离目标选存储。", boundary: "SQLite 不自动形成多实例生产状态。", sourceIds: [veadkSources.memory] },
      { title: "上下文工程", en: "Context Engineering", explanation: "历史、工具定义和 Tool Result 会进入后续调用并影响质量、时延和成本。", decision: "治理选择、长度、压缩和 Session 切分。", boundary: "更大窗口不保证证据被正确使用。", sourceIds: [veadkSources.runner, veadkSources.tools] },
      { title: "长期记忆与权威事实", en: "Long-term Memory", explanation: "长期记忆通过独立写入与检索支持跨会话召回，召回内容是否真实、当前有效，仍须回到相应权威来源确认。", decision: "写入前定义主体、来源、用途、有效期、纠错和删除。", boundary: "检索相关不等于事实真实。", sourceIds: [agentkitSources.memory] },
      { title: "AgentKit 应用适配", en: "AgentKit Integration", explanation: "集成入口把 root_agent 封装成 AgentKit 可接收的 App，并形成后续构建与 Runtime 调用所需的应用边界。", decision: "分别验收本地应用合同与云端 Runtime。", boundary: "适配成功不等于上云和生产就绪。", sourceIds: [veadkSources.integration] },
    ],
  }),
  agentkit: curriculum({
    lead: "AgentKit 课程围绕应用合同、CLI、Runtime、目标配置、Memory、身份网络与运行证据展开，把快捷部署还原为可配置、可回归和可回退的完整生命周期。",
    chapters: [
      { title: "平台定位与应用合同", en: "Platform & App Contract", explanation: "AgentKit 管理应用和云端运行资源，应用入口连接框架代码与 Runtime。", decision: "先冻结可重复的本地应用候选。", boundary: "平台不替代业务逻辑与授权。", sourceIds: [agentkitSources.overview, agentkitSources.runtime] },
      { title: "CLI 生命周期", en: "CLI Lifecycle", explanation: "CLI 把项目初始化、配置校验、构建、部署和快捷发布串成明确命令，但每一步生成的对象和失败含义不同。", decision: "按团队发布控制选择单步或 launch。", boundary: "快捷命令不消除阶段证据。", sourceIds: [agentkitSources.cli, agentkitSources.commands] },
      { title: "配置与部署目标", en: "Configuration & Target", explanation: "配置声明应用入口、依赖、环境、目标标识、Region 与外部资源引用，并作为构建和部署的显式输入。", decision: "在目标环境分别验证资源访问、网络和数据边界。", boundary: "控制面字段不证明隔离、连通或数据驻留。", sourceIds: [agentkitSources.config] },
      { title: "Runtime 与版本", en: "Runtime Lifecycle", explanation: "Runtime 承载可识别的应用版本，提供资源状态与调用入口，但 Ready 只说明平台资源状态。", decision: "把 Ready、可调用、任务成功、恢复和回退分层验收。", boundary: "平台状态不等于业务上线。", sourceIds: [agentkitSources.runtime] },
      { title: "Memory 控制面与数据面", en: "Memory Control & Data Planes", explanation: "Memory 的资源关联、连接鉴权、用户作用域和实际读写分属控制面与数据面，需要分别验证。", decision: "部署脚本分别校验绑定、端点、凭据和网络。", boundary: "列出资源不等于可读写或召回正确。", sourceIds: [agentkitSources.memory] },
      { title: "Mem0 托管与 OSS", en: "Managed & OSS Memory", explanation: "单独评估 Mem0 时，它的托管 Platform 与 OSS 在功能、数据边界、定制和运维责任上不同。", decision: "用同一隔离、质量、延迟、删除和 TCO 合同比较。", boundary: "这些文档不证明 AgentKit Memory 使用或由 Mem0 运营；自建 Mem0 也不代表整条模型与向量链都不出域。", sourceIds: [agentkitSources.mem0Oss, agentkitSources.mem0Compare] },
      { title: "观测、评测与发布", en: "Operate & Release", explanation: "日志、Trace、指标、质量评测和外部负载测试共同形成放量证据，并分别回答故障、质量、容量与恢复问题。", decision: "定义任务成功与尾延迟指标及目标，由 SLO 推导错误预算；把恢复和单位成本作为独立运营约束。", boundary: "观测不制造压力，评测不等于容量测试。", sourceIds: [agentkitSources.overview, agentkitSources.runtime] },
    ],
  }),
});

export const agentPlatformLearning = freeze({
  veadk: learning({
    outcomes: ["解释 Agent、Runner、Tool、Session 与 Memory 的责任", "选择合适的短期与长期状态后端", "诊断 Tool、上下文和记忆召回问题", "把 root_agent 封装为 AgentKit App 并说明生产缺口"],
    route: [
      { title: "建立执行心智模型", learn: "沿 Agent 定义、Runner、Tool 与事件理解一次请求。", checkpoint: "能区分模型提议、应用执行和业务终态。" },
      { title: "验证 Session 与作用域", learn: "比较同会话、换会话、换用户和重启。", checkpoint: "能解释隔离键和后端生命周期。" },
      { title: "拆分短期、长期与权威事实", learn: "为三类状态指定来源、用途、纠错和删除。", checkpoint: "不会把检索结果直接写成业务事实。" },
      { title: "治理 Tool 与上下文", learn: "观察 Tool Event、历史增长和调用预算。", checkpoint: "能提出长度、循环、压缩和 Session 切分策略。" },
      { title: "适配 AgentKit App", learn: "冻结入口和依赖，并设计本地与云端两套验收。", checkpoint: "不会把应用适配写成已完成云部署。" },
    ],
    labs: [
      { title: "建立 Session 持久化与隔离实验", scenario: "一个 Agent 需要在进程重启后恢复会话，同时阻止不同用户和 Session 串话。", tasks: ["配置 SQLite 短期记忆并生成无个人含义的随机标记", "验证同会话、换会话、换用户和重启", "查询事件并记录作用域与后端"], deliverable: "Session 隔离矩阵、事件查询和生产后端差距清单", acceptance: "所有正反例符合声明作用域，并明确单机结果不能外推多实例。", sourceIds: [veadkSources.memory, veadkSources.runner] },
      { title: "分析 Tool Event 与上下文预算", scenario: "一次任务可能多次调用搜索或业务 Tool，历史和结果持续进入上下文。", tasks: ["触发至少一次 Tool Call 与 Tool Result", "比较调用前后上下文、时延和事件", "设计结果截断、最大调用数、压缩和切分策略"], deliverable: "执行序列、上下文预算和治理决策记录", acceptance: "能区分已观察的事件与尚待实现的生产策略。", sourceIds: [veadkSources.runner, veadkSources.tools] },
    ],
  }),
  agentkit: learning({
    outcomes: ["解释 App、CLI、Runtime、目标配置与 Memory 的关系", "把本地 Agent 候选转换为可重复构建输入", "分层验收 Runtime、外置状态、身份和业务终态", "为待执行的上云、可观测和容量实验定义证据"],
    route: [
      { title: "冻结 AgentKit App 合同", learn: "明确入口、依赖、配置、接口和错误。", checkpoint: "能在全新环境重建本地候选。" },
      { title: "理解 CLI 生命周期", learn: "区分 init、config、build、deploy 与 launch。", checkpoint: "能说明每个阶段产生的制品和失败证据。" },
      { title: "配置 Runtime 与目标范围", learn: "明确目标标识、Region、环境、身份、网络与资源绑定。", checkpoint: "会分别验证控制面字段、资源访问、网络隔离和数据地域。" },
      { title: "分层验证 Memory", learn: "分别检查控制面关联、数据面访问、用户隔离和异步可见。", checkpoint: "能比较托管与 OSS 的责任边界。" },
      { title: "设计发布与运营证据", learn: "把云端回归、Trace、评测、外部压测和回退结果关联到同一发布版本，再与 SLO 对照。", checkpoint: "能把 Ready 与业务上线严格分开。" },
    ],
    labs: [
      { title: "建立 AgentKit App 与 Memory 本地验收", scenario: "一个可运行 Agent 需要形成稳定应用入口并连接独立 Memory。", tasks: ["冻结入口、依赖和非敏感配置合同", "分别检查健康、Agent 调用和直接 Memory 查询", "设计同用户跨 Session 与不同用户负例"], deliverable: "应用接口合同、Memory 分层检查表和云端待办", acceptance: "本地结论只覆盖 App 合同，不宣称 Runtime 已上线。", sourceIds: [veadkSources.integration, agentkitSources.memory, agentkitSources.config] },
      { title: "执行 Runtime 与可观测验收（待执行）", scenario: "本地 App 尚未形成云端部署、Trace、负载和恢复证据。", tasks: ["运行 build/deploy 或 launch 并记录 Runtime 版本", "执行云端模型、Tool、Session、Memory、身份和网络回归", "收集平台遥测和质量评测，用外部压力工具生成负载，再演练故障、恢复与回退并对照 SLO"], deliverable: "云端回归、Trace、负载曲线、恢复记录与 Go/Hold/No-Go 建议", acceptance: "任务成功与 P95 达到目标，权限负例正确，错误预算消耗在策略范围内，恢复满足 RTO，且回退可用后才允许放量。", sourceIds: [agentkitSources.commands, agentkitSources.runtime, agentkitSources.overview] },
    ],
  }),
});

export const agentPlatformQaExpansion = freeze({
  veadk: freeze([
    datedQa({ q: "怎样区分短期记忆、长期记忆和权威业务事实？", a: "短期记忆服务当前会话，长期记忆保存跨会话的受治理信息，当前事实由对应的权威来源确认。", depth: "长期记忆条目需要主体、来源、用途、时间、有效期、纠错和删除；检索只提供相关候选，余额、订单、权限和政策版本仍应查询各自的权威记录。", ask: "这条信息由谁产生、多久有效、谁能更正删除，错误时会影响什么决定？", tag: "状态分层", basis: "短期记忆机制 + 权威事实边界", evidence: [{ sourceId: veadkSources.memory, supports: "说明短期会话与可选持久化后端。" }, { sourceId: agentkitSources.memory, supports: "说明长期记忆资源的接入路径。" }, { sourceId: agentkitSources.mem0Compare, supports: "说明记忆服务交付方式，不证明检索内容是权威事实。" }] }),
    datedQa({ q: "`create_agentkit_app` 与本地调试入口有什么不同，调用成功是否等于已经上云？", a: "前者把 root_agent 显式封装为 AgentKit App；本地调试入口主要服务开发，两者调用成功都不等于 Runtime 已部署。", depth: "正式上云还要完成构建、Runtime、目标配置、Region、环境变量、资源绑定、可信身份、网络、云端回归、观测和回退。", ask: "当前证据覆盖本地 App、构建、Runtime 还是业务上线中的哪一层？", tag: "应用适配", basis: "官方集成、CLI 与 Runtime 文档", evidence: [{ sourceId: veadkSources.integration, supports: "说明 VeADK 到 AgentKit App 的封装入口。" }, { sourceId: agentkitSources.cli, supports: "说明构建和部署属于后续生命周期。" }, { sourceId: agentkitSources.runtime, supports: "说明云端 Runtime 仍有独立部署和调用步骤。" }] }),
  ]),
  agentkit: freeze([
    datedQa({ q: "AgentKit Memory 的控制面和数据面怎样区分，Mem0 OSS 与 Platform 又怎样选择？", a: "AgentKit Memory 的资源创建和绑定属于控制面，端点、凭据、网络与实际读写属于数据面。若另行评估 Mem0，再比较它的 Platform 与 OSS；现有来源不证明二者存在产品映射。", depth: "两层配置都要验证；如果选定后端异步处理写入，还要记录从写入确认到可检索的时间。Mem0 文档只用于比较它自己的托管与自建边界。自建 Mem0 仍需检查 LLM、Embedding、向量库、Telemetry 和出站网络，不能因 OSS 就默认全链路私有。", ask: "客户需要托管速度还是全链路数据控制，谁承担 HA、备份、升级、删除和观测？", tag: "Memory 架构", basis: "AgentKit Memory + Mem0 官方对比", evidence: [{ sourceId: agentkitSources.memory, supports: "说明 AgentKit Memory 的创建、连接和使用流程。" }, { sourceId: agentkitSources.mem0Oss, supports: "说明 Mem0 OSS 的开源与自托管形态。" }, { sourceId: agentkitSources.mem0Compare, supports: "说明 OSS 与 Platform 的能力和责任差异。" }] }),
    datedQa({ q: "AgentKit 的观测、评测、外部压测和客户 SLO 分别解决什么？", a: "观测提供运行证据，评测衡量任务质量，外部压测施加可控负载，SLO 记录客户可接受的服务目标。", depth: "Trace 用于定位模型、工具和 Memory 步骤；评测集比较任务质量与轨迹；k6、Locust 等工具施加并发负载。由 SLO 推导错误预算后持续跟踪消耗，恢复结果另行与 RTO 对照，成本作为独立经营约束。当前模块只定义待执行验收，不声称已有云端结果。", ask: "客户当前缺的是定位证据、质量基线、容量上限还是正式 SLO？", tag: "可观测与性能", basis: "平台运行能力 + 独立验收分工", evidence: [{ sourceId: agentkitSources.overview, supports: "说明平台覆盖运行治理能力，不能替客户定义 SLO。" }, { sourceId: agentkitSources.runtime, supports: "说明 Runtime 部署与调用入口，不能替代外部压力和业务验收。" }] }),
  ]),
});
