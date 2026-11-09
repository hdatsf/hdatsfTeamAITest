import { createHash } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, '.teamai', 'config.json');
const target = path.join(root, '.teamai', 'bin', 'teamai.mjs');
const config = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, 'utf8'))
  : {};
const serverUrl = String(
  process.env.TEAMAI_SERVER ?? config.serverUrl ?? 'http://127.0.0.1:4310',
).replace(/\/+$/, '');

function localCandidates() {
  const manageDir = process.env.TEAMAI_MANAGE_DIR;
  const candidates = [
    manageDir && path.join(manageDir, 'packages/plugin/teamai.mjs'),
    path.join(root, '..', 'teeamAITestManage', 'packages/plugin/teamai.mjs'),
    path.join(root, '..', 'teamAITestManage', 'packages/plugin/teamai.mjs'),
    path.join(root, '..', 'teamai-manage', 'packages/plugin/teamai.mjs'),
  ];
  return candidates.filter(Boolean);
}

async function fetchBundle() {
  const metaResponse = await fetch(`${serverUrl}/api/v1/plugin/meta`, {
    signal: AbortSignal.timeout(4000),
  });
  if (!metaResponse.ok) throw new Error(`plugin meta → ${metaResponse.status}`);
  const meta = await metaResponse.json();
  const response = await fetch(`${serverUrl}${meta.downloadUrl}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`plugin bundle → ${response.status}`);
  const source = await response.text();
  return { source, version: meta.version, sourceLabel: `${serverUrl}${meta.downloadUrl}` };
}

function readLocalBundle() {
  for (const candidate of localCandidates()) {
    if (existsSync(candidate)) {
      const source = readFileSync(candidate, 'utf8');
      const packageFile = path.join(path.dirname(candidate), 'package.json');
      const version = existsSync(packageFile)
        ? JSON.parse(readFileSync(packageFile, 'utf8')).version
        : 'local';
      return { source, version, sourceLabel: candidate };
    }
  }
  return null;
}

async function main() {
  mkdirSync(path.dirname(target), { recursive: true });
  let bundle;
  try {
    bundle = await fetchBundle();
    console.log(`从控制平面下载插件: ${serverUrl}`);
  } catch (error) {
    console.warn(`无法从控制平面下载插件（${error.message}），尝试使用本地管理仓…`);
    bundle = readLocalBundle();
  }
  if (!bundle) {
    console.error(
      '\n安装失败：控制平面不可用，且未找到本地管理仓。\n' +
        '1. 先在管理仓执行 npm run dev\n' +
        '2. 或设置 TEAMAI_MANAGE_DIR 指向 teeamAITestManage 目录\n',
    );
    process.exit(1);
  }

  writeFileSync(target, bundle.source, 'utf8');
  try {
    chmodSync(target, 0o755);
  } catch {
    // Windows: the npm/node invocation does not require the executable bit.
  }

  console.log(`✓ 已安装 TeamAI 插件 v${bundle.version}`);
  console.log(`  文件   ${path.relative(root, target)}`);
  console.log(`  来源   ${bundle.sourceLabel}`);
  console.log(`  校验   ${createHash('sha256').update(bundle.source).digest('hex').slice(0, 16)}…`);
  console.log('\n下一步:');
  console.log('  npm run teamai:sync');
  console.log('  npm run teamai:status\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
