# 2026-08-08 合并就绪记录

状态：`merge-candidate-local-gates-passed`。本记录只证明当前最终树已通过本地硬化与复核；尚未合并 `main`、推送或发布 Sites。

## 1. 合并判断

- 当前最终树可以进入 clean-squash 与最终分支验证。
- 不允许直接 fast-forward 或普通 merge 原专项分支。旧提交历史曾包含完整 91 题答案快照、中间矩阵、失实 review 文档和本机启动配置；这些对象必须从待推送历史中排除。
- clean-squash 必须以 `origin/main@d58403b6e939cb3f24f936caa763ea448098f748` 为唯一父提交，并与本记录对应的最终树完全一致。
- Stage 0 screening 未完成，不作为本次内容正确性或合并完成的证据。其 507 个输入中 15 个已排除、492 个仍为 `pending`/`blocked`；保留的 Stage 0 文件只承担历史研究线索和结构化映射作用。

## 2. 本轮关闭的阻塞

- 中文问题目录与模块页锚点：focused 中文页改为渲染全部正式问题，`solution-patterns#qa-20` 等目录链接均有真实目标；回归检查覆盖全目录。
- 英文单线边界：focused 英文页继续只展示前 5 题，英文问题目录中第 6 题以后链接到真实存在的模块 `#qa` 区域，不伪造精确问题锚点；`?module=` 使用精确 slug 服务端筛选该模块全部目录题目。
- Reference 与 Claim：Dify 许可/版本边界和中国个人信息匿名化边界改用可支持结论的一手来源；同一模块分组不再同时展示同 URL 的新旧版本，当前 source 记录可按模块分组复用，旧稳定 sourceId 只保留深链别名。
- 读者页面清理：公开 Reference 不再展示“本轮中文”“避免静默改变英文”等维护说明。
- 英文更新时间：恢复各模块可由 Git 历史核验的真实日期，不再统一回退到 2026-07-23。
- 本地化 v2：逐模块拆分中文/英文基线，审计会从声明提交重新归档并重建状态；19 个活动延期精确登记 500 个对象差异，RAG 与提示词工程 2 个 dedicated 模块保持严格对齐。
- 本地化 renderer provenance：按模块从真实 brief/dedicated 入口递归解析本地可见 import 闭包，覆盖专用页和 flagship lab；每个基线与候选固化精确文件清单，历史审计再从声明提交重算 canonical 闭包并要求逐项相等，同时拒绝绝对路径、`..`、非法扩展、符号链接和项目外文件，避免未执行入口假阳性或伪造清单自证。
- 本地化状态机：`ready` 必须具备四阶段完整、schema 合法、`verdict=PASS` 且 `blockClass=NONE` 的真实审校集合；`closed` 必须通过匹配的 closure receipt、不可变 promoted commit 和原子 baseline promotion，禁止自动生成 PASS 或用任意字段伪造关闭。
- Stage 0：递归校验 schema 的 `enum`、`items`、required 与嵌套结构；修复两个 occurrence 的重复 owner，并加入候选、映射、source occurrence 与 coverage ledger 的交叉检查。日常 `npm run check` 不再把未完成的 Stage 0 当完成门禁。
- 测试内存：渲染测试复用同一服务 worker，不再为每个路由动态导入一套随机 ESM 图；删除 6 GB heap 覆盖。
- 移动端表格：模块表格容器使用横向滚动，不再被更具体的 `overflow: hidden` 裁剪；质量门和回归检查同步更新。
- Git 清洁：删除尾随空格、本机绝对临时路径、完整目标答案快照、不必要的中间产物、旧自证 review 与 `.claude/launch.json`。

## 3. 可复现验证

### 自动门禁

- `npm run check`：通过。
  - lint：通过。
  - 双语/本地化测试：41/41 通过。
  - 构建：通过。
  - 主测试集合：80/80 通过。
  - 默认 Node heap 下最大 RSS：`1,092,452,352` bytes；未使用 `--max-old-space-size=6144`。
- `node scripts/audit-localization-deferments.mjs`：21/21 模块通过；19 个 `DEFERRED/NOT_ALIGNED` 与 2 个 `ALIGNED` 状态均与账本一致。
- `npm run audit:localization:remote`：通过，当前所有基线 SHA 均可从远端跟踪分支解析；未来关闭流程在本地门禁后由 Sites release gate 对精确推送提交重做此项。
- `node scripts/generate-bilingual-review-records.mjs --check`：84/84 不可变审校记录通过。
- `node scripts/stage0-validate.mjs`：结构验证通过，同时明确报告 492 个输入仍待检查。
- `node --test tests/stage0-validator.test.mjs`：6/6 通过，包括非法数组元素、枚举、额外字段、重复 owner、映射不一致和 screened 反向账缺失的失败用例。
- `git diff --check`：通过。

### 真实浏览器复核

- 视口：390 × 844。
- `/modules/model-landscape`：`.tableWrap` 的 `clientWidth=342`、`scrollWidth=840`、`overflow-x=auto`；根文档 `clientWidth=390`、`scrollWidth=390`，没有整页横向溢出。
- `/en/questions?module=solution-patterns`：服务端只渲染本模块 19 题；前 5 题链接到精确问题锚点，第 6 题起链接到 `/en/modules/solution-patterns#qa`。
- `/en/modules/solution-patterns#qa`：实际只渲染 5 个英文问题锚点，延迟导航后 `#qa` 区域可见，不存在死锚。
- 本轮不把开发态 HMR 日志作为“生产环境无警告”证明；正式运行时判定以干净构建、渲染测试和上述页面实测为准。

## 4. clean-squash 与发布前置

1. 先把当前最终树保存在本地专项分支，禁止推送该旧历史分支。
2. 从精确 `origin/main` 创建 `codex/` 前缀的干净分支，对专项最终树执行 squash 合并并生成单一提交。
3. 验证 clean 提交的父提交就是上述 `origin/main`，且 clean 分支树与专项最终树逐字节一致。
4. 验证待推送对象中不含 `target-practice-list.json`、`candidate-matrix.draft.json`、旧 Stage 5 review、自证记录或 `.claude/launch.json`。
5. 在 clean 分支默认 heap 下再次运行 `npm run check`、Stage 0 显式结构测试、`git diff --check` 和敏感/绝对路径扫描。
6. 只推送 clean 分支。任何 Git 推送后，必须用刚推送的精确提交运行 `npm run sites:release-check`，保存并部署同一提交的 Sites 版本，轮询到成功后再交付公开地址。

## 5. 已知非阻塞事项

- Stage 0 的 492 个 pending/blocked 输入仍需未来独立完成逐单元 screening；不得把当前结构验证解释为 coverage 完成。
- 19 个中文先行/共享 renderer 受影响模块仍处于英文延期状态；未来英文同步必须逐模块提交真实候选、四阶段审校与 closure receipt，不得在本次合并中自动关闭。
