# Stage 3B 批次回执：国内模型与 MaaS 决策面

状态：`historical-implementation-note`（合并判断以当前代码、来源、Claim、本地化 v2 登记与[最终合并记录](../stage-5/merge-readiness-2026-08-08.md)为准）

## 1. 批次信息

- stageId：`stage-3`
- batchId：`stage-3b`
- 批准范围：C-006、C-008、C-009、C-027、C-050
- 前置 receipt：`stage-3a`（03a-china-triage-receipt.md）
- 主责模块：Model Landscape；相关模块：ai-infra-compute（C-050 所有者）
- Solution Patterns：本批复核后无净新增（采购决策面完整方法由 Model Landscape 单主模块持有，避免第二份注册表）
- 研究日期：2026-08-05

## 2. 候选处置

| 候选 | 建议 | 处置 | 说明 |
| --- | --- | --- | --- |
| C-006 | research | `implemented` | 国内模型平台选型决策面写入 Model Landscape（八决策面深挖 + 决策） |
| C-008 | research | `research-required → hold` | 只写“按任务切片同条件比较”的方法；四强领先类分层结论为动态基准事实，未核验前不进入正文，也不新增 Claim |
| C-009 | research | `implemented`（稳定方法） | 开放权重 ≠ 开源已有原则；补证据卡与“为什么付钱”问答；具体许可证现状保持 hold |
| C-027 | research | `implemented` | 开源社区版 vs 商业托管/企业版差异写入问答（权限、审计、SLA、升级治理、部署责任） |
| C-050 | research | `implemented`（稳定决策面） | ai-infra-compute 新增“不做固定排位”决策：工作负载可运行性、生态成熟度、供应连续性、单位有效作业成本 |

## 3. 决策面（写入 Model Landscape）

1. 区域与交付硬约束。
2. API、托管、专属实例与私有化。
3. 企业采购与合同路径。
4. 数据、训练使用、日志与留存政策。
5. 模型目录、版本、弃用与迁移。
6. 配额、限流、SLA 与支持责任。
7. 评测、回滚、多模型路由与供应连续性。
8. 供应商退出与客户沉淀资产。

## 4. 动态 Claim 清单（必须进入 Claim 的事实）

以下事实在正式引用前必须形成带官方来源、核验日期与复核日期的原子 Claim，默认 30 天复核；本批未新增未核验的动态 Claim：

- 国内模型平台目录（模型 ID、版本、能力声明）。
- 价格、计费档位、缓存与批量折扣。
- 配额、限流阈值与 SLA 定义。
- 弃用时间线与迁移兼容性。
- 数据处理、训练使用与日志留存政策。
- 芯片/加速器供应状态与交付周期。

## 5. 高风险审查记录

| finding | 风险领域 | 严重度 | 影响对象 | 处置 |
| --- | --- | --- | --- | --- |
| 国产 vs 国际模型“谁领先”结论 | 事实/市场 | high | Model Landscape 问答 | `hold`：只写同条件评估方法，动态领先结论不进入正文 |
| 具体许可证现状（DeepSeek 等） | 法律 | high | Model Landscape | `hold`：只写稳定方法（读许可证原文、法务确认边界），不写具体许可证结论 |
| 平台价格/配额/版本 | 事实 | medium | Model Landscape 深挖 | `accepted-with-boundary`：只写“必须进入 Claim 或合同核验”，不写具体数字 |
| 私有化=合规的误推 | 法律 | medium | Model Landscape 原则 | `accepted-with-boundary`：明确“私有化不自动等于合规” |

## 6. 交付物

- Model Landscape：2 条原则、1 条决策、1 个八决策面深挖、3 道问答、1 张证据卡、1 个课程章、1 个学习 lab。
- ai-infra-compute：1 条国产加速器选型决策。
- Reference：本批无新增来源（复用 openai-models/google-models/anthropic-models/nist-genai-profile/finops-unit-economics/osi-open-source-ai-definition-1-0）。
- Claims：本批无新增原子 Claim（无已核验动态事实可写；动态事实清单见第 4 节）。
- 中文单线延期记录已合并为 `knowledge/localization-deferments.json` 中每模块一条活动记录；旧批次 ID 只保留在 `workItemIds` 追溯。

## 7. 受影响对象与验证

- 修改文件：`app/module-briefs-foundations.mjs`、`app/module-briefs-platform.mjs`、`app/module-curriculum-content.mjs`、`app/module-learning-content.mjs`、`app/module-publication.mjs`、`knowledge/localization-deferments.json`。
- 英文 authored、有效内容与逐模块真实日期必须保持已登记的基线；当前验证结果统一记录在[最终合并记录](../stage-5/merge-readiness-2026-08-08.md)。

## 8. 开放问题（交接 Stage 4/后续）

- C-008 分层结论与国产平台动态事实：保持 hold，待官方来源核验后以原子 Claim 引入。
- C-009 具体许可证结论：待法务/专业复核。
- C-050 芯片供应与生态成熟度：按当期官方文档与合同核验，不做固定排位。
