#!/usr/bin/env node
/**
 * CSS dead-code analyzer/pruner.
 *
 * Conservative rule: a qualified rule is removable only when EVERY class/id/attr
 * token in its selectors is absent from the codebase's literal usages.
 * Element-only / pseudo-only rules are always kept. Containers (@media,
 * @supports) are removed only when they become empty after inner pruning.
 *
 * Usage:
 *   node scripts/prune-css.mjs            # dry-run report
 *   node scripts/prune-css.mjs --write    # rewrite files
 */
import { readFileSync, writeFile } from "node:fs";
import { execFileSync } from "node:child_process";

/**
 * @typedef {Object} CssNode
 * @property {"rule" | "container" | "layer" | "raw"} kind
 * @property {string} [selector]
 * @property {string} [name]
 * @property {string} prelude
 * @property {number} start
 * @property {number} brace
 * @property {number} close
 * @property {number} end
 * @property {CssNode[]} [children]
 * @property {boolean} [prune]
 */

const WRITE = process.argv.includes("--write");
const LIST = process.argv.includes("--list");
const LIST_FOR = process.env.LIST_FOR ?? "";

const CSS_FILES = [
  "app/fieldbook-v3.css",
  "app/globals.css",
  "app/home-refresh.css",
  "app/model-radar.css",
  "app/a2a-module-experience.module.css",
  "app/mcp-module-experience.module.css",
  "app/preflight.css",
  "app/agent-dense-reader.module.css",
  "app/unified-module-reader.module.css",
  "app/dense-module-reading-modes.module.css",
  "app/scenario-workbench.module.css",
  "app/inference-studio.css",
];

/* ---------------- Corpus: literal tokens used in non-CSS sources ---------- */

function listTrackedFiles() {
  const out = execFileSync("git", ["ls-files"], { encoding: "utf8" });
  return out.split("\n").filter(Boolean)
    .filter((f) => !f.endsWith(".css"))
    .filter((f) => !f.startsWith(".trae/"))
    .filter((f) => !/^HANDPRINT|^HANDOFF/.test(f))
    .filter((f) => !f.startsWith("external_reference/"));
}

