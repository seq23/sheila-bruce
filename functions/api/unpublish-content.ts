import { json, readBody, requireAdmin, contentPath, getFile, putTextFile, setMarkdownPublished } from '../_shared/github';

export async function onRequestPost({ request, env }: any) {
  const denied = requireAdmin(request, env); if (denied) return denied;
  try {
    const body = await readBody(request); const path = contentPath(body.type, body.slug);
    const file = await getFile(env, path); if (!file?.content) return json({ ok: false, error: 'CONTENT_NOT_FOUND' }, 404);
    const text = decodeURIComponent(escape(atob(String(file.content).replace(/\n/g, ''))));
    let next = text;
    if (path.endsWith('.json')) { const data = JSON.parse(text); data.published = false; next = JSON.stringify(data, null, 2) + '\n'; }
    else next = setMarkdownPublished(text, false);
    await putTextFile(env, path, next, `Unpublish ${body.type}: ${body.slug}`);
    return json({ ok: true });
  } catch (error: any) { return json({ ok: false, error: 'UNPUBLISH_FAILED', message: error.message }, 500); }
}
