# 云计算 × AI 售前知识库 · 工程改进执行手册

版本 v1 · 基线提交 `4d7706a`（`origin/main`，2026-09-05）· 执行者：另一个大模型 · 检查者：Claude · 合并与发布：用户

本手册在仓库中的位置：`docs/change-plans/2026-09-engineering-improvement/EXECUTION-PLAN.md`。

本手册是给执行者读的。它假设你没有读过体检报告，所以每个任务都自带背景、精确文件位置、做法、验收标准和回执要求。请从第 0 节开始逐字阅读，不要跳读。

---

## 0. 执行规则（必读）

### 0.1 角色与边界

- **你（执行者）**：按本手册逐任务修改代码、运行验证、推送分支、输出回执。
- **检查者**：拉取你的分支，运行第 6 节列出的验收命令，逐项核对回执。
- **用户**：决定是否合并到 `main` 并发布。**你不合并 `main`，不发布 Sites，不 force-push，不改写历史。**

### 0.2 环境

- 仓库：`https://github.com/jasonlijiaxiang/myailearning-codex`，本地路径由用户提供。
- Node ≥ 22.13；开始前执行 `git fetch --prune origin && git status`，工作区必须干净且位于最新 `origin/main`。
- 项目已有协作规则 `AGENTS.md`，本手册与它冲突时以本手册为准，并在回执里注明冲突点。

### 0.3 分支与提交

- 每个阶段一个分支：`codex/improve-s0`、`codex/improve-s1`、`codex/improve-s2`、`codex/improve-s3`，从最新 `origin/main` 创建。阶段 N 的分支只有在阶段 N−1 已被用户合并进 `main` 后才创建。
- 每个任务至少一个提交，提交信息格式：`S0-T3: 搜索索引改为静态 JSON 按需加载`（阶段-任务编号 + 一句话）。
- 每完成一个任务就 `git push -u origin <分支>`，然后输出该任务的回执（格式见 0.6）。不要攒到阶段末尾一起推。
- 提交前必须让该阶段要求的门禁通过（阶段 0 是 `npm run check`，阶段 1 起是 `npm run check:fast` 加该任务指定的检查）。**不允许为了让门禁变绿而删除、跳过或放宽与任务无关的断言。**

### 0.4 十二条硬规则

1. **不改知识正文。** 除非任务明确允许，不得修改以下文件中的任何中文或英文正文、问答、证据卡、来源说明：`app/module-briefs-*.mjs`、`app/module-content-agent-platforms.mjs`、`app/rag-content.mjs`、`app/agent-content.mjs`、`app/prompt-content.mjs`、`app/module-*-expansion.mjs`、`app/module-completion-content.mjs`、`app/module-curriculum-content.mjs`、`app/module-learning-content.mjs`、`app/i18n/en/modules/*.mjs`、`app/terminology.mjs`、`app/reference-content.mjs`。允许的例外在各任务里逐条写明。
2. **不改 `updatedAt` / `addedAt` / `introducedAt`。** 本手册没有任何任务构成模块内容更新。
3. **每个重构任务前后跑内容快照**（见 S0-T0），哈希必须相同，除非任务明确说明快照会变以及为什么。
4. **删除任何东西前先 grep**，把 grep 命令和结果写进回执。范围至少包括 `app/ tests/ scripts/ .agents/ docs/ kb.config.json package.json .github/`。
5. **不新增依赖**，除非任务列表明确写了包名。
6. **不动 Git 历史**：不 rebase 已推送的提交、不 squash、不 `filter-repo`、不 `stash`。
7. **不触碰** `knowledge/private-inbox/`、`external_reference/`、`.openai/hosting.json`、`outputs/`、`work/`。
8. **不部署。** 任何涉及 `sites:release-check`、`kb:package`、Sites 的操作都不执行。
9. **遇到阻塞就停。** 本手册的判断与实际代码不符、门禁因你无法解释的原因失败、任务需要超出范围的改动，都停下来输出「阻塞回执」（格式见 0.6），不要绕过去。
10. **规则变化必须同步文档。** 改了门禁行为、脚本名、目录结构，要同步更新 `AGENTS.md`、`README.md`、`docs/REPOSITORY-WORKFLOW.md`、`docs/MODULE-QUALITY-GATES.md` 里对应的句子。只改对应句子，不重写文档。
11. **不做任务清单之外的「顺手优化」。** 看到别的问题，写进回执的「发现」栏。
12. **所有新脚本用 ESM `.mjs`，不用 TypeScript 写脚本**，与仓库现状一致。

### 0.5 本地化账本协议（阶段 0 必须遵守，阶段 1 T1.3 之后失效）

仓库当前有一个对象级本地化账本 `knowledge/localization-deferments.json`（2.5 MB）。它对每个模块的渲染链路文件（从 `app/(zh)/layout.tsx`、`app/(en)/layout.tsx` 和各路由文件出发的 import 闭包）计算哈希。**只要你改了闭包内任何文件，`npm run test:bilingual` 就会失败，直到你追加一条「runtime maintenance」记录。** 这是历史里大量 `chore: record ... maintenance` 提交的来源。

阶段 0 的做法：

1. 完成一个任务的代码改动并提交（例如 `S0-T3: ...`）。
2. 运行 `npm run audit:localization`。如果它报告渲染文件漂移（输出里会点名 changed renderer files），执行第 3 步；如果通过，跳过。
3. 在**干净工作区**运行（把占位符换成实际值，`--files` 用逗号分隔本次提交改动的 `app/` 下文件）：

   ```bash
   node scripts/audit-localization-deferments.mjs \
     --record-runtime-maintenance erm-<主题>-<YYYY-MM-DD> \
     --receipt receipt-<主题>-<YYYY-MM-DD> \
     --decision-id DEC-IMPROVE-S0 \
     --recorded-at <YYYY-MM-DD> \
     --kind document-shell \
     --metadata-scope all-en-routes \
     --files app/xxx.tsx,app/yyy.mjs \
     --summary "<一句英文说明>"
   ```

   参照账本里最近一条 `kind: "document-shell"` 记录（`maintenanceId: erm-content-driven-readers-2026-09-01`）的字段取值。脚本自带校验，参数不对它会报错并说明原因；按错误提示调整，**不要手工编辑账本 JSON**。
4. 把账本改动单独提交：`S0-T3-record: record runtime maintenance`。
5. 再跑 `npm run test:bilingual` 确认通过。

如果第 3 步反复失败且错误信息你无法理解，输出阻塞回执，附完整错误输出。

### 0.6 回执格式

每个任务完成后输出一段 Markdown，字段齐全，不省略：

```
## 回执 S0-T3
- 分支 / 提交：codex/improve-s0 / <sha>（附带的 maintenance 记录提交：<sha> 或「无需」）
- 改动文件：<git diff --stat 的输出>
- 内容快照哈希：改前 <hash> / 改后 <hash> / 是否相同：是|否（不同则解释）
- 删除前 grep：<命令> → <结果摘要>
- 验收项：
  - [x] <手册里的验收项 1>：<证据，通常是命令 + 关键输出行>
  - [x] <验收项 2>：...
- 门禁：npm run check → 通过（耗时 X 分）｜或 check:fast + <指定检查>
- 与手册不符之处：<无 | 描述>
- 发现（不处理，仅记录）：<无 | 描述>
```

阻塞回执：

```
## 阻塞 S1-T3 步骤 d
- 卡在：<做什么时>
- 现象：<完整错误输出或矛盾的事实>
- 已尝试：<...>
- 需要检查者决定：<具体问题>
- 当前分支状态：<已提交到 sha | 未提交，工作区有改动>
```

---

## 1. 开始前需要用户确认的决策

执行者在开始阶段 1 之前必须得到用户对 D1、D2 的答复。阶段 0 不依赖这些决策，可以立即开始。

