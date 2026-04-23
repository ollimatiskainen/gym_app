'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Activity } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, signInWithGoogleRedirect } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePopup = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError((err as Error).message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogleRedirect();
    } catch (err: unknown) {
      setError((err as Error).message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-sm animate-modal-in rounded-sm bg-bg-secondary p-8 card-depth text-center">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-accent/10">
            <Activity size={32} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Gym Logger</h1>
          <p className="text-sm text-text-secondary">Track your workouts, build your strength</p>
        </div>

        {error && (
          <div className="mb-4 rounded-sm bg-danger/10 p-3 text-sm text-danger">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-bold underline">Dismiss</button>
          </div>
        )}

        <button
          onClick={handlePopup}
          disabled={loading}
          className="mb-3 flex w-full items-center justify-center gap-3 rounded-sm bg-bg-primary border border-border px-4 py-3.5 font-semibold text-text-primary hover:bg-bg-tertiary active:scale-95 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <button onClick={handleRedirect} disabled={loading} className="w-full text-sm text-text-tertiary hover:text-accent active:scale-95">
          Or use redirect sign-in
        </button>
      </div>
    </div>
  );
}
