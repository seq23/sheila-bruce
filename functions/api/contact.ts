import { json, readBody } from '../_shared/github';

export async function onRequestPost({ request, env }: any) {
  try {
    const body = await readBody(request);
    if (!body.name || !body.email || !body.message) return json({ ok: false, error: 'MISSING_REQUIRED_FIELDS', message: 'Name, email, and message are required.' }, 400);
    if (env.GOOGLE_APPS_SCRIPT_URL) {
      const res = await fetch(env.GOOGLE_APPS_SCRIPT_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, to: env.CONTACT_TO_EMAIL || 'asheilabruceaffair@gmail.com' }) });
      if (!res.ok) return json({ ok: false, error: 'CONTACT_RELAY_FAILED', message: 'The contact relay did not accept the message.' }, 502);
      return json({ ok: true, message: 'Message sent.' });
    }
    return json({ ok: true, message: 'Message captured in preview mode. Configure GOOGLE_APPS_SCRIPT_URL to send live email.', previewOnly: true });
  } catch (error: any) { return json({ ok: false, error: 'CONTACT_FAILED', message: error.message }, 500); }
}
