import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const plugin = path.join(root, '.teamai', 'bin', 'teamai.mjs');
const user = process.env.TEAMAI_USER ?? os.userInfo().username ?? 'unknown';

function run(args) {
  const result = spawnSync(process.execPath, [plugin, ...args], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('1/2 同步团队技能…');
run(['sync']);

console.log('\n2/2 读取技能并上报一次使用…');
run([
  'use',
  'code-review',
  '--action',
  '演示：使用 Code Review 技能检查 src/greet.mjs',
  '--user',
  user,
]);

console.log('\n✓ 完成。回到管理看板查看项目同步状态与使用记录。');
