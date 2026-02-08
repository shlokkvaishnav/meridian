# Meridian Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

#### Required for Basic Setup:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `ENCRYPTION_KEY` - Generate with: `openssl rand -base64 32`

#### GitHub App Setup (for full functionality):
1. Go to https://github.com/settings/apps/new
2. Configure:
   - **GitHub App name**: Meridian (or your choice)
   - **Homepage URL**: http://localhost:3000
   - **Webhook URL**: http://localhost:3000/api/webhooks/github
   - **Webhook secret**: Generate random string
3. Permissions needed:
   - Repository permissions:
     - Pull requests: Read-only
     - Contents: Read-only
     - Metadata: Read-only
   - Organization permissions:
     - Members: Read-only
4. Subscribe to events:
   - Pull request
   - Pull request review
   - Push
5. Download private key
6. Add to `.env`:
   - `GITHUB_APP_ID` - From app settings
   - `GITHUB_APP_PRIVATE_KEY` - Contents of downloaded .pem file
   - `GITHUB_WEBHOOK_SECRET` - The webhook secret you generated

#### Supabase Setup:
1. Create project at https://supabase.com
2. Get connection string from project settings
3. Add to `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### Anthropic AI Setup:
1. Get API key from https://console.anthropic.com
2. Add to `.env`:
   - `ANTHROPIC_API_KEY`

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed with test data
# npm run db:seed
```

### 4. Start Development Server

```bash
# Start Next.js dev server
npm run dev

# In another terminal, start worker (for background jobs)
npm run worker
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Prisma Studio: `npx prisma studio`

## Directory Structure Overview

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components (to be added)
├── lib/                   # Shared libraries
│   ├── db.ts             # Prisma client
│   ├── logger.ts         # Pino logger
│   ├── redis.ts          # Redis client
│   └── utils.ts          # Utility functions
├── services/             # Business logic (to be added)
├── types/                # TypeScript types
│   └── index.ts          # Shared type definitions
└── workers/              # Background job workers (to be added)
```

## Next Steps

After setup, you can start building:

1. **Week 1**: GitHub OAuth integration
2. **Week 2**: PR ingestion pipeline
3. **Week 3**: Metrics computation engine
4. **Week 4**: AI insights generation
5. **Week 5-6**: Dashboard UI
6. **Week 7-8**: Production hardening

See the main README.md for detailed implementation roadmap.

## Common Issues

### Database Connection Failed
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- For Supabase, use the connection pooler URL for better performance

### Redis Connection Failed
- Ensure Redis is running locally or use Upstash Redis
- Check `REDIS_URL` format: `redis://host:port` or `rediss://` for TLS

### Prisma Migrations Failed
- Drop the database and recreate: `npx prisma migrate reset`
- Or manually fix migration conflicts

### GitHub Webhook Not Receiving Events
- Use ngrok to expose localhost: `ngrok http 3000`
- Update GitHub App webhook URL to ngrok URL
- Check webhook secret matches `.env`

## Development Tools

### Prisma Studio
```bash
npx prisma studio
```
Browse and edit database records visually.

### Database Reset
```bash
npx prisma migrate reset
```
Drops database, re-runs all migrations, and seeds data.

### TypeScript Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

## Production Deployment

### Vercel
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Database
- Use Supabase for managed PostgreSQL with TimescaleDB

### Redis
- Use Upstash Redis for serverless Redis

### Worker Process
- Deploy worker as a separate service (e.g., Railway, Render)
- Or use Vercel Cron for scheduled jobs
