import { execFileSync } from 'node:child_process';

const releaseBranch = /^refs\/heads\/(release\/\d{4}\.\d{2}\.\d+)$/;
const versionRef = /^refs\/tags\/v(\d{4}\.\d{2})\.(\d+)(?:\.\d+)?$/;

export function openReleaseBranch(refs) {
  const branches = refs.map(ref => releaseBranch.exec(ref)?.[1]).filter(Boolean);
  if (branches.length === 0) throw new Error('No open release branch');
  if (branches.length > 1) throw new Error(`Multiple open release branches: ${branches.join(', ')}`);
  return branches[0];
}

export function nextReleaseBranch(refs, currentMonth) {
  if (refs.some(ref => releaseBranch.test(ref))) return openReleaseBranch(refs);
  const versions = refs.map(ref => versionRef.exec(ref)).filter(Boolean);
  const month = [currentMonth, ...versions.map(match => match[1])].sort().at(-1);
  const number = Math.max(0, ...versions.filter(match => match[1] === month).map(match => Number(match[2]))) + 1;
  return `release/${month}.${number}`;
}

if (process.argv[1]?.endsWith('/release.mjs')) {
  const output = execFileSync('git', ['ls-remote', '--refs', 'origin', 'refs/heads/release/*', 'refs/tags/v*'], { encoding: 'utf8' });
  const refs = output.split('\n').map(line => line.split('\t')[1]).filter(Boolean);
  const month = new Date().toISOString().slice(0, 7).replace('-', '.');
  const branch = process.argv[2] === 'next' ? nextReleaseBranch(refs, month) :
    process.argv[2] === 'open' ? openReleaseBranch(refs) : null;
  if (!branch) throw new Error('Use next or open');
  console.log(branch);
}
