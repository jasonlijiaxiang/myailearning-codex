import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const HASH_PATTERN = /^sha256:[0-9a-f]{64}$/;
export const COMMIT_PATTERN = /^[0-9a-f]{40}$/;

export const MODULE_RENDERER_LOGIC_FILES = Object.freeze([
  "app/content-update-metadata.mjs",
  "app/i18n/english-representation-assessment.mjs",
  "app/i18n/english-section-outline.mjs",
  "app/i18n/locale-config.mjs",
  "app/layout-utils.mjs",
  "app/module-representation-assessment.mjs",
  "app/question-filter.mjs",
]);

const moduleRendererLogicFileSet = new Set(MODULE_RENDERER_LOGIC_FILES);

export const CHINESE_MODULE_RENDERER_ENTRY_FILES = Object.freeze([
  "app/(zh)/layout.tsx",
]);

export const ENGLISH_MODULE_RENDERER_ENTRY_FILES = Object.freeze([
  "app/(en)/layout.tsx",
]);

const LEGACY_CHINESE_MODULE_RENDERER_ENTRY_FILES = Object.freeze([
  "app/layout.tsx",
]);

const LEGACY_ENGLISH_MODULE_RENDERER_ENTRY_FILES = Object.freeze([
  "app/layout.tsx",
  "app/en/layout.tsx",
]);

export function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

export function hashBytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function contentHash(value) {
  return hashBytes(JSON.stringify(stableValue(value)));
}

const rendererFileExtensions = new Set([".tsx", ".ts", ".jsx", ".js", ".mjs"]);

export function normalizeRendererDependencyFiles(relativePaths, label = "rendererDependencyFiles") {
  if (!Array.isArray(relativePaths) || relativePaths.length === 0) {
    throw new Error(`${label}: expected at least one project-relative renderer file`);
  }
  const normalized = relativePaths.map((relativePath, index) => {
    if (typeof relativePath !== "string" || !relativePath) throw new Error(`${label}[${index}]: expected a non-empty string`);
    if (relativePath.includes("\\") || path.posix.isAbsolute(relativePath)) {
      throw new Error(`${label}[${index}]: renderer path must be project-relative POSIX syntax`);
    }
    const canonical = path.posix.normalize(relativePath);
    if (canonical !== relativePath || canonical === "." || canonical.startsWith("../") || !canonical.startsWith("app/")) {
      throw new Error(`${label}[${index}]: renderer path must stay inside app/ without dot segments`);
    }
    if (!rendererFileExtensions.has(path.posix.extname(canonical))) {
      throw new Error(`${label}[${index}]: unsupported renderer file extension`);
    }
    return canonical;
  });
  if (new Set(normalized).size !== normalized.length) throw new Error(`${label}: renderer paths must be unique`);
  return normalized.sort();
}

async function secureRendererFilePath(projectRoot, relativePath, label) {
  const [canonicalRelativePath] = normalizeRendererDependencyFiles([relativePath], label);
  const absoluteRoot = await realpath(projectRoot);
  const absolutePath = path.resolve(projectRoot, canonicalRelativePath);
  const fileInfo = await lstat(absolutePath);
  if (fileInfo.isSymbolicLink() || !fileInfo.isFile()) throw new Error(`${label}: renderer dependency must be a regular file`);
  const canonicalPath = await realpath(absolutePath);
  if (canonicalPath !== absoluteRoot && !canonicalPath.startsWith(`${absoluteRoot}${path.sep}`)) {
    throw new Error(`${label}: renderer dependency escapes the project root`);
  }
  return absolutePath;
}

export async function rendererDependencyHash(projectRoot, relativePaths, read = readFile) {
  const normalizedPaths = normalizeRendererDependencyFiles(relativePaths);
  const entries = await Promise.all(normalizedPaths.map(async (relativePath) => [
    relativePath,
    hashBytes(await read(await secureRendererFilePath(projectRoot, relativePath, `rendererDependencyFiles:${relativePath}`))),
  ]));
  return contentHash({
    contract: "module-renderer-dependencies/v1",
    files: Object.fromEntries(entries),
  });
}

