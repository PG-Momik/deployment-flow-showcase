import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';

const sha = process.env.GITHUB_SHA || 'local';
if (sha !== 'local' && !/^[0-9a-f]{40}$/.test(sha)) {
  throw new Error('GITHUB_SHA must be a full commit SHA');
}

mkdirSync('dist', { recursive: true });
copyFileSync('index.html', 'dist/index.html');
writeFileSync('dist/manifest.json', JSON.stringify({ sha }, null, 2) + '\n');
writeFileSync('dist/sha', sha + '\n');