| 编号 | 决策 | 默认建议 | 影响 |
|---|---|---|---|
| D1 | 退役对象级本地化账本（2.5 MB 哈希账本、188 份 PASS 审校记录、stage-0 候选矩阵耦合），换成每模块一行的轻量状态账本 + git diff 查看差异 | **是** | 删除约 4,000 行脚本与测试、180 个 JSON 文件；双语门禁从 9.5 分钟降到 1 分钟内；以后改渲染代码不再需要 maintenance 记录。代价：失去对象级的中英差异哈希追踪，改用 `git diff <enSyncedCommit>` 查看 |
| D2 | 来源过期从「阻断 check」改为「报告 + 豁免清单」 | **是** | 9 月 8 日起门禁不会自动变红；过期来源仍在每次 check 输出里可见 |
| D3 | 清理 Git 历史里账本的 148 MB blob（`git filter-repo`） | **不在本手册范围** | 需要所有协作者重新 clone；由用户另行决定 |
| D4 | 重写 `.codex/hooks.json` 的压缩单行脚本 | 可选，放在 S1-T6 | 涉及私有采集安全逻辑，收益是可维护性 |

---

## 2. 阶段 0 · 止血（分支 `codex/improve-s0`，预计 1 到 1.5 天）

阶段目标：门禁不会在 9 月 8 日自己变红；类型错误从此零新增；最重的三个页面回到正常体积。门禁：每个任务结束时 `npm run check` 通过（约 12 分钟）。

### S0-T0 · 内容快照脚本（所有重构任务的安全网）

**背景。** 后续大量任务是「移动代码不改内容」。需要一个机器可判定的证明。

**做法。**

1. 新建 `scripts/snapshot-content.mjs`。它 import 以下导出并序列化为一个确定性 JSON（对象键排序、数组保持原序）：
   - `moduleContentRegistry`（`app/module-content-registry.mjs`）
   - `publishedModules`（`app/module-publication.mjs`）
   - `moduleList`、`layers`（`app/knowledge-map.mjs`）
   - `sourceLedger`、`referenceModules`（`app/reference-content.mjs`）
   - `terminology`、`glossaryGroups`（`app/terminology.mjs`）
   - `englishModuleRegistry`（`app/i18n/en/registry.mjs`）
   - `moduleCurriculumContent`、`moduleLearningContent`（对应文件）
   - `questionDirectoryItems`（`app/question-index.mjs`），但**去掉 `searchText` 字段**（S0-T3 会改它）
2. 输出：`--json` 打印完整 JSON；默认打印 SHA-256 与各部分条目数（模块数、问答数、来源数、术语数）。
3. 加脚本 `"snapshot:content": "node scripts/snapshot-content.mjs"`。
4. 在 `docs/REPOSITORY-WORKFLOW.md` 加两句话说明用途。

**验收。**
- `npm run snapshot:content` 输出一行哈希和计数：模块 23、问答 355、来源 265、术语 154。
- 连续运行两次哈希相同。
- 把此哈希记为 **H0**，写进回执。

### S0-T1 · 来源新鲜度门禁改为报告（对应 D2）

**背景。** `tests/rendered-html.test.mjs:2412-2417` 对 265 条来源调用 `sourceFreshness(source)` 不传 `now`，用真实当前时间断言状态必须是 `fresh`。`app/source-freshness.mjs` 按 kind 给 30 / 90 / 180 天周期。实算：`dify-enterprise-pricing`（verifiedAt 2026-08-08，30 天）2026-09-07 到期，`artificial-analysis-models` 9 月 12 日到期，30 天内共 9 条，60 天内 112 条。**2026-09-08 起 `npm run check` 必然失败。**

**做法。**

1. 改 `tests/rendered-html.test.mjs` 该循环：保留 `verifiedAt` 格式断言与 `reviewCycleDays ∈ {30,90,180}` 断言；把 `assert.equal(freshness.status, "fresh")` 改为 `assert.ok(freshness.status !== "invalid" && freshness.status !== "future", ...)`。`invalid` 与 `future` 仍用真实 `now`（这是写错日期，应当失败）。
2. 新建 `scripts/sources-report.mjs`：import `sourceLedger` 与 `sourceFreshness`，按到期日升序打印表格：`sourceId | kind | verifiedAt | 周期 | 到期日 | 状态`，末尾汇总「已过期 N 条、30 天内到期 N 条、60 天内 N 条」。支持 `--now YYYY-MM-DD` 覆盖当前日期，支持 `--json`。永远 exit 0。
3. 新建 `knowledge/source-waivers.json`：`{ "waivers": [ { "sourceId": "...", "until": "YYYY-MM-DD", "reason": "..." } ] }`，初始为空数组。报告脚本把在 waiver 有效期内的过期来源标为 `waived`。
4. 加脚本 `"sources:report": "node scripts/sources-report.mjs"`，并追加到 `package.json` 的 `test` 脚本末尾（`&& npm run sources:report`），让每次 check 都能看见。
5. `tests/rendered-html.test.mjs:2502` 已有的 `sourceFreshness` 单元测试保留；再加一条：`sourceFreshness({kind:"产品规格", verifiedAt:"2026-08-08"}, new Date("2026-09-08T00:00:00Z")).status === "stale"`。
6. 文档：`docs/MODULE-QUALITY-GATES.md:72` 那一行「超期来源阻止发布」改为「超期来源由 `npm run sources:report` 列出；引用超期来源的模块内容改动在发布前须人工重核并更新 `verifiedAt`，或登记到 `knowledge/source-waivers.json`」。`docs/CONTENT-MAINTENANCE.md` 第 35 到 52 行附近加一句指向报告脚本。

**验收。**
- `node scripts/sources-report.mjs --now 2026-09-08` 显示 `dify-enterprise-pricing` 为 `stale`，`--now 2026-11-01` 显示至少 100 条 `stale`。
- `npm run check` 通过；把 `sources-report` 的汇总行贴进回执。
- 内容快照哈希仍为 H0。

### S0-T2 · 类型检查进门禁 + 清除 Drizzle 模板残留

**背景。** `tsconfig.json` 是 `strict: true`，但仓库没有任何地方运行 `tsc`。当前 `npx tsc --noEmit` 报 121 个错误，分布：`app/i18n/english-pilot-module-page.tsx` 28、`app/(en)/en/page.tsx` 26、`app/(zh)/questions/page.tsx` 12、`app/(zh)/page.tsx` 11、其余散布；`worker/index.ts` 2 条是缺 Cloudflare 全局类型，`db/index.ts` 1 条是未使用的 Drizzle 模板。

**做法。**

1. 删除 Drizzle 模板残留：`db/`、`drizzle/`、`drizzle.config.ts`、`examples/d1/`；`package.json` 去掉 `drizzle-orm`、`drizzle-kit` 和 `db:generate` 脚本；`build/sites-vite-plugin.ts` 删除复制 `drizzle/` 的分支；`kb.config.json` 的 `packaging.include` 去掉 `db`、`drizzle`、`examples`、`drizzle.config.ts`。先 grep `drizzle|examples/d1|cloudflare:workers` 确认没有其他引用（`.agents/` 与 `tests/portable-*` 也要查）。运行 `npm install` 更新 lockfile。
2. `worker/index.ts`：把 `Fetcher` 改为 `{ fetch: typeof fetch }`，`D1Database` 改为 `unknown`（该绑定为 null，从未使用）。不引入 `@cloudflare/workers-types`。
3. 新建 `scripts/typecheck.mjs`：运行 `tsc --noEmit --pretty false -p tsconfig.json`，解析每行 `文件(行,列): error TS....`，按文件计数；读取 `typecheck-baseline.json`（`{ "app/x.tsx": 28, ... }`）；规则：任一文件错误数超过基线，或出现基线中没有的文件，exit 1 并打印超出的文件与新增错误的原文；某文件错误数低于基线时打印提示「可以运行 --update 收紧基线」；`--update` 用当前计数重写基线。exit 0 时打印「typecheck: N errors within baseline (M files)」。
4. 生成初始 `typecheck-baseline.json`（预期 118 条左右），提交它。
5. 加脚本 `"typecheck": "node scripts/typecheck.mjs"`；`check` 改为 `npm run lint && npm run typecheck && npm test`。
6. `AGENTS.md` 第 35 行「`npm run check`（构建、网站与内容检查、代码检查）」补上「类型检查」。

**验收。**
- `npm run typecheck` exit 0；在任意 `.tsx` 临时加一行 `const x: number = "a";` 后 exit 1 并指出文件，恢复后再次通过（把两次输出贴进回执）。
- `npm ls drizzle-orm drizzle-kit` 均为 empty；`git ls-files db drizzle examples` 为空。
- `npm run check` 通过；快照哈希仍为 H0。