async function resolveLocalImport(projectRoot, fromRelativePath, specifier) {
  if (!specifier.startsWith(".")) return null;
  const unresolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromRelativePath), specifier));
  if (unresolved.startsWith("../") || path.posix.isAbsolute(unresolved)) {
    throw new Error(`${fromRelativePath}: renderer import escapes the project: ${specifier}`);
  }
  const candidates = path.posix.extname(unresolved)
    ? [unresolved]
    : [unresolved, ...[".tsx", ".ts", ".jsx", ".js", ".mjs"].map((extension) => `${unresolved}${extension}`), ...[".tsx", ".ts", ".jsx", ".js", ".mjs"].map((extension) => `${unresolved}/index${extension}`)];
  for (const candidate of candidates) {
    try {
      if ((await stat(path.join(projectRoot, candidate))).isFile()) return candidate;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  throw new Error(`${fromRelativePath}: cannot resolve renderer import ${specifier}`);
}

function localImportSpecifiers(source) {
  const specifiers = [];
  const pattern = /\bfrom\s+["']([^"']+)["']|\bimport\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']/g;
  for (const match of source.matchAll(pattern)) specifiers.push(match[1] ?? match[2] ?? match[3]);
  return specifiers;
}

export async function resolveRendererDependencyFiles(projectRoot, entryFiles) {
  const pending = normalizeRendererDependencyFiles([...new Set(entryFiles)], "renderer entry files");
  const resolved = new Set();
  while (pending.length) {
    const relativePath = pending.shift();
    if (resolved.has(relativePath)) continue;
    const source = await readFile(await secureRendererFilePath(projectRoot, relativePath, `renderer dependency ${relativePath}`), "utf8");
    resolved.add(relativePath);
    for (const specifier of localImportSpecifiers(source)) {
      const importedPath = await resolveLocalImport(projectRoot, relativePath, specifier);
      if (!importedPath || importedPath.endsWith(".css")) continue;
      const extension = path.posix.extname(importedPath);
      if (extension === ".mjs" && !moduleRendererLogicFileSet.has(importedPath)) continue;
      if ([".tsx", ".ts", ".jsx", ".js", ".mjs"].includes(extension) && !resolved.has(importedPath)) pending.push(importedPath);
    }
    pending.sort();
  }
  return [...resolved].sort();
}

export function chineseRendererEntryFiles(publication, { routeGroups = true } = {}) {
  const route = publication.routeKind === "dedicated"
    ? (routeGroups ? `app/(zh)${publication.path}/page.tsx` : `app${publication.path}/page.tsx`)
    : (routeGroups ? "app/(zh)/modules/[slug]/page.tsx" : "app/modules/[slug]/page.tsx");
  return [...(routeGroups ? CHINESE_MODULE_RENDERER_ENTRY_FILES : LEGACY_CHINESE_MODULE_RENDERER_ENTRY_FILES), route];
}

export function englishRendererEntryFiles(slug, { routeGroups = true } = {}) {
  const route = slug === "rag"
    ? (routeGroups ? "app/(en)/en/modules/rag/page.tsx" : "app/en/modules/rag/page.tsx")
    : (routeGroups ? "app/(en)/en/modules/[slug]/page.tsx" : "app/en/modules/[slug]/page.tsx");
  return [...(routeGroups ? ENGLISH_MODULE_RENDERER_ENTRY_FILES : LEGACY_ENGLISH_MODULE_RENDERER_ENTRY_FILES), route];
}

function importFrom(projectRoot, relativePath) {
  const url = pathToFileURL(path.join(projectRoot, relativePath));
  url.searchParams.set("localization-root", contentHash(projectRoot).slice(-12));
  return import(url.href);
}

async function importOptionalFrom(projectRoot, relativePath) {
  try {
    return await importFrom(projectRoot, relativePath);
  } catch (error) {
    if (error?.code === "ERR_MODULE_NOT_FOUND") return null;
    throw error;
  }
}

function collectSourceIds(value, target = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectSourceIds(item, target);
    return target;
  }
  if (!value || typeof value !== "object") return target;
  for (const [key, child] of Object.entries(value)) {
    if (key === "sourceId" && typeof child === "string") target.add(child);
    else if (key === "sourceIds" && Array.isArray(child)) {
      for (const sourceId of child) if (typeof sourceId === "string") target.add(sourceId);
    } else collectSourceIds(child, target);
  }
  return target;
}

