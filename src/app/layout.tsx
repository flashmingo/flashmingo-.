import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';
import { Providers } from '@/components/providers';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'FlashMingo — Learning that sticks',
    template: '%s | FlashMingo',
  },
  description:
    'The flashcard platform built for schools. AI deck generation, spaced repetition, and classroom tools in one FERPA-compliant platform.',
  keywords: ['flashcards', 'spaced repetition', 'education', 'K-12', 'FERPA', 'school', 'AI study tools'],
  authors: [{ name: 'FlashMingo' }],
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    title: 'FlashMingo — Learning that sticks',
    description: 'AI flashcards, spaced repetition, and classroom tools for K–12 districts.',
    url: siteUrl,
    type: 'website',
    siteName: 'FlashMingo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlashMingo — Learning that sticks',
    description: 'AI flashcards, spaced repetition, and classroom tools for K–12 districts.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F1729',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
