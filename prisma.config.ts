import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

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

