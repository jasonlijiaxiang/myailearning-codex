export const aiGatewayBrief = {
  slug: "ai-gateway",
  definition:
    "AI 网关（AI Gateway）是位于 AI 应用、Agent 与模型或工具服务之间的统一流量与治理入口：它把接入、身份、路由、限流、安全、成本和可观测控制集中到可审计的执行面。",
  position:
    "上接聊天应用、RAG、Agent 与业务 API，下接公有云模型 API、第三方模型、自托管推理端点及 MCP Server；它解决的是跨提供方治理，不负责模型内部推理或业务流程编排。",
  presentation: "pipeline",
  principleTitle: "一条 AI 请求如何通过治理链",
  principles: [
    {
      zh: "统一接入",
      en: "Unified Access",
      explanation:
        "以稳定的 API、SDK 或兼容协议屏蔽模型提供方差异，并把模型目录、端点和版本从应用代码中解耦。",
      decision:
        "先确认需要统一的是模型调用、工具调用，还是两者；兼容接口只降低迁移成本，不代表能力和语义完全一致。",
    },
    {
      zh: "身份与凭据隔离",
      en: "Identity & Credential Isolation",
      explanation:
        "应用使用工作负载身份或短期凭据访问网关，由网关安全地映射到下游提供方，避免长期密钥散落在客户端、Prompt 或仓库。",
      decision:
        "租户、用户与应用身份要分别保留；不能因统一入口而把所有请求变成一个无法追责的共享账号。",
    },
    {
      zh: "策略感知路由",
      en: "Policy-aware Routing",
      explanation:
        "路由不仅看模型名称，还可根据任务、地域、数据级别、质量基线、配额、时延与成本选择端点，并设置故障转移。",
      decision:
        "先定义哪些条件允许自动切换；涉及数据驻留、模型能力或合规差异时，不能把故障转移等同于任意降级。",
    },
    {
      zh: "用量与成本治理",
      en: "Usage & Cost Governance",
      explanation:
        "在请求前执行配额、限流和预算策略，在请求后按组织、应用、模型与任务归集 token、调用量和成功任务成本。",
      decision:
        "限流单位要匹配真实瓶颈；每分钟请求数、token、并发与下游配额不能只选一个平均值代替。",
    },
    {
      zh: "安全护栏与审计",
      en: "Guardrails & Audit",
      explanation:
        "对输入、输出和工具调用执行内容策略、敏感数据处理、授权与审计，并为高风险动作保留人工确认或阻断路径。",
      decision:
        "网关可集中执行策略，但不能替代业务系统的最终授权、参数校验、幂等与事务控制。",
    },
    {
      zh: "端到端遥测",
      en: "End-to-end Telemetry",
      explanation:
        "用统一 trace 关联应用、检索、模型、工具、重试、token、成本和错误，使跨提供方请求仍可定位与比较。",
      decision:
        "默认记录元数据和摘要；完整 Prompt、响应与工具结果是否留存，要按敏感级别、用途和保留期单独批准。",
    },
  ],
  decisions: [
    {
      question: "什么时候值得引入独立 AI 网关？",
      signal:
        "出现多个应用、多个模型提供方、分散密钥、重复接入代码，或无法统一观察成本与风险。",
      recommendation:
        "先用一个高价值流量域验证统一身份、路由、限流与 trace，再逐步迁移；单一低流量试验可先使用模型平台原生入口。",
      boundary:
        "不要为了增加一层而增加一层；新增网关必须能消除重复控制或形成可验证的治理收益。",
    },
    {
      question: "复用现有 API 网关，还是增加 AI 专用能力？",
      signal:
        "现有网关已覆盖网络、认证和基础限流，但无法理解流式响应、token、模型版本、提示策略或工具调用。",
      recommendation:
        "保留成熟的企业 API 管理边界，在其后叠加 AI 感知的路由、成本、护栏和语义遥测；明确两层各自的策略归属。",
      boundary:
        "避免两层同时重试、限流或改写请求，造成放大流量与难以解释的行为。",
    },
    {
      question: "托管网关（Managed）还是自建网关（Self-hosted）？",
      signal:
        "团队在交付速度、私网与数据驻留、自定义策略、跨云可移植性和运维能力之间需要取舍。",
      recommendation:
        "把模型覆盖、策略扩展、身份集成、网络拓扑、日志保留、SLA 与计费逐项验证；必要时采用托管控制面加私有数据面的组合。",
      boundary:
        "产品地域、支持的提供方和功能状态会变化，采购结论必须按当期官方资料复核。",
    },
    {
      question: "是否启用语义缓存（Semantic Cache）？",
      signal:
        "存在大量相似、可复用、低时效请求，且成本或延迟已成为明确瓶颈。",
      recommendation:
        "只对权限、版本、语言和时效边界清晰的只读响应试点，缓存键应包含租户、模型与关键策略版本。",
      boundary:
        "相似不等于可共享；个性化、敏感、实时或会触发动作的请求默认不应跨用户复用。",
    },
    {
      question: "MCP 流量是否也应经过网关？",
      signal:
        "Agent 需要发现和调用多个 MCP Server，且工具凭据、授权、审计和网络出口分散。",
      recommendation:
        "网关可承载服务登记、身份交换、策略执行与调用遥测，但仍按 MCP 的授权流程和每个工具的业务权限做最小授权。",
      boundary:
        "MCP 是上下文与工具互操作协议；AI 网关是治理执行点，两者互补，不应把网关宣传为协议本身。",
    },
  ],
  deepDiveTitle: "从统一入口走向可验证的治理数据面",
  deepDiveLead:
    "网关的工程难点不在于能否转发请求，而在于策略变化能否安全上线，以及多层代理、重试和身份映射出现问题时能否留下可归因证据。",
  deepDives: [
    {
      kind: "sequence",
      eyebrow: "POLICY RELEASE",
      title: "网关策略变更的五步安全发布链",
      intro:
        "路由、限流、内容检查或日志策略都可能改变生产结果；把策略当配置直接全量生效，会让网关自身成为不可追踪的变更源。",
      sourceIds: ["nist-genai-profile", "opentelemetry-semconv", "cloudflare-ai-gateway"],
      items: [
        {
          name: "冻结策略包",
          en: "Freeze Policy Bundle",
          mechanism: "把路由条件、模型目录、限流、重试、护栏、日志字段和例外名单绑定到同一版本，并记录审批人与生效范围。",
          decision: "售前验收应要求一次请求可还原当时命中的策略包，而不是只能看到当前配置。",
          boundary: "策略版本不能替代下游模型、Prompt 和工具 Schema 的独立版本。",
        },
        {
          name: "离线回放",
          en: "Offline Replay",
          mechanism: "用脱敏历史流量比较新旧策略的路由结果、阻断、配额、成本和降级路径，不实际调用高风险工具。",
          decision: "先检查误阻断、跨地域切换和模型能力不等价，再决定是否进入在线验证。",
          boundary: "回放不能完全复现实时配额、网络故障和提供方瞬态状态。",
        },
        {
          name: "影子判定",
          en: "Shadow Decision",
          mechanism: "生产请求仍执行旧策略，新策略只计算拟议动作并记录差异，使真实流量验证不改变客户结果。",
          decision: "差异必须能解释到具体规则和输入属性；只看总体一致率不足以放行高风险分组。",
          boundary: "影子模式仍可能处理敏感元数据，访问与保留要求不能放宽。",
        },
        {
          name: "分段放量",
          en: "Segmented Canary",
          mechanism: "按租户、应用、任务和风险等级逐步启用，并同时观察业务成功、P95、重试、阻断和每个成功任务成本。",
          decision: "先放只读低风险流量；涉及付款、删除或数据外发的路径需要独立批准。",
          boundary: "百分比放量不能代替业务分组，少量高风险流量可能被总体指标淹没。",
        },
        {
          name: "证据化回滚",
          en: "Evidence-led Rollback",
          mechanism: "超过门槛时原子恢复上一策略包，保留触发条件、受影响请求和下游结果用于复盘。",
          decision: "上线前演练回滚时间，并确认控制面故障不会阻止数据面使用最后一个已验证版本。",
          boundary: "回滚网关策略不能自动撤销已经发生的业务副作用。",
        },
      ],
    },
    {
      kind: "diagnostic",
      eyebrow: "FAILURE AMPLIFICATION",
      title: "网关上线后最容易被误判的五类故障",
      intro:
        "许多问题表面上像模型慢、提供方不稳或用户超额，根因却是网关与上游、下游控制重复或语义丢失。",
      sourceIds: ["opentelemetry-semconv", "cloudflare-ai-gateway", "nist-zero-trust"],
      items: [
        {
          name: "尾延迟突然放大",
          en: "Retry Multiplication",
          mechanism: "应用、通用 API 网关、AI 网关和模型 SDK 分别重试，同一失败请求形成乘法流量并耗尽连接或配额。",
          decision: "沿 trace 统计每层 attempt，统一重试所有权、预算和幂等条件后再扩容。",
          boundary: "关闭重复重试后仍需保留对明确可重试错误的受控恢复。",
        },
        {
          name: "流式请求首字节变慢",
          en: "Streaming Buffering",
          mechanism: "中间代理为检查或日志而缓冲完整响应，破坏上游的流式传递，使 TTFT 看似由模型退化。",
          decision: "分别测模型端、网关入站与客户端首事件时间，并验证代理对流式协议的透传方式。",
          boundary: "某些输出策略必须等待完整内容；此时应明确体验取舍，而不是伪装成流式。",
        },
        {
          name: "审计只有共享账号",
          en: "Identity Collapse",
          mechanism: "网关将用户、租户和应用都映射为同一下游凭据，却没有保留不可伪造的主体链和授权上下文。",
          decision: "检查 trace、审计与下游策略能否同时回答谁、代表谁、访问什么和为何获准。",
          boundary: "传播主体标识不能把未经验证的客户端声明直接当成身份。",
        },
        {
          name: "限流正常但下游仍报配额",
          en: "Quota Unit Mismatch",
          mechanism: "入口按请求数限流，下游却按 token、并发、模型或地域计算配额；长请求和突发流量穿透平均值。",
          decision: "把 RPM、TPM、并发、排队和下游剩余额度放入同一容量模型，按真实长度分布压测。",
          boundary: "本地估算不能取代提供方最终配额与错误语义。",
        },
        {
          name: "故障转移成功但任务失败",
          en: "Semantic Failover Drift",
          mechanism: "备用模型能返回 200，却不支持相同上下文、工具、Schema、安全策略或语言质量。",
          decision: "将故障转移作为独立发布路径，用任务评估集验证功能和质量等价范围。",
          boundary: "可用性降级策略必须预先声明允许牺牲什么，不能在事故中临时猜测。",
        },
      ],
    },
  ],
  criticalBoundary:
    "AI 网关不会自动提高模型事实正确性，也不替代推理引擎、MCP / A2A 协议、Agent 工作流或业务系统授权。它提供统一的控制与证据面；最终质量仍取决于模型、数据、Prompt、工具结果、应用约束和评估。",
  cloudHooks: [
    {
      stage: "入口与身份（Ingress & Identity）",
      services: "API 管理、负载均衡、WAF、IAM、工作负载身份、密钥管理",
      value: "把模型密钥收口到云上安全边界，并复用企业已有认证、网络和审计体系。",
      discover: "客户目前由谁保存模型密钥？是否需要用户级归因、私网接入或跨账号授权？",
    },
    {
      stage: "模型目录与路由（Catalog & Routing）",
      services: "模型服务、服务发现、流量管理、策略引擎、容灾与多地域入口",
      value: "把应用与具体端点解耦，支持按策略选择托管或自建模型，并形成可控的切换路径。",
      discover: "客户需要几个模型提供方？切换时哪些数据、能力和质量边界不能改变？",
    },
    {
      stage: "安全与工具治理（Safety & Tool Governance）",
      services: "内容安全、DLP、MCP / API 注册中心、零信任访问、审批工作流",
      value: "把输入输出检查、工具发现和高风险动作控制接入统一云安全能力。",
      discover: "哪些请求包含敏感数据？哪些工具会写生产、付款、删除或对外发送？",
    },
    {
      stage: "可观测与 FinOps（Observability & FinOps）",
      services: "Tracing、日志、指标、成本管理、告警、数据仓库",
      value: "跨模型比较成功率、P95、token、重试与每个成功任务成本，并支持部门分账。",
      discover: "客户现在能否把一次业务任务关联到模型调用、工具调用、错误和最终业务结果？",
    },
  ],
  relatedSlugs: ["llm-inference", "mcp", "a2a", "ai-agent", "ai-ops", "security"],
  qa: [
    {
      q: "我们已经有 API 网关，为什么还需要 AI 网关？",
      a: "先复用现有网关的网络、认证和 API 管理能力；只有当 token 计量、模型路由、流式调用、Prompt / 响应策略、工具治理和生成式 AI 遥测形成真实缺口时，才补充 AI 专用层。",
      depth:
        "两者的合理关系通常是分工而非替代：企业 API 网关管理通用南北向流量和开发者生命周期，AI 网关理解模型、token、流式响应、提供方故障与生成式 AI 风险。PoC 应验证少一次重复接入、少一处密钥、可追踪一次端到端任务等具体结果，并测试两层重试、超时和限流是否冲突。",
      ask: "追问客户：现有网关看不到哪类 AI 语义？这些缺口已经导致什么成本、风险或上线阻塞？",
      tag: "架构定位",
      basis: "云服务能力边界 + 可观测标准",
      evidence: [
        { sourceId: "cloudflare-ai-gateway", supports: "支持 AI 网关可集中提供代理、分析、缓存、限流和模型提供方治理等能力的产品实例。" },
        { sourceId: "opentelemetry-semconv", supports: "支持用生成式 AI 语义约定统一描述模型调用遥测；业务结果仍需应用补充。" },
      ],
    },
    {
      q: "多模型自动路由，是否能同时做到更便宜、更快、更准确？",
      a: "不能预先承诺三者同时改善。路由只能依据可观测信号做选择；质量、延迟、成本和合规通常需要设优先级与不可突破的门槛。",
      depth:
        "先按任务类型建立候选模型的离线基线，再在在线流量中记录路由原因、模型版本、成功率、P95 和每个成功任务成本。故障转移还要验证上下文窗口、工具协议、结构化输出、地域和安全策略是否等价。没有评估集和回滚路径的动态路由，只是把模型选择从代码移到了不可解释的黑盒。",
      ask: "追问客户：哪个指标是硬门槛？发生故障时允许降级质量、功能还是地域吗？",
      tag: "模型路由",
      basis: "风险管理 + 在线验证",
      evidence: [
        { sourceId: "nist-genai-profile", supports: "支持按情境和风险容忍度持续测量生成式 AI 系统，而不是仅凭功能宣称上线。" },
        { sourceId: "opentelemetry-semconv", supports: "支持记录提供方、模型、token、时延与错误等可比较遥测字段。" },
      ],
    },
    {
      q: "AI 网关会不会成为新的单点故障和性能瓶颈？",
      a: "会有这种风险，所以它必须按关键数据面设计：无状态扩展、明确超时与重试归属、多可用区部署、降级策略和自身可观测都应在上线前验证。",
      depth:
        "性能评估不能只测平均代理开销，要覆盖流式首 token、长响应、并发、下游限流、连接池耗尽和提供方故障。控制面故障与数据面故障应分开处理；策略配置要版本化并可回滚。若某些高可用业务允许绕行，也必须明确绕行时失去哪些安全、审计与成本控制。",
      ask: "追问客户：网关故障时应阻断、降级还是直连？哪些策略绝不能被绕过？",
      tag: "可靠性",
      basis: "关键数据面工程原则",
      evidence: [
        { sourceId: "cloudflare-ai-gateway", supports: "支持以托管代理集中承载多提供方调用的产品形态；具体 SLA 与地域需采购时核验。" },
        { sourceId: "nist-zero-trust", supports: "支持对每次资源访问持续执行身份与策略判断，而非因网络位置默认信任。" },
      ],
    },
    {
      q: "把 MCP Server 接到网关后，工具调用就安全了吗？",
      a: "没有。网关可集中认证、策略和审计，但每次工具调用仍要绑定真实主体、请求明确授权，并由业务服务执行参数校验和最小权限。",
      depth:
        "MCP 的授权解决客户端如何代表资源所有者获取访问能力；它不替代具体工具的业务授权。网关还需防止混淆客户端、令牌透传、过宽 scope 和跨租户日志泄漏。对付款、删除、生产变更等动作，应在模型之外增加确认、审批、幂等和补偿。",
      ask: "追问客户：谁是调用主体？scope 对应哪些资源和动作？高风险工具由谁最终批准？",
      tag: "MCP 治理",
      basis: "MCP 授权规范 + 零信任",
      evidence: [
        { sourceId: "mcp-authorization", supports: "支持 MCP 授权中的资源服务器、客户端、用户同意和令牌边界。" },
        { sourceId: "nist-zero-trust", supports: "支持访问资源前验证主体并执行最小权限授权。" },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "统一语义",
      title: "跨模型遥测需要共同字段",
      finding: "OpenTelemetry 为生成式 AI 的模型调用、Agent 与相关事件提供语义约定，使不同框架和提供方的 trace 可以使用共同结构。",
      boundary: "标准化字段不等于自动获得业务成功率、风险标签或成本归属；这些仍需应用与组织补充。",
      sourceId: "opentelemetry-semconv",
      accent: true,
    },
    {
      metric: "授权边界",
      title: "协议接入不等于工具授权",
      finding: "MCP 授权规范把客户端、授权服务器与资源服务器的职责分开，并要求访问令牌面向具体受保护资源使用。",
      boundary: "规范不能替代工具内部的业务权限、参数校验、审批和事务控制。",
      sourceId: "mcp-authorization",
    },
    {
      metric: "持续治理",
      title: "路由策略必须进入风险闭环",
      finding: "NIST 生成式 AI 风险管理框架要求在具体使用情境中识别、测量、管理并持续复核风险。",
      boundary: "框架提供治理方法，不给出跨业务通用的路由阈值或上线通过率。",
      sourceId: "nist-genai-profile",
    },
  ],
};

export const llmInferenceBrief = {
  slug: "llm-inference",
  definition:
    "大模型推理（LLM Inference）是把已训练模型转化为在线或批量输出的执行过程；推理引擎负责模型加载、请求调度、注意力计算、KV Cache、批处理、并行与流式返回。",
  position:
    "位于模型权重与 AI 应用之间：上接 AI 网关、RAG、Agent 或批处理任务，下接 GPU、加速器、网络和存储；重点是单位资源上的可用吞吐、延迟、稳定性与质量保持。",
  presentation: "pipeline",
  principleTitle: "一次生成请求在推理引擎中的生命周期",
  principles: [
    {
      zh: "自回归生成",
      en: "Autoregressive Generation",
      explanation:
        "模型根据已有上下文逐 token 生成输出，首 token 延迟与后续 token 速度分别影响交互体验。",
      decision:
        "服务指标至少分开观察首 token 时间（TTFT）、token 间延迟（ITL）、端到端延迟和成功吞吐。",
    },
    {
      zh: "预填充与解码",
      en: "Prefill & Decode",
      explanation:
        "预填充阶段处理输入上下文，通常更偏计算；解码阶段重复生成 token，更受内存访问与调度影响。",
      decision:
        "长输入、长输出和高并发是不同负载，容量测试必须按真实输入输出分布分组。",
    },
    {
      zh: "键值缓存",
      en: "Key-Value Cache",
      explanation:
        "KV Cache 保存历史注意力状态，避免每个新 token 重新计算全部上下文，但会消耗大量设备内存。",
      decision:
        "不要只按权重大小估算 GPU；上下文长度、并发、精度与缓存管理共同决定可服务容量。",
    },
    {
      zh: "连续批处理与分页注意力",
      en: "Continuous Batching & PagedAttention",
      explanation:
        "请求在不同时间加入和退出批次；分页式缓存管理减少内存碎片，让更多并发请求共享设备。",
      decision:
        "吞吐提升可能增加排队或尾延迟，调度参数应围绕业务 SLO 和请求分布调优。",
    },
    {
      zh: "推理优化",
      en: "Inference Optimization",
      explanation:
        "量化、编译、FlashAttention、前缀缓存和投机解码分别从精度、算子、内存访问或生成步骤降低开销。",
      decision:
        "每项优化都必须用目标模型、硬件和业务评估集验证质量、兼容性、冷启动与尾延迟。",
    },
    {
      zh: "分布式推理",
      en: "Distributed Inference",
      explanation:
        "模型并行、流水线并行、专家并行与预填充—解码分离用于突破单卡内存或扩展吞吐，但会引入通信与调度成本。",
      decision:
        "只有单实例已优化且目标负载证明需要时才增加分布式复杂度；网络拓扑必须纳入同一容量模型。",
    },
  ],
  decisions: [
    {
      question: "托管模型 API 还是自托管推理？",
      signal:
        "需在上线速度、模型控制、数据边界、持续利用率、定制优化与运维能力之间取舍。",
      recommendation:
        "先按业务 SLO、合规和总成本做分层：波动或探索流量优先托管，稳定高利用率且确有控制需求的负载再验证自托管。",
      boundary:
        "不能只比较单 token 标价；还要计入空闲容量、工程人力、升级、容灾、网络和失败重试。",
    },
    {
      question: "选择哪一种推理引擎？",
      signal:
        "候选引擎在模型支持、硬件后端、调度、量化、结构化输出、LoRA、可观测与社区成熟度上不同。",
      recommendation:
        "用同一模型、精度、硬件和真实请求回放比较质量、TTFT、ITL、P95、吞吐、稳定性与运维接口。",
      boundary:
        "公开 benchmark 常使用不同批量、序列长度和硬件，不能直接拼表得出采购结论。",
    },
    {
      question: "长上下文应靠更大 GPU 还是工程优化？",
      signal:
        "长输入导致 KV Cache 压力、首 token 变慢、并发下降或频繁拒绝请求。",
      recommendation:
        "先验证上下文是否真正有用，再结合检索、摘要、前缀缓存、分页缓存和容量分池；硬件扩容是最后一层而非唯一答案。",
      boundary:
        "模型声称的最大上下文不等于业务上可接受质量与成本下的有效上下文。",
    },
    {
      question: "是否采用量化（Quantization）？",
      signal:
        "权重或 KV Cache 已成为容量瓶颈，且希望在同等硬件上部署更大模型或更多副本。",
      recommendation:
        "从可回滚的权重量化开始，在代表性任务、语言、长上下文、工具调用和安全用例上比较质量与性能。",
      boundary:
        "低精度不保证更快；硬件内核支持、校准方式和模型结构都会影响收益与质量损失。",
    },
    {
      question: "什么时候考虑预填充—解码分离（Prefill-Decode Disaggregation）？",
      signal:
        "超大规模流量中预填充与解码资源特征冲突，单一池难以同时满足首 token 和持续生成 SLO。",
      recommendation:
        "先证明单池调度无法满足目标，再评估跨节点传输 KV Cache、路由、容错和网络成本。",
      boundary:
        "它是面向特定规模和负载的架构选择，不是所有推理服务的默认最佳实践。",
    },
  ],
  deepDiveTitle: "把推理性能问题拆成可定位、可复现的负载证据",
  deepDiveLead:
    "推理系统很少只有一个“慢”字：首 token、持续生成、排队、拒绝和质量回退来自不同资源路径，必须用真实负载形状分别验证。",
  deepDives: [
    {
      kind: "diagnostic",
      eyebrow: "BOTTLENECK DIAGNOSIS",
      title: "五种线上症状如何定位到真正瓶颈",
      intro:
        "先用分阶段指标缩小范围，再用 profile 和受控实验确认；直接加卡可能掩盖调度、缓存或软件回退。",
      sourceIds: ["vllm-2023", "flashattention-2022", "opentelemetry-semconv"],
      items: [
        {
          name: "TTFT 上升但生成速度正常",
          en: "Slow Time to First Token",
          mechanism: "常见原因是排队、冷加载、长输入预填充或请求被合并到过大的批次，而非解码算力不足。",
          decision: "分解 queue、model load 与 prefill 时间，并按输入长度分组；只有 prefill 受限时才评估更快注意力或独立资源池。",
          boundary: "客户端首字节还会受网关缓冲与网络影响，不能只看引擎内部计时。",
        },
        {
          name: "ITL 变慢且 GPU 利用率不低",
          en: "Slow Inter-token Latency",
          mechanism: "解码阶段可能受显存带宽、KV Cache 访问、过度批处理或跨卡同步约束，算力繁忙不代表单请求体验良好。",
          decision: "固定并发逐级改变 batch 和上下文，观察 ITL、带宽与缓存占用的拐点，再调整调度或并行方式。",
          boundary: "追求更低 ITL 可能降低总吞吐，取舍必须由交互 SLO 决定。",
        },
        {
          name: "并发增加后吞吐反而下降",
          en: "Throughput Collapse",
          mechanism: "长度差异、KV Cache 碎片、请求换入换出或尾部超长输出使批次效率下降，并触发更多拒绝和重试。",
          decision: "按长度分池并检查缓存利用、抢占和重算；容量结论使用稳定成功吞吐而非短时峰值。",
          boundary: "分池会减少资源共享，流量不足时可能增加空闲。",
        },
        {
          name: "运行数小时后间歇 OOM",
          en: "Progressive OOM",
          mechanism: "动态缓存增长、碎片、异常请求未释放或 admission control 只看权重，导致压力随会话与长输出累积。",
          decision: "记录每请求的输入输出 token、缓存块、回收和拒绝原因，用长稳测试而非单轮 benchmark 验收。",
          boundary: "自动重启只能恢复容量，不能证明内存生命周期问题已解决。",
        },
        {
          name: "性能提升但业务质量下降",
          en: "Optimization Regression",
          mechanism: "量化、编译、投机策略或模型替换可能改变数值、输出分布、工具参数与安全行为。",
          decision: "把优化产物视为新发布版本，除性能外同步回归事实、中文、长上下文、结构化输出与高风险样本。",
          boundary: "公开 benchmark 的质量结论不能替代客户任务集。",
        },
      ],
    },
    {
      kind: "scenario",
      eyebrow: "LOAD SHAPES",
      title: "四类负载必须分开建容量基线",
      intro:
        "平均输入长度和平均并发无法代表真实服务；同一套引擎参数在不同负载形状上可能给出相反结论。",
      sourceIds: ["vllm-2023", "opentelemetry-semconv", "nist-genai-profile"],
      maxColumns: 2,
      items: [
        {
          name: "短输入交互问答",
          en: "Interactive Short-form",
          mechanism: "输入较短、用户等待敏感、输出逐 token 消费，主要关注排队、TTFT、ITL 和连接稳定性。",
          decision: "用峰值到达过程而非固定并发压测，并设置尾延迟和超时下的成功吞吐门槛。",
          boundary: "最高 tokens/s 不能代表最佳交互体验。",
        },
        {
          name: "长上下文分析",
          en: "Long-context Analysis",
          mechanism: "预填充和 KV Cache 占比显著，少量长请求即可挤压短请求并降低并发。",
          decision: "分别测输入长度阶梯、缓存占用和短长请求混跑，必要时独立队列或容量池。",
          boundary: "模型最大上下文只是允许值，不是质量、并发和成本承诺。",
        },
        {
          name: "Agent 突发调用",
          en: "Agentic Bursts",
          mechanism: "一个用户任务会产生多轮模型与工具调用，到达呈簇状并受外部工具延迟影响，重试还会放大峰值。",
          decision: "按完整任务模拟循环、停止和失败路径，验收每个成功任务的调用数、P95 与成本。",
          boundary: "单次模型请求压测不能推导 Agent 容量。",
        },
        {
          name: "离线批量生成",
          en: "Offline Batch",
          mechanism: "可牺牲单请求时延换取更大批量和设备利用率，但受队列、公平、失败重跑与截止时间约束。",
          decision: "以截止时间内的有效输出、失败恢复和单位结果成本验收，不与在线 SLO 共用参数。",
          boundary: "批量作业占满设备可能破坏在线服务的容量保障。",
        },
      ],
    },
  ],
  criticalBoundary:
    "推理引擎优化的是模型执行，不负责跨模型业务路由、用户授权、知识检索、Agent 工具编排或 GPU 集群治理。更高 token 吞吐也不等于更高业务成功率；质量、SLO 和每个成功任务成本必须一起验收。",
  cloudHooks: [
    {
      stage: "托管模型服务（Managed Model Serving）",
      services: "模型 API、Serverless 推理、专用吞吐、模型目录与版本管理",
      value: "降低模型加载、扩缩容和引擎升级负担，让团队先验证业务价值与请求分布。",
      discover: "客户是波动流量还是稳定负载？是否需要固定版本、专用容量、私网与地域约束？",
    },
    {
      stage: "加速计算（Accelerated Compute）",
      services: "GPU 实例、裸金属、加速器、镜像与驱动服务",
      value: "为自托管引擎提供匹配模型规模、精度、上下文和并发的计算与显存。",
      discover: "目标模型、精度、上下文、输入输出分布、并发和 SLO 是否已经冻结？",
    },
    {
      stage: "弹性编排（Elastic Orchestration）",
      services: "托管 Kubernetes、模型服务平台、自动扩缩容、队列与容量预留",
      value: "把推理副本、灰度、故障恢复和弹性纳入统一平台，而不是每个模型各建脚本。",
      discover: "客户需要秒级扩容还是容量池？冷启动、排队和流量突发允许多长时间？",
    },
    {
      stage: "存储、网络与观测（Data Path & Observability）",
      services: "对象存储、并行文件系统、高速网络、缓存、Tracing、GPU 指标与成本管理",
      value: "缩短权重加载，支撑分布式通信，并关联应用 SLO、引擎指标和基础设施利用率。",
      discover: "当前瓶颈在加载、计算、显存、网络、排队还是下游应用？是否有端到端 trace？",
    },
  ],
  relatedSlugs: ["llm", "ai-gateway", "ai-infra-compute", "ai-infra-platform", "evaluation", "prompt-engineering"],
  qa: [
    {
      q: "为什么同一个模型在不同平台上的速度差很多？",
      a: "模型名称相同不代表执行栈相同。硬件、精度、内核、KV Cache、批处理、并行、请求长度和调度策略都会改变首 token、生成速度与吞吐。",
      depth:
        "比较时必须锁定模型权重或快照、量化方式、硬件、并发和输入输出分布；同时报告 TTFT、ITL、端到端 P95、成功吞吐和质量。vLLM 的 PagedAttention 说明缓存管理本身就能显著改变服务效率，FlashAttention 则说明注意力的内存访问模式也会影响性能。",
      ask: "追问客户：当前慢的是首 token、持续生成还是排队？测试是否使用了真实上下文和并发？",
      tag: "性能原理",
      basis: "推理系统论文 + 负载建模",
      evidence: [
        { sourceId: "vllm-2023", supports: "支持 KV Cache 内存管理和连续批处理是 LLM 服务吞吐的重要因素。" },
        { sourceId: "flashattention-2022", supports: "支持通过减少高带宽内存与片上存储之间的数据读写来加速精确注意力计算。" },
      ],
    },
    {
      q: "一张 GPU 能支持多少并发？",
      a: "没有脱离模型、精度、上下文、输出长度和 SLO 的固定答案。并发首先受权重与 KV Cache 的显存占用限制，也受批处理和尾延迟门槛限制。",
      depth:
        "售前容量测试应回放真实长度分布并逐级加压，记录可接受 SLO 下的成功并发，而不是把引擎的最大序列数当承诺。还要区分短问答、长文摘要、Agent 多轮和批处理，因为它们对预填充、解码和缓存的压力不同。容量结论要注明模型版本、硬件、引擎、参数和测试日期。",
      ask: "追问客户：P95 和超时是多少？输入输出长度的 P50 / P95、峰值并发和突发模式是什么？",
      tag: "容量规划",
      basis: "KV Cache 原理 + PoC 压测",
      evidence: [
        { sourceId: "vllm-2023", supports: "支持 KV Cache 容量、碎片和共享方式直接影响可并发请求数量。" },
        { sourceId: "opentelemetry-semconv", supports: "支持记录模型请求、token、时延和错误等运行信息，以便关联容量测试。" },
      ],
    },
    {
      q: "量化后模型更小，是不是一定更快、质量基本不变？",
      a: "都不能保证。量化可降低权重或缓存占用，但速度取决于硬件和内核支持，质量影响取决于模型、精度、校准与任务。",
      depth:
        "应把量化看作候选发布版本，和原精度版本在同一评估集上比较：事实、推理、中文、长上下文、结构化输出、工具调用与安全用例都可能表现不同。性能侧同时测冷启动、TTFT、ITL、吞吐和功耗；若硬件需要频繁反量化或缺少优化内核，内存节省未必转化为端到端收益。",
      ask: "追问客户：量化是为装下模型、增加并发还是降低成本？哪类质量下降不可接受？",
      tag: "优化边界",
      basis: "系统工程 + 业务评估",
      evidence: [
        { sourceId: "nist-genai-profile", supports: "支持模型或系统变更后按使用情境重新测量质量和风险。" },
        { sourceId: "vllm-2023", supports: "支持模型服务性能需要同时考虑内存管理、批处理与实际工作负载。" },
      ],
    },
    {
      q: "vLLM 已经是推理平台了吗？还需要 Kubernetes 或 AI 平台吗？",
      a: "vLLM 是推理引擎和服务运行时的一部分，不等于完整平台。生产环境通常还需要容量调度、身份网络、发布、弹性、故障恢复、观测和成本治理。",
      depth:
        "边界可以这样判断：引擎回答如何高效执行一次模型请求；平台回答模型副本部署到哪里、怎样获得 GPU、如何灰度、扩缩、恢复和隔离；AI 网关回答哪个应用可以调用哪个模型以及请求如何路由和审计。小规模服务可合并组件，但责任仍需明确，否则故障时无法定位。",
      ask: "追问客户：当前缺的是单实例性能，还是多模型部署、GPU 调度、升级和高可用？",
      tag: "组件边界",
      basis: "推理引擎论文 + 平台职责分层",
      evidence: [
        { sourceId: "vllm-2023", supports: "支持 vLLM 聚焦于 LLM serving 的吞吐和 KV Cache 管理。" },
        { sourceId: "kubernetes-dra", supports: "支持 Kubernetes 通过结构化资源声明与驱动分配设备，属于平台资源治理边界。" },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "KV Cache",
      title: "服务容量不只由权重决定",
      finding: "vLLM 论文用 PagedAttention 管理动态 KV Cache，并围绕内存碎片、共享和连续批处理提升 LLM serving 效率。",
      boundary: "论文结果取决于所测模型、硬件和负载；采购时应在目标环境复测。",
      sourceId: "vllm-2023",
      accent: true,
    },
    {
      metric: "IO-aware",
      title: "注意力优化也是内存系统问题",
      finding: "FlashAttention 通过减少高带宽内存与片上存储之间的读写来计算精确注意力，说明算子性能不能只看峰值算力。",
      boundary: "它优化注意力计算，不单独解决模型调度、KV Cache 容量或端到端应用质量。",
      sourceId: "flashattention-2022",
    },
    {
      metric: "四类时延",
      title: "平均响应时间不足以验收推理",
      finding: "推理服务应至少区分首 token、token 间、排队与端到端时延，并关联模型、token 和错误信息。",
      boundary: "具体 SLO 必须由交互、批处理和 Agent 等业务场景分别确定。",
      sourceId: "opentelemetry-semconv",
    },
  ],
};

export const aiOpsBrief = {
  slug: "ai-ops",
  definition:
    "AI 应用可观测与运营（AI Application Observability & Operations）是围绕生成式 AI 应用建立质量、成本、版本、风险和事故闭环：既观察模型调用，也验证完整业务任务是否成功。",
  position:
    "横跨 RAG、Agent、AI 网关和模型服务的运行生命周期；它把离线评估、在线遥测、发布控制、用户反馈与事件响应连接起来，不等同于用 AI 做传统 IT 运维。",
  presentation: "loop",
  principleTitle: "从发布到反馈再回到下一次发布",
  principles: [
    {
      zh: "端到端追踪",
      en: "End-to-end Tracing",
      explanation:
        "一次业务任务可能包含多次检索、模型和工具调用，需要用同一 trace 关联版本、输入摘要、结果、时延、token、成本与错误。",
      decision:
        "应用成功状态必须来自业务系统；模型或框架 span 只解释过程，不能代替终态验收。",
    },
    {
      zh: "分层评估",
      en: "Layered Evaluation",
      explanation:
        "分别评估模型回答、检索、工具调用、轨迹、安全和完整任务，避免最终结果掩盖中间的偶然正确或隐性违规。",
      decision:
        "高风险分组单列门槛，不用总体平均分覆盖少量但不可接受的失败。",
    },
    {
      zh: "版本与发布控制",
      en: "Version & Release Control",
      explanation:
        "模型、Prompt、检索策略、工具 Schema、护栏和评估集共同构成一个可发布版本。",
      decision:
        "发布采用回放、影子、金丝雀或分阶段放量，并保留一键回滚与变更关联。",
    },
    {
      zh: "漂移与反馈",
      en: "Drift & Feedback",
      explanation:
        "输入分布、知识、模型版本、工具和用户行为都会变化；线上反馈应被分类、裁决并转化为新的评估样本。",
      decision:
        "不要把点赞率直接当事实正确率；反馈需结合任务、用户群、失败类型和权威结果解释。",
    },
    {
      zh: "成本与容量",
      en: "Cost & Capacity",
      explanation:
        "成本来自模型、检索、工具、重试、沙箱、存储和人工接管，应按完整成功任务而非单次模型调用归集。",
      decision:
        "优化前先找出失败重试、无效上下文、循环工具调用和低命中缓存等浪费来源。",
    },
    {
      zh: "事件与停止机制",
      en: "Incident & Kill Switch",
      explanation:
        "当质量、安全、成本或外部依赖越过门槛时，系统应能阻断、降级、回滚、转人工并保留证据。",
      decision:
        "上线前明确谁有权停用哪个模型、Prompt、工具或租户，以及如何恢复和复盘。",
    },
  ],
  decisions: [
    {
      question: "扩展现有 APM，还是采购 AI 专用可观测平台？",
      signal:
        "现有 APM 能看 HTTP 和资源，但无法解释 Prompt、模型、token、检索、工具轨迹与生成质量。",
      recommendation:
        "优先沿用企业 trace、日志、告警和权限体系，再补充 AI 语义、评估与数据集能力；用开放遥测降低数据孤岛。",
      boundary:
        "专用平台的评分和面板不能替代业务终态、人工裁决与组织自己的风险门槛。",
    },
    {
      question: "在线数据记录多少、保留多久？",
      signal:
        "需要调试与评估，但 Prompt、响应、文档和工具结果可能包含个人或商业敏感信息。",
      recommendation:
        "按风险分级采用元数据全量、内容抽样或脱敏留存，设置用途、访问者、地域、保留期和删除机制。",
      boundary:
        "不能因为可观测需求默认永久保存所有原文；采样也必须保留事故与高风险事件的必要证据。",
    },
    {
      question: "离线评估与在线评估如何分工？",
      signal:
        "离线集稳定但覆盖不了真实变化；在线信号丰富但缺少确定答案且可能增加时延。",
      recommendation:
        "离线门禁负责可重复回归，在线抽样负责发现漂移和未知失败；关键事件再进入人工裁决与评估集。",
      boundary:
        "不要把 LLM-as-a-Judge 的单一分数作为自动上线或处罚依据。",
    },
    {
      question: "模型或 Prompt 更新怎样放量？",
      signal:
        "升级可能改善总体效果，却在某些语言、客户群、工具或安全场景回退。",
      recommendation:
        "先离线回放，再影子或小流量金丝雀；按关键分组比较业务成功、风险、P95 与每个成功任务成本。",
      boundary:
        "必须固定对照版本并保留回滚；浮动模型别名不能作为不可追溯的生产基线。",
    },
    {
      question: "是否允许系统自动优化 Prompt 或路由？",
      signal:
        "希望减少人工调优，但自动变更会改变客户体验、成本和风险。",
      recommendation:
        "先让优化器只生成候选，经离线评估、审批和灰度后发布；低风险参数才考虑受限自动化。",
      boundary:
        "优化系统不能同时生成变更、定义裁判并直接全量发布，否则缺少独立控制。",
    },
  ],
  deepDiveTitle: "从异常告警走到可复现的质量归因",
  deepDiveLead:
    "AI 运营的核心不是多一个评分面板，而是把线上异常冻结成可重放证据，并识别哪些看似直观的指标会误导发布和事故判断。",
  deepDives: [
    {
      kind: "sequence",
      eyebrow: "INCIDENT ATTRIBUTION",
      title: "一次 AI 质量事故的五步归因回路",
      intro:
        "生成式系统的输出不可完全复现，但当时的输入分组、完整发布版本、外部结果和判定依据必须可还原。",
      sourceIds: ["opentelemetry-semconv", "nist-genai-profile", "nist-zero-trust"],
      items: [
        {
          name: "冻结事故样本",
          en: "Freeze Incident Evidence",
          mechanism: "保存 trace、输入分组、输出或安全摘要、业务终态、模型与工具错误，并对敏感内容执行受控封存。",
          decision: "先保证证据完整，再做自动重试或人工修正；否则后续只能看到被修复后的状态。",
          boundary: "证据保留遵守用途、地域、访问与删除要求，不能因事故默认永久保存原文。",
        },
        {
          name: "还原发布 Bundle",
          en: "Reconstruct Release Bundle",
          mechanism: "关联模型快照、Prompt、检索索引、上下文组装、工具 Schema、护栏、网关策略和应用版本。",
          decision: "若任一关键组件只能解析到“latest”，先补版本治理，再谈自动归因。",
          boundary: "版本相同仍可能受外部系统或数据时点影响，不能据此断言结果必然一致。",
        },
        {
          name: "最小变量回放",
          en: "Controlled Replay",
          mechanism: "以事故输入为基线，一次只替换模型、Prompt、检索、工具或策略，比较失败是否消失以及出现何种副作用。",
          decision: "用成对结果和环境断言定位影响层，不把一次重跑成功当成根因已确认。",
          boundary: "线上竞态、配额和第三方状态可能无法离线复现，需要结合生产遥测。",
        },
        {
          name: "业务与风险裁决",
          en: "Outcome Adjudication",
          mechanism: "规则验证确定性字段，业务系统验证真实终态，模型裁判处理开放式质量，争议和高风险样本由人工裁决。",
          decision: "记录裁决者、Rubric 和置信度；自动裁判与人工长期失配时应暂停自动门禁。",
          boundary: "同一个模型不应在缺少校准的情况下既生成答案又独立证明答案正确。",
        },
        {
          name: "转化为持续门禁",
          en: "Promote to Regression Gate",
          mechanism: "将事故样本及相邻变体加入对应分组评估集，定义修复门槛、监控信号、负责人和再次触发的停止动作。",
          decision: "事故复盘必须推动具体改进，避免同类问题再次发布。",
          boundary: "评估集持续增长时要去重、分层和维护权威答案，不能无限堆积历史噪声。",
        },
      ],
    },
    {
      kind: "diagnostic",
      eyebrow: "MISLEADING SIGNALS",
      title: "五个看似正确、实际可能误导的运营指标",
      intro:
        "单一指标通常只描述系统的一面；每个信号都要配对业务终态、分组和独立校验后才能用于发布或成本判断。",
      sourceIds: ["nist-genai-profile", "opentelemetry-semconv"],
      items: [
        {
          name: "平均质量分上升",
          en: "Higher Average Score",
          mechanism: "多数低风险样本的微小提升可能掩盖少量付款、合规或关键客户场景的严重回退。",
          decision: "按任务、语言、租户和风险分组设置硬门槛，并展示最差分组与失败数量。",
          boundary: "分组过细会造成样本不足，需要同时报告不确定性和人工复核。",
        },
        {
          name: "点赞率下降",
          en: "Lower User Rating",
          mechanism: "反馈受用户预期、界面、等待时间和参与偏差影响，不能直接区分事实错误与体验不佳。",
          decision: "把反馈与任务类型、业务结果和原始失败标签关联，再决定是改模型、Prompt 还是产品流程。",
          boundary: "缺少反馈不代表成功，许多失败用户不会主动评价。",
        },
        {
          name: "单次调用成本降低",
          en: "Lower Cost per Call",
          mechanism: "更便宜的模型或更短上下文可能增加重试、工具轮数和人工接管，使完整任务成本反而上升。",
          decision: "以每个成功任务的模型、检索、工具、基础设施和人工总成本比较版本。",
          boundary: "新业务早期终态样本不足时，可先并列报告调用成本与成功率，不能伪造精确 TCO。",
        },
        {
          name: "LLM Judge 一致通过",
          en: "Judge Pass Rate",
          mechanism: "裁判可能偏好更长回答、继承同类模型偏差，或在 Prompt 和版本变化后发生漂移。",
          decision: "定期用人工金标校准，检查误报漏报，并将裁判模型、Prompt 和阈值纳入发布版本。",
          boundary: "裁判适合扩展抽样，不适合作为高风险动作的唯一授权依据。",
        },
        {
          name: "GPU 利用率很高",
          en: "High Accelerator Utilization",
          mechanism: "设备繁忙可能来自无效重试、超长上下文、错误循环或低优先级批任务，不证明业务产出有效。",
          decision: "把利用率关联到队列等待、成功吞吐、任务终态和单位结果成本，再决定扩容或优化。",
          boundary: "低利用率也可能是严格在线 SLO 所需的容量余量，不能机械追求满载。",
        },
      ],
    },
  ],
  criticalBoundary:
    "本模块关注 AI 应用的质量与运行闭环，不是传统 AIOps 的告警降噪，也不是只看 GPU 利用率的基础设施监控。可观测数据提供证据，不会自动证明答案正确；业务终态、评估集和人工裁决仍是判断依据。",
  cloudHooks: [
    {
      stage: "遥测底座（Telemetry Foundation）",
      services: "OpenTelemetry、APM、日志、指标、事件总线、数据仓库",
      value: "复用现有云可观测体系，把模型、检索、工具和业务结果关联到同一任务。",
      discover: "客户已有哪套 APM？一次用户任务能否跨服务保持 trace，并关联最终业务状态？",
    },
    {
      stage: "评估与数据集（Evaluation & Dataset）",
      services: "模型评估、数据标注、对象存储、数据版本、人工审核工作台",
      value: "沉淀可重复回归集、高风险用例和线上失败样本，形成持续质量门禁。",
      discover: "谁提供权威答案？失败如何分类、裁决、脱敏并进入下一版评估集？",
    },
    {
      stage: "发布与事件响应（Release & Incident）",
      services: "CI/CD、特性开关、流量灰度、告警、工单、审批与密钥管理",
      value: "把模型和 Prompt 变更纳入企业发布流程，并提供快速阻断、回滚和责任追踪。",
      discover: "谁有发布和回滚权？超过质量、成本或安全门槛时能否按模型、租户或工具停用？",
    },
    {
      stage: "治理与 FinOps（Governance & FinOps）",
      services: "DLP、IAM、审计、成本管理、预算、合规数据保留",
      value: "在观察 AI 行为的同时控制敏感数据、访问范围和部门成本。",
      discover: "日志可保存哪些内容、多久、在哪个地域？成本需要按部门、应用还是业务任务归集？",
    },
  ],
  relatedSlugs: ["evaluation", "ai-gateway", "ai-infra-platform", "ai-agent", "security", "data-engineering"],
  qa: [
    {
      q: "我们已经有 Datadog、Prometheus 或云监控，还需要 AI 可观测吗？",
      a: "现有平台应继续作为基础，但要补齐生成式 AI 的语义和质量层：模型与 Prompt 版本、token、检索证据、工具轨迹、评估结果和业务终态。",
      depth:
        "普通 APM 能回答哪个服务慢或报错，却未必能回答模型为什么选错工具、检索了什么、一次任务重试多少轮以及答案是否被业务接受。较稳妥的架构是用 OpenTelemetry 贯穿现有平台，再把需要内容访问和质量评分的高敏能力放入受控评估域，避免为 AI 另建完全孤立的运维栈。",
      ask: "追问客户：当前最难定位的是基础设施故障、模型质量、工具轨迹还是业务失败？",
      tag: "平台复用",
      basis: "OpenTelemetry 语义约定 + 分层可观测",
      evidence: [
        { sourceId: "opentelemetry-semconv", supports: "支持为生成式 AI 模型与 Agent 定义可接入通用遥测体系的语义字段。" },
        { sourceId: "nist-genai-profile", supports: "支持在部署前后持续测量生成式 AI 风险与性能。" },
      ],
    },
    {
      q: "线上用另一个大模型实时打分，是否就能自动发现所有质量问题？",
      a: "不能。模型裁判可扩展抽样评估，但会有偏差、漂移、成本和延迟；关键任务仍需规则、业务终态和人工复核共同裁决。",
      depth:
        "先把可确定验证的部分交给 Schema、单元测试和环境断言，再对开放式质量使用经校准的模型裁判。裁判模型、Prompt 与阈值也要版本化，并用人工样本检查一致性。在线链路可采用异步抽样，避免把评分延迟放进用户请求；高风险或争议样本进入人工队列。",
      ask: "追问客户：哪些指标有确定答案，哪些需要主观判断？错误评分会触发什么动作？",
      tag: "在线评估",
      basis: "持续测量 + 独立裁决原则",
      evidence: [
        { sourceId: "nist-genai-profile", supports: "支持采用多种测量方法、记录局限并持续复核，而非依赖单一指标。" },
      ],
    },
    {
      q: "怎样判断是数据漂移、模型退化，还是 Prompt / 工具变更造成的？",
      a: "先保证每次任务可关联输入分组和完整版本，再用对照回放逐层替换变量；没有版本与 trace，漂移只能靠猜。",
      depth:
        "记录模型快照、Prompt、检索索引、工具 Schema、策略和应用版本；输入按语言、意图、长度、租户和风险分组。发现下降后，用固定样本在旧模型 / 新模型、旧 Prompt / 新 Prompt 等对照组合中复现，再检查知识时效和外部系统变化。线上告警指向异常，离线回放负责归因。",
      ask: "追问客户：哪些组件会独立发布？现在能否从一次失败还原当时的全部版本与依赖结果？",
      tag: "漂移归因",
      basis: "版本治理 + 对照实验",
      evidence: [
        { sourceId: "opentelemetry-semconv", supports: "支持在生成式 AI trace 中记录模型、操作和调用属性；应用版本仍需组织补充。" },
        { sourceId: "nist-genai-profile", supports: "支持持续监测变化、影响与新出现风险。" },
      ],
    },
    {
      q: "生产事故时，AI 应用的 Kill Switch 应该关什么？",
      a: "不一定全站停机。应能按风险最小化影响：冻结模型或 Prompt 版本、禁用某个工具、切回只读模式、降级到固定流程、转人工或阻断特定租户。",
      depth:
        "上线前建立控制矩阵：每类事故对应可隔离对象、执行人、授权方式、证据保留、恢复门槛和客户通知。高风险工具应具备独立开关，不依赖模型是否愿意停止；配置变更要版本化并经过强身份验证。恢复时先回放事故样本，再逐级放量。",
      ask: "追问客户：最坏事故是什么？哪个最小开关可以立即阻止继续损失，又保留低风险服务？",
      tag: "事件响应",
      basis: "零信任 + 生命周期风险治理",
      evidence: [
        { sourceId: "nist-zero-trust", supports: "支持对资源访问持续验证与最小权限，而非一次授权永久有效。" },
        { sourceId: "nist-genai-profile", supports: "支持为生成式 AI 风险准备响应、恢复、监测与责任机制。" },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "Trace",
      title: "一次任务而非一次请求",
      finding: "OpenTelemetry 的生成式 AI 语义约定可描述模型调用、Agent 操作及相关事件，为跨组件追踪提供共同结构。",
      boundary: "标准不会自动定义业务成功、风险等级或需要保存的原文内容。",
      sourceId: "opentelemetry-semconv",
      accent: true,
    },
    {
      metric: "全生命周期",
      title: "评估不是上线前一次考试",
      finding: "NIST 生成式 AI 风险管理框架把治理、情境映射、测量与管理组织为持续循环。",
      boundary: "具体指标、样本和门槛必须由业务风险与组织责任人确定。",
      sourceId: "nist-genai-profile",
    },
    {
      metric: "最小权限",
      title: "停止机制必须位于模型之外",
      finding: "零信任架构要求对每次资源访问验证身份和策略，使高风险工具可由确定性控制独立阻断。",
      boundary: "零信任提供安全原则，不代替 AI 质量评估或业务补偿设计。",
      sourceId: "nist-zero-trust",
    },
  ],
};

export const dataEngineeringBrief = {
  slug: "data-engineering",
  definition:
    "AI 数据工程（AI Data Engineering）把分散、异构、持续变化的数据转换为可解析、可同步、可授权、可检索、可训练和可运营的数据产品。",
  position:
    "位于源系统与 RAG、训练微调、评估和 Agent 应用之间；负责数据进入 AI 系统前的获取、解析、质量、索引、权限与生命周期，不负责模型最终如何生成答案。",
  presentation: "pipeline",
  principleTitle: "从源数据到可用 AI 数据产品",
  principles: [
    {
      zh: "来源与契约",
      en: "Source & Data Contract",
      explanation:
        "先登记数据所有者、权威系统、Schema、更新频率、敏感级别、许可和使用目的，再决定接入方式。",
      decision:
        "没有所有权和使用边界的数据，不应因为技术上可抓取就进入生产知识库或训练集。",
    },
    {
      zh: "解析与结构恢复",
      en: "Parsing & Structure Recovery",
      explanation:
        "文档、扫描件、表格、图片和代码需要保留标题层级、版面、页码、表格关系和来源位置，而不只是抽取纯文本。",
      decision:
        "解析质量要用下游任务验证；字符识别率高不代表表格、阅读顺序和引用定位正确。",
    },
    {
      zh: "连接与增量同步",
      en: "Connectors & Incremental Sync",
      explanation:
        "批量、CDC、事件或 API 同步都要处理新增、更新、删除、失败重放和源系统权限变化。",
      decision:
        "同步 SLO 由知识时效和业务风险决定，不应默认所有源都追求实时。",
    },
    {
      zh: "索引与检索准备",
      en: "Indexing & Retrieval Readiness",
      explanation:
        "根据查询模式建立关键词、向量、元数据、图或混合索引，并保留稳定文档 ID、版本与权限过滤字段。",
      decision:
        "向量数据库是索引组件，不等于完整知识工程；索引必须能处理更新、删除与权限一致性。",
    },
    {
      zh: "质量与可追溯",
      en: "Quality & Lineage",
      explanation:
        "完整性、准确性、时效、一致性、重复、解析失败和权限泄漏都需要规则、样本与责任人持续运营。",
      decision:
        "质量指标要连接下游失败；不能用单一文档数量或 embedding 成功率代表可用性。",
    },
    {
      zh: "治理与生命周期",
      en: "Governance & Lifecycle",
      explanation:
        "数据从采集、处理、索引、使用到删除都要继承分类、权限、地域、保留和审计要求。",
      decision:
        "删除请求必须传播到原文、派生文本、索引、缓存、评估集和训练候选，而不是只删前台链接。",
    },
  ],
  decisions: [
    {
      question: "使用通用解析器、文档 AI 还是定制流水线？",
      signal:
        "资料包含数字 PDF、扫描件、复杂表格、图表、公式、代码或企业专有版式。",
      recommendation:
        "按文档类型路由：数字文档先原生解析，扫描件增加 OCR，关键表格或字段再使用文档 AI 与人工复核。",
      boundary:
        "不要把所有页面统一转图片再 OCR，也不要假设任一解析器能覆盖全部版式。",
    },
    {
      question: "批量、CDC 还是事件驱动同步？",
      signal:
        "源系统能力、数据变化频率、删除传播和知识时效要求不同。",
      recommendation:
        "低频文档用批量与校验清单；结构化业务库用 CDC；高时效事件用消息流，并保留可重放的全量基线。",
      boundary:
        "实时链路不能牺牲幂等、顺序、删除和源系统权限的一致性。",
    },
    {
      question: "复用现有数据库向量能力，还是独立向量库？",
      signal:
        "需在数据规模、过滤、更新、混合搜索、运维、延迟与现有团队能力之间选择。",
      recommendation:
        "先用目标查询和过滤条件验证现有数据库；只有在规模、检索能力或隔离要求形成明确缺口时再引入专用系统。",
      boundary:
        "不要只比较向量维度或单次搜索延迟；更新、删除、备份、租户隔离和混合检索同样关键。",
    },
    {
      question: "数据质量由平台团队还是业务团队负责？",
      signal:
        "平台能发现解析和同步异常，却无法判断合同条款、产品状态等业务事实是否正确。",
      recommendation:
        "平台负责可观测、规则和工作流，数据所有者负责业务定义与裁决；用数据契约明确双方 SLO 和升级路径。",
      boundary:
        "AI 团队不能成为所有源数据质量的默认责任人。",
    },
    {
      question: "同一数据能否同时用于 RAG、评估和微调？",
      signal:
        "希望复用资产，但三类用途对权威性、切分、标签、许可和泄漏控制的要求不同。",
      recommendation:
        "保留共同原始层，分别生成带用途、许可、版本与血缘的派生数据产品；评估集与训练集必须隔离。",
      boundary:
        "可检索不代表允许训练；训练过的数据也不能进入用于证明泛化能力的评估集。",
    },
  ],
  deepDiveTitle: "识别不会报错的数据损坏，并证明变更已传播",
  deepDiveLead:
    "AI 数据管道最危险的问题常不是任务失败，而是内容看似成功入库、实际结构错位，或权限与删除只在部分副本生效。",
  deepDives: [
    {
      kind: "diagnostic",
      eyebrow: "SILENT CORRUPTION",
      title: "文档管道五类静默损坏及验证方法",
      intro:
        "解析成功率、OCR 字符率或向量写入数都可能正常，但下游看到的事实、关系和引用位置已经失真。",
      sourceIds: ["docling-report", "hnsw-2016", "nist-genai-profile"],
      items: [
        {
          name: "阅读顺序错位",
          en: "Reading-order Corruption",
          mechanism: "多栏、侧栏、脚注和浮动文本被按错误顺序拼接，句子仍可读却改变条件、因果与条款归属。",
          decision: "建立含复杂版面的金标页，比较块顺序、标题父子关系和引用回跳，而不是只测字符相似度。",
          boundary: "单一版式模板通过不能代表供应商、年份和语言变化后的文档。",
        },
        {
          name: "表格关系丢失",
          en: "Table Semantics Loss",
          mechanism: "单元格文本被提取，但行列标题、合并单元格、单位和注释未保留，数值无法确定属于哪个对象。",
          decision: "用关键业务问题反向验证表头—单元格—单位关系，并对高风险表格保留图像或人工复核路径。",
          boundary: "OCR 识别出所有数字也不能证明表格语义正确。",
        },
        {
          name: "页眉页脚污染",
          en: "Repeated Boilerplate",
          mechanism: "版权、导航、页码和重复标题进入每个 chunk，稀释正文并在向量空间制造大量近似片段。",
          decision: "统计跨页高频块、去除前后检索分布对比，并抽查正文是否被误删。",
          boundary: "法律声明或版本信息有时是有效证据，不能用固定坐标无条件删除。",
        },
        {
          name: "扫描质量分层失效",
          en: "OCR Quality Skew",
          mechanism: "总体 OCR 指标被清晰页面主导，印章、手写、低对比或旋转页的关键字段持续失败。",
          decision: "按页面质量和字段风险分组采样，记录置信度、失败截图和人工纠正结果，再决定路由到更强解析或审核。",
          boundary: "模型置信度不是事实正确率，阈值需要用客户材料校准。",
        },
        {
          name: "新旧版本混合召回",
          en: "Version Collision",
          mechanism: "文档 ID、更新时间或删除标记不稳定，使旧条款和新条款同时存在并被近邻索引召回。",
          decision: "用稳定主键和有效期构造版本冲突测试，核对索引、原文与查询结果中的唯一有效版本。",
          boundary: "近邻索引解决相似搜索，不负责判定哪一个业务版本权威。",
        },
      ],
    },
    {
      kind: "sequence",
      eyebrow: "CHANGE PROPAGATION",
      title: "权限收回与删除必须穿过五个派生层",
      intro:
        "删除前台链接远远不够；原文、解析结果、索引、缓存、评估与训练候选都可能继续保留可访问副本。",
      sourceIds: ["nist-zero-trust", "nist-genai-profile", "hnsw-2016"],
      items: [
        {
          name: "生成权威变更事件",
          en: "Authoritative Change Event",
          mechanism: "由源系统发出带主体、对象、版本、时间和变更类型的事件，删除与 ACL 收回使用可重放 tombstone。",
          decision: "先确认唯一权威来源和事件顺序；无法产生事件的源需要周期性全量对账。",
          boundary: "管道不能自行推断法律保留或业务例外，冲突交给数据所有者裁决。",
        },
        {
          name: "隔离原始与派生内容",
          en: "Quarantine Derived Assets",
          mechanism: "立即阻止新请求读取相关原文、解析块、图片和特征，同时保留受控证据供传播任务定位。",
          decision: "安全收回应优先于后台清理完成，访问检查不能只依赖最终索引状态。",
          boundary: "隔离副本仍受相同敏感等级和访问审计约束。",
        },
        {
          name: "更新索引与缓存",
          en: "Update Indexes and Caches",
          mechanism: "按稳定文档 ID 删除或重建关键词、向量、元数据、语义缓存和搜索副本，并处理正在进行的增量任务。",
          decision: "运行删除后负向查询，证明旧 ID、相似文本和跨租户路径均不可召回。",
          boundary: "索引删除的实现和可见性窗口取决于具体产品，不能只凭 API 成功码验收。",
        },
        {
          name: "清理用途派生集",
          en: "Reconcile Downstream Datasets",
          mechanism: "从评估集、标注任务、微调候选、导出文件和分析仓库中按血缘定位受影响记录，并执行删除、替换或保留裁决。",
          decision: "可检索、可评估和可训练是不同使用权；每一用途都需要独立证明处理结果。",
          boundary: "已完成训练的权重是否受影响需要单独法律和模型治理判断，不能宣称删除数据即自动遗忘。",
        },
        {
          name: "签发传播证明",
          en: "Issue Propagation Evidence",
          mechanism: "汇总各系统处理状态、失败重试、负向查询、保留例外和完成时间，形成可审计的删除或权限传播记录。",
          decision: "售前应把最大传播时间和失败升级责任写入数据 SLO，而不是只演示一次成功流程。",
          boundary: "证明描述系统执行事实，不替代监管或合同意义上的合规认定。",
        },
      ],
    },
  ],
  criticalBoundary:
    "数据工程交付的是可追溯、可授权、可更新的数据产品，不是把文件批量转成向量。它不替代 RAG 的检索与生成设计、微调方法、业务数据所有者或安全策略；但这些上层能力的质量都受其约束。",
  cloudHooks: [
    {
      stage: "采集与同步（Ingestion & Sync）",
      services: "托管连接器、ETL / ELT、CDC、消息队列、工作流编排",
      value: "把 SaaS、数据库、文件和事件接入统一管道，并处理重试、增量、删除和运行监控。",
      discover: "源系统有哪些？可用 API、CDC 还是导出？更新与删除需要多快传播？",
    },
    {
      stage: "解析与多模态处理（Parsing & Multimodal Processing）",
      services: "OCR、文档 AI、对象存储、批处理、Serverless、人工审核",
      value: "弹性处理文档、扫描件、表格和图片，并保留结构、页码与失败样本。",
      discover: "最重要的文档类型是什么？哪些结构丢失会直接导致客户回答错误？",
    },
    {
      stage: "存储与索引（Storage & Indexing）",
      services: "数据湖、数据库、搜索服务、向量检索、元数据目录、缓存",
      value: "按查询模式组合关键词、向量和元数据过滤，并支持版本、备份与生命周期。",
      discover: "查询需要精确词、语义相似、结构化过滤还是关系遍历？规模和更新模式如何？",
    },
    {
      stage: "质量与治理（Quality & Governance）",
      services: "数据质量、Catalog、Lineage、IAM、DLP、KMS、审计与成本管理",
      value: "把所有者、敏感级别、权限、质量规则和下游使用统一登记并持续验证。",
      discover: "谁签署数据正确性？权限和删除如何从源系统传播到索引、缓存与派生数据？",
    },
  ],
  relatedSlugs: ["rag", "fine-tuning", "multimodal", "security", "ai-ops", "solution-patterns"],
  qa: [
    {
      q: "我们的数据很乱，先上向量数据库能不能边做边解决？",
      a: "向量库只能索引被送入的数据，不能修复来源不明、解析错误、重复、过时、越权或删除不同步。应先建立最小数据契约和质量闭环。",
      depth:
        "可以从一个业务域快速试点，但至少要登记权威源、稳定文档 ID、版本、权限、更新时间和删除事件；解析失败进入隔离区，不能静默索引。搜索效果再通过真实问题验证，区分数据缺失、解析损失、索引失败和排序问题。这样扩展时才知道该补数据、改解析还是调检索。",
      ask: "追问客户：当前最常见错误是缺文档、文档过期、解析错、权限错还是搜不到？谁能裁决？",
      tag: "建设顺序",
      basis: "数据产品边界 + 检索工程",
      evidence: [
        { sourceId: "docling-report", supports: "支持文档理解需要恢复布局、阅读顺序、表格等结构，而非仅抽取无结构文本。" },
        { sourceId: "hnsw-2016", supports: "支持 HNSW 是近似最近邻索引方法；它不承担上游数据质量和治理。" },
      ],
    },
    {
      q: "扫描 PDF 做完 OCR，为什么 RAG 还是答错？",
      a: "OCR 只解决字符识别的一部分。阅读顺序、标题层级、表格关系、页眉页脚、图片语义和引用定位丢失，都会让后续切分与检索失真。",
      depth:
        "验收应抽样检查结构而非只看字符：章节是否归属正确、表格单元格是否对应、跨页内容是否连续、页码和坐标能否回到原文。对关键表格可使用结构化抽取或人工复核；对图表可补充图像理解，但要保留原图和模型版本。最终用真实问答检查证据是否完整、可定位和可引用。",
      ask: "追问客户：答案主要来自正文、表格还是图表？错误时能否回到原页确认解析损失？",
      tag: "文档解析",
      basis: "文档 AI 技术报告",
      evidence: [
        { sourceId: "docling-report", supports: "支持文档转换需要处理布局、表格、阅读顺序和结构化表示。" },
      ],
    },
    {
      q: "向量数据库怎么选，越专业的产品效果越好吗？",
      a: "没有脱离查询和运维约束的最佳产品。召回效果由 embedding、数据、切分、索引、过滤与重排共同决定，数据库只是其中一层。",
      depth:
        "用客户真实语料和查询比较：关键词与语义召回、元数据过滤、更新删除、租户隔离、P95、扩容、备份和成本。HNSW 等近似索引通过搜索效率与召回做取舍，参数和数据分布会影响结果。若现有搜索或数据库已满足规模和过滤，复用往往降低治理复杂度。",
      ask: "追问客户：查询需要哪些过滤和混合搜索？索引多快更新？删除和权限变更多久生效？",
      tag: "向量库选型",
      basis: "近似检索论文 + 工程验收",
      evidence: [
        { sourceId: "hnsw-2016", supports: "支持 HNSW 通过分层图实现近似最近邻搜索，并存在效率与精度的工程取舍。" },
      ],
    },
    {
      q: "源系统撤销权限或删除一份文档，AI 系统怎样保证同步？",
      a: "把权限和删除视为一等数据事件，并沿血缘传播到原文副本、解析结果、索引、缓存、评估集与其他派生资产。",
      depth:
        "每份资产需要稳定 ID、源版本和派生关系；同步链路处理 tombstone、失败重试和对账。查询时执行租户和主体级过滤，不能只依赖索引时的静态 ACL。对无法即时删除的备份或审计副本，要有隔离、保留期和法律依据。定期用源系统权限抽样反查索引，验证没有越权残留。",
      ask: "追问客户：权限由哪个系统权威管理？删除传播的 SLO 是多少？哪些派生副本目前无法追踪？",
      tag: "权限与删除",
      basis: "零信任 + 数据生命周期",
      evidence: [
        { sourceId: "nist-zero-trust", supports: "支持每次访问根据主体和资源执行动态授权，而非依赖网络或历史信任。" },
        { sourceId: "nist-genai-profile", supports: "支持跟踪数据来源、隐私和生成式 AI 生命周期风险。" },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "结构保留",
      title: "解析不是纯文本导出",
      finding: "Docling 技术报告围绕版面、阅读顺序、表格和统一文档表示构建转换管道。",
      boundary: "具体解析质量仍取决于文档类型、语言、扫描质量和配置，必须用客户资料复测。",
      sourceId: "docling-report",
      accent: true,
    },
    {
      metric: "ANN",
      title: "向量索引是检索组件",
      finding: "HNSW 通过分层可导航小世界图进行近似最近邻搜索，体现召回、延迟、内存和构建成本之间的取舍。",
      boundary: "算法不负责 embedding 质量、权限、数据更新或最终答案正确性。",
      sourceId: "hnsw-2016",
    },
    {
      metric: "每次访问",
      title: "权限不能只在入库时固化",
      finding: "零信任原则要求在访问资源时验证主体、设备与策略，支持查询阶段继续执行最小权限控制。",
      boundary: "具体 ACL 同步、索引过滤和删除传播仍需数据平台实现与测试。",
      sourceId: "nist-zero-trust",
    },
  ],
};

export const aiInfraComputeBrief = {
  slug: "ai-infra-compute",
  definition:
    "AI 算力底座（AI Infrastructure Compute）是承载模型训练与推理的物理资源体系，包括加速器、显存与主机内存、节点内互联、节点间网络、存储、机房电力和散热。",
  position:
    "处于 AI 技术栈最底层，为推理引擎和 AI 平台提供可交付容量；它回答硬件与数据通路能否支撑目标工作负载，不负责上层作业调度、模型路由或应用质量。",
  presentation: "stack",
  principleTitle: "算力不是一张卡，而是一条完整数据通路",
  principles: [
    {
      zh: "工作负载优先",
      en: "Workload-first Sizing",
      explanation:
        "训练、微调、在线推理、批量推理和向量处理对计算、内存、网络与存储的压力不同。",
      decision:
        "采购前冻结目标模型、精度、上下文、批量、并发、SLO 和增长场景，不能从峰值算力反推一切。",
    },
    {
      zh: "计算与数值精度",
      en: "Compute & Numerical Precision",
      explanation:
        "加速器在不同数据类型、稀疏模式和算子上的有效吞吐不同，软件栈决定理论能力能否被使用。",
      decision:
        "比较可运行的目标框架和模型，而不是只比较厂商峰值 FLOPS。",
    },
    {
      zh: "显存与内存层级",
      en: "Memory Hierarchy",
      explanation:
        "模型权重、优化器状态、激活与 KV Cache 决定容量；带宽和数据搬运常与计算同样重要。",
      decision:
        "估算要区分训练和推理，并预留通信缓冲、碎片、并发与运行时开销。",
    },
    {
      zh: "节点内扩展",
      en: "Scale-up Fabric",
      explanation:
        "节点或机柜内的高速互联决定多卡之间交换参数、激活和缓存的效率。",
      decision:
        "大模型跨卡前先验证拓扑、带宽与集合通信；卡数增加不保证线性加速。",
    },
    {
      zh: "节点间扩展",
      en: "Scale-out Network",
      explanation:
        "训练同步、专家并行、分布式推理和存储访问依赖低延迟、高吞吐且稳定的网络。",
      decision:
        "网络设计应由通信模式和故障域驱动，并包含拥塞、遥测与恢复。",
    },
    {
      zh: "存储、电力与总成本",
      en: "Storage, Power & TCO",
      explanation:
        "权重和数据加载、Checkpoint、机房电力、散热、闲置和运维共同决定可用容量与 TCO。",
      decision:
        "把有效作业时间、利用率和扩容周期纳入成本，不用单卡价格代表整体经济性。",
    },
  ],
  decisions: [
    {
      question: "先选择加速器，还是先定义工作负载？",
      signal:
        "团队容易从热门 GPU 型号出发，却没有冻结模型、框架、精度和 SLO。",
      recommendation:
        "先建立代表性训练与推理 workload，再筛选能运行目标软件栈的硬件并做端到端基准。",
      boundary:
        "合成算子或峰值参数只能用于初筛，不能代替真实模型与分布式效率测试。",
    },
    {
      question: "购买、长期租用还是按 API 消费？",
      signal:
        "负载在探索、突发和稳定生产之间变化，团队对运维控制与资本支出的偏好不同。",
      recommendation:
        "探索与尖峰优先弹性云或 API，稳定高利用率负载再比较预留、专属集群与自建；保留混合容量路径。",
      boundary:
        "TCO 要包括闲置、软件、网络、存储、电力、人员、容灾和升级，不只比较小时价。",
    },
    {
      question: "单机多卡还是多节点集群？",
      signal:
        "模型或吞吐超过单卡，但尚不清楚节点内与节点间通信代价。",
      recommendation:
        "优先在高带宽节点内扩展；确需多节点时，再根据并行策略设计网络和故障恢复。",
      boundary:
        "更多节点会增加通信、调试与失败概率，扩展效率必须实测。",
    },
    {
      question: "是否采用非主流或异构加速器？",
      signal:
        "成本、供应、地域或能效促使客户考虑多种 GPU、NPU 或定制芯片。",
      recommendation:
        "验证模型覆盖、算子、编译器、量化、分布式通信、容器镜像、监控和人员技能，再比较可迁移层。",
      boundary:
        "硬件可运行一个 Demo 不等于生产软件生态、稳定性和升级路径成熟。",
    },
    {
      question: "计算、网络还是存储应优先投资？",
      signal:
        "集群已出现 GPU 等数据、Checkpoint 过慢、通信拥塞或加载时间过长。",
      recommendation:
        "先用端到端 profile 分解计算、内存、通信和 I/O 等待，再针对瓶颈扩容。",
      boundary:
        "均衡架构比单项堆料重要；局部峰值升级可能把瓶颈推到下一层。",
    },
  ],
  deepDiveTitle: "用瓶颈证据和缩放曲线替代卡型直觉",
  deepDiveLead:
    "硬件采购应回答工作负载在哪一层等待、增加资源后能否继续扩展，以及故障和空闲会把多少理论容量变成无效成本。",
  deepDives: [
    {
      kind: "matrix",
      eyebrow: "BOTTLENECK EVIDENCE",
      title: "四类资源瓶颈的证据、误判与投资方向",
      intro:
        "同样表现为 GPU 未满或作业变慢，根因可能在计算、内存、网络或数据通路；只有 profile 与对照实验能决定采购重点。",
      sourceIds: ["flashattention-2022", "vllm-2023"],
      columnLabels: {
        name: "瓶颈类型",
        mechanism: "可观察证据",
        decision: "验证与投资判断",
        boundary: "常见误判",
      },
      items: [
        {
          name: "计算受限",
          en: "Compute-bound",
          mechanism: "计算单元持续繁忙，算子时间随问题规模增长，改变内存布局或 I/O 后收益有限。",
          decision: "先验证目标精度和内核真正使用所购计算路径，再比较更强加速器、编译或模型并行。",
          boundary: "厂商峰值 FLOPS 不能证明目标框架可持续达到该利用率。",
        },
        {
          name: "内存与带宽受限",
          en: "Memory-bound",
          mechanism: "高带宽内存读写、KV Cache 或激活搬运占主导，计算利用率可能看似不高但带宽已接近上限。",
          decision: "比较显存容量、带宽、算子融合、精度和缓存管理；先优化数据移动，再盲目增加计算峰值。",
          boundary: "显存更大解决容量，不必然提高带宽或端到端速度。",
        },
        {
          name: "通信受限",
          en: "Communication-bound",
          mechanism: "增加卡数后集合通信和同步等待占比上升，扩展效率下降并对拓扑、拥塞和慢节点敏感。",
          decision: "用 1、2、4、8 节点缩放曲线和通信 profile 验证，再决定高速互联、拓扑放置或改变并行策略。",
          boundary: "单节点 benchmark 无法推导多节点训练或分布式推理效率。",
        },
        {
          name: "存储与数据通路受限",
          en: "I/O-bound",
          mechanism: "设备等待数据、权重或 Checkpoint，作业在启动、保存或故障恢复阶段出现长空窗。",
          decision: "测加载、预取、缓存、Checkpoint 和恢复吞吐，再权衡本地 NVMe、并行文件系统、对象存储与网络。",
          boundary: "缓存后的稳态速度不能掩盖首次加载、数据更新和恢复路径。",
        },
      ],
    },
    {
      kind: "checklist",
      eyebrow: "PROCUREMENT PROOF",
      title: "进入容量采购前必须交付的五项证据",
      intro:
        "没有这些证据，卡数、小时数和三年 TCO 都只是对未知负载的精确猜测。",
      sourceIds: ["nist-genai-profile", "nvidia-gpu-operator", "flashattention-2022", "vllm-2023"],
      maxColumns: 3,
      items: [
        {
          name: "可重放工作负载",
          en: "Replayable Workload",
          mechanism: "冻结模型、框架、精度、输入输出分布、并行策略、SLO 和增长场景，形成训练或推理基准包。",
          decision: "候选硬件必须运行同一版本；不能用不同 batch、量化或模型分别展示最优数字。",
          boundary: "基准包需要随业务变化复核，不能永久代表未来负载。",
        },
        {
          name: "端到端 Profile",
          en: "End-to-end Profile",
          mechanism: "同时记录计算、显存、带宽、通信、I/O、排队和失败，让每一段等待都能映射到资源层。",
          decision: "投资优先解决当前主瓶颈，并预估瓶颈转移后的下一层，而不是所有资源等比例扩容。",
          boundary: "采样过短或只看平均值会漏掉拥塞、Checkpoint 和尾部故障。",
        },
        {
          name: "缩放效率曲线",
          en: "Scaling Efficiency",
          mechanism: "逐级增加卡和节点，记录有效吞吐、作业时间、通信占比、失败率和单位结果成本。",
          decision: "在边际收益明显下降前确定经济集群规模，并为更大规模提供新的并行或网络证据。",
          boundary: "卡数翻倍不等于性能翻倍，短跑峰值也不代表长作业稳定性。",
        },
        {
          name: "故障与恢复演练",
          en: "Failure Recovery Drill",
          mechanism: "注入设备降级、节点退出、网络抖动和容量中断，测重试、Checkpoint、重排与数据一致性。",
          decision: "将恢复时间、丢失工作量和失败重跑成本纳入容量与容灾方案。",
          boundary: "基础组件自动修复不等于训练状态或业务请求已正确恢复。",
        },
        {
          name: "可获得性与全成本",
          en: "Supply and Full Cost",
          mechanism: "把地域库存、交付周期、预留、Spot 中断、软件许可、网络存储、能耗、闲置和人员纳入同一模型。",
          decision: "稳定基线、弹性峰值和灾备可采用不同采购方式，并以有效成功结果成本比较。",
          boundary: "当前小时价和一次可用库存不能代表长期可交付容量。",
        },
      ],
    },
  ],
  criticalBoundary:
    "算力底座解决物理容量和数据通路，不决定作业优先级、GPU 共享、模型服务发布或业务效果。峰值 FLOPS、卡数和显存都不是单独的采购结论；必须用目标模型与软件栈验证有效性能、可用性和 TCO。",
  cloudHooks: [
    {
      stage: "弹性加速计算（Elastic Accelerated Compute）",
      services: "GPU / NPU 实例、裸金属、专属主机、按需与 Spot 容量",
      value: "按模型和阶段选择不同加速器，快速获得试验、突发或生产容量。",
      discover: "负载是训练还是推理？持续利用率、启动时限、可中断性和地域需求如何？",
    },
    {
      stage: "AI 集群与网络（AI Cluster & Fabric）",
      services: "高性能网络、RDMA、集群放置、专属互联、负载均衡",
      value: "为分布式训练和推理提供可预测通信，并减少跨故障域的不必要流量。",
      discover: "模型采用什么并行策略？跨卡通信占比、集群规模和故障恢复目标是什么？",
    },
    {
      stage: "数据与 Checkpoint（Data & Checkpoint Path）",
      services: "对象存储、并行文件系统、本地 NVMe、数据缓存、备份归档",
      value: "加速数据、权重和 Checkpoint 流动，同时平衡成本、持久性与恢复时间。",
      discover: "每次作业需要加载多少数据和权重？Checkpoint 频率、恢复点和保留要求是什么？",
    },
    {
      stage: "容量与成本（Capacity & Economics）",
      services: "容量预留、承诺折扣、成本管理、能耗与基础设施监控",
      value: "将稳定基线与弹性峰值组合，按有效作业与成功任务观察真实成本。",
      discover: "当前 GPU 利用率、排队、失败重跑和空闲成本分别是多少？未来容量由谁预测？",
    },
  ],
  relatedSlugs: ["ai-infra-platform", "llm-training", "llm-inference", "model-landscape", "ai-ops"],
  qa: [
    {
      q: "GPU 的理论算力更高，为什么训练或推理不一定更快？",
      a: "模型执行还受数据类型、内存带宽、算子、通信、批量、软件内核和 I/O 约束；峰值算力只有在工作负载能持续喂满计算单元时才有意义。",
      depth:
        "注意力等算子可能受内存访问影响，分布式模型可能受集合通信影响，在线推理还受 KV Cache 和调度影响。售前应在同一模型、精度、框架和输入分布下测有效 token / 秒、作业时间、SLO 与能耗，并用 profile 说明瓶颈，而不是把不同精度的峰值数字直接对比。",
      ask: "追问客户：当前 workload 的瓶颈证据是什么？使用哪种精度、并行策略和软件版本？",
      tag: "性能判断",
      basis: "IO-aware 算法 + 推理系统",
      evidence: [
        { sourceId: "flashattention-2022", supports: "支持注意力性能受高带宽内存与片上存储之间的数据移动影响。" },
        { sourceId: "vllm-2023", supports: "支持在线推理还受 KV Cache 内存管理和批处理调度影响。" },
      ],
    },
    {
      q: "模型权重能放进显存，就代表这张卡能稳定服务吗？",
      a: "不代表。推理还需要 KV Cache、临时缓冲、运行时和并发空间；训练还需要梯度、激活和优化器状态。",
      depth:
        "容量估算要从模型权重之外加入精度、上下文、批量、并发和碎片，并为框架和通信留出安全余量。长上下文在线服务尤其可能由 KV Cache 决定可并发数。最终以真实压力下的拒绝率、P95、吞吐和稳定运行时间验收，而不是只看加载成功。",
      ask: "追问客户：目标是能加载、能完成单请求，还是在峰值并发下满足 SLO？",
      tag: "显存规划",
      basis: "KV Cache 内存管理",
      evidence: [
        { sourceId: "vllm-2023", supports: "支持 KV Cache 是 LLM serving 的主要动态内存负担，并影响并发与吞吐。" },
      ],
    },
    {
      q: "客户已有数据中心，为什么还要购买云上算力？",
      a: "云的价值不只是替代已有设备，而是补充试验速度、稀缺型号、峰值容量、跨地域和托管数据通路；是否使用取决于负载与边界。",
      depth:
        "可以把稳定、敏感且高利用率的基线留在本地，把模型评估、版本迁移、训练峰值或灾备放到云上。比较时同时看数据搬迁、专线、身份、镜像、软件许可、预留容量和运维。若数据不能离开本地，也可评估云控制面、专属容量或混合平台，但具体可用性需按目标云核验。",
      ask: "追问客户：本地短板是容量、型号、交付周期、弹性还是运维？哪些数据和模型不能移动？",
      tag: "混合云",
      basis: "工作负载分层 + TCO",
      evidence: [
        { sourceId: "nist-zero-trust", supports: "支持混合环境中的资源访问继续按身份和策略验证，而不以位置作为信任依据。" },
        { sourceId: "nist-genai-profile", supports: "支持按使用情境、供应链与组织风险评估生成式 AI 部署选择。" },
      ],
    },
    {
      q: "能不能用卡数或 GPU 小时直接估算项目成本？",
      a: "只能做粗略上限。真实成本取决于有效利用率、排队、失败重跑、并行效率、存储网络、运维和业务成功率。",
      depth:
        "训练项目应看每个可接受模型版本的完整成本，包括数据准备、实验和失败作业；在线推理应看满足质量与 SLO 的每个成功任务成本。云上还要区分按需、预留、Spot 和专用容量，并将中断恢复与闲置纳入。先通过小规模 profile 建立缩放模型，再用阶段性容量门槛控制采购。",
      ask: "追问客户：要优化的是单次实验、训练到达目标、每百万 token，还是每个成功业务任务成本？",
      tag: "TCO",
      basis: "端到端成本模型",
      evidence: [
        { sourceId: "nist-genai-profile", supports: "支持在风险和业务情境中同时考虑系统性能、资源与影响，而非单一技术指标。" },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "IO-aware",
      title: "高峰值算力不等于高有效性能",
      finding: "FlashAttention 从内存读写而非仅从计算量解释注意力性能，展示了数据移动对加速器利用的重要性。",
      boundary: "它是算子级证据，不能单独代表完整模型、网络或集群性能。",
      sourceId: "flashattention-2022",
      accent: true,
    },
    {
      metric: "动态显存",
      title: "推理容量包含运行时状态",
      finding: "vLLM 论文显示 KV Cache 的分配、碎片与共享会显著影响可并发请求和服务吞吐。",
      boundary: "实际容量仍取决于模型、精度、上下文、引擎配置和硬件。",
      sourceId: "vllm-2023",
    },
    {
      metric: "软件 + 硬件",
      title: "设备交付需要完整运行栈",
      finding: "NVIDIA GPU Operator 将驱动、设备插件、容器工具链、节点标记与监控等组件作为 Kubernetes GPU 运行的配套能力。",
      boundary: "这是特定厂商在 Kubernetes 上的运维方案，不代表所有加速器或平台采用同一实现。",
      sourceId: "nvidia-gpu-operator",
    },
  ],
};

export const aiInfraPlatformBrief = {
  slug: "ai-infra-platform",
  definition:
    "AI 基础设施平台（AI Infrastructure Platform）把 GPU、加速器、网络和存储组织成可申请、可调度、可隔离、可恢复、可观测的训练与推理服务。",
  position:
    "位于物理算力与模型工程之间：下接设备、驱动和集群，上接训练作业、Notebook、批量推理与在线模型服务；重点是资源治理和服务生命周期，而非模型算子本身。",
  presentation: "stack",
  principleTitle: "从设备发现到可运营 AI 服务",
  principles: [
    {
      zh: "设备声明与发现",
      en: "Device Claim & Discovery",
      explanation:
        "平台需要识别加速器型号、拓扑、健康、驱动与可共享能力，并通过结构化声明把设备分配给工作负载。",
      decision:
        "资源抽象要保留关键硬件差异；统一 API 不能把显存、拓扑和软件兼容性抹平。",
    },
    {
      zh: "队列与联合调度",
      en: "Queueing & Gang Scheduling",
      explanation:
        "分布式作业需要成组获得资源；队列、优先级、配额和抢占决定团队之间如何共享稀缺算力。",
      decision:
        "先定义组织公平、业务优先和可中断性，再选择调度器；不能只追求总体利用率。",
    },
    {
      zh: "共享与隔离",
      en: "Sharing & Isolation",
      explanation:
        "整卡、硬件分区、时间切片和多进程共享适用于不同负载，并在利用率、性能可预测性和安全之间取舍。",
      decision:
        "训练、在线推理和交互开发应分池或设不同策略，不能默认所有工作负载安全混部。",
    },
    {
      zh: "环境与可复现",
      en: "Environment & Reproducibility",
      explanation:
        "驱动、固件、容器、框架、模型与数据版本共同构成运行环境；平台负责镜像、制品和兼容矩阵。",
      decision:
        "升级先经过兼容验证与灰度，保留旧环境和作业元数据以便复现与回滚。",
    },
    {
      zh: "故障与恢复",
      en: "Failure & Recovery",
      explanation:
        "平台需要处理设备降级、节点故障、作业重排、Checkpoint、推理副本健康和容量不足。",
      decision:
        "训练和在线推理的恢复目标不同，应分别定义检查点、重试、冗余和故障域。",
    },
    {
      zh: "服务化与可观测",
      en: "Serving & Observability",
      explanation:
        "把训练、批处理与在线推理封装为有身份、版本、SLO、弹性、成本和运行证据的服务。",
      decision:
        "GPU 利用率只是平台信号之一；还要关联队列等待、作业效率、服务 SLO 和业务需求。",
    },
  ],
  decisions: [
    {
      question: "Kubernetes、Slurm 还是并存？",
      signal:
        "研究训练强调批调度与 HPC 习惯，在线服务和企业应用强调容器、API 与云原生生态。",
      recommendation:
        "按工作负载和团队分层；需要并存时统一身份、数据、制品、配额与成本视图，不强行用一个调度器覆盖所有场景。",
      boundary:
        "双栈会增加运维与容量碎片，只有明确的工作负载收益才值得保留。",
    },
    {
      question: "何时采用 Kubernetes DRA？",
      signal:
        "静态设备插件难以表达设备属性、结构化参数、共享或跨厂商资源声明。",
      recommendation:
        "先确认 Kubernetes 版本、驱动与厂商支持，在非关键池验证 ResourceClaim、调度、升级和故障恢复后再迁移。",
      boundary:
        "DRA 改善资源声明和分配，不自动解决队列公平、作业编排或模型服务。",
    },
    {
      question: "GPU 应整卡、分区还是时间共享？",
      signal:
        "小模型、开发环境和轻量推理导致整卡闲置，但生产负载需要可预测性能或隔离。",
      recommendation:
        "按负载池选择：高性能训练和严格 SLO 优先整卡，稳定小负载可用硬件分区，交互开发可考虑受控时间共享。",
      boundary:
        "共享比例不是越高越好；显存、带宽、故障隔离和侧信道风险都要验证。",
    },
    {
      question: "自建平台还是托管 AI 平台？",
      signal:
        "团队需要在定制调度、混合硬件、合规控制与交付速度、托管升级之间取舍。",
      recommendation:
        "比较托管 Kubernetes、托管训练 / 推理和自建控制面的责任矩阵，保留容器、制品与遥测等可迁移接口。",
      boundary:
        "托管不等于零运维；模型、数据、配额、SLO 和成本责任仍属于客户。",
    },
    {
      question: "优先提高利用率还是缩短排队？",
      signal:
        "集群总体利用率较高，但关键任务等待；或追求低排队导致大量预留闲置。",
      recommendation:
        "按业务等级建立队列、配额、预留与弹性溢出，分别观察有效作业利用率和端到端交付时间。",
      boundary:
        "总体利用率不能掩盖低优先级占满资源或高优先级频繁抢占造成的失败重跑。",
    },
  ],
  deepDiveTitle: "解释排队与闲置的矛盾，并把底层升级变成可回滚发布",
  deepDiveLead:
    "平台常见的真实问题是“GPU 看似空闲，作业却拿不到资源”，以及驱动或运行时升级造成跨层回退；两者都不能只靠增加节点解决。",
  deepDives: [
    {
      kind: "diagnostic",
      eyebrow: "QUEUE WITHOUT CAPACITY",
      title: "GPU 有空闲但作业仍排队的五类根因",
      intro:
        "总体空闲只说明集群中存在未使用设备，不说明这些设备在型号、拓扑、数量、健康、配额和时间上满足当前请求。",
      sourceIds: ["kubernetes-dra", "nvidia-gpu-operator", "opentelemetry-semconv"],
      items: [
        {
          name: "资源碎片无法成组",
          en: "Gang Fragmentation",
          mechanism: "空闲 GPU 分散在不同节点、型号或故障域，分布式作业需要的同构成组资源无法一次满足。",
          decision: "同时观察空闲量与 pending request 的形状，验证拓扑放置、队列回填或工作负载拆分。",
          boundary: "强行跨节点拼接可能降低通信性能并扩大故障域。",
        },
        {
          name: "声明与设备属性不匹配",
          en: "Unsatisfied Device Claim",
          mechanism: "作业要求显存、型号、驱动、共享模式或拓扑属性，现有空闲设备不满足 ResourceClaim 或调度约束。",
          decision: "输出可解释的未满足属性，并用真实 claim 在非关键池验证驱动与调度行为。",
          boundary: "放宽约束前必须确认模型兼容、性能和隔离要求没有被破坏。",
        },
        {
          name: "设备可见但不可用",
          en: "Unhealthy Device",
          mechanism: "节点仍注册资源，但驱动、设备插件、固件、监控或硬件健康异常，使工作负载启动后失败或被隔离。",
          decision: "把设备健康、驱动栈和节点修复状态纳入调度证据，失败设备自动隔离并验证恢复。",
          boundary: "重启节点可能暂时恢复，不代表根因或硬件退化已经消除。",
        },
        {
          name: "配额与优先级阻塞",
          en: "Quota and Priority Block",
          mechanism: "物理容量空闲，但项目配额、保留池、优先级或抢占策略禁止当前团队使用。",
          decision: "将物理空闲、可分配容量和组织可用配额分开显示，并审查是否符合业务优先级。",
          boundary: "提高总体利用率不能绕过隔离、预算和关键业务预留。",
        },
        {
          name: "启动链路占满交付时间",
          en: "Startup-path Delay",
          mechanism: "资源已分配，但镜像拉取、权重加载、数据挂载或网络准备耗时，用户仍感知为排队。",
          decision: "在 trace 中区分 scheduler wait、device prepare、image、data 和 model load，再选择预热、缓存或镜像治理。",
          boundary: "预热降低冷启动但会占用容量和存储，需按使用频率决定。",
        },
      ],
    },
    {
      kind: "sequence",
      eyebrow: "STACK UPGRADE",
      title: "驱动、固件与运行时升级的五阶段发布",
      intro:
        "底层软件变化会影响设备发现、算子、通信、量化和模型结果；它应像生产应用一样有兼容清单、灰度和回滚。",
      sourceIds: ["nvidia-gpu-operator", "kubernetes-dra", "vllm-2023", "opentelemetry-semconv"],
      items: [
        {
          name: "冻结兼容清单",
          en: "Compatibility Manifest",
          mechanism: "绑定固件、驱动、容器工具链、设备插件、框架、推理引擎、模型和关键扩展版本。",
          decision: "售前交付的不只是“支持某 GPU”，而是目标工作负载验证过的完整组合及责任边界。",
          boundary: "厂商支持矩阵是初筛，不能代替客户镜像和模型测试。",
        },
        {
          name: "建立隔离金丝雀池",
          en: "Isolated Canary Pool",
          mechanism: "选择少量独立节点升级，保持旧池可用，并阻止未经验证的工作负载自动迁入。",
          decision: "先验证设备发现、ResourceClaim、监控、网络和存储，再开放模型任务。",
          boundary: "单节点成功不能代表多节点通信、共享和故障恢复。",
        },
        {
          name: "回放代表性任务",
          en: "Representative Replay",
          mechanism: "运行训练、在线推理、长上下文、量化和分布式样本，比较质量、吞吐、P95、显存和错误。",
          decision: "对比必须使用固定制品和输入；性能改善若伴随质量或稳定性回退则不放量。",
          boundary: "合成算子测试只能定位底层能力，不是完整发布门禁。",
        },
        {
          name: "分批排空与推广",
          en: "Drain and Promote",
          mechanism: "按故障域逐批排空旧节点、迁移可恢复任务、升级并重新加入容量，持续监测队列和服务 SLO。",
          decision: "训练作业依赖 Checkpoint，在线服务依赖冗余副本；两类负载使用不同排空策略。",
          boundary: "强制中断不能假设上层框架一定具备正确恢复语义。",
        },
        {
          name: "保留可执行回滚",
          en: "Executable Rollback",
          mechanism: "保存旧镜像、驱动与配置，定义触发阈值、回滚顺序和已写入新格式制品的兼容处理。",
          decision: "在全面升级前实际演练一批节点回退，并确认调度器不会再次把任务送往故障池。",
          boundary: "固件或数据格式变化可能不可简单回退，需要提前定义前向修复路径。",
        },
      ],
    },
  ],
  criticalBoundary:
    "AI 基础设施平台负责设备、作业和服务的生命周期，不替代底层硬件选型、推理引擎优化、AI 网关治理或应用评估。Kubernetes、GPU Operator 或调度器都是平台组件，不应单独包装成完整 AI 平台。",
  cloudHooks: [
    {
      stage: "托管集群（Managed Cluster）",
      services: "托管 Kubernetes、GPU 节点池、自动修复、镜像与驱动管理",
      value: "减少控制面、节点生命周期和基础组件运维，把团队精力放到资源与模型服务治理。",
      discover: "客户已有 Kubernetes 吗？谁负责版本、驱动、节点修复和安全补丁？",
    },
    {
      stage: "训练与批处理（Training & Batch）",
      services: "托管训练、批作业、队列、Spot、Checkpoint、实验追踪",
      value: "按优先级和可中断性组合稀缺容量，并让实验、数据、模型与成本可追溯。",
      discover: "作业规模、运行时长、可中断性、Checkpoint 能力和团队配额如何？",
    },
    {
      stage: "在线模型服务（Online Serving）",
      services: "托管推理、Kubernetes Serving、负载均衡、自动扩缩、模型注册与灰度",
      value: "把模型版本、流量、弹性、健康与回滚形成生产服务闭环。",
      discover: "模型服务的 P95、可用性、冷启动、峰值并发和发布频率是多少？",
    },
    {
      stage: "治理与观测（Governance & Observability）",
      services: "IAM、策略、GPU 指标、作业日志、Tracing、成本分配与容量预测",
      value: "把谁使用何种设备、为何排队、作业是否有效以及成本归属统一观察。",
      discover: "当前能否按团队、项目和模型解释 GPU 占用、等待、失败和成本？",
    },
  ],
  relatedSlugs: ["ai-infra-compute", "llm-training", "llm-inference", "ai-ops", "security"],
  qa: [
    {
      q: "只有少量 GPU，也需要建设 AI 基础设施平台吗？",
      a: "不一定需要复杂平台，但仍需要最小治理：设备与驱动清单、访问权限、队列、环境版本、利用率、故障和成本。规模扩大后再引入更多调度与服务能力。",
      depth:
        "少量设备常见问题不是调度算法不足，而是共享账号、手工装环境、作业互相覆盖和无法知道谁在占用。可以从托管 Notebook、简单队列、标准镜像和监控开始。只有出现多团队、公平配额、分布式作业、GPU 分区或在线服务 SLO 时，才需要更完整的平台组件。",
      ask: "追问客户：当前最痛的是申请、环境、排队、利用率、故障还是生产发布？",
      tag: "建设起点",
      basis: "渐进式平台建设",
      evidence: [
        { sourceId: "nvidia-gpu-operator", supports: "支持 Kubernetes GPU 运行需要驱动、设备插件、容器工具链与监控等配套组件。" },
        { sourceId: "kubernetes-dra", supports: "支持以结构化方式声明与分配设备资源；是否采用取决于集群与驱动支持。" },
      ],
    },
    {
      q: "Kubernetes 和 Slurm 哪个更适合 AI？",
      a: "取决于工作负载与组织，不存在统一赢家。Slurm 擅长 HPC 批作业和成熟的队列习惯；Kubernetes 擅长容器化服务、API 生态与训练—推理一体化。",
      depth:
        "比较应覆盖 gang scheduling、队列公平、拓扑、抢占、Checkpoint、在线服务、身份网络、可观测和团队技能。研究集群可保留 Slurm，产品服务使用 Kubernetes，并通过共同数据、模型制品和成本体系连接。若双栈只是历史惯性且负载重叠，则要计算容量碎片和双重运维成本。",
      ask: "追问客户：主要是长时间分布式训练、交互开发，还是 7×24 在线推理？现有团队熟悉什么？",
      tag: "调度选型",
      basis: "工作负载与责任矩阵",
      evidence: [
        { sourceId: "kubernetes-dra", supports: "支持 Kubernetes 对加速器等设备进行结构化资源声明和调度。" },
        { sourceId: "nvidia-gpu-operator", supports: "支持在 Kubernetes 中自动化 GPU 软件栈的部署与生命周期。" },
      ],
    },
    {
      q: "DRA 会取代 Device Plugin 吗？现在是否应该立即迁移？",
      a: "DRA 核心 API 已在 Kubernetes 1.34 进入稳定 v1，但不代表应立即替换所有 Device Plugin；迁移仍取决于驱动、目标能力和现有工作负载。",
      depth:
        "先列出现有 Device Plugin 无法解决的问题，例如设备属性选择、共享、参数化、跨节点设备选择或节点侧准备，再验证目标集群版本与 DRA 驱动。迁移测试覆盖 ResourceClaim 生命周期、调度失败、节点升级、配额、监控与回滚；把核心 API 稳定、可选新特性成熟度和厂商支持矩阵分开判断。DRA 也不替代队列和模型服务。",
      ask: "追问客户：现有设备分配具体卡在哪？目标 Kubernetes 版本和硬件驱动是否已支持所需功能？",
      tag: "DRA",
      basis: "Kubernetes 官方设备资源模型",
      evidence: [
        { sourceId: "kubernetes-dra-1-34-ga", supports: "支持 DRA 核心 API 在 Kubernetes 1.34 进入稳定 v1 并默认启用。" },
        { sourceId: "kubernetes-dra", supports: "支持 DRA 使用 ResourceClaim 和驱动表达、准备与分配设备资源的官方机制。" },
      ],
      updatedAt: "2026-07-20",
    },
    {
      q: "部署了 vLLM 和 GPU Operator，是否已经具备生产 AI 平台？",
      a: "还没有。前者解决推理执行，后者管理 Kubernetes GPU 软件栈；生产平台还需队列配额、身份网络、发布、弹性、故障恢复、制品、观测和成本治理。",
      depth:
        "可以用责任清单验收：设备能否可靠发现和隔离；作业是否公平调度；模型能否版本化、灰度和回滚；流量是否有 SLO 与容量策略；事故能否定位到应用、引擎、平台或硬件；成本能否归集。组件可以精简，但责任不能缺失。",
      ask: "追问客户：现在最缺的是高效生成、GPU 运维，还是多团队生产服务的完整生命周期？",
      tag: "平台边界",
      basis: "组件职责分层",
      evidence: [
        { sourceId: "vllm-2023", supports: "支持 vLLM 聚焦 LLM serving 与 KV Cache 管理。" },
        { sourceId: "nvidia-gpu-operator", supports: "支持 GPU Operator 聚焦 Kubernetes GPU 软件组件的部署与生命周期。" },
        { sourceId: "opentelemetry-semconv", supports: "支持生成式 AI 服务还需要跨组件的标准化遥测。" },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "ResourceClaim",
      title: "设备资源进入声明式管理",
      finding: "Kubernetes DRA 使用结构化资源声明与驱动，把设备选择、分配和准备纳入调度流程。",
      boundary: "DRA 不等于队列、训练编排或模型服务；支持范围取决于 Kubernetes 与驱动版本。",
      sourceId: "kubernetes-dra",
      accent: true,
    },
    {
      metric: "生命周期",
      title: "GPU 可用需要软件栈协同",
      finding: "NVIDIA GPU Operator 管理驱动、容器工具链、设备插件、节点发现与监控等 Kubernetes 组件。",
      boundary: "这是特定厂商方案，不代表完整 AI 平台，也不覆盖所有硬件生态。",
      sourceId: "nvidia-gpu-operator",
    },
    {
      metric: "跨层 Trace",
      title: "资源指标要连接模型与业务任务",
      finding: "OpenTelemetry 生成式 AI 语义约定为模型和 Agent 调用提供共同遥测结构，可与基础设施 trace 和指标关联。",
      boundary: "GPU 利用率与模型调用字段仍不能自动证明业务成功，需要应用终态补充。",
      sourceId: "opentelemetry-semconv",
    },
  ],
};
