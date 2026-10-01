import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Sign In — TaskFlow',
  description: 'Sign in to your TaskFlow account to manage workspaces and tasks.',
};

export default function LoginPage() {
  return <LoginForm />;
}
