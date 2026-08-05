import { config } from 'dotenv';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

// Local dev env files live at the repo root (shared with the frontend
// workspace), not in this package — load them explicitly since this
// script's cwd is `backend/` when run via `npm run -w backend`. Deployed
// environments (Render/Vercel) inject DATABASE_URL directly, so this only
// matters for local `prisma generate`/`migrate`.
config({ path: path.resolve(__dirname, '../.env.local') });
config({ path: path.resolve(__dirname, '../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Prisma 7: connection URL lives here instead of schema.prisma
    url: env('DATABASE_URL'),
    // Optionally configure a shadow DB for migrations:
    // shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
});