### S0-T3 · 搜索索引改为静态 JSON 按需加载 + 页面体积预算

**背景。** 线上实测 `/en` HTML 2.07 MB，其中内联 RSC 数据 1.99 MB；`/questions` 2.59 MB，内联 1.30 MB，14,649 个 DOM 节点，`domComplete` 5.7 秒；`/` 599 KB，内联 367 KB。根因：

- `app/(zh)/page.tsx:32-87` 与 `app/(en)/en/page.tsx:44-77` 构造 `knowledgeSearchEntries`，`keywords` 字段拼进每道问答的完整 `a`、`depth`、`ask`，再作为 props 传给 `"use client"` 的 `ModuleExplorer`（`app/fieldbook-interactions.tsx:129`，`:165-166` 用 `includes` 做匹配）。RSC 把 props 序列化进 HTML，等于整份语料传两遍。
- `app/(zh)/questions/page.tsx:20-28` 把 `question-index.mjs:54` 生成的 `searchText`（含 q、a、depth、ask、basis）作为 `text` 传给 `QuestionDirectoryShell`。

同时 `app/home-search-visibility.mjs` 三个导出全是恒等函数（`void slug; return questions;`），是遗留的空壳。

**相关测试（必须同步更新，不得删除整条测试）**：`tests/rendered-html.test.mjs:17`（import 空壳）、`:1492`、`:2098-2107`、`:2666`、`:2671`；`tests/bilingual-pilot.test.mjs:684-686`。这些断言匹配的是页面**源码文本**，改动后按新代码更新正则。

**做法。**

1. 新建 `app/search-index.mjs`：导出 `buildKnowledgeSearchEntries(locale)`（把两个首页里的构造逻辑原样搬过来，locale 为 `"zh" | "en"`）和 `buildQuestionSearchText(locale)`（返回 `{ [item.key]: searchText }`）。首页不再内联构造。
2. 新建 `scripts/build-search-index.mjs`：写出 `public/search/knowledge.zh.json`、`knowledge.en.json`、`questions.zh.json`、`questions.en.json`。`.gitignore` 加 `/public/search/`。
3. `scripts/run-vinext.mjs`：在 `build` 与 `dev` 分支执行 vinext 之前先同步运行该脚本（用 `spawnSync(process.execPath, [...])`，失败则退出非零）。不要依赖 npm 的 `prebuild` 钩子。
4. `ModuleExplorer`：把 `knowledgeEntries` prop 换成 `knowledgeIndexUrl: string`；首次输入或聚焦搜索框时 `fetch` 一次并缓存在 `useRef`；未加载完成时按钮区显示「正在加载索引」文案（中英各一）；加载失败显示一句提示并保留模块筛选功能。匹配逻辑不变。
5. `QuestionDirectoryShell`（`app/fieldbook-interactions.tsx:494`）同样改为 `questionIndexUrl`，`filterItems` 不再携带 `text`；`app/question-filter.mjs` 的过滤函数改为接受 `textByKey` 参数。`app/(zh)/questions/page.tsx` 与 `app/(en)/en/questions/page.tsx` 同步。
6. 删除 `app/home-search-visibility.mjs`；`question-index.mjs` 的 `searchText` 字段移到 `search-index.mjs` 里计算（`questionDirectoryItems` 不再带它）。
7. 新建 `tests/page-budget.test.mjs`：复用 `tests/rendered-html.test.mjs:57` 的 worker fetch 方式渲染以下路由，断言 HTML 总字节数与「不带 `src` 的 `<script>` 内容字节数」不超过预算。先测出改后实际值，预算取实际值 × 1.15 向上取整到 10 KB，并把实际值写进回执。硬上限（超过说明改法没生效）：`/` HTML ≤ 250 KB、`/en` HTML ≤ 350 KB、`/questions` 内联脚本 ≤ 150 KB、`/en/questions` 内联脚本 ≤ 150 KB、`/modules/rag` HTML ≤ 450 KB、`/en/modules/rag` ≤ 600 KB。把该测试加进 `package.json` 的 `test` 脚本。
8. 更新上面列出的测试断言。
9. 按 0.5 节记录 maintenance。

**验收。**
- `npm run build && ls -la public/search/` 四个文件存在；`git status` 不显示它们。
- `node --test tests/page-budget.test.mjs` 通过，回执列出六个路由改前/改后的字节数。
- `npm run dev` 后在浏览器（或 `curl`）确认 `/search/knowledge.zh.json` 可访问；搜索框输入「RAG」能出结果（回执描述验证方式）。
- `npm run check` 通过；快照哈希仍为 H0（快照已排除 `searchText`）。

### S0-T4 · 切断 MCP 页面客户端块对全站内容的依赖 + 产物预算

**背景。** 构建产物 `dist/client/assets/mcp-module-experience-client-*.js` 单块 849 KB（gzip 303 KB），含 187,673 个汉字、991 处 `sourceId`，Vite 已发 500 KB 警告。链路：`app/mcp-module-experience-client.tsx`（`"use client"`）→ `app/unified-module-hero.tsx:6` → `app/module-content-components.tsx:8` → `app/module-representation-assessment.mjs:1-2` import 了 `moduleContentRegistry` 与 `publishedModules`。其他模块页在服务端渲染 `UnifiedModuleScaffold`，只有 MCP 页把它拉进客户端图。

**做法。**

1. 新建 `app/deep-dive-representation.mjs`，只放 `deepDiveRepresentationByKind` 与 `requireDeepDiveRepresentation`，**无任何 import**。
2. `app/module-representation-assessment.mjs` 改为从新文件 import 这两个符号并 re-export，保留 `moduleRepresentationAssessment` 与 `requireModuleRepresentationAssessment`（`tests/rendered-html.test.mjs:36` 在用）。
3. `app/module-content-components.tsx:8` 改为 import 新文件。
4. `scripts/lib/localization-contract.mjs:9-18` 的 `MODULE_RENDERER_LOGIC_FILES` 加入 `app/deep-dive-representation.mjs`（该列表要求列出渲染逻辑文件；`tests/localization-deferment.test.mjs` 的「renderer manifests cover indirect visible dependencies」会检查）。
5. 新建 `scripts/check-bundle-budget.mjs`：读取 `dist/client/assets/*.js`，任一文件 > 250 KB 或总量 > 1.2 MB 则 exit 1，并打印前 10 大文件；加脚本 `"bundle:budget"`，在 `test` 脚本里紧跟 `npm run build` 之后运行。
6. 按 0.5 节记录 maintenance。

**验收。**
- 构建后 `ls -la dist/client/assets/ | sort -k5 -rn | head` 里 MCP 客户端块 < 60 KB；`grep -c "AI 网关" dist/client/assets/mcp-module-experience-client-*.js` 为 0。
- `npm run bundle:budget` exit 0。
- `npm run check` 通过；快照哈希 H0。

### S0-T5 · 中文页面补 canonical 与 hreflang

**背景。** 只有英文页面通过 `app/i18n/english-page-metadata.ts:14-17` 输出 `alternates.languages`；中文页面（`app/(zh)/modules/[slug]/page.tsx:115-123` 等）只有 `title`/`description`，无 canonical、无 hreflang。线上 `/` 的 `<link rel="alternate" hreflang>` 数量为 0，`/en` 为 2。

**做法。**

1. 新建 `app/i18n/chinese-page-metadata.ts`，签名与 `englishPageMetadata` 对称：输入 `{ title, description, path, enPath }`，输出含 `alternates: { canonical: path, languages: { "zh-CN": path, en: enPath } }`。`metadataBase` 已在 `app/(zh)/layout.tsx` 设置，保持不动。
2. 中文路由逐个改用它：`app/(zh)/page.tsx`、`glossary`、`references`、`questions`、`knowledge-graph`、`model-radar`、`coding-agents`、`modules/[slug]`、`modules/{rag,ai-agent,prompt-engineering,mcp,a2a}`。`title` 与 `description` 字符串**一字不改**（`tests/rendered-html.test.mjs` 断言精确 `<title>`）。
3. 在 `tests/rendered-html.test.mjs` 加一条：渲染 `/` 与 `/modules/rag`，断言存在 `<link rel="canonical"` 与 `hreflang="en"`。
4. 按 0.5 节记录 maintenance。

