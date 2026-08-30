import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const globalsUrl = new URL("../app/globals.css", import.meta.url);
const sharedHeroUrl = new URL("../app/unified-module-reader.module.css", import.meta.url);
const sharedHeroComponentUrl = new URL("../app/unified-module-hero.tsx", import.meta.url);
const designLanguageUrl = new URL("../docs/DESIGN-LANGUAGE.md", import.meta.url);
const appUrl = new URL("../app/", import.meta.url);

const normalize = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, "");

function tokenValues(css, token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...stripComments(css).matchAll(new RegExp(`${escaped}\\s*:\\s*([^;]+);`, "g"))]
    .map((match) => normalize(match[1]));
}

function tokenValue(css, token) {
  const values = tokenValues(css, token);
  assert.equal(values.length, 1, `${token} 必须在 globals.css 唯一声明一次`);
  return values[0];
}

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

function declarationsFor(rules, selector) {
  const matches = rules.filter((rule) => rule.selector === selector);
  assert.ok(matches.length > 0, `缺少共享样式角色：${selector}`);
  const declarations = new Map();
  for (const rule of matches) {
    for (const [property, values] of rule.declarations) {
      declarations.set(property, [...(declarations.get(property) ?? []), ...values]);
    }
  }
  return declarations;
}

function assertRole(rules, selector, contract) {
  const declarations = declarationsFor(rules, selector);
  for (const [property, allowedValues] of Object.entries(contract)) {
    const actualValues = declarations.get(property) ?? [];
    assert.ok(actualValues.length > 0, `${selector} 必须直接声明 ${property}`);
    const normalizedAllowed = allowedValues.map(normalize);
    for (const allowedValue of normalizedAllowed) {
      assert.ok(actualValues.includes(allowedValue), `${selector} 的 ${property} 必须包含契约值 ${allowedValue}`);
    }
    for (const actualValue of actualValues) {
      assert.ok(normalizedAllowed.includes(actualValue), `${selector} 的 ${property} 不得漂移为 ${actualValue}`);
    }
  }
}

