import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Create Account — TaskFlow',
  description: 'Create a new TaskFlow account to start organizing your projects.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
