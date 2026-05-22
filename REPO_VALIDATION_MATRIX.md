# Repo Validation Matrix

Status: CURRENT after hostile review.

| Check | Command | Severity | Proves | Does Not Prove |
|---|---|---|---|---|
| Build | `npm run build` | HARD FAIL | Astro compiles and public routes generate | Cloudflare env correctness or deployed Functions |
| Content | `npm run validate:content` | HARD FAIL | Seeded event records exist | Future admin-created content correctness |
| Routes | `npm run validate:routes` | HARD FAIL | Required source pages exist | Browser visual correctness |
| Links | `npm run validate:links` | HARD FAIL | Page directory contract exists | Every external URL stays live forever |
| Events | `npm run validate:events` | HARD FAIL | Seeded archive events are past and not registerable | Future external registration links |
| Published filter | `npm run validate:published` | HARD FAIL | Event/gallery publish-state fields exist | Production GitHub update path |
| Admin contract | `npm run validate:admin` | HARD FAIL | Required admin endpoints/helpers exist, are not scaffold placeholders, and admin UI calls production endpoints | Token permissions or Cloudflare deployed runtime behavior |
| Schema | `npm run validate:schema` | HARD FAIL | JSON-LD support files exist | Google rich-result eligibility |
| Media | `npm run validate:media` | HARD FAIL | Video/media contract exists and seeded videos are MP4 | Streaming/CDN performance |
| Secrets scan | `npm run validate:secrets` | HARD FAIL | No obvious accidental GitHub/OpenAI secret pattern | Cloudflare values are set correctly |
| Assets | `npm run validate:assets` | HARD FAIL | Key client assets exist | Final visual preference approval |
| Social links | `npm run validate:social` | HARD FAIL | Approved Facebook/Instagram/TikTok URLs are configured | Social accounts are current |
| Master Gauntlet | `npm run test:gauntlet` | HARD FAIL local | Surface/transaction/state/outcome smoke when browser policy allows localhost | Deployed GitHub/Cloudflare publish loop unless run in postdeploy mode |
| ZIP check | Reopen ZIP + root/file checks | HARD FAIL | Handoff package opens and has expected root/files | Runtime deployment |
