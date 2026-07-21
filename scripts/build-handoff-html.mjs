import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const SOURCE_PATH = path.join(PROJECT_ROOT, "HANDOFF.md");
const OUTPUT_PATH = path.join(PROJECT_ROOT, "HANDOFF-READ-FIRST.html");
const CHECK_ONLY = process.argv.includes("--check");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function plainText(value) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .trim();
}

function safeHref(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function renderInline(value) {
  const tokens = [];
  const hold = (html) => {
    const token = `\u0000HANDOFF${tokens.length}\u0000`;
    tokens.push(html);
    return token;
  };

  let protectedText = value
    .replace(/`([^`]+)`/g, (_, code) => hold(`<code>${escapeHtml(code)}</code>`))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const safe = safeHref(href);
      const external = safe.startsWith("http") ? ' target="_blank" rel="noreferrer"' : "";
      return hold(`<a href="${escapeHtml(safe)}"${external}>${escapeHtml(label)}</a>`);
    });

  protectedText = escapeHtml(protectedText)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  return protectedText.replace(/\u0000HANDOFF(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
}

function createSlugger() {
  const counts = new Map();
  return (value) => {
    const base = plainText(value)
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "section";
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line) {
  const cells = splitTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderMarkdown(markdown) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const slug = createSlugger();
  const headings = [];
  const html = [];
  let index = 0;
  let sectionOpen = false;

  const closeSection = () => {
    if (!sectionOpen) return;
    html.push("</section>");
    sectionOpen = false;
  };

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```([\w-]*)\s*$/);
    if (fence) {
      const language = fence[1] || "text";
      const code = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      html.push(
        `<figure class="code-block" data-language="${escapeHtml(language)}">`,
        `<figcaption><span>${escapeHtml(language)}</span><button type="button" class="copy-button">复制</button></figcaption>`,
        `<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`,
        "</figure>",
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const label = heading[2].trim();
      const id = slug(label);
      if (level === 2) {
        closeSection();
        sectionOpen = true;
        headings.push({ id, label: plainText(label), level });
        html.push(`<section class="guide-section" data-guide-section id="section-${id}">`);
      }
      if (level > 1) {
        html.push(`<h${level} id="${id}">${renderInline(label)}</h${level}>`);
      }
      index += 1;
      continue;
    }

    if (line.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const headers = splitTableRow(line);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      html.push(
        '<div class="table-scroll"><table>',
        `<thead><tr>${headers.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead>`,
        `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`,
        "</table></div>",
      );
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    const unordered = line.match(/^-\s+(.+)$/);
    if (ordered || unordered) {
      const tag = ordered ? "ol" : "ul";
      const pattern = ordered ? /^\d+\.\s+(.+)$/ : /^-\s+(.+)$/;
      const items = [];
      while (index < lines.length) {
        const match = lines[index].match(pattern);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      html.push(`<${tag}>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${tag}>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index];
      if (/^(#{1,3})\s+/.test(next) || /^```/.test(next) || /^\d+\.\s+/.test(next) || /^-\s+/.test(next)) break;
      if (next.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) break;
      paragraph.push(next.trim());
      index += 1;
    }
    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  closeSection();
  return { html: html.join("\n"), headings };
}

function navMarkup(headings, className) {
  return `<nav class="${className}" aria-label="使用指南目录"><ol>${headings.map(({ id, label }) => (
    `<li><a href="#${id}">${escapeHtml(label)}</a></li>`
  )).join("")}</ol></nav>`;
}

function platformLinks(headings) {
  const wanted = [
    ["macOS", "macos-本地使用"],
    ["Linux", "linux-本地使用"],
    ["Windows", "windows-原生本地使用"],
    ["WSL2", "windows-wsl2-使用-长期维护推荐"],
  ];
  return wanted.map(([label, fallback]) => {
    const target = headings.find((heading) => heading.label.toLowerCase().includes(label.toLowerCase()));
    return `<a href="#${target?.id ?? fallback}">${label}</a>`;
  }).join("");
}

function buildDocument(markdown) {
  const sourceHash = createHash("sha256").update(markdown).digest("hex");
  const normalized = markdown.replaceAll("\r\n", "\n");
  const lines = normalized.split("\n");
  const firstSection = lines.findIndex((line) => /^##\s+/.test(line));
  const title = plainText(lines.find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, "") ?? "How to use this KB");
  const intro = lines
    .slice(1, firstSection)
    .join("\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const rendered = renderMarkdown(lines.slice(firstSection).join("\n"));
  const titleParts = title.split("：");
  const primaryTitle = titleParts[0] || title;
  const secondaryTitle = titleParts.slice(1).join("：");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="handoff-source-sha256" content="${sourceHash}">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --ink: #182027;
      --paper: #f4f1e8;
      --paper-2: #ebe7db;
      --line: #c9c3b5;
      --lime: #bafc61;
      --blue: #7ac7ff;
      --orange: #ff7e59;
      --white: #fffdf7;
      --muted: #5f665f;
      --shadow: 0 18px 60px rgba(24, 32, 39, .10);
      --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      --serif: "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", "SimSun", serif;
      --mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--sans); line-height: 1.75; text-rendering: optimizeLegibility; }
    a { color: inherit; text-underline-offset: 3px; }
    button, input { font: inherit; }
    :focus-visible { outline: 3px solid var(--blue); outline-offset: 3px; }
    [hidden] { display: none !important; }

    .topbar { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; min-height: 58px; padding: 0 clamp(20px, 4vw, 64px); border-bottom: 1px solid var(--line); background: rgba(255, 253, 247, .94); backdrop-filter: blur(14px); }
    .brand { text-decoration: none; font-size: 13px; font-weight: 800; letter-spacing: .02em; }
    .brand small { display: block; color: var(--muted); font-size: 9px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
    .top-actions { display: flex; align-items: center; gap: 12px; }
    .print-button { min-height: 38px; padding: 0 15px; border: 1px solid var(--ink); background: transparent; color: var(--ink); cursor: pointer; font-size: 12px; font-weight: 800; }
    .print-button:hover { background: var(--ink); color: var(--white); }

    .hero { padding: clamp(56px, 8vw, 112px) clamp(22px, 6vw, 96px) clamp(46px, 6vw, 82px); background: var(--ink); color: var(--white); }
    .hero-inner { width: min(1180px, 100%); margin: 0 auto; }
    .hero h1 { max-width: 980px; margin: 0; font-family: var(--serif); font-size: clamp(46px, 7vw, 92px); font-weight: 500; letter-spacing: -.055em; line-height: 1.02; }
    .hero h1 span { color: var(--lime); }
    .hero h1 small { display: block; margin-top: 20px; color: var(--white); font-family: var(--sans); font-size: clamp(17px, 2vw, 26px); font-weight: 650; letter-spacing: 0; line-height: 1.35; }
    .hero-copy { max-width: 820px; margin: 30px 0 0; color: rgba(255,255,255,.72); font-size: clamp(15px, 1.35vw, 19px); }
    .platform-links { display: flex; flex-wrap: wrap; gap: 1px; margin-top: 34px; }
    .platform-links a { min-width: 124px; padding: 12px 16px; border: 1px solid rgba(255,255,255,.22); color: var(--white); text-align: center; text-decoration: none; font-size: 12px; font-weight: 800; }
    .platform-links a:hover { border-color: var(--lime); background: var(--lime); color: var(--ink); }

    .search-band { padding: 26px clamp(22px, 6vw, 96px); border-bottom: 1px solid var(--line); background: var(--white); }
    .search-inner { display: grid; grid-template-columns: minmax(0, 1fr) auto; width: min(1180px, 100%); margin: 0 auto; }
    .search-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    .guide-search { min-width: 0; height: 52px; padding: 0 18px; border: 2px solid var(--ink); border-right: 0; border-radius: 0; background: var(--white); color: var(--ink); font-size: 15px; }
    .search-result { display: grid; place-items: center; min-width: 142px; padding: 0 18px; background: var(--lime); color: var(--ink); font-size: 12px; font-weight: 850; }
    .search-hint { grid-column: 1 / -1; margin: 8px 0 0; color: var(--muted); font-size: 11px; }

    .mobile-toc { display: none; margin: 20px; border: 1px solid var(--line); background: var(--white); }
    .mobile-toc summary { padding: 14px 18px; cursor: pointer; font-weight: 800; }
    .mobile-toc nav { padding: 0 18px 18px; }

    .page-grid { display: grid; grid-template-columns: 280px minmax(0, 860px); gap: clamp(34px, 6vw, 92px); width: min(1240px, calc(100% - 40px)); margin: 0 auto; padding: 54px 0 110px; align-items: start; }
    .sidebar { position: sticky; top: 88px; max-height: calc(100vh - 112px); overflow: auto; border-top: 3px solid var(--ink); }
    .sidebar::before { display: block; padding: 16px 0 12px; color: var(--muted); content: "CONTENTS"; font-size: 9px; font-weight: 900; letter-spacing: .16em; }
    .toc ol { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--line); }
    .toc li { border-bottom: 1px solid var(--line); }
    .toc a { display: block; padding: 10px 8px; color: var(--muted); text-decoration: none; font-size: 11px; line-height: 1.4; }
    .toc a:hover, .toc a[aria-current="true"] { padding-left: 13px; background: var(--lime); color: var(--ink); font-weight: 800; }

    .guide { min-width: 0; }
    .guide-section { margin: 0 0 70px; scroll-margin-top: 82px; }
    .guide-section > h2 { margin: 0 0 24px; padding: 0 0 20px; border-bottom: 3px solid var(--ink); font-family: var(--serif); font-size: clamp(30px, 4vw, 52px); font-weight: 500; letter-spacing: -.035em; line-height: 1.16; scroll-margin-top: 84px; }
    .guide h3 { margin: 42px 0 18px; padding-left: 15px; border-left: 5px solid var(--lime); font-size: clamp(20px, 2.4vw, 28px); line-height: 1.35; scroll-margin-top: 84px; }
    .guide p { margin: 0 0 20px; color: #313a3f; font-size: 15px; }
    .guide strong { color: var(--ink); }
    .guide p code, .guide li code, .guide td code { padding: 2px 6px; background: var(--paper-2); font-family: var(--mono); font-size: .88em; overflow-wrap: anywhere; }
    .guide ul, .guide ol { margin: 18px 0 26px; padding-left: 1.5em; }
    .guide li { margin: 8px 0; padding-left: 6px; }
    .guide li::marker { color: #52720f; font-weight: 900; }
    .guide a { font-weight: 700; text-decoration-color: #81aa35; }

    .table-scroll { margin: 24px 0 34px; overflow-x: auto; border: 1px solid var(--line); background: var(--white); box-shadow: var(--shadow); }
    table { width: 100%; border-collapse: collapse; min-width: 650px; }
    th, td { padding: 15px 16px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { background: var(--ink); color: var(--white); font-size: 11px; letter-spacing: .04em; }
    td { font-size: 13px; }
    tbody tr:last-child td { border-bottom: 0; }
    tbody tr:hover { background: #efffd9; }

    .code-block { margin: 22px 0 30px; overflow: hidden; border: 1px solid #344047; background: #11191e; color: #ecf3e6; box-shadow: 8px 8px 0 rgba(24,32,39,.12); }
    .code-block figcaption { display: flex; align-items: center; justify-content: space-between; min-height: 40px; padding: 0 10px 0 16px; border-bottom: 1px solid #344047; color: #aeb9b3; font-family: var(--mono); font-size: 10px; text-transform: uppercase; }
    .copy-button { padding: 6px 11px; border: 1px solid #65736b; background: transparent; color: var(--lime); cursor: pointer; font-family: var(--sans); font-size: 10px; font-weight: 800; }
    .copy-button:hover { border-color: var(--lime); background: var(--lime); color: var(--ink); }
    pre { margin: 0; padding: 20px; overflow: auto; font-family: var(--mono); font-size: 12px; line-height: 1.75; tab-size: 2; }
    pre code { font-family: inherit; }

    .empty-state { margin: 40px 0; padding: 34px; border: 2px solid var(--orange); background: #fff0e9; }
    .empty-state strong { display: block; margin-bottom: 6px; font-family: var(--serif); font-size: 26px; }

    .footer { padding: 32px 20px 46px; border-top: 1px solid var(--line); background: var(--white); color: var(--muted); text-align: center; font-size: 10px; }
    .footer code { font-family: var(--mono); }

    @media (max-width: 900px) {
      .topbar { padding-inline: 18px; }
      .top-actions { gap: 6px; }
      .print-button { padding-inline: 10px; }
      .hero { padding-inline: 22px; }
      .hero h1 { font-size: clamp(42px, 13vw, 68px); }
      .platform-links a { flex: 1 1 42%; }
      .search-band { padding-inline: 20px; }
      .search-inner { grid-template-columns: 1fr; }
      .guide-search { border-right: 2px solid var(--ink); }
      .search-result { min-height: 38px; }
      .mobile-toc { display: block; }
      .page-grid { display: block; width: min(100% - 36px, 760px); padding-top: 30px; }
      .sidebar { display: none; }
      .guide-section { margin-bottom: 54px; }
      .guide-section > h2 { font-size: clamp(29px, 8vw, 42px); }
    }

    @media (max-width: 520px) {
      .brand small { display: none; }
      .print-button { display: none; }
      .hero h1 small { margin-top: 14px; }
      .hero-copy { font-size: 14px; }
      .platform-links a { flex-basis: 100%; }
      .page-grid { width: min(100% - 28px, 760px); }
      .guide p, .guide li { font-size: 14px; }
      pre { padding: 16px; font-size: 11px; }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
    }

    @media print {
      body { background: white; }
      .topbar, .search-band, .mobile-toc, .sidebar, .copy-button { display: none !important; }
      .hero { padding: 32px 0; background: white; color: var(--ink); }
      .hero h1 span, .hero h1 small { color: var(--ink); }
      .hero-copy { color: var(--muted); }
      .platform-links { display: none; }
      .page-grid { display: block; width: 100%; padding: 28px 0; }
      .guide-section { break-inside: avoid; }
      .code-block { break-inside: avoid; box-shadow: none; }
      a { text-decoration: none; }
      .footer { background: white; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <a class="brand" href="#top">云与 AI 售前知识库<small>Cloud × AI Presales Fieldbook</small></a>
    <div class="top-actions"><button type="button" class="print-button" id="print-guide">打印 / 保存 PDF</button></div>
  </header>

  <main id="top">
    <header class="hero">
      <div class="hero-inner">
        <h1><span>${escapeHtml(primaryTitle)}</span>${secondaryTitle ? `<small>${escapeHtml(secondaryTitle)}</small>` : ""}</h1>
        ${intro.map((paragraph) => `<p class="hero-copy">${renderInline(paragraph.replaceAll("\n", " "))}</p>`).join("\n        ")}
        <nav class="platform-links" aria-label="按平台快速开始">${platformLinks(rendered.headings)}</nav>
      </div>
    </header>

    <section class="search-band" aria-label="搜索指南">
      <div class="search-inner">
        <label class="search-label" for="guide-search">搜索平台、命令或问题</label>
        <input class="guide-search" id="guide-search" type="search" placeholder="例如：WSL2、npm run dev、SHA-256、Hook……" autocomplete="off">
        <output class="search-result" id="search-result" aria-live="polite">${rendered.headings.length} 个章节</output>
        <p class="search-hint">按 <kbd>/</kbd> 快速聚焦搜索；输入多个词时会显示同时包含这些词的章节。</p>
      </div>
    </section>

    <details class="mobile-toc">
      <summary>打开完整目录</summary>
      ${navMarkup(rendered.headings, "toc")}
    </details>

    <div class="page-grid">
      <aside class="sidebar">${navMarkup(rendered.headings, "toc")}</aside>
      <article class="guide" id="guide-content">
        ${rendered.html}
        <div class="empty-state" id="empty-state" hidden><strong>没有找到匹配章节</strong><span>尝试缩短关键词，或搜索具体命令，例如 npm、WSL2、Hook。</span></div>
      </article>
    </div>
  </main>

  <footer class="footer">由 <code>HANDOFF.md</code> 自动生成 · Source SHA-256 <code>${sourceHash.slice(0, 12)}</code></footer>

  <script>
    (() => {
      const search = document.querySelector("#guide-search");
      const result = document.querySelector("#search-result");
      const empty = document.querySelector("#empty-state");
      const sections = [...document.querySelectorAll("[data-guide-section]")];
      const tocLinks = [...document.querySelectorAll(".toc a")];

      const updateSearch = () => {
        const terms = search.value.trim().toLocaleLowerCase("zh-CN").split(/\\s+/).filter(Boolean);
        let visible = 0;
        sections.forEach((section) => {
          const haystack = section.textContent.toLocaleLowerCase("zh-CN");
          const matches = terms.every((term) => haystack.includes(term));
          section.hidden = !matches;
          if (matches) visible += 1;
        });
        result.textContent = terms.length ? visible + " 个匹配章节" : sections.length + " 个章节";
        empty.hidden = visible !== 0;
      };

      search.addEventListener("input", updateSearch);
      document.addEventListener("keydown", (event) => {
        if (event.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) {
          event.preventDefault();
          search.focus();
        }
      });

      document.querySelector("#print-guide").addEventListener("click", () => window.print());
      document.querySelectorAll(".copy-button").forEach((button) => {
        button.addEventListener("click", async () => {
          const code = button.closest(".code-block").querySelector("code").textContent;
          try {
            await navigator.clipboard.writeText(code);
          } catch {
            const area = document.createElement("textarea");
            area.value = code;
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.append(area);
            area.select();
            document.execCommand("copy");
            area.remove();
          }
          button.textContent = "已复制";
          window.setTimeout(() => { button.textContent = "复制"; }, 1400);
        });
      });

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
          if (!current) return;
          const id = current.target.querySelector("h2")?.id;
          tocLinks.forEach((link) => link.setAttribute("aria-current", String(link.hash === "#" + id)));
        }, { rootMargin: "-18% 0px -72%", threshold: 0 });
        sections.forEach((section) => observer.observe(section));
      }
    })();
  </script>
</body>
</html>
`;
}

const markdown = await readFile(SOURCE_PATH, "utf8");
const output = buildDocument(markdown);

if (CHECK_ONLY) {
  let existing = "";
  try {
    existing = await readFile(OUTPUT_PATH, "utf8");
  } catch {
    // A missing generated file is reported by the same deterministic mismatch below.
  }
  if (existing !== output) {
    console.error("HANDOFF-READ-FIRST.html is stale. Run npm run handoff:build and stage both files.");
    process.exitCode = 1;
  } else {
    console.log("Handoff HTML is synchronized with HANDOFF.md.");
  }
} else {
  await writeFile(OUTPUT_PATH, output, "utf8");
  console.log(`Generated ${path.basename(OUTPUT_PATH)} from ${path.basename(SOURCE_PATH)}.`);
}