test("shared visual tokens have one owner and one documented meaning", async () => {
  const [globals, designLanguage, appEntries] = await Promise.all([
    readFile(globalsUrl, "utf8"),
    readFile(designLanguageUrl, "utf8"),
    readdir(appUrl, { recursive: true }),
  ]);
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

  const definedTokens = new Set([...stripComments(globals).matchAll(/(--fb-[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
  for (const token of definedTokens) {
    assert.equal(tokenValues(globals, token).length, 1, `${token} 不得在 globals.css 重复声明`);
    assert.ok(designLanguage.includes(`\`${token}\``), `${token} 必须登记在 DESIGN-LANGUAGE.md`);
  }

  const cssEntries = appEntries.filter((entry) => entry.endsWith(".css"));
  const cssFiles = await Promise.all(cssEntries.map(async (entry) => [entry, await readFile(new URL(entry, appUrl), "utf8")]));
  const protectedDeclaration = /--fb-[a-z0-9-]+\s*:/g;
  for (const [entry, source] of cssFiles) {
    const protectedDeclarations = [...stripComments(source).matchAll(protectedDeclaration)];
    if (entry === "globals.css") {
      assert.ok(protectedDeclarations.length > 0, "globals.css 必须拥有全站基础 Token");
    } else {
      assert.equal(protectedDeclarations.length, 0, `${entry} 不得重复声明全站基础 Token`);
      assert.doesNotMatch(source, /data-module-hero/i, `${entry} 不得穿透共享 Header / Hero`);
      if (entry !== "unified-module-reader.module.css") {
        assert.doesNotMatch(source, /var\(--fb-(?:chrome-[a-z0-9-]+|font-(?:ui|editorial|code)|shell-wide)\)/, `${entry} 不得消费共享外壳专用 Token`);
      }
      if (entry.endsWith(".module.css")) {
        for (const rule of cssRules(source)) {
          assert.doesNotMatch(
            rule.selector,
            /^(?:(?::global\()?(?:html|body|header|nav|a|h1|small|em|button|summary)(?:\b|\))|[#*\[]|:(?:is|where|not|has)\([^)]*(?:html|body|header|nav|a|h1|small|em|button|summary)\b)/i,
            `${entry} 不得从全局裸元素 ${rule.selector} 起始选择，以免穿透共享外壳`,
          );
          if (rule.selector.startsWith(":global(")) {
            assert.ok(
              ["dense-module-reading-modes.module.css", "unified-module-reader.module.css"].includes(entry),
              `${entry} 的无局部根 :global 选择器会绕过共享外壳边界`,
            );
          }
        }
      }
    }
  }

  const usedTokens = new Set(cssFiles.flatMap(([, source]) => [...source.matchAll(/var\((--fb-[a-z0-9-]+)/g)].map((match) => match[1])));
  for (const token of usedTokens) {
    assert.ok(definedTokens.has(token), `${token} 已被生产样式使用，但 globals.css 没有声明`);
  }
});

test("the unified Header and Hero own every typography and interaction role", async () => {
  const css = await readFile(sharedHeroUrl, "utf8");
  const rules = cssRules(css);
  const ui = "var(--fb-font-ui)";
  const editorial = "var(--fb-font-editorial)";
  const code = "var(--fb-font-code)";
  const ink = "var(--fb-chrome-ink)";
  const muted = "var(--fb-chrome-muted)";
  const meta = "var(--fb-chrome-meta)";

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

  const mobileBodies = atRuleBodies(css, /max-width\s*:\s*720px/i);
  assert.equal(mobileBodies.length, 1, "共享外壳必须只有一个 720px 移动断点契约");
  const mobileRules = cssRules(mobileBodies[0]);
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

  assertRole(rules, ".hero .siteLinks a:hover", { color: ["var(--fb-chrome-link)"], "border-bottom-color": ["var(--fb-chrome-accent)"] });
  assertRole(rules, ".hero .brand:focus-visible", { color: ["var(--fb-chrome-link)"], outline: ["3px solid var(--fb-chrome-focus)"], "outline-offset": ["2px"] });
  assertRole(rules, ".hero .siteLinks a:focus-visible", { color: ["var(--fb-chrome-link)"], outline: ["3px solid var(--fb-chrome-focus)"], "outline-offset": ["2px"] });
  assertRole(rules, ".mobileMenu summary:hover", { "border-color": ["var(--fb-chrome-line)"], background: ["var(--fb-chrome-mist)"] });
  assertRole(rules, ".mobileMenu summary:focus-visible", { "border-color": ["var(--fb-chrome-line)"], background: ["var(--fb-chrome-mist)"], outline: ["3px solid var(--fb-chrome-focus)"], "outline-offset": ["2px"] });
  assertRole(rules, ".mobileMenu summary span", { background: ["var(--fb-chrome-ink)"] });
  assertRole(rules, ".mobileMenu > div", { border: ["1px solid var(--fb-chrome-line)"], background: ["var(--fb-chrome-surface)"], "box-shadow": ["var(--fb-chrome-shadow)"] });
  assertRole(rules, ".hero .mobileMenu a:hover", { color: ["var(--fb-chrome-link)"], background: ["var(--fb-chrome-mint)"] });
  assertRole(rules, ".hero .mobileMenu a:focus-visible", { color: ["var(--fb-chrome-link)"], background: ["var(--fb-chrome-mint)"], outline: ["3px solid var(--fb-chrome-focus)"], "outline-offset": ["2px"] });

  const allowedVariables = /^--fb-(?:chrome-[a-z0-9-]+|font-(?:ui|editorial|code)|shell-wide)$/;
  for (const variable of [...css.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1])) {
    assert.match(variable, allowedVariables, `共享外壳不得消费 ${variable}`);
  }
  assert.doesNotMatch(css, /!important|\bfont\s*:/i, "共享外壳不得依赖 !important 或 font shorthand");
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch?\(|lab\(|lch\(|color-mix\(/i, "共享外壳不得写裸色值");

  const protectedVisualProperties = new Set(["color", "background", "background-color", "border", "border-color", "border-top", "border-right", "border-bottom", "border-left", "border-bottom-color", "outline", "box-shadow", "fill", "stroke"]);
  for (const rule of rules) {
    for (const [property, values] of rule.declarations) {
      if (!protectedVisualProperties.has(property)) continue;
      for (const value of values) {
        assert.ok(
          /var\(--fb-chrome-[a-z0-9-]+\)/.test(value) || /^(?:0|none|transparent|\d+(?:px)? solid transparent)$/.test(value),
          `${rule.selector} 的 ${property} 必须直接消费 chrome token，而不是 ${value}`,
        );
        assert.doesNotMatch(value, /\binherit\b|currentcolor/i);
      }
    }
  }
});

test("the shared scaffold keeps module CSS outside the Header boundary", async () => {
  const [componentSource, appEntries] = await Promise.all([
    readFile(sharedHeroComponentUrl, "utf8"),
    readdir(appUrl, { recursive: true }),
  ]);
  const heroIndex = componentSource.indexOf("<UnifiedModuleHero {...hero} />");
  const contentIndex = componentSource.indexOf('data-module-content="unified"');
  assert.ok(heroIndex > 0 && contentIndex > heroIndex, "共享 Hero 必须是模块内容根的前置兄弟节点");
  assert.match(componentSource, /<main[^>]+id="main-content"[^>]+data-module-content="unified"/s);
  assert.doesNotMatch(componentSource, /--fb-[a-z0-9-]+\s*:/, "共享组件不得按模块内联覆盖全站基础 Token");

  const sourceEntries = appEntries.filter((entry) => /\.(?:tsx|jsx)$/.test(entry) && entry !== "unified-module-hero.tsx");
  const scaffoldEntries = [];
  for (const entry of sourceEntries) {
    const source = await readFile(new URL(entry, appUrl), "utf8");
    if (/<UnifiedModuleScaffold\b/.test(source)) {
      scaffoldEntries.push(entry);
      assert.doesNotMatch(source, /<UnifiedModuleHero\b|<ReadingProgress\b/, `${entry} 不得拆开共享页面边界`);
    }
    assert.doesNotMatch(source, /data-module-hero\s*=/, `${entry} 不得复制共享 Hero 标记`);
    assert.doesNotMatch(source, /--fb-[a-z0-9-]+\s*:/, `${entry} 不得以内联样式覆盖全站基础 Token`);
  }
  assert.ok(scaffoldEntries.length >= 4, "当前迁移批次必须至少覆盖 RAG、Agent、MCP 与 A2A");
});
