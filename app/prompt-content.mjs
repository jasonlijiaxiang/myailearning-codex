/**
 * 提示词工程模块的问答与证据卡。
 *
 * 来源标题、链接、证据类别和核验日期统一维护在
 * app/reference-content.mjs；此文件仅保存稳定 sourceId。
 */
export const promptEvidenceCards = [
  {
    metric: "4",
    title: "类常见提示组成",
    finding: "Google Cloud 将任务、系统指令、少样本示例与上下文信息列为常见组成；其中只有任务是每次请求的核心必需项。",
    boundary: "这是厂商官方的实用分类，不是跨模型统一协议；具体字段、角色名称和优先级要以所选模型 API 为准。",
    sourceId: "google-prompt-introduction",
  },
  {
    metric: "3",
    title: "项优化前提",
    finding: "Anthropic 建议先具备清晰成功标准、可实测的方法和一版待改进提示，再进入提示优化。",
    boundary: "这是工程工作流，不是效果保证；质量、成本或时延问题也可能更适合通过换模型、改数据或改架构解决。",
    sourceId: "anthropic-prompt-overview",
  },
  {
    metric: "Schema",
    title: "约束输出结构",
    finding: "Structured Outputs 可使支持的模型输出遵守所提供的 JSON Schema，并减少缺字段或无效枚举等结构错误。",
    boundary: "结构正确不等于事实正确；拒答、输出截断和不支持的 Schema 特性仍需由应用处理。",
    sourceId: "openai-structured-outputs",
    accent: true,
  },
  {
    metric: "5",
    title: "步工具调用闭环",
    finding: "官方流程明确区分：应用提供工具、模型返回调用意图、应用执行代码、回传结果、模型形成最终回答。",
    boundary: "模型生成工具名与参数不代表动作已执行或已获授权；权限、参数校验、幂等与审批仍是应用责任。",
    sourceId: "openai-function-calling",
  },
  {
    metric: "每次发布",
    title: "都运行提示评估",
    finding: "OpenAI 官方提示指南建议生产提示纳入代码版本管理，并在发布时运行代表性样例和评估检查。",
    boundary: "文档给出的是治理原则，不提供跨业务通用通过率；门槛必须由客户风险和基线决定。",
    sourceId: "openai-prompting-guide",
  },
  {
    metric: "非零风险",
    title: "系统提示不是安全边界",
    finding: "OWASP 安全指南强调：提示注入无法只靠模型内部约束彻底消除，需要结合最小权限、输入输出过滤与高风险动作审批。",
    boundary: "提示加固可降低风险，但不能替代身份鉴别、最小权限、输出验证、隔离和高风险动作审批。",
    sourceId: "owasp-prompt-injection",
  },
];

