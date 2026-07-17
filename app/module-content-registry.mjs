import { agentEvidenceCards, agentQa } from "./agent-content.mjs";
import { promptEvidenceCards, promptQa } from "./prompt-content.mjs";
import { evidenceCards, ragQa } from "./rag-content.mjs";

/**
 * 已发布模块中可结构化复用的实战与证据数据。正文仍在逐步数据化；新增
 * 正式模块时必须在此登记，避免测试和多载体生成器各自维护模块名单。
 */
export const moduleContentRegistry = Object.freeze({
  rag: Object.freeze({ qa: ragQa, evidenceCards }),
  "ai-agent": Object.freeze({ qa: agentQa, evidenceCards: agentEvidenceCards }),
  "prompt-engineering": Object.freeze({ qa: promptQa, evidenceCards: promptEvidenceCards }),
});

export function requireModuleContent(slug) {
  const content = moduleContentRegistry[slug];
  if (!content) throw new Error(`Unknown published module content: ${slug}`);
  return content;
}
