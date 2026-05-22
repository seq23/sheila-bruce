# Artifact Manifest

Repo: `sheila-bruce`

Artifact target name:
`sheila-bruce-main_BASELINE_05-22-26_<sha>.zip`

Included:
- Astro public site pages
- Cloudflare Pages Function admin publishing endpoints
- Shared GitHub Contents API helper for Cloudflare runtime
- Private low-friction owner/env registry docs
- Seeded past event archive from client flyers
- Gallery albums with photos, flyers, and videos
- Structured schema support
- Admin local preview flow plus production GitHub commit flow
- Validation scripts
- Master Gauntlet Playwright suite
- Hostile review report

Validation performed in build container after repo identity correction:
- `npm ci` — PASSED
- `npm run build` — PASSED
- `npm run validate` — PASSED

Not proven in this container:
- `npm run test:gauntlet` — expected to be run locally/postdeploy; prior container browser run was blocked by Chromium/localhost policy.
- Deployed Cloudflare/GitHub admin publish loop — requires Cloudflare env vars and GitHub token.

Excluded from ZIP:
- `node_modules/`
- `dist/`
- Playwright reports/results


## Design Hardening Patch 01
- Header logo/link prominence improved.
- Footer rebuilt as a real brand footer.
- Homepage hero hierarchy reduced and script accent treatment added.
- About/Sheila content architecture separated.
- Sarasota removed from top nav.
- Gallery/event media cropping rules hardened.
- Package lock public npm registry fix baked in.
- Playwright config macOS-compatible fix baked in.

## Design Hardening Patch 02 — Image Role Correction

Locked image hierarchy applied:
- Home hero uses `/assets/brand/sheila/sheila-black-dress-hero.jpg`.
- Home Meet Sheila card uses `/assets/brand/sheila/sheila-blue-hat-about.png`.
- About page hero uses `/assets/sarasota/sarasota-gulf-coast-yacht.jpg`.
- Sheila page hero uses `/assets/brand/sheila/sheila-twirling-black-dress.jpg`.
- Header/footer logo remains linked to `/`.

Validation expectations:
- `validate-assets` now requires the new Sarasota and twirling black dress assets.
- Master Gauntlet now asserts the locked image-role hierarchy on Home, About, and Sheila pages.

