# TeamAI 协作说明

本项目接入了 TeamAI 控制平面，团队技能由管理端统一发布。所有 AI 助手和开发者在本项目工作时遵循以下流程。

## 开始任务前

```bash
npm run teamai:sync
```

然后阅读 `.teamai/skills/<slug>/SKILL.md` 中与当前任务相关的技能，并按技能内的清单执行。

当前团队技能：

- `code-review` — 代码评审
- `release-notes` — 版本说明
- `api-design` — HTTP API 设计约定
- `incident-postmortem` — 故障复盘

## 使用技能后

上报一次使用记录，让管理端看到采用情况：

```bash
npm run teamai:track -- --skill code-review --action "评审了 xxx 改动"
```

默认按系统用户名上报。多人共用机器或演示时用 `--user` 指定成员：

```bash
npm run teamai:track -- --skill api-design --action "设计了 /v1/refunds" --user alice
```

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run teamai:sync` | 拉取并更新团队技能 |
| `npm run teamai:status` | 对比本地与远端的版本/校验和 |
| `npm run teamai:skills` | 查看本地已安装技能 |
| `npm run teamai:track -- --skill <slug>` | 上报技能使用 |
| `npm run teamai:hooks` | 安装 post-merge / post-checkout 自动同步 |

## 约束

- 不要手改 `.teamai/bin/teamai.mjs`，它是管理端分发的插件产物。
- 不要手改 `.teamai/lock.json`，它由 `teamai sync` 生成。
- `.teamai/skills/` 是同步目录；需要改技能内容时，在管理仓发布新版本，再执行同步。
- 管理端不可用时，同步会失败但不影响本地开发；继续任务前应重试。
- `.teamai/config.json` 中的令牌仅用于本地演示，生产环境改用 `TEAMAI_TOKEN` 环境变量。

## 验证

```bash
npm test
npm start
```