function selectedEntries(record, ids) {
  return Object.fromEntries([...ids].sort().filter((id) => Object.hasOwn(record, id)).map((id) => [id, record[id]]));
}

function pointerSegment(value) {
  return String(value).replaceAll("~", "~0").replaceAll("/", "~1");
}

function itemIdentity(item, index) {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    for (const key of ["id", "slug", "sourceId", "claimId", "candidateId", "occurrenceId", "artifactId", "reviewId", "receiptId", "defermentId"]) {
      if (typeof item[key] === "string" && item[key]) return `${key}:${item[key]}`;
    }
  }
  return `position:${String(index).padStart(6, "0")}`;
}

function objectTypeFor(pointer) {
  const segments = pointer.split("/").filter(Boolean);
  return segments[1] ?? segments[0] ?? "module";
}

function catalogValue(value, pointer, catalog) {
  if (Array.isArray(value)) {
    const orderPointer = `${pointer}/$order`;
    catalog[orderPointer] = {
      hash: contentHash(value.map(itemIdentity)),
      objectType: `${objectTypeFor(pointer)}-order`,
      sourceIds: [],
    };
    value.forEach((item, index) => {
      const itemPointer = `${pointer}/${String(index).padStart(3, "0")}`;
      catalog[itemPointer] = {
        hash: contentHash(item),
        objectType: objectTypeFor(pointer),
        sourceIds: [...collectSourceIds(item)].sort(),
      };
    });
    return;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
    const nested = entries.some(([, child]) => child && typeof child === "object");
    if (!nested && pointer) {
      catalog[pointer] = {
        hash: contentHash(value),
        objectType: objectTypeFor(pointer),
        sourceIds: [...collectSourceIds(value)].sort(),
      };
      return;
    }
    for (const [key, child] of entries) catalogValue(child, `${pointer}/${pointerSegment(key)}`, catalog);
    return;
  }

  catalog[pointer] = {
    hash: contentHash(value),
    objectType: objectTypeFor(pointer),
    sourceIds: [],
  };
}

export function buildObjectCatalog(slug, snapshot) {
  const catalog = {};
  catalogValue(snapshot, `/module:${pointerSegment(slug)}`, catalog);
  return Object.fromEntries(Object.entries(catalog).sort(([left], [right]) => left.localeCompare(right)));
}

export function diffObjectCatalogs(baselineCatalog, currentCatalog) {
  const ids = [...new Set([...Object.keys(baselineCatalog), ...Object.keys(currentCatalog)])].sort();
  return ids.flatMap((objectId) => {
    const baseline = baselineCatalog[objectId] ?? null;
    const current = currentCatalog[objectId] ?? null;
    if (baseline?.hash === current?.hash) return [];
    return [{
      objectId,
      objectType: current?.objectType ?? baseline?.objectType ?? "unknown",
      changeKind: baseline ? (current ? "modified" : "deleted") : "added",
      baselineHash: baseline?.hash ?? null,
      currentHash: current?.hash ?? null,
      sourceIds: [...new Set([...(baseline?.sourceIds ?? []), ...(current?.sourceIds ?? [])])].sort(),
    }];
  });
}

async function listJsonFiles(directory) {
  const files = [];
  async function visit(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(fullPath);
      else if (entry.isFile() && entry.name.endsWith(".json")) files.push(fullPath);
    }
  }
  await visit(directory);
  return files.sort();
}

async function reviewStateFor(projectRoot, slug) {
  const reviewsRoot = path.join(projectRoot, "knowledge", "claims", "bilingual-reviews");
  const files = {};
  const records = {};
  for (const file of await listJsonFiles(reviewsRoot)) {
    const bytes = await readFile(file);
    const record = JSON.parse(bytes.toString("utf8"));
    if (record.scope?.moduleId !== slug) continue;
    if (files[record.reviewId]) throw new Error(`${slug}: duplicate bilingual review ID ${record.reviewId}`);
    files[record.reviewId] = {
      path: path.relative(projectRoot, file).split(path.sep).join("/"),
      hash: hashBytes(bytes),
      zhContentHash: record.scope?.zhContentHash ?? null,
      enContentHash: record.scope?.enContentHash ?? null,
    };
    records[record.reviewId] = record;
  }
  return {
    files: Object.fromEntries(Object.entries(files).sort(([left], [right]) => left.localeCompare(right))),
    records: Object.fromEntries(Object.entries(records).sort(([left], [right]) => left.localeCompare(right))),
  };
}