**验收。**
- 渲染 `/`、`/modules/ai-gateway`、`/glossary` 的 HTML 各含 1 个 canonical 与 2 个 hreflang。
- `npm run check` 通过；快照哈希 H0。

### S0-T6 · 重核 30 天内到期的 9 条来源（内容任务，需要联网）

**背景。** 以下来源按当前周期在 30 天内到期：`dify-enterprise-pricing`、`artificial-analysis-models`、`product-antigravity-migration`、`product-gemini-cli-individual-transition`、`product-qoder-cn-ide-changelog`、`mcp-2026-07-28-rc`、`openai-models`、`google-models`、`anthropic-models`。

**做法。** 对每条：打开 `href`，对照 `note` 字段的表述判断是否仍然成立。仍成立 → 把 `verifiedAt` 改为今天；不成立或页面已变 → **不改**，在回执里写明差异。这是本手册唯一允许修改 `app/reference-content.mjs` 的任务，且只允许改 `verifiedAt`。单独提交 `S0-T6: re-verify 9 sources due within 30 days`。无法联网则整条任务跳过并在回执说明。

**验收。** 回执逐条列出 9 个 sourceId 的结论；`npm run sources:report` 汇总行 30 天内到期数下降；快照哈希会变化（`verifiedAt` 在 `sourceLedger` 里），回执写明新哈希 **H0'** 并说明只因该字段变化（用 `--json` 输出 diff 证明）。

---

## 3. 阶段 1 · 减重（分支 `codex/improve-s1`，预计 4 到 5 天）

阶段目标：`check:fast` 30 秒内、`check` 10 分钟内；仓库不再被治理账本撑大；死代码与模板残留清空；CI 拆分并覆盖安全测试。前置：用户已合并阶段 0 并确认 D1、D2。

任务顺序固定：T1.1 → T1.2 → T1.3 → T1.4 → T1.5 →（可选）T1.6。

### S1-T1 · 移除零使用依赖与模板残留

**做法。**

1. **Tailwind。** 全站 `.tsx` 无任何工具类、无 `@apply`，但 `app/globals.css:1` 的 `@import "tailwindcss"` 提供了 Preflight 重置，直接删会改变默认边距。做法：把 `node_modules/tailwindcss/preflight.css` 原样复制为 `app/preflight.css`（保留文件头许可证注释），`globals.css:1` 改为 `@import "./preflight.css";`；删除 `postcss.config.mjs`；`package.json` 去掉 `tailwindcss`、`@tailwindcss/postcss`。构建后对比 `dist/client/assets/index-*.css` 的规则集：用一个临时 node 脚本提取改前改后 CSS 中所有选择器集合，差集应只包含 Tailwind 的 `@theme` 变量块与 `@layer` 声明，不得少任何 `.` 开头的选择器。把差集摘要贴进回执。
2. **模板残留。** 删除 `public/file.svg`、`public/globe.svg`、`public/window.svg`（先 grep）；`package.json` 的 `name` 改为 `cloud-ai-presales-fieldbook`；`eslint.config.mjs:13` 去掉 `build/**` 忽略并修复 `build/sites-vite-plugin.ts` 可能出现的 lint 问题；删除空目录 `app/knowledge-graph/explore/`。
3. `kb.config.json` 的 `packaging.include` 同步去掉已删路径。

**验收。** `npm ls tailwindcss @tailwindcss/postcss` empty；`npm run check` 通过；快照哈希不变；回执附 CSS 选择器差集摘要。

### S1-T2 · 退役对象级本地化账本，换成轻量状态账本（对应 D1）

这是阶段 1 最大的任务。**先读后改**：`scripts/audit-localization-deferments.mjs`（1,155 行）、`scripts/lib/localization-contract.mjs`（596 行）、`tests/localization-deferment.test.mjs`（1,128 行）、`tests/bilingual-pilot.test.mjs`（1,241 行，重点 28-52 行与 328-345 行）、`scripts/audit-english-modules.mjs`（164 行，第 16 行以子进程调用本地化审计）、`scripts/generate-bilingual-review-records.mjs`、`knowledge/schemas/localization-deferment.schema.json`、`knowledge/schemas/bilingual-review.schema.json`、`kb.config.json` 的 `modulePolish.targetedValidationCommands`。

**背景事实。**
- 账本 2,549,912 字节、57,535 行；`moduleBaselines.zhObjects` 6,794 条 SHA-256 占 53%；Git 里 85 个版本、原始 148.8 MB。网站构建不读它。
- `tests/bilingual-pilot.test.mjs:336` 对 19 个 `status != "closed"` 的模块直接 `continue`，所以「英文保留问题证据关系与日期」这条最强断言只在 4 个模块上运行。
- `knowledge/claims/bilingual-reviews/` 188 份记录全部 `verdict: PASS`、零发现；`scripts/generate-bilingual-review-records.mjs:10-57` 把评分写死为常量，`:92` 关闭写入路径。
- `docs/change-plans/.../stage-0/candidate-matrix.json` 被 `tests/bilingual-pilot.test.mjs:32`、`tests/localization-deferment.test.mjs:24`、`scripts/audit-localization-deferments.mjs:23` 读取，只用于校验 `deferment.candidateIds` 是否存在。
- `AGENTS.md`、`README.md`、`docs/*.md` 的活文档均未提及该账本（grep `localization-deferments|bilingual-reviews|candidate-matrix` 无结果），只有 `docs/UNIFIED-MODULE-READER-ROLLOUT.md` 与 `docs/change-plans/` 提到。

**做法。**

a. 写一次性迁移脚本 `scripts/migrate-localization-status.mjs`（任务结束时删除）：读旧账本，为 23 个已发布模块各生成一条记录，写出 `knowledge/localization/status.json`：

```json
{
  "schemaVersion": 1,
  "modules": {
    "ai-gateway": {
      "status": "deferred",
      "enSyncedCommit": "<该模块 deferment 的 openedFromCommit>",
      "openedAt": "<deferment.openedAt>",
      "expiresAt": "2026-12-31",
      "reason": "<deferment.reason 的前 120 字>"
    },
    "mcp": { "status": "aligned", "enSyncedCommit": "<moduleBaselines[mcp].enBaselineCommit>" }
  }
}
```

`status` 只允许 `aligned | deferred`。回执列出 23 个模块各自的状态与 commit。

b. 新建 `tests/localization-status.test.mjs`（目标 ≤ 150 行，不用 `json-schema-lite`）：每个 `publishedModuleSlugs` 恰有一条且没有多余键；`enSyncedCommit` 是 40 位十六进制并且 `git cat-file -e <sha>^{commit}` 成功；`deferred` 必须有 `openedAt`、`expiresAt`、`reason`；`expiresAt` 已过期只 `console.warn`，不失败。

c. 新建 `scripts/localization-diff.mjs`：`npm run localization:diff -- <slug>` 打印 `git diff --stat <enSyncedCommit> HEAD -- <该模块相关的中文源文件>`，源文件用 grep `"<slug>"` 在 `app/module-briefs-*.mjs app/module-content-agent-platforms.mjs app/module-*-expansion.mjs app/module-completion-content.mjs app/module-curriculum-content.mjs app/module-learning-content.mjs app/rag-content.mjs app/agent-content.mjs app/prompt-content.mjs` 里命中的文件集合。尽力而为的报告工具，exit 0。

d. 改 `tests/bilingual-pilot.test.mjs`：删除 28-52 行对旧账本、旧 schema、候选矩阵、`loadRuntimeMaintenanceOverlays`、`loadPromotedProjects`、`validateLocalizationRegistry` 的依赖；`deferredSlugs` 改从 `status.json` 读；328-345 行的测试改为：对**全部** 23 个模块执行原有断言，`aligned` 模块失败即失败，`deferred` 模块把断言失败收集到数组，测试末尾按模块打印「slug: N 处不对齐」并不失败。其他引用 `defermentsRegistry` 的地方同样处理。684-686 行的源码断言按 S0-T3 后的代码更新。

e. 改 `scripts/audit-english-modules.mjs`：删除第 16 行附近的子进程调用；`DEFERRED/NOT_ALIGNED` 判定改为读 `status.json`。

