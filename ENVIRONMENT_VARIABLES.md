# Environment Registry

| Name | Required | Where used | Notes |
|---|---:|---|---|
| ADMIN_PASSWORD | yes | `/admin` sign-in | Cloudflare Pages secret only; unset = admin returns 503 |
| ADMIN_SESSION_SECRET | yes | signs the admin session cookie | Cloudflare Pages secret (random, 32+ bytes) |
| ADMIN_LOCKOUT | yes | KV binding: per-IP lockout, 10 wrong tries / 15 min | Pages KV binding |
| GITHUB_CONTENT_TOKEN | yes for production admin publish | Cloudflare Function | GitHub token with repo content write access |
| GITHUB_REPO_OWNER | yes | Cloudflare Function | GitHub username or org |
| GITHUB_REPO_NAME | yes | Cloudflare Function | `sheila-bruce` |
| GITHUB_TARGET_BRANCH | yes | Cloudflare Function | `main` |
| CONTACT_TO_EMAIL | optional | Contact function | `asheilabruceaffair@gmail.com` |
| GOOGLE_APPS_SCRIPT_URL | optional | Contact function | Only needed for Apps Script relay |
