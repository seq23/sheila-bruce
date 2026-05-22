import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
function fail(m){console.error('FAIL:',m); process.exitCode=1}
function readJsonDir(d){const p=path.join(root,d); if(!fs.existsSync(p)) return []; return fs.readdirSync(p).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(p,f),'utf8')))}
const events=readJsonDir('src/content/events');
const albums=readJsonDir('src/content/gallery');
const scriptName=path.basename(process.argv[1]);
function file(rel){return fs.existsSync(path.join(root,rel))}
function text(rel){return file(rel)?fs.readFileSync(path.join(root,rel),'utf8'):''}
function publicAsset(src){return file(path.join('public',String(src).replace(/^\//,'')))}
if(scriptName.includes('validate-content')){
  if(events.length<8) fail('Expected seeded past events.');
  if(!text('src/pages/index.astro').includes('Featured Affair')) fail('Homepage missing Featured Affair section.');
}
if(scriptName.includes('validate-routes')) ['src/pages/index.astro','src/pages/events.astro','src/pages/gallery.astro','src/pages/admin.astro','src/pages/sheila.astro','src/pages/contact.astro'].forEach(f=>{if(!file(f)) fail(`Missing ${f}`)});
if(scriptName.includes('validate-events')) {
  for(const e of events){
    if(e.status!=='past' && e.slug!=='e2e-test') fail(`Seeded event must be past: ${e.slug}`);
    if(e.registrationType && e.registrationType!=='none') fail(`Seeded archive event must not show registration CTA: ${e.slug}`);
    ['title','slug','category','summary','featuredImage'].forEach(k=>{ if(!String(e[k]||'').trim()) fail(`Event ${e.slug||'(missing slug)'} missing ${k}`); });
  }
  const eventsPage=text('src/pages/events.astro');
  ['event-card__title','event-card__description','event-category-pill','event-card__media'].forEach(token=>{ if(!eventsPage.includes(token)) fail(`Events page missing visible event card token ${token}`); });
  const home=text('src/pages/index.astro');
  ['featured-affair-card','featured-affair-card__summary','Featured Past Affair'].forEach(token=>{ if(!home.includes(token)) fail(`Homepage featured affair missing ${token}`); });
}
if(scriptName.includes('validate-published')) { if(events.some(e=>typeof e.published==='undefined')) fail('Events need published field.'); if(albums.some(a=>typeof a.published==='undefined')) fail('Albums need published field.'); }
if(scriptName.includes('validate-admin')) {
  const required=['functions/api/create-event.ts','functions/api/create-gallery-album.ts','functions/api/create-insight.ts','functions/api/republish-content.ts','functions/api/delete-content.ts','functions/api/set-homepage-feature.ts','functions/api/unpublish-content.ts','functions/api/list-admin-content.ts','functions/_shared/github.ts'];
  required.forEach(f=>{if(!file(f)) fail(`Missing admin endpoint/helper ${f}`)});
  const endpointText=required.map(text).join('\n');
  if(endpointText.includes('endpoint scaffold') || endpointText.includes('Configure env registry for production GitHub commits')) fail('Admin endpoints still contain scaffold placeholder text.');
  ['GITHUB_CONTENT_TOKEN','putTextFile','githubApi','requireAdmin'].forEach(token=>{ if(!endpointText.includes(token)) fail(`Admin endpoint implementation missing ${token}`); });
  const adminPage=text('src/pages/admin.astro');
  if(adminPage.includes('slug/id') || adminPage.includes('Event, album, or video slug')) fail('Admin still exposes confusing slug/id copy.');
  if(!adminPage.includes('data-feature-choice')) fail('Admin homepage feature selector must be human-readable dropdown.');
  const adminJs=text('src/scripts/site.js');
  ['/api/create-event','/api/create-gallery-album','/api/create-insight','/api/list-admin-content','/api/unpublish-content','/api/republish-content','/api/delete-content','/api/set-homepage-feature'].forEach(api=>{ if(!adminJs.includes(api)) fail(`Admin UI does not call ${api}`); });
}
if(scriptName.includes('validate-secrets')) { const bad=['ghp_','github_pat_','GITHUB_CONTENT_TOKEN=gh','sk-']; const files=fs.readdirSync(root,{recursive:true}).filter(f=>!String(f).includes('node_modules')&&!String(f).includes('dist')&&!String(f).includes('.git')); for(const f of files){const p=path.join(root,f); if(fs.statSync(p).isFile()){const s=fs.readFileSync(p,'utf8'); if(bad.some(b=>s.includes(b))) fail(`Possible secret in ${f}`)}} }
if(scriptName.includes('validate-assets')) {
  ['/assets/brand/sheila/sheila-blue-hat-about.png','/assets/brand/sheila/sheila-black-dress-hero.jpg','/assets/brand/sheila/sheila-twirling-black-dress.jpg','/assets/sarasota/sarasota-gulf-coast-yacht.jpg','/assets/flyers/tuxedo-ball.png'].forEach(a=>{if(!publicAsset(a)) fail(`Missing asset ${a}`)});
  [...events.map(e=>e.featuredImage), ...albums.map(a=>a.coverImage), ...albums.flatMap(a=>(a.media||[]).flatMap(m=>[m.src,m.poster].filter(Boolean)))].filter(Boolean).forEach(a=>{ if(String(a).startsWith('/assets/')&&!publicAsset(a)) fail(`Missing referenced public asset ${a}`); });
}
if(scriptName.includes('validate-social')) { const s=text('src/data/site.json'); ['facebook.com/fabulousgigi58','instagram.com/fabulousgigi58','tiktok.com/@fabul11'].forEach(x=>{if(!s.includes(x)) fail(`Missing social ${x}`)}) }
if(scriptName.includes('validate-media')) { const vids=albums.flatMap(a=>a.media||[]).filter(m=>m.type==='video'); if(vids.length<1) fail('Expected seeded videos.'); vids.forEach(v=>{if(!String(v.src||'').endsWith('.mp4')) fail('Videos must be MP4 for public rendering.');}); const gallery=text('src/pages/gallery.astro'); ['Moments & Photos','Event Albums','Flyer Archive','Video Moments'].forEach(x=>{if(!gallery.includes(x)) fail(`Gallery missing ${x} section`)}) }
if(scriptName.includes('validate-schema')) { if(!file('src/lib/schema.ts')) fail('Missing schema lib.'); }
if(scriptName.includes('validate-links')) { const p=path.join(root,'src/pages'); if(!fs.existsSync(p)) fail('Missing pages directory.'); }
if(!process.exitCode) console.log('PASS', scriptName);
