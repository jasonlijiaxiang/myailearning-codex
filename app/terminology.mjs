/**
 * 全站专业术语的唯一内容源。
 *
 * 模块、首页和术语库只引用稳定 termId。每个公开术语都包含中文名、英文名、
 * 一句话说明和相关模块；moduleSlugs 第一项是主要归属模块，后续项是相关使用模块；
 * 缩写只在确有通行缩写时填写。未来英文版继续复用 termId 与模块关系，但英文
 * 解释需要独立撰写和专业校对。
 */

function term(zh, en, description, moduleSlugs, abbr) {
  return Object.freeze({
    zh,
    en,
    ...(abbr ? { abbr } : {}),
    description,
    moduleSlugs: Object.freeze(moduleSlugs),
  });
}

export const terminology = Object.freeze({
  "model-landscape": term("模型格局与选型", "Model Landscape", "从任务、风险、服务约束和生命周期共同判断模型组合，而不是只看单一排行榜。", ["model-landscape"]),
  "access-spectrum": term("模型开放程度", "Model Access Spectrum", "区分 API 服务、开放权重与开源软件，判断可控范围、部署责任和替换成本。", ["model-landscape", "ai-infra-compute"]),
  "capability-matrix": term("能力矩阵", "Capability Matrix", "按任务切片比较质量、时延、成本与风险，避免用单一总分替代场景选型。", ["model-landscape", "evaluation"]),
  "model-lifecycle": term("模型生命周期治理", "Model Lifecycle Governance", "持续管理模型身份、版本、回归、灰度、回滚与可替换性。", ["model-landscape", "evaluation"]),
  llm: term("大语言模型", "Large Language Model", "从大量文本中学习语言分布，并按上下文逐 Token 生成输出的模型。", ["llm", "model-landscape"], "LLM"),
  token: term("词元", "Token", "模型处理文本时使用的离散单元；它可能是一个字、词的一部分、标点或特殊符号。", ["llm", "llm-inference", "multimodal"]),
  embedding: term("向量表示", "Embedding", "把文本、图片或其他对象映射为数值向量，使系统可以比较语义或特征距离。", ["llm", "rag", "data-engineering"]),
  transformer: term("Transformer 架构", "Transformer Architecture", "以注意力机制为核心并行处理序列，是现代大语言模型的主要基础架构。", ["llm", "llm-training", "multimodal"]),
  attention: term("注意力机制", "Attention Mechanism", "让模型按当前查询为上下文中的不同位置分配权重并聚合信息。", ["llm"]),
  qkv: term("查询、键和值", "Query, Key and Value", "注意力计算中的三组表示：提出查询、参与匹配，并提供最终聚合的信息。", ["llm"], "Q / K / V"),
  "context-window": term("上下文窗口", "Context Window", "一次请求中模型能够接收和处理的 Token 范围；容量上限不等于所有位置都能被同样可靠地利用。", ["llm", "prompt-engineering", "llm-inference"]),
  "kv-cache": term("键值缓存", "Key-Value Cache", "复用已生成 Token 的注意力键和值，减少后续解码的重复计算。", ["llm-inference", "llm", "ai-infra-compute"], "KV Cache"),
  moe: term("混合专家模型", "Mixture of Experts", "每个 Token 只激活部分专家网络，以较低单次计算换取更大的总参数容量。", ["llm", "model-landscape"], "MoE"),
  multimodal: term("多模态", "Multimodal AI", "联合处理文本、图片、音频、视频或文档结构，并保留不同模态之间的对应关系。", ["multimodal", "model-landscape"]),
  "vision-transformer": term("视觉 Transformer", "Vision Transformer", "把图像切分为 Patch 并转换为 Token，再使用 Transformer 处理视觉信息。", ["multimodal"], "ViT"),
  ocr: term("光学字符识别", "Optical Character Recognition", "从图片或扫描文档中恢复文字与位置，识别结果仍需结合版面和证据坐标复核。", ["multimodal", "data-engineering"], "OCR"),
  asr: term("自动语音识别", "Automatic Speech Recognition", "把语音或音频转换为带时间关系的文本，识别误差会继续影响下游理解。", ["multimodal"], "ASR"),

  "prompt-engineering": term("提示词工程", "Prompt Engineering", "通过任务说明、示例、约束和输出格式，引导模型在一次或一类请求中稳定执行目标。", ["prompt-engineering"]),
  "context-engineering": term("上下文工程", "Context Engineering", "为一次模型调用选择、组织和治理指令、数据、工具与历史状态的系统工程。", ["prompt-engineering", "ai-agent"]),
  instructions: term("稳定指令", "Instructions", "定义角色、目标、优先级和不可违反边界的高优先级规则。", ["prompt-engineering"]),
  context: term("动态上下文", "Context", "随用户、任务和环境变化而装配的事实、历史、检索证据与运行状态。", ["prompt-engineering", "ai-agent"]),
  "tools-schema": term("能力接口", "Tools & Schema", "用结构化名称、参数、类型和结果约定描述模型可以请求的外部能力。", ["prompt-engineering", "ai-agent"]),
  "structured-outputs": term("结构化输出", "Structured Outputs", "让模型输出符合预定结构或 Schema，便于应用校验、解析和后续处理。", ["prompt-engineering", "ai-agent"]),
  "prompt-injection": term("提示注入", "Prompt Injection", "不可信输入试图改变模型指令、诱导泄漏信息或触发越权动作的攻击方式。", ["security", "prompt-engineering", "rag"]),

  rag: term("检索增强生成", "Retrieval-Augmented Generation", "先检索外部证据，再把证据交给模型生成可核验回答。", ["rag", "data-engineering"], "RAG"),
  retrieval: term("检索", "Retrieval", "根据查询从文档、数据库或索引中找出可能相关的候选证据。", ["rag", "data-engineering"]),
  augmentation: term("增强", "Augmentation", "把检索证据、工具结果或业务上下文加入模型输入，以补足当前请求所需信息。", ["rag", "prompt-engineering"]),
  generation: term("生成", "Generation", "模型根据当前上下文逐步产生文本、代码或结构化结果的过程。", ["llm", "rag"]),
  chunking: term("切块", "Chunking", "把长文档拆成可检索单元，同时保留标题、位置、父子关系和版本等上下文。", ["rag", "data-engineering"]),
  "sparse-retrieval": term("稀疏检索", "Sparse Retrieval", "依据词项出现与权重匹配查询，擅长精确术语、编号和专有名词。", ["rag", "data-engineering"]),
  "dense-retrieval": term("稠密检索", "Dense Retrieval", "通过向量表示比较查询与内容的语义接近程度。", ["rag", "data-engineering"]),
  "hybrid-search": term("混合检索", "Hybrid Search", "组合关键词、向量或其他召回方式，再统一融合候选结果。", ["rag", "data-engineering"]),
  "vector-database": term("向量数据库", "Vector Database", "存储、索引和查询向量及其元数据，用于大规模相似度检索。", ["rag", "data-engineering"]),
  bm25: term("最佳匹配 25", "Best Matching 25", "基于词频、逆文档频率和文档长度归一化的经典关键词相关性排序方法。", ["rag", "data-engineering"], "BM25"),
  ann: term("近似最近邻", "Approximate Nearest Neighbor", "以少量精度换取大规模向量近邻检索速度的算法类别。", ["rag", "data-engineering"], "ANN"),
  hnsw: term("分层可导航小世界图", "Hierarchical Navigable Small World", "用多层近邻图加速向量搜索的常见 ANN 索引结构。", ["rag", "data-engineering"], "HNSW"),
  reranking: term("重排", "Reranking", "使用更精细的相关性判断重新排序已召回候选；它无法找回候选集之外的证据。", ["rag"]),
  rrf: term("倒数排名融合", "Reciprocal Rank Fusion", "按候选在多份排序中的名次合并结果，常用于融合关键词与向量召回。", ["rag"], "RRF"),
  grounding: term("有据生成", "Grounding", "让模型回答受可追踪事实、来源或系统状态约束，并能说明依据或拒绝作答。", ["rag", "evaluation"]),
  "data-engineering": term("AI 数据工程", "Data Engineering for AI", "把采集、解析、质量、权限、版本、索引和删除传播组织成可运营的数据链。", ["data-engineering", "rag"]),
  "document-intelligence": term("文档智能", "Document Intelligence", "从复杂文档中恢复文字、版面、表格和证据坐标，供搜索、抽取和复核使用。", ["multimodal", "data-engineering"]),
  "data-contract": term("数据契约", "Data Contract", "明确数据负责人、语义、格式、更新、权限、保留与质量要求。", ["data-engineering", "rag"]),
  "data-lineage": term("数据血缘", "Data Lineage", "追踪数据从来源到解析、切块、向量、索引和评估资产的完整去向。", ["data-engineering", "security"]),
  "deletion-propagation": term("删除传播", "Deletion Propagation", "把删除或撤权同步到缓存、对象、切块、向量、索引和评估资产，并保留完成证据。", ["data-engineering", "security", "rag"]),

  "ai-agent": term("智能体", "AI Agent", "能围绕目标规划步骤、调用工具并根据结果继续行动的 AI 应用。", ["ai-agent"], "Agent"),
  perceive: term("感知", "Perceive", "读取用户目标、环境事实、身份和当前业务状态，形成下一步决策所需输入。", ["ai-agent"]),
  reason: term("思考", "Reason", "基于目标、规则和观察选择下一动作、请求更多信息或停止。", ["ai-agent"]),
  act: term("行动", "Act", "把模型提出的动作意图交给外部控制层校验、授权和执行。", ["ai-agent"]),
  observe: term("观察", "Observe", "回读工具结果和权威系统状态，用于判断动作是否真实完成。", ["ai-agent"]),
  planning: term("规划", "Planning", "把目标拆成步骤，并在新信息、错误和约束出现时调整执行路径。", ["ai-agent"]),
  memory: term("记忆", "Memory", "保存任务相关状态、历史事实或经验；必须区分权威状态、短期上下文和可遗忘记录。", ["ai-agent"]),
  tools: term("工具", "Tools", "供模型提出调用意图的外部能力，实际执行仍需参数、身份和业务规则校验。", ["ai-agent", "mcp"]),
  "tool-calling": term("工具调用", "Tool Calling", "模型按约定结构选择工具和参数，由应用决定是否授权、执行并回传结果。", ["ai-agent", "prompt-engineering", "mcp"]),
  api: term("应用程序编程接口", "Application Programming Interface", "软件系统之间以约定格式发起请求、返回结果的接口契约。", ["ai-agent", "ai-gateway", "mcp"], "API"),
  mcp: term("模型上下文协议", "Model Context Protocol", "让 AI 应用以统一方式发现并调用外部工具、资源和提示的开放协议。", ["mcp", "ai-agent", "a2a"], "MCP"),
  "mcp-protocol-roles": term("MCP 协议角色", "MCP Protocol Roles", "区分 Host、Client 与 Server 的连接、能力聚合和服务暴露责任。", ["mcp"]),
  "mcp-primitives": term("MCP 服务原语", "MCP Server Primitives", "用 Tools、Resources 与 Prompts 表达动作、上下文和提示，并标明副作用边界。", ["mcp", "ai-agent"]),
  a2a: term("智能体间协议", "Agent2Agent Protocol", "用于不同智能体之间发现能力、委托任务和交换任务状态的协议。", ["a2a", "ai-agent"], "A2A"),
  "agent-card": term("Agent Card 能力名片", "Agent Card", "声明智能体身份、服务端点、技能和交互能力，供协作方进行发现与采用判断。", ["a2a"]),
  "a2a-task": term("A2A 任务", "A2A Task", "承载一次跨智能体委托的状态化工作对象，包含生命周期、消息与结果。", ["a2a"]),
  artifact: term("任务产物", "Artifact", "智能体任务形成的可交付结果，需要保留版本、访问边界和验收关系。", ["a2a"]),
  "tool-discovery": term("工具发现", "Tool Discovery", "让调用方读取工具名称、用途、参数和能力变化，再决定是否采用。", ["mcp", "ai-agent"]),
  "agent-collaboration": term("智能体协作", "Agent Collaboration", "多个相互独立的智能体通过明确任务、状态、产物和责任边界共同完成目标。", ["a2a", "ai-agent"]),

  evaluation: term("评估", "Evaluation", "用固定任务、样本、指标和失败归因判断模型或系统是否达到发布门槛。", ["evaluation"]),
  "golden-set": term("黄金评估集", "Golden Evaluation Set", "经过来源确认和人工裁决、用于稳定回归比较的代表性样本集合。", ["evaluation", "ai-ops"]),
  "evaluation-layers": term("三层评估", "Three Evaluation Layers", "分别在模型、组件和业务结果层评估质量，避免局部指标替代端到端成效。", ["evaluation", "ai-ops"]),
  "llm-as-judge": term("模型裁判", "LLM-as-a-Judge", "用模型扩展语义评分，但必须通过人工校准、偏差测试和明确量表控制误判。", ["evaluation"]),
  "ai-governance": term("AI 治理、风险与合规", "AI Governance, Risk & Compliance", "以系统清单、责任、风险分级、控制和持续证据管理 AI 的组织级生命周期。", ["ai-governance"], "AI GRC"),
  "ai-inventory": term("AI 系统清单", "AI System Inventory", "按业务用途登记 AI 系统、模型、数据、所有者、地区、生产状态与风险层级。", ["ai-governance", "model-landscape"]),
  "ai-risk-tiering": term("AI 风险分级", "AI Risk Tiering", "根据具体用途、影响对象、自动化、可逆性和规模配置相称的治理门禁。", ["ai-governance", "security"]),
  "impact-assessment": term("AI 影响评估", "AI Impact Assessment", "识别 AI 用途对个人、组织和社会的潜在影响，并记录控制与残余风险。", ["ai-governance", "evaluation"]),
  "governance-evidence": term("治理证据包", "Governance Evidence Package", "把用途、版本、评估、控制、审批、运行事件与复核结论连接成可审计记录。", ["ai-governance", "evaluation"]),
  "continuous-assurance": term("持续保证", "Continuous Assurance", "通过版本化证据、监控、事件和复核证明控制在变化后仍然有效。", ["ai-governance", "ai-ops"]),
  security: term("AI 安全", "AI Security", "控制不可信内容、数据、模型、工具和输出造成的泄漏、越权与业务伤害。", ["security"]),
  "ai-ops": term("AI 可观测与运营", "AI Operations", "把请求、模型、检索、工具、成本和业务结果关联起来，支持诊断、治理和持续改进。", ["ai-ops", "evaluation"]),
  observability: term("可观测性", "Observability", "通过指标、日志、Trace 和版本信息解释系统发生了什么以及为什么。", ["ai-ops", "evaluation", "ai-infra-platform", "multimodal", "a2a", "ai-gateway"]),
  guardrails: term("护栏", "Guardrails", "在输入、上下文、输出和行动周围增加检测、约束或阻断；它不能替代身份与业务授权。", ["security", "ai-gateway"]),
  "identity-authorization": term("身份与授权", "Identity & Authorization", "确认真实主体，并根据资源、动作和上下文决定其是否有权访问或执行。", ["security", "mcp", "a2a", "ai-gateway"]),
  iam: term("身份与访问管理", "Identity and Access Management", "管理谁能以什么身份访问哪些资源，并记录授权与审计关系。", ["security", "mcp", "ai-agent"], "IAM"),
  acl: term("访问控制列表", "Access Control List", "明确哪些用户或身份可以访问哪些资源及操作。", ["security", "rag", "mcp"], "ACL"),
  dlp: term("数据防泄漏", "Data Loss Prevention", "识别并阻止敏感数据通过输入、输出、日志或文件等路径被不当传递。", ["security", "data-engineering"], "DLP"),
  hitl: term("人在回路", "Human in the Loop", "在高风险、模糊或不可逆环节由人工审批、纠正或接管。", ["ai-agent", "security", "evaluation"], "HITL"),

  "predictive-ai-mlops": term("预测式 AI 与 MLOps", "Predictive AI & MLOps", "把分类、回归、排序与预测模型的数据、特征、训练、发布和监控组织成可重复生命周期。", ["predictive-ai-mlops"]),
  "feature-store": term("特征库", "Feature Store", "统一管理特征定义、历史与在线值，为训练、批量和实时推理提供一致访问。", ["predictive-ai-mlops", "data-engineering"]),
  "model-registry": term("模型注册表", "Model Registry", "登记模型版本、指标、血缘、审批与生命周期阶段，连接候选制品和受控发布。", ["predictive-ai-mlops", "model-landscape"]),
  "point-in-time-correctness": term("时点正确性", "Point-in-time Correctness", "确保训练样本只使用预测时点已经可获得的数据，避免未来信息泄漏。", ["predictive-ai-mlops", "data-engineering"]),
  "training-serving-skew": term("训练—服务偏差", "Training-serving Skew", "训练与线上服务使用不同特征定义、时间语义、默认值或数据源导致的行为偏差。", ["predictive-ai-mlops", "data-engineering"]),
  "model-drift": term("模型漂移", "Model Drift", "输入分布、目标关系或业务情境变化后，模型行为或真实效果偏离已验证范围。", ["predictive-ai-mlops", "ai-ops"]),
  "llm-training": term("大模型训练", "LLM Training", "通过数据、计算和优化更新模型参数，并以检查点、评估和版本治理控制训练结果。", ["llm-training"]),
  pretraining: term("预训练", "Pretraining", "在大规模通用数据上学习基础语言或多模态能力的训练阶段。", ["llm-training", "llm"]),
  "distributed-training": term("分布式训练", "Distributed Training", "把模型、数据或计算切分到多个加速器，同时处理通信、同步和故障恢复。", ["llm-training", "ai-infra-platform"]),
  "fine-tuning": term("微调", "Fine-tuning", "在基础模型上继续训练，使其更稳定地表现目标任务、格式或行为。", ["fine-tuning", "llm-training"]),
  sft: term("监督微调", "Supervised Fine-tuning", "用输入和理想输出示范继续训练模型，使其更稳定地执行目标任务。", ["fine-tuning", "llm-training"], "SFT"),
  rlhf: term("基于人类反馈的强化学习", "Reinforcement Learning from Human Feedback", "利用人工偏好训练奖励信号，再通过强化学习调整模型行为的后训练方法。", ["fine-tuning", "llm-training"], "RLHF"),
  lora: term("低秩适配", "Low-Rank Adaptation", "冻结大部分模型参数，只训练小型低秩矩阵的参数高效微调方法。", ["fine-tuning"], "LoRA"),
  qlora: term("量化低秩适配", "Quantized Low-Rank Adaptation", "在量化且冻结的基础模型上训练 LoRA Adapter，以降低微调显存需求。", ["fine-tuning"], "QLoRA"),
  dpo: term("直接偏好优化", "Direct Preference Optimization", "使用偏好对让模型更倾向获选回答，适合能比较好坏但难写唯一答案的任务。", ["fine-tuning"], "DPO"),
  "llm-inference": term("大模型推理", "LLM Inference", "把训练好的模型作为服务运行，处理提示、调度请求并逐步生成输出。", ["llm-inference"]),
  batching: term("动态批处理", "Dynamic Batching", "在服务端把等待中的多个请求组合计算，以提高吞吐和硬件利用率。", ["llm-inference", "ai-infra-platform"]),
  quantization: term("量化", "Quantization", "用更低位宽表示权重或激活，以降低显存与计算成本，但需要验证精度和运行兼容性。", ["llm-inference", "model-landscape"]),
  ttft: term("首个 Token 时间", "Time to First Token", "从请求发出到收到首个输出 Token 的时间，反映提示处理与排队体验。", ["llm-inference"], "TTFT"),
  tpot: term("每个输出 Token 时间", "Time per Output Token", "首个 Token 之后生成每个 Token 的平均时间，直接影响持续输出速度。", ["llm-inference"], "TPOT"),

  "ai-infra-platform": term("AI 基础设施平台", "AI Infrastructure Platform", "统一管理算力、队列、镜像、作业、模型服务和租户治理的平台层。", ["ai-infra-platform"]),
  "resource-scheduling": term("资源调度", "Resource Scheduling", "按优先级、拓扑、配额和作业需求分配稀缺计算资源。", ["ai-infra-platform"]),
  "gang-scheduling": term("成组调度", "Gang Scheduling", "只有在分布式作业所需资源能够同时满足时才启动，避免部分占用造成空等。", ["ai-infra-platform", "llm-training"]),
  goodput: term("有效吞吐", "Goodput", "衡量满足质量和服务目标的已完成工作量，而不是只看设备忙碌率。", ["ai-infra-platform", "ai-ops"]),
  "ai-infra-compute": term("AI 算力基础设施", "AI Compute Infrastructure", "为训练与推理提供加速器、网络、存储、能源和散热能力的基础设施。", ["ai-infra-compute"]),
  "heterogeneous-compute": term("异构算力", "Heterogeneous Compute", "在不同型号或类型的 CPU、GPU 和其他加速器之间分配适合的工作负载。", ["ai-infra-compute", "ai-infra-platform"]),
  vram: term("显存", "Video Random Access Memory", "加速器上用于存放模型权重、激活、缓存和中间结果的高速内存。", ["ai-infra-compute", "llm-inference"], "VRAM"),
  hbm: term("高带宽内存", "High Bandwidth Memory", "为模型权重、激活和缓存提供高容量与高带宽，影响单卡可承载规模和数据供给速度。", ["ai-infra-compute", "llm-inference"], "HBM"),
  "scale-up": term("节点内扩展", "Scale-up", "通过节点内高带宽互连扩大多加速器协同能力，减少设备间通信瓶颈。", ["ai-infra-compute", "llm-training"]),
  "scale-out": term("跨节点扩展", "Scale-out", "通过网络、RDMA、拥塞控制和集合通信把工作扩展到多个计算节点。", ["ai-infra-compute", "llm-training"]),

  "solution-patterns": term("场景解决方案", "Solution Patterns", "把业务目标拆成任务边界、能力组合、验收证据和运营责任的可复用方案结构。", ["solution-patterns"]),
  "ai-gateway": term("AI 网关", "AI Gateway", "在应用与模型或工具端点之间集中执行身份、路由、预算、安全和遥测策略。", ["ai-gateway"]),
  "model-routing": term("模型路由", "Model Routing", "根据任务、质量、时延、成本、地域或故障状态选择模型端点和回退路径。", ["ai-gateway", "model-landscape"]),
  "rate-limiting": term("限流", "Rate Limiting", "按身份、租户、模型或时间窗口限制请求速率，保护容量并控制异常流量。", ["ai-gateway"]),
  "semantic-cache": term("语义缓存", "Semantic Cache", "按语义相似度复用已验证响应，降低重复调用，但必须隔离身份、权限与时效边界。", ["ai-gateway"]),
  poc: term("概念验证", "Proof of Concept", "用受控范围验证关键假设、风险和验收指标，而不是提前承诺完整上线。", ["solution-patterns", "evaluation"], "PoC"),
  sla: term("服务等级协议", "Service Level Agreement", "对可用性、性能、支持或补偿等服务水平作出的可度量约定。", ["solution-patterns", "ai-ops"], "SLA"),
  slo: term("服务等级目标", "Service Level Objective", "团队为某项服务指标设定的内部或协商目标，用于运营判断和错误预算管理。", ["ai-ops", "solution-patterns", "ai-gateway"], "SLO"),
  tco: term("总拥有成本", "Total Cost of Ownership", "把采购、运行、集成、人工维护和失败处理等完整成本一起计算。", ["solution-patterns", "model-landscape", "ai-infra-compute"], "TCO"),
  finops: term("云财务运营", "FinOps", "让工程、财务和业务共同理解并优化云资源的单位成本、预算和价值。", ["solution-patterns", "ai-ops", "ai-infra-platform", "ai-gateway"]),
});

