# HDATSF TeamAI Test

TeamAI 的**被管理项目**示例：接入 TeamAI 插件，从管理端同步团队技能，并把项目状态与成员使用情况回传给看板。

配套管理仓：[`hdatsf/teeamAITestManage`](https://github.com/hdatsf/teeamAITestManage)

## 它演示了什么

- 被管理项目自动接入控制平面（`teamai register`）
- 一条命令同步/更新团队技能（`teamai sync`）
- 版本与校验和锁定（`.teamai/lock.json`）
- 技能使用上报由 **agent 的真实行为**驱动：Kimi Code hook 在读取技能文件时自动上报，`teamai use` 把“读取 + 上报”合成一个动作
- Git 拉取后自动同步（可选 hooks）
- 管理端按成员、项目、技能、来源聚合使用情况

## 快速开始

### 1. 先启动管理端

两个仓库并排克隆：

```bash
git clone https://github.com/hdatsf/teeamAITestManage.git
git clone https://github.com/hdatsf/hdatsfTeamAITest.git
```

在管理仓：

```bash
cd teeamAITestManage
npm install
npm run dev
```

看板打开 <http://127.0.0.1:5173>。

### 2. 接入并同步技能

在**本仓**根目录：

```bash
npm run teamai:install   # 从控制平面下载插件到 .teamai/bin
npm run teamai:sync      # 拉取技能到 .teamai/skills
npm run teamai:hooks     # 一次性：git pull/checkout 后自动同步
npm run teamai:status    # 确认全部 current
npm run teamai:skills    # 查看本地技能清单
```

同步成功后，管理端「项目」页会出现 `hdatsfTeamAITest`，「技能库」会显示各项目的版本覆盖情况。

### 3. 在 agent 里使用技能

推荐让 agent 直接运行 `teamai use`：它打印技能内容并同时上报，读取与记录是一次原子操作。

```bash
npm run teamai:use -- code-review
npm run teamai:use -- api-design --user alice
```

还可以安装 Kimi Code 的自动上报 hook（一次性、用户级，写入 `~/.kimi-code/config.toml`）：

```bash
npm run teamai:agent-hooks
```

安装后，agent 用 `Read` 工具读取 `.teamai/skills/<slug>/SKILL.md` 时由 `PostToolUse` hook 自动上报，每个会话每个技能记一次，失败不阻塞 agent。移除：

```bash
npm run teamai:agent-hooks-remove
```

> hook 只存在于用户级配置，无法随项目下发；新会话启动后生效。`teamai track` 仍保留，仅用于事后补录或第三方 agent 兜底。

看板每 15 秒自动刷新，「使用情况」页会显示成员、技能热度、项目分布，以及每条流水的来源（Agent 自动 / CLI / 手动补录）。

### 4. 一键演示

```bash
npm run teamai:demo
```

等价于执行一次 `sync` 和一次 `use`。

## 目录结构

```
.
├── .teamai/
│   ├── config.json          # 控制平面地址、项目 ID、接入令牌
│   ├── bin/teamai.mjs       # 管理端分发的插件（勿手改）
│   ├── skills/<slug>/SKILL.md  # 同步下来的团队技能
│   └── lock.json            # 已安装版本与 SHA-256（生成物）
├── scripts/
│   ├── install-teamai.mjs   # 安装/升级插件
│   └── demo.mjs             # sync + use 演示
├── src/                     # 示例业务代码
├── test/
└── AGENTS.md                # AI 助手使用团队技能的约定
```

## 技能如何更新

1. 在管理端「技能库」发布新版本（或在管理仓 `skills/*.md` 修改后重新播种）。
2. 本项目执行 `npm run teamai:sync`。
3. 插件对比远端 `sha256`，只重写变化的 `SKILL.md`，更新 `lock.json`。
4. 同步事件回传，管理端立即显示新版本与采用率。

也可以安装 Git hooks，在 `git pull` / `git checkout` 后自动同步：

```bash
npm run teamai:hooks
```

## 配置

`.teamai/config.json`：

| 字段 | 说明 |
| --- | --- |
| `serverUrl` | 控制平面地址，默认 `http://127.0.0.1:4310` |
| `projectId` | 项目唯一标识，管理端按此聚合 |
| `projectName` | 看板显示名称 |
| `repoUrl` | 仓库地址 |
| `token` | 项目接入令牌（演示默认 `teamai-demo-token`） |

环境变量优先于配置文件：

- `TEAMAI_SERVER` — 控制平面地址
- `TEAMAI_TOKEN` — 接入令牌
- `TEAMAI_USER` — 上报事件的成员名
- `TEAMAI_CONFIG` — 指定其他配置文件

> 演示令牌直接提交在仓库中，仅用于本地演示。生产环境请通过环境变量注入，并在管理端替换默认令牌。

## 项目自身命令

```bash
npm start   # 打印项目与已同步技能信息
npm test    # 运行 Node 内置测试
```