f. 删除：`scripts/audit-localization-deferments.mjs`、`scripts/lib/localization-contract.mjs`、`tests/localization-deferment.test.mjs`、`knowledge/localization-deferments.json`、`knowledge/schemas/localization-deferment.schema.json`、`knowledge/schemas/bilingual-review.schema.json`、`knowledge/claims/bilingual-reviews/`（整个目录）、`scripts/generate-bilingual-review-records.mjs`、`scripts/stage0-validate.mjs`、`scripts/lib/stage0-contract.mjs`、`tests/stage0-validator.test.mjs`。`package.json` 删除 `audit:english:reviews`、`audit:localization`、`audit:localization:remote`、`stage0:validate`；`test:bilingual` 改为 `npm run audit:english:complete && node --test tests/bilingual-pilot.test.mjs tests/localization-status.test.mjs`。`kb.config.json` 的 `targetedValidationCommands` 去掉 `audit:english:reviews`。每一项删除前 grep，`.agents/` 目录也要查（`kb-tool.mjs`、`module-polish.mjs` 可能引用 claims 目录或脚本名）。

g. 归档文档：`git mv docs/change-plans/2026-08-ai-knowledge-base-content-improvement docs/archive/change-plans/2026-08-ai-knowledge-base-content-improvement`（只归档 2026-08 的旧计划，本手册所在的 `docs/change-plans/2026-09-engineering-improvement/` 保留）；`git mv` 以下五个到 `docs/archive/`：`BILINGUAL-PILOT-REPORT.md`、`ENGLISH-CONTENT-XHIGH-REVIEW.md`、`ENGLISH-ULTRA-ADJUDICATION.md`、`FULL-SITE-DESIGN-AND-VOICE-REVIEW.md`、`UNIFIED-MODULE-READER-ROLLOUT.md`。grep `docs/` 相对链接（`README.md`、`AGENTS.md`、`docs/*.md`、`.agents/**/*.md`）并修正；`.gitignore` 里 `docs/change-plans/**/extracted/` 改为新路径。新建 `docs/archive/README.md` 一句话说明这些是历史记录不再维护。

h. 文档：`docs/ENGLISH-EDITORIAL-STANDARD.md` 与 `docs/MODULE-QUALITY-GATES.md` 里凡提到「延期」「deferment」「审校记录」的句子，改为指向 `knowledge/localization/status.json` 与 `npm run localization:diff`。`AGENTS.md` 第 16 行、第 65 行提到的「独立英文审查」保留语义，把审查产物从「四阶段 JSON 记录」改为「`status.json` 状态从 deferred 改为 aligned 并更新 enSyncedCommit」。

i. 删除迁移脚本。

**验收。**
- `git ls-files knowledge | wc -l` 从 203 降到 ≤ 20；`git ls-files docs | grep -v archive | wc -l` ≤ 12。
- `time npm run test:bilingual` ≤ 60 秒；输出里出现 19 个 deferred 模块的「N 处不对齐」行（把这段输出贴进回执，这是英文补齐的真实待办）。
- `npm run localization:diff -- ai-ops` 有输出。
- `npm run check` 通过；快照哈希不变。
- `grep -rn "localization-deferments\|bilingual-reviews\|candidate-matrix\|stage0" --include=*.mjs --include=*.ts --include=*.tsx --include=*.json --include=*.md --include=*.yml . --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=outputs --exclude-dir=archive` 无结果。

### S1-T3 · 拆分门禁：`check:fast` 与 `check`

**背景。** 当前 `check` = lint → `module:polish:validate` → 英文审计 → 双语测试 → build → 6 个测试文件，实测 12 分 30 秒。`module:polish:validate` 校验的是 11 个已全部 `complete` 的批次；`portable-release.test.mjs`（20 个用例）在默认门禁里，而安全相关的 `portable-capture-security.test.mjs` 不在 CI。

**做法。** `package.json` 脚本改为（其余脚本保留）：

```json
"typecheck": "node scripts/typecheck.mjs",
"test:unit": "node --test tests/question-overlap.test.mjs tests/question-field-kit.test.mjs tests/design-language-contract.test.mjs tests/localization-status.test.mjs",
"test:render": "node --test tests/rendered-html.test.mjs tests/page-budget.test.mjs",
"test:bilingual": "npm run audit:english:complete && node --test tests/bilingual-pilot.test.mjs",
"test:portable": "npm run kb:validate && npm run handoff:check && npm run module:polish:validate && node --test tests/portable-knowledge.test.mjs tests/portable-capture-security.test.mjs tests/portable-contract.test.mjs tests/portable-forward.test.mjs tests/portable-release.test.mjs tests/module-polish-orchestration.test.mjs",
"check:fast": "npm run lint && npm run typecheck && npm run test:unit",
"check": "npm run check:fast && npm run test:bilingual && npm run build && npm run bundle:budget && npm run test:render && npm run sources:report",
"test": "npm run check"
```

`AGENTS.md`、`README.md`、`docs/REPOSITORY-WORKFLOW.md` 中「运行 `npm run check`」的句子后补一句「日常开发用 `npm run check:fast`（约 30 秒），提交前用 `npm run check`」。

**验收。** `time npm run check:fast` ≤ 60 秒；`time npm run check` ≤ 8 分钟；`npm run test:portable` 通过（这是它第一次在改动后被完整运行，如失败按阻塞回执处理，不要修改 portable 测试）。

### S1-T4 · 删除确认的死代码

对下列每一项：先 grep（范围见 0.4 第 4 条），零引用才删；如果只有测试引用且该测试仅断言导出存在，连同那条断言一起删；如果有实质引用，保留并在回执说明。

1. `app/i18n/english-pilot-module-page.tsx`：`englishUnifiedReaderConfigs` 已覆盖全部 23 个 slug，`EnglishModulePage` 的 `reader` 参数默认 `"legacy"` 但 `app/(en)/en/modules/[slug]/page.tsx:29` 总是传 `"unified"`。删除 `reader` 参数与 1082 行起的 legacy 分支（约 50 行），检查 `app/(en)/en/modules/rag/page.tsx` 的调用。
2. `app/i18n/english-section-outline.mjs:88-98` 三个恒等选择器与 `english-pilot-module-page.tsx:20-22` 的 `usesFocusedEnglishPreview`、`:893-896` 的 `completeFocusedProjection` 分支。
3. 候选未引用导出（逐个 grep）：`module-publication.mjs` 的 `dedicatedModuleSlugs`、`isPublishedModule`；`knowledge-map.mjs` 的 `resolveModuleSlug`；`module-qa-expansion.mjs` 的 `requireModuleQaExpansion`；`module-brief-content.mjs` 的 `moduleBriefSlugs`；`question-field-kit.mjs` 的 `defaultIntentForTag`、`questionIntentOverrides`；`model-radar-data.mjs` 的 `modelRadarMetrics`；`english-update-dates.mjs` 的 `englishUpdatedDates`；`i18n/en/registry.mjs` 的 `englishPilotQuestions`；`i18n/english-section-outline.mjs` 标注为「compatibility exports」的 4 个；`i18n/locale-config.mjs` 的 `DEFAULT_LOCALE`、`ENGLISH_LOCALE`、`englishPilotSlugs`、`isEnglishModuleSlug`、`isEnglishPilotSlug`、`chineseModulePath`。
4. `app/module-extension-views-zh.mjs`（39 行，对已是中文的数据做「本地化覆盖」，只改一个 MCP 步骤的标题）：把它覆盖的值直接写回 `app/module-extension-views.mjs` 对应位置，删除该文件。**这会改变快照吗？** 不会：覆盖后的最终值不变。用快照证明。

**验收。** 每项附 grep 证据；`npm run check` 通过；快照哈希不变；`app/` 行数减少 ≥ 200（回执给出 `git diff --stat` 汇总）。

### S1-T5 · CI 拆分、夜间任务、Dependabot、来源链接检查

**做法。**

1. `.github/workflows/ci.yml` 改为三个 job（保持现有 SHA 锁定的 action 版本与 `permissions: contents: read`）：
   - `fast`：checkout（`fetch-depth: 1`）→ setup-node → `npm ci --ignore-scripts --no-audit --no-fund` → `npm run check:fast`。
   - `full`：`needs: fast` → checkout → setup-node → `npm ci` → `npm run test:bilingual` → `npm run build` → `npm run bundle:budget` → `npm run test:render` → `npm run sources:report`。用 `actions/cache` 缓存 `node_modules/.vite`（key 含 lockfile 哈希）。
   - `portable`：只在 `workflow_dispatch` 与 `schedule: "0 20 * * *"`（UTC，即北京时间 04:00）触发 → `npm run test:portable`。
