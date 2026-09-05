# Stage 0 研究产物说明

状态：`incomplete`。当前输入账共 507 项，其中 15 项有明确排除理由，492 项仍为 `pending`/`blocked`，尚未形成逐单元 screening 证据。

## 使用边界

- 本目录只保存研究线索、映射和历史候选判断，不是正式内容源、第二份模块注册表或合并完成证明。
- 对照库原始提取物不进入 Git；对照库 91 道练习的完整答案快照也不保存。正式内容必须回到当前库的模块、Reference 与 Claim 契约。
- `scripts/stage0-validate.mjs` 会递归检查 schema、数组元素、枚举、引用、唯一性和当前的未完成状态；它不把 `pending` 输入机械标为已检查，也不进入日常 `npm run check`。
- `candidate-matrix.json` 当前为 `draft`。C-N01～C-N10 尚缺逐题当前库精确位置，保持 `unassessed/research`，不得用 `null` 或空位置伪装为 covered。

## 规范与支持性产物

- `candidate-matrix.json`：63 个候选的结构化历史矩阵。
- `source-coverage.json`：输入清单与实际 screening 状态。
- `source-occurrences.json`、`occurrence-candidate-map.json`：已识别 occurrence 的引用映射；映射完整不等于源输入 screening 完成。
- `lineage-evidence-index.json/.md`、`stage-2-5-routing-pack.json/.md`：支持性研究索引。
- `review-summary.md`：明确记录当前 incomplete 状态与剩余工作。

只有完成 492 项逐单元检查、补齐 covered 候选的稳定位置并由独立复核确认后，才能把 Stage 0 提升为完成状态。
