// Guards the CI wiring. 26 Oct 2026: the repo had twelve validators and an e2e suite but no
// workflow had ever existed, so nothing ran them. This fails if the merge-gate workflow is missing,
// if any scripts/validate-*.mjs is not wired to a package.json script, or if the workflow does not
// run that script.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
// Comment lines are dropped so prose in the header cannot satisfy or trip an assertion.
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
const pkg = JSON.parse(read('package.json'));
const validatorFiles = fs.readdirSync(path.join(root, 'scripts')).filter((f) => /^validate-.*\.mjs$/.test(f));
const scriptFor = (file) => Object.entries(pkg.scripts).find(([, cmd]) => cmd.trim() === `node scripts/${file}`)?.[0];

test('there are validators to guard', () => {
  assert.ok(validatorFiles.length > 0, 'no scripts/validate-*.mjs found');
});

test('merge-gate workflow exists and runs on push and pull_request to main', () => {
  const wf = '.github/workflows/validate.yml';
  assert.ok(fs.existsSync(path.join(root, wf)), `${wf} is missing`);
  const y = read(wf);
  assert.match(y, /^on:\s*\n(?:\s+.*\n)*?\s+push:\s*\n\s+branches:\s*\[main\]/m, 'validate.yml must run on push to main');
  assert.match(y, /^\s+pull_request:\s*\n\s+branches:\s*\[main\]/m, 'validate.yml must run on pull_request to main');
  assert.match(y, /^\s+timeout-minutes:\s*\d+/m, 'validate.yml needs a job timeout');
  assert.doesNotMatch(y, /secrets\./, 'validate.yml must not use any secret — Pages deploys itself');
  assert.doesNotMatch(y, /wrangler|pages deploy/i, 'validate.yml must not deploy');
});

test('every validator is wired to a package script, the workflow, and npm run validate', () => {
  const y = read('.github/workflows/validate.yml');
  const runs = [...y.matchAll(/^\s+- run: npm run (\S+)\s*$/gm)].map((m) => m[1]);
  const buildAt = runs.indexOf('build');
  assert.ok(buildAt >= 0, 'validate.yml must run npm run build');
  const chain = pkg.scripts.validate.split('&&').map((s) => s.trim().replace(/^npm run /, ''));
  for (const file of validatorFiles) {
    const name = scriptFor(file);
    assert.ok(name, `scripts/${file} has no package.json script "node scripts/${file}"`);
    const at = runs.indexOf(name);
    assert.ok(at >= 0, `validate.yml does not run npm run ${name} (scripts/${file})`);
    assert.ok(at > buildAt, `validate.yml runs ${name} before the build`);
    assert.ok(chain.includes(name), `npm run validate does not include ${name}`);
  }
  assert.match(y, /^\s+- run: npm test\s*$/m, 'validate.yml must run npm test');
});

test('e2e runs nightly and on demand only, with a job timeout', () => {
  const wf = '.github/workflows/e2e.yml';
  assert.ok(fs.existsSync(path.join(root, wf)), `${wf} is missing`);
  const y = read(wf);
  assert.match(y, /^\s+workflow_dispatch:/m);
  assert.match(y, /^\s+schedule:\s*\n\s+- cron:/m);
  assert.doesNotMatch(y, /^\s+(push|pull_request):/m, 'e2e must not run per merge');
  assert.match(y, /^\s+timeout-minutes:\s*\d+/m);
  assert.match(y, /npm run test:e2e/);
  assert.doesNotMatch(y, /secrets\./);
});