2. 新建 `.github/workflows/nightly.yml`：每日运行 `node scripts/check-source-links.mjs`（新建：对 `sourceLedger` 每个 `href` 发 HEAD 请求，失败再 GET，并发 8，超时 15 秒，输出 `状态码 | sourceId | href`，非 2xx/3xx 汇总在末尾；exit 0，但把结果写入 job summary `$GITHUB_STEP_SUMMARY`）。
3. 新建 `.github/dependabot.yml`：`npm` 生态、`weekly`、分组为 `dev-tooling`（eslint、typescript、@types/*、vite、@vitejs/*、@cloudflare/*、wrangler）与 `runtime`（next、react、react-dom、react-server-dom-webpack、vinext），`open-pull-requests-limit: 5`。
4. `README.md` 的「日常维护」段落补一句 CI 结构说明。

**验收。** `npx --yes @action-validator/cli` 不可用则用 `node -e "require('js-yaml')"` 之类方式至少确认 YAML 可解析（不新增依赖的话用 `python3 -c "import yaml"` 亦可）；`node scripts/check-source-links.mjs --limit 5` 本地能跑；回执贴出三个 job 的 step 列表。

### S1-T6 ·（可选，需 D4 为是）`.codex/hooks.json` 去压缩

**背景。** 四个入口（`UserPromptSubmit`/`Stop` × `command`/`commandWindows`）是同一段约 1,500 字符、单字母变量的 `node --eval` 脚本：向上遍历 git 根、拒绝符号链接与路径逃逸、拒绝嵌套 `kb.config.json` 遮蔽、任何失败输出 `{"continue":true}`。`.agents/skills/curate-portable-knowledge-base/scripts/hook-bootstrap.mjs`（39 行）已实现其中一部分。`tests/portable-capture-security.test.mjs:378-379` 直接读取 `hooks.json` 里的 `command` 字符串来执行测试。

**做法。** 把单行脚本的完整逻辑（包括多级 git 根遍历与遮蔽检测，这部分 `hook-bootstrap.mjs` 目前没有）移入 `hook-bootstrap.mjs`；四个入口改为 `node -e "import('./.agents/skills/curate-portable-knowledge-base/scripts/hook-bootstrap.mjs').catch(()=>process.stdout.write('{\"continue\":true}\n'))"` 这类最短形式，但要保证 cwd 不是项目根时仍安全失败。**`tests/portable-capture-security.test.mjs` 一行不改**，全部通过才算完成；否则回退并输出阻塞回执。

---

## 4. 阶段 2 · 固本（分支 `codex/improve-s2`，预计 2 周）

阶段目标：数据层有类型、有单一事实源；加一个模块只需新建一个目录；测试不再钉死文案。前置：阶段 1 已合并。门禁：每任务 `npm run check`。

### S2-T1 · 数据层类型化，清零 typecheck 基线

**背景。** `app/` 里 23,319 行 `.mjs` 无类型，JSDoc 只在 `layout-utils.mjs` 出现；`tsconfig.json` 的 `include` 不含 `**/*.mjs`。消费方靠 `as` 断言：`app/(zh)/modules/[slug]/page.tsx:174-184` 连续四次；`BriefPrinciple`、`BriefDecision`、`BriefCloudHook`、`BriefEvidenceCard`、`BriefQaItem` 在该文件 `:26-82` 与 `inference-module-page.tsx:24-65` 各声明一遍；`QaItem`、`DeepDiveItem`、`DeepDiveBlock`、`SourceRef`、`ExtensionView`、`LearningPathModule` 也各有两份。

**做法。**
1. 新建 `app/content-types.ts`，声明并导出：`ModuleBrief`（15 个顶层键，形状以 `app/module-briefs-platform.mjs` 的 `ai-gateway` 为准）、`QaItem`、`EvidenceCard`、`DeepDiveBlock`、`DeepDiveItem`、`CloudHook`、`Principle`、`Decision`、`Curriculum`、`Learning`、`Source`、`Term`、`PublishedModule`、`EnglishModule`。
2. `tsconfig.json`：`include` 加 `**/*.mjs`，开 `checkJs: true`。这会暴露大量 `.mjs` 错误——先用 S0-T2 的 `--update` 把它们纳入基线，再逐文件清零。
3. 给注册表入口文件（`module-content-registry.mjs`、`module-publication.mjs`、`reference-content.mjs`、`terminology.mjs`、`knowledge-map.mjs`、`question-index.mjs`、`i18n/en/registry.mjs`、各 `module-briefs-*.mjs` 的导出）加 `/** @type {import("./content-types").ModuleBrief[]} */` 之类注释。
4. 删除重复的类型声明与 `as` 断言，改为 import `content-types.ts`。
5. 目标：`typecheck-baseline.json` 全部归零并删除该文件，`typecheck.mjs` 改为无基线模式（任何错误即失败）。

**验收。** `npx tsc --noEmit` 零错误；`git grep -c " as Brief\| as QaItem\| as SourceRef" app` 为 0；快照哈希不变。

### S2-T2 · 四层问答/课程/学习扩展回填进源文件，合并改为 id 驱动

**背景。** `app/module-brief-content.mjs:25-33` 把 `brief.qa`、`moduleQaExpansion[slug]`（`:29` 无 `?? []` 兜底）、`completionQa[slug]`、`moduleQuestionDepthExpansion[slug]` 四路拼接；`:37-155` 两段手写合并（`mergedSolutionPatternsBrief`、`mergedAiOpsBrief`）用 `["稳定归因", "优化有门"].includes(item.zh)` 这类中文匹配挑内容；`module-curriculum-content.mjs:13-15,36,136` 与 `module-learning-content.mjs:14-15,135,143` 同样四路合并；`module-completion-content.mjs` 一个文件喂三个消费者。

**做法。**
1. 写一次性脚本：对每个模块，把运行时合并后的最终 `qa`、`curriculum`、`learning`、`deepDives` 序列化，**按原顺序**写回该模块所在的 `module-briefs-*.mjs`（或 `module-content-agent-platforms.mjs`）；`solution-patterns` 与 `ai-ops` 的合并结果同样落成静态数据。
2. 删除 `module-qa-expansion.mjs`、`module-question-depth-expansion.mjs`、`module-completion-content.mjs`；`module-brief-content.mjs` 只剩注册与 `requireModuleBrief`；`module-curriculum-content.mjs`、`module-learning-content.mjs` 只剩按 slug 的静态映射。
3. **这是硬规则 1 的例外：允许移动正文，但不允许改一个字。** 证明方式：快照哈希不变（快照序列化的是合并后的注册表）。
4. 更新 `tests/rendered-html.test.mjs:2518` 等引用 `moduleQaExpansion` 的断言。

**验收。** 快照哈希与改前**完全相同**；`app/` 减少 ≥ 1,000 行；`grep -rn "includes(item.zh)" app` 为 0。

### S2-T3 · 每模块一个 manifest，注册表全部派生；路由注册表与文件系统对齐

**背景。** 以 `ai-gateway` 为例，新增一个模块要手改约 22 处：`module-publication.mjs` 内 5 张平行表（`moduleSpecs :7`、`moduleLegacyUndatedQuestionSetSha256 :35`、`moduleKnowledgeViews :61`、`focusedReadingModules :87`、`moduleQaCoverageTags :89`）、`knowledge-map.mjs:49`、`module-discovery.mjs:23`、`unified-brief-module-config.mjs:92`、`module-extension-views.mjs`、`question-field-kit.mjs`、`reference-content.mjs:2043`（`referenceShortTitles`）与 `:2068`（`additionalSourceIds`）、`knowledge-relations.mjs`、`english-update-dates.mjs`、`i18n/en/registry.mjs`、`i18n/english-pilot-module-page.tsx:164-536`（`englishUnifiedReaderConfigs`）。另外 `module-publication.mjs:13-14` 把 `mcp`、`a2a` 标为 `brief` 却各有专用页面，`app/(zh)/modules/[slug]/page.tsx:108-113` 因此多预渲染 2 个被遮蔽的页面，`:157-171` 还按 slug `await import()` 三个实现。

**做法。**
1. 新建目录 `app/modules/<slug>/manifest.mjs`（23 个），每个导出一个对象：`{ slug, titleId, layerNo, routeKind, introducedAt, updatedAt, requiredTerms, knowledgeView, readingProfile, visualProfile, brief, curriculum, learning, extensionViews, discovery, referenceShortTitle, additionalSourceIds, englishUpdatedAt, englishReaderConfig, unifiedBriefConfig, fieldKitEntries }`。用一次性脚本从现有分散文件生成，生成后删除脚本。
2. `module-publication.mjs`、`module-content-registry.mjs`、`knowledge-map.mjs` 的模块列表、`module-discovery.mjs`、`unified-brief-module-config.mjs`、`english-update-dates.mjs`、`reference-content.mjs` 的两张表、`i18n/en/registry.mjs` 的模块数组、`english-pilot-module-page.tsx` 的配置表，全部改为从 `app/modules/index.mjs`（`import.meta.glob` 不可用则显式列出 23 个 import）派生。
3. `routeKind`：把 `mcp`、`a2a`、`llm-inference` 改为 `dedicated`；`[slug]/page.tsx` 的 `generateStaticParams` 只产出 `brief` 模块；`:157-171` 的 `await import()` 分发删除，专用页面各自成为静态路由（`llm-inference` 新建 `app/(zh)/modules/llm-inference/page.tsx`）。
4. `docs/MODULE-BUILD-STANDARD.md` 第 340 行附近「只从发布注册表派生」的承诺改为描述 manifest 目录。

**验收。** 快照哈希不变；用一个假 slug 演示：新建 `app/modules/zzz-demo/manifest.mjs` 后 `npm run typecheck` 与首页渲染都能看到它，删除后恢复（演示后不要提交）；`grep -rn '"ai-gateway"' app --include=*.mjs --include=*.tsx | wc -l` 从 38 降到 ≤ 5。

### S2-T4 · 三个专用模块正文从 TSX 迁到数据

**背景。** `app/(zh)/modules/rag/page.tsx`（463 行）、`ai-agent/page.tsx`（632 行）、`prompt-engineering/page.tsx`（493 行）把 `conceptLinks`、`agentLoop`、`agentActions`、`promptPatterns`、`messageResponsibilities`、`techniqueLadder` 等内容当 TSX 常量写；`rag-content.mjs` 只导出 `ragQa`、`evidenceCards`、`ragDeepDives`、`ragLearningContent`，没有 `definition`、`position`、`principles`、`decisions`、`cloudHooks`、`criticalBoundary`。

**做法。** 把三个页面里的内容常量搬到各自 manifest 的 `brief` 字段，补齐 15 键结构（专用页面的额外结构以扩展字段保存）；页面只保留渲染。**允许移动，不允许改字。** 由于这些内容此前不在 `moduleContentRegistry` 里，快照会增加内容——回执要用 `--json` 的 diff 证明只有新增没有修改。

**验收。** 三个页面文件各 ≤ 200 行；快照 diff 只含新增键；`npm run check` 通过。

### S2-T5 · 渲染测试断言改为注册表驱动；设计语言测试改为测行为

**背景。** `tests/rendered-html.test.mjs` 1,329 条断言里 921 条是正则，451 行嵌入中文原文（例 `:293` `/讲清 AI 技术，[\s\S]*?心中有数，丝毫不慌/`）；只有 82 条从注册表构造。`tests/design-language-contract.test.mjs` 直接 `readFile` 读 `.tsx`/`.css` 源码文本（`:151,182,219,295-298`）。

**做法。**
1. 对每条嵌入中文原文的断言：如果该文案来自某个 `.mjs` 数据文件，改为 `assert.ok(html.includes(escapeHtml(registry.value)))`；如果文案硬编码在 `.tsx` 里，把文案提取到就近的 `*-copy.mjs`（中英各一）再按注册表断言。保留字面正则的只有结构性不变量：`<html lang>`、meta、canonical/hreflang、跳转链接、标题层级、`data-quality-section` 数量。
2. `design-language-contract.test.mjs`：把「源码里必须出现 X」改为「渲染后的 HTML 里 `data-module-hero="unified"` 元素存在且 class 来自 CSS Module」这类可观察断言；确实只能测源码的（例如禁止模块 CSS 覆盖 `--fb-chrome-*`）保留，但用 CSS 解析而不是正则。
3. 目标：`grep -c "[一-鿿]" tests/rendered-html.test.mjs` 从 754 降到 ≤ 100。

**验收。** 用例数不减少（当前 58）；改一句首页 Hero 文案（临时，不提交）不会导致任何断言失败，改回后再跑一遍；`npm run check` 通过。

### S2-T6 · 双语对齐全量运行；来源 kind 收敛；问答分面改为 intent

**做法。**
1. S1-T2 已让对齐断言对全部模块运行。本任务把 19 个 deferred 模块的「N 处不对齐」输出整理为 `docs/ENGLISH-BACKLOG.md`（按模块列出不对齐项，供用户安排英文补齐）。不改英文正文。
2. `app/reference-content.mjs` 的 `kind` 有 71 种写法，`app/source-freshness.mjs:3-7` 靠三条正则匹配。改为：`kind` 收敛到 ≤ 15 个枚举值，每个枚举在 `source-freshness.mjs` 里直接映射 `reviewCycleDays`；**允许修改 `kind` 字段值**（这是分类标签不是正文），映射表写进回执并保证每条来源的周期天数不变（用 `sources:report --json` 前后对比）。
3. `app/module-publication.mjs:89-186` 的 `moduleQaCoverageTags`（约 250 个被冻结为必需覆盖的 tag，355 题 288 个 tag、249 个只用一次）删除，相关测试改为断言每道题有 `intentId`（`app/question-field-kit.mjs` 已有 8 个 `intentDefinitions`）。`tag` 保留为自由标签。
4. `app/model-radar-data.mjs:66-74` 的指标四舍五入到源页面精度（1 位小数）。**允许修改这些数字的精度。**

**验收。** `sources:report --json` 前后每条来源的 `reviewCycleDays` 相同；快照哈希会变（kind 与雷达精度），回执用 diff 证明只有这两类变化；`npm run check` 通过。

---

## 5. 阶段 3 · 打磨（分支 `codex/improve-s3`，按需）

每项独立，可分别执行；每项结束 `npm run check` 通过、快照哈希不变（除非注明）。

| 编号 | 任务 | 关键文件 | 验收 |
|---|---|---|---|
| S3-T1 | `model-radar.css`、`home-refresh.css` 从两个 layout 移到各自页面 import | `app/(zh)/layout.tsx:3-7`、`app/(en)/layout.tsx:3-7`、model-radar 与首页路由 | 渲染 `/modules/ai-gateway` 的 HTML 里 stylesheet link 少 2 个；首页与雷达页样式不变（对比构建 CSS 选择器集） |
| S3-T2 | 用 `@layer` 把 `fieldbook-v2.css` 并入 `fieldbook-v3.css`，消除 69 个双重定义、20 个三重定义（`.callout`、`.topbar`、`.qaList` 等）与 78 处 `!important`；同时加深色模式 token（`globals.css:5-57` 的 `--fb-*` 体系加 `prefers-color-scheme: dark` 覆盖） | `fieldbook-v2.css`（1,348 行）、`fieldbook-v3.css`（3,368 行，`.fieldbookTheme` 前缀 271 次）、`globals.css` | `grep -c "!important" app/*.css` ≤ 10；v2 文件删除；6 个代表页面（首页、rag、ai-gateway、mcp、references、en 首页）在 1280 与 375 宽度下的截图由检查者人工比对 |
| S3-T3 | 抽 `SiteNav`、`SiteFooter` 组件替换 15 个页面里的手写 `className="topbar"` 与 `<footer>`；统一跳转链接目标为 `<main id="main-content">`；修 `ModuleSectionHeader` h2 直跳 h4 | 15 个含 `topbar` 的页面、`module-content-components.tsx:74`、`app/(zh)/modules/[slug]/page.tsx:134,146`、`unified-module-hero.tsx:164` | `grep -rn 'className="topbar"' app | wc -l` = 0（组件内 1 处除外）；渲染 HTML 无 h2→h4 跳级 |
| S3-T4 | `englishUnifiedReaderConfigs`（`english-pilot-module-page.tsx:164-536`）移入 manifest（S2-T3 已建）并与中文 `unifiedBriefConfig` 共用一个形状 | `english-pilot-module-page.tsx`、`app/modules/*/manifest.mjs` | `english-pilot-module-page.tsx` ≤ 500 行 |
| S3-T5 | 阅读模式按需渲染：`dense-module-reading-modes.tsx:217-230` 目前三个视图全渲染再隐藏。改为服务端只渲染默认视图，其余视图在切换时挂载；模块页最小字号提到 12px；点击目标 ≥ 32px | `dense-module-reading-modes.tsx`、相关 CSS | `/en/modules/rag` HTML ≤ 250 KB；375 宽度下 `min(font-size)` ≥ 12px；无 JS 时默认视图仍可读 |
| S3-T6 | 在独立分支试升 `vinext` 到 1.0.0-beta 系列与其余依赖 | `package.json`、`scripts/run-vinext.mjs` | `npm run check` 通过；渲染测试与体积预算通过；否则回退并写明失败点 |
| S3-T7 | `.agents/.../kb-tool.mjs`（2,402 行）拆为 `lib/` 模块；两个手写 JSON Schema 校验器（`scripts/lib/json-schema-lite.mjs:23`、`kb-tool.mjs:464`）合并为一个 | `.agents/skills/curate-portable-knowledge-base/scripts/` | `npm run test:portable` 通过；单文件 ≤ 600 行 |
| S3-T8 | `/questions` 分页或按模块懒加载，把 14,649 个 DOM 节点降到 ≤ 3,000 | `app/(zh)/questions/page.tsx`、`QuestionDirectoryShell` | 渲染 HTML ≤ 400 KB；无 JS 时仍能看到全部问题的短答（可用 `<details>` 分组或分页链接） |

---

## 6. 检查者验收协议

检查者对每个任务执行以下步骤，任一失败即退回。执行者应在提交前自己跑一遍。

### 6.1 通用检查（每个任务）

```bash
git fetch origin && git checkout <分支> && git log --oneline origin/main..HEAD
npm ci --ignore-scripts --no-audit --no-fund
npm run snapshot:content            # 与回执里的哈希比对
npm run check                        # 阶段 0；阶段 1 起为 check:fast + check
git diff origin/main..HEAD --stat -- \
  'app/module-briefs-*.mjs' app/module-content-agent-platforms.mjs app/rag-content.mjs \
  app/agent-content.mjs app/prompt-content.mjs 'app/i18n/en/modules/*.mjs' app/terminology.mjs
