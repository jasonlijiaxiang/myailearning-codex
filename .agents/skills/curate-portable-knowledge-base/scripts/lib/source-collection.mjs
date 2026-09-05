import { promises as fs } from "node:fs";
import path from "node:path";
import { HANDOFF_CONTROL_FILES, INDEX_FILE_MODIFIED_AT, REQUIRED_PORTABLE_SEGMENT_EXCLUDES } from "./constants.mjs";
import {
  PROJECT_ROOT,
  canonicalProjectRelative,
  commandOutput,
  exists,
  gitBinaryCommand,
  gitCommand,
  isWithin,
  portablePath,
  resolveProjectPath,
} from "./context.mjs";

export function excluded(relative, config, includeSiteBinding, exactExcludes = new Set()) {
  const normalized = portablePath(relative);
  const basename = path.posix.basename(normalized).toLowerCase();
  const segments = normalized.split("/");
  const excludes = new Set((config.packaging.exclude ?? []).map(portablePath));
  const siteBinding = portablePath(config.publishing.sites.binding);
  if (includeSiteBinding) excludes.delete(siteBinding);

  if (exactExcludes.has(normalized)
    || [...exactExcludes].some((item) => (
      normalized.startsWith(`${item}.tmp-`) || normalized.startsWith(`${item}.backup-`)
    ))) return true;

  const privateInbox = portablePath(config.capture.privateInbox).replace(/\/$/, "");
  if (normalized === privateInbox || normalized.startsWith(`${privateInbox}/`)) return true;
  if (!includeSiteBinding && normalized === siteBinding) return true;

  if (normalized === ".DS_Store" || normalized.endsWith("/.DS_Store")) return true;
  if ([
    ".npmrc",
    ".pypirc",
    ".netrc",
    "credentials",
    "credentials.json",
    "service-account.json",
    "id_rsa",
    "id_ed25519",
  ].includes(basename)) return true;
  if (/\.(?:pem|key|p12|pfx|jks|keystore)$/.test(basename)) return true;
  if (normalized.endsWith(".tsbuildinfo") || normalized === "next-env.d.ts") return true;
  if (basename.startsWith(".env")) return true;
  if (/^(?:npm|yarn|pnpm)-debug\.log/.test(basename)) return true;

  for (const item of excludes) {
    if (normalized === item || normalized.startsWith(`${item}/`)) return true;
    if (!item.includes("/") && segments.includes(item)) return true;
  }
  if (segments.some((segment) => REQUIRED_PORTABLE_SEGMENT_EXCLUDES.has(segment))) return true;
  return false;
}

export async function collectPortableFiles(config, includeSiteBinding, exactExcludes = new Set()) {
  const output = [];
  const seen = new Set();

  async function visit(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = portablePath(path.relative(PROJECT_ROOT, absolute));
      if (excluded(relative, config, includeSiteBinding, exactExcludes)) continue;
      if (entry.isSymbolicLink()) throw new Error(`Portable package refuses symlink: ${relative}`);
      if (entry.isDirectory()) await visit(absolute);
      if (entry.isFile() && !seen.has(relative)) {
        seen.add(relative);
        output.push({ absolute, relative });
      }
    }
  }

  const includes = [...(config.packaging.include ?? [])];
  if (includeSiteBinding) includes.push(config.publishing.sites.binding);

  for (const include of includes) {
    const absolute = resolveProjectPath(include);
    if (!await exists(absolute)) continue;
    const stat = await fs.lstat(absolute);
    if (stat.isSymbolicLink()) throw new Error(`Portable package refuses symlink: ${include}`);
    if (stat.isDirectory()) {
      await visit(absolute);
      continue;
    }
    const relative = portablePath(path.relative(PROJECT_ROOT, absolute));
    if (!excluded(relative, config, includeSiteBinding, exactExcludes) && !seen.has(relative)) {
      seen.add(relative);
      output.push({ absolute, relative });
    }
  }

  return output.sort((a, b) => a.relative.localeCompare(b.relative));
}

export async function packagingSourceMode() {
  const top = gitCommand(["rev-parse", "--show-toplevel"]);
  if (top.error?.code === "ENOENT") return "filesystem";
  if (top.status !== 0) {
    const detail = commandOutput(top);
    if (/not a git repository|not a git work tree/i.test(detail)) return "filesystem";
    throw new Error(`Unable to determine portable Git source inventory: ${detail || "git rev-parse failed"}`);
  }

  const [projectRoot, gitTop] = await Promise.all([
    fs.realpath(PROJECT_ROOT),
    fs.realpath(top.stdout.trim()),
  ]);
  if (projectRoot !== gitTop) {
    throw new Error(`Portable project root differs from Git top-level: ${gitTop}`);
  }
  return "git-index";
}

export function assertGitIndexReady() {
  const unstaged = gitCommand(["diff", "--quiet", "--ignore-submodules=none", "--"]);
  if (unstaged.status === 1) {
    throw new Error("Portable packaging requires all tracked changes to be staged");
  }
  if (unstaged.status !== 0) {
    throw new Error(`Unable to inspect unstaged Git changes: ${commandOutput(unstaged) || "git diff failed"}`);
  }

  const unmerged = gitBinaryCommand(["ls-files", "--unmerged", "-z"]);
  if (unmerged.status !== 0) {
    throw new Error(`Unable to inspect unmerged Git entries: ${commandOutput(unmerged) || "git ls-files failed"}`);
  }
  if (unmerged.stdout.length > 0) {
    throw new Error("Portable packaging refuses an index with unmerged entries");
  }

  const flags = gitBinaryCommand(["ls-files", "-v", "-z"]);
  if (flags.status !== 0) {
    throw new Error(`Unable to inspect Git index flags: ${commandOutput(flags) || "git ls-files failed"}`);
  }
  for (const record of flags.stdout.toString("utf8").split("\0").filter(Boolean)) {
    const tag = record[0];
    if (tag === "S" || /[a-z]/.test(tag)) {
      throw new Error(`Portable packaging refuses skip-worktree or assume-unchanged: ${record.slice(2)}`);
    }
  }
}

