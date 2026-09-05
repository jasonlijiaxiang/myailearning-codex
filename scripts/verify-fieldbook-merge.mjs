#!/usr/bin/env node
/*
 * fieldbook-v2 → fieldbook-v3 @layer 合并等价验证器。
 *
 * 模型：
 *   BEFORE = 改动前的样式束（无 layer，按 bundle 顺序）：
 *     preflight → globals → fieldbook-v2 → fieldbook-v3 → home-refresh → inference-studio → model-radar
 *   AFTER  = 改动后的样式束：
 *     preflight / globals 内容放进 layer(fieldbook-base)；
 *     fieldbook-v2 内容放进 layer(fieldbook-v2)（写在合并后的 fieldbook-v3.css 里）；
 *     fieldbook-v3 其余内容与 home-refresh / inference-studio / model-radar 保持 unlayered。
 *
 * 级联规则（对完全相同的「上下文路径 + 选择器」）：
 *   normal：unlayered > 后声明的 layer > 先声明的 layer；同层按 bundle 顺序 + 文件内位置后者胜。
 *   important：先声明的 layer > 后声明的 layer > unlayered；同层按顺序后者胜。
 *   important 永远压过 normal。
 *
 * Phase 1：同上下文 (ctx, selector, prop) 逐键比较。
 * Phase 2：跨上下文粗比对（同一 selector+prop，忽略条件、按顺序/层级定胜负），
 *          用于捕捉「顶层规则 vs 媒体规则」类冲突；互斥媒体条件对在白名单中豁免。
 * 白名单（有意变更）：
 *   - prefers-color-scheme: dark 的 :root 覆盖块为新增暗色 token（任务要求）。
 *   - 少量 min-height:auto 声明改前即被更晚的 v2 顶层规则覆盖，删除等价。
 * 模块 CSS（*.module.css 编译选择器带哈希）不参与机械比较，由人工复查。
 *
 * 用法：node scripts/verify-fieldbook-merge.mjs <beforeDir> <afterAppDir>
 */
import { readFileSync } from "node:fs";

/**
 * @typedef {{ prop: string, value: string, important: boolean }} Decl
 * @typedef {{ layer: string, ctx: string[], selector: string, decls: Decl[], pos: number }} Rule
 * @typedef {{ value: string, from: string, layer: string, rank: number, important: boolean }} Winner
 */
import { resolve } from "node:path";

const [, , beforeDir, afterRoot] = process.argv;

const FILES_BEFORE = [
  ["preflight.css", "unlayered"],
  ["globals.css", "unlayered"],
  ["fieldbook-v2.css", "unlayered"],
  ["fieldbook-v3.css", "unlayered"],
  ["home-refresh.css", "unlayered"],
  ["inference-studio.css", "unlayered"],
  ["model-radar.css", "unlayered"],
];

const FILES_AFTER = [
  ["preflight.css", "fieldbook-base"],
  ["globals.css", "fieldbook-base"],
  ["fieldbook-v3.css", "auto"], // 文件内部按 @layer fieldbook-v2 块拆分
  ["home-refresh.css", "unlayered"],
  ["inference-studio.css", "unlayered"],
  ["model-radar.css", "unlayered"],
];

const LAYER_RANK = /** @type {Record<string, number>} */ ({ "fieldbook-base": 0, "fieldbook-v2": 1, unlayered: 2 });

/*
 * AFTER 侧为消除 !important 而改写选择器形态的等价别名（after 形态 → before 形态）。
 * 语义前提（人工核验）：
 *   - .fieldbookTheme .topbar（720 媒体）：topbar 恒在 main.fieldbookTheme 内；
 *   - .latencyMeasures .latencyTtft/Tpot/E2e：span 恒为 .latencyMeasures 的直接子元素。
 */
const SELECTOR_ALIASES = new Map([
  ["@media (max-width: 720px)::.fieldbookTheme .topbar", "@media (max-width: 720px)::.topbar"],
  ["::.latencyMeasures .latencyTtft", "::.latencyTtft"],
  ["::.latencyMeasures .latencyTpot", "::.latencyTpot"],
  ["::.latencyMeasures .latencyE2e", "::.latencyE2e"],
]);

// 有意新增：暗色 token 覆盖块（改前不存在，任务要求）。
const INTENTIONAL_CTX = new Set(["@media (prefers-color-scheme: dark)"]);

