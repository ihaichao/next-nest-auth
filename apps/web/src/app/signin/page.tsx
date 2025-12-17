'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signinSchema } from '@next-nest-auth/shared';
import { trpc } from '@/lib/trpc';
import { AuthForm } from '@/components/AuthForm';

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const signinMutation = trpc.auth.signin.useMutation({
    onSuccess: (data) => {
      if (data.success && data.token) {
        // Store JWT token in localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setSuccess('Login successful! Redirecting...');
        setError(null);

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setError(data.message);
        setSuccess(null);
      }
    },
    onError: (err) => {
      setError(err.message || 'An unexpected error occurred');
      setSuccess(null);
    },
  });

  const handleSubmit = async (data: { username: string; password: string }) => {
    setError(null);
    setSuccess(null);
    await signinMutation.mutateAsync(data);
  };

  return (
    <AuthForm
      mode="signin"
      schema={signinSchema}
      onSubmit={handleSubmit}
      isLoading={signinMutation.isPending}
      error={error}
      success={success}
    />
  );
}
