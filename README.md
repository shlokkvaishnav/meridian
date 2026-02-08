# Meridian - Engineering Intelligence Platform

AI-powered analytics platform that transforms Git activity into actionable intelligence for engineering teams.

## Key Features

- **Metrics-Grounded AI Insights**: AI insights backed by computed metrics to prevent hallucinations
- **Multi-Tenant Architecture**: Enterprise-ready with row-level security and RBAC
- **Real-Time Analytics**: Time-series metrics with automated anomaly detection
- **GitHub Integration**: Deep integration via GitHub App with webhook support

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (with TimescaleDB extension via Supabase)
- **Queue**: BullMQ with Redis
- **AI**: Anthropic Claude with structured outputs
- **Auth**: GitHub OAuth

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd meridian
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

6. (Optional) Start the background worker:
```bash
npm run worker
```

## Project Structure

```
meridian/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # Dashboard pages
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   ├── lib/                  # Shared utilities
│   │   ├── db.ts            # Prisma client
│   │   ├── logger.ts        # Pino logger
│   │   └── redis.ts         # Redis client
│   ├── services/            # Business logic
│   │   ├── github/          # GitHub API integration
│   │   ├── metrics/         # Metric computation
│   │   └── ai/              # AI insight generation
│   └── workers/             # Background job workers
├── .env.example             # Environment template
├── package.json
└── README.md
```

## Development Workflow

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# View database in Prisma Studio
npx prisma studio
```

### Running Jobs

```bash
# Start the worker process
npm run worker
```

## Architecture Overview

### Data Flow

1. **GitHub Integration**: GitHub App webhooks + periodic sync jobs
2. **ETL Pipeline**: BullMQ jobs process events and compute metrics
3. **Time-Series Storage**: Metrics stored in TimescaleDB hypertables
4. **AI Layer**: Claude generates insights from aggregated metrics
5. **Dashboard**: Real-time updates via Server Components

### Key Design Decisions

- **Metric Grounding**: AI only sees pre-computed metrics, not raw data
- **Incremental Sync**: Checkpoint-based resumable sync for reliability
- **RLS Security**: Row-level security enforces multi-tenancy at DB level
- **Denormalization**: Critical metrics denormalized for query performance

## Environment Variables

See `.env.example` for all required environment variables.

### Critical Configuration

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection for BullMQ
- `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`: GitHub App credentials
- `ANTHROPIC_API_KEY`: For AI insight generation
- `ENCRYPTION_KEY`: For encrypting GitHub tokens

## Deployment

Recommended stack:
- **Hosting**: Vercel
- **Database**: Supabase PostgreSQL
- **Redis**: Upstash Redis
- **Monitoring**: Axiom + Sentry

## License

MIT

## Contributing

Contributions welcome! Please open an issue first to discuss proposed changes.