function englishSourceView(sourceLedger, englishSourceCopy) {
  return Object.fromEntries(Object.keys(englishSourceCopy).sort().map((sourceId) => {
    const source = sourceLedger[sourceId];
    const copy = englishSourceCopy[sourceId];
    if (!source) throw new Error(`English source copy references unknown source ${sourceId}`);
    return [sourceId, {
      grade: source.grade,
      title: source.title,
      shortTitle: source.shortTitle,
      kind: source.kind,
      verifiedAt: source.verifiedAt,
      href: source.href,
      copy,
    }];
  }));
}

export function composeLocalizationModuleBaseline(zhState, enState, zhBaselineCommit, enBaselineCommit, reviewSetIds = Object.keys(enState.reviewFiles)) {
  const reviewZhHashes = new Set(reviewSetIds.map((reviewId) => enState.reviewFiles[reviewId]?.zhContentHash).filter(Boolean));
  if (reviewZhHashes.size !== 1 || reviewSetIds.some((reviewId) => !enState.reviewFiles[reviewId])) {
    throw new Error(`baseline review set must exist and bind exactly one Chinese content hash`);
  }
  return {
    zhBaselineCommit,
    enBaselineCommit,
    reviewSetIds: [...reviewSetIds].sort(),
    zhReviewHash: [...reviewZhHashes][0],
    zhStateHash: zhState.zhStateHash,
    zhObjects: zhState.zhObjects,
    zhRendererFiles: [...zhState.zhRendererFiles],
    enAuthoredHash: enState.enAuthoredHash,
    enEffectiveHash: enState.enEffectiveHash,
    enReviewHash: enState.enReviewHash,
    enRendererFiles: [...enState.enRendererFiles],
    englishUpdatedAt: enState.englishUpdatedAt,
    reviewFiles: enState.reviewFiles,
  };
}

export function persistableLocalizationModuleState(moduleState, baselineCommit, reviewSetIds = Object.keys(moduleState.reviewFiles)) {
  return composeLocalizationModuleBaseline(moduleState, moduleState, baselineCommit, baselineCommit, reviewSetIds);
}

