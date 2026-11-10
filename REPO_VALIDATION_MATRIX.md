# Repo Validation Matrix

Status: CURRENT after hostile review.

CI: `.github/workflows/validate.yml` runs build, every `validate:*` script and `npm test` on every push and PR to `main` (no credentials; Pages deploys itself). `.github/workflows/e2e.yml` runs the Playwright suite nightly and on demand. Every validator fails on an empty input set (`tests/unit/validators-empty.test.mjs`).

| Check | Command | Severity | Proves | Does Not Prove |
|---|---|---|---|---|
| Build | `npm run build` | HARD FAIL | Astro compiles and public routes generate | Cloudflare env correctness or deployed Functions |
| Links | `npm run validate:links` | HARD FAIL | Every root-relative href/src/poster in the built `dist/` resolves to a built page, public file or Function (run after build) | Every external URL stays live forever |
| Secrets scan | `npm run validate:secrets` | HARD FAIL | No obvious accidental GitHub/OpenAI secret pattern | Cloudflare values are set correctly |
| Assets | `npm run validate:assets` | HARD FAIL | Key client assets exist | Final visual preference approval |
| CI wiring guard | `npm test` | HARD FAIL | validate.yml exists and runs every scripts/validate-*.mjs; validators fail on empty input; e2e specs are self-contained | That CI actually ran (check `gh run list`) |
| Master Gauntlet | `npm run test:gauntlet` | HARD FAIL local | Surface/transaction/state/outcome smoke when browser policy allows localhost | Deployed GitHub/Cloudflare publish loop unless run in postdeploy mode |
| ZIP check | Reopen ZIP + root/file checks | HARD FAIL | Handoff package opens and has expected root/files | Runtime deployment |