export async function readExplicitSiteBinding(config) {
  const relative = canonicalProjectRelative(config.publishing.sites.binding);
  const absolute = resolveProjectPath(relative);
  const [projectRoot, realFile] = await Promise.all([
    fs.realpath(PROJECT_ROOT),
    fs.realpath(absolute),
  ]);
  if (!isWithin(realFile, projectRoot)) {
    throw new Error("Explicit Sites binding leaves the real project tree");
  }
  for (let cursor = absolute; cursor !== PROJECT_ROOT; cursor = path.dirname(cursor)) {
    const stat = await fs.lstat(cursor);
    if (stat.isSymbolicLink()) {
      throw new Error(`Portable package refuses symlink: ${relative}`);
    }
  }
  const stat = await fs.lstat(absolute);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error("Explicit Sites binding must be a regular non-symlink file");
  }
  return { relative, data: await fs.readFile(absolute), modified: stat.mtime };
}

export async function collectGitIndexPortableFiles(
  config,
  includeSiteBinding,
  exactExcludes = new Set(),
) {
  assertGitIndexReady();
  const includes = [...(config.packaging.include ?? [])];
  if (includeSiteBinding) includes.push(config.publishing.sites.binding);
  const listing = gitBinaryCommand(
    ["ls-files", "--stage", "-z", "--", ...includes],
    config.packaging.maxArchiveBytes,
  );
  if (listing.status !== 0) {
    throw new Error(`Unable to read portable Git index: ${commandOutput(listing) || "git ls-files failed"}`);
  }

  const files = [];
  const seen = new Set();
  for (const record of listing.stdout.toString("utf8").split("\0").filter(Boolean)) {
    const separator = record.indexOf("\t");
    const metadata = record.slice(0, separator).split(" ");
    const relative = record.slice(separator + 1);
    if (separator < 0 || metadata.length !== 3 || metadata[2] !== "0") {
      throw new Error(`Portable Git index contains an unsupported entry: ${record}`);
    }
    canonicalProjectRelative(relative);
    if (excluded(relative, config, includeSiteBinding, exactExcludes) || seen.has(relative)) continue;
    const [mode, oid] = metadata;
    if (!["100644", "100755"].includes(mode)) {
      throw new Error(`Portable package refuses non-regular Git entry: ${relative}`);
    }
    const blob = gitBinaryCommand(
      ["cat-file", "blob", oid],
      config.packaging.maxArchiveBytes + 1,
    );
    if (blob.status !== 0) {
      throw new Error(`Unable to read staged Git blob ${relative}: ${commandOutput(blob) || "git cat-file failed"}`);
    }
    seen.add(relative);
    const source = { relative, data: blob.stdout, modified: INDEX_FILE_MODIFIED_AT };
    scanPortableText(source);
    files.push(source);
  }
  const siteBinding = portablePath(config.publishing.sites.binding);
  if (includeSiteBinding && !seen.has(siteBinding)) {
    const source = await readExplicitSiteBinding(config);
    scanPortableText(source);
    files.push(source);
  }
  return files.sort((a, b) => a.relative.localeCompare(b.relative));
}

export function scanPortableText({ relative, data }) {
  if (data.includes(0)) return;
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    return;
  }

  const findings = [
    [/(?:^|[\s"'`(=,:])\/(?:Users|home)\/[^/\s"'`]+(?:\/[^\s"'`]*)?/m, "host-local absolute path"],
    [/(?:^|[\s"'`(=,:])[A-Za-z]:[\\/][^\s"'`]+/m, "host-local absolute path"],
    [/file:\/\/(?:\/|[A-Za-z]:)/i, "file URL"],
    [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
    [/(?:^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{20,}/, "secret token"],
    [/(?:^|[^A-Z0-9])AKIA[0-9A-Z]{16}(?:$|[^A-Z0-9])/, "AWS access key"],
    [/(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{12,}/i, "credential assignment"],
  ];
  const finding = findings.find(([pattern]) => pattern.test(text));
  if (finding) {
    throw new Error(`Portable source contains a ${finding[1]}: ${relative}`);
  }
}

export async function collectPortableSourceFiles(config, includeSiteBinding, exactExcludes = new Set()) {
  const mode = await packagingSourceMode();
  if (mode === "git-index") {
    return collectGitIndexPortableFiles(config, includeSiteBinding, exactExcludes);
  }

  const files = await collectPortableFiles(config, includeSiteBinding, exactExcludes);
  const sources = [];
  for (const file of files) {
    const [data, stat] = await Promise.all([fs.readFile(file.absolute), fs.stat(file.absolute)]);
    const source = { relative: file.relative, data, modified: stat.mtime };
    scanPortableText(source);
    sources.push(source);
  }
  return sources;
}

export function configuredAttachmentRoots(config) {
  return (config.handoff?.attachmentRoots ?? []).map((root) => portablePath(root).replace(/\/$/, ""));
}

export function isConfiguredAttachmentPath(relative, config) {
  const normalized = portablePath(relative);
  if (HANDOFF_CONTROL_FILES.has(path.posix.basename(normalized))) return false;
  return configuredAttachmentRoots(config).some((root) => (
    normalized !== root && normalized.startsWith(`${root}/`)
  ));
}
