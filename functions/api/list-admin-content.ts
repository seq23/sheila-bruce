import { json, requireAdmin, githubApi } from '../_shared/github';

async function listDir(env: any, dir: string, type: string) {
  const res = await githubApi(env, dir, { method: 'GET' });
  if (!res.ok) return [];
  const rows = await res.json() as any[];
  return rows.filter(row => row.type === 'file').map(row => ({ type, name: row.name, slug: row.name.replace(/\.(json|md)$/, ''), path: row.path, sha: row.sha }));
}

export async function onRequestGet({ request, env }: any) {
  const denied = requireAdmin(request, env); if (denied) return denied;
  try {
    const items = [
      ...(await listDir(env, 'src/content/events', 'event')),
      ...(await listDir(env, 'src/content/gallery', 'album')),
      ...(await listDir(env, 'src/content/insights', 'post'))
    ];
    return json({ ok: true, items });
  } catch (error: any) { return json({ ok: false, error: 'LIST_CONTENT_FAILED', message: error.message }, 500); }
}
