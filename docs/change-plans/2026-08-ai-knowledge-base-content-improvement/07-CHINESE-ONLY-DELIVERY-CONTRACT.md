# 中文单线交付与英文延期契约

状态：`in-review`

## 1. 目的

用户已确认本轮只修改中文，英文正文、问答、证据和学习路径留到未来独立任务。

当前工程门禁默认中英文始终同步：

- `scripts/audit-english-modules.mjs` 要求中英文 QA 数量、顺序、证据 `sourceId` 和 evidence card 一致。
- `scripts/generate-bilingual-review-records.mjs` 把中文正式内容和英文内容一起计算 Review 哈希。
- `tests/bilingual-pilot.test.mjs` 强制问题与证据关系完全对齐。
- `tests/rendered-html.test.mjs` 让中英文模块共享 `app/module-publication.mjs` 的 `updatedAt`。
- 个别英文页面运行时仍可能读取中文 canonical 内容；只检查英文文件字节不变不足以证明英文有效内容未变化。

本契约用于支持真实、可审计、可关闭的中文单线发布。它只允许修改共享同步契约、验证逻辑和日期元数据，不撰写或改动英文内容，也不降低未延期模块的质量门禁。

## 2. 核心不变量

必须同时满足：

1. `app/i18n/en/**` 和 `app/en/**` 的英文 authored 内容不变。
2. 英文页面解析后的有效内容和最后真实英文日期不变。
3. 未延期模块继续通过原有严格双语门禁。
4. 已延期模块明确显示内部状态 `DEFERRED/NOT_ALIGNED`，不能显示新的双语 PASS。
5. 中文变化必须精确登记到稳定对象 ID，不允许整模块静默豁免。
6. 既有英文 PASS 和历史 Review 记录保持不可变。
7. 未登记中文漂移、英文有效内容变化或日期误报必须使检查失败。
8. 延期状态不得展示到读者页面。
9. 未来英文同步完成后可以关闭延期并恢复严格对齐，不留下永久例外。

## 3. 中文变化分类

### 3.1 中文取用元数据

例如：

- 问题意图。
- 客户口语。
- 现场核心层级。
- 中文时间路径。
- 中文筛选和搜索投影。

这些不改变正式问题答案和证据，应保存在中文专用元数据层，不进入英文语义 Review 哈希，也不创建延期。

### 3.2 中文语义内容

例如：

- 正文机制、边界和判断变化。
- 既有中文问答改写。
- 课程、实战、深挖或证据说明变化。
- `sourceId`、Claim 或术语关系变化。
- 中文模块 `updatedAt` 刷新。

这些需要 `semantic-deferment`；中文日期变化还需要 `date-decoupling`。

### 3.3 中文结构变化

例如：

- 新增、删除或重排中文问答。
- 新增、删除或重排证据卡。
- 改变问答和证据的 `sourceId` 关系。
- 改变共享 schema 或稳定对象关系。

这些需要 `structural-deferment`。如果英文运行时直接依赖对应中文对象，还必须先完成 `shared-runtime-decoupling`；无法在不改变英文有效内容的前提下解耦时，本轮冻结该结构变化。

## 4. Locale 需求与门禁状态

Stage 0 和后续工作包分开记录：

- `localeRequirement`：候选需要的能力。
  - `none`。
  - `date-decoupling`。
  - `semantic-deferment`。
  - `structural-deferment`。
  - `shared-runtime-decoupling`。
- `localeGate`：只有 `pass` 或 `blocked`。
- `localeGateReceipt`：证明所需能力已经实现并通过测试的回执 ID。

不得把“需要延期”误写成门禁已经通过。没有有效 `localeGateReceipt` 的中文语义候选只能做只读研究，不能写正式内容。

## 5. 两类英文完整性哈希

### 5.1 英文 authored 内容哈希

`enAuthoredContentHash` 覆盖英文专属正文、问答、证据、术语文案和学习路径文件，证明用户明确延期的英文内容没有被编辑。

### 5.2 英文有效内容哈希

`enEffectiveContentHash` 覆盖英文页面实际解析后的规范化语义对象，包括：

- 英文模块正文、问答、证据卡、深挖、课程和实战。
- 英文运行时引用的共享或中文 canonical 对象。
- 英文使用的来源 ID、术语 ID、路由和模块元数据。
- 英文页面显示的真实更新时间。

共享组件实现可以变化，但如果导致英文解析结果变化，`enEffectiveContentHash` 必须失败。这样可以捕捉“英文文件未改、英文页面却因共享依赖而变化”的情况。

对于仍直接读取中文问答或证据的英文模块：

- 默认冻结相关中文对象的新增、删除、重排和语义改写。
- 只有先完成运行时解耦，并证明解耦前后英文有效内容完全一致，相关候选的 locale gate 才能通过。
- 不能只放宽双语测试而保留运行时耦合。

## 6. 永久语言日期契约

模块发布时间继续只在唯一发布注册表 `app/module-publication.mjs` 维护：

