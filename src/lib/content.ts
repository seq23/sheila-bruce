import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
export type AnyRecord = Record<string, any>;
export function readJsonDir(dir: string): AnyRecord[] {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync(path.join(full,f),'utf8')));
}
export function readMarkdownDir(dir: string): AnyRecord[] {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f=>f.endsWith('.md')).map(f=>{
    const raw=fs.readFileSync(path.join(full,f),'utf8');
    const m=raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    const data:any={slug:f.replace(/\.md$/,'')};
    if(m){
      for(const line of m[1].split('\n')){ const i=line.indexOf(':'); if(i>0){ let k=line.slice(0,i).trim(); let v=line.slice(i+1).trim().replace(/^['\"]|['\"]$/g,''); if(v==='true') data[k]=true; else if(v==='false') data[k]=false; else data[k]=v; }}
      data.body=m[2];
    } else data.body=raw;
    return data;
  });
}
export const isPublished=(x:any)=>x?.published!==false && x?.status!=='unpublished';
export function sortEvents(events:any[]){return [...events].sort((a,b)=>(a.date||'').localeCompare(b.date||''));}
