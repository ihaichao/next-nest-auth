'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  schema: z.ZodSchema;
  onSubmit: (data: { username: string; password: string }) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
  success?: string | null;
}

/**
 * Reusable authentication form component
 * Used by both signin and signup pages
 */
export function AuthForm({
  mode,
  schema,
  onSubmit,
  isLoading,
  error,
  success,
}: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const isSignIn = mode === 'signin';
  const title = isSignIn ? 'Welcome Back' : 'Create Account';
  const subtitle = isSignIn
    ? 'Sign in to your account to continue'
    : 'Sign up to get started with our platform';
  const buttonText = isSignIn ? 'Sign In' : 'Sign Up';
  const alternateText = isSignIn
    ? "Don't have an account?"
    : 'Already have an account?';
  const alternateLinkText = isSignIn ? 'Sign Up' : 'Sign In';
  const alternateLink = isSignIn ? '/signup' : '/signin';

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Enter your username"
              autoComplete="username"
              {...register('username')}
            />
            {errors.username && (
              <p className="form-error">{errors.username.message as string}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder={
                isSignIn
                  ? 'Enter your password'
                  : 'Create a password (min. 8 characters)'
              }
              autoComplete={isSignIn ? 'current-password' : 'new-password'}
              {...register('password')}
            />
            {errors.password && (
              <p className="form-error">{errors.password.message as string}</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading && <span className="spinner" />}
            {isLoading ? 'Please wait...' : buttonText}
          </button>
        </form>

        <div className="auth-link-container">
          <span className="auth-link-text">
            {alternateText}
            <Link href={alternateLink} className="auth-link">
              {alternateLinkText}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
