# Environment Registry

| Name | Required | Where used | Notes |
|---|---:|---|---|
| ADMIN_PASSWORD | yes | `/admin` auth | Initial value: `blackgirlmagic` |
| GITHUB_CONTENT_TOKEN | yes for production admin publish | Cloudflare Function | GitHub token with repo content write access |
| GITHUB_REPO_OWNER | yes | Cloudflare Function | GitHub username or org |
| GITHUB_REPO_NAME | yes | Cloudflare Function | `sheila-bruce` |
| GITHUB_TARGET_BRANCH | yes | Cloudflare Function | `main` |
| CONTACT_TO_EMAIL | optional | Contact function | `asheilabruceaffair@gmail.com` |
| GOOGLE_APPS_SCRIPT_URL | optional | Contact function | Only needed for Apps Script relay |
