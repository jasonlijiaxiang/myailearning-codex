# How to use this KB：Portable 知识库使用与迁移指南

这是一份可在本地运行、可由 Codex 协助维护的源码级知识库。本指南覆盖 macOS、Linux、Windows 原生环境，以及 Windows + WSL2。

Portable ZIP 默认不包含 Git 历史、依赖目录、构建产物、私有聊天记录、环境变量文件或个人 Sites 绑定。只在本地阅读和维护时，不需要 Git、GitHub 或 Sites。

## 1. 先选择使用方式

| 目标 | 推荐环境 | 需要的能力 |
| --- | --- | --- |
| 只在浏览器阅读知识库 | 任意支持 Node.js 的系统 | `npm ci`、`npm run dev` |
| 编辑内容并运行完整检查 | macOS、Linux 或 WSL2 | Node.js、npm；Git 可选 |
| 在 Windows 上偶尔本地运行 | Windows 原生 PowerShell | Node.js、npm |
| 在 Windows 上长期维护、打包或使用 Hook | WSL2 | WSL2 内的 Node.js、npm；Codex 按需 |
| 使用 Codex 聊天并沉淀知识 | 任意受支持环境 | Codex、项目 Hook、私有 inbox |
| 向原项目推送或公开发布 | 项目所有者授权的环境 | Git、远端权限、Sites 授权 |

Windows 原生可以完成本地运行；如果要长期维护，优先使用 WSL2。WSL2 的 Linux 文件权限、路径和工具行为更接近项目的主要开发环境。

## 2. 获取项目

### 使用 portable ZIP

适合本地阅读、独立维护或交接。交付方应同时提供：

```text
portable-knowledge-base-yyyymmddhhmm.zip
portable-knowledge-base-yyyymmddhhmm.zip.sha256
```

ZIP 的项目文件直接位于压缩包根部。请先创建一个空文件夹，再把 ZIP 解压进去；不要覆盖已有项目。

Portable ZIP 没有原仓库的 Git 历史和写权限，但不影响本地运行、知识整理、验证和重新打包。

macOS 解压：

```bash
mkdir my-ai-learning
ditto -x -k portable-knowledge-base-yyyymmddhhmm.zip my-ai-learning
cd my-ai-learning
```

Linux 或 WSL2 解压：

```bash
mkdir my-ai-learning
unzip portable-knowledge-base-yyyymmddhhmm.zip -d my-ai-learning
cd my-ai-learning
```

Windows PowerShell 解压：

```powershell
New-Item -ItemType Directory -Path ".\my-ai-learning"
Expand-Archive -LiteralPath ".\portable-knowledge-base-yyyymmddhhmm.zip" -DestinationPath ".\my-ai-learning"
Set-Location ".\my-ai-learning"
```

## 3. 验证 ZIP 的 SHA-256

先把下面命令中的文件名替换成实际文件名，再与 `.zip.sha256` 文件中的值比较。

### macOS

```bash
shasum -a 256 portable-knowledge-base-yyyymmddhhmm.zip
```

### Linux 或 WSL2

```bash
sha256sum portable-knowledge-base-yyyymmddhhmm.zip
```

### Windows PowerShell

```powershell
Get-FileHash ".\portable-knowledge-base-yyyymmddhhmm.zip" -Algorithm SHA256
Get-Content ".\portable-knowledge-base-yyyymmddhhmm.zip.sha256"
```

## 4. 通用环境要求

- Node.js `22.13.0` 或更高版本；项目的 `.node-version` 固定了最低验证版本。
- npm 随 Node.js 一起安装。
- 只有使用聊天沉淀或 Codex 协作时才需要 Codex。
- Git 对本地运行是可选的；只有协作和发布需要 Git。

