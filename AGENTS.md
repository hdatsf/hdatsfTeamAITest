# TeamAI 协作说明

本项目接入了 TeamAI 控制平面，团队技能由管理端统一发布。所有 AI 助手和开发者在本项目工作时遵循以下流程。

## 开始任务前

团队技能由 git hook 在 `git pull` / `git checkout` 后自动同步；如果没有触发，手动运行：

```bash
npm run teamai:sync
```

然后按下节“使用技能”的方式读取与当前任务相关的技能，并按技能内的清单执行。

当前团队技能：

- `code-review` — 代码评审
- `release-notes` — 版本说明
- `api-design` — HTTP API 设计约定
- `incident-postmortem` — 故障复盘

## 使用技能

阅读技能内容与上报使用是同一次操作，直接运行：

```bash
npm run teamai:use -- code-review
```

它会把 `.teamai/skills/code-review/SKILL.md` 打印到 stdout，同时上报一次 `skill.invoked`，记录当前系统用户、项目和技能版本。不要先读文件再单独补一条 `track`。

如果直接读取 `.teamai/skills/<slug>/SKILL.md`（例如用 Read 工具分页阅读），Kimi Code 的 `PostToolUse` hook 会自动上报，每个会话每个技能只记一次，不需要额外命令。

Agent 上报 hook 是用户级的一次性安装（写入 `~/.kimi-code/config.toml`，不改项目配置）：

```bash
npm run teamai:agent-hooks
```

移除用 `npm run teamai:agent-hooks-remove`。hook 只读取技能文件时上报，失败不阻塞 agent。

## 手工补录

`track` 仅用于跨 agent 兜底、事后补录或修正数据，不作为常规路径：

```bash
npm run teamai:track -- --skill code-review --action "评审了 xxx 改动"
```

多人共用机器或演示时用 `--user` 指定成员：

```bash
npm run teamai:use -- api-design --user alice
```

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run teamai:sync` | 拉取并更新团队技能 |
| `npm run teamai:use -- <slug>` | 读取技能并上报使用（推荐） |
| `npm run teamai:status` | 对比本地与远端的版本/校验和 |
| `npm run teamai:skills` | 查看本地已安装技能 |
| `npm run teamai:track -- --skill <slug>` | 手工补录一次使用 |
| `npm run teamai:hooks` | 安装 post-merge / post-checkout 自动同步 |
| `npm run teamai:agent-hooks` | 安装 Kimi Code 自动上报 hook |

## 约束

- 不要手改 `.teamai/bin/teamai.mjs`，它是管理端分发的插件产物。
- 不要手改 `.teamai/lock.json`，它由 `teamai sync` 生成。
- `.teamai/skills/` 是同步目录；需要改技能内容时，在管理仓发布新版本，再执行同步。
- 管理端不可用时，同步和使用上报会失败但不影响本地开发；继续任务前应重试同步。
- `.teamai/config.json` 中的令牌仅用于本地演示，生产环境改用 `TEAMAI_TOKEN` 环境变量。
- 尽量频繁同步（至少每次开始任务前），避免基于过期技能工作。

## 验证

```bash
npm test
npm start
```