// 有意删除的死声明白名单：改前即被更晚的跨上下文规则覆盖（min-height: auto
// 被 v2 顶层 min-height: 0 覆盖；合并后 v2 层规则仍覆盖 fieldbook-base），删除等价。
const DROPPED_DEAD_OVERRIDES = new Map([
  ["@media (max-width: 720px)::.briefPrinciples--decision article", new Set(["min-height"])],
  ["@media (max-width: 720px)::.briefPrinciples--spectrum article", new Set(["min-height"])],
  ["@media (max-width: 720px)::.briefPrinciples--decision[data-odd=\"true\"] article:last-child", new Set(["min-height"])],
  ["@media (max-width: 720px)::.briefPrinciples--spectrum[data-odd=\"true\"] article:last-child", new Set(["min-height"])],
]);

/*
 * 手动等价链（改前由「非同一选择器」的重要声明决定胜负，机械模型看不见）：
 * 改前 home 顶栏在 ≤720 时的高度由 v3 的 `.topbar { height: auto !important }`
 * 压过 home-refresh 的 `.fieldbookHome .topbar { height: 68px }`；改后 v3 侧写成
 * `.fieldbookTheme .topbar`（由 SELECTOR_ALIASES 归一），home-refresh 侧补一条
 * `.fieldbookHome .topbar { height: auto }` 完成同一链条，行为等价。
 */
const INTENTIONAL_ADDITIONS = new Map([
  ["@media (max-width: 720px)::.fieldbookHome .topbar", new Set(["height"])],
]);
const PHASE2_SKIP = new Map([
  [".fieldbookHome .topbar", new Set(["height"])],
]);

const EXCLUSIVE_CTX_PAIRS = [
  ["@media (min-width: 901px) and (max-width: 1180px)", "@media (max-width: 720px)"],
  ["@media (min-width: 901px) and (max-height: 900px)", "@media (max-width: 720px)"],
  ["@media (max-width: 1100px)", "@media (max-width: 680px)"],
];

/** @param {string} source */
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, "");

