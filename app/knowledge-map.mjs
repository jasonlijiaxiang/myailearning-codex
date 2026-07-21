/**
 * 面向读者的 21 模块知识地图。
 *
 * 初始主题与 external_reference/CC-20260717 建立归档映射，新增模块来自全局知识复核。
 * PPT 不定义模块的知识边界、章节顺序或内容上限；正文按售前判断链独立研究，
 * 公开事实由 Reference 台账中的一手来源核验。
 */
export const layers = [
  {
    no: "01",
    name: "方案与选型层",
    en: "Solution & Selection",
    purpose: "把客户目标转成可比较、可采购、可验收的方案。",
    modules: [
      { zh: "场景解决方案", en: "Solution Patterns", slug: "solution-patterns", href: "/modules/solution-patterns" },
      { zh: "模型格局与选型", en: "Model Landscape", slug: "model-landscape", href: "/modules/model-landscape" },
    ],
  },
  {
    no: "02",
    name: "应用模式层",
    en: "Application Patterns",
    purpose: "选择检索、行动与多模态理解的正确组合。",
    modules: [
      { zh: "RAG · 检索增强生成", en: "Retrieval-Augmented Generation", slug: "rag", href: "/modules/rag" },
      { zh: "Agent · 智能体", en: "AI Agent", slug: "ai-agent", href: "/modules/ai-agent" },
      { zh: "多模态", en: "Multimodal AI", slug: "multimodal", href: "/modules/multimodal" },
    ],
  },
  {
    no: "03",
    name: "协议与互操作层",
    en: "Protocols & Interoperability",
    purpose: "明确模型、工具与 Agent 之间的连接和责任边界。",
    modules: [
      { zh: "MCP · 模型上下文协议", en: "Model Context Protocol", slug: "mcp", href: "/modules/mcp" },
      { zh: "A2A · 智能体间协议", en: "Agent2Agent Protocol", slug: "a2a", href: "/modules/a2a" },
    ],
  },
  {
    no: "04",
    name: "AI 应用交付与运营层",
    en: "AI Application Delivery & Operations",
    purpose: "把生成式应用的版本、流量、观测、成本与事故组织成持续工程闭环。",
    modules: [
      { zh: "AI 应用工程与运营", en: "AI Application Engineering & GenAIOps", slug: "ai-ops", href: "/modules/ai-ops" },
      { zh: "AI 网关", en: "AI Gateway", slug: "ai-gateway", href: "/modules/ai-gateway" },
    ],
  },
  {
    no: "05",
    name: "质量、安全与治理层",
    en: "Quality, Security & Governance",
    purpose: "用评估、安全控制、责任和证据决定 AI 系统能否进入并持续留在生产。",
    modules: [
      { zh: "评估", en: "Evaluation", slug: "evaluation", href: "/modules/evaluation" },
      { zh: "AI 治理、风险与合规", en: "AI Governance, Risk & Compliance", slug: "ai-governance", href: "/modules/ai-governance" },
      { zh: "安全", en: "AI Security", slug: "security", href: "/modules/security" },
    ],
  },
  {
    no: "06",
    name: "预测式 AI 与 MLOps 层",
    en: "Predictive AI & MLOps",
    purpose: "把预测模型的数据、特征、训练、发布与真实效果连成持续生命周期。",
    modules: [
      { zh: "预测式 AI 与 MLOps", en: "Predictive AI & MLOps", slug: "predictive-ai-mlops", href: "/modules/predictive-ai-mlops" },
    ],
  },
  {
    no: "07",
    name: "模型与优化层",
    en: "Models & Optimization",
    purpose: "理解模型能力从何而来，以及怎样训练、定制和高效服务。",
    modules: [
      { zh: "大语言模型原理", en: "Large Language Models", slug: "llm", href: "/modules/llm" },
      { zh: "提示词工程", en: "Prompt Engineering", slug: "prompt-engineering", href: "/modules/prompt-engineering" },
      { zh: "微调", en: "Fine-tuning", slug: "fine-tuning", href: "/modules/fine-tuning" },
      { zh: "大模型训练", en: "LLM Training", slug: "llm-training", href: "/modules/llm-training" },
      { zh: "大模型推理", en: "LLM Inference", slug: "llm-inference", href: "/modules/llm-inference" },
    ],
  },
  {
    no: "08",
    name: "数据工程层",
    en: "Data Engineering",
    purpose: "把原始数据变成可信、可追溯、可检索的 AI 输入。",
    modules: [
      { zh: "AI 数据工程", en: "Data Engineering for AI", slug: "data-engineering", href: "/modules/data-engineering" },
    ],
  },
  {
    no: "09",
    name: "AI 基础设施层",
    en: "AI Infrastructure",
    purpose: "承载算力、网络、存储、集群与平台编排。",
    modules: [
      { zh: "AI 基础设施平台", en: "AI Infrastructure Platform", slug: "ai-infra-platform", href: "/modules/ai-infra-platform" },
      { zh: "AI 算力基础设施", en: "AI Compute Infrastructure", slug: "ai-infra-compute", href: "/modules/ai-infra-compute" },
    ],
  },
];

export const moduleList = layers.flatMap((layer) =>
  layer.modules.map((module) => ({
    ...module,
    layerNo: layer.no,
    layerName: layer.name,
    layerEn: layer.en,
    layerPurpose: layer.purpose,
  })),
);

/**
 * 历史地址继续解析为合并后的主要模块，避免同事保存的旧链接失效。
 * 别名不出现在知识地图，也不形成第二份内容。
 */
export const legacyModuleAliases = Object.freeze({
  "scenario-solution-library": "solution-patterns",
  "industry-blueprint": "solution-patterns",
  "business-value-tco": "solution-patterns",
  "workflow-structured-generation": "solution-patterns",
  "model-selection-landscape": "model-landscape",
  multimodality: "multimodal",
  "api-events": "mcp",
  "identity-authorization-boundaries": "security",
  "safety-governance": "security",
  "inference-ai-gateway": "ai-gateway",
  "ai-application-engineering": "ai-ops",
  "ai-finops": "solution-patterns",
  "observability-finops": "solution-patterns",
  "model-principles": "llm",
  "training-fine-tuning": "fine-tuning",
  "model-compression-alignment": "llm-training",
  "parsing-ocr": "data-engineering",
  "synchronization-cdc": "data-engineering",
  "vector-database-retrieval": "data-engineering",
  "quality-knowledge-operations": "data-engineering",
  "accelerators-heterogeneous-compute": "ai-infra-compute",
  "storage-networking": "ai-infra-compute",
  "clusters-scheduling": "ai-infra-platform",
  "inference-stack": "llm-inference",
});

export function resolveModuleSlug(slug) {
  return legacyModuleAliases[slug] ?? slug;
}

export function getModuleBySlug(slug) {
  const canonicalSlug = resolveModuleSlug(slug);
  const knowledgeModule = moduleList.find((item) => item.slug === canonicalSlug);
  return knowledgeModule ? { ...knowledgeModule, requestedSlug: slug, canonicalSlug } : undefined;
}
