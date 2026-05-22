import { json, readBody, requireAdmin, contentPath, deleteFile } from '../_shared/github';

export async function onRequestPost({ request, env }: any) {
  const denied = requireAdmin(request, env); if (denied) return denied;
  try {
    const body = await readBody(request); const path = contentPath(body.type, body.slug);
    await deleteFile(env, path, `Delete ${body.type}: ${body.slug}`);
    return json({ ok: true });
  } catch (error: any) { return json({ ok: false, error: 'DELETE_FAILED', message: error.message }, 500); }
}
