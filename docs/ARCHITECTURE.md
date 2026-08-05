# Architecture

## Stack

| Layer | Choice | Why |
| :--- | :--- | :--- |
| Framework | Next.js 15 (App Router), React 19 | Server-rendered pages and API routes in one codebase |
| Language | TypeScript (strict mode) | Type safety across the data layer and UI |
| Database | PostgreSQL via Prisma | Relational data — PRs, reviews, and repos are inherently joined |
| AI | Anthropic Claude | Optional layer on top of the rule-based engine, not a replacement for it |
| UI | Tailwind CSS, Radix primitives, Recharts, `motion` | Utility-first styling, accessible unstyled primitives, charts, animation |
| Auth | Encrypted-token sessions | No third-party auth provider — one GitHub PAT per session, encrypted at rest |

## Project Structure

```
src/
├── app/                    Next.js App Router — pages and API routes
│   ├── (dashboard)/        Authenticated routes (dashboard, contributor profiles)
│   ├── (marketing)/        Public landing page
│   ├── demo/                Unauthenticated demo with sample data
│   ├── setup/                Onboarding (GitHub token entry)
│   └── api/                  Route handlers — see API Reference below
├── components/              UI, organized by feature area (dashboard/, marketing/, ui/, ...)
├── services/                 Business logic, framework-independent
│   ├── stats.ts               Statistical primitives (mean, stddev, z-score, percentile)
│   ├── metrics.ts             Cycle time, review velocity, merge rate calculations
│   ├── insights/               Rule-based pattern detection (see below)
│   ├── risk.ts                 Contributor risk scoring
│   ├── ai.ts                   Claude integration
│   └── github/                  GitHub API client and sync logic
├── lib/                      Shared utilities — db client, encryption, session, env validation
└── generated/prisma/         Generated Prisma client (not hand-written; regenerate with `npx prisma generate`)
```

## Data Flow

1. **Connect** — user provides a GitHub PAT (`/api/auth/setup`); it's validated against GitHub's API, encrypted (AES-256-GCM), and stored. A session cookie is set.
2. **Sync** — on demand (`/api/sync`), on a daily schedule (`/api/cron/sync`), or in real time via GitHub webhooks (`/api/webhooks/github`). Sync is incremental: only PRs/reviews updated since the last sync are fetched.
3. **Compute** — `services/metrics.ts` and `services/stats.ts` turn raw PR/review rows into cycle time, review velocity, and merge rate figures.
4. **Detect** — `services/insights/index.ts` runs a fixed set of rules (see below) against the last 30 days of data and returns ranked findings.
5. **Present** — the dashboard renders metrics and insights; an optional Claude call can turn the rule-based findings into a narrative summary.

## The Insight Engine

Each rule in `services/insights/index.ts` is an independent, pure function that takes the PR dataset and returns zero or more findings. None of them share state, so adding a new rule means adding a new function and one line in `generateInsights`.

| Rule | Trigger | Statistical basis |
| :--- | :--- | :--- |
| Review bottleneck | An open PR's wait time is > 2 standard deviations above the team's mean review time | Z-score |
| Cycle time regression | This week's mean cycle time is > 1.5 std devs above the prior 3-week baseline | Z-score, trailing baseline |
| Workload imbalance | A contributor's PR count is > 2 std devs above the team mean | Z-score |
| Burnout signal | > 30% of a contributor's activity falls on weekends | Fixed threshold |
| Stale PR | An open PR hasn't been updated in 14+ days | Fixed threshold |
| Review capacity | More than 15 PRs are open at once | Fixed threshold |
| Positive patterns | Cycle time under 24 hours, or merge rate above 80% | Fixed threshold |

Z-score-based rules adapt to each team's own baseline instead of using a hardcoded "3 days is too slow" rule that would be wrong for both a fast-moving startup and a large regulated codebase.

## API Reference

All routes live under `src/app/api/`. Every route except the cron and webhook endpoints requires a valid session cookie.

| Route | Method | Purpose |
| :--- | :--- | :--- |
| `/api/auth/setup` | POST | Validate a GitHub token and create a session |
| `/api/sync` | POST | Trigger an on-demand sync |
| `/api/insights` | POST | Generate and store insights for the current user |
| `/api/teams` | GET/POST/PATCH/DELETE | Team CRUD |
| `/api/ai/summary` | GET | Claude-generated work summary |
| `/api/ai/pr/[prId]` | GET | Claude-generated PR analysis |
| `/api/cron/sync` | GET | Daily sync for all users (requires `CRON_SECRET` bearer token) |
| `/api/webhooks/github` | POST | Real-time PR/review updates (requires valid HMAC signature) |

## Security Notes

- GitHub tokens are AES-256-GCM encrypted before storage; the encryption key is never derived from anything stored in the database.
- Webhook payloads are verified against `GITHUB_WEBHOOK_SECRET` via HMAC-SHA256 before any data is written.
- API error responses never forward raw exception messages to the client — see `src/lib/api-error.ts`.
- Sensitive/expensive endpoints are rate-limited per session or IP — see `src/lib/rate-limit.ts`.
