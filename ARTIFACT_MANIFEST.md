# Artifact Manifest — Design Hardening Patch 03

Repo: sheila-bruce
Artifact type: full baseline snapshot ZIP
Patch: Design Hardening Patch 03 — Hostile Visual UX Repair

## Major changes

- Removed redundant contact inquiry form.
- Kept contact mailto CTAs.
- Fixed blue hat image containment.
- Enlarged Past Affairs thumbnails.
- Rebuilt event cards with readable category, title, metadata, and description hierarchy.
- Rebuilt Featured Affair card.
- Rebuilt Gallery into Moments & Photos, Event Albums, Flyer Archive, and Video Moments.
- Replaced admin homepage feature slug/id field with human-readable dropdown.
- Updated validators and Master Gauntlet tests.

## Validation performed

- npm ci: passed
- NODE_OPTIONS="--max-old-space-size=3072" npm run build: passed
- npm run validate: passed
- npm run test:gauntlet: not proven in container; blocked by container browser/admin policy.

## Required local validation

Run:

NODE_OPTIONS="--max-old-space-size=3072" npm run validate:all

Then run:

npm run review

Open the local URL and visually inspect Home, Events, Gallery, Contact, and Admin.
