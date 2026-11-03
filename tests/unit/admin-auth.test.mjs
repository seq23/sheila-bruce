// Security sweep 3 Nov 2026: admin sign-in fell back to a word committed in this public repo when
// ADMIN_PASSWORD was unset, the cookie value WAS the password, and there was no brute-force limit.
// This drives the real Pages Function (functions/api/admin-auth.ts) and the shared admin check.
import test from 'node:test';
import assert from 'node:assert/strict';

const { onRequestPost } = await import('../../functions/api/admin-auth.ts');
const { requireAdminSession, LOCKOUT_MAX } = await import('../../functions/_shared/admin-session.ts');

const PASSWORD = 'correct horse battery staple test';
function memKV() {
  const m = new Map();
  return { get: async (k) => m.get(k) ?? null, put: async (k, v) => { m.set(k, v); }, delete: async (k) => { m.delete(k); } };
}
const fullEnv = () => ({ ADMIN_PASSWORD: PASSWORD, ADMIN_SESSION_SECRET: 'test-session-secret-0123456789abcdef', ADMIN_LOCKOUT: memKV() });
const post = (env, password, ip = '203.0.113.7') => onRequestPost({
  env,
  request: new Request('https://example.test/api/admin-auth', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip }, body: JSON.stringify({ password }) })
});
const adminReq = (headers = {}) => new Request('https://example.test/api/list-admin-content', { headers });

test('ADMIN_PASSWORD unset → 503, never a fallback word', async () => {
  const env = fullEnv(); delete env.ADMIN_PASSWORD;
  for (const guess of ['blackgirlmagic', '', 'admin']) assert.equal((await post(env, guess)).status, 503);
  assert.equal((await requireAdminSession(adminReq({ 'x-asba-admin-password': 'blackgirlmagic' }), env)).status, 503);
});

test('wrong password → 401 with no cookie', async () => {
  const res = await post(fullEnv(), 'nope');
  assert.equal(res.status, 401);
  assert.equal(res.headers.get('set-cookie'), null);
});

test(`${LOCKOUT_MAX} wrong tries from one IP → 429, even with the right password; other IPs unaffected`, async () => {
  const env = fullEnv();
  for (let i = 0; i < LOCKOUT_MAX; i++) assert.equal((await post(env, `wrong-${i}`)).status, 401);
  const locked = await post(env, PASSWORD);
  assert.equal(locked.status, 429);
  assert.ok(Number(locked.headers.get('retry-after')) > 0);
  assert.equal((await post(env, PASSWORD, '198.51.100.9')).status, 200);
});

test('right password → signed session cookie that is not the password and unlocks admin routes', async () => {
  const env = fullEnv();
  const res = await post(env, PASSWORD);
  assert.equal(res.status, 200);
  const cookie = res.headers.get('set-cookie');
  assert.match(cookie, /^asba_admin=v1\.[^;]+; Path=\/; HttpOnly; Secure; SameSite=Strict/);
  const pair = cookie.split(';')[0];
  assert.ok(!decodeURIComponent(pair).includes(PASSWORD));
  assert.equal(await requireAdminSession(adminReq({ cookie: pair }), env), null);
  // The old schemes no longer work: password as cookie, password in a header, a tampered token.
  assert.equal((await requireAdminSession(adminReq({ cookie: `asba_admin=${encodeURIComponent(PASSWORD)}` }), env)).status, 401);
  assert.equal((await requireAdminSession(adminReq({ 'x-asba-admin-password': PASSWORD }), env)).status, 401);
  assert.equal((await requireAdminSession(adminReq({ cookie: pair.slice(0, -2) + 'xx' }), env)).status, 401);
  // Changing the password ends existing sessions.
  assert.equal((await requireAdminSession(adminReq({ cookie: pair }), { ...env, ADMIN_PASSWORD: 'rotated' })).status, 401);
});
