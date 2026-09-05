// 全站内容数据的共享类型契约。
// .mjs 数据文件用 JSDoc（import("./content-types").X）引用这里；
// .tsx 页面删除各自的重复声明，从这里 import。
import type { DeepDiveBlock as ComponentDeepDiveBlock, ModuleLearningContent } from "./module-content-components";
import type { LensPanel } from "./fieldbook-interactions";

export type Principle = {
  zh: string;
  en: string;
  explanation: string;
  decision: string;
};

export type Decision = {
  question: string;
  signal: string;
  recommendation: string;
  boundary: string;
};

export type DeepDiveItem = {
  id: string;
  title: string;
  body?: string;
  detail?: string;
  signal?: string;
  decision?: string;
  boundary?: string;
  cells?: string[];
  lead?: string;
  [key: string]: unknown;
};

export type DeepDiveBlock = {
  kind: string;
  eyebrow: string;
  title: string;
  intro: string;
  sourceIds: string[];
  items: DeepDiveItem[];
};

export type CloudHook = {
  stage: string;
  services: string;
  value: string;
  discover: string;
};

export type EvidenceCard = {
  metric: string;
  title: string;
  finding: string;
  boundary: string;
  sourceId: string;
  accent?: boolean;
};

export type QaEvidence = {
  sourceId: string;
  supports: string;
};

export type QaItem = {
  q: string;
  a: string;
  depth: string;
  ask: string;
  tag: string;
  basis: string;
  evidence: QaEvidence[];
  addedAt?: string;
};

export type ModuleBrief = {
  slug: string;
  definition: string;
  position: string;
  presentation: string;
  principleTitle: string;
  principles: Principle[];
  decisions: Decision[];
  deepDiveTitle: string;
  deepDiveLead: string;
  deepDives: DeepDiveBlock[];
  criticalBoundary: string;
  cloudHooks: CloudHook[];
  relatedSlugs: string[];
  qa: QaItem[];
  evidenceCards: EvidenceCard[];
  learning?: {
    labs: Array<{
      title: string;
      scenario: string;
      tasks: string[];
      deliverable: string;
      acceptance: string;
    }>;
  };
  [key: string]: unknown;
};

export type Curriculum = {
  chapters: Array<{
    en: string;
    title: string;
    explanation: string;
    decision: string;
    boundary: string;
  }>;
};

export type Learning = {
  outcomes: string[];
  route: Array<{ title: string; learn: string; checkpoint: string }>;
  labs: Array<{
    title: string;
    scenario: string;
    tasks: string[];
    deliverable: string;
    acceptance: string;
  }>;
};

export type Source = {
  grade: string;
  kind: string;
  shortTitle: string;
  title: string;
  note: string;
  verifiedAt: string;
  href: string;
  versionOf?: string;
  localeScope?: string;
};

export type Term = {
  zh: string;
  en: string;
  abbr?: string;
  description: string;
  moduleSlugs: string[];
};

export type PublishedModule = {
  slug: string;
  path: string;
  titleId: string;
  requiredTerms: string[];
  routeKind: "brief" | "dedicated";
  updatedAt: string;
  introducedAt: string;
  knowledgeView?: string;
  readingProfile?: string;
  visualProfile?: string;
};

export type EnglishModule = {
  slug: string;
  title: string;
  subtitle: string;
  definition: string;
  position: string;
  terms: Record<string, { name: string; abbr?: string; definition: string }>;
  qa: Array<{
    id: string;
    q: string;
    a: string;
    depth: string;
    ask: string;
    tag: string;
    basis?: string;
    evidence?: Array<{ sourceId: string; supports?: string }>;
    addedAt?: string;
  }>;
  evidenceCards: Array<{
    id: string;
    metric: string;
    title: string;
    finding: string;
    boundary: string;
    sourceId: string;
  }>;
  sections: unknown[];
  related?: string[];
  [key: string]: unknown;
};

// 三个专用模块（rag / ai-agent / prompt-engineering）manifest.brief 的呈现字段契约：
// 15 键统一结构之上的页面专用扩展字段，供各自页面渲染时类型化取用。

export type ChapterLink = {
  id: string;
  label: string;
  eyebrow: string;
};

export type ConceptLink = {
  concept: string;
  owner: string;
  href: string;
  relation: string;
  local: string;
};