/** @param {string} list @returns {string[]} */
function splitSelectors(list) {
  const out = [];
  let cur = "";
  let depth = 0;
  let quote = null;
  for (let k = 0; k < list.length; k += 1) {
    const c = list[k];
    if (quote) {
      cur += c;
      if (c === quote && list[k - 1] !== "\\") quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    if (c === "(" || c === "[") depth += 1;
    if (c === ")" || c === "]") depth -= 1;
    if (c === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

/**
 * 解析一个 CSS 文件为规则列表（支持 @media/@container/@supports/@layer 嵌套）。
 * @param {string} source
 * @param {string} layerSpec
 * @returns {Rule[]}
 */
function parseFile(source, layerSpec) {
  const css = stripComments(source);
  /** @type {Rule[]} */
  const rules = [];
  /** @type {string[]} */
  const ctx = [];
  /** @type {{type: string, prev?: string}[]} */
  const stack = [];
  let i = 0;
  let pending = "";
  let inOpaque = false;
  const opaqueBrace = [];
  let layerName = layerSpec === "auto" ? "unlayered" : layerSpec;

  /** @param {string} head @param {string} body @param {string} layer @param {number} pos @param {string[]} atCtx */
  const emit = (head, body, layer, pos, atCtx) => {
    const decls = [];
    for (const d of body.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)) {
      const value = d[2].trim().replace(/\s+/g, " ").toLowerCase();
      const important = /!\s*important\s*$/.test(value);
      decls.push({ prop: d[1].toLowerCase(), value: value.replace(/!\s*important\s*$/, "").trim(), important });
    }
    if (decls.length === 0) return;
    for (const raw of splitSelectors(head)) {
      const selector = raw.trim().replace(/\s+/g, " ");
      if (!selector || selector.startsWith("@")) continue;
      rules.push({ layer, ctx: [...atCtx], selector, decls, pos });
    }
  };

  while (i < css.length) {
    const ch = css[i];
    if (inOpaque) {
      if (ch === "{") opaqueBrace.push("{");
      else if (ch === "}") {
        if (opaqueBrace.length === 0) inOpaque = false;
        else opaqueBrace.pop();
      }
      i += 1;
      continue;
    }
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end < 0 ? css.length : end + 2;
      continue;
    }
    if (ch === "{" || ch === "}" || ch === ";") {
      const head = pending.trim();
      pending = "";
      if (ch === "{") {
        const kw = head.match(/^@([-\w]+)/)?.[1];
        if (kw === "layer" && !head.includes("(")) {
          const name = head.replace(/^@layer\s+/, "").trim();
          stack.push({ type: "layer", prev: layerName });
          if (!name.includes(",")) layerName = name;
          i += 1;
          pending = "";
          continue;
        } else if (kw !== undefined && ["keyframes", "font-face", "page", "property"].includes(kw)) {
          inOpaque = true;
        } else if (kw !== undefined && ["media", "container", "supports"].includes(kw)) {
          ctx.push(head);
          stack.push({ type: "media" });
        } else if (kw) {
          stack.push({ type: "at" });
        } else if (head) {
          let depth = 0;
          let j = i + 1;
          let q = null;
          for (; j < css.length; j += 1) {
            const cc = css[j];
            if (q) {
              if (cc === q && css[j - 1] !== "\\") q = null;
              continue;
            }
            if (cc === '"' || cc === "'") q = cc;
            if (cc === "{") depth += 1;
            if (cc === "}") {
              depth -= 1;
              if (depth < 0) break;
            }
          }
          emit(head, css.slice(i + 1, j), layerName, i, ctx);
          i = j + 1;
          continue;
        }
      } else if (ch === "}") {
        const top = stack.pop();
        if (top?.type === "media") ctx.pop();
        if (top?.type === "layer" && top.prev !== undefined) layerName = top.prev;
      }
      i += 1;
      continue;
    }
    pending += ch;
    i += 1;
  }
  return rules;
}

/** @param {string[][]} specs @param {string} root */
function readSide(specs, root) {
  return specs.map(([name, layerSpec], idx) => ({
    name,
    order: idx,
    rules: parseFile(readFileSync(resolve(root, name), "utf8"), layerSpec),
  }));
}

/**
 * 一侧最终声明映射：key = ctx.join("|") + "::" + selector
 * @param {{name: string, order: number, rules: Rule[]}[]} files
 * @param {boolean} layered
 * @returns {Map<string, {normals: Map<string, Winner>, importants: Map<string, Winner>}>}
 */
function resolveSide(files, layered) {
  const final = new Map();
  for (const file of files) {
    for (const rule of file.rules) {
      const rawKey = `${rule.ctx.join("|")}::${rule.selector}`;
      const key = SELECTOR_ALIASES.get(rawKey) ?? rawKey;
      let entry = final.get(key);
      if (!entry) {
        entry = { normals: new Map(), importants: new Map() };
        final.set(key, entry);
      }
      for (const d of rule.decls) {
        const target = d.important ? entry.importants : entry.normals;
        const candidate = { value: d.value, from: file.name, layer: rule.layer, rank: file.order * 1_000_000 + rule.pos, important: d.important };
        const existing = target.get(d.prop);
        if (!existing) {
          target.set(d.prop, candidate);
          continue;
        }
        const better = layered ? betterLayered(candidate, existing, d.important) : betterOrdered(candidate, existing);
        if (better === candidate) target.set(d.prop, candidate);
      }
    }
  }
  return final;
}

/** @param {Winner} a @param {Winner} b */
function betterOrdered(a, b) {
  return a.rank > b.rank ? a : b;
}

/** @param {Winner} a @param {Winner} b @param {boolean} important */
function betterLayered(a, b, important) {
  if (a.layer === b.layer) return a.rank > b.rank ? a : b;
  if (important) return LAYER_RANK[a.layer] < LAYER_RANK[b.layer] ? a : b;
  return LAYER_RANK[a.layer] > LAYER_RANK[b.layer] ? a : b;
}

/**
 * 单键最终赢家：important 赢家优先，否则 normal 赢家。
 * @param {{normals: Map<string, Winner>, importants: Map<string, Winner>} | undefined} entry
 */
function winnersOf(entry) {
  if (!entry) return new Map();
  const winners = new Map();
  for (const [prop, d] of entry.normals) winners.set(prop, d);
  for (const [prop, d] of entry.importants) winners.set(prop, d);
  return winners;
}

const beforeFiles = readSide(FILES_BEFORE, beforeDir);
const afterFiles = readSide(FILES_AFTER, afterRoot);

const beforeFinal = resolveSide(beforeFiles, false);
const afterFinal = resolveSide(afterFiles, true);

const diffs = [];

// ---- Phase 1：同上下文逐键比较 ----
/**
 * @param {string} key
 * @param {{normals: Map<string, Winner>, importants: Map<string, Winner>} | undefined} beforeEntry
 * @param {{normals: Map<string, Winner>, importants: Map<string, Winner>} | undefined} afterEntry
 */
const compare = (key, beforeEntry, afterEntry) => {
  const beforeW = winnersOf(beforeEntry);
  const afterW = winnersOf(afterEntry);
  for (const [prop, d] of beforeW) {
    if (DROPPED_DEAD_OVERRIDES.get(key)?.has(prop)) continue;
    const afterD = afterW.get(prop);
    if (!afterD || afterD.value !== d.value) {
      diffs.push({ key, prop, before: `${d.value}${d.important ? " !important" : ""} (${d.from})`, after: afterD ? `${afterD.value} (${afterD.from})` : "(missing)" });
    }
  }
  for (const [prop, d] of afterW) {
    if (INTENTIONAL_ADDITIONS.get(key)?.has(prop)) continue;
    if (!beforeW.has(prop)) diffs.push({ key, prop, before: "(absent)", after: `${d.value} (${d.from})` });
  }
};

for (const [key, entry] of beforeFinal) {
  if (INTENTIONAL_CTX.has(key.split("::")[0])) continue;
  compare(key, entry, afterFinal.get(key));
}
for (const [key, entry] of afterFinal) {
  if (INTENTIONAL_CTX.has(key.split("::")[0])) continue;
  if (beforeFinal.has(key)) continue;
  const w = winnersOf(entry);
  for (const [prop, d] of w) {
    if (INTENTIONAL_ADDITIONS.get(key)?.has(prop)) continue;
    diffs.push({ key, prop, before: "(absent)", after: `${d.value} (${d.from})` });
  }
}

// ---- Phase 2：跨上下文粗比对（同一 selector+prop 忽略条件） ----
/** @param {Winner[]} entries @param {boolean} layered @returns {Winner | null} */
function crossCtxWinner(entries, layered) {
  let normal = null;
  let important = null;
  for (const d of entries) {
    if (d.important) {
      if (!important) important = d;
      else important = layered ? betterLayered(d, important, true) : betterOrdered(d, important);
    } else {
      if (!normal) normal = d;
      else normal = layered ? betterLayered(d, normal, false) : betterOrdered(d, normal);
    }
  }
  return important ?? normal;
}

{
  const selectorSet = new Set([...beforeFinal.keys(), ...afterFinal.keys()].map((k) => k.split("::")[1]));
  for (const selector of selectorSet) {
    /** @param {Map<string, {normals: Map<string, Winner>, importants: Map<string, Winner>}>} finalMap */
    const collect = (finalMap) => {
      const out = [];
      for (const [k, entry] of finalMap) {
        if (k.split("::")[1] !== selector) continue;
        if (INTENTIONAL_CTX.has(k.split("::")[0])) continue;
        for (const [prop, d] of winnersOf(entry)) out.push({ k, prop, d });
      }
      return out;
    };
    const beforeAll = collect(beforeFinal);
    const afterAll = collect(afterFinal);
    /** @type {{k: string, prop: string, d: Winner}[]} */
    const mergedAll = [...beforeAll, ...afterAll];
    const props = new Set(mergedAll.map((x) => x.prop));
    for (const prop of props) {
      const bEntries = beforeAll.filter((x) => x.prop === prop);
      const aEntries = afterAll.filter((x) => x.prop === prop);
      const b = crossCtxWinner(bEntries.map((x) => x.d), false);
      const a = crossCtxWinner(aEntries.map((x) => x.d), true);
      if (!b || !a || b.value === a.value) continue;
      if (PHASE2_SKIP.get(selector)?.has(prop)) continue;
      const bKey = bEntries.find((x) => x.d === b)?.k ?? "?";
      const aKey = aEntries.find((x) => x.d === a)?.k ?? "?";
      const exclusive = EXCLUSIVE_CTX_PAIRS.some(([c1, c2]) => {
        const bc = bKey.split("::")[0];
        const ac = aKey.split("::")[0];
        return (bc.startsWith(c1) && ac.startsWith(c2)) || (bc.startsWith(c2) && ac.startsWith(c1));
      });
      if (exclusive) continue;
      diffs.push({ key: `${selector} (cross-ctx)`, prop, before: `${b.value} [${bKey}]`, after: `${a.value} [${aKey}]` });
    }
  }
}

console.log(`BEFORE keys: ${beforeFinal.size}, AFTER keys: ${afterFinal.size}`);
console.log(`diff count: ${diffs.length}`);
for (const d of diffs.slice(0, 300)) {
  console.log(`- ${d.key} :: ${d.prop}\n    before: ${d.before}\n    after : ${d.after}`);
}
if (diffs.length > 300) console.log(`... and ${diffs.length - 300} more`);
process.exitCode = diffs.length === 0 ? 0 : 1;
