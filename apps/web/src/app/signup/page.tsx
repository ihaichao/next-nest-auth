'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupSchema } from '@next-nest-auth/shared';
import { trpc } from '@/lib/trpc';
import { AuthForm } from '@/components/AuthForm';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSuccess('Account created successfully! Redirecting to sign in...');
        setError(null);
        // Redirect to signin after 2 seconds
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
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
    await signupMutation.mutateAsync(data);
  };

  return (
    <AuthForm
      mode="signup"
      schema={signupSchema}
      onSubmit={handleSubmit}
      isLoading={signupMutation.isPending}
      error={error}
      success={success}
    />
  );
}
