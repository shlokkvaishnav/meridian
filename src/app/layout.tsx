import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700'],
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
    <html lang="en" className={outfit.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
