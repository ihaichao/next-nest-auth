'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      // Not authenticated, redirect to signin
      router.push('/signin');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      // Invalid user data, clear and redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      router.push('/signin');
    }
  }, [router]);

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Redirect to home
    router.push('/');
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p style={{ textAlign: 'center' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="dashboard-card" style={{ maxWidth: '500px' }}>
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Welcome back,
          </p>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              background: 'linear-gradient(to right, #c084fc, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {user.username}
          </h2>
        </div>

        <div
          style={{
            padding: '1rem',
            background: 'var(--bg-input)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border)',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
            }}
          >
            User ID
          </p>
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              wordBreak: 'break-all',
            }}
          >
            {user.id}
          </p>
        </div>

        <div className="alert alert-success" style={{ marginTop: '1.5rem' }}>
          🎉 You are successfully authenticated!
        </div>
      </div>
    </div>
  );
}