export type AgentMechanicItem = {
  code: string;
  title: string;
  definition: string;
  mechanism: string;
  io: string;
  failure: string;
  control: string;
  cloud: string;
  presales: string;
};

export type RagModuleBrief = {
  definition: string;
  position: string;
  criticalBoundary: string;
  facts: readonly { label: string; value: string }[];
  quickDirectory: readonly ChapterLink[];
  learnDirectory: readonly ChapterLink[];
  fieldDirectory: readonly ChapterLink[];
  conceptLinks: readonly ConceptLink[];
  adoptionChoices: readonly { route: string; fit: string; change: string; evidence: string; limit: string }[];
  evidenceContract: readonly { field: string; question: string; output: string; acceptance: string }[];
  offlineLifecycle: readonly { stage: string; output: string; failure: string; acceptance: string }[];
  onlineLifecycle: readonly { stage: string; output: string; failure: string; signal: string }[];
  modelStack: readonly { component: string; choose: string; experiment: string; release: string }[];
  failureChain: readonly { stage: string; symptom: string; inspect: string; owner: string }[];
  productionControls: readonly { control: string; local: string; evidence: string; owner: string }[];
  cloudHooks: readonly { stage: string; capability: string; value: string; discover: string; acceptance: string; responsibility: string }[];
  economicsStages: readonly { title: string; body: string; decision: string }[];
  extensionChoices: readonly { pattern: string; trigger: string; adds: string; risk: string; owner: string }[];
  protocolBoundaries: readonly { name: string; need: string; notNeed: string; responsibility: string }[];
  qa: QaItem[];
  evidenceCards: EvidenceCard[];
  deepDives: readonly ComponentDeepDiveBlock[];
  learning: ModuleLearningContent;
};

export type AgentModuleBrief = {
  definition: string;
  position: string;
  criticalBoundary: string;
  facts: readonly { label: string; value: string }[];
  chapters: readonly ChapterLink[];
  designChain: readonly { zh: string; en: string }[];
  servingChain: readonly { zh: string; en: string }[];
  conceptLinks: readonly ConceptLink[];
  agentLoop: readonly { zh: string; en: string }[];
  agentActions: readonly AgentMechanicItem[];
  engineeringScopes: readonly { scope: string; name: string; question: string; input: string; owner: string; owns: string; boundary: string }[];
  harnessLayers: readonly { title: string; en: string; body: string }[];
  harnessNeighbors: readonly { name: string; role: string; boundary: string }[];
  harnessEvaluationDimensions: readonly string[];
  architecturePatterns: readonly { name: string; cue: string; pipeline: string; boundary: string }[];
  coreCapabilities: readonly AgentMechanicItem[];
  memoryLayers: readonly { layer: string; en: string; stores: string; read: string; write: string; boundary: string }[];
  interactionBoundaries: readonly { capability: string; purpose: string; owns: string; boundary: string }[];
  cloudHooks: readonly { stage: string; services: string; value: string; discover: string }[];
  systemLens: LensPanel[];
  releaseAcceptanceGates: readonly { name: string; check: string; releaseBlocking?: boolean }[];
  qa: QaItem[];
  evidenceCards: EvidenceCard[];
  deepDives: readonly ComponentDeepDiveBlock[];
};

export type PromptModuleBrief = {
  definition: string;
  position: string;
  criticalBoundary: string;
  facts: readonly { label: string; value: string }[];
  directories: { quick: readonly ChapterLink[]; learn: readonly ChapterLink[]; field: readonly ChapterLink[] };
  conceptLinks: readonly ConceptLink[];
  promptPatterns: readonly { name: string; cue: string; pipeline: string; boundary: string }[];
  messageResponsibilities: readonly { code: string; title: string; body: string; control: string }[];
  techniqueLadder: readonly { symptom: string; technique: string; change: string; boundary: string }[];
  contextBudgetZones: readonly { zone: string; en: string; content: string; control: string }[];
  promptSecurityScenarios: readonly { threat: string; source: string; control: string }[];
  cloudHooks: readonly { stage: string; services: string; value: string; discover: string }[];
  systemLens: LensPanel[];
  qa: QaItem[];
  evidenceCards: EvidenceCard[];
  deepDives: readonly ComponentDeepDiveBlock[];
  caseStudy: {
    title: string;
    intro: string;
    failureRoutes: readonly { symptom: string; route: string; owner: string }[];
    stages: readonly { code: string; title: string; detail: string; gate: string }[];
  };
};
