# AI Knowledge Base 对照提升计划

## 目录用途

本目录保存 2026 年 8 月启动的 `jasonlijiaxiang/ai-knowledge-base` 对照提升工作的计划、设计、决策与阶段 Review 留痕。

本目录不是：

- 第二份模块注册表；正式模块仍由 `app/module-publication.mjs` 统一登记。
- 第二份问答或来源台账；正式问答与证据仍由现有内容注册表、Reference 和 Claim 契约维护。
- 模块打磨批次调度器；正式批次计划仍只维护在 `knowledge/module-polish/plan.json`。
- 读者页面内容源；这里的编辑说明、实施计划和维护记录不得展示到公开页面。

## 当前状态

| 项目 | 状态 |
| --- | --- |
| 总体方向 | 已确认 |
| 中文优先、英文延期 | 已确认 |
| 第 0 阶段计划 | 已确认 |
| 第 1～5 阶段计划 | 已完整细化，联合 Review 中 |
| 中文单线交付契约 | 已完整细化，联合 Review 中 |
| 内容实施 | 未开始 |
| 当前工作分支 | `codex/ai-knowledge-base-content-improvement` |
| Git 提交、推送与 Sites 发布 | 不适用于当前计划阶段 |

## 基线

- 当前知识库审计基线：`671072cae7bb3ffcde366713eb421e65c2e9cbc1`
- 对照知识库审计基线：`jasonlijiaxiang/ai-knowledge-base@100ca761fec3e55ceea01609d01f66b0c05802dc`
- 对照目标：吸收对方真正净新增的现场备战、中国交付、诊断式教学和方案方法，不回流当前库已经输出给对方的知识工程机制。

正式执行任一阶段前必须重新核验当前 `HEAD`、远端状态和工作区；如果基线漂移，应先更新差异判断。

## Git 分支策略

- `main` 是正式版本分支。
- 本专项所有计划、研究、内容与测试只在 `codex/ai-knowledge-base-content-improvement` 完成。
- 中间阶段只形成本地检查点，不推送、不发布，不提前合并 `main`。
- 全部阶段完成后，先交付专项分支相对 `main` 的完整合并包，由用户亲自合并或明确授权合并。
- 合并后的 `main` 才是正式发布候选，并使用同一精确提交推送和发布 Sites。
- 工作分支不会自动删除。

## 文档索引

| 文档 | 用途 | 状态 |
| --- | --- | --- |
| [`00-MASTER-PLAN.md`](00-MASTER-PLAN.md) | 总体目标、阶段边界、实施顺序和全局门禁 | Review 中 |
| [`01-STAGE-0-GAP-MATRIX-PLAN.md`](01-STAGE-0-GAP-MATRIX-PLAN.md) | 第 0 阶段差异矩阵详细设计 | 已确认 |
| [`02-STAGE-1-FIELD-KIT-PLAN.md`](02-STAGE-1-FIELD-KIT-PLAN.md) | 第 1 阶段中文现场备战层与学习路径 | Review 中 |
| [`03-STAGE-2-STABLE-CONTENT-PLAN.md`](03-STAGE-2-STABLE-CONTENT-PLAN.md) | 第 2 阶段稳定内容小批次 | Review 中 |
| [`04-STAGE-3-CHINA-DELIVERY-PLAN.md`](04-STAGE-3-CHINA-DELIVERY-PLAN.md) | 第 3 阶段中国交付专项 | Review 中 |
| [`05-STAGE-4-INDUSTRY-TRANSFER-PLAN.md`](05-STAGE-4-INDUSTRY-TRANSFER-PLAN.md) | 第 4 阶段跨行业迁移验证 | Review 中 |
| [`06-STAGE-5-HARDENING-RELEASE-PLAN.md`](06-STAGE-5-HARDENING-RELEASE-PLAN.md) | 第 5 阶段内容硬化、验证与发布 | Review 中 |
| [`07-CHINESE-ONLY-DELIVERY-CONTRACT.md`](07-CHINESE-ONLY-DELIVERY-CONTRACT.md) | 中文先行、英文延期时的检查与日期契约 | Review 中 |
| [`DECISIONS.md`](DECISIONS.md) | 用户确认过的范围、顺序和例外决定 | 持续维护 |

第 0 阶段计划已经确认。根据用户最新要求，第 1～5 阶段和中文单线横向契约已经一次性细化并进入联合 Review；文档完整不代表尚未确认的阶段可以开始实施。

第 0 阶段真正执行后，候选差异矩阵及其 Review 结果也归档在本目录，但它们只记录研究决策，不成为正式内容源。

## Review 与执行规则

1. 第 1～5 阶段和横向契约本轮联合 Review；实施仍严格按阶段和小批次推进。
2. 所有阶段计划 Review 完成前，不修改公开正文。
3. 进入实施后，每个内容批次最多涉及三个模块；只读研究可以并行，公开内容由主 Agent 串行整合。
4. 每个实施批次开始前冻结 Git 基线、候选路由、范围和关键文件摘要；发现无关改动、漂移或 owner 冲突时暂停。
5. 研究授权、写入确认和正式发布确认分开记录。
6. 计划、调研、no-op 和未确认草稿不触发 Git 提交、推送或 Sites 发布。
7. 阶段确认只形成专项分支检查点；用户最终确认合并后，合并后的正式变更必须在同一任务中完成检查、`main` 推送和 Sites 发布。

## 本轮语言范围

本轮只更新中文内容：

- 不修改 `app/i18n/en/**`。
- 不撰写、翻译或审校英文正文、问答和学习路径。
- 只记录未来可能需要同步的稳定模块 ID、问题 ID 和术语 ID。
- 共享数据结构必须向后兼容，现有英文页面必须继续通过回归检查。
- 不允许英文页面因为共享元数据而错误显示为已经同步到最新中文内容。

未来英文同步将作为独立计划处理。

## 文档状态约定

每份阶段文档使用以下状态之一：

- `draft`：正在起草。
- `in-review`：等待或正在用户 Review。
- `approved`：计划已确认，但尚未执行。
- `in-progress`：阶段已经开始执行。
- `completed`：阶段交付物与验收均已完成。
- `blocked`：存在明确阻塞条件。

状态变化和用户决定统一记录在 `DECISIONS.md`，避免只存在于聊天上下文。
