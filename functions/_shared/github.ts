type Env = {
  ADMIN_PASSWORD?: string;
  GITHUB_CONTENT_TOKEN?: string;
  GITHUB_REPO_OWNER?: string;
  GITHUB_REPO_NAME?: string;
  GITHUB_TARGET_BRANCH?: string;
  GOOGLE_APPS_SCRIPT_URL?: string;
  CONTACT_TO_EMAIL?: string;
};

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } });
}

export function slugify(value: string) {
  return (value || 'item')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'item';
}

export function requireAdmin(request: Request, env: Env) {
  const expected = env.ADMIN_PASSWORD || 'blackgirlmagic';
  const cookie = request.headers.get('cookie') || '';
  const header = request.headers.get('x-asba-admin-password') || '';
  const hasCookie = cookie.split(';').some(part => part.trim() === `asba_admin=${encodeURIComponent(expected)}`);
  if (header === expected || hasCookie) return null;
  return json({ ok: false, error: 'ADMIN_REQUIRED', message: 'Admin password/session required.' }, 401);
}

export async function readBody(request: Request) {
  try { return await request.json(); } catch { return {}; }
}

function requireGithubEnv(env: Env) {
  const missing = ['GITHUB_CONTENT_TOKEN', 'GITHUB_REPO_OWNER', 'GITHUB_REPO_NAME', 'GITHUB_TARGET_BRANCH'].filter(k => !(env as any)[k]);
  if (missing.length) throw new Error(`GITHUB_ENV_MISSING:${missing.join(',')}`);
}

export function toBase64(str: string) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function githubApi(env: Env, repoPath: string, init: RequestInit = {}) {
  requireGithubEnv(env);
  const url = `https://api.github.com/repos/${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}/contents/${repoPath}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'accept': 'application/vnd.github+json',
      'authorization': `Bearer ${env.GITHUB_CONTENT_TOKEN}`,
      'x-github-api-version': '2022-11-28',
      'user-agent': 'asba-admin-publisher',
      ...(init.headers || {})
    }
  });
  return res;
}

export async function getFile(env: Env, repoPath: string) {
  const res = await githubApi(env, repoPath, { method: 'GET' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GITHUB_GET_FAILED:${repoPath}:${res.status}`);
  return await res.json() as any;
}

export async function putTextFile(env: Env, repoPath: string, text: string, message: string) {
  const existing = await getFile(env, repoPath);
  const body: Record<string, unknown> = {
    message,
    branch: env.GITHUB_TARGET_BRANCH || 'main',
    content: toBase64(text)
  };
  if (existing?.sha) body.sha = existing.sha;
  const res = await githubApi(env, repoPath, { method: 'PUT', body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`GITHUB_PUT_FAILED:${repoPath}:${res.status}:${await res.text()}`);
  return await res.json();
}

export async function putBase64File(env: Env, repoPath: string, base64Content: string, message: string) {
  const existing = await getFile(env, repoPath);
  const body: Record<string, unknown> = {
    message,
    branch: env.GITHUB_TARGET_BRANCH || 'main',
    content: base64Content.replace(/^data:[^,]+,/, '')
  };
  if (existing?.sha) body.sha = existing.sha;
  const res = await githubApi(env, repoPath, { method: 'PUT', body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`GITHUB_PUT_FAILED:${repoPath}:${res.status}:${await res.text()}`);
  return await res.json();
}

export async function deleteFile(env: Env, repoPath: string, message: string) {
  const existing = await getFile(env, repoPath);
  if (!existing?.sha) return { skipped: true };
  const res = await githubApi(env, repoPath, {
    method: 'DELETE',
    body: JSON.stringify({ message, branch: env.GITHUB_TARGET_BRANCH || 'main', sha: existing.sha })
  });
  if (!res.ok) throw new Error(`GITHUB_DELETE_FAILED:${repoPath}:${res.status}:${await res.text()}`);
  return await res.json();
}

export function contentPath(type: string, slug: string) {
  if (type === 'event') return `src/content/events/${slug}.json`;
  if (type === 'album') return `src/content/gallery/${slug}.json`;
  if (type === 'post' || type === 'insight') return `src/content/insights/${slug}.md`;
  throw new Error('UNKNOWN_CONTENT_TYPE');
}

export function markdownPost(data: any) {
  const title = data.title || 'Untitled Inspiration';
  const slug = data.slug || slugify(title);
  const date = data.date || new Date().toISOString().slice(0, 10);
  const body = data.body || 'More details coming soon.';
  return `---\ntitle: ${JSON.stringify(title)}\nslug: ${JSON.stringify(slug)}\npublished: ${data.published === false ? 'false' : 'true'}\nstatus: ${JSON.stringify(data.status || 'published')}\nfeaturedOnHome: ${data.featuredOnHome ? 'true' : 'false'}\ncategory: ${JSON.stringify(data.category || 'Community & Culture')}\ndate: ${JSON.stringify(date)}\nsummary: ${JSON.stringify(data.summary || '')}\nfeaturedImage: ${JSON.stringify(data.featuredImage || '')}\nseoTitle: ${JSON.stringify(data.seoTitle || '')}\nseoDescription: ${JSON.stringify(data.seoDescription || '')}\n---\n\n${body}\n`;
}

export function setMarkdownPublished(markdown: string, published: boolean) {
  if (/^published:\s*(true|false)/m.test(markdown)) return markdown.replace(/^published:\s*(true|false)/m, `published: ${published}`);
  return markdown.replace(/^---\n/, `---\npublished: ${published}\n`);
}
