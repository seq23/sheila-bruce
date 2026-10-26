# Repo Validation Matrix

Status: CURRENT after hostile review.

CI: `.github/workflows/validate.yml` runs build, every `validate:*` script and `npm test` on every push and PR to `main` (no credentials; Pages deploys itself). `.github/workflows/e2e.yml` runs the Playwright suite nightly and on demand. Every validator fails on an empty input set (`tests/unit/validators-empty.test.mjs`).

| Check | Command | Severity | Proves | Does Not Prove |
|---|---|---|---|---|
| Build | `npm run build` | HARD FAIL | Astro compiles and public routes generate | Cloudflare env correctness or deployed Functions |
| Content | `npm run validate:content` | HARD FAIL | Seeded event records exist | Future admin-created content correctness |
| Routes | `npm run validate:routes` | HARD FAIL | Required source pages exist | Browser visual correctness |
| Links | `npm run validate:links` | HARD FAIL | Every root-relative href/src/poster in the built `dist/` resolves to a built page, public file or Function (run after build) | Every external URL stays live forever |
| Events | `npm run validate:events` | HARD FAIL | Seeded archive events are past and not registerable | Future external registration links |
| Published filter | `npm run validate:published` | HARD FAIL | Event/gallery publish-state fields exist | Production GitHub update path |
| Admin contract | `npm run validate:admin` | HARD FAIL | Required admin endpoints/helpers exist, are not scaffold placeholders, and admin UI calls production endpoints | Token permissions or Cloudflare deployed runtime behavior |
| Schema | `npm run validate:schema` | HARD FAIL | JSON-LD support files exist | Google rich-result eligibility |
| Media | `npm run validate:media` | HARD FAIL | Video/media contract exists and seeded videos are MP4 | Streaming/CDN performance |
| Secrets scan | `npm run validate:secrets` | HARD FAIL | No obvious accidental GitHub/OpenAI secret pattern | Cloudflare values are set correctly |
| Assets | `npm run validate:assets` | HARD FAIL | Key client assets exist | Final visual preference approval |
| CI wiring guard | `npm test` | HARD FAIL | validate.yml exists and runs every scripts/validate-*.mjs; validators fail on empty input; e2e specs are self-contained | That CI actually ran (check `gh run list`) |
| Social links | `npm run validate:social` | HARD FAIL | Approved Facebook/Instagram/TikTok URLs are configured | Social accounts are current |
| Master Gauntlet | `npm run test:gauntlet` | HARD FAIL local | Surface/transaction/state/outcome smoke when browser policy allows localhost | Deployed GitHub/Cloudflare publish loop unless run in postdeploy mode |
| ZIP check | Reopen ZIP + root/file checks | HARD FAIL | Handoff package opens and has expected root/files | Runtime deployment |
