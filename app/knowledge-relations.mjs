import { terminology } from "./terminology.mjs";

/**
 * 全局知识关系图只登记稳定 ID、关系类型与关系解释。
 * 节点名称、定义、模块路径和中英文术语继续由现有注册表维护，避免第二份内容源。
 */
export const knowledgeRelationTypes = Object.freeze({
  "primary-owner": Object.freeze({ label: "主要讲解", description: "该模块负责知识点的定义、核心机制与关键边界。" }),
  "contextual-use": Object.freeze({ label: "相关使用", description: "该模块在局部机制或方案判断中使用这个知识点。" }),
  prerequisite: Object.freeze({ label: "前置理解", description: "先理解前者，有助于解释后者为什么成立或如何工作。" }),
  component: Object.freeze({ label: "机制组成", description: "前者是后者内部流程、结构或实现中的组成部分。" }),
  control: Object.freeze({ label: "控制与约束", description: "前者限制、保护或治理后者的运行边界。" }),
  metric: Object.freeze({ label: "衡量指标", description: "前者用于观察或评价后者的运行表现。" }),
});

/**
 * terminology.moduleSlugs 的第一项是主要归属模块；后续项表示相关使用。
 * 这里从统一术语表派生完整的模块—术语关系，不复制术语内容。
 */
export const termPrimaryModules = Object.freeze(Object.fromEntries(
  Object.entries(terminology).map(([termId, term]) => [termId, term.moduleSlugs[0]]),
));

