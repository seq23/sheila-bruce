import { signIn } from '../_shared/admin-session.ts';

// Signs the admin in: checks the password (constant time, per-IP lockout) and sets a signed session cookie.
export async function onRequestPost({ request, env }: any) {
  return signIn(request, env);
}
