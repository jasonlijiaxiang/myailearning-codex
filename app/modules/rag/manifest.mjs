// RAG · 检索增强生成（Retrieval-Augmented Generation）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { ragLearningContent } from "../../rag-content.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "rag";

export default Object.freeze({
  slug,
  zh: "RAG · 检索增强生成",
  en: "Retrieval-Augmented Generation",
  titleId: "rag-title",
  layerNo: "02",
  routeKind: "dedicated",
  introducedAt: "2026-07-17",
  updatedAt: "2026-07-29",
  requiredTerms: Object.freeze(["rag","retrieval","augmentation","generation","sparse-retrieval","dense-retrieval","reranking","grounding"]),
  knowledgeView: "application-architecture",
  readingProfile: "focused",
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "dc2edf09ae4b7d8dc60c0ad568d78b0fd4aed3847021103310769e23e46cd746",
  qaCoverageTags: Object.freeze(["方案判断","离线证据","在线检索","有据回答","局部验收"]),
  contentContract: deepFreeze({"principle":["回答证据的成立条件"],"mechanism":["离线证据与在线回答生命周期","RAG 组件选型"],"boundary":["检索到不等于回答正确"],"cloud":["云能力、验收与责任映射"],"customer":["客户高频问题与深度回答"]}),
  brief: null,
  curriculum: null,
  learning: ragLearningContent,
  extensionViews: null,
  discovery: deepFreeze({"summary":"用可更新、经授权的外部资料为模型回答提供依据。","cue":"答案必须基于企业知识，并说明出处和适用范围"}),
  referenceShortTitle: "RAG",
  additionalSourceIds: Object.freeze(["bm25-book","dpr-2020","rrf-2009","beir-2021","mteb-2023","miracl-2023","clirmatrix-2020","hnsw-2016","rag-survey","graphrag","chunking-study","rag-original-2020","bert-reranker","fid-2021","replug-2024","self-rag","lost-middle","contextual-retrieval","ragas","nist-genai-profile","nist-aml-100-2e2025","nist-zero-trust","finops-unit-economics","finops-ai-tools-considerations","owasp-prompt-injection","owasp-vector-weaknesses","docling-report","pp-ocr-2020","colpali-2025","fine-tuning-or-retrieval","opentelemetry-semconv","opentelemetry-genai-observability-2026"]),
  englishUpdatedAt: "2026-07-29",
  englishReaderConfig: deepFreeze({"titleId":"rag-english-title","shortTitle":"RAG","criticalBoundary":"RAG does not turn retrieved text into truth. It turns governed external material into candidate evidence and preserves enough identity, scope, and provenance for the application to decide whether a claim may be made.","facts":[{"label":"Adoption condition","value":"Changing evidence, access, citation, or withdrawal"},{"label":"Evidence path","value":"Source → evidence object → answer decision"},{"label":"Production gate","value":"Authority, identity, version, citation, and safe stop"},{"label":"Extension rule","value":"Add Agent, MCP, or A2A only for a measured need"}],"directories":{"quick":[{"id":"rag-english-primer-title","label":"Primer","eyebrow":"Evidence system"},{"id":"concept-map","label":"Decision map","eyebrow":"Start with the outcome"},{"id":"when-to-use","label":"Adoption test","eyebrow":"Choose the simplest route"}],"learn":[{"id":"rag-principle","label":"Usable evidence","eyebrow":"Authority and scope"},{"id":"architecture","label":"Reference architecture","eyebrow":"Offline and online chains"},{"id":"retrieval-basics","label":"Retrieval foundations","eyebrow":"Evidence objects"},{"id":"production-rag","label":"Online answer path","eyebrow":"Answer or safe stop"},{"id":"choice","label":"Stack selection","eyebrow":"Target the bottleneck"},{"id":"rag-independent-depth","label":"Lifecycle consistency","eyebrow":"Access and versions"},{"id":"poc","label":"PoC decision","eyebrow":"Go, Repair, or Stop"},{"id":"rag-variants","label":"Extension patterns","eyebrow":"Add measured complexity"},{"id":"rag-evidence-practice","label":"Practice outputs","eyebrow":"Learn by deliverable"}],"field":[{"id":"cloud-opportunities","label":"Cloud capabilities","eyebrow":"Map value and ownership"},{"id":"rag-customer-question-guide","label":"Question guide","eyebrow":"Use the pack"},{"id":"evidence","label":"Evidence and limits","eyebrow":"Know what sources prove"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Follow responsibility"}]},"groupIds":{"quick":["concept-map","when-to-use"],"learn":["rag-principle","architecture","retrieval-basics","production-rag","choice","rag-independent-depth","poc","rag-variants","rag-evidence-practice"],"field":["cloud-opportunities","rag-customer-question-guide"]},"fieldGroupsBeforeEvidence":true}),
  unifiedBriefConfig: null,
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
