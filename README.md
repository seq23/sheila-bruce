Live: https://sheila-bruce.pages.dev

# A Sheila Bruce Affair Site

Luxury lifestyle and event brand website for A Sheila Bruce Affair.

## Local preview
```bash
npm install
npm run dev
```
Open http://localhost:4321

## Validate
```bash
NODE_OPTIONS="--max-old-space-size=3072" npm run validate:all
```

## Admin
Admin is at `/admin`. The password is the `ADMIN_PASSWORD` Pages secret (never in this repo). On localhost, `/admin` opens a local preview with any password.
Local mode uses browser storage for testing. Production mode uses Cloudflare env vars and GitHub commit automation.