const explicitTermRelationInputs = [
  // 模型基础与推理
  Object.freeze({ from: "token", to: "llm", type: "component", explanation: "大语言模型以 Token 作为输入处理与逐步生成的离散单元。" }),
  Object.freeze({ from: "transformer", to: "llm", type: "component", explanation: "Transformer 是现代大语言模型的主要基础架构。" }),
  Object.freeze({ from: "attention", to: "transformer", type: "component", explanation: "注意力机制负责在 Transformer 中按查询聚合上下文信息。" }),
  Object.freeze({ from: "qkv", to: "attention", type: "component", explanation: "查询、键和值构成注意力匹配与信息聚合的核心表示。" }),
  Object.freeze({ from: "context-window", to: "prompt-engineering", type: "control", explanation: "上下文窗口限制一次请求能够装配的指令、证据与历史范围。" }),
  Object.freeze({ from: "kv-cache", to: "llm-inference", type: "component", explanation: "KV Cache 复用已处理 Token 的注意力状态，是推理服务的关键运行机制。" }),
  Object.freeze({ from: "vram", to: "kv-cache", type: "control", explanation: "显存容量限制可保留的 KV Cache 规模，并影响并发与上下文容量。" }),
  Object.freeze({ from: "ttft", to: "llm-inference", type: "metric", explanation: "TTFT 衡量请求从发起到首个输出 Token 的等待时间。" }),
  Object.freeze({ from: "tpot", to: "llm-inference", type: "metric", explanation: "TPOT 衡量首个 Token 之后持续生成每个输出 Token 的速度。" }),
  Object.freeze({ from: "batching", to: "llm-inference", type: "component", explanation: "动态批处理把等待中的请求组合计算，以改善吞吐与硬件利用率。" }),
  Object.freeze({ from: "quantization", to: "llm-inference", type: "component", explanation: "量化降低权重或激活位宽，但必须同时验证精度与运行兼容性。" }),

  // RAG 与数据工程
  Object.freeze({ from: "retrieval", to: "rag", type: "component", explanation: "RAG 先从外部知识源检索候选证据，再进入上下文组装与生成。" }),
  Object.freeze({ from: "augmentation", to: "rag", type: "component", explanation: "增强步骤把检索证据装入当前请求，使生成受到外部事实约束。" }),
  Object.freeze({ from: "generation", to: "rag", type: "component", explanation: "生成步骤基于问题与检索证据形成最终回答。" }),
  Object.freeze({ from: "chunking", to: "retrieval", type: "prerequisite", explanation: "检索依赖可定位、可更新且保留上下文的切块单元。" }),
  Object.freeze({ from: "embedding", to: "dense-retrieval", type: "prerequisite", explanation: "稠密检索先把查询与内容映射为可比较的向量表示。" }),
  Object.freeze({ from: "bm25", to: "sparse-retrieval", type: "component", explanation: "BM25 是常见的关键词稀疏检索排序方法。" }),
  Object.freeze({ from: "ann", to: "dense-retrieval", type: "component", explanation: "ANN 用近似搜索换取大规模向量检索的速度。" }),
  Object.freeze({ from: "hnsw", to: "ann", type: "component", explanation: "HNSW 是常见的分层图式 ANN 索引结构。" }),
  Object.freeze({ from: "sparse-retrieval", to: "hybrid-search", type: "component", explanation: "混合检索通常融合关键词稀疏召回与其他召回结果。" }),
  Object.freeze({ from: "dense-retrieval", to: "hybrid-search", type: "component", explanation: "混合检索通常融合向量稠密召回与关键词召回。" }),
  Object.freeze({ from: "reranking", to: "retrieval", type: "component", explanation: "重排在候选召回之后用更精细的相关性判断调整顺序。" }),
  Object.freeze({ from: "grounding", to: "generation", type: "control", explanation: "Grounding 要求生成结果受可追踪证据约束，并能说明依据或拒绝作答。" }),
  Object.freeze({ from: "acl", to: "retrieval", type: "control", explanation: "检索必须在当前身份的访问权限范围内返回候选证据。" }),
  Object.freeze({ from: "document-intelligence", to: "chunking", type: "prerequisite", explanation: "复杂文档要先恢复文字、版面与表格结构，才能形成可靠切块。" }),

  // Agent、协议与安全
  Object.freeze({ from: "perceive", to: "ai-agent", type: "component", explanation: "Agent 先读取目标、环境、身份和业务状态，形成决策输入。" }),
  Object.freeze({ from: "reason", to: "ai-agent", type: "component", explanation: "Agent 根据目标、规则与观察选择下一动作或停止。" }),
  Object.freeze({ from: "act", to: "ai-agent", type: "component", explanation: "Agent 把动作意图交给外部控制层校验、授权和执行。" }),
  Object.freeze({ from: "observe", to: "ai-agent", type: "component", explanation: "Agent 回读工具结果与权威状态，判断动作是否真实完成。" }),
  Object.freeze({ from: "planning", to: "ai-agent", type: "component", explanation: "规划把目标拆成步骤，并根据新信息调整执行路径。" }),
  Object.freeze({ from: "memory", to: "ai-agent", type: "component", explanation: "记忆保存任务相关状态与经验，但不能替代权威业务状态。" }),
  Object.freeze({ from: "tool-calling", to: "tools", type: "component", explanation: "工具调用把模型选择的能力与参数转换为受控的外部执行请求。" }),
  Object.freeze({ from: "tools-schema", to: "tool-calling", type: "prerequisite", explanation: "清晰的能力接口与参数 Schema 是可靠工具调用的前提。" }),
  Object.freeze({ from: "identity-authorization", to: "tool-calling", type: "control", explanation: "工具调用必须由模型外的身份与业务授权决定能否真正执行。" }),
  Object.freeze({ from: "hitl", to: "act", type: "control", explanation: "人在回路为高风险、模糊或不可逆动作提供审批与接管。" }),
  Object.freeze({ from: "mcp", to: "tool-discovery", type: "component", explanation: "MCP 允许 AI 应用以统一方式发现工具及其参数能力。" }),
  Object.freeze({ from: "a2a", to: "agent-collaboration", type: "component", explanation: "A2A 用任务、状态与产物语义支持独立 Agent 之间的协作。" }),
  Object.freeze({ from: "guardrails", to: "generation", type: "control", explanation: "护栏可以检测、约束或阻断输出，但不能替代身份和业务授权。" }),

  // 评估、训练、平台与交付
  Object.freeze({ from: "golden-set", to: "evaluation", type: "component", explanation: "黄金评估集提供经确认的代表性样本，用于稳定回归比较。" }),
  Object.freeze({ from: "observability", to: "ai-ops", type: "component", explanation: "可观测性用指标、日志与 Trace 解释系统发生了什么以及为什么。" }),
  Object.freeze({ from: "pretraining", to: "llm-training", type: "component", explanation: "预训练是模型从大规模通用数据学习基础能力的训练阶段。" }),
  Object.freeze({ from: "distributed-training", to: "llm-training", type: "component", explanation: "分布式训练把模型、数据或计算切分到多个加速器并处理同步与恢复。" }),
  Object.freeze({ from: "sft", to: "fine-tuning", type: "component", explanation: "SFT 用输入与理想输出示范让模型更稳定地执行目标任务。" }),
  Object.freeze({ from: "lora", to: "fine-tuning", type: "component", explanation: "LoRA 冻结大部分参数，仅训练小型低秩矩阵。" }),
  Object.freeze({ from: "qlora", to: "lora", type: "component", explanation: "QLoRA 在量化且冻结的基础模型上训练 LoRA Adapter。" }),
  Object.freeze({ from: "dpo", to: "fine-tuning", type: "component", explanation: "DPO 使用偏好对直接优化模型对获选回答的倾向。" }),
  Object.freeze({ from: "resource-scheduling", to: "ai-infra-platform", type: "component", explanation: "资源调度按优先级、拓扑、配额和作业需求分配稀缺算力。" }),
  Object.freeze({ from: "heterogeneous-compute", to: "ai-infra-compute", type: "component", explanation: "异构算力让不同类型加速器承载适合的训练与推理负载。" }),
  Object.freeze({ from: "model-routing", to: "ai-gateway", type: "component", explanation: "模型路由根据任务、质量、时延、成本与故障状态选择端点。" }),
  Object.freeze({ from: "slo", to: "sla", type: "prerequisite", explanation: "可度量的 SLO 为服务水平承诺与持续运营提供内部目标。" }),
  Object.freeze({ from: "tco", to: "solution-patterns", type: "metric", explanation: "TCO 把采购、运行、集成、维护与失败处理纳入方案成本判断。" }),
  Object.freeze({ from: "finops", to: "tco", type: "control", explanation: "FinOps 让工程、财务与业务持续治理单位成本、预算和价值。" }),
];

