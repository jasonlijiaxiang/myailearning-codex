export const REQUIRED_PORTABLE_EXCLUDES = [
  ".git",
  "node_modules",
  "dist",
  ".next",
  ".vinext",
  ".wrangler",
  "outputs",
  "work",
];
export const REQUIRED_PORTABLE_SEGMENT_EXCLUDES = new Set([
  ...REQUIRED_PORTABLE_EXCLUDES,
  "coverage",
]);
export const REQUIRED_PORTABLE_INCLUDES = [
  ".agents/skills/curate-portable-knowledge-base",
  ".codex/hooks.json",
  ".gitignore",
  ".node-version",
  "AGENTS.md",
  "HANDOFF-READ-FIRST.html",
  "HANDOFF.md",
  "README.md",
  "kb.config.json",
  "package.json",
  "package-lock.json",
  "app",
  "public",
  "knowledge/attachment-distribution.json",
  "knowledge/claims",
  "knowledge/release-manifest.json",
  "knowledge/schemas",
  "scripts",
  "tests",
];
export const REQUIRED_PORTABLE_ROOTS = [
  ".agents/skills/curate-portable-knowledge-base",
  "app",
  "public",
  "knowledge/claims",
  "knowledge/schemas",
  "scripts",
  "tests",
];
export const REQUIRED_PORTABLE_FILES = [
  ".agents/skills/curate-portable-knowledge-base/SKILL.md",
  ".agents/skills/curate-portable-knowledge-base/scripts/capture-turn.mjs",
  ".agents/skills/curate-portable-knowledge-base/scripts/hook-bootstrap.mjs",
  ".agents/skills/curate-portable-knowledge-base/scripts/kb-tool.mjs",
  ".agents/skills/curate-portable-knowledge-base/scripts/private-runtime.mjs",
  ".agents/skills/curate-portable-knowledge-base/references/handoff-audit.md",
  ".codex/hooks.json",
  ".gitignore",
  ".node-version",
  "AGENTS.md",
  "HANDOFF-READ-FIRST.html",
  "HANDOFF.md",
  "README.md",
  "kb.config.json",
  "package.json",
  "package-lock.json",
  "knowledge/attachment-distribution.json",
  "app/module-publication.mjs",
  "app/module-content-registry.mjs",
  "app/reference-content.mjs",
  "app/terminology.mjs",
  "knowledge/claims/index.json",
  "knowledge/release-manifest.json",
  "knowledge/schemas/candidate.schema.json",
  "knowledge/schemas/attachment-distribution.schema.json",
  "knowledge/schemas/claim.schema.json",
  "knowledge/schemas/release.schema.json",
  "scripts/release-check.mjs",
];
export const DAILY_QUALITY_COMMANDS = Object.freeze([
  "npm run lint",
  "npm test",
]);
export const ALLOWED_DEFAULT_PUBLISHING_MODES = new Set(["local", "git", "sites"]);
export const HANDOFF_AUDIENCES = Object.freeze(["internal", "external"]);
export const HANDOFF_CONTROL_FILES = new Set(["README.md", "MANIFEST.md", ".gitkeep"]);
export const OFFICE_ATTACHMENT_EXTENSIONS = new Set([
  ".docm",
  ".docx",
  ".potm",
  ".potx",
  ".ppsm",
  ".ppsx",
  ".pptm",
  ".pptx",
  ".xlam",
  ".xlsb",
  ".xlsm",
  ".xlsx",
  ".xltm",
  ".xltx",
]);
export const EXPECTED_HOOK_COMMAND_SHA256 = "0bc700775252b8391ef3ec898ed0e48d536bc4e2ac3aa97c90c9dd11cc73724f";
export const EXPECTED_HOOK_TIMEOUT_SECONDS = 20;
export const EXPECTED_HOOK_EVENTS = Object.freeze(["Stop", "UserPromptSubmit"]);
export const EXPECTED_HOOK_HANDLER_KEYS = Object.freeze([
  "command",
  "commandWindows",
  "statusMessage",
  "timeout",
  "type",
]);
export const INDEX_FILE_MODIFIED_AT = new Date("1980-01-01T00:00:00.000Z");
export const PROCESSABLE_COMPLETENESS = new Set(["full-to-stop", "visible-messages"]);
export const RESULT_ID_PATTERN = /^(candidate|claim|module|source|release):([a-z0-9][a-z0-9._/-]{1,127})$/i;
export const ALLOWED_PORTABLE_INCLUDES = new Set([
  ...REQUIRED_PORTABLE_INCLUDES,
  ".openai/hosting.example.json",
  "build",
  "db",
  "docs",
  "drizzle",
  "examples",
  "external_reference",
  "knowledge",
  "knowledge/module-polish",
  "knowledge/schemas",
  "worker",
  "drizzle.config.ts",
  "eslint.config.mjs",
  "next.config.ts",
  "postcss.config.mjs",
  "tsconfig.json",
  "vite.config.ts",
]);
