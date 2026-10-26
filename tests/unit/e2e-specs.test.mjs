// 26 Oct 2026: nine spec files were one-line `import './master-gauntlet.spec'` shims, which
// Playwright rejects, so `npm run test:e2e` failed before running a single test. Every spec must
// declare its own tests and import no other spec.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '../e2e');
const specs = fs.readdirSync(dir).filter((f) => f.endsWith('.spec.ts'));

test('there are e2e specs', () => assert.ok(specs.length > 0));
for (const s of specs) {
  test(`${s} declares tests and imports no other spec`, () => {
    const src = fs.readFileSync(path.join(dir, s), 'utf8');
    assert.match(src, /^\s*test(\.describe)?\(/m, `${s} declares no tests`);
    assert.doesNotMatch(src, /import\s+['"][^'"]*\.spec(\.ts)?['"]/, `${s} imports another spec file`);
  });
}
