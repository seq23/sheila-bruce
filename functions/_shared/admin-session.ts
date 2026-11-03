// Admin sign-in and session (security sweep, 3 Nov 2026).
// - ADMIN_PASSWORD lives only in Cloudflare Pages env. No fallback: unset → 503 (fail closed).
// - The session cookie is a signed random token (HMAC-SHA256 with ADMIN_SESSION_SECRET), never the password.
// - Password check is constant-time (compare SHA-256 digests byte by byte).
// - Per-IP lockout: LOCKOUT_MAX failed tries in LOCKOUT_WINDOW_S → 429 until the window ends (KV ADMIN_LOCKOUT).
// Self-contained (no relative imports) so tests/unit/admin-auth.test.mjs can import it directly.

type KV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
};
export type AdminEnv = { ADMIN_PASSWORD?: string; ADMIN_SESSION_SECRET?: string; ADMIN_LOCKOUT?: KV };

export const COOKIE = 'asba_admin';
export const SESSION_TTL_S = 12 * 60 * 60;
export const LOCKOUT_MAX = 10;
export const LOCKOUT_WINDOW_S = 15 * 60;

const enc = new TextEncoder();

function reply(data: unknown, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers } });
}

function notConfigured(env: AdminEnv) {
  const missing = ['ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET', 'ADMIN_LOCKOUT'].filter((k) => !(env as any)?.[k]);
  if (!missing.length) return null;
  return reply({ ok: false, error: 'ADMIN_NOT_CONFIGURED', message: 'Admin sign-in is not set up on this site yet.', missing }, 503);
}

async function sha256(s: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
}

function sameBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function b64url(bytes: Uint8Array) {
  let s = '';
  for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret: string, msg: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}

// The signature also covers a digest of the current password, so changing ADMIN_PASSWORD ends every session.
async function signPayload(env: AdminEnv, payload: string) {
  const pw = b64url(await sha256(env.ADMIN_PASSWORD as string));
  return b64url(await hmac(env.ADMIN_SESSION_SECRET as string, `${payload}|${pw}`));
}

async function newSession(env: AdminEnv, now: number) {
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(24)));
  const payload = `v1.${now + SESSION_TTL_S}.${nonce}`;
  return `${payload}.${await signPayload(env, payload)}`;
}

async function validSession(env: AdminEnv, token: string, now: number) {
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < now) return false;
  const expected = await signPayload(env, parts.slice(0, 3).join('.'));
  return sameBytes(enc.encode(expected), enc.encode(parts[3]));
}

function clientIp(request: Request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

function readCookie(request: Request, name: string) {
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return '';
}

type Fails = { n: number; until: number };

async function readFails(kv: KV, key: string, now: number): Promise<Fails> {
  try {
    const f = JSON.parse((await kv.get(key)) || 'null');
    if (f && typeof f.n === 'number' && f.until > now) return f;
  } catch {}
  return { n: 0, until: now + LOCKOUT_WINDOW_S };
}

// POST /api/admin-auth  { password }
export async function signIn(request: Request, env: AdminEnv, now = Math.floor(Date.now() / 1000)) {
  const off = notConfigured(env); if (off) return off;
  const kv = env.ADMIN_LOCKOUT as KV;
  const key = `admin-fail:${clientIp(request)}`;
  const fails = await readFails(kv, key, now);
  if (fails.n >= LOCKOUT_MAX) {
    const wait = Math.max(1, fails.until - now);
    return reply({ ok: false, error: 'TOO_MANY_TRIES', message: `Too many tries. Please wait ${Math.ceil(wait / 60)} minutes and try again.` }, 429, { 'retry-after': String(wait) });
  }
  let body: any = {};
  try { body = await request.json(); } catch {}
  const typed = typeof body?.password === 'string' ? body.password : '';
  const ok = sameBytes(await sha256(typed), await sha256(env.ADMIN_PASSWORD as string));
  if (!ok) {
    const next = { n: fails.n + 1, until: fails.until };
    await kv.put(key, JSON.stringify(next), { expirationTtl: Math.max(60, next.until - now) });
    return reply({ ok: false, error: 'INVALID_PASSWORD', message: 'Wrong password.' }, 401);
  }
  if (fails.n) await kv.delete(key);
  const token = await newSession(env, now);
  return reply({ ok: true, message: 'Admin unlocked.' }, 200, {
    'set-cookie': `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_S}`
  });
}

// Every admin endpoint: returns a Response to send back when the caller is not signed in, else null.
export async function requireAdminSession(request: Request, env: AdminEnv, now = Math.floor(Date.now() / 1000)) {
  const off = notConfigured(env); if (off) return off;
  const token = readCookie(request, COOKIE);
  if (token && await validSession(env, token, now)) return null;
  return reply({ ok: false, error: 'ADMIN_REQUIRED', message: 'Please sign in to the admin page again.' }, 401);
}