export const glossaryGroups = Object.freeze([
  Object.freeze({ id: "model-core", zh: "模型基础与能力", en: "Model Foundations", termIds: Object.freeze(["model-landscape", "access-spectrum", "capability-matrix", "model-lifecycle", "llm", "token", "embedding", "transformer", "attention", "qkv", "context-window", "kv-cache", "moe", "multimodal", "vision-transformer", "ocr", "asr"]) }),
  Object.freeze({ id: "prompt-context", zh: "提示与上下文", en: "Prompt and Context", termIds: Object.freeze(["prompt-engineering", "context-engineering", "instructions", "context", "tools-schema", "structured-outputs", "prompt-injection"]) }),
  Object.freeze({ id: "retrieval-data", zh: "检索与数据", en: "Retrieval and Data", termIds: Object.freeze(["rag", "retrieval", "augmentation", "generation", "chunking", "sparse-retrieval", "dense-retrieval", "hybrid-search", "vector-database", "bm25", "ann", "hnsw", "reranking", "rrf", "grounding", "data-engineering", "document-intelligence", "data-contract", "data-lineage", "deletion-propagation"]) }),
  Object.freeze({ id: "agents-protocols", zh: "智能体与协议", en: "Agents and Protocols", termIds: Object.freeze(["ai-agent", "perceive", "reason", "act", "observe", "planning", "memory", "tools", "tool-calling", "api", "mcp", "mcp-protocol-roles", "mcp-primitives", "a2a", "agent-card", "a2a-task", "artifact", "tool-discovery", "agent-collaboration"]) }),
  Object.freeze({ id: "evaluation-security", zh: "评估、安全与治理", en: "Evaluation, Security and Governance", termIds: Object.freeze(["evaluation", "golden-set", "evaluation-layers", "llm-as-judge", "ai-governance", "ai-inventory", "ai-risk-tiering", "impact-assessment", "governance-evidence", "continuous-assurance", "security", "ai-ops", "observability", "guardrails", "identity-authorization", "iam", "acl", "dlp", "hitl"]) }),
  Object.freeze({ id: "training-inference", zh: "训练、MLOps 与推理", en: "Training, MLOps and Inference", termIds: Object.freeze(["predictive-ai-mlops", "feature-store", "model-registry", "point-in-time-correctness", "training-serving-skew", "model-drift", "llm-training", "pretraining", "distributed-training", "fine-tuning", "sft", "rlhf", "lora", "qlora", "dpo", "llm-inference", "batching", "quantization", "ttft", "tpot"]) }),
  Object.freeze({ id: "infrastructure", zh: "平台与算力", en: "Platform and Compute", termIds: Object.freeze(["ai-infra-platform", "resource-scheduling", "gang-scheduling", "goodput", "ai-infra-compute", "heterogeneous-compute", "vram", "hbm", "scale-up", "scale-out"]) }),
  Object.freeze({ id: "solution-delivery", zh: "方案与交付", en: "Solution and Delivery", termIds: Object.freeze(["solution-patterns", "ai-gateway", "model-routing", "rate-limiting", "semantic-cache", "poc", "sla", "slo", "tco", "finops"]) }),
]);

export const homepageTermGroups = Object.freeze([
  Object.freeze({ label: "模型与推理", termIds: Object.freeze(["llm", "token", "transformer", "attention", "kv-cache", "moe"]) }),
  Object.freeze({ label: "应用与上下文", termIds: Object.freeze(["rag", "ai-agent", "prompt-engineering", "context-engineering", "multimodal"]) }),
  Object.freeze({ label: "协议与平台", termIds: Object.freeze(["mcp", "a2a", "api", "ai-gateway", "tool-calling"]) }),
  Object.freeze({ label: "治理与交付", termIds: Object.freeze(["evaluation", "ai-governance", "observability", "guardrails", "poc", "tco"]) }),
]);

export const glossaryTermIds = Object.freeze(glossaryGroups.flatMap((group) => group.termIds));

const glossaryTermIdSet = new Set(glossaryTermIds);
if (glossaryTermIdSet.size !== glossaryTermIds.length) throw new Error("Glossary term IDs must be unique");
if (glossaryTermIds.length !== Object.keys(terminology).length) throw new Error("Every terminology entry must belong to exactly one glossary group");

export function requireTerm(termId) {
  const value = terminology[termId];
  if (!value) throw new Error(`Unknown terminology termId: ${termId}`);
  return value;
}
