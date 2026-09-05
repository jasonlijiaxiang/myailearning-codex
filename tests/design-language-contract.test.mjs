import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const globalsUrl = new URL("../app/globals.css", import.meta.url);
const sharedHeroUrl = new URL("../app/unified-module-reader.module.css", import.meta.url);
const sharedHeroComponentUrl = new URL("../app/unified-module-hero.tsx", import.meta.url);
const sharedChineseModuleUrl = new URL("../app/(zh)/modules/[slug]/page.tsx", import.meta.url);
const unifiedBriefComponentUrl = new URL("../app/unified-brief-module-page.tsx", import.meta.url);
const denseReaderComponentUrl = new URL("../app/dense-module-reading-modes.tsx", import.meta.url);
const denseReaderStylesUrl = new URL("../app/dense-module-reading-modes.module.css", import.meta.url);
const fieldbookV2StylesUrl = new URL("../app/fieldbook-v2.css", import.meta.url);
const fieldbookV3StylesUrl = new URL("../app/fieldbook-v3.css", import.meta.url);
const agentReaderStylesUrl = new URL("../app/agent-dense-reader.module.css", import.meta.url);
const mcpStylesUrl = new URL("../app/mcp-module-experience.module.css", import.meta.url);
const a2aStylesUrl = new URL("../app/a2a-module-experience.module.css", import.meta.url);
const inferenceStylesUrl = new URL("../app/inference-studio.css", import.meta.url);
const englishModuleComponentUrl = new URL("../app/i18n/english-pilot-module-page.tsx", import.meta.url);
const qaInteractionComponentUrl = new URL("../app/fieldbook-interactions.tsx", import.meta.url);
const a2aComponentUrl = new URL("../app/a2a-module-experience.tsx", import.meta.url);
const modulePilotViewsUrl = new URL("../app/module-pilot-views.tsx", import.meta.url);
const designLanguageUrl = new URL("../docs/DESIGN-LANGUAGE.md", import.meta.url);
const appUrl = new URL("../app/", import.meta.url);

/**
 * @typedef {{ selector: string, declarations: Map<string, string[]> }} ParsedCssRule
 */

const normalize = (/** @type {string} */ value) => value.trim().replace(/\s+/g, " ").toLowerCase();
const stripComments = (/** @type {string} */ source) => source.replace(/\/\*[\s\S]*?\*\//g, "");

/** @param {string} css @param {string} token */
function tokenValues(css, token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...stripComments(css).matchAll(new RegExp(`${escaped}\\s*:\\s*([^;]+);`, "g"))]
    .map((match) => normalize(match[1]));
}

/** @param {string} css @param {string} token */
function tokenValue(css, token) {
  const values = tokenValues(css, token);
  assert.equal(values.length, 1, `${token} must be declared exactly once in globals.css`);
  return values[0];
}

