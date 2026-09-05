// 全站内容数据的共享类型契约。
// .mjs 数据文件用 JSDoc（import("./content-types").X）引用这里；
// .tsx 页面删除各自的重复声明，从这里 import。

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
