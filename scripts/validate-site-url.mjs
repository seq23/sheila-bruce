// The site URL in astro.config.mjs feeds the sitemap and canonical links. It must be the host the
// Cloudflare Pages project actually serves (<package name>.pages.dev, or the custom domain in
// SITE_DOMAIN when one is attached). 25 Oct 2026: it named a-sheila-bruce-affair.pages.dev, which
// does not exist, so every sitemap URL pointed at a dead host.
import { readFileSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const cfg = readFileSync('astro.config.mjs', 'utf8');
const site = cfg.match(/site:\s*'([^']+)'/)?.[1] ?? '';
const expected = process.env.SITE_DOMAIN ? `https://${process.env.SITE_DOMAIN}` : `https://${pkg.name}.pages.dev`;
if (site !== expected) { console.error(`FAIL validate-site-url.mjs: astro site is "${site}", the deployed host is "${expected}"`); process.exit(1); }
console.log('PASS validate-site-url.mjs');
