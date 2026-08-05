# Meridian
**Engineering Intelligence Platform for GitHub**

Meridian is a sophisticated, privacy-focused analytics dashboard that helps engineering teams and individual developers gain actionable insights from their GitHub activity. It digs deep into Pull Request lifecycles to surface bottlenecks, celebrate wins, and prevent burnout—powered by a hybrid engine of deterministic rule-based analysis and Claude AI.

![Status](https://img.shields.io/badge/status-production%20ready-green) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 Project Overview

### The Problem
Engineering health is often opaque. Teams struggle to answer questions like:
- "Why are our code reviews taking longer?"
- "Who is at risk of burnout due to high workload?"
- "Are we blocking each other on critical merges?"

Standard tools either lack depth or require expensive, invasive integrations.

### The Solution
Meridian provides a **local-first, secure** way to visualize this data. It connects directly to GitHub via a personal access token, syncs your PR history to a secure database, and runs both a **deterministic insight engine** and an **AI layer** (powered by Claude) to detect patterns and generate strategic recommendations.

### Key Value Props
1. **Privacy First:** Your code never leaves GitHub. Only metadata (timestamps, authors, status) is analyzed.
2. **Hybrid Intelligence:** Rule-based algorithms for transparent, auditable insights—plus Claude AI for deeper PR analysis and strategic advice.
3. **Actionable Intelligence:** Not just numbers—concrete recommendations like "Re-assign reviews from Developer X who is overloaded."

---

## ✨ Key Features & Technical Depth

### 1. 🧠 Smart Insight Engine (`src/services/insights/`)
The core analysis engine scans 30 days of PR data to detect distinct patterns:
- **Review Bottlenecks:** Identifies PRs waiting >2x the average time for a review.
- **Workload Imbalance:** Flags contributors executing >3x the average team workload.
- **Burnout Risks:** Detects high weekend activity (>30% of commits/PRs).
- **Stale PRs:** Highlights work languishing for 14+ days.
- **Velocity Trends:** Compares current cycle times vs. historical baselines.

### 2. 🤖 Claude AI Integration (`src/services/ai.ts`)
Meridian integrates Claude (claude-3-5-sonnet) for three AI-powered capabilities:
- **PR Analysis:** Summarizes PRs, identifies risks, suggests improvements, and rates complexity.
- **Work Summaries:** Generates narrative overviews of a developer's recent merged work.
- **Strategic Insights:** Synthesizes multiple detected signals into a single high-level recommendation for engineering leaders.

### 3. 📊 High-Fidelity Metrics (`src/services/metrics.ts`)
Engineering metrics that matter:
- **Cycle Time:** Time from first commit to merge (P50 and P75 percentiles).
- **Time to First Review:** A key indicator of team responsiveness.
- **Merge Rate:** Ratio of merged vs. closed/abandoned PRs.
- **Risk Scoring:** Contributor-level risk assessment (`src/services/risk.ts`).

### 4. 🔐 Enterprise-Grade Security
- **AES-256-GCM Encryption:** GitHub PATs are encrypted at rest using a unique key (`src/lib/encryption.ts`).
- **Session Isolation:** Data is strictly scoped to the user's session.
- **Auth API:** Dedicated authentication flow (`/api/auth`).

### 5. 🔄 Robust Data Synchronization
- **Incremental Sync:** Tracks `lastSyncedAt` to fetch only new or updated PRs.
- **Resilient Cron Jobs:** A daily Vercel Cron job (`/api/cron/sync`) keeps data fresh automatically.
- **Webhook Support:** Real-time updates via GitHub webhooks (`/api/webhooks`).
- **Rate Limit Handling:** Built-in safeguards in the GitHub client (`src/services/github/`).

### 6. 👥 Team Analytics
- **Team Dashboard:** Aggregate stats across multiple repositories and contributors.
- **Contributor Profiles:** Per-developer metrics, risk scores, and activity breakdowns.
- **Teams API:** Dedicated endpoints for team-level data (`/api/teams`).

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | Server-side rendering, API routes, and modern React patterns. |
| **Language** | **TypeScript** | Strict type safety for robust data handling and refactoring. |
| **Database** | **PostgreSQL (Supabase)** | Relational data model for robust querying. |
| **ORM** | **Prisma** | Type-safe database queries and schema management. |
| **Styling** | **Tailwind CSS** | Utility-first styling for a rapid, responsive UI. |
| **UI Components** | **Lucide React** | Beautiful, consistent iconography. |
| **Charts** | **Recharts** | Composable, responsive data visualizations. |
| **AI** | **Anthropic Claude** | PR analysis, work summaries, and strategic insights. |
| **Encryption** | **Node.js Crypto** | Native `crypto` module for AES-256-GCM. |

---

## 📂 Project Structure

```
src/
├── app/                        # Next.js App Router (Pages & API)
│   ├── (dashboard)/            # Authenticated dashboard routes
│   │   ├── dashboard/          # Main analytics dashboard
│   │   └── contributors/       # Per-contributor profiles
│   ├── (marketing)/            # Public marketing/landing page
│   ├── demo/                   # Interactive demo (no auth required)
│   ├── setup/                  # Onboarding flow
│   └── api/                    # Backend API Routes
│       ├── ai/                 # AI analysis endpoints
│       ├── auth/               # Authentication
│       ├── cron/               # Scheduled tasks (Daily Sync)
│       ├── insights/           # Insight generation
│       ├── sync/               # On-demand sync
│       ├── teams/              # Team analytics
│       └── webhooks/           # GitHub webhook receiver
├── components/                 # Reusable React Components
│   ├── ai/                     # AI insight cards
│   ├── charts/                 # Data visualizations
│   ├── contributors/           # Contributor profile components
│   ├── dashboard/              # Dashboard layout & widgets
│   ├── insights/               # Insight display components
│   ├── layout/                 # App shell & navigation
│   ├── marketing/              # Landing page sections
│   ├── metrics/                # Metric cards & displays
│   ├── team/                   # Team analytics components
│   ├── theme/                  # Theme provider & toggle
│   └── ui/                     # Base UI primitives
├── services/                   # Core Business Logic
│   ├── ai.ts                   # Claude AI integration
│   ├── metrics.ts              # Statistical calculations
│   ├── risk.ts                 # Contributor risk scoring
│   ├── stats.ts                # Aggregate statistics
│   ├── github/                 # GitHub API client & sync
│   └── insights/               # Rule-based analysis engine
├── lib/                        # Shared Utilities
│   ├── db.ts                   # Prisma Client singleton
│   ├── encryption.ts           # Security utilities
│   ├── session.ts              # Session management
│   ├── utils.ts                # General helpers
│   └── validations/            # Input validation schemas
└── types/                      # Shared TypeScript types
```

---

## 💾 Data Model (`schema.prisma`)

- **AppSettings:** Stores user session and encrypted tokens.
- **Repository:** Tracks repositories and their sync status.
- **PullRequest:** Central entity with denormalized stats (lines added, files changed) for fast querying.
- **Insight:** Generated recommendations stored for historical tracking.
- **SyncJob:** Logs background job status for debugging.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database (Supabase recommended)
- GitHub Personal Access Token
- Anthropic API Key (for AI features)

### Installation

1. **Clone & Install**
    ```bash
    git clone <repo-url>
    cd meridian
    npm install
    ```

2. **Environment Setup**
    Copy `.env.example` to `.env` and fill in the values:
    ```bash
    cp .env.example .env
    ```
    `DATABASE_URL`, `ENCRYPTION_KEY`, and `NEXT_PUBLIC_APP_URL` are required.
    `ANTHROPIC_API_KEY` and the `NEXT_PUBLIC_SUPABASE_*` vars are optional (AI features / realtime updates degrade gracefully without them).
    `CRON_SECRET` and `GITHUB_WEBHOOK_SECRET` are optional in development but **required in production** — the app fails to start without them once `NODE_ENV=production`.

3. **Database Migration**
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```

4. **Run Locally**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000`

---

## 🚢 Deployment

### Vercel

1. Set `DATABASE_URL`, `ENCRYPTION_KEY`, `CRON_SECRET`, and `GITHUB_WEBHOOK_SECRET` as project environment variables before the first deploy (see `.env.example`). `DATABASE_URL` must be reachable at build time.
2. Vercel automatically runs the `vercel-build` script (`prisma generate && prisma migrate deploy && next build`) instead of `build`, so pending migrations apply before the app builds — no manual migration step needed.
3. If using GitHub webhooks, configure the webhook URL (`https://your-domain.com/api/webhooks/github`) in the repo/org settings with a secret matching `GITHUB_WEBHOOK_SECRET`.
4. The daily sync cron (`vercel.json`) is picked up automatically by Vercel Cron.

### Render

A `render.yaml` Blueprint is included at the repo root.

1. In the Render dashboard, **New → Blueprint**, connect this repo. Render reads `render.yaml` and creates the `meridian-web` service.
2. Set the env vars listed in `render.yaml` (`DATABASE_URL`, `ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`, `GITHUB_WEBHOOK_SECRET`, and optionally `ANTHROPIC_API_KEY`/`NEXT_PUBLIC_SUPABASE_*`) in the service's Environment tab — Render won't deploy successfully without `DATABASE_URL` and `ENCRYPTION_KEY` at minimum.
3. The build command runs `prisma migrate deploy` automatically, same as the Vercel path.
4. Render has no built-in equivalent to `vercel.json`'s cron — add a separate **Cron Job** in the Render dashboard (Render → New → Cron Job) that runs once daily and calls:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" https://<your-render-service>.onrender.com/api/cron/sync
   ```
5. GitHub webhook setup is the same as the Vercel path — point at `https://<your-render-service>.onrender.com/api/webhooks/github`.

---

## 🔮 Future Roadmap

- **Slack/Discord Notifications:** Push alerts when high-priority insights are detected.
- **Custom Rules:** Allow users to define their own thresholds for "Bottlenecks" or "Burnout."
- **Multi-org Support:** View stats across organizations, not just individual accounts.
- **PR Analysis Cache:** Persist AI analysis results to avoid redundant API calls.
