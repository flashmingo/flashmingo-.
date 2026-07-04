import type { Metadata } from 'next';
import { LoginExperience } from '@/components/auth/LoginExperience';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to FlashMingo with your school Google account.',
};

export default function LoginPage() {
  return <LoginExperience />;
}
