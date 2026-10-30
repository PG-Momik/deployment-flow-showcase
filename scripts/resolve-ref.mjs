export function resolveRef(ref) {
  if (ref === 'refs/heads/main') return { environment: 'dev' };
  if (/^refs\/heads\/release\/\d{4}\.\d{2}\.\d+(?:\.\d+)?$/.test(ref)) {
    return { environment: 'staging' };
  }
  const tag = /^refs\/tags\/v(\d{4}\.\d{2}\.\d+(?:\.\d+)?)$/.exec(ref);
  if (tag) return { environment: 'production', branch: `release/${tag[1]}` };
  throw new Error(`Unsupported ref: ${ref}`);
}

if (process.argv[1]?.endsWith('/resolve-ref.mjs')) {
  const result = resolveRef(process.argv[2]);
  for (const [key, value] of Object.entries(result)) console.log(`${key}=${value}`);
}
