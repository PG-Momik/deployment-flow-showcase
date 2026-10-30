import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveRef } from '../scripts/resolve-ref.mjs';

test('main, release branch, and version tag select the expected environments', () => {
  assert.deepEqual(resolveRef('refs/heads/main'), { environment: 'dev' });
  assert.deepEqual(resolveRef('refs/heads/release/2026.11.1'), { environment: 'staging' });
  assert.deepEqual(resolveRef('refs/tags/v2026.11.1'), {
    environment: 'production', branch: 'release/2026.11.1',
  });
});

test('unrelated refs cannot deploy', () => {
  assert.throws(() => resolveRef('refs/heads/feature/example'), /Unsupported ref/);
  assert.throws(() => resolveRef('refs/tags/vlatest'), /Unsupported ref/);
});
