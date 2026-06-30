import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LandingPage } from '@/features/landing/LandingPage';

/**
 * Root page:
 * - Authenticated users → /dashboard
 * - Unauthenticated users → marketing landing page
 */
export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return <LandingPage />;
}
