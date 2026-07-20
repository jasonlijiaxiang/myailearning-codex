import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "../../../..");
const CAPTURE_SCRIPT = path.join(SCRIPT_DIR, "capture-turn.mjs");

async function requirePlainDirectory(directory) {
  const stat = await fs.lstat(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error("unsafe-bootstrap-path");
}

async function requirePlainFile(file) {
  const stat = await fs.lstat(file);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error("unsafe-bootstrap-path");
}

async function validateBootstrapPath() {
  await requirePlainDirectory(PROJECT_ROOT);
  for (const relative of [
    ".agents",
    ".agents/skills",
    ".agents/skills/curate-portable-knowledge-base",
    ".agents/skills/curate-portable-knowledge-base/scripts",
  ]) {
    await requirePlainDirectory(path.join(PROJECT_ROOT, relative));
  }
  await requirePlainFile(path.join(PROJECT_ROOT, "kb.config.json"));
  await requirePlainFile(CAPTURE_SCRIPT);
}

try {
  await validateBootstrapPath();
  await import(pathToFileURL(CAPTURE_SCRIPT).href);
} catch {
  process.stdout.write('{"continue":true}\n');
}
