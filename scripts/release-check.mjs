import { spawn, spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWED_MODES = new Set(["local", "git", "sites"]);
const SITE_PROJECT_ID_PATTERN = /^appgprj_[0-9a-f]{32}$/i;

function parseArguments(argv) {
  let mode = "local";
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== "--mode" || !argv[index + 1] || index + 2 !== argv.length) {
      throw new Error("Usage: npm run kb:release-check -- --mode <local|git|sites>");
    }
    mode = argv[index + 1];
    index += 1;
  }
  if (!ALLOWED_MODES.has(mode)) {
    throw new Error("Usage: npm run kb:release-check -- --mode <local|git|sites>");
  }
  return { mode };
}

function parseConfig(text, source) {
  let config;
  try {
    config = JSON.parse(text);
  } catch (error) {
    throw new Error(`Unable to parse ${source}: ${error.message}`);
  }
  const commands = config?.quality?.commands;
  if (!Array.isArray(commands) || commands.length === 0) {
    throw new Error(`${source} must define a non-empty quality.commands array`);
  }
  if (commands.some((command) => typeof command !== "string" || !command.trim())) {
    throw new Error(`${source} quality.commands must contain non-empty command strings`);
  }
  return config;
}

function git(args, { cwd = PROJECT_ROOT } = {}) {
  return spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    shell: false,
  });
}

function gitBytes(args, { cwd = PROJECT_ROOT } = {}) {
  return spawnSync("git", args, {
    cwd,
    encoding: null,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    shell: false,
  });
}

function requireGit(result, message) {
  if (result.status !== 0) {
    const detail = result.stderr?.trim();
    throw new Error(detail ? `${message}: ${detail}` : message);
  }
  return result.stdout.trim();
}

function readLiveUpstream(remote, mergeRef, mode) {
  const live = git(["ls-remote", "--exit-code", remote, mergeRef]);
  const output = requireGit(live, `${mode} release mode could not verify the live upstream branch`);
  const match = output
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/))
    .find(([, ref]) => ref === mergeRef);
  if (!match?.[0]) {
    throw new Error(`${mode} release mode could not resolve the live upstream branch`);
  }
  return match[0];
}

function inspectExactGitState(mode, expected = null) {
  const topLevel = requireGit(
    git(["rev-parse", "--show-toplevel"]),
    `${mode} release mode requires a Git repository`,
  );
  if (realpathSync(topLevel) !== realpathSync(PROJECT_ROOT)) {
    throw new Error(`${mode} release mode requires the project directory to be the Git top level`);
  }

  const status = requireGit(
    git(["status", "--porcelain=v1", "--untracked-files=all"]),
    `${mode} release mode could not inspect the Git worktree`,
  );
  if (status) {
    throw new Error(`${mode} release mode requires a clean Git worktree, including no untracked files`);
  }

  const sha = requireGit(
    git(["rev-parse", "HEAD"]),
    `${mode} release mode could not resolve HEAD`,
  );
  const branchName = requireGit(
    git(["symbolic-ref", "--quiet", "--short", "HEAD"]),
    `${mode} release mode requires a local branch`,
  );
  const remote = requireGit(
    git(["config", "--get", `branch.${branchName}.remote`]),
    `${mode} release mode requires an upstream branch`,
  );
  const mergeRef = requireGit(
    git(["config", "--get", `branch.${branchName}.merge`]),
    `${mode} release mode requires an upstream branch`,
  );
  const remoteSha = readLiveUpstream(remote, mergeRef, mode);

  if (remoteSha !== sha) {
    throw new Error(`${mode} release mode requires live upstream and local HEAD to match exactly`);
  }
  if (expected && (
    expected.sha !== sha
    || expected.branchName !== branchName
    || expected.remote !== remote
    || expected.mergeRef !== mergeRef
  )) {
    throw new Error(`${mode} release mode detected a Git target change during validation`);
  }
  return { sha, branchName, remote, mergeRef, remoteSha };
}

function readCommittedConfig(sha, mode) {
  const result = git(["show", `${sha}:kb.config.json`]);
  const text = requireGit(
    result,
    `${mode} release mode requires kb.config.json in the target commit`,
  );
  return parseConfig(text, `kb.config.json at ${sha}`);
}

function verifyCommittedIncludes(sha, config, mode) {
  for (const included of config.packaging?.include ?? []) {
    const entry = git(["cat-file", "-e", `${sha}:${included}`]);
    if (entry.status !== 0) {
      throw new Error(`${mode} release mode requires portable source in the target commit: ${included}`);
    }
  }
}

function parseSitesBinding(bytes, source) {
  let binding;
  try {
    binding = JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw new Error(`Sites release mode could not parse ${source}: ${error.message}`);
  }
  if (!SITE_PROJECT_ID_PATTERN.test(binding?.project_id ?? "")) {
    throw new Error(
      "Sites release mode requires a valid bound project_id (appgprj_ followed by 32 hexadecimal characters)",
    );
  }
  return binding;
}

