import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const KB_TOOL = path.join(
  PROJECT_ROOT,
  ".agents/skills/curate-portable-knowledge-base/scripts/kb-tool.mjs",
);
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";

function run(executable, args, cwd) {
  const env = { ...process.env };
  delete env.PORTABLE_KB_TEST_ROOT;
  delete env.PORTABLE_KB_TEST_FAIL_PUBLISH;
  delete env.NPM_CONFIG_PRODUCTION;
  delete env.npm_config_production;
  delete env.NPM_CONFIG_OMIT;
  env.NODE_ENV = "test";
  return spawnSync(executable, args, {
    cwd,
    env,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    shell: false,
  });
}

function storedZipEntries(archive) {
  const entries = new Map();
  let offset = 0;
  while (offset + 30 <= archive.length && archive.readUInt32LE(offset) === 0x04034b50) {
    const method = archive.readUInt16LE(offset + 8);
    assert.equal(method, 0, "portable forward test expects stored ZIP entries");
    const size = archive.readUInt32LE(offset + 18);
    const nameLength = archive.readUInt16LE(offset + 26);
    const extraLength = archive.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const dataEnd = dataStart + size;
    assert.ok(dataEnd <= archive.length, "ZIP entry must remain inside the archive");
    const name = archive.subarray(nameStart, nameStart + nameLength).toString("utf8");
    entries.set(name, archive.subarray(dataStart, dataEnd));
    offset = dataEnd;
  }
  return entries;
}

async function extractStoredEntries(entries, destination) {
  for (const [name, data] of entries) {
    assert.ok(name && !name.includes("\\") && !path.posix.isAbsolute(name));
    assert.equal(path.posix.normalize(name), name);
    assert.ok(!name.startsWith("../"));
    const target = path.resolve(destination, ...name.split("/"));
    const relative = path.relative(destination, target);
    assert.ok(!relative.startsWith("..") && !path.isAbsolute(relative));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, data);
  }
}

test("the real portable archive installs, validates, and builds from a fresh no-Git directory", {
  timeout: 180_000,
}, async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-forward-"));
  try {
    const archivePath = path.join(root, "knowledge-base.zip");
    const packaged = run(process.execPath, [KB_TOOL, "package", "--output", archivePath], PROJECT_ROOT);
    assert.equal(packaged.status, 0, `${packaged.stdout}\n${packaged.stderr}`);

    const archive = await fs.readFile(archivePath);
    const entries = storedZipEntries(archive);
    const manifest = JSON.parse(entries.get("PORTABLE-MANIFEST.json").toString("utf8"));
    const paths = new Set(manifest.files.map((file) => file.path));
    assert.equal(manifest.siteBindingIncluded, false);
    assert.ok(paths.has("HANDOFF-READ-FIRST.html"));
    assert.ok(paths.has("HANDOFF.md"));
    assert.ok(paths.has("package-lock.json"));
    assert.ok(paths.has("knowledge/schemas/release.schema.json"));
    assert.ok(!paths.has(".openai/hosting.json"));
    assert.ok(![...paths].some((name) => name.startsWith("knowledge/private-inbox/")));
    assert.ok(![...paths].some((name) => (
      name.split("/").some((segment) => [".git", "node_modules", "dist"].includes(segment))
    )));

    const extracted = path.join(root, "extracted");
    await fs.mkdir(extracted);
    await extractStoredEntries(entries, extracted);

    const handoffHtml = await fs.readFile(path.join(extracted, "HANDOFF-READ-FIRST.html"), "utf8");
    assert.match(handoffHtml, /<title>How to use this KB/);
    assert.match(handoffHtml, /Windows \+ WSL2/);
    assert.match(handoffHtml, /class="copy-button"/);
    assert.match(handoffHtml, /name="handoff-source-sha256"/);

    const install = run(
      NPM,
      ["ci", "--ignore-scripts", "--prefer-offline", "--no-audit", "--no-fund"],
      extracted,
    );
    assert.equal(install.status, 0, `${install.stdout}\n${install.stderr}`);
    const doctor = run(NPM, ["run", "kb:doctor"], extracted);
    assert.equal(doctor.status, 0, `${doctor.stdout}\n${doctor.stderr}`);
    const validation = run(NPM, ["run", "kb:validate"], extracted);
    assert.equal(validation.status, 0, `${validation.stdout}\n${validation.stderr}`);
    const hookCheck = run(
      process.execPath,
      [
        "--test",
        "--test-name-pattern",
        "^Codex hooks capture visible messages",
        "tests/portable-knowledge.test.mjs",
      ],
      extracted,
    );
    assert.equal(hookCheck.status, 0, `${hookCheck.stdout}\n${hookCheck.stderr}`);
    const build = run(NPM, ["run", "build"], extracted);
    assert.equal(build.status, 0, `${build.stdout}\n${build.stderr}`);
    await fs.access(path.join(extracted, "dist", "server", "index.js"));
    await assert.rejects(fs.access(path.join(extracted, "dist", ".openai", "hosting.json")));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
