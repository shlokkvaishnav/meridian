// The GitHub Pages build is a static, demo-only site (NEXT_PUBLIC_DEMO_ONLY=true).
// It has no server, so sign-in, the dashboard and the API do not exist there.
// Buttons that start the real app link to the setup guide in the repository.
export const DEMO_ONLY = process.env.NEXT_PUBLIC_DEMO_ONLY === 'true';

export const SETUP_HREF = DEMO_ONLY
  ? 'https://github.com/shlokkvaishnav/meridian#getting-started'
  : '/setup';
