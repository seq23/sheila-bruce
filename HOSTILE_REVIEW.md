# Hostile Review — Design Hardening Patch 01

## Scope
Design hardening, content architecture cleanup, media presentation fixes, nav cleanup, footer/header/logo improvements, mobile styling, package-lock registry fix, Playwright local browser config fix.

## Loop Count
2

## Issues Found
- Header logo was technically present but not visually prominent enough.
- Logo needed to be a reliable homepage hyperlink.
- Main navigation was too crowded and included Sarasota as a standalone top-nav item despite About absorbing Gulf Coast positioning.
- Homepage hero typography was too oversized and visually domineering.
- Animated hero phrase lacked script/depth treatment.
- Images, flyers, and videos were using overly generic crop rules.
- Flyers and video thumbnails could be cropped in gallery/event contexts.
- Footer was too thin and did not behave like a real brand footer.
- Homepage Meet Sheila and About/Sheila copy overlapped too much.
- About needed to be about the company/events, not a duplicate founder bio.
- Sheila page needed to hold the actual founder story.
- Local package-lock used internal sandbox registry URLs.
- Playwright config hardcoded `/usr/bin/chromium`, which fails on macOS.

## Fixes Applied
- Added a more visible logo lockup in the header and footer; both link to `/`.
- Removed Sarasota from top navigation while keeping `/sarasota/` available as a hidden/local page.
- Reduced hero typography scale and added script styling for rotating hero phrase.
- Refined homepage hero image framing and visual hierarchy.
- Added media treatment classes for flyers, portrait photos, video cards, and contain-media contexts.
- Reworked gallery rendering so flyers/videos receive safer non-cropping treatment.
- Reworked event detail hero image handling so flyers are contained instead of cropped.
- Rebuilt footer with logo, brand descriptor, contact details, social links, quick links, legal, and signature phrase.
- Rewrote About page around company, event types, audience, Gulf Coast positioning, and Sisters of Sarasota bridge.
- Focused Sheila page on founder biography and hosting philosophy.
- Added review convenience scripts.
- Patched package-lock registry URLs to public npm.
- Patched Playwright config to use installed Playwright Chromium unless a custom executable is supplied.
- Updated Master Gauntlet locators and checks to reflect the design/nav changes.

## Remaining Known Risks
- Final visual taste must be approved by the user in browser preview.
- Live Cloudflare/GitHub admin publishing remains unproven until deployment/env setup.
- The hidden Sarasota page still exists but is no longer top-nav; it can be removed later if desired.

## Exit Condition
No known fixable source-level design hardening issue remains for this patch before local visual preview. Build/validators/gauntlet must still be run after update.

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

