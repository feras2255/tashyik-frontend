# Frontend deployment and client-side routing

This Nuxt app can be deployed in two common ways. **Which one you choose determines whether you need SPA fallbacks** (so deep links and browser refresh do not return 404 from the static host).

## 1. Node server (Nuxt Nitro) — `nuxt build`

- Build: `npm run build` (or your CI equivalent).
- Run: `node .output/server/index.mjs` (or the process manager command your host documents).
- **Routing:** Nitro handles all application routes. You normally **do not** need `public/_redirects` or `.htaccess` rewrites for HTML routes on the same origin.
- **API:** Ensure the server can reach your API (see `runtimeConfig.apiInternalBaseUrl` if the public API hostname does not resolve from Node).

## 2. Static hosting — `nuxt generate`

- Build: `npm run generate`.
- Upload the generated static files (typically under `.output/public` or the configured output directory).
- **Routing:** The host only has real files for prerendered paths. Any other path (e.g. `/cities/riyadh` if not prerendered, or dynamic routes) must be **rewritten to `index.html`** so the client-side router can run.
- **Use the files in `public/`:**
  - `_redirects` — Netlify-style `/* → /index.html 200`.
  - `.htaccess` — Apache `RewriteRule` fallback to `/index.html`.
- **nginx:** See `nginx.frontend.example.conf` in this repo for a minimal `try_files` example.

## Summary

| Deploy mode   | Refresh / deep links      | SPA fallback files      |
|---------------|---------------------------|-------------------------|
| `nuxt build` + Node | Usually OK without rewrites | Optional at reverse proxy |
| `nuxt generate` + static | **Requires** rewrites     | **Yes** — use `public/` + host config |

If you see **404 only after refresh** on production but not in `npm run dev`, the cause is almost always missing static rewrites, not a bug in Vue Router.