- `updatedAt` 表示中文正式内容最后真实更新时间。
- 增加持久的英文 locale 日期字段，例如 `englishUpdatedAt`，表示最后真实英文同步日期。
- 英文页面始终读取英文日期，不只在延期期间特殊处理。
- 契约启用时，用最后一个严格双语基线的真实日期初始化英文日期。
- 未来英文同步只更新英文日期，不修改中文日期。
- 无法证明真实英文日期时不伪造日期。

延期登记只保存英文日期基线摘要，不成为第二份公开日期来源。

自动检查必须证明：

- 修改中文 `updatedAt` 不改变英文页日期。
- 未同步英文不能显示新中文日期。
- 英文同步关闭延期后，新的真实英文日期能够独立更新。

## 7. 延期登记

计划新增：

- `knowledge/localization-deferments.json`。
- `knowledge/schemas/localization-deferment.schema.json`。

该文件只记录同步状态和审计证据，不保存英文内容，也不是第二份模块注册表。

每项至少包含：

| 字段 | 说明 |
| --- | --- |
| `defermentId` | 稳定延期 ID |
| `moduleSlug` | 正式模块 slug |
| `sourceLocale` | 固定为 `zh-CN` |
| `targetLocale` | 固定为 `en` |
| `status` | `deferred`、`ready-for-english-review`、`closed` |
| `openedAt` | 延期开始日期 |
| `openedFromCommit` | 最后严格双语基线提交 |
| `decisionId` | 用户确认的中文先行决定 |
| `reason` | 本轮延期原因 |
| `localeRequirements` | 本模块实际使用的 locale 能力 |
| `candidateIds` | Stage 0 候选 ID |
| `affectedObjects` | 对象级变更清单 |
| `baselineZhHash` | 最后真实双语 Review 对应的中文哈希 |
| `baselineEnAuthoredHash` | 最后真实英文 authored 内容哈希 |
| `baselineEnEffectiveHash` | 最后真实英文有效内容哈希 |
| `baselineReviewIds` | 既有真实 Review 记录 |
| `baselineEnglishUpdatedAt` | 英文真实日期的审计快照 |
| `localeGateReceipt` | 延期与日期门回执 |
| `closureCriteria` | 未来关闭延期的精确条件 |
| `closedAt` | 关闭日期；未关闭时为空 |
| `closureReviewIds` | 关闭延期时的新真实英文 Review 记录 |

### 7.1 对象级差异

`affectedObjects` 每项至少记录：

- 稳定对象 ID 和对象类型。
- `added`、`modified`、`deleted` 或 `reordered`。
- 基线对象哈希；新增对象为空。
- 当前对象哈希；删除对象为空。
- 关联 `sourceId`、`claimId` 或术语 ID。
- 对应候选和批准范围。

对象范围至少覆盖实际涉及的正文 section、QA、证据卡、深挖、课程、实战、来源、Claim、术语和知识关系。这样检查不仅知道“中文变了”，还能证明变化没有超出声明范围。

延期只登记真实受影响模块，禁止为了方便对全部 21 个模块建立宽泛例外。

## 8. 双语检查行为

### 8.1 未延期模块

保持现有严格检查：

- 中英文问答数量、顺序和证据关系一致。
- Evidence card 关系一致。
- Review 哈希和稳定 ID 对齐。
- 中英文日期分别真实且契约完整。

### 8.2 已延期模块

检查结果必须明确为 `DEFERRED/NOT_ALIGNED`，并同时满足：

- 当前英文 authored 哈希等于基线。
- 当前英文有效内容哈希等于基线。
- 既有英文 PASS 和 Review 记录未改写。
- 当前中文变化全部落入 `affectedObjects`。
- 未登记的新增、删除、修改或重排会失败。
- 英文内部 ID、来源、路由和页面仍有效。
- 英文日期等于最后真实英文日期。
- 延期记录、候选、用户决定和 locale receipt 可追溯。

`npm run check` 可以因为“延期契约有效”而成功退出，但输出必须明确该模块尚未完成双语语义对齐。

不得：

- 跳过整个英文模块检查。
- 把旧英文对新中文标成 PASS。
- 为延期中文重新生成四阶段 PASS 记录。
- 用整模块通配符掩盖未登记差异。

## 9. 问答与证据策略

为减少未来同步成本：

- 优先改写现有中文对象，不轻易增加结构。
- 只有产生独立客户决策价值时才新增整道问题。
- 新问题使用稳定中文 ID 和 `addedAt`。
- 新证据卡只有在承担不可替代的可引用事实时新增。
- 新 `sourceId` 继续进入集中 Reference；英文模块不会自动获得英文来源说明。
- 所有新增对象进入 `affectedObjects` 和未来英文交接包。

如果结构延期或运行时解耦尚未通过，本轮必须冻结 QA、证据卡数量、顺序与 `sourceId` 关系。两种策略不能在实施中临时切换。

## 10. Locale Gate Receipt

每次通过中文语义写入门时生成结构化回执，至少包含：

