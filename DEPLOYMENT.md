# Deployment

## Project layout

This is an npm-workspaces monorepo with two workspaces:

- `frontend/` — the deployable Next.js app (UI + API route handlers)
- `backend/` — internal package (`@meridian/backend`) with Prisma, DB access,
  and all server-only services; consumed by `frontend` via a TypeScript path
  alias, not published or deployed on its own.

Both deploy targets below build from the **repo root** (`npm ci` installs
both workspaces), then delegate into `frontend`/`backend` via `npm run <script> -w <workspace>`.

## Vercel

1. Set `DATABASE_URL`, `ENCRYPTION_KEY`, `CRON_SECRET`, and `GITHUB_WEBHOOK_SECRET` as project environment variables before the first deploy (see `.env.example` for what each one does). `DATABASE_URL` must be reachable at build time.
2. **Root Directory**: in the Vercel project's Settings → General, set **Root Directory** to `frontend`. Vercel auto-detects the npm workspaces root and still runs `npm ci` at the repo root before building, but needs to know the Next.js app itself lives in `frontend/`. `frontend/vercel.json` (moved from the repo root) is picked up from there.
3. Vercel automatically runs the `vercel-build` script (`npm run prisma:generate -w backend && npm run prisma:migrate:deploy -w backend && npm run build -w frontend`) instead of `build`, so pending migrations apply before the app builds — no manual migration step needed.
4. If using GitHub webhooks, configure the webhook URL (`https://your-domain.com/api/webhooks/github`) in the repo/org settings with a secret matching `GITHUB_WEBHOOK_SECRET`.
5. The daily sync cron (`frontend/vercel.json`) is picked up automatically by Vercel Cron.

## Render

A `render.yaml` Blueprint is included at the repo root.

1. In the Render dashboard: **New → Blueprint**, connect this repo. Render reads `render.yaml` and creates the `meridian-web` service.
2. Set the env vars listed in `render.yaml` (`DATABASE_URL`, `ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, `GITHUB_WEBHOOK_SECRET`, and optionally `ANTHROPIC_API_KEY` / `NEXT_PUBLIC_SUPABASE_*`) in the service's Environment tab. Render won't deploy successfully without `DATABASE_URL` and `ENCRYPTION_KEY` at minimum.
3. The build command (`npm ci && npm run prisma:generate -w backend && npm run prisma:migrate:deploy -w backend && npm run build -w frontend`) runs from the repo root and runs `prisma migrate deploy` automatically, same as the Vercel path. No Root Directory setting needed — Render always builds from the repo root.
4. Render has no built-in equivalent to `vercel.json`'s cron — add a separate **Cron Job** in the Render dashboard that runs once daily and calls:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" https://<your-render-service>.onrender.com/api/cron/sync
   ```
5. GitHub webhook setup is the same as the Vercel path — point at `https://<your-render-service>.onrender.com/api/webhooks/github`.

## Environment Variables

| Variable | Required | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ENCRYPTION_KEY` | Yes | 32-byte base64 key — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL the app is served from |
| `CRON_SECRET` | Production only | Protects the daily sync endpoint |
| `GITHUB_WEBHOOK_SECRET` | Production only | Verifies GitHub webhook signatures |
| `ANTHROPIC_API_KEY` | No | Enables AI-generated summaries; rule-based insights work without it |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Enables realtime dashboard updates |
