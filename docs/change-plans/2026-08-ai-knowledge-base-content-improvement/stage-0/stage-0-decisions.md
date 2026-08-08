# Stage 0 候选级决策留痕

按 D-012 用户指示全量自主执行，候选级裁决委托主 Agent 于 2026-08-05 完成：

- recommendedAction 分布：absorb 24 / research 11 / expression-only 7 / watch 1 / no-op 20
- 执行规则：absorb/expression-only 进入对应阶段写入；research 只做研究（动态/法规面先核验）；no-op/reject/watch 只留痕。
- 硬门：legal/security 面未核验前 hold（C-009/C-015/C-023/C-033~C-036/C-051）；行业结论缺专家时按教学蓝图（Stage 4）。
- 候选级裁决登记在 `candidate-matrix.json`：absorb/expression-only 且已落地者 `finalAction=implement`（38 项）；research 类写入稳定方法者 `implement`、结论保持 hold 者 `research`（C-036）；no-op/reject/watch 只留痕（22 no-op + 1 watch）；C-028 因契约冻结 `deferred`。
- 当前已识别的 358 条 occurrence 均有候选映射；但输入覆盖账仍有 492 项 pending/blocked，因此该映射不能被解释为全量 screening 完成。

## 范围与 provenance 说明（2026-08-05 独立 Review 后修订）

- 对照库原始提取物（`stage-0/extracted/`）已移出 Git 跟踪并忽略：它不在 Stage 0 规范产物清单内，且与 D-004 范围声明冲突；本机保留用于复现研究，详细说明见 `stage-0/README.md`。
- 候选级历史裁决见 `candidate-matrix.json`；`npm run stage0:validate` 只校验结构与内部引用，不纳入日常 `npm run check`，也不证明 492 项待检查输入已经完成 screening。
