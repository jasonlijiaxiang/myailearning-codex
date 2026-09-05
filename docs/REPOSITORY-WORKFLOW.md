# 仓库分支、跨设备与唯一生产 Site 操作手册

本文只供维护者和协作 Agent 使用，不进入读者页面。目标是让 GitHub 保存完整源码与协作历史，同时让公开地址始终只有一个正式版本。

## 1. 不变契约

- `main` 是唯一生产分支，`origin/main` 是正式源码事实源。
- `.openai/hosting.json` 绑定的现有 Sites 项目是唯一公开项目；不为任务分支、设备或预览创建第二个正式 Site。
- 非 `main` 分支可以推送做 checkpoint、跨设备同步或可选审查，但绝不发布 Sites。
- 每次 `main` 推送后，在同一任务中从实时 `origin/main` 的精确提交生成发布候选并部署；新部署失败时保留旧站，不把任务标记完成。
- Git 分支是公开源码面。原始聊天、私有候选、秘密、个人信息、本机路径、运行时文件和未核验断言不得进入任何分支。

## 2. 什么时候直接修改 `main`

只有以下条件全部满足时才直接修改 `main`：

1. 范围明确且只解决一个问题；
2. 风险低、容易回滚；
3. 能在一个短会话内完成；
4. 不需要多设备、多轮研究或独立审查；
5. 完成后立即愿意公开；
6. 开始前工作区干净，且本地 `main` 已与 `origin/main` 同步。

典型例子是错字、不承载证据的单个内部导航失效链接、局部无争议文案或很小的样式修正。Reference 来源 URL、外部证据链接和事实范围变更仍使用任务分支，并同步复核证据关系。任何一项不满足，就创建任务分支。

## 3. 什么时候创建任务分支

以下情况使用从最新 `origin/main` 创建的 `codex/<topic>` 短生命周期分支：

- 聊天整理仍需脱敏、去重、判断或证据核验；
- 一个 topic、名词或链接还在研究，是否吸收尚未确定；
- 修改多个模块，或触及术语、Reference、Claims、发布注册表和其他共享文件；
- 新模块、路由、依赖、Schema、设计系统、测试或发布流程变化；
- 任务需要跨设备、多轮完成或可选审查；
- 实验可能被放弃，或结果尚未准备公开。

分支按任务划分，不按设备划分。同一个任务换设备继续原分支；新设备并不等于新分支。不同 topic 或不同交付目标使用不同分支。

## 4. 三种内容输入怎样进入源码

### GPT 对话

`私有捕获 → 完整性与隐私检查 → 脱敏去重 → 候选知识 → 来源核验 → 确定模块归属 → 任务分支 → 正式内容`

聊天摘要不是公开证据。只整理但未确认公开的结果保留在私有候选或人工脱敏工作摘要中，不提交 Git。

### Topic 或名词

先搜索现有术语、模块、问答和主要归属。优先补充现有模块，不因单次输入建立薄页面。只有满足新模块的术语、机制、边界、问答、证据、Reference、路由、自动检查和人工 QA 门槛后，才加入正式发布注册表。

### 链接

把链接视为发现线索，先核验发布者、原始来源、版本、日期、适用范围和外推边界。复用或新增稳定 `sourceId`，并同步检查受影响的正文、问答、证据卡、Claims 和 Reference；证据不足时不修改公开内容。

## 5. 标准操作

### 开始小修

```bash
git fetch --prune origin
git switch main
git pull --ff-only origin main
git status --short --branch
```

完成修改后运行 `npm run check`，提交并推送 `main`，随后执行第 7 节的完整发布链。

### 开始任务分支

```bash
git fetch --prune origin
git switch main
git pull --ff-only origin main
git switch -c codex/topic-name
```

需要换设备或保存 checkpoint 时：

```bash
git add path/to/changed-file
git commit -m "chore: checkpoint topic-name"
git push -u origin codex/topic-name
```

checkpoint 必须可解释、无私密输入且不包含无关文件；它不会触发 Sites 发布。

私有 inbox、私有候选和本机材料不是 checkpoint，不能通过公开 Git 同步。需要中途换设备时，在原设备先完成隐私复核并把可公开结果晋升为正式源码；否则由用户在新设备重新提供原始材料或允许同步的任务上下文，并重新完成核验。

### 在另一设备继续同一任务

```bash
git fetch --prune origin
git switch codex/topic-name
git pull --ff-only
git status --short --branch
```

若本地还没有该分支：

```bash
git switch --track origin/codex/topic-name
```

不要让两台设备同时持有同一分支的未推送修改。不要使用普通 `git pull` 制造意外 merge，也不要 force-push `main`。

## 6. 完成任务分支

1. 确认范围只包含本任务；
2. 吸收最新 `origin/main`，解决冲突后重新检查；
3. 运行定向测试、`npm run check` 和任务需要的人工复核；
4. 只移动代码不改内容的工程任务，前后各跑一次 `npm run snapshot:content` 记录全站内容注册表的 SHA-256 快照，哈希必须相同，作为「正文未变」的机器证明；
5. 以 fast-forward、rebase 或 squash 的线性历史整合进本地 `main`；
6. 再确认工作区干净、提交可回滚且没有私有内容；
7. 只推送 `main` 作为正式发布动作；
8. 第 7 节发布成功后删除已吸收的本地和远端任务分支。

共享注册表、术语、Reference、Claims 和公开主视图采用单写者整合。两个任务触及同一共享所有者文件时，先完成并发布一个，再让另一个更新基线；不要自动 stash、reset 或覆盖。

## 7. 唯一正式发布链

```text
npm run check
→ commit 到 main
→ push origin main
→ 确认本地 main = 实时 origin/main
→ npm run sites:release-check
→ 保存同一 commit_sha 的 Sites 版本
→ 部署到现有项目
→ 轮询 succeeded
→ 确认最新 Sites source SHA = origin/main
→ 打开唯一公开地址
```

`sites:release-check` 必须在 `main` 上运行，并且本地分支、remote、upstream 和实时远端 SHA 分别严格等于 `main`、`origin`、`refs/heads/main` 和本地提交。任务分支即使与自己的 upstream 完全一致，也不能生成生产候选。

若 `main` 已推送而构建、保存版本或部署失败：

- 保留当前公开旧版本；
- 不再追加无关改动，也不创建第二个 Site；
- 记录失败步骤、本地 / 远端提交和可复用候选；
- 内容未变化时重试同一提交，内容变化时创建新提交并从检查重新开始；
- 公开部署成功前不宣布任务完成。

## 8. 分支清理与回滚

- 只删除已经进入 `main` 且公开部署成功的任务分支。
- 先用祖先关系、diff 或已有 merge / squash 证明确认内容已吸收；无法证明的历史分支先保留。
- 删除任务分支不删除提交历史；生产回滚在当前 `main` 上用 `git revert` 形成新的可审计提交，再重新执行检查、推送和唯一正式发布链。不得直接部署旧 SHA，也不得重写 `main` 历史。
- 定期运行 `git fetch --prune origin` 和 `git worktree prune` 清理已删除远端引用及失效 worktree 元数据；不要删除仍存在的真实 worktree 或未整合改动。

## 9. 给 Codex 的推荐指令

- “只整理这段聊天，不修改、不发布。”
- “评估这个 topic 应放在哪里，只做研究。”
- “核验这个链接，暂不吸收。”
- “继续远端 `codex/<topic>` 分支，不创建新分支。”
- “把已确认内容吸收到现有模块；通过检查后整合到 `main` 并发布唯一 Site。”
- “只发布实时 `origin/main`；若提交不一致就停止。”
