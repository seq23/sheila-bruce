import { json, readBody } from '../_shared/github';

export async function onRequestPost({ request, env }: any) {
  const body = await readBody(request);
  const expected = env.ADMIN_PASSWORD || 'blackgirlmagic';
  if (body.password !== expected) return json({ ok: false, error: 'INVALID_PASSWORD', message: 'Wrong password.' }, 401);
  return json({ ok: true, message: 'Admin unlocked.' }, 200, {
    'set-cookie': `asba_admin=${encodeURIComponent(expected)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200`
  });
}