- `receiptId`、生成日期和基线提交。
- 适用模块和 `localeRequirements`。
- 延期记录 ID。
- authored、effective 和对象级基线摘要。
- 日期隔离验证。
- 运行时共享依赖审计。
- 执行的测试命令和结果。
- 已知限制和阻塞对象。

候选只有引用有效回执才能得到 `localeGate=pass`。回执对应的基线、schema 或共享依赖发生变化后自动失效，必须重新验证。

## 11. 预计工程影响

可能新增：

- 延期登记与 schema。
- 读取和校验延期状态的共享模块。
- 英文有效内容解析与哈希工具。
- 对象级中文差异清单与校验。
- 延期、日期、共享依赖和关闭流程测试。

可能修改：

- `app/module-publication.mjs` 的永久英文日期字段。
- `scripts/audit-english-modules.mjs`。
- `scripts/generate-bilingual-review-records.mjs`。
- `tests/bilingual-pilot.test.mjs`。
- `tests/rendered-html.test.mjs`。
- 英文共享渲染器的日期选择逻辑。
- 直接读取中文内容的英文运行时适配层，仅在不改变英文有效内容时允许。

这些只修改同步、验证和共享运行契约，不修改英文正文、问答、证据卡、术语文案、来源文案或学习路径。

## 12. 实施顺序

1. 审计 21 个英文模块的真实运行时依赖。
2. 冻结最后真实双语基线、对象清单、Review 记录、两类英文哈希和日期。
3. 在唯一发布注册表实现永久语言日期隔离。
4. 建立延期 schema、空登记表和状态机。
5. 让未延期模块继续通过完全相同的严格检查。
6. 用测试夹具模拟中文语义变化、结构变化和未登记变化。
7. 实现 `DEFERRED/NOT_ALIGNED`，并禁止生成虚假 PASS。
8. 对共享运行时依赖选择“安全解耦”或“本轮冻结”。
9. 验证英文 authored 内容、有效内容和日期均未变化。
10. 运行 `npm run check`。
11. 用户 Review 契约、差异和测试结果。
12. 契约批准并形成有效 receipt 后，才开始 Stage 2 中文语义写入。

## 13. 必测场景

- 未延期模块保持严格对齐。
- 延期模块只改一个已声明中文正文对象。
- 延期模块新增一个已声明中文问题。
- 修改中文但遗漏 `affectedObjects` 时失败。
- 修改英文 authored 内容时失败。
- 共享依赖导致英文有效内容变化时失败。
- 中文日期变化但英文日期保持不变。
- 无效或过期 locale receipt 时失败。
- 延期模块尝试生成新双语 PASS 时失败。
- `deferred → ready-for-english-review → closed` 状态迁移。

## 14. 未来英文同步与关闭

未来独立英文任务：

1. 从延期记录生成中文差异包。
2. 使用一手来源和技术机制独立撰写英文，不逐句回译。
3. 同步问题、证据、来源说明和英文日期。
4. 重新执行完整英文专业审校。
5. 生成新的真实 Review 记录与两类英文哈希。
6. 将状态改为 `ready-for-english-review`，通过最终对齐门后改为 `closed`。
7. 保留 `closedAt`、关闭哈希和 Review ID 作为审计历史；closed 记录不再提供运行时例外。
8. 运行 `npm run check` 并作为独立任务发布。

未来英文交接包至少包含：

- `moduleSlug`、`candidateIds` 和 `affectedObjects`。
- 基线与当前中文对象哈希。
- 最后真实英文 authored 与有效内容哈希。
- 新增、修改、删除和重排分类。
- `sourceId`、`claimId`、术语和结构变化。
- 需要独立完成的英文审校阶段。
- 关闭延期的精确验收条件。

本轮只记录稳定 ID 和中文差异摘要，不写英文草稿。

## 15. 验收标准

- 英文 authored 内容零修改。
- 英文有效内容与最后真实基线一致。
- 未延期模块门禁强度不降低。
- 已延期模块显示真实延期状态，没有虚假 PASS。
- 历史 Review 记录不可变。
- 所有中文语义差异都登记到对象级。
- 中文和英文日期不互相误报。
- 未登记漂移、共享依赖泄漏或英文变化会失败。
- 延期可以在未来英文同步后关闭并恢复严格对齐。
- `npm run check` 通过。
- 用户确认 locale gate 设计和测试结果。

如果本契约产生经用户确认的工程变更，只在 `codex/ai-knowledge-base-content-improvement` 形成经验证的本地检查点和 locale receipt；不合并 `main`、不推送、不发布。最终合并和发布统一遵守总体计划的分支合并门。

## 16. 明确拒绝的方案

- 关闭 `npm run test:bilingual`。
- 从 `npm run check` 移除英文检查。
- 为新中文内容直接重生成英文 PASS 哈希。
- 在英文模块写占位句假装同步。
- 只检查英文文件字节，不检查英文有效内容。
- 只放宽测试，不解决英文运行时读取中文内容的问题。
- 让英文页继续显示中文最新日期。
- 对全部模块建立永久或通配延期。
- 删除 closed 记录而丢失审计历史。
- 把延期状态展示到读者页面。
