// Run by the GitHub Pages workflow before `next build`.
// A static export cannot contain routes that need a server (the API, sign-in,
// the dashboard). Remove them from the CI checkout so only the marketing page
// and the demo are built. This never runs for the normal (Vercel) build.
import { rmSync } from 'node:fs';

const serverOnly = [
  'src/app/api',
  'src/app/(dashboard)',
  'src/app/setup',
  'src/app/robots.ts',
  'src/app/sitemap.ts',
];

for (const path of serverOnly) {
  rmSync(path, { recursive: true, force: true });
  console.log(`removed ${path}`);
}
