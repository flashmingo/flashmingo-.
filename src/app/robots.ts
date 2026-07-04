import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // App surface is login-gated anyway; keep crawlers on marketing pages.
        disallow: ['/api/', '/dashboard', '/decks', '/study', '/classrooms', '/admin', '/teacher', '/settings', '/browse', '/leaderboard', '/search'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
