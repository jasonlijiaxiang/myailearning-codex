export const layers = [
  {
    no: "01",
    name: "解决方案层",
    en: "Solution Plays",
    purpose: "把技术能力翻译成客户价值、路线与采购边界。",
    modules: [
      {
        zh: "场景方案库",
        en: "Scenario Solution Library",
        slug: "scenario-solution-library",
        href: "/modules/scenario-solution-library",
      },
      {
        zh: "模型选型格局",
        en: "Model Selection Landscape",
        slug: "model-selection-landscape",
        href: "/modules/model-selection-landscape",
      },
      {
        zh: "行业蓝图",
        en: "Industry Blueprint",
        slug: "industry-blueprint",
        href: "/modules/industry-blueprint",
      },
      {
        zh: "商业价值与 TCO",
        en: "Business Value & TCO",
        slug: "business-value-tco",
        href: "/modules/business-value-tco",
      },
    ],
  },
  {
    no: "02",
    name: "应用模式层",
    en: "Application Patterns",
    purpose: "掌握用模型解决问题的主流模式与组合方式。",
    modules: [
      {
        zh: "RAG · 检索增强生成",
        en: "Retrieval-Augmented Generation",
        slug: "rag",
        href: "/modules/rag",
      },
      {
        zh: "Agent · 智能体",
        en: "AI Agent",
        slug: "ai-agent",
        href: "/modules/ai-agent",
      },
      {
        zh: "多模态",
        en: "Multimodality",
        slug: "multimodality",
        href: "/modules/multimodality",
      },
      {
        zh: "工作流与结构化生成",
        en: "Workflow & Structured Generation",
        slug: "workflow-structured-generation",
        href: "/modules/workflow-structured-generation",
      },
    ],
  },
  {
    no: "03",
    name: "协议与互操作层",
    en: "Protocols & Interoperability",
    purpose: "理解模型、工具、Agent 与系统间如何发现、协作和治理。",
    modules: [
      {
        zh: "MCP · 模型上下文协议",
        en: "Model Context Protocol",
        slug: "mcp",
        href: "/modules/mcp",
      },
      {
        zh: "A2A · 智能体间协议",
        en: "Agent2Agent Protocol",
        slug: "a2a",
        href: "/modules/a2a",
      },
      {
        zh: "API / 事件",
        en: "API / Event",
        slug: "api-events",
        href: "/modules/api-events",
      },
      {
        zh: "身份与授权边界",
        en: "Identity & Authorization Boundaries",
        slug: "identity-authorization-boundaries",
        href: "/modules/identity-authorization-boundaries",
      },
    ],
  },
  {
    no: "04",
    name: "工程保障层",
    en: "Engineering Assurance",
    purpose: "让 PoC 从“能回答”走向“可上线、可治理、可运营”。",
    modules: [
      {
        zh: "评估",
        en: "Evaluation",
        slug: "evaluation",
        href: "/modules/evaluation",
      },
      {
        zh: "安全与治理",
        en: "Safety & Governance",
        slug: "safety-governance",
        href: "/modules/safety-governance",
      },
      {
        zh: "推理与 AI 网关",
        en: "Inference & AI Gateway",
        slug: "inference-ai-gateway",
        href: "/modules/inference-ai-gateway",
      },
      {
        zh: "可观测与 FinOps",
        en: "Observability & FinOps",
        slug: "observability-finops",
        href: "/modules/observability-finops",
      },
    ],
  },
  {
    no: "05",
    name: "模型基础层",
    en: "Model Foundations",
    purpose: "建立解释模型能力、局限与优化手段所需的理论底座。",
    modules: [
      {
        zh: "模型原理",
        en: "Model Principles",
        slug: "model-principles",
        href: "/modules/model-principles",
      },
      {
        zh: "提示词工程",
        en: "Prompt Engineering",
        slug: "prompt-engineering",
        href: "/modules/prompt-engineering",
      },
      {
        zh: "训练与微调",
        en: "Training & Fine-tuning",
        slug: "training-fine-tuning",
        href: "/modules/training-fine-tuning",
      },
      {
        zh: "模型压缩与对齐",
        en: "Model Compression & Alignment",
        slug: "model-compression-alignment",
        href: "/modules/model-compression-alignment",
      },
    ],
  },
  {
    no: "06",
    name: "数据底座层",
    en: "Data Foundation",
    purpose: "把非结构化与结构化数据转成可信、可检索、可运营的知识。",
    modules: [
      {
        zh: "解析 / OCR",
        en: "Parsing & OCR",
        slug: "parsing-ocr",
        href: "/modules/parsing-ocr",
      },
      {
        zh: "同步 / CDC",
        en: "Synchronization & CDC",
        slug: "synchronization-cdc",
        href: "/modules/synchronization-cdc",
      },
      {
        zh: "向量库与检索",
        en: "Vector Database & Retrieval",
        slug: "vector-database-retrieval",
        href: "/modules/vector-database-retrieval",
      },
      {
        zh: "质量与知识运营",
        en: "Quality & Knowledge Operations",
        slug: "quality-knowledge-operations",
        href: "/modules/quality-knowledge-operations",
      },
    ],
  },
  {
    no: "07",
    name: "算力底座层",
    en: "Compute Foundation",
    purpose: "理解模型以下的硬件、集群、存储、网络与平台能力。",
    modules: [
      {
        zh: "加速器与异构算力",
        en: "Accelerators & Heterogeneous Compute",
        slug: "accelerators-heterogeneous-compute",
        href: "/modules/accelerators-heterogeneous-compute",
      },
      {
        zh: "集群与调度",
        en: "Clusters & Scheduling",
        slug: "clusters-scheduling",
        href: "/modules/clusters-scheduling",
      },
      {
        zh: "推理栈",
        en: "Inference Stack",
        slug: "inference-stack",
        href: "/modules/inference-stack",
      },
      {
        zh: "存储与网络",
        en: "Storage & Networking",
        slug: "storage-networking",
        href: "/modules/storage-networking",
      },
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

export function getModuleBySlug(slug) {
  return moduleList.find((module) => module.slug === slug);
}