const STRING_RE = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|`([^`\\]*(?:\\.[^`\\]*)*)`/g;
const TOKEN_RE = /[A-Za-z0-9_-]+/g;

const usedGlobal = new Set();
const usedModule = new Set();
const prefixTokens = new Set();

for (const file of listTrackedFiles()) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  // All string-literal/template-literal contents.
  for (const m of text.matchAll(STRING_RE)) {
    const content = m[1] ?? m[2] ?? m[3] ?? "";
    for (const t of content.matchAll(TOKEN_RE)) {
      if (t[0].length > 1) usedGlobal.add(t[0]);
    }
    // Template-built classes (e.g. `heatLevel--${level}`, styles[`edge_${id}`]):
    // keep the literal prefix so dynamic suffixes stay protected.
    if (m[3] !== undefined) {
      for (const t of m[3].matchAll(/([A-Za-z0-9_-]+[-_])(?=\s*\$\{)/g)) prefixTokens.add(t[1]);
      for (const t of m[3].matchAll(/([A-Za-z0-9_-]+--)(?=\s*[\s"])/g)) prefixTokens.add(t[1]);
    }
  }
  // Plain attribute values written without braces.
  for (const m of text.matchAll(/\bclass(?:Name)?\s*=\s*([^\s{>]+)/g)) {
    for (const t of m[1].matchAll(TOKEN_RE)) usedGlobal.add(t[0]);
  }
}
// Module corpus = global corpus + every bare identifier in the codebase.
for (const file of listTrackedFiles()) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const m of text.matchAll(/[A-Za-z_][\w-]+/g)) usedModule.add(m[0]);
}

/* ---------------- CSS parser (positions retained) ------------------------- */

/** @param {string} text @returns {CssNode[]} */
function parse(text) {
  /** @type {CssNode[]} */
  const nodes = [];
  parseInto(text, 0, text.length, nodes);
  return nodes;
}

/** @param {string} text @param {number} i @returns {number} */
function skipComment(text, i) {
  if (text[i] === "/" && text[i + 1] === "*") {
    const end = text.indexOf("*/", i + 2);
    return end === -1 ? text.length : end + 2;
  }
  return i;
}

/** @param {string} text @param {number} start @param {number} end @param {CssNode[]} out */
function parseInto(text, start, end, out) {
  let i = start;
  while (i < end) {
    i = skipComment(text, i);
    while (i < end && /\s/.test(text[i])) i++;
    if (i >= end) break;
    const preludeStart = i;
    const brace = findBrace(text, i, end);
    if (brace === -1 || brace >= end) break;
    const prelude = text.slice(preludeStart, brace);
    const close = findClose(text, brace, end);
    const trimmed = prelude.trim();
    if (trimmed.startsWith("@")) {
      const name = /@([\w-]+)/.exec(trimmed)?.[1] ?? "";
      if (name === "media" || name === "supports") {
        /** @type {CssNode[]} */
        const children = [];
        parseInto(text, brace + 1, close, children);
        out.push({ kind: "container", name, prelude, start: preludeStart, brace, close, end: close + 1, children });
      } else if (name === "layer") {
        /** @type {CssNode[]} */
        const children = [];
        parseInto(text, brace + 1, close, children);
        out.push({ kind: "layer", name, prelude, start: preludeStart, brace, close, end: close + 1, children });
      } else {
        // @keyframes, @font-face, @property, etc. — raw keep.
        out.push({ kind: "raw", prelude, start: preludeStart, brace, close, end: close + 1 });
      }
    } else {
      out.push({ kind: "rule", selector: trimmed, prelude, start: preludeStart, brace, close, end: close + 1 });
    }
    i = close + 1;
  }
}

/** @param {string} text @param {number} i @param {number} end @returns {number} */
function findBrace(text, i, end) {
  while (i < end) {
    const c = text[i];
    if (c === "{" || c === ";") return i;
    if (c === "/" && text[i + 1] === "*") {
      i = skipComment(text, i);
      continue;
    }
    if (c === '"' || c === "'") {
      const quote = c;
      i++;
      while (i < end && text[i] !== quote) {
        if (text[i] === "\\") i++;
        i++;
      }
    }
    i++;
  }
  return -1;
}

/** @param {string} text @param {number} brace @param {number} end @returns {number} */
function findClose(text, brace, end) {
  let depth = 0;
  let i = brace;
  while (i < end) {
    const c = text[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return i;
    } else if (c === "/" && text[i + 1] === "*") {
      const cend = text.indexOf("*/", i + 2);
      i = cend === -1 ? end : cend + 1;
      continue;
    } else if (c === '"' || c === "'") {
      const quote = c;
      i++;
      while (i < end && text[i] !== quote) {
        if (text[i] === "\\") i++;
        i++;
      }
    }
    i++;
  }
  return end - 1;
}

/* ---------------- Selector tokens & pruning ------------------------------- */

/** @param {string} selector @returns {{ type: string; value: string }[]} */
function selectorTokens(selector) {
  const tokens = [];
  // Classes (unescaped)
  for (const m of selector.matchAll(/\.(-?[A-Za-z0-9_\u00A0-\uFFFF][\w-]*)/g)) tokens.push({ type: "class", value: m[1] });
  for (const m of selector.matchAll(/#([\w-]+)/g)) tokens.push({ type: "id", value: m[1] });
  for (const m of selector.matchAll(/\[\s*(-?[\w-]+)/g)) tokens.push({ type: "attr", value: m[1] });
  return tokens;
}

/** @param {string} value @param {Set<string>} used @returns {boolean} */
function tokenUsed(value, used) {
  if (used.has(value)) return true;
  for (const prefix of prefixTokens) if (value.startsWith(prefix)) return true;
  return false;
}

/** @param {CssNode} node @param {Set<string>} used */
function markPrunable(node, used) {
  if (node.kind === "rule") {
    const tokens = selectorTokens(node.selector ?? "");
    if (tokens.length === 0) {
      node.prune = false;
      return;
    }
    node.prune = tokens.every((t) => !tokenUsed(t.value, used));
    return;
  }
  if (node.kind === "container" || node.kind === "layer") {
    const children = node.children ?? [];
    for (const child of children) markPrunable(child, used);
    if (node.kind === "container") {
      node.prune = children.length > 0 && children.every((c) => c.prune);
    }
  }
}

/** Preceding comment attached to a pruned node is removed too.
 * @param {CssNode[]} nodes @param {string} text */
function attachComments(nodes, text) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (i > 0 && node.prune) {
      const prev = nodes[i - 1];
      const prevEnd = prev.end;
      const gap = text.slice(prevEnd, node.start);
      const commentMatch = /\s*(\/\\*[\s\S]*?\*\/)\s*$/.exec(gap);
      if (commentMatch) {
        node.start -= commentMatch[0].length;
      }
    }
    const children = node.children;
    if (children) attachComments(children, text);
  }
}

/** @param {CssNode[]} nodes @param {string} text @returns {string} */
function renderNodes(nodes, text) {
  let out = "";
  for (const node of nodes) {
    if (node.prune) continue;
    if (node.kind === "container" || node.kind === "layer") {
      out += text.slice(node.start, node.brace + 1);
      out += renderNodes(node.children ?? [], text);
      out += text.slice(node.close, node.end);
    } else {
      out += text.slice(node.start, node.end);
    }
  }
  return out;
}

/** @param {string} text @returns {string} */
function collapseBlank(text) {
  return text.replace(/\n{3,}/g, "\n\n");
}

/* ---------------- Run ----------------------------------------------------- */

const report = [];
let totalBefore = 0;
let totalAfter = 0;

for (const file of CSS_FILES) {
  const text = readFileSync(file, "utf8");
  const nodes = parse(text);
  const isModule = file.endsWith(".module.css");
  for (const node of nodes) markPrunable(node, isModule ? usedModule : usedGlobal);
  attachComments(nodes, text);
  let next = collapseBlank(renderNodes(nodes, text));
  if (!next.endsWith("\n")) next += "\n";
  const before = text.split("\n").length;
  const after = next.split("\n").length;
  const removed = countRemoved(nodes);
  totalBefore += before;
  totalAfter += after;
  report.push({ file, before, after, removed });
  if (LIST && (!LIST_FOR || file === LIST_FOR)) {
    /** @param {CssNode[]} ns */
    const walk = (ns) => {
      for (const n of ns) {
        if (n.prune && n.kind === "rule") console.log("  - " + (n.selector ?? "").replace(/\s+/g, " ").slice(0, 120));
        const children = n.children;
        if (children) walk(children);
      }
    };
    walk(nodes);
  }
  if (WRITE && next !== text) writeFile(file, next, () => {});
}

/** @param {CssNode[]} nodes @returns {number} */
function countRemoved(nodes) {
  let n = 0;
  for (const node of nodes) {
    if (node.prune) n++;
    const children = node.children;
    if (children) n += countRemoved(children);
  }
  return n;
}

for (const r of report) {
  console.log(`${r.file}  ${r.before} -> ${r.after} lines  (removed ${r.removed} nodes)`);
}
console.log(`\nTOTAL ${totalBefore} -> ${totalAfter} lines  reduction ${(100 * (totalBefore - totalAfter) / totalBefore).toFixed(1)}%`);
console.log(WRITE ? "written." : "dry-run (use --write to apply).");