function readSitesBinding(config, sha) {
  const configuredPath = config?.publishing?.sites?.binding;
  if (typeof configuredPath !== "string" || !configuredPath.trim()) {
    throw new Error("Sites release mode requires a configured hosting binding path");
  }
  const bindingPath = path.resolve(PROJECT_ROOT, configuredPath);
  const relative = path.relative(PROJECT_ROOT, bindingPath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Sites release mode requires the hosting binding inside the project root");
  }
  const gitPath = relative.split(path.sep).join("/");
  const committedEntry = git(["cat-file", "-e", `${sha}:${gitPath}`]);
  if (committedEntry.status === 0) {
    const committed = gitBytes(["show", `${sha}:${gitPath}`]);
    if (committed.status !== 0) {
      throw new Error("Sites release mode could not read the hosting binding from the target commit");
    }
    const bytes = Buffer.from(committed.stdout);
    return {
      bindingPath,
      configuredPath,
      bytes,
      binding: parseSitesBinding(bytes, `${configuredPath} at ${sha}`),
      source: "commit",
    };
  }

  if (!existsSync(bindingPath) || !lstatSync(bindingPath).isFile()) {
    throw new Error(`Sites release mode requires ${configuredPath}`);
  }
  const realBinding = realpathSync(bindingPath);
  const realProject = realpathSync(PROJECT_ROOT);
  const realRelative = path.relative(realProject, realBinding);
  if (realRelative.startsWith("..") || path.isAbsolute(realRelative)) {
    throw new Error("Sites release mode refuses a hosting binding outside the project root");
  }

  const bytes = readFileSync(bindingPath);
  return {
    bindingPath,
    configuredPath,
    bytes,
    binding: parseSitesBinding(bytes, configuredPath),
    source: "release-environment",
  };
}

function runCommand(command, cwd, releaseSha = null) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      env: {
        ...process.env,
        KB_RELEASE_SOURCE_ROOT: cwd,
        ...(releaseSha ? { KB_RELEASE_COMMIT: releaseSha } : {}),
      },
      shell: true,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Quality command stopped by ${signal}: ${command}`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`Quality command exited with ${code}: ${command}`));
        return;
      }
      resolve();
    });
  });
}

async function runQualityCommands(config, cwd, releaseSha = null) {
  for (const command of config.quality.commands) {
    console.log(`Running quality command: ${command}`);
    await runCommand(command, cwd, releaseSha);
  }
}

function addExactWorktree(sha, mode) {
  const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "kb-release-"));
  const sourceRoot = path.join(temporaryRoot, "source");
  const added = git(["worktree", "add", "--detach", sourceRoot, sha]);
  if (added.status !== 0) {
    rmSync(temporaryRoot, { recursive: true, force: true });
    requireGit(added, `${mode} release mode could not create an exact-commit worktree`);
  }

  return { temporaryRoot, sourceRoot };
}

async function installExactDependencies(sourceRoot, sha) {
  const packageManifest = path.join(sourceRoot, "package.json");
  const packageLock = path.join(sourceRoot, "package-lock.json");
  const hasManifest = existsSync(packageManifest);
  const hasLock = existsSync(packageLock);

  if (!hasManifest && !hasLock) return;
  if (
    !hasManifest
    || !hasLock
    || !lstatSync(packageManifest).isFile()
    || !lstatSync(packageLock).isFile()
  ) {
    throw new Error(
      "Exact-commit release requires regular package.json and package-lock.json files together",
    );
  }

  console.log("Installing dependencies from the exact-commit package lock.");
  await runCommand(
    "npm ci --ignore-scripts --no-audit --no-fund",
    sourceRoot,
    sha,
  );
}

function removeExactWorktree(worktree) {
  if (!worktree) return;
  const removed = git(["worktree", "remove", "--force", worktree.sourceRoot]);
  if (removed.status !== 0) {
    rmSync(worktree.sourceRoot, { recursive: true, force: true });
    git(["worktree", "prune"]);
  }
  rmSync(worktree.temporaryRoot, { recursive: true, force: true });
}

function installSitesBinding(sourceRoot, sitesBinding) {
  const destination = path.join(sourceRoot, sitesBinding.configuredPath);
  if (existsSync(destination)) {
    if (!lstatSync(destination).isFile() || !readFileSync(destination).equals(sitesBinding.bytes)) {
      throw new Error("Sites release mode found a hosting binding mismatch in the exact worktree");
    }
    return;
  }
  if (sitesBinding.source === "commit") {
    throw new Error("Sites release mode could not materialize the committed hosting binding");
  }
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, sitesBinding.bytes, { flag: "wx" });
}

function requireSitesBindingUnchanged(sitesBinding) {
  if (sitesBinding.source === "commit") return;
  if (
    !existsSync(sitesBinding.bindingPath)
    || !lstatSync(sitesBinding.bindingPath).isFile()
    || !readFileSync(sitesBinding.bindingPath).equals(sitesBinding.bytes)
  ) {
    throw new Error("Sites release mode detected a hosting binding change during validation");
  }
}

async function ensureSitesBuild(config, sourceRoot, sha) {
  const serverEntry = path.join(sourceRoot, "dist", "server", "index.js");
  if (!existsSync(serverEntry)) {
    console.log("Quality commands produced no Sites build; running npm run build.");
    await runCommand("npm run build", sourceRoot, sha);
  }
  if (!existsSync(serverEntry) || !lstatSync(serverEntry).isFile()) {
    throw new Error("Sites release mode requires dist/server/index.js from the exact-commit build");
  }

  const builtBindingPath = path.join(sourceRoot, "dist", ".openai", "hosting.json");
  if (!existsSync(builtBindingPath) || !lstatSync(builtBindingPath).isFile()) {
    throw new Error("Sites release mode requires dist/.openai/hosting.json from the exact-commit build");
  }
  const sourceBinding = readFileSync(path.join(sourceRoot, config.publishing.sites.binding));
  const builtBinding = readFileSync(builtBindingPath);
  if (!sourceBinding.equals(builtBinding)) {
    throw new Error("Sites release mode detected a hosting binding mismatch in the exact-commit build");
  }
}

function stageSitesArtifact(config, sourceRoot, gitState, sitesBinding) {
  const outputsRoot = path.join(PROJECT_ROOT, "outputs");
  if (existsSync(outputsRoot) && !lstatSync(outputsRoot).isDirectory()) {
    throw new Error("Sites release mode requires outputs to be a real directory");
  }
  mkdirSync(outputsRoot, { recursive: true });
  const outputParent = path.join(outputsRoot, "release");
  if (existsSync(outputParent) && !lstatSync(outputParent).isDirectory()) {
    throw new Error("Sites release mode requires outputs/release to be a real directory");
  }
  mkdirSync(outputParent, { recursive: true });
  const stagingRoot = mkdtempSync(path.join(outputParent, `.${gitState.sha}-`));

  cpSync(path.join(sourceRoot, "dist"), path.join(stagingRoot, "dist"), { recursive: true });
  mkdirSync(path.join(stagingRoot, ".openai"), { recursive: true });
  writeFileSync(path.join(stagingRoot, ".openai", "hosting.json"), sitesBinding.bytes);
  const drizzle = path.join(sourceRoot, "drizzle");
  if (existsSync(drizzle)) {
    cpSync(drizzle, path.join(stagingRoot, "drizzle"), { recursive: true });
  }
  writeFileSync(
    path.join(stagingRoot, "release.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      mode: "sites",
      commitSha: gitState.sha,
      upstream: {
        remote: gitState.remote,
        ref: gitState.mergeRef,
        sha: gitState.remoteSha,
      },
      projectId: sitesBinding.binding.project_id,
      bindingSource: sitesBinding.source,
      qualityCommands: config.quality.commands,
    }, null, 2)}\n`,
  );
  return {
    stagingRoot,
    finalRoot: path.join(outputParent, gitState.sha),
  };
}