/**
 * 每条正式关系具有稳定 ID、方向和发布状态。后续如接入来源台账，可在不改变
 * Design 1 / Design 2 的情况下继续补充 sourceIds 与 reviewedAt。
 */
export const explicitTermRelations = Object.freeze(explicitTermRelationInputs.map((relation) => Object.freeze({
  id: `${relation.from}:${relation.type}:${relation.to}`,
  direction: "directed",
  status: "published",
  ...relation,
})));

const relationTypeIds = new Set(Object.keys(knowledgeRelationTypes));
const relationKeys = new Set();

for (const [termId, moduleSlug] of Object.entries(termPrimaryModules)) {
  if (!moduleSlug) throw new Error(`Knowledge graph term lacks primary module: ${termId}`);
}
for (const relation of explicitTermRelations) {
  if (!terminology[relation.from] || !terminology[relation.to]) {
    throw new Error(`Knowledge graph relation references unknown term: ${relation.from} -> ${relation.to}`);
  }
  if (!relationTypeIds.has(relation.type) || ["primary-owner", "contextual-use"].includes(relation.type)) {
    throw new Error(`Knowledge graph relation uses invalid explicit type: ${relation.type}`);
  }
  if (relation.from === relation.to) throw new Error(`Knowledge graph relation cannot self-link: ${relation.from}`);
  const key = relation.id;
  if (relationKeys.has(key)) throw new Error(`Duplicate knowledge graph relation: ${key}`);
  relationKeys.add(key);
}
