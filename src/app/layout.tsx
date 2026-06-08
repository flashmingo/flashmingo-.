import type { Metadata } from 'next';
import '../styles/globals.css';
import '../styles/theme.css';
import { AuthProvider } from '../hooks/useAuth';

export const metadata: Metadata = {
  title: 'Kenmei - Secure Learning Platform',
  description:
    'Kenmei is a secure, comprehensive learning and studying platform for K-12 students. Create flashcards, study with spaced repetition, and track your learning progress.',
  keywords: ['flashcards', 'spaced repetition', 'learning', 'study', 'education', 'kenmei'],
  authors: [{ name: 'Kenmei' }],
  openGraph: {
    title: 'Kenmei - Secure Learning Platform',
    description: 'Master learning with spaced repetition and active recall',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#f05b8f" />
      </head>
      <body className="bg-white text-indigo-900 antialiased">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
