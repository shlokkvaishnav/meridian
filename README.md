<div align="center">

# Meridian

**Turn raw GitHub activity into engineering decisions.**

[![Status](https://img.shields.io/badge/status-active-brightgreen)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](#)

[Getting Started](#getting-started) · [Deployment](#deployment)
<!-- Add a live demo link here once deployed: · [Live Demo](https://your-deployment-url) -->

</div>

<!-- Screenshot: dashboard overview -->
<!-- ![Dashboard overview](./docs/screenshot-dashboard.png) -->

---

## The Problem

Engineering managers are asked to answer questions their tools don't support:

- Why is code review taking longer this sprint than last?
- Which contributors are carrying disproportionate load, and is that sustainable?
- Are we actually shipping faster than last quarter, or does it just feel that way?

The raw answer lives in GitHub, but it's scattered across hundreds of PRs, reviews, and commits — not something anyone can eyeball. Most teams either guess, or someone spends an afternoon manually digging through PR history before a planning meeting.

## The Approach

Meridian connects to GitHub with a read-only personal access token, syncs PR/review/commit history into its own database, and computes a fixed set of engineering metrics (cycle time, review velocity, merge rate) on a rolling window. A rule-based engine scans that data for specific, named patterns — a review bottleneck, an overloaded contributor, a burnout signal — and an optional Claude-powered layer turns the raw numbers into a plain-language summary a non-technical stakeholder can read in one pass.

The scope was kept deliberately narrow: one identity (a GitHub PAT) per session, one data source (GitHub), a fixed metric set rather than a configurable BI tool. That's a tradeoff — it's not a general analytics platform — but it means the insights are opinionated and specific rather than a dashboard someone still has to interpret.

## Sample Insight

This is the kind of output the insight engine produces — translated to what it would actually say to an engineering manager, not a raw metric:

> **Review bottleneck detected.** PRs in `api-gateway` are waiting a median of 3.2 days for first review — 2.3x the team's usual pace. Three of the last five delayed PRs were assigned to a single reviewer who also merged 40% of this sprint's work. Recommend redistributing review load before it becomes a release risk.

That's the difference this project is built around: a metric alone ("median time to first review: 3.2 days") requires someone to already know what's normal and what to do about it. A finding like the one above doesn't.

## Why These Metrics

Every metric in the dashboard was chosen for a specific decision it supports, not because it was easy to compute:

| Metric | What it measures | Why it matters to the business |
| :--- | :--- | :--- |
| **Cycle time (P50/P95)** | Time from first commit to merge | The P95, not the average, is what predicts missed deadlines — a handful of stuck PRs can blow a sprint even when the median looks fine |
| **Time to first review** | How long a PR waits before anyone looks at it | The single biggest lever on cycle time in most teams, and the easiest one to fix once it's visible |
| **Workload distribution** | PRs/reviews per contributor vs. team average | Uneven load is a retention risk before it's a velocity problem — replacing a senior engineer costs far more than redistributing their review queue |
| **Burnout signal** | Weekend/after-hours activity share | An early warning that shows up in the data weeks before it shows up in a 1:1 |
| **Merge rate** | Merged vs. closed-without-merging PRs | A rising abandonment rate usually means unclear requirements upstream, not a coding problem |

## Features

- **Insight engine** — rule-based detection for review bottlenecks, workload imbalance, burnout risk, and stale PRs, each with a defined, documented threshold (not a black box)
- **AI layer (optional)** — Claude-generated PR summaries and narrative work reports, additive on top of the rule-based engine, not a replacement for it
- **Team analytics** — group contributors into teams independent of GitHub's own org structure, with aggregate and per-contributor views
- **Real-time sync** — on-demand sync, a daily scheduled sync, and GitHub webhooks for live updates, all incremental (only fetches what changed)
- **Encrypted at rest** — GitHub tokens are AES-256-GCM encrypted before they touch the database; the raw token is never logged or exposed to the client

<!-- Screenshot: insight detail / sample report -->
<!-- ![Insight detail](./docs/screenshot-insights.png) -->

## Tech Stack

| Layer | Choice |
| :--- | :--- |
| Framework | Next.js 15 (App Router), React 19, TypeScript (strict) |
| Data | PostgreSQL, Prisma ORM |
| AI | Anthropic Claude |
| UI | Tailwind CSS, Radix primitives, Recharts |
| Auth | Encrypted-token sessions (no third-party auth provider) |

## Architecture

```
src/
├── app/            Routes and API handlers (Next.js App Router)
├── components/     UI, organized by feature area
├── services/       Business logic — metrics, insights, GitHub sync, AI
├── lib/            Shared utilities (db, encryption, session, env)
└── generated/      Prisma client (generated, not hand-written)
```

The insight engine (`src/services/insights/`) and metrics calculations (`src/services/stats.ts`, `src/services/metrics.ts`) are the core of the project — pure, tested functions with no framework dependency, callable independently of the web layer.

## Getting Started

**Prerequisites:** Node.js 18+, a PostgreSQL database, a GitHub personal access token.

```bash
git clone <repo-url>
cd meridian
npm install
cp .env.example .env   # fill in DATABASE_URL and ENCRYPTION_KEY at minimum
npx prisma generate
npx prisma migrate dev
npm run dev
```

Visit `http://localhost:3000`. Run `npm test` for the unit test suite.

## Deployment

Deployable to either Vercel or Render — see [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full walkthrough of both, including environment variables and cron/webhook setup. In short:

- **Vercel**: connect the repo, set the required env vars, deploy — migrations run automatically as part of the build.
- **Render**: a `render.yaml` Blueprint is included; connect the repo and set the same env vars in the dashboard.

## Roadmap

- Slack/Discord alerts for high-priority insights
- Configurable thresholds (today's "2.3x average" bottleneck rule is a constant, not a setting)
- Multi-org support
- Cached AI analysis, to avoid recomputing on every view

## License

MIT