function publishStagedArtifact(artifact) {
  rmSync(artifact.finalRoot, { recursive: true, force: true });
  renameSync(artifact.stagingRoot, artifact.finalRoot);
  return artifact.finalRoot;
}

async function main() {
  const { mode } = parseArguments(process.argv.slice(2));

  if (mode === "local") {
    const config = parseConfig(
      readFileSync(path.join(PROJECT_ROOT, "kb.config.json"), "utf8"),
      "kb.config.json",
    );
    await runQualityCommands(config, PROJECT_ROOT);
    console.log("Release checks passed for local mode.");
    return;
  }

  const initialGitState = inspectExactGitState(mode);
  const config = readCommittedConfig(initialGitState.sha, mode);
  verifyCommittedIncludes(initialGitState.sha, config, mode);
  const sitesBinding = mode === "sites" ? readSitesBinding(config, initialGitState.sha) : null;
  let worktree = null;
  let stagedArtifact = null;

  try {
    worktree = addExactWorktree(initialGitState.sha, mode);
    await installExactDependencies(worktree.sourceRoot, initialGitState.sha);
    if (sitesBinding) installSitesBinding(worktree.sourceRoot, sitesBinding);
    await runQualityCommands(config, worktree.sourceRoot, initialGitState.sha);

    if (sitesBinding) {
      await ensureSitesBuild(config, worktree.sourceRoot, initialGitState.sha);
      stagedArtifact = stageSitesArtifact(
        config,
        worktree.sourceRoot,
        initialGitState,
        sitesBinding,
      );
      requireSitesBindingUnchanged(sitesBinding);
    }

    inspectExactGitState(mode, initialGitState);
    if (stagedArtifact) {
      const artifactRoot = publishStagedArtifact(stagedArtifact);
      stagedArtifact = null;
      console.log(`Exact Sites artifact root: ${artifactRoot}`);
    }
    console.log(`Release checks passed for ${mode} mode at ${initialGitState.sha}.`);
  } finally {
    if (stagedArtifact) {
      rmSync(stagedArtifact.stagingRoot, { recursive: true, force: true });
    }
    removeExactWorktree(worktree);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
