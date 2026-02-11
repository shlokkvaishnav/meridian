# Meridian
**Engineering Intelligence Platform for GitHub**

Meridian is a sophisticated, privacy-focused analytics dashboard designed to help engineering teams and individual developers gain actionable insights from their GitHub activity. Unlike standard GitHub charts, Meridian digs deep into Pull Request (PR) lifecycles to surface bottlenecks, celebrate wins, and prevent burnout—all without sending your code context to external AI services.

![Meridian Dashboard](https://img.shields.io/badge/status-production%20ready-green) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 Project Overview

### The Problem
Engineering health is often opaque. Teams struggle to answer questions like:
- "Why are our code reviews taking longer?"
- "Who is at risk of burnout due to high workload?"
- "Are we blocking each other on critical merges?"
Standard tools either lack depth or require expensive, invasive integrations.

### The Solution
Meridian provides a **local-first, secure** way to visualize this data. It connects directly to your GitHub via a personal access token, syncs your PR history to a secure database, and runs a **local inference engine** to detect patterns.

### Key Value Props
1.  **Privacy First:** Your code never leaves GitHub. We only analyze metadata (timestamps, authors, status).
2.  **No "Black Box" AI:** Insights are generated via transparent, deterministic rule-based algorithms, not hallucinating LLMs.
3.  **Actionable Intelligence:** We don't just show numbers; we tell you *what to do* (e.g., "Re-assign reviews from Developer X who is overloaded").

---

## ✨ Key Features & Technical Depth

### 1. 🧠 Smart Insight Engine (`src/lib/insights.ts`)
The core of Meridian is its insight generation engine. It analyzes 30 days of PR data to detect 7 distinct patterns:
-   **Review Bottlenecks:** Identifies PRs waiting >2x the average time for a review.
-   **Workload Imbalance:** Flags contributors executing >3x the average team workload.
-   **Burnout Risks:** Detects high weekend activity (>30% of commits/PRs).
-   **Stale PRs:** Highlights work that has languished for 14+ days.
-   **Velocity Trends:** Compares current cycle times vs. historical baselines to detect slowdowns.

### 2. 📊 High-Fidelity Metrics (`src/lib/metrics.ts`)
We calculate engineering metrics that matter:
-   **Cycle Time:** Time from first commit to merge (P50 and P75 percentiles).
-   **Time to First Review:** A key indicator of team responsiveness.
-   **Merge Rate:** The ratio of merged vs. closed/abandoned PRs.

### 3. 🔐 Enterprise-Grade Security
-   **AES-256-GCM Encryption:** GitHub Personal Access Tokens (PATs) are encrypted at rest in the database using a unique encryption key (`src/lib/encryption.ts`).
-   **Session Isolation:** Data is strictly scoped to the user's session. A user can only see data for repositories they own/track.

### 4. 🔄 Robust Data Synchronization
-   **Incremental Sync:** We don't just fetch everything every time. The system tracks `lastSyncedAt` to fetch only new or updated PRs.
-   **Resilient Cron Jobs:** A daily Vercel Cron job (`/api/cron/daily-sync`) ensures data is always fresh without user intervention.
-   **Rate Limit Handling:** Built-in safeguards (`src/lib/github.ts`) respect GitHub API limits.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14 (App Router)** | Server-side rendering, API routes, and modern React patterns. |
| **Language** | **TypeScript** | Strict type safety for robust data handling and refactoring. |
| **Database** | **PostgreSQL (Supabase)** | Relational data model for robust querying. |
| **ORM** | **Prisma 7** | Type-safe database queries and schema management. |
| **Styling** | **Tailwind CSS** | Utility-first styling for a rapid, responsive UI. |
| **UI Components** | **Lucide React** | Beautiful, consistent iconography. |
| **Charts** | **Recharts** | Composable, responsive data visualizations. |
| **Encryption** | **Node.js Crypto** | Native `crypto` module for AES-256-GCM. |

---

## 📂 Project Structure

A high-level map of the codebase to help you navigate:

```
src/
├── app/                    # Next.js App Router (Pages & API)
│   ├── api/                # Backend API Routes
│   │   ├── cron/           # Scheduled tasks (Daily Sync)
│   │   └── sync/           # On-demand sync endpoints
│   ├── dashboard/          # Main Analytics Dashboard
│   └── setup/              # Onboarding flow
├── components/             # Reusable React Components
│   ├── MetricsChart.tsx    # Time-series visualization
│   └── InsightsDisplay.tsx # Insight cards & logic
├── lib/                    # Core Business Logic
│   ├── db.ts               # Prisma Client singleton
│   ├── github.ts           # GitHub API Client (Rate limits, Fetching)
│   ├── insights.ts         # The "Brain" - Rule-based analysis engine
│   ├── metrics.ts          # Statistical calculations
│   └── encryption.ts       # Security utilities
└── prisma/
    └── schema.prisma       # Database Schema Definition
```

---

## 💾 Data Model (`schema.prisma`)

Our schema is designed for performance and flexibility:

-   **AppSettings:** Stores user session and encrypted tokens.
-   **Repository:** Tracks tracked repos and their sync status.
-   **PullRequest:** The central entity. We denormalize some stats (lines added, files changed) for fast querying.
-   **Insight:** Generated recommendations stored for historical tracking.
-   **SyncJob:** Logs background job status for debugging.

---

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+
-   PostgreSQL Database (Supabase recommended)
-   GitHub Personal Access Token

### Installation

1.  **Clone & Install**
    ```bash
    git clone <repo-url>
    cd meridian
    npm install
    ```

2.  **Environment Setup**
    Create a `.env` file:
    ```env
    DATABASE_URL="postgres://..."
    ENCRYPTION_KEY="<32-byte-random-string>"
    ```

3.  **Database Migration**
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000`

---

## 🔮 Future Roadmap

-   **Team Aggregation:** View stats across multiple repositories combined.
-   **Slack/Discord Notifications:** Push alerts when high-priority insights are detected.
-   **Custom Rules:** Allow users to define their own thresholds for "Bottlenecks" or "Burnout".
