# Meridian

**Engineering Intelligence Platform for GitHub**

Meridian is a personal GitHub analytics dashboard that transforms your PR data into actionable insights using smart rules and metrics.

![Meridian Dashboard](https://img.shields.io/badge/status-production%20ready-green)

---

## ✨ Features

- 🔐 **Secure Authentication** - GitHub Personal Access Token with AES-256-GCM encryption
- 📊 **Rich Metrics** - Cycle time, review velocity, contributor stats
- 🏆 **Contributor Leaderboard** - Top contributors ranked by activity
- 📈 **Activity Trends** - 30-day time-series charts
- 🔮 ** Smart Insights** - Rule-based pattern detection (no external AI needed!)
- 🔄 **Auto Sync** - Daily background sync via Vercel Cron
- 🎨 **Beautiful UI** - Modern design with dark mode

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for PostgreSQL database)
- GitHub Personal Access Token
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd meridian
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your values:

```env
# Database (from Supabase)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Redis (optional, for caching)
REDIS_URL="redis://..."

# Encryption (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
ENCRYPTION_KEY="..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
LOG_LEVEL="info"

# Cron Secret (generate a random string)
CRON_SECRET="your-random-secret-here"
```

4. **Run database migrations**
```bash
npx prisma generate
npx prisma migrate deploy
```

5. **Start development server**
```bash
npm run dev
```

6. **Visit http://localhost:3000**

---

## 📖 Usage

### First Time Setup

1. Visit the landing page
2. Click "Get Started"
3. Create a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens/new
   - Select `repo` scope (for private repos) or `public_repo` (for public only)
   - Generate and copy the token
4. Paste the token in Meridian
5. Click "Connect GitHub"

### Syncing Data

**Manual Sync:**
- Click "Sync Now" button on the dashboard
- Waits for sync to complete (~30-60 seconds)

**Automatic Sync:**
- Runs daily at 2 AM UTC via Vercel Cron
- Only works when deployed to Vercel
- No action needed!

### Generating Insights

1. Scroll to "AI Insights" section
2. Click "Generate Insights"
3. View smart recommendations
4. Click "Refresh" anytime for updated analysis

---

## 🎯 Insights Explained

Meridian uses **rule-based intelligence** to detect patterns:

- **Review Bottlenecks** - PRs waiting too long for reviews
- **Cycle Time Issues** - Increasing merge times
- **Workload Imbalance** - Contributors with 3x average load
- **Burnout Signals** - High weekend activity (>30%)
- **Stale PRs** - Unchanged for 14+ days
- **Capacity Issues** - Too many open PRs
- **Positive Patterns** - Fast cycle times, high merge rates

No external AI API needed - completely free and instant!

---

## 🚀 Deployment to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
- Visit https://vercel.com/new
- Import your GitHub repository
- Vercel will auto-detect Next.js

3. **Add Environment Variables**

In Vercel dashboard (Settings → Environment Variables), add all variables from `.env`

4. **Deploy & Verify Cron**
- Click "Deploy"
- Visit Vercel dashboard → Crons
- Manually trigger `/api/cron/daily-sync` to test

---

## 🔐 Security

- ✅ Tokens encrypted at rest with AES-256-GCM
- ✅ No external AI API calls (privacy first!)
- ✅ Cron endpoint protected with secret

---

## 📊 Tech Stack

Next.js 14, React, Tailwind CSS, PostgreSQL (Supabase), Prisma 7, Recharts, Octokit

---

**Built with ❤️ for engineering teams**
