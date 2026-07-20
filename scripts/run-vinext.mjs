import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const allowedCommands = new Set(["dev", "build", "start"]);
const command = process.argv[2];
const forwardedArguments = process.argv.slice(3);

if (!allowedCommands.has(command)) {
  console.error("Usage: node scripts/run-vinext.mjs <dev|build|start> [vinext arguments...]");
  process.exit(2);
}

function resolveVinextCli() {
  const require = createRequire(import.meta.url);
  const candidates = [];
  try {
    candidates.push(path.dirname(fileURLToPath(import.meta.resolve("vinext"))));
  } catch {
    // The lookup paths below also work for packages without an exported entry.
  }
  for (const lookupPath of require.resolve.paths("vinext") ?? []) {
    candidates.push(path.join(lookupPath, "vinext"));
  }

  for (const candidate of candidates) {
    let packageRoot = candidate;
    while (packageRoot !== path.dirname(packageRoot)) {
      const manifestPath = path.join(packageRoot, "package.json");
      if (existsSync(manifestPath)) {
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
        if (manifest.name === "vinext") {
          const bin = typeof manifest.bin === "string"
            ? manifest.bin
            : manifest.bin?.vinext ?? Object.values(manifest.bin ?? {})[0];
          if (typeof bin !== "string" || !bin) {
            throw new Error("The installed vinext package does not declare a CLI binary");
          }
          const cli = path.resolve(packageRoot, bin);
          const relative = path.relative(packageRoot, cli);
          if (relative.startsWith("..") || path.isAbsolute(relative) || !existsSync(cli)) {
            throw new Error("The installed vinext package declares an invalid CLI binary");
          }
          return cli;
        }
      }
      packageRoot = path.dirname(packageRoot);
    }
  }
  throw new Error("Unable to locate the installed vinext package manifest");
}

let cli;
try {
  cli = resolveVinextCli();
} catch (error) {
  console.error(`Unable to resolve vinext: ${error.message}`);
  process.exit(1);
}

const child = spawn(process.execPath, [cli, command, ...forwardedArguments], {
  cwd: PROJECT_ROOT,
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: process.env.WRANGLER_LOG_PATH ?? ".wrangler/wrangler.log",
  },
  shell: false,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Unable to start vinext: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`vinext stopped by signal ${signal}`);
    process.exitCode = 1;
    return;
  }

  process.exitCode = code ?? 1;
});
