# TeamAI 协作说明

本项目接入了 TeamAI 控制平面，团队技能由管理端统一发布。所有 AI 助手和开发者在本项目工作时遵循以下流程。

## 开始任务前

团队技能由 git hook 在 `git pull` / `git checkout` 后自动同步；如果没有触发，手动运行：

```bash
npm run teamai:sync
```

同步会写两份技能：

- `.teamai/skills/<slug>/SKILL.md` — TeamAI 的权威副本，版本、校验和、上报都以它为准
- `.kimi-code/skills/<slug>/SKILL.md` — 给 Kimi Code 自动发现的投影，由 `sync` 生成，勿手改

Kimi Code 启动时扫描 `.kimi-code/skills`，技能会出现在可用技能列表中，以 `/skill:<slug>` 形式调用。

当前团队技能：

- `code-review` — 代码评审
- `release-notes` — 版本说明
- `api-design` — HTTP API 设计约定
- `incident-postmortem` — 故障复盘

## 使用技能

Kimi Code 中优先直接调用技能（Skill 工具，如 `code-review`），不要先读文件再补报。用户级 `PostToolUse` hook 会自动上报一次 `skill.invoked`，来源记为 `agent-skill`，每个会话每个技能只记一次。

如果技能没有出现在列表里，先执行 `npm run teamai:sync`，再新开一个会话。

其他 agent、纯 CLI 场景或 hook 不可用时，用 `teamai use` 一次完成读取与上报：

```bash
npm run teamai:use -- code-review
```

它会把 `.teamai/skills/code-review/SKILL.md` 打印到 stdout 并上报。若同一技能刚被 hook 自动上报（2 分钟内），`use` 不会重复记录；需要强制补记时加 `--force`。

直接 Read `.teamai/skills/<slug>/SKILL.md` 或 `.kimi-code/skills/<slug>/SKILL.md` 也会被 hook 捕获并上报。

Agent 上报 hook 是用户级的一次性安装（写入 `~/.kimi-code/config.toml`，不改项目配置）：

```bash
npm run teamai:agent-hooks
```

移除用 `npm run teamai:agent-hooks-remove`。hook 失败不阻塞 agent。

## 为什么同时有 `.teamai` 和 `.kimi-code`

`.teamai/` 是 TeamAI 自己的命名空间：配置、锁文件、插件、权威技能副本都在这里，与具体 agent 无关，也便于校验和版本管理。

Kimi Code 只扫描 `.kimi-code/skills`（以及 `.agents/skills`），不会扫描 `.teamai/skills`。因此 `sync` 把同一份内容投影到 `.kimi-code/skills`，并通过 frontmatter 的 `name: <slug>` 保证 `/skill:<slug>` 名称一致。

投影是生成物：改动会随下次 `sync` 覆盖。要修改技能，在管理仓发布新版本，再同步。

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
| `npm run teamai:sync` | 拉取并更新团队技能，同步生成 Kimi 投影 |
| `npm run teamai:use -- <slug>` | 读取技能并上报使用（非 Kimi agent 的入口） |
| `npm run teamai:status` | 对比本地、远端与 Kimi 投影的状态 |
| `npm run teamai:skills` | 查看本地已安装技能与投影状态 |
| `npm run teamai:track -- --skill <slug>` | 手工补录一次使用 |
| `npm run teamai:hooks` | 安装 post-merge / post-checkout 自动同步 |
| `npm run teamai:agent-hooks` | 安装 Kimi Code 自动上报 hook |

## 约束

- 不要手改 `.teamai/bin/teamai.mjs`，它是管理端分发的插件产物。
- 不要手改 `.teamai/lock.json`，它由 `teamai sync` 生成。
- `.teamai/skills/` 是权威同步目录；`.kimi-code/skills/` 是投影，都会被 `sync` 覆盖。
- 管理端不可用时，同步和使用上报会失败但不影响本地开发；继续任务前应重试同步。
- `.teamai/config.json` 中的令牌仅用于本地演示，生产环境改用 `TEAMAI_TOKEN` 环境变量。
- 尽量频繁同步（至少每次开始任务前），避免基于过期技能工作。

## 验证

```bash
npm test
npm start
```
