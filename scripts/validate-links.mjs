import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
function fail(m){console.error('FAIL:',m); process.exitCode=1}
function readJsonDir(d){const p=path.join(root,d); if(!fs.existsSync(p)) return []; return fs.readdirSync(p).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(p,f),'utf8')))}
const events=readJsonDir('src/content/events'); const albums=readJsonDir('src/content/gallery');
if(process.argv[1].includes('validate-content') && events.length<8) fail('Expected seeded past events.');
if(process.argv[1].includes('validate-routes')) ['src/pages/index.astro','src/pages/events.astro','src/pages/gallery.astro','src/pages/admin.astro','src/pages/sheila.astro'].forEach(f=>{if(!fs.existsSync(path.join(root,f))) fail(`Missing ${f}`)});
if(process.argv[1].includes('validate-events')) { if(events.some(e=>e.status!=='past' && e.slug!=='e2e-test')) fail('Seeded events must be past.'); if(events.some(e=>e.registrationType && e.registrationType!=='none')) fail('Seeded archive events must not show registration CTAs.'); }
if(process.argv[1].includes('validate-published')) { if(events.some(e=>typeof e.published==='undefined')) fail('Events need published field.'); if(albums.some(a=>typeof a.published==='undefined')) fail('Albums need published field.'); }
if(process.argv[1].includes('validate-admin')) {
  const required=['functions/api/create-event.ts','functions/api/create-gallery-album.ts','functions/api/create-insight.ts','functions/api/republish-content.ts','functions/api/delete-content.ts','functions/api/set-homepage-feature.ts','functions/api/unpublish-content.ts','functions/api/list-admin-content.ts','functions/_shared/github.ts'];
  required.forEach(f=>{if(!fs.existsSync(path.join(root,f))) fail(`Missing admin endpoint/helper ${f}`)});
  const endpointText=required.map(f=>fs.existsSync(path.join(root,f))?fs.readFileSync(path.join(root,f),'utf8'):'').join('\n');
  if(endpointText.includes('endpoint scaffold') || endpointText.includes('Configure env registry for production GitHub commits')) fail('Admin endpoints still contain scaffold placeholder text.');
  ['GITHUB_CONTENT_TOKEN','putTextFile','githubApi','requireAdmin'].forEach(token=>{ if(!endpointText.includes(token)) fail(`Admin endpoint implementation missing ${token}`); });
  const adminJs=fs.readFileSync(path.join(root,'src/scripts/site.js'),'utf8');
  ['/api/create-event','/api/create-gallery-album','/api/create-insight','/api/list-admin-content','/api/unpublish-content','/api/republish-content','/api/delete-content','/api/set-homepage-feature','/api/contact'].forEach(api=>{ if(!adminJs.includes(api)) fail(`Admin UI does not call ${api}`); });
}
if(process.argv[1].includes('validate-secrets')) { const bad=['ghp_','github_pat_','GITHUB_CONTENT_TOKEN=gh','sk-']; const files=fs.readdirSync(root,{recursive:true}).filter(f=>!String(f).includes('node_modules')&&!String(f).includes('dist')); for(const f of files){const p=path.join(root,f); if(fs.statSync(p).isFile()){const s=fs.readFileSync(p,'utf8'); if(bad.some(b=>s.includes(b))) fail(`Possible secret in ${f}`)}} }
if(process.argv[1].includes('validate-assets')) ['/assets/brand/sheila/sheila-blue-hat-about.png','/assets/brand/sheila/sheila-black-dress-hero.jpg','/assets/flyers/tuxedo-ball.png'].forEach(a=>{if(!fs.existsSync(path.join(root,'public',a))) fail(`Missing asset ${a}`)});
if(process.argv[1].includes('validate-social')) { const s=fs.readFileSync(path.join(root,'src/data/site.json'),'utf8'); ['facebook.com/fabulousgigi58','instagram.com/fabulousgigi58','tiktok.com/@fabul11'].forEach(x=>{if(!s.includes(x)) fail(`Missing social ${x}`)}) }
if(process.argv[1].includes('validate-media')) { const vids=albums.flatMap(a=>a.media||[]).filter(m=>m.type==='video'); if(vids.length<1) fail('Expected seeded videos.'); vids.forEach(v=>{if(!v.src.endsWith('.mp4')) fail('Videos must be MP4 for public rendering.');}); }
if(process.argv[1].includes('validate-schema')) { if(!fs.existsSync(path.join(root,'src/lib/schema.ts'))) fail('Missing schema lib.'); }
if(process.argv[1].includes('validate-links')) { const p=path.join(root,'src/pages'); if(!fs.existsSync(p)) fail('Missing pages directory.'); }
if(!process.exitCode) console.log('PASS', path.basename(process.argv[1]));
