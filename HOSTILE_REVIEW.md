# Hostile Review — Design Hardening Patch 03

## Scope

This pass repairs the visual and UX failures identified from local screenshots:

- redundant contact inquiry form
- blue hat image cropping Sheila's face
- invisible event titles/descriptions caused by white text on light cards
- Past Affairs thumbnails too small
- Featured Affair section not visually reading as featured
- Gallery mental model confusing without a catch-all photo area
- Admin homepage feature field requiring slug/id knowledge

## Hostile Loop

Loop count: 2

### Issues found

1. Contact page repeated the same action twice: mailto CTA cards plus a full inquiry form.
2. Blue hat image used cover-style portrait framing that cut off Sheila's face.
3. Event archive cards had insufficient hierarchy: small flyers, category pill competing with invisible title/description copy.
4. Featured Affair read like a normal archive row instead of a true spotlight.
5. Gallery mixed photos, flyers, videos, and event albums without a clear information architecture.
6. Admin homepage feature selection exposed slug/id language to the client.
7. Static validation did not enforce the specific UX contracts that failed visually.

### Fixes applied

1. Removed the contact form and kept two clear mailto CTAs.
2. Added blue-hat contain framing so the full image is visible.
3. Rebuilt Past Affairs cards with larger flyer previews, visible category pills, dark event titles, and readable descriptions.
4. Rebuilt Featured Affair as a title-forward feature card with larger flyer artwork and prominent text.
5. Rebuilt Gallery around four clear sections: Moments & Photos, Event Albums, Flyer Archive, Video Moments.
6. Replaced the admin slug/id field with a readable dropdown of events, albums, and videos.
7. Updated validators and Master Gauntlet tests to catch these regressions.

### Remaining known risks

- Human visual approval is still required in local preview.
- Container Playwright remains blocked by this environment's browser/network policy, despite build and static validation passing.
- Deployed Cloudflare proof is not run until the repo is pushed/deployed.

## Exit condition

No known fixable source-level issue remains for Patch 03 before local visual review.
