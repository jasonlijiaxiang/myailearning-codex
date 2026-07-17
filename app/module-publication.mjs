/**
 * 已完整发布模块的唯一注册表。
 *
 * 首页入口、专用路由和自动检查都从这里派生。requiredTerms 指向统一
 * 术语表；contentContract 记录本主题不可丢失的原理、机制、边界、
 * 云服务和客户问答语义。数组长度不是内容配额，只表达本模块当前必须
 * 讲清的知识，不得为了凑数量增删条目。
 */
export const publishedModules = Object.freeze([
  Object.freeze({
    slug: "rag",
    path: "/modules/rag",
    titleId: "rag-title",
    requiredTerms: Object.freeze([
      "rag", "retrieval", "augmentation", "generation", "sparse-retrieval",
      "dense-retrieval", "reranking", "grounding",
    ]),
    contentContract: Object.freeze({
      principle: Object.freeze(["RAG 的工作原理与工程机制", "检索到不等于回答正确"]),
      mechanism: Object.freeze(["候选召回", "过滤与重排", "上下文组装", "有据生成"]),
      boundary: Object.freeze(["召回是证据可用性的上限", "增强发生在上下文"]),
      cloud: Object.freeze(["RAG 技术环节与云服务机会"]),
      customer: Object.freeze(["上下文窗口已经很长，为什么还需要 RAG"]),
    }),
  }),
  Object.freeze({
    slug: "ai-agent",
    path: "/modules/ai-agent",
    titleId: "agent-title",
    requiredTerms: Object.freeze([
      "ai-agent", "perceive", "reason", "act", "observe", "planning", "memory", "tools",
    ]),
    contentContract: Object.freeze({
      principle: Object.freeze(["Agent 的基础概念与工作循环", "感知—思考—行动—观察"]),
      mechanism: Object.freeze(["规划、记忆与工具", "停止条件", "人工接管"]),
      boundary: Object.freeze(["模型会调用 API，不等于模型拥有 API 权限", "不是模型魔法"]),
      cloud: Object.freeze(["Agent 技术环节与云服务机会"]),
      customer: Object.freeze(["什么时候应该用 Agent，什么时候用固定工作流"]),
    }),
  }),
  Object.freeze({
    slug: "prompt-engineering",
    path: "/modules/prompt-engineering",
    titleId: "prompt-title",
    requiredTerms: Object.freeze([
      "prompt-engineering", "context-engineering", "instructions", "context",
      "tools-schema", "structured-outputs", "prompt-injection",
    ]),
    contentContract: Object.freeze({
      principle: Object.freeze(["Prompt 是什么，以及 Context Engineering 的边界", "受控调用"]),
      mechanism: Object.freeze(["稳定指令", "动态上下文", "能力接口"]),
      boundary: Object.freeze(["必须执行的规则应落在模型外", "结构正确不等于事实正确"]),
      cloud: Object.freeze(["提示词工程与云服务机会"]),
      customer: Object.freeze(["系统提示", "是否就等于安全"]),
    }),
  }),
]);

export const publishedModuleSlugs = Object.freeze(publishedModules.map((module) => module.slug));

export function isPublishedModule(slug) {
  return publishedModuleSlugs.includes(slug);
}