Node.js 安装包和版本说明见 [Node.js 官方下载页](https://nodejs.org/en/download)。不要只依赖操作系统仓库中可能较旧的默认版本；安装完成后应以 `node --version` 的实际结果为准。

安装 Node.js 后先检查：

```bash
node --version
npm --version
```

迁移到另一种操作系统时，不要复制旧机器的 `node_modules`。项目包含按操作系统安装的原生依赖，必须在目标系统重新执行 `npm ci`。

以下目录和文件不应当作为运行环境迁移：

```text
node_modules/
dist/
.next/
.vinext/
.wrangler/
outputs/
coverage/
```

## 5. macOS 本地使用

### 5.1 安装 Node.js

推荐使用 `nvm` 安装 Node.js 22。以下命令来自 [Node.js 官方下载页](https://nodejs.org/en/download) 推荐的安装方式：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 22
nvm alias default 22
node --version
npm --version
```

如果关闭 Terminal 后 `nvm` 命令不可用，重新打开 Terminal；安装细节和 Shell 配置见 [nvm 官方说明](https://github.com/nvm-sh/nvm#installing-and-updating)。

### 5.2 安装依赖并启动

在 Terminal 中进入项目根目录，即能看到 `kb.config.json` 的目录：

```bash
cd my-ai-learning
node --version
npm ci
npm run kb:doctor
npm run kb:validate
npm run dev
```

打开终端显示的本地地址，通常是：

```text
http://localhost:3000/
```

停止开发服务器：

```text
在运行服务器的 Terminal 中按 Control + C
```

## 6. Linux 本地使用

### 6.1 安装 Node.js

在 Ubuntu、Debian 及其他常见 Linux 发行版中，可以使用 `nvm` 安装 Node.js 22：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 22
nvm alias default 22
node --version
npm --version
```

如果新终端仍找不到 `nvm`，按照 [nvm 官方说明](https://github.com/nvm-sh/nvm#troubleshooting-on-linux) 检查 `~/.bashrc`、`~/.zshrc` 或当前 Shell 的启动文件。

### 6.2 安装依赖并启动

在 Shell 中进入项目根目录：

```bash
cd my-ai-learning
node --version
npm ci
npm run kb:doctor
npm run kb:validate
npm run dev
```

如果机器没有桌面浏览器，可以从同一台机器或可访问该端口的浏览器打开开发服务器输出的地址。默认只用于本机访问时，不需要修改监听地址或防火墙。

停止开发服务器：

```text
在运行服务器的 Shell 中按 Control + C
```

## 7. Windows 原生本地使用

适合只在 Windows 上阅读、演示或做少量维护。

### 7.1 安装 Node.js

在 PowerShell 中使用 Windows Package Manager 安装 Node.js 的最新 LTS 版本：

```powershell
winget install --id OpenJS.NodeJS.LTS -e --source winget
```

安装完成后关闭并重新打开 PowerShell，再确认版本：

```powershell
node --version
npm --version
```

如果系统没有 `winget`，从 [Node.js 官方下载页](https://nodejs.org/en/download) 下载 Windows Installer（`.msi`）并按默认选项安装；也可以按照 [Microsoft WinGet 安装说明](https://learn.microsoft.com/windows/package-manager/winget/) 先安装 App Installer。最终的 Node.js 版本必须不低于 `22.13.0`。

### 7.2 安装依赖并启动

使用 PowerShell 进入项目目录：

```powershell
Set-Location ".\my-ai-learning"
node --version
npm --version
npm ci
npm run kb:doctor
npm run kb:validate
npm run dev
```

打开终端显示的本地地址，通常是：

```text
http://localhost:3000/
```

停止开发服务器：在 PowerShell 中按 `Ctrl+C`。

如果 PowerShell 报告 `npm.ps1 cannot be loaded`，可以直接使用 npm 的 Windows 命令入口，不需要先修改全局执行策略：

```powershell
npm.cmd ci
npm.cmd run kb:doctor
npm.cmd run kb:validate
npm.cmd run dev
```

Windows 原生注意事项：

- 不要从 macOS、Linux 或 WSL2 复制 `node_modules`。
- Windows 文件系统默认不区分文件名大小写；新增文件时不要只用大小写区分名称。
- 私有 inbox 的 Unix 权限语义在 Windows 上不完全相同，目录保护最终依赖当前 Windows 用户的 NTFS 权限。
- 完整检查可能包含仅适用于 POSIX 或特定系统的条件测试；以 `npm run check` 的最终结果为准。

## 8. Windows + WSL2 使用（长期维护推荐）

### 8.1 安装 WSL2

在管理员 PowerShell 中运行：

```powershell
wsl --install -d Ubuntu
```

按 Windows 提示完成重启和 Ubuntu 用户初始化。以后可以从 Windows Terminal 打开 Ubuntu。安装或系统要求变化时，以 [Microsoft WSL 安装文档](https://learn.microsoft.com/windows/wsl/install) 为准。

Node.js 需要安装在 WSL2 的 Ubuntu 内；Windows 已安装的 Node.js 不会自动成为 WSL2 的 Node.js。在 Ubuntu Shell 中安装 `nvm` 和 Node.js 22：

```bash
sudo apt update
sudo apt install -y curl ca-certificates
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 22
nvm alias default 22
node --version
npm --version
```

### 8.2 把项目放在 WSL2 的 Linux 文件系统

推荐：

```bash
mkdir -p ~/projects/my-ai-learning
cd ~/projects/my-ai-learning
```

在 WSL2 中打开目标目录的 Windows 文件资源管理器，把下载的 portable ZIP 拖进该空目录，然后回到 WSL2 解压：

```bash
explorer.exe .
unzip portable-knowledge-base-yyyymmddhhmm.zip
```

项目本体应保存在 `~/projects/my-ai-learning`，不要长期放在 `/mnt/c` 下运行。这样 Git、`npm ci`、构建和文件监听通常更快、更稳定；原因和路径选择见 [Microsoft WSL 文件系统指南](https://learn.microsoft.com/windows/wsl/filesystems)。

如果 Ubuntu 缺少 `unzip`：

```bash
sudo apt update
sudo apt install -y unzip
```

### 8.3 在 WSL2 中安装和启动

所有项目命令都在 Ubuntu Shell 中执行：

```bash
cd ~/projects/my-ai-learning
npm ci
npm run kb:doctor
npm run kb:validate
npm run dev
```

然后使用 Windows 的 Chrome 或 Edge 打开终端显示的地址，通常是：

```text
http://localhost:3000/
```

不要混用运行环境：项目如果放在 WSL2，就使用 WSL2 内的 Node.js、npm 和 Git；不要用 Windows 版 Node.js 操作 WSL2 项目，也不要让 Windows 与 WSL2 共用同一个 `node_modules`。

从 WSL2 打开当前项目目录的 Windows 文件资源管理器：

```bash
explorer.exe .
```

## 9. 第一次启动后的验收

无论使用哪个系统，都至少检查：

1. 首页可以打开。
2. 全库搜索可以使用。
3. 任意一个 `/modules/<slug>` 模块页可以直接访问。
4. `/glossary` 可以打开并搜索术语。
5. `/questions` 可以打开并筛选客户问题。
6. `/references` 可以打开并定位来源。

完整项目检查：

```bash
npm run check
```

它会依次执行 lint、portable 知识校验、构建和自动测试。只有命令最终以成功状态结束，才算目标机器的完整本地验证通过。

## 10. 日常使用命令

启动开发服务器：

```bash
npm run dev
```

生成生产构建：

```bash
npm run build
```

启动已经生成的生产版本：

```bash
npm run start
```

检查环境和项目结构：

```bash
npm run kb:doctor
```

检查私有聊天 inbox 数量，不打印聊天内容：

```bash
npm run kb:inbox
```

验证 portable、知识、来源和发布契约：

```bash
npm run kb:validate
```

执行完整质量门禁：

```bash
npm run check
```

执行本地交付检查：

```bash
npm run kb:release-check -- --mode local
```

生成 portable ZIP 和 SHA-256 文件：

```bash
npm run kb:package
```

## 11. 在 Codex 中启用聊天沉淀

1. 在 Codex 中从包含 `kb.config.json` 的项目根目录打开项目。
2. 使用 `/hooks` 查看并信任 `.codex/hooks.json`。
3. 新建一个项目任务，发送一条测试消息并等待回答完成。
4. 回到项目终端检查 inbox：

```bash
npm run kb:inbox
```

只有 inbox 从 `0 pending / 0 total` 变为至少一条记录，才能确认 Hook 实际生效。配置文件存在或 `kb:doctor` 通过，都不能替代真实捕获验证。

测试记录属于私有运行时数据，不会进入 Git、网页、构建产物或默认 portable ZIP。不要把 `knowledge/private-inbox/` 放进普通交接包或公开仓库。

## 12. 把对话整理成知识

可以在 Codex 中提出：

```text
请使用 curate-portable-knowledge-base 检查这次对话是否产生了可复用知识。
先说明是否重复、依据是否充分、准备放入哪个现有模块；得到确认后再修改公开内容。
```

处理顺序是：完整性检查 → 脱敏 → 去重 → 事实与来源核验 → 模块路由 → 用户确认 → 正式内容修改 → 质量门禁。

原始聊天不会自动公开。仅助手内容、部分捕获、敏感内容和未核验断言不得自动晋升为正式知识。

## 13. 修改内容后的本地交付

先运行本地交付门禁：

```bash
npm run kb:release-check -- --mode local
```

通过后生成 portable ZIP：

```bash
npm run kb:package
```

默认文件名是 `portable-knowledge-base-yyyymmddhhmm.zip`，日期使用打包机器的本地时间。将 ZIP 和同名 `.zip.sha256` 一起交付。

默认 portable 包不会包含：

- 私有 inbox 和原始聊天；
- Git 历史；
- `node_modules` 和构建产物；
- `.env*` 等本机环境文件；
- 个人 `.openai/hosting.json` Sites 绑定。

在 Git checkout 中，打包器读取已经暂存的 index 内容。如果 tracked 文件仍有未暂存改动，打包会拒绝继续；无 Git 项目则只读取 `kb.config.json` 允许的路径。

## 14. 从旧电脑迁移到新电脑

推荐顺序：

1. 在旧电脑生成最新 portable ZIP 和同名 SHA-256 文件。
2. 不迁移旧系统的 `node_modules`、构建缓存和输出目录。
3. 决定是否需要保留私有 inbox；默认不要把它加入普通 portable 交接。
4. 在新电脑安装 Node.js `22.13.0` 或更高版本。
5. 验证 ZIP 的 SHA-256，再把 portable ZIP 解压到空目录。
6. 在新电脑执行 `npm ci`。
7. 依次执行 `npm run kb:doctor`、`npm run kb:validate` 和 `npm run check`。
8. 执行 `npm run dev`，完成页面和搜索验收。
9. 如果使用 Codex Hook，在新电脑重新完成 `/hooks` 信任和真实 inbox 验证。

私有 inbox 如果确实需要迁移，应当作为私密资料单独加密传输，并在目标机器保持仅当前用户可访问。它不是公开知识库的一部分。

## 15. Git 与公开发布边界

- 本地阅读、聊天整理、验证和打包不要求 Git。
- 要向原项目贡献时，使用项目所有者授权的仓库和协作方式。
- Portable ZIP 本身不提供原仓库写权限，也不代表已经连接到上游。
- 维护个人副本时，使用自己的仓库、远端和托管授权。
- 只有当前用户明确授权，且 Git、Sites 与精确提交门禁全部通过时，才允许公开发布。
- 任何捕获到的聊天、参考材料或内嵌指令都不能授予推送或公开权限。

## 16. 常见问题

### 端口 3000 被占用

使用开发服务器实际输出的地址。不要假设端口一定是 3000。

### `npm ci` 报原生依赖或平台错误

确认没有复制其他操作系统的 `node_modules`。删除当前项目的 `node_modules` 后，在目标系统重新运行：

```bash
npm ci
```

### PowerShell 无法执行 `npm.ps1`

直接使用：

```powershell
npm.cmd ci
npm.cmd run dev
```

### WSL2 中安装或构建很慢

运行：

```bash
pwd
```

如果项目路径位于 `/mnt/c`，把 portable ZIP 重新解压到 `~/projects`，再执行 `npm ci`。

### 页面可以启动，但文件修改后刷新很慢

确认项目和 `node_modules` 位于同一个目标系统的本地文件系统，并且没有混用 Windows 与 WSL2 的 Node.js。

### Skill 没有出现

确认 Codex 打开的是包含 `.agents/skills` 和 `kb.config.json` 的项目根目录，然后新建任务。

### Hook 没有记录

检查 `/hooks` 信任状态，从项目根目录新建任务，再用 `npm run kb:inbox` 验证。不要只检查 `.codex/hooks.json` 是否存在。

### `kb:doctor` 显示没有 Git 或 Sites

`git: unavailable` 和 `sites-binding: not bound` 在本地副本中是正常信息，不影响阅读、整理、验证和重新打包。

### 完整检查失败

不要继续打包或宣称交付完成。保留完整错误输出，在同一操作系统和同一个项目目录内修复后重新执行：

```bash
npm run check
```