/** @param {string} selectorList */
function splitSelectorList(selectorList) {
  const selectors = [];
  let current = "";
  let depth = 0;
  let quote = null;
  for (let index = 0; index < selectorList.length; index += 1) {
    const character = selectorList[index];
    const previous = selectorList[index - 1];
    if (quote) {
      current += character;
      if (character === quote && previous !== "\\") quote = null;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    if (character === "(" || character === "[") depth += 1;
    if (character === ")" || character === "]") depth -= 1;
    if (character === "," && depth === 0) {
      selectors.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  selectors.push(current);
  return selectors;
}

/** @param {string} css @param {RegExp} atRulePattern */
function atRuleBodies(css, atRulePattern) {
  const source = stripComments(css);
  const bodies = [];
  for (const match of source.matchAll(/@media\s*\(([^)]*)\)\s*\{/g)) {
    if (!atRulePattern.test(match[1])) continue;
    const openingBrace = match.index + match[0].length - 1;
    let depth = 1;
    let quote = null;
    for (let index = openingBrace + 1; index < source.length; index += 1) {
      const character = source[index];
      const previous = source[index - 1];
      if (quote) {
        if (character === quote && previous !== "\\") quote = null;
        continue;
      }
      if (character === '"' || character === "'") quote = character;
      if (character === "{") depth += 1;
      if (character === "}") depth -= 1;
      if (depth === 0) {
        bodies.push(source.slice(openingBrace + 1, index));
        break;
      }
    }
  }
  return bodies;
}

/** @param {string} css */
function cssRules(css) {
  const rules = [];
  const source = stripComments(css);
  const pattern = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of source.matchAll(pattern)) {
    const declarations = new Map();
    for (const declaration of match[2].matchAll(/([\w-]+)\s*:\s*([^;]+)(?:;|$)/g)) {
      const property = normalize(declaration[1]);
      declarations.set(property, [...(declarations.get(property) ?? []), normalize(declaration[2])]);
    }
    for (const selector of splitSelectorList(match[1])) {
      const normalizedSelector = selector.trim().replace(/\s+/g, " ");
      if (normalizedSelector && !normalizedSelector.startsWith("@")) {
        rules.push({ selector: normalizedSelector, declarations });
      }
    }
  }
  return rules;
}

/** @param {ParsedCssRule[]} rules @param {string} selector */
function declarationsFor(rules, selector) {
  const matches = rules.filter((rule) => rule.selector === selector);
  assert.ok(matches.length > 0, `missing shared style role: ${selector}`);
  const declarations = new Map();
  for (const rule of matches) {
    for (const [property, values] of rule.declarations) {
      declarations.set(property, [...(declarations.get(property) ?? []), ...values]);
    }
  }
  return declarations;
}

/** @param {ParsedCssRule[]} rules @param {string} selector @param {Record<string, string[]>} contract */
function assertRole(rules, selector, contract) {
  const declarations = declarationsFor(rules, selector);
  for (const [property, allowedValues] of Object.entries(contract)) {
    const actualValues = declarations.get(property) ?? [];
    assert.ok(actualValues.length > 0, `${selector} must declare ${property} directly`);
    const normalizedAllowed = allowedValues.map(normalize);
    for (const allowedValue of normalizedAllowed) {
      assert.ok(actualValues.includes(allowedValue), `${selector} ${property} must include the contract value ${allowedValue}`);
    }
    for (const actualValue of actualValues) {
      assert.ok(normalizedAllowed.includes(actualValue), `${selector} ${property} must not drift to ${actualValue}`);
    }
  }
}

/** @param {ParsedCssRule[]} rules @param {string} selector @param {string} expected */
function assertFinalFontSize(rules, selector, expected) {
  const matches = rules.filter((rule) => rule.selector === selector);
  assert.ok(matches.length > 0, `missing font-size release gate: ${selector}`);
  const values = matches.flatMap((rule) => rule.declarations.get("font-size") ?? []);
  assert.ok(values.length > 0, `${selector} must declare font-size directly`);
  assert.equal(values.at(-1), expected, `${selector} final font size must be ${expected}`);
}

// 渲染验证：与 rendered-html 测试共用 dist 的 worker fetch 模式。
let workerPromise;

/** @param {string} path */
async function render(path = "/") {
  assert.match(path, /^\//, "render(path) must receive an absolute site path");

  workerPromise ??= import(new URL("../dist/server/index.js", import.meta.url).href).then(({ default: worker }) => worker);
  const worker = await workerPromise;

  return worker.fetch(
    new Request(new URL(path, "http://localhost"), {
      headers: { accept: "text/html" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

/** @param {string} path */
async function renderHtml(path) {
  const response = await render(path);
  assert.equal(response.status, 200, `${path} must be reachable`);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

test("chrome token aliases resolve to their canonical values", async () => {
  const globals = await readFile(globalsUrl, "utf8");
  const pairs = [
    ["--fb-chrome-ink", "--fb-ink"],
    ["--fb-chrome-muted", "--fb-muted"],
    ["--fb-chrome-meta", "--fb-meta"],
    ["--fb-chrome-link", "--fb-link"],
    ["--fb-chrome-line", "--fb-line"],
    ["--fb-chrome-accent", "--fb-accent"],
    ["--fb-chrome-mist", "--fb-mist"],
    ["--fb-chrome-mint", "--fb-mint"],
    ["--fb-chrome-surface", "--fb-surface"],
    ["--fb-chrome-focus", "--fb-focus"],
  ];

  for (const [chromeToken, canonicalToken] of pairs) {
    assert.equal(tokenValue(globals, chromeToken), tokenValue(globals, canonicalToken));
  }
  assert.equal(tokenValue(globals, "--fb-body"), "var(--fb-ink-2)");
  assert.equal(tokenValue(globals, "--fb-shell-wide"), "1480px");
  assert.doesNotMatch(tokenValue(globals, "--fb-font-editorial"), /var\(--font-serif\)/);
});

test("every site-wide token is declared once and documented", async () => {
  const [globals, designLanguage] = await Promise.all([
    readFile(globalsUrl, "utf8"),
    readFile(designLanguageUrl, "utf8"),
  ]);

  const definedTokens = new Set([...stripComments(globals).matchAll(/(--fb-[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
  for (const token of definedTokens) {
    assert.equal(tokenValues(globals, token).length, 1, `${token} must not be redeclared in globals.css`);
    assert.ok(designLanguage.includes(`\`${token}\``), `${token} must be registered in DESIGN-LANGUAGE.md`);
  }
});

test("module css must not redeclare site tokens or pierce the shared shell", async () => {
  const appEntries = await readdir(appUrl, { recursive: true });
  const cssEntries = appEntries.filter((entry) => entry.endsWith(".css"));
  const cssFiles = await Promise.all(cssEntries.map(async (entry) => [entry, await readFile(new URL(entry, appUrl), "utf8")]));
  const protectedDeclaration = /--fb-[a-z0-9-]+\s*:/g;
  for (const [entry, source] of cssFiles) {
    const protectedDeclarations = [...stripComments(source).matchAll(protectedDeclaration)];
    if (entry === "globals.css") {
      assert.ok(protectedDeclarations.length > 0, "globals.css must own the site-wide base tokens");
    } else {
      assert.equal(protectedDeclarations.length, 0, `${entry} must not redeclare site-wide base tokens`);
      assert.doesNotMatch(source, /data-module-hero/i, `${entry} must not pierce the shared Header / Hero`);
      if (entry !== "unified-module-reader.module.css") {
        assert.doesNotMatch(source, /var\(--fb-(?:chrome-[a-z0-9-]+|font-(?:ui|editorial|code)|shell-wide)\)/, `${entry} must not consume shell-only tokens`);
      }
    }
  }
});

test("module css selectors must not start from global bare elements", async () => {
  const appEntries = await readdir(appUrl, { recursive: true });
  const moduleCssEntries = appEntries.filter((entry) => entry.endsWith(".module.css"));
  for (const entry of moduleCssEntries) {
    const source = await readFile(new URL(entry, appUrl), "utf8");
    for (const rule of cssRules(source)) {
      assert.doesNotMatch(
        rule.selector,
        /^(?:(?::global\()?(?:html|body|header|nav|a|h1|small|em|button|summary)(?:\b|\))|[#*\[]|:(?:is|where|not|has)\([^)]*(?:html|body|header|nav|a|h1|small|em|button|summary)\b)/i,
        `${entry} must not start a selector from the global bare element ${rule.selector}, or it would pierce the shared shell`,
      );
      if (rule.selector.startsWith(":global(")) {
        assert.ok(
          ["dense-module-reading-modes.module.css", "unified-module-reader.module.css"].includes(entry),
          `${entry} :global root selectors would bypass the shared shell boundary`,
        );
      }
    }
  }
});

test("every consumed token is declared in globals.css", async () => {
  const [globals, appEntries] = await Promise.all([
    readFile(globalsUrl, "utf8"),
    readdir(appUrl, { recursive: true }),
  ]);
  const definedTokens = new Set([...stripComments(globals).matchAll(/(--fb-[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
  const cssFiles = await Promise.all(
    appEntries.filter((entry) => entry.endsWith(".css")).map(async (entry) => [entry, await readFile(new URL(entry, appUrl), "utf8")]),
  );
  const usedTokens = new Set(cssFiles.flatMap(([, source]) => [...source.matchAll(/var\((--fb-[a-z0-9-]+)/g)].map((match) => match[1])));
  for (const token of usedTokens) {
    assert.ok(definedTokens.has(token), `${token} is used by production styles but not declared in globals.css`);
  }
});

test("the unified Hero desktop typography roles follow the contract", async () => {
  const css = await readFile(sharedHeroUrl, "utf8");
  const rules = cssRules(css);
  const ui = "var(--fb-font-ui)";
  const editorial = "var(--fb-font-editorial)";
  const code = "var(--fb-font-code)";
  const ink = "var(--fb-chrome-ink)";
  const muted = "var(--fb-chrome-muted)";
  const meta = "var(--fb-chrome-meta)";

  /** @type {Array<[string, Record<string, string[]>]>} */
  const roles = [
    [".hero .brand", { color: [ink], "font-family": [ui], "font-size": ["15px", "14px"], "font-weight": ["780"], "letter-spacing": ["-.02em"], "line-height": ["1.2"] }],
    [".hero .siteLinks a", { color: [muted], "font-family": [ui], "font-size": ["13px"], "font-weight": ["680"], "letter-spacing": ["0"], "line-height": ["1.2"] }],
    [".hero .identity h1 > span", { color: [ink], "font-family": [editorial], "font-size": ["clamp(58px, 5.8vw, 78px)", "clamp(48px, 15vw, 64px)"], "font-weight": ["500"], "letter-spacing": ["-.065em"], "line-height": [".9"] }],
    [".hero .identity h1 > small", { color: [ink], "font-family": [ui], "font-size": ["clamp(17px, 1.45vw, 21px)", "17px"], "font-weight": ["760"], "letter-spacing": ["-.015em"], "line-height": ["1.35"] }],
    [".hero .identity h1 > small em", { color: [muted], "font-family": [ui], "font-size": ["1em"], "font-weight": ["570"], "letter-spacing": ["-.015em"], "line-height": ["1.35"] }],
    [".hero .definition", { color: [ink], "font-family": [editorial], "font-size": ["clamp(19px, 1.55vw, 24px)", "18px"], "font-weight": ["500"], "letter-spacing": ["normal"], "line-height": ["1.55"] }],
    [".hero .position", { color: [muted], "font-family": [ui], "font-size": ["14px", "13px"], "font-weight": ["400"], "letter-spacing": ["normal"], "line-height": ["1.65", "1.6"] }],
    [".hero .summary :global(.moduleHeroMetrics dt)", { color: [meta], "font-family": [ui], "font-size": ["11px", "9px"], "font-weight": ["800"], "letter-spacing": [".06em"], "line-height": ["1.35"] }],
    [".hero .summary :global(.moduleHeroMetrics dd)", { color: [ink], "font-family": [ui], "font-size": ["13px"], "font-weight": ["400"], "letter-spacing": ["normal"], "line-height": ["1.35"] }],
    [".hero .summary :global(.moduleHeroMetrics dd strong)", { color: ["var(--fb-chrome-link)"], "font-family": [editorial], "font-size": ["24px", "23px"], "font-weight": ["500"], "letter-spacing": ["normal"], "line-height": ["1"] }],
    [".hero .summary :global(.moduleHeroMetrics dd span)", { color: [muted], "font-family": [ui], "font-size": ["13px"], "font-weight": ["400"], "letter-spacing": ["normal"], "line-height": ["1.35"] }],
    [".hero .factLedger dt", { color: [meta], "font-family": [code], "font-size": ["10px"], "font-weight": ["700"], "letter-spacing": [".07em"], "line-height": ["1.35"] }],
    [".hero .factLedger dd", { color: [ink], "font-family": [ui], "font-size": ["13px", "12px"], "font-weight": ["720"], "letter-spacing": ["normal"], "line-height": ["1.45"] }],
    [".hero .mobileMenu a", { color: [ink], "font-family": [ui], "font-size": ["13px"], "font-weight": ["700"], "letter-spacing": ["normal"], "line-height": ["1.35"] }],
  ];
  for (const [selector, contract] of roles) assertRole(rules, selector, contract);
});

test("the unified Hero keeps exactly one 720px mobile contract", async () => {
  const css = await readFile(sharedHeroUrl, "utf8");
  const mobileBodies = atRuleBodies(css, /max-width\s*:\s*720px/i);
  assert.equal(mobileBodies.length, 1, "the shared shell must keep exactly one 720px mobile breakpoint contract");
  const mobileRules = cssRules(mobileBodies[0]);
  /** @type {Array<[string, Record<string, string[]>]>} */
  const mobileRoles = [
    [".hero .brand", { "font-size": ["14px"] }],
    [".hero .identity h1 > span", { "font-size": ["clamp(48px, 15vw, 64px)"] }],
    [".hero .identity h1 > small", { "font-size": ["17px"] }],
    [".hero .definition", { "font-size": ["18px"], "line-height": ["1.55"] }],
    [".hero .position", { "font-size": ["13px"], "line-height": ["1.6"] }],
    [".hero .summary :global(.moduleHeroMetrics dt)", { "font-size": ["9px"] }],
    [".hero .summary :global(.moduleHeroMetrics dd strong)", { "font-size": ["23px"] }],
    [".hero .factLedger dd", { "font-size": ["12px"] }],
  ];
  for (const [selector, contract] of mobileRoles) assertRole(mobileRules, selector, contract);
});

test("the unified Hero interaction states stay token-driven", async () => {
  const css = await readFile(sharedHeroUrl, "utf8");
  const rules = cssRules(css);
  assertRole(rules, ".hero .siteLinks a:hover", { color: ["var(--fb-chrome-link)"], "border-bottom-color": ["var(--fb-chrome-accent)"] });
  assertRole(rules, ".hero .brand:focus-visible", { color: ["var(--fb-chrome-link)"], outline: ["3px solid var(--fb-chrome-focus)"], "outline-offset": ["2px"] });
  assertRole(rules, ".hero .siteLinks a:focus-visible", { color: ["var(--fb-chrome-link)"], outline: ["3px solid var(--fb-chrome-focus)"], "outline-offset": ["2px"] });
  assertRole(rules, ".mobileMenu summary:hover", { "border-color": ["var(--fb-chrome-line)"], background: ["var(--fb-chrome-mist)"] });
  assertRole(rules, ".mobileMenu summary:focus-visible", { "border-color": ["var(--fb-chrome-line)"], background: ["var(--fb-chrome-mist)"], outline: ["3px solid var(--fb-chrome-focus)"], "outline-offset": ["2px"] });
  assertRole(rules, ".mobileMenu summary span", { background: ["var(--fb-chrome-ink)"] });
  assertRole(rules, ".mobileMenu > div", { border: ["1px solid var(--fb-chrome-line)"], background: ["var(--fb-chrome-surface)"], "box-shadow": ["var(--fb-chrome-shadow)"] });
  assertRole(rules, ".hero .mobileMenu a:hover", { color: ["var(--fb-chrome-link)"], background: ["var(--fb-chrome-mint)"] });
  assertRole(rules, ".hero .mobileMenu a:focus-visible", { color: ["var(--fb-chrome-link)"], background: ["var(--fb-chrome-mint)"], outline: ["3px solid var(--fb-chrome-focus)"], "outline-offset": ["2px"] });
});

test("the shared shell consumes only chrome tokens and never bare colors", async () => {
  const css = await readFile(sharedHeroUrl, "utf8");
  const rules = cssRules(css);
  const allowedVariables = /^--fb-(?:chrome-[a-z0-9-]+|font-(?:ui|editorial|code)|shell-wide)$/;
  for (const variable of [...css.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1])) {
    assert.match(variable, allowedVariables, `the shared shell must not consume ${variable}`);
  }
  assert.doesNotMatch(css, /!important|\bfont\s*:/i, "the shared shell must not rely on !important or the font shorthand");
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch?\(|lab\(|lch\(|color-mix\(/i, "the shared shell must not write bare color values");

  const protectedVisualProperties = new Set(["color", "background", "background-color", "border", "border-color", "border-top", "border-right", "border-bottom", "border-left", "border-bottom-color", "outline", "box-shadow", "fill", "stroke"]);
  for (const rule of rules) {
    for (const [property, values] of rule.declarations) {
      if (!protectedVisualProperties.has(property)) continue;
      for (const value of values) {
        assert.ok(
          /var\(--fb-chrome-[a-z0-9-]+\)/.test(value) || /^(?:0|none|transparent|\d+(?:px)? solid transparent)$/.test(value),
          `${rule.selector} ${property} must consume a chrome token directly, not ${value}`,
        );
        assert.doesNotMatch(value, /\binherit\b|currentcolor/i);
      }
    }
  }
});

test("the Hero stays a leading sibling of the module content root", async () => {
  const componentSource = await readFile(sharedHeroComponentUrl, "utf8");
  const heroIndex = componentSource.indexOf("<UnifiedModuleHero {...hero} />");
  const contentIndex = componentSource.indexOf('data-module-content="unified"');
  assert.ok(heroIndex > 0 && contentIndex > heroIndex, "the shared Hero must be a leading sibling of the module content root");
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(componentSource, /<main[^>]+id="main-content"[^>]+data-module-content="unified"/s);
  assert.doesNotMatch(componentSource, /--fb-[a-z0-9-]+\s*:/, "shared components must not inline-override site-wide base tokens");
});

test("brief routes delegate unconditionally to the shared shell", async () => {
  const [sharedChineseSource, unifiedBriefSource] = await Promise.all([
    readFile(sharedChineseModuleUrl, "utf8"),
    readFile(unifiedBriefComponentUrl, "utf8"),
  ]);
  assert.match(sharedChineseSource, /if \(!unifiedConfig\) throw new Error\(`Missing unified reader configuration for published brief:/);
  assert.match(sharedChineseSource, /const directories = buildBriefModuleDirectories\(/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(sharedChineseSource, /return \(\s*<UnifiedBriefModulePage\b/s);
  assert.doesNotMatch(sharedChineseSource, /\bModuleReadingModes\b/, "the Chinese brief route must not keep the legacy reader fallback");
  assert.doesNotMatch(sharedChineseSource, /<ReadingProgress\b/, "the Chinese brief route must not copy the old page shell");
  assert.doesNotMatch(sharedChineseSource, /<main\b/, "the Chinese brief route must unconditionally delegate to the shared page shell");
  assert.match(unifiedBriefSource, /<UnifiedModuleScaffold\b/);
  assert.match(unifiedBriefSource, /<DenseModuleReadingModes\b/);
  assert.match(unifiedBriefSource, /hasDeepDives \? \[\{ id: "deep-dive"/, "the directory may only list the engineering deep-dive entry when deep dives really exist");
  assert.doesNotMatch(unifiedBriefSource, /<UnifiedModuleHero\b|<ReadingProgress\b/, "the shared brief wrapper must not split the shared page boundary");
});

test("no route or component duplicates the Hero marker or overrides site tokens", async () => {
  const appEntries = await readdir(appUrl, { recursive: true });
  const sourceEntries = appEntries.filter((entry) => /\.(?:tsx|jsx)$/.test(entry) && entry !== "unified-module-hero.tsx");
  const scaffoldEntries = [];
  for (const entry of sourceEntries) {
    const source = await readFile(new URL(entry, appUrl), "utf8");
    if (/<UnifiedModuleScaffold\b/.test(source)) {
      scaffoldEntries.push(entry);
      if (entry === "i18n/english-pilot-module-page.tsx") {
        const unifiedBranchStart = source.indexOf('if (reader === "unified")');
        const legacyBranchStart = source.indexOf("\n  return (\n    <main", unifiedBranchStart);
        assert.ok(unifiedBranchStart > 0 && legacyBranchStart > unifiedBranchStart, "the mixed English renderer must keep identifiable unified and legacy branch boundaries");
        assert.doesNotMatch(source.slice(unifiedBranchStart, legacyBranchStart), /<UnifiedModuleHero\b|<ReadingProgress\b/, `${entry} unified branch must not split the shared page boundary`);
      } else {
        assert.doesNotMatch(source, /<UnifiedModuleHero\b|<ReadingProgress\b/, `${entry} must not split the shared page boundary`);
      }
    }
    assert.doesNotMatch(source, /data-module-hero\s*=/, `${entry} must not duplicate the shared Hero marker`);
    assert.doesNotMatch(source, /--fb-[a-z0-9-]+\s*:/, `${entry} must not override site-wide base tokens with inline styles`);
  }
  assert.ok(scaffoldEntries.length > 0, "the shared reading shell must have at least one real integration point");
});

test("knowledge prose keeps its 16px release typography floor", async () => {
  const [denseReader, fieldbookV2, fieldbookV3, agentReader, mcp, a2a, inference] = await Promise.all([
    readFile(denseReaderStylesUrl, "utf8"),
    readFile(fieldbookV2StylesUrl, "utf8"),
    readFile(fieldbookV3StylesUrl, "utf8"),
    readFile(agentReaderStylesUrl, "utf8"),
    readFile(mcpStylesUrl, "utf8"),
    readFile(a2aStylesUrl, "utf8"),
    readFile(inferenceStylesUrl, "utf8"),
  ]);

  /** @type {Array<[ParsedCssRule[], string]>} */
  const sixteenPixelKnowledge = [
    [cssRules(denseReader), ".boundary p"],
    [cssRules(fieldbookV2), ".briefPrinciples strong"],
    [cssRules(fieldbookV3), ".fieldbookTheme.modulePage .qaBasisNote"],
    [cssRules(agentReader), ".reader :global(:is(.tableWrap, .cloudTable) table)"],
    [cssRules(agentReader), ".knowledgeDigest"],
    [cssRules(mcp), ".qaAsk"],
    [cssRules(mcp), ".cloudRow > *"],
    [cssRules(mcp), ".cloudRow > strong"],
    [cssRules(a2a), ".fieldQuestions details p"],
    [cssRules(a2a), ".bindingTable tbody :is(th, td)"],
    [cssRules(inference), ".inferenceDecisionGuide details p"],
    [cssRules(inference), ".chapterBrief dd"],
  ];
  for (const [rules, selector] of sixteenPixelKnowledge) assertFinalFontSize(rules, selector, "16px");
});

test("supporting metadata keeps its 14px floor", async () => {
  const [fieldbookV3, agentReader, mcp, a2a, inference] = await Promise.all([
    readFile(fieldbookV3StylesUrl, "utf8"),
    readFile(agentReaderStylesUrl, "utf8"),
    readFile(mcpStylesUrl, "utf8"),
    readFile(a2aStylesUrl, "utf8"),
    readFile(inferenceStylesUrl, "utf8"),
  ]);

  /** @type {Array<[ParsedCssRule[], string]>} */
  const fourteenPixelSupport = [
    [cssRules(fieldbookV3), ".fieldbookTheme.modulePage .qaBasisList small"],
    [cssRules(agentReader), ".reader :global(.mechanicGrid small)"],
    [cssRules(mcp), ".sourceList article a"],
    [cssRules(a2a), ".fieldRail :is(dd, p, li, nav a)"],
    [cssRules(inference), ".inferenceFieldContent .focusedCloudRows small"],
  ];
  for (const [rules, selector] of fourteenPixelSupport) assertFinalFontSize(rules, selector, "14px");
});

test("the responsibility matrix keeps its field labels on narrow screens", async () => {
  const fieldbookV3 = await readFile(fieldbookV3StylesUrl, "utf8");
  const rules = cssRules(fieldbookV3);
  assertRole(rules, ".solutionCapabilityMatrixRow p::before", { content: ["attr(data-label)"] });
  const hiddenThirdCell = rules.find((rule) => rule.selector === ".solutionCapabilityMatrixRow p:nth-child(3)" && (rule.declarations.get("display") ?? []).includes("none"));
  assert.equal(hiddenThirdCell, undefined, "the narrow-screen responsibility matrix must not hide the common choice");
});

test("deep links resolve through real DOM ancestors", async () => {
  const readerSource = await readFile(denseReaderComponentUrl, "utf8");
  assert.match(readerSource, /function directoryAnchorForTarget\(/);
  assert.match(readerSource, /const directoryIds = new Set\(\(directories\[modeId\] \?\? \[\]\)\.map\(\(item\) => item\.id\)\)/);
  assert.match(readerSource, /while \(current\)[\s\S]*current = current\.parentElement/);
  assert.match(readerSource, /setActiveAnchor\(directoryAnchorForTarget\(targetId, nextMode, directoryByMode\) \?\? targetId\)/);
  assert.match(readerSource, /target instanceof HTMLDetailsElement\) target\.open = true/);
  assert.match(readerSource, /window\.history\.replaceState\(window\.history\.state/);
  assert.match(readerSource, /requestAnimationFrame\(\(\) => \{[\s\S]*revealTarget\(\);[\s\S]*requestAnimationFrame\(revealTarget\)/);
});

test("English reader sections own accessible headings", async () => {
  const englishSource = await readFile(englishModuleComponentUrl, "utf8");
  assert.match(englishSource, /const headingId = `\$\{group\.id\}-section-title`/);
  assert.match(englishSource, /<section aria-labelledby=\{headingId\}[^>]*id=\{group\.id\}/);
  assert.match(englishSource, /<h2 id=\{headingId\}>/);
  for (const sectionId of ["evidence", "qa", "related-modules"]) {
    assert.match(englishSource, new RegExp(`<section aria-labelledby="${sectionId}-section-title"[^>]*id="${sectionId}"`));
    assert.match(englishSource, new RegExp(`<h2 id="${sectionId}-section-title">`));
  }
  assert.match(englishSource, /<div className="tableWrap" role="region" aria-label=\{tableLabel\} tabIndex=\{0\}>/);
  assert.match(englishSource, /<table><caption className="srOnly">\{tableLabel\}<\/caption>/);
  assert.match(englishSource, /<th scope="col"/);
  assert.match(englishSource, /<th scope="row"/);
});

test("comparison tables keep accessible regions, captions, and headers", async () => {
  const [a2aSource, modulePilotSource] = await Promise.all([
    readFile(a2aComponentUrl, "utf8"),
    readFile(modulePilotViewsUrl, "utf8"),
  ]);
  const a2aScrollableRegions = a2aSource.match(/role="region" tabIndex=\{0\}/g) ?? [];
  const a2aCaptions = a2aSource.match(/<caption className="srOnly">/g) ?? [];
  assert.ok(a2aScrollableRegions.length > 0, "A2A must keep at least one accessible relation table");
  assert.equal(a2aCaptions.length, a2aScrollableRegions.length, "every A2A scrollable relation table must have a hidden caption");
  assert.ok((a2aSource.match(/scope="col"/g) ?? []).length > 0, "A2A relation tables must declare column headers");
  assert.ok((a2aSource.match(/scope="row"/g) ?? []).length > 0, "A2A relation tables must declare row headers");
  assert.match(modulePilotSource, /className="primerAtlasTable" role="table" aria-label="[^"]+"/);
  assert.match(modulePilotSource, /brief && showCriticalBoundary \? <aside/, "focused primers must support one explicit critical-boundary owner");
});

test("qa deep links re-anchor after expansion", async () => {
  const qaInteractionSource = await readFile(qaInteractionComponentUrl, "utf8");
  assert.match(qaInteractionSource, /target\.hidden = false;[\s\S]*requestAnimationFrame\(\(\) => \{[\s\S]*requestAnimationFrame\(\(\) => target\.scrollIntoView/);
});

test("rendered public pages carry the shared design-language root", async () => {
  const representativeRoutes = [
    "/",
    "/en",
    "/modules/solution-patterns",
    "/modules/rag",
    "/en/modules/rag",
    "/questions",
    "/glossary",
    "/references",
    "/coding-agents",
    "/en/questions",
    "/en/glossary",
    "/en/references",
    "/knowledge-graph",
    "/en/knowledge-graph",
  ];

  for (const path of representativeRoutes) {
    const html = await renderHtml(path);
    assert.match(html, /<main[^>]*class="[^"]*\bfieldbookTheme\b[^"]*"/, `${path} is missing the site-wide design-language root class`);
  }
});

test("rendered module pages carry the unified Hero and reader chrome", async () => {
  const html = await renderHtml("/modules/solution-patterns");
  assert.match(html, /data-module-hero="unified"/);
  assert.match(html, /data-module-reader="unified"/);
  assert.match(html, /<header\b[^>]*\bdata-module-hero="unified"/);
  assert.match(html, /<nav[^>]*aria-label="[^"]+"/);
  assert.match(html, /Cloud × AI \/ Presales Fieldbook/);
  assert.match(html, /<dl class="moduleHeroMetrics" aria-label="[^"]+">/);
  assert.match(html, /aria-label="[^"]+"[^>]*data-importance="critical"/);
  assert.match(html, /role="tablist" aria-label="[^"]+"/);
  assert.match(html, /<summary aria-label="[^"]+"><span><\/span><span><\/span><span><\/span><\/summary>/);
});

test("rendered English module pages keep their localized reader labels", async () => {
  const ragHtml = await renderHtml("/en/modules/rag");
  assert.match(ragHtml, /<html\b[^>]*\blang="en"/i);
  assert.match(ragHtml, /aria-label="Module navigation"/);
  assert.match(ragHtml, /aria-label="Reading modes"/);
  assert.match(ragHtml, />10-minute scan</);
  assert.match(ragHtml, />Systematic study</);
  assert.match(ragHtml, />Field lookup</);
  assert.match(ragHtml, /aria-label="Critical boundary"[^>]*data-importance="critical"/);
});

test("rendered module pages expose one main-content skip target after navigation", async () => {
  for (const path of ["/modules/solution-patterns", "/en/modules/rag"]) {
    const html = await renderHtml(path);
    assert.equal((html.match(/class="skipLink" href="#main-content"/g) ?? []).length, 1, `${path} must keep exactly one skip link`);
    assert.equal((html.match(/id="main-content"/g) ?? []).length, 1, `${path} must keep exactly one main-content skip target`);
    assert.ok(html.indexOf('id="main-content"') > html.indexOf("</nav>"), `${path} skip target must sit after the navigation`);
  }
});
