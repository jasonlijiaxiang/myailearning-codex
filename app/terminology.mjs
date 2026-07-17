/**
 * 专业术语中英对照的内部注册表。模块质量契约只引用稳定 termId，避免
 * 每个页面和测试各自维护一套译法。英文版未来应复用 termId 与来源关系，
 * 但文案仍需独立撰写和专业校对。
 */
export const terminology = Object.freeze({
  rag: Object.freeze({ zh: "检索增强生成", en: "Retrieval-Augmented Generation", abbr: "RAG" }),
  retrieval: Object.freeze({ zh: "检索", en: "Retrieval" }),
  augmentation: Object.freeze({ zh: "增强", en: "Augmentation" }),
  generation: Object.freeze({ zh: "生成", en: "Generation" }),
  "sparse-retrieval": Object.freeze({ zh: "稀疏检索", en: "Sparse Retrieval" }),
  "dense-retrieval": Object.freeze({ zh: "稠密检索", en: "Dense Retrieval" }),
  reranking: Object.freeze({ zh: "重排", en: "Reranking" }),
  grounding: Object.freeze({ zh: "有据生成", en: "Grounding" }),
  "ai-agent": Object.freeze({ zh: "智能体", en: "AI Agent", abbr: "Agent" }),
  perceive: Object.freeze({ zh: "感知", en: "Perceive" }),
  reason: Object.freeze({ zh: "思考", en: "Reason" }),
  act: Object.freeze({ zh: "行动", en: "Act" }),
  observe: Object.freeze({ zh: "观察", en: "Observe" }),
  planning: Object.freeze({ zh: "规划", en: "Planning" }),
  memory: Object.freeze({ zh: "记忆", en: "Memory" }),
  tools: Object.freeze({ zh: "工具", en: "Tools" }),
  "prompt-engineering": Object.freeze({ zh: "提示词工程", en: "Prompt Engineering" }),
  "context-engineering": Object.freeze({ zh: "上下文工程", en: "Context Engineering" }),
  instructions: Object.freeze({ zh: "稳定指令", en: "Instructions" }),
  context: Object.freeze({ zh: "动态上下文", en: "Context" }),
  "tools-schema": Object.freeze({ zh: "能力接口", en: "Tools & Schema" }),
  "structured-outputs": Object.freeze({ zh: "结构化输出", en: "Structured Outputs" }),
  "prompt-injection": Object.freeze({ zh: "提示注入", en: "Prompt Injection" }),
  "solution-patterns": Object.freeze({ zh: "场景解决方案", en: "Solution Patterns" }),
  "model-landscape": Object.freeze({ zh: "模型格局与选型", en: "Model Landscape" }),
  multimodal: Object.freeze({ zh: "多模态", en: "Multimodal AI" }),
  mcp: Object.freeze({ zh: "模型上下文协议", en: "Model Context Protocol", abbr: "MCP" }),
  a2a: Object.freeze({ zh: "智能体间协议", en: "Agent2Agent Protocol", abbr: "A2A" }),
  evaluation: Object.freeze({ zh: "评估", en: "Evaluation" }),
  security: Object.freeze({ zh: "AI 安全", en: "AI Security" }),
  "ai-gateway": Object.freeze({ zh: "AI 网关", en: "AI Gateway" }),
  "ai-ops": Object.freeze({ zh: "AI 可观测与运营", en: "AI Operations" }),
  llm: Object.freeze({ zh: "大语言模型", en: "Large Language Model", abbr: "LLM" }),
  "fine-tuning": Object.freeze({ zh: "微调", en: "Fine-tuning" }),
  "llm-training": Object.freeze({ zh: "大模型训练", en: "LLM Training" }),
  "llm-inference": Object.freeze({ zh: "大模型推理", en: "LLM Inference" }),
  "data-engineering": Object.freeze({ zh: "AI 数据工程", en: "Data Engineering for AI" }),
  "ai-infra-platform": Object.freeze({ zh: "AI 基础设施平台", en: "AI Infrastructure Platform" }),
  "ai-infra-compute": Object.freeze({ zh: "AI 算力基础设施", en: "AI Compute Infrastructure" }),
  transformer: Object.freeze({ zh: "Transformer 架构", en: "Transformer Architecture" }),
  attention: Object.freeze({ zh: "注意力机制", en: "Attention Mechanism" }),
  "kv-cache": Object.freeze({ zh: "键值缓存", en: "Key-Value Cache", abbr: "KV Cache" }),
  "model-routing": Object.freeze({ zh: "模型路由", en: "Model Routing" }),
  "distributed-training": Object.freeze({ zh: "分布式训练", en: "Distributed Training" }),
  lora: Object.freeze({ zh: "低秩适配", en: "Low-Rank Adaptation", abbr: "LoRA" }),
  "batching": Object.freeze({ zh: "动态批处理", en: "Dynamic Batching" }),
  observability: Object.freeze({ zh: "可观测性", en: "Observability" }),
  guardrails: Object.freeze({ zh: "护栏", en: "Guardrails" }),
  "identity-authorization": Object.freeze({ zh: "身份与授权", en: "Identity & Authorization" }),
  "tool-discovery": Object.freeze({ zh: "工具发现", en: "Tool Discovery" }),
  "agent-collaboration": Object.freeze({ zh: "智能体协作", en: "Agent Collaboration" }),
  "golden-set": Object.freeze({ zh: "黄金评估集", en: "Golden Evaluation Set" }),
  "document-intelligence": Object.freeze({ zh: "文档智能", en: "Document Intelligence" }),
  "resource-scheduling": Object.freeze({ zh: "资源调度", en: "Resource Scheduling" }),
  "heterogeneous-compute": Object.freeze({ zh: "异构算力", en: "Heterogeneous Compute" }),
});

export function requireTerm(termId) {
  const term = terminology[termId];
  if (!term) throw new Error(`Unknown terminology termId: ${termId}`);
  return term;
}