# 上一条必须为空，除非任务明确允许（S0-T6、S2-T2、S2-T4、S2-T6）
git diff origin/main..HEAD -- app/module-publication.mjs | grep -E '^[+-].*(updatedAt|addedAt|introducedAt)' 
# 上一条必须为空
git diff origin/main..HEAD --name-only | grep -E 'knowledge/private-inbox|external_reference|\.openai/hosting\.json'
# 上一条必须为空
```

### 6.2 任务专项检查

| 任务 | 检查者运行 | 期望 |
|---|---|---|
| S0-T1 | `node scripts/sources-report.mjs --now 2026-09-08 \| grep dify` | 状态 `stale` |
| S0-T1 | `grep -n 'freshness.status' tests/rendered-html.test.mjs` | 不再断言等于 `"fresh"` |
| S0-T2 | `npm run typecheck`；再 `echo 'const x: number = "a";' >> app/term-hint.tsx && npm run typecheck; git checkout app/term-hint.tsx` | 先 0 后非 0 |
| S0-T3 | `npm run build && node --test tests/page-budget.test.mjs`；`curl -s localhost:3000/en \| wc -c`（`npm run start` 后） | 通过；≤ 350,000 |
| S0-T4 | `npm run build && ls -la dist/client/assets/*.js \| awk '{print $5,$9}' \| sort -rn \| head -3` | 最大块 ≤ 250 KB |
| S0-T5 | 渲染 `/` 并 `grep -c 'hreflang='` | 2 |
| S1-T1 | `npm ls tailwindcss drizzle-orm` | empty |
| S1-T2 | `git ls-files knowledge \| wc -l`；`time npm run test:bilingual` | ≤ 20；≤ 60 秒 |
| S1-T3 | `time npm run check:fast` | ≤ 60 秒 |
| S1-T4 | 回执里每项的 grep 命令由检查者重跑 | 结果一致 |
| S1-T5 | 在 GitHub 上查看该分支的 Actions 运行 | `fast`、`full` 两个 job 绿 |
| S2-T1 | `npx tsc --noEmit` | 零错误 |
| S2-T2 | 快照哈希 | 与 `origin/main` 完全相同 |
| S2-T3 | `grep -rn '"ai-gateway"' app --include=*.mjs --include=*.tsx \| wc -l` | ≤ 5 |
| S2-T5 | 临时改 `app/(zh)/page.tsx` 一句 Hero 文案后 `npm run test:render` | 通过 |
| S3-* | 见第 5 节表格「验收」列 | — |

### 6.3 退回标准

- 回执缺字段、grep 证据缺失、快照哈希无解释地变化 → 退回。
- 为通过门禁删除或放宽了任务范围外的断言 → 退回。
- `git diff --stat` 里出现任务未列出的文件且回执未解释 → 退回。
- 依赖变化未在任务里授权 → 退回。

---

## 附录 A · 本手册引用的实测数据（2026-09-05，基线 4d7706a）

| 指标 | 值 |
|---|---|
| `npm run check` 耗时 / 结果 | 12 分 30 秒 / 通过（192 个用例） |
| `test:bilingual` 耗时 | 567 秒（65 个用例，两个用例各 92 秒与 170 秒） |
| `tsc --noEmit` 错误 | 121 |
| `app/` 行数 tsx / mjs / css | 12,376 / 23,319 / 9,854 |
| `knowledge/` tracked 文件 / 行数 | 203 / 69,958 |
| `localization-deferments.json` | 2,549,912 字节，57,535 行，Git 中 85 个版本 |
| 模块 / 问答 / 术语 / 来源 | 23 / 355 / 154 / 265 |
| 来源 30 / 60 / 90 天内到期 | 9 / 112 / 158 |
| 英文 deferred 模块 | 19 / 23 |
| 线上 `/` `/en` `/questions` HTML | 599 KB / 2,069 KB / 2,588 KB |
| 最大客户端 JS 块 | 849 KB（MCP，gzip 303 KB） |
| 每页全局 CSS 行数 / `!important` | 7,003 / 78 |

## 附录 B · 阶段 0 允许触碰的文件白名单

`tests/rendered-html.test.mjs`、`tests/page-budget.test.mjs`（新）、`scripts/*.mjs`（新建）、`scripts/run-vinext.mjs`、`scripts/lib/localization-contract.mjs`（仅 S0-T4 第 4 步）、`package.json`、`package-lock.json`、`tsconfig.json`、`typecheck-baseline.json`（新）、`.gitignore`、`worker/index.ts`、`build/sites-vite-plugin.ts`、`kb.config.json`（仅 S0-T2 第 1 步）、`knowledge/source-waivers.json`（新）、`knowledge/localization-deferments.json`（仅通过 0.5 节的命令）、`app/search-index.mjs`（新）、`app/deep-dive-representation.mjs`（新）、`app/i18n/chinese-page-metadata.ts`（新）、`app/module-representation-assessment.mjs`、`app/module-content-components.tsx`、`app/fieldbook-interactions.tsx`、`app/question-filter.mjs`、`app/question-index.mjs`、`app/home-search-visibility.mjs`（删除）、`app/(zh)/**/page.tsx`、`app/(en)/**/page.tsx`、`app/reference-content.mjs`（仅 S0-T6 的 `verifiedAt`）、`docs/MODULE-QUALITY-GATES.md`、`docs/CONTENT-MAINTENANCE.md`、`docs/REPOSITORY-WORKFLOW.md`、`AGENTS.md`、`README.md`，以及被删除的 `db/`、`drizzle/`、`drizzle.config.ts`、`examples/d1/`。

改动白名单之外的文件必须在回执「与手册不符之处」说明原因。
