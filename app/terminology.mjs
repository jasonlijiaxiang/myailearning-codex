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
});

export function requireTerm(termId) {
  const term = terminology[termId];
  if (!term) throw new Error(`Unknown terminology termId: ${termId}`);
  return term;
}
