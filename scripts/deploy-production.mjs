#!/usr/bin/env node
/**
 * Production frontend deploy helper.
 * Run on the server after git pull: node scripts/deploy-production.mjs
 */
import { spawnSync } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('==> Building Nuxt production bundle...');
const build = spawnSync(npmCmd, ['run', 'build'], { stdio: 'inherit', shell: process.platform === 'win32' });

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

console.log('');
console.log('==> Frontend build complete. Post-deploy on server:');
console.log('    1. Restart Node process: node .output/server/index.mjs (or your PM2/systemd unit)');
console.log('    2. Purge CDN/LiteSpeed cache for /services/* and locale service paths (/en/services/*, …)');
console.log('    3. Hard-refresh a service page after midnight KSA to confirm pricing window cache keys');
