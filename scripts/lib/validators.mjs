// One implementation for every scripts/validate-*.mjs entry point.
//
// 26 Oct 2026: the eleven validators were eleven copies of one file that picked its check from its
// own filename. The copies had drifted (nine lacked the registration-QR checks), and
// validate-no-secrets.mjs never matched its own branch ('validate-secrets'), so it scanned nothing
// and printed PASS. Each entry point now names its check explicitly; an unknown name is a hard
// failure, and every check fails when the set it examines is empty.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const fail = (m) => failures.push(m);
const file = (rel) => fs.existsSync(path.join(root, rel));
const text = (rel) => (file(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : '');
const publicAsset = (src) => file(path.join('public', String(src).replace(/^\//, '')));
function readJsonDir(d) {
  const p = path.join(root, d);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(p, f), 'utf8')));
}
const events = () => readJsonDir('src/content/events');
const albums = () => readJsonDir('src/content/gallery');
function requireItems(kind, items) {
  if (items.length === 0) fail(`No ${kind} found under ${root} — nothing to validate.`);
  return items;
}

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.astro', 'test-results', 'playwright-report']);
const BINARY = /\.(png|jpe?g|webp|gif|ico|mp4|mov|webm|pdf|woff2?|ttf|otf|zip)$/i;
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) { if (!SKIP_DIRS.has(ent.name)) walk(path.join(dir, ent.name), out); }
    else if (ent.isFile()) out.push(path.join(dir, ent.name));
  }
  return out;
}