export const promptQa = [
  {
    q: "提示词写得足够好，就能解决准确性问题吗？",
    a: "不能。提示词只能改善模型如何理解任务、使用上下文和组织输出；知识缺失、数据错误、模型能力不足、工具结果错误与业务规则缺口仍要分别治理。",
    depth: "先定位失败层：若模型不知道最新事实，优先补充 Grounding 或 RAG；若输出结构漂移，使用 Structured Outputs 与应用校验；若任务本身超出候选模型能力，换模型或拆解流程；若是确定性业务规则，放在代码和规则引擎中。Anthropic 官方也明确指出，不是所有失败指标都最适合通过提示工程改善。",
    ask: "追问客户：当前错误主要是缺知识、没听懂指令、格式不稳定，还是业务动作执行错误？",
    tag: "能力边界",
    basis: "厂商官方工作流 + 工程分层",
    evidence: [
      { sourceId: "anthropic-prompt-overview", supports: "支持先定义成功标准，并判断问题是否适合通过提示工程解决。" },
      { sourceId: "google-prompt-strategies", supports: "支持把目标、指令、上下文、示例和响应格式分开设计并迭代测试。" },
    ],
  },
  {
    q: "系统提示（System Prompt）的优先级更高，是否就等于安全？",
    a: "不等于。系统指令（System Instructions）可以提供稳定行为约束，但仍会被模型作为输入处理；不能存放密钥，也不能承担真正的授权与安全控制。",
    depth: "不同 API 的消息角色和优先级并不完全相同，不能把某一家接口的 system / developer / user 结构当成通用标准。即使模型遵循高优先级指令，也可能受到直接或间接提示注入影响。敏感信息应留在模型不可见的安全系统；访问控制、数据过滤、工具白名单和高风险审批必须由应用强制执行。",
    ask: "追问客户：哪些约束必须绝对执行？其中哪些已经在模型外通过 IAM、策略或代码落实？",
    tag: "安全边界",
    basis: "云厂商官方说明 + OWASP 安全指南",
    evidence: [
      { sourceId: "google-system-instructions", supports: "支持系统指令的用途，并明确其不能完全阻止越狱或泄漏。" },
      { sourceId: "owasp-prompt-injection", supports: "支持提示注入无法只靠系统提示彻底消除，以及最小权限和人工审批等缓解方向。" },
    ],
  },
  {
    q: "Zero-shot 和 Few-shot 怎么选？示例是不是越多越好？",
    a: "先用零样本提示（Zero-shot Prompting）建立最小基线；当任务边界、风格或标签容易误解时，再加入少量有代表性的少样本示例（Few-shot Examples）。示例不是越多越好。",
    depth: "每个示例都占用上下文，并可能把样例中的偏差、过时规则或偶然格式固化到输出。优先覆盖最常见路径、易混淆边界和应拒答样例，保持示例的输入输出结构一致；用固定评估集判断新增示例是否真正改善关键分组，而不是只看几个演示。",
    ask: "追问客户：哪些输入最容易被模型误判？有没有反例、边界例和拒答例可作为评估样本？",
    tag: "核心模式",
    basis: "云厂商官方提示指南",
    evidence: [
      { sourceId: "google-prompt-introduction", supports: "支持 Few-shot Examples 是可选的提示组成，并用于示范期望输出。" },
      { sourceId: "openai-prompting-guide", supports: "支持精简组织少样本示例，并在每次发布时运行测试。" },
    ],
  },
  {
    q: "要求模型输出 JSON，是否已经足够可靠？",
    a: "不够。文字要求“输出 JSON”只能表达意图；生产集成应优先使用模型 API 提供的结构化输出（Structured Outputs）或严格 Schema，并仍处理拒答、截断和语义错误。",
    depth: "要区分三层：可解析 JSON、符合业务 Schema、字段值在业务上正确。Structured Outputs 主要加强前两层中的结构约束，不能证明金额、日期、产品代码或判断结论真实。应用仍应做类型与范围校验、枚举映射、跨字段规则、权限检查和失败重试；高风险字段进入后端前还要有人或确定性系统复核。",
    ask: "追问客户：下游系统真正要求哪些字段、枚举和跨字段约束？错误值会造成什么业务后果？",
    tag: "结构化输出",
    basis: "官方 API 文档 + 工程边界",
    evidence: [
      { sourceId: "openai-structured-outputs", supports: "支持 JSON Schema 约束及拒答、截断、不支持特性等边界。" },
    ],
  },
  {
    q: "把 API 写进 Tool Definition，模型就能安全调用了吗？",
    a: "不能。工具定义（Tool Definition）只是告诉模型有哪些工具、何时使用和参数长什么样；模型返回的是调用意图，真正执行由应用完成。",
    depth: "应用应在每次执行前重新校验工具名、参数、用户身份、资源范围与幂等键；读写工具分开授权，高风险动作要求显式确认，并记录调用、结果和审批。严格 Schema 能减少参数形状错误，但不判断动作是否应该执行，也不赋予模型权限。对外部文档或网页触发的调用，还要防间接提示注入。",
    ask: "追问客户：工具中哪些只读、哪些会改变状态？谁有权调用、批准和撤销？",
    tag: "工具安全",
    basis: "官方工具调用流程 + 安全指南",
    evidence: [
      { sourceId: "openai-function-calling", supports: "支持模型提出调用、应用执行并回传结果的五步职责分界。" },
      { sourceId: "owasp-prompt-injection", supports: "支持最小权限、高风险人工确认和外部内容隔离。" },
    ],
  },
  {
    q: "Prompt、RAG 和 Context Engineering 是什么关系？",
    a: "Prompt 负责表达任务与约束；RAG 负责从外部知识中选择证据；上下文工程（Context Engineering）负责在每次调用前，动态选择并组装模型看到的全部信息。",
    depth: "上下文不仅包括文字指令，还可能包括身份与会话状态、检索证据、示例、工具定义、工具结果、时间和 token 预算。提示词工程是其中一部分。若答案缺少最新事实，不应靠延长系统提示硬写知识；若模型看到过多噪声，也不能仅靠一句“请仔细阅读”弥补。生产系统要分别版本化提示模板、检索策略、工具 Schema 与上下文组装逻辑。",
    ask: "追问客户：这次调用中的每一段上下文来自哪里、由谁维护、何时更新、是否经过权限过滤？",
    tag: "架构边界",
    basis: "官方提示组成 + RAG 工程边界",
    evidence: [
      { sourceId: "google-prompt-strategies", supports: "支持把 Context 与 Instructions、Examples、Response Format 作为不同组成管理。" },
      { sourceId: "openai-prompting-guide", supports: "支持区分稳定角色指引、任务细节和示例，并以工程化方式管理。" },
    ],
  },
  {
    q: "同一个 Prompt 换模型或模型升级后，可以直接上线吗？",
    a: "不可以默认等价。模型家族、快照、推理方式、消息角色、工具协议和结构化输出支持都会影响结果；升级必须做回归评估。",
    depth: "生产记录至少包含 prompt_version、model_provider、model_id / snapshot、推理参数、工具与 Schema 版本、评估集版本。升级时先做影子或离线回放，对关键任务、拒答、安全、结构正确率、P95 与单次成功成本分组比较；只有通过门槛后再逐步放量。不要为多个模型维护大量不可追溯的 if/else 文本，应使用共享意图层和少量适配层。",
    ask: "追问客户：目前调用的是浮动别名还是固定快照？升级由谁批准，能否快速回滚？",
    tag: "版本治理",
    basis: "官方提示治理建议 + 客户发布控制",
    evidence: [
      { sourceId: "openai-prompting-guide", supports: "支持生产提示版本化、代表性样例与发布评估。" },
      { sourceId: "anthropic-prompt-overview", supports: "支持先建立成功标准和实测方法再优化。" },
    ],
  },
  {
    q: "提示模板（Prompt Template）里的变量可以直接拼字符串吗？",
    a: "不建议。模板（Prompt Template）应保持稳定指令与动态变量分离；变量使用类型、长度、来源和权限校验后再注入，并用清晰边界标出不可信数据。",
    depth: "直接字符串拼接容易造成分隔符破坏、指令与数据混淆、日志泄密和模板不可测试。应用层应将客户输入、检索证据、配置和工具结果放入独立字段或结构，限定长度与字符集，对来源和敏感级别打标；模板本身进入代码审查与版本管理。变量变化和模板变化应能在追踪日志中分开定位。",
    ask: "追问客户：变量来自用户、数据库还是外部网页？其中哪些是不可信输入或敏感数据？",
    tag: "模板工程",
    basis: "官方工程建议 + 安全边界",
    evidence: [
      { sourceId: "openai-prompting-guide", supports: "支持用类型化参数或已校验输入对象替换模板变量，并用代码管理生产提示。" },
      { sourceId: "owasp-prompt-injection", supports: "支持标识并隔离外部不可信内容。" },
    ],
  },
  {
    q: "怎样评估 Prompt，而不是靠人工感觉？",
    a: "先冻结真实任务与成功标准，再比较版本。评估单位应是“模型 + Prompt + 上下文 + 工具 / Schema”的完整配置，而不是孤立的一段文字。",
    depth: "评估集要覆盖主路径、边界、拒答、敏感信息、注入与高价值失败。按任务观察正确性、完整性、忠实度、格式 / Schema 通过率、工具选择与参数正确率、拒答正确率；按工程观察 P95、输入输出 token、缓存命中和每个成功任务成本。自动评分应与抽样人工复核结合，并保留失败样本用于下一轮迭代。",
    ask: "追问客户：什么算成功？不可接受错误有哪些？谁提供权威答案并负责签署上线门槛？",
    tag: "PoC 评估",
    basis: "厂商官方评估前提 + NIST 持续测量",
    evidence: [
      { sourceId: "anthropic-prompt-overview", supports: "直接支持先定义成功标准并建立可实测方法。" },
      { sourceId: "nist-genai-profile", supports: "支持以 Govern / Map / Measure / Manage 形成持续风险管理。" },
    ],
  },
  {
    q: "Prompt Engineering 能带来哪些云服务销售机会？",
    a: "它不是单独售卖的一段文字，而会连接模型服务、Prompt 管理、AI 网关、评估、安全、日志追踪、密钥与弹性运行等云能力。",
    depth: "售前应把需求拆成可采购能力：模型目录与版本固定、提示模板与密钥分离、流量路由和限流、结构化输出与工具编排、离线评估和在线观测、敏感信息防护、审计与成本归集。具体产品名称、地域、保留策略和计价必须用目标云当期官方资料核验，不能把提示技巧包装成平台级能力承诺。",
    ask: "追问客户：谁维护模板？需要多模型路由吗？是否要求私网、审计、数据驻留和按部门分账？",
    tag: "云服务",
    basis: "工程能力映射；产品细节需当期核验",
    evidence: [
      { sourceId: "openai-prompting-guide", supports: "支持提示版本化、测试和部署流程的工程化管理。" },
      { sourceId: "nist-genai-profile", supports: "支持持续治理、测量与风险管理要求。" },
    ],
  },
];
