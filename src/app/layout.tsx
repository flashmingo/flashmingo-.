import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: {
    default: 'FlashMingo — Secure Flashcard Platform for Schools',
    template: '%s | FlashMingo',
  },
  description:
    'FlashMingo is a privacy-first flashcard and study platform for K–12 schools. Built for districts that require FERPA compliance, student data minimization, and enterprise control.',
  keywords: ['flashcards', 'spaced repetition', 'education', 'K-12', 'FERPA', 'school'],
  authors: [{ name: 'FlashMingo' }],
  robots: { index: false, follow: false }, // Private platform — no indexing
  openGraph: {
    title: 'FlashMingo — Secure Flashcard Platform for Schools',
    description: 'Privacy-first flashcard study tool for K–12 districts.',
    type: 'website',
    siteName: 'FlashMingo',
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
      </body>
    </html>
  );
}
