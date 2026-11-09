import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { greet } from './greet.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lockPath = path.join(root, '.teamai', 'lock.json');

console.log(greet('TeamAI'));

if (!existsSync(lockPath)) {
  console.log('\n尚未同步团队技能。执行: npm run teamai:sync');
  process.exit(0);
}

const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
console.log(`\n项目: ${lock.projectId}`);
console.log(`控制平面: ${lock.serverUrl}`);
console.log(`最近同步: ${lock.syncedAt}`);
console.log(`已安装技能 (${lock.skills.length}):`);
for (const skill of lock.skills) {
  console.log(`  - ${skill.slug} v${skill.version}`);
}
console.log('\n技能文件位于 .teamai/skills/<slug>/SKILL.md');
console.log('Kimi Code 自动发现 .kimi-code/skills（sync 生成的投影）');