async function hasProjectFile(projectRoot, relativePath) {
  try {
    return (await lstat(path.join(projectRoot, relativePath))).isFile();
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

export async function loadLocalizationProject(projectRoot, { moduleSlugs = null, englishReferenceScope = "module" } = {}) {
  if (!["module", "directory"].includes(englishReferenceScope)) {
    throw new Error(`englishReferenceScope must be "module" or "directory"; received ${englishReferenceScope}`);
  }
  const [publicationModule, contentModule, briefModule, curriculumModule, learningModule, terminologyModule, referenceModule, englishModule, englishDatesModule, englishOutlineModule, extensionModule, knowledgeMapModule] = await Promise.all([
    importFrom(projectRoot, "app/module-publication.mjs"),
    importFrom(projectRoot, "app/module-content-registry.mjs"),
    importFrom(projectRoot, "app/module-brief-content.mjs"),
    importFrom(projectRoot, "app/module-curriculum-content.mjs"),
    importFrom(projectRoot, "app/module-learning-content.mjs"),
    importFrom(projectRoot, "app/terminology.mjs"),
    importFrom(projectRoot, "app/reference-content.mjs"),
    importFrom(projectRoot, "app/i18n/en/registry.mjs"),
    importOptionalFrom(projectRoot, "app/english-update-dates.mjs"),
    importFrom(projectRoot, "app/i18n/english-section-outline.mjs"),
    importFrom(projectRoot, "app/module-extension-views.mjs"),
    importFrom(projectRoot, "app/knowledge-map.mjs"),
  ]);
  const claims = JSON.parse(await readFile(path.join(projectRoot, "knowledge", "claims", "index.json"), "utf8"));
  const routeGroups = await hasProjectFile(projectRoot, "app/(zh)/layout.tsx")
    && await hasProjectFile(projectRoot, "app/(en)/layout.tsx");
  const sharedEnglishSources = englishSourceView(referenceModule.sourceLedger, englishModule.englishSourceCopy);
  const sharedEnglishReferenceHash = englishReferenceScope === "directory" ? contentHash(sharedEnglishSources) : null;

  const modules = {};
  const rendererFilesCache = new Map();
  const rendererHashCache = new Map();
  async function resolvedRendererFiles(entryFiles) {
    const key = [...entryFiles].sort().join("\n");
    if (!rendererFilesCache.has(key)) rendererFilesCache.set(key, resolveRendererDependencyFiles(projectRoot, entryFiles));
    return rendererFilesCache.get(key);
  }
  async function resolvedRendererHash(files) {
    const key = [...files].sort().join("\n");
    if (!rendererHashCache.has(key)) rendererHashCache.set(key, rendererDependencyHash(projectRoot, files));
    return rendererHashCache.get(key);
  }
  const selectedModuleSlugs = moduleSlugs ? new Set(moduleSlugs) : null;
  for (const publication of publicationModule.publishedModules) {
    const slug = publication.slug;
    if (selectedModuleSlugs && !selectedModuleSlugs.has(slug)) continue;
    const content = contentModule.moduleContentRegistry[slug];
    const brief = briefModule.moduleBriefs[slug] ?? null;
    const curriculum = curriculumModule.moduleCurriculumContent[slug] ?? null;
    const learning = learningModule.moduleLearningContent[slug] ?? null;
    const terms = selectedEntries(terminologyModule.terminology, publication.requiredTerms);
    const referenceModuleView = referenceModule.referenceModules.find((item) => item.id === slug) ?? null;
    const zhRendererFiles = await resolvedRendererFiles(chineseRendererEntryFiles(publication, { routeGroups }));
    const enRendererFiles = await resolvedRendererFiles(englishRendererEntryFiles(slug, { routeGroups }));
    const [chineseRendererHash, englishRendererHash] = await Promise.all([
      resolvedRendererHash(zhRendererFiles),
      resolvedRendererHash(enRendererFiles),
    ]);
    const relatedModuleSlugs = [...new Set([slug, ...(brief?.relatedSlugs ?? [])])];
    const core = {
      publication,
      content,
      brief,
      curriculum,
      learning,
      terms,
      referenceModule: referenceModuleView,
      extensionView: extensionModule.moduleExtensionViews[slug] ?? null,
      canonicalModules: Object.fromEntries(relatedModuleSlugs.map((moduleSlug) => [moduleSlug, knowledgeMapModule.getModuleBySlug(moduleSlug)])),
    };
    const focused = publication.readingProfile === "focused";
    const sourceIds = collectSourceIds(core);
    const relevantClaims = claims.items.filter((claim) => claim.sourceIds?.some((sourceId) => sourceIds.has(sourceId)));
    for (const claim of relevantClaims) for (const sourceId of claim.sourceIds ?? []) sourceIds.add(sourceId);
    const sources = selectedEntries(referenceModule.sourceLedger, sourceIds);
    const zhSnapshot = {
      ...core,
      sources,
      claims: relevantClaims,
      renderedProjection: {
        sharedRendererHash: chineseRendererHash,
        rendererDependencyFiles: zhRendererFiles,
        questionIds: (brief?.qa ?? []).map((question, index) => question.id ?? `qa-${index + 1}`),
        evidenceCardIds: (focused ? (brief?.evidenceCards ?? []).slice(0, 4) : (brief?.evidenceCards ?? [])).map((card, index) => card.id ?? `evidence-${index + 1}`),
      },
    };

    const english = englishModule.englishModuleRegistry[slug];
    const englishSourceIds = collectSourceIds(english);
    const sectionGroups = englishOutlineModule.buildEnglishSectionGroups(english);
    const hasSharedEnglishSelection = typeof englishOutlineModule.selectVisibleEnglishSectionGroups === "function";
    const visibleSectionGroups = hasSharedEnglishSelection
      ? englishOutlineModule.selectVisibleEnglishSectionGroups(english, sectionGroups)
      : (focused ? sectionGroups.filter((group) => group.role === "cloud" || ["decision", "deep"].includes(group.role)) : sectionGroups);
    const visibleQuestions = hasSharedEnglishSelection
      ? englishOutlineModule.selectVisibleEnglishQuestions(english)
      : (focused ? english.qa.slice(0, 5) : english.qa);
    const visibleEvidenceCards = hasSharedEnglishSelection
      ? englishOutlineModule.selectVisibleEnglishEvidenceCards(english)
      : (focused ? english.evidenceCards.slice(0, 4) : english.evidenceCards);
    const canonicalModuleSlugs = [...new Set([slug, ...(english.related ?? [])])];
    const englishPublication = {
      slug: publication.slug,
      path: publication.path,
      routeKind: publication.routeKind,
      visualProfile: publication.visualProfile,
      readingProfile: publication.readingProfile ?? null,
      knowledgeView: publication.knowledgeView ?? null,
    };
    const englishUpdatedAt = englishDatesModule?.getEnglishUpdatedAt(slug) ?? publication.updatedAt ?? null;
    const englishEffective = {
      module: english,
      publication: englishPublication,
      englishUpdatedAt,
      sharedSources: selectedEntries(sharedEnglishSources, englishSourceIds),
      ...(sharedEnglishReferenceHash ? { sharedReferenceDirectoryHash: sharedEnglishReferenceHash } : {}),
      sharedRendererHash: englishRendererHash,
      rendererDependencyFiles: enRendererFiles,
      extensionView: extensionModule.moduleExtensionViews[slug] ?? null,
      canonicalModules: Object.fromEntries(canonicalModuleSlugs.map((moduleSlug) => [moduleSlug, knowledgeMapModule.getModuleBySlug(moduleSlug)])),
      visibleProjection: {
        sectionGroupIds: visibleSectionGroups.map((group) => group.id),
        evidenceCardIds: visibleEvidenceCards.map((card) => card.id),
        questionIds: visibleQuestions.map((question) => question.id),
      },
    };
    const authoredBytes = await readFile(path.join(projectRoot, "app", "i18n", "en", "modules", `${slug}.mjs`));
    const reviewState = await reviewStateFor(projectRoot, slug);

    modules[slug] = {
      zhReviewHash: contentHash(zhSnapshot),
      zhStateHash: contentHash(zhSnapshot),
      zhObjects: buildObjectCatalog(slug, zhSnapshot),
      zhRendererFiles,
      enAuthoredHash: hashBytes(authoredBytes),
      enEffectiveHash: contentHash(englishEffective),
      enReviewHash: contentHash(english),
      enRendererFiles,
      englishUpdatedAt,
      reviewFiles: reviewState.files,
      reviewRecords: reviewState.records,
    };
  }

  return {
    publishedModuleSlugs: [...publicationModule.publishedModuleSlugs],
    modules,
    sourceIds: new Set(Object.keys(referenceModule.sourceLedger)),
    claimIds: new Set(claims.items.map((claim) => claim.id)),
  };
}

export function affectedObjectKey(object) {
  return JSON.stringify({
    objectId: object.objectId,
    objectType: object.objectType,
    changeKind: object.changeKind,
    baselineHash: object.baselineHash,
    currentHash: object.currentHash,
    sourceIds: [...(object.sourceIds ?? [])].sort(),
  });
}

export function assertHashShape(value, label, { nullable = false } = {}) {
  if (nullable && value === null) return;
  if (!HASH_PATTERN.test(value ?? "")) throw new Error(`${label}: expected a full sha256 hash`);
}

export function assertAffectedObjectShape(object, label) {
  assertHashShape(object.baselineHash, `${label}.baselineHash`, { nullable: true });
  assertHashShape(object.currentHash, `${label}.currentHash`, { nullable: true });
  if (object.changeKind === "added" && (object.baselineHash !== null || object.currentHash === null)) {
    throw new Error(`${label}: added requires null baselineHash and a currentHash`);
  }
  if (object.changeKind === "deleted" && (object.baselineHash === null || object.currentHash !== null)) {
    throw new Error(`${label}: deleted requires a baselineHash and null currentHash`);
  }
  if (object.changeKind === "modified" && (object.baselineHash === null || object.currentHash === null || object.baselineHash === object.currentHash)) {
    throw new Error(`${label}: modified requires two different hashes`);
  }
}
