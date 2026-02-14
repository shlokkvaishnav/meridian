import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Meridian — GitHub Engineering Intelligence',
  description:
    'Transform your GitHub commits and pull requests into clear, actionable engineering insights. Track metrics, analyze velocity, and ship with confidence.',
  keywords: ['github', 'analytics', 'engineering metrics', 'pull requests', 'code review'],
  openGraph: {
    title: 'Meridian — GitHub Engineering Intelligence',
    description: 'Transform your GitHub activity into actionable insights.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
