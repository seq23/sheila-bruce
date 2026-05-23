import { json, readBody } from '../_shared/github';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

export async function onRequestPost({ request, env }: any) {
  try {
    const body = await readBody(request);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    if (!name || !isValidEmail(email)) {
      return json({ ok: false, error: 'INVALID_SUBSCRIBE_FIELDS', message: 'Please enter a name and valid email.' }, 400);
    }
    if (!env.GOOGLE_APPS_SCRIPT_URL) {
      return json({ ok: false, error: 'GOOGLE_APPS_SCRIPT_URL_MISSING', message: 'Mailing list intake is not configured yet.' }, 500);
    }

    const payload = {
      name,
      email,
      source: 'contact-page-mailing-list',
      page: '/contact',
      submittedAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || ''
    };

    const res = await fetch(env.GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      return json({ ok: false, error: 'SHEET_APPEND_FAILED', message: 'Mailing list intake failed.' }, 502);
    }

    return json({ ok: true, message: 'You’re on the list. Fabulous things are coming.' });
  } catch (error: any) {
    return json({ ok: false, error: 'SUBSCRIBE_FAILED', message: error.message || 'Mailing list signup failed.' }, 500);
  }
}
