import assert from 'node:assert/strict';
import test from 'node:test';
import { nextReleaseBranch, openReleaseBranch } from '../scripts/release.mjs';

test('cut picks the next unused version from tags in the latest month', () => {
  const refs = ['refs/tags/v2026.10.4', 'refs/tags/v2026.11.1.1'];
  assert.equal(nextReleaseBranch(refs, '2026.10'), 'release/2026.11.2');
  assert.equal(nextReleaseBranch([], '2026.10'), 'release/2026.10.1');
});

test('cut reuses the one open release branch', () => {
  assert.equal(
    nextReleaseBranch(['refs/heads/release/2026.11.1'], '2026.11'),
    'release/2026.11.1',
  );
});

test('cut refuses to choose between multiple open release branches', () => {
  assert.throws(() => nextReleaseBranch([
    'refs/heads/release/2026.11.1', 'refs/heads/release/2026.11.2',
  ], '2026.11'), /Multiple open release branches/);
});

test('ship selects the sole open release branch', () => {
  assert.equal(
    openReleaseBranch(['refs/heads/release/2026.11.1', 'refs/tags/v2026.10.4']),
    'release/2026.11.1',
  );
});

test('ship refuses missing or ambiguous release branches', () => {
  assert.throws(() => openReleaseBranch([]), /No open release branch/);
  assert.throws(
    () => openReleaseBranch(['refs/heads/release/2026.11.1', 'refs/heads/release/2026.11.2']),
    /Multiple open release branches/,
  );
});