export const checks = {
  content() {
    if (events().length < 8) fail('Expected at least 8 seeded past events.');
    if (!text('src/pages/index.astro').includes('Featured Affair')) fail('Homepage missing Featured Affair section.');
  },
  routes() {
    ['src/pages/index.astro', 'src/pages/events.astro', 'src/pages/gallery.astro', 'src/pages/admin.astro', 'src/pages/sheila.astro', 'src/pages/contact.astro']
      .forEach((f) => { if (!file(f)) fail(`Missing ${f}`); });
  },
  links() {
    // Every root-relative href/src in the built site must resolve to a built page or public file.
    const dist = path.join(root, 'dist');
    if (!fs.existsSync(dist)) { fail('dist/ not found — run `npm run build` before validate:links.'); return; }
    const pages = requireItems('built HTML pages in dist/', walk(dist).filter((f) => f.endsWith('.html')));
    const resolves = (u) => {
      const p = decodeURI(u.split(/[?#]/)[0]);
      if (p.startsWith('/api/')) return file(`functions${p.replace(/\/$/, '')}.ts`);
      const base = path.join(dist, p);
      return [base, path.join(base, 'index.html'), `${base.replace(/\/$/, '')}.html`].some((c) => fs.existsSync(c) && fs.statSync(c).isFile());
    };
    let checked = 0;
    for (const page of pages) {
      const html = fs.readFileSync(page, 'utf8');
      for (const m of html.matchAll(/\s(?:href|src|poster)="(\/(?!\/)[^"]*)"/g)) {
        checked++;
        if (!resolves(m[1])) fail(`${path.relative(dist, page)} links to ${m[1]}, which the build does not contain.`);
      }
    }
    if (checked === 0) fail('No internal links found in dist/ — nothing was checked.');
  },
  events() {
    for (const e of requireItems('events in src/content/events', events())) {
      if (e.status !== 'past' && e.slug !== 'e2e-test') fail(`Seeded event must be past: ${e.slug}`);
      if (e.registrationType && e.registrationType !== 'none') fail(`Seeded archive event must not show registration CTA: ${e.slug}`);
      if (e.registrationQrSrc) {
        if (!String(e.registrationQrSrc).startsWith('/assets/registration-qr/')) fail(`Event ${e.slug} has invalid registrationQrSrc path.`);
        if (!/\.(png|jpg|jpeg|webp)$/i.test(String(e.registrationQrSrc))) fail(`Event ${e.slug} has invalid QR extension.`);
        if (!publicAsset(e.registrationQrSrc)) fail(`Event ${e.slug} references missing registration QR asset.`);
      }
      ['title', 'slug', 'category', 'summary', 'featuredImage'].forEach((k) => { if (!String(e[k] || '').trim()) fail(`Event ${e.slug || '(missing slug)'} missing ${k}`); });
    }
    const eventsPage = text('src/pages/events.astro');
    ['event-card__title', 'event-card__description', 'event-category-pill', 'event-card__media'].forEach((t) => { if (!eventsPage.includes(t)) fail(`Events page missing visible event card token ${t}`); });
    const home = text('src/pages/index.astro');
    ['featured-affair-card', 'featured-affair-card__summary', 'Featured Past Affair'].forEach((t) => { if (!home.includes(t)) fail(`Homepage featured affair missing ${t}`); });
  },
  published() {
    if (requireItems('events in src/content/events', events()).some((e) => typeof e.published === 'undefined')) fail('Events need published field.');
    if (requireItems('albums in src/content/gallery', albums()).some((a) => typeof a.published === 'undefined')) fail('Albums need published field.');
  },
  admin() {
    const required = ['functions/api/create-event.ts', 'functions/api/create-gallery-album.ts', 'functions/api/create-insight.ts', 'functions/api/republish-content.ts', 'functions/api/delete-content.ts', 'functions/api/set-homepage-feature.ts', 'functions/api/unpublish-content.ts', 'functions/api/list-admin-content.ts', 'functions/_shared/github.ts'];
    required.forEach((f) => { if (!file(f)) fail(`Missing admin endpoint/helper ${f}`); });
    const endpointText = required.map(text).join('\n');
    if (endpointText.includes('endpoint scaffold') || endpointText.includes('Configure env registry for production GitHub commits')) fail('Admin endpoints still contain scaffold placeholder text.');
    ['GITHUB_CONTENT_TOKEN', 'putTextFile', 'githubApi', 'requireAdmin'].forEach((t) => { if (!endpointText.includes(t)) fail(`Admin endpoint implementation missing ${t}`); });
    const adminPage = text('src/pages/admin.astro');
    if (adminPage.includes('slug/id') || adminPage.includes('Event, album, or video slug')) fail('Admin still exposes confusing slug/id copy.');
    if (!adminPage.includes('data-feature-choice')) fail('Admin homepage feature selector must be human-readable dropdown.');
    if (!adminPage.includes('Registration QR Code')) fail('Admin event form missing Registration QR Code upload.');
    const adminJs = text('src/scripts/site.js');
    ['/api/create-event', '/api/create-gallery-album', '/api/create-insight', '/api/list-admin-content', '/api/unpublish-content', '/api/republish-content', '/api/delete-content', '/api/set-homepage-feature'].forEach((api) => { if (!adminJs.includes(api)) fail(`Admin UI does not call ${api}`); });
    if (!adminJs.includes('/api/subscribe')) fail('Contact mailing list UI does not call /api/subscribe.');
  },
  schema() {
    const s = text('src/lib/schema.ts');
    if (!s) { fail('Missing schema lib src/lib/schema.ts.'); return; }
    ['organizationSchema', 'eventSchema', 'articleSchema', 'videoSchema'].forEach((fn) => { if (!s.includes(`export function ${fn}`)) fail(`schema.ts missing ${fn}`); });
  },
  media() {
    const vids = albums().flatMap((a) => a.media || []).filter((m) => m.type === 'video');
    if (vids.length < 1) fail('Expected seeded videos.');
    vids.forEach((v) => { if (!String(v.src || '').endsWith('.mp4')) fail('Videos must be MP4 for public rendering.'); });
    const gallery = text('src/pages/gallery.astro');
    ['Moments & Photos', 'Event Albums', 'Flyer Archive', 'Watch Sheila &amp; the Affair'].forEach((x) => { if (!gallery.includes(x)) fail(`Gallery missing ${x} section`); });
  },
  secrets() {
    // Real token shapes, not bare prefixes: the old 'sk-' substring matched words like "task-".
    const patterns = [
      ['GitHub classic token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
      ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{40,}\b/],
      ['OpenAI/Anthropic-style key', /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}\b/],
      ['GITHUB_CONTENT_TOKEN assigned a literal', /GITHUB_CONTENT_TOKEN\s*=\s*gh/],
      ['Cloudflare API token assigned a literal', /CLOUDFLARE_API_TOKEN\s*[=:]\s*['"]?[A-Za-z0-9_-]{40}/],
    ];
    const files = requireItems('source files to scan', walk(root).filter((f) => !BINARY.test(f)));
    for (const f of files) {
      const s = fs.readFileSync(f, 'utf8');
      for (const [label, re] of patterns) if (re.test(s)) fail(`Possible secret (${label}) in ${path.relative(root, f)}`);
    }
  },
  assets() {
    ['/assets/brand/sheila/sheila-blue-hat-about.png', '/assets/brand/sheila/sheila-black-dress-hero.jpg', '/assets/brand/sheila/sheila-twirling-black-dress.jpg', '/assets/sarasota/sarasota-gulf-coast-yacht.jpg', '/assets/flyers/tuxedo-ball.png']
      .forEach((a) => { if (!publicAsset(a)) fail(`Missing asset ${a}`); });
    const refs = [...requireItems('events in src/content/events', events()).map((e) => e.featuredImage), ...albums().map((a) => a.coverImage), ...albums().flatMap((a) => (a.media || []).flatMap((m) => [m.src, m.poster].filter(Boolean)))].filter(Boolean);
    requireItems('asset references in content', refs).forEach((a) => { if (String(a).startsWith('/assets/') && !publicAsset(a)) fail(`Missing referenced public asset ${a}`); });
  },
  social() {
    const s = text('src/data/site.json');
    if (!s) { fail('Missing src/data/site.json.'); return; }
    ['facebook.com/fabulousgigi58', 'instagram.com/fabulousgigi58', 'tiktok.com/@fabul11'].forEach((x) => { if (!s.includes(x)) fail(`Missing social ${x}`); });
  },
};

export function runValidator(name) {
  const label = path.basename(process.argv[1] || name);
  const check = checks[name];
  if (!check) { console.error(`FAIL ${label}: unknown validator "${name}"`); process.exit(1); }
  try { check(); } catch (err) { fail(`${err.message}`); }
  if (failures.length) { failures.forEach((m) => console.error(`FAIL ${label}: ${m}`)); process.exit(1); }
  console.log('PASS', label);
}
