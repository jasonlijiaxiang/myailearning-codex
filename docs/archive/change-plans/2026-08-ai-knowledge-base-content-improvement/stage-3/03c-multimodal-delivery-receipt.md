# Stage 3C 批次回执：多模态内容交付闭环

状态：`historical-implementation-note`（合并判断以当前代码、来源、Claim、本地化 v2 登记与[最终合并记录](../stage-5/merge-readiness-2026-08-08.md)为准）

## 1. 批次信息

- stageId：`stage-3`
- batchId：`stage-3c`
- 批准范围：C-015、C-037
- 前置 receipt：`stage-3a`、`stage-3b`
- 主责模块：Multimodal；相关模块：Security、Solution Patterns
- 研究日期：2026-08-05

## 2. 候选处置

| 候选 | 建议 | 处置 | 说明 |
| --- | --- | --- | --- |
| C-037 | absorb | `implemented` | 多模态内容交付链写入 Multimodal（八步深挖：素材授权→生成版本→自动/人工审核→标识→发布→撤回更正→事件证据→批量/实时/公开差异门） |
| C-015 | research | `implemented`（稳定方法）/ 具体侵权结论 `hold` | 两层兜底写入问答（商业安全定位模型 + 发布前人审留痕与合同权责）；侵权责任与赔偿边界保持 hold，由专业人员确认 |

## 3. 五状态门（本批核心）

1. 技术生成成功：只证明资产产生。
2. 内容审核通过：证明内容可接受。
3. 标识和分发要求满足：显式/隐式标识、传播核验与凭证绑定。
4. 业务批准发布：有权限角色执行并留痕。
5. 发布后的持续责任：撤回、更正、申诉、事件处置与证据保留。

## 4. 交付链（写入 Multimodal）

- 输入素材来源、授权与溯源。
- 生成、编辑与版本记录。
- 自动与人工审核。
- 生成内容标识（显式/隐式、传播核验）。
- 发布与分发渠道。
- 撤回、更正与申诉。
- 事件处置与证据保留。
- 批量生成、实时交互与公开发布的差异门。

## 5. 高风险审查记录

| finding | 风险领域 | 严重度 | 影响对象 | 处置 |
| --- | --- | --- | --- | --- |
| 侵权责任与赔偿边界（C-015） | 法律 | high | Multimodal 发布责任问答 | `hold`：只写两层兜底方法与证据要求，具体责任结论交专业人员 |
| “生成成功=可发布”混同 | 法律/业务 | high | Multimodal 五状态问答、Solution Patterns 验收决策 | `accepted-with-boundary`：五状态独立验收，实时性不能跳过审核与标识 |
| 素材授权边界 | 法律 | high | Multimodal 原则 | `accepted-with-boundary`：缺授权素材不进商用输出，合同边界交专业人员 |
| 内容凭证=事实/合规 | 事实 | medium | Multimodal 证据卡 | `accepted-with-boundary`：凭证验证声明与绑定，不证明内容真实或已合规 |
| 篡改取证=法律结论 | 法律 | medium | Security 事件取证问答 | `accepted-with-boundary`：技术取证与责任结论分开 |

## 6. 交付物

- Multimodal：2 条原则、1 个八步交付闭环深挖、2 道问答、1 张证据卡、1 个课程章、1 个学习 lab。
- Security：1 道事件取证与止损问答。
- Solution Patterns：1 条五状态验收决策。
- Reference：本批无新增来源（复用 `nist-genai-profile`、`c2pa-2-4`、`china-ai-content-labeling-2026-08-05`、`nist-sp-800-61r3`）。
- Claims：本批无新增原子 Claim（无未核验的动态事实写入）。
- 中文单线延期记录已合并为 `knowledge/localization-deferments.json` 中每模块一条活动记录；旧批次 ID 只保留在 `workItemIds` 追溯。

## 7. 受影响对象与验证

- 修改文件：`app/module-briefs-app-protocol.mjs`、`app/module-curriculum-content.mjs`、`app/module-learning-content.mjs`、`knowledge/localization-deferments.json`。
- 英文 authored、有效内容与逐模块真实日期必须保持已登记的基线；当前验证结果统一记录在[最终合并记录](../stage-5/merge-readiness-2026-08-08.md)。

## 8. 开放问题（交接 Stage 4/后续）

- C-015 具体侵权责任、赔偿与免责条款：保持 hold，待法务/专业复核。
- 素材授权与肖像/品牌权利：按合同与专业意见确认，知识库只提供流程与证据要求。
- 撤回后的副本与缓存清理：按渠道能力与义务核验，不承诺统一时限。
