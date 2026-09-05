import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { RESULT_ID_PATTERN } from "./constants.mjs";

export const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = process.env.NODE_ENV === "test" && process.env.PORTABLE_KB_TEST_ROOT
  ? path.resolve(process.env.PORTABLE_KB_TEST_ROOT)
  : path.resolve(SCRIPT_DIR, "../../../../..");
export const CONFIG_FILE = path.join(PROJECT_ROOT, "kb.config.json");

export function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function portablePath(value) {
  return value.split(path.sep).join("/").replace(/^\.\//, "");
}

export function isWithin(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function resolveProjectPath(relative) {
  if (typeof relative !== "string" || path.isAbsolute(relative)) {
    throw new Error(`Expected a project-relative path, received: ${relative}`);
  }
  const resolved = path.resolve(PROJECT_ROOT, relative);
  if (!isWithin(resolved, PROJECT_ROOT)) throw new Error(`Path leaves project root: ${relative}`);
  return resolved;
}

export function canonicalProjectRelative(value) {
  if (typeof value !== "string" || !value || value.includes("\\") || path.isAbsolute(value)) {
    throw new Error(`Expected a canonical project-relative path, received: ${value}`);
  }
  const normalized = path.posix.normalize(value);
  if (normalized !== value || normalized === "." || normalized.startsWith("../")) {
    throw new Error(`Project path is not canonical: ${value}`);
  }
  resolveProjectPath(value);
  return normalized;
}

export async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

export async function loadConfig() {
  const config = await readJson(CONFIG_FILE);
  if (!config) throw new Error("kb.config.json is missing");
  return config;
}

export function qualityCommands(config) {
  return Array.isArray(config.quality?.commands)
    ? config.quality.commands
    : [...SAFE_QUALITY_COMMANDS];
}

export function sameStringArray(left, right) {
  return Array.isArray(left)
    && left.length === right.length
    && left.every((item, index) => item === right[index]);
}

export function parseResultId(value) {
  const match = RESULT_ID_PATTERN.exec(value ?? "");
  return match ? { kind: match[1].toLowerCase(), id: match[2] } : null;
}

export async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(value.replace(/^v/, ""));
  return match ? match.slice(1).map(Number) : null;
}

export function versionAtLeast(actual, required) {
  for (let index = 0; index < 3; index += 1) {
    if (actual[index] > required[index]) return true;
    if (actual[index] < required[index]) return false;
  }
  return true;
}

export function gitStatus() {
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    shell: false,
  });
  return result.status === 0 ? "available" : "unavailable";
}

export function gitCommand(args) {
  return spawnSync("git", args, {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    shell: false,
  });
}

export function gitBinaryCommand(args, maxBuffer = 16 * 1024 * 1024) {
  return spawnSync("git", args, {
    cwd: PROJECT_ROOT,
    encoding: null,
    maxBuffer,
    shell: false,
  });
}

export function commandOutput(result) {
  if (result.error) return result.error.message;
  return Buffer.isBuffer(result.stderr)
    ? result.stderr.toString("utf8").trim()
    : String(result.stderr ?? "").trim();
}
