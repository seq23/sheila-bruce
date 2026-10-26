// Rule 0 guard: a validator pointed at an empty directory must fail, never PASS on zero items.
// 26 Oct 2026: validate-no-secrets.mjs scanned nothing (its branch never matched its filename) and
// printed PASS; validate-published.mjs passed with zero events and albums.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const scripts = path.resolve(import.meta.dirname, '../../scripts');
const validators = fs.readdirSync(scripts).filter((f) => /^validate-.*\.mjs$/.test(f));

test('there are validators to check', () => assert.ok(validators.length > 0));

for (const v of validators) {
  test(`${v} fails on an empty directory`, () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-empty-'));
    const r = spawnSync(process.execPath, [path.join(scripts, v)], { cwd: empty, encoding: 'utf8' });
    fs.rmSync(empty, { recursive: true, force: true });
    assert.notEqual(r.status, 0, `${v} exited 0 on an empty directory:\n${r.stdout}`);
    assert.doesNotMatch(r.stdout, /PASS/, `${v} printed PASS on an empty directory`);
  });
}

test('validate-no-secrets.mjs catches a planted token', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-secret-'));
  fs.writeFileSync(path.join(dir, 'leak.js'), `const t = "${'ghp_'}${'A'.repeat(36)}";\n`);
  const r = spawnSync(process.execPath, [path.join(scripts, 'validate-no-secrets.mjs')], { cwd: dir, encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /leak\.js/);
});
