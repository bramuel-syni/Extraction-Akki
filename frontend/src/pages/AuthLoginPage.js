/**
 * AuthLoginPage — Phase 8 Stage B-1.
 *
 * Minimal sign-in surface. Consumes POST /api/auth/login via useAuth hook.
 * On 401 renders auth-denied inline (NEVER via RefusalCard — Owner E2 non-negotiable).
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatApiErrorDetail } from '../apiClient';

export default function AuthLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const r = await login(email, password);
    setBusy(false);
    if (r.ok) {
      navigate('/', { replace: true });
      return;
    }
    // 401 with {reason, detail} — Owner E2 shape. NOT rendered via RefusalCard.
    if (r.status === 401 && r.body?.reason) {
      setError({ kind: 'auth_denied', reason: r.body.reason, detail: r.body.detail });
    } else {
      setError({ kind: 'other', detail: formatApiErrorDetail(r.body?.detail) });
    }
  };

  return (
    <div data-testid="auth-login-page" className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-rms-line">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold tracking-tight text-rms-ink">
              Akki OS
            </h1>
            <span className="text-[10px] font-mono uppercase text-rms-mute tracking-wider">
              Sign in
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <form
          data-testid="auth-login-form"
          onSubmit={onSubmit}
          className="w-full max-w-md space-y-4"
        >
          <h2 className="text-2xl font-light text-rms-ink">Sign in</h2>
          <div>
            <label htmlFor="email" className="text-xs uppercase tracking-wide text-rms-mute">
              Email
            </label>
            <input
              id="email"
              type="email"
              data-testid="auth-login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              required
              autoComplete="email"
              className="mt-1 w-full px-3 py-2 border border-rms-line rounded-md focus:outline-none focus:ring-2 focus:ring-rms-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs uppercase tracking-wide text-rms-mute">
              Password
            </label>
            <input
              id="password"
              type="password"
              data-testid="auth-login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              required
              autoComplete="current-password"
              className="mt-1 w-full px-3 py-2 border border-rms-line rounded-md focus:outline-none focus:ring-2 focus:ring-rms-accent"
            />
          </div>
          {error && error.kind === 'auth_denied' && (
            <div
              data-testid="auth-login-error-denied"
              className="rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900"
            >
              <p className="font-medium">Invalid credentials.</p>
              <p className="mt-1 text-xs font-mono uppercase tracking-wider text-slate-500">
                {error.reason}
              </p>
            </div>
          )}
          {error && error.kind !== 'auth_denied' && (
            <div
              data-testid="auth-login-error-other"
              className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900"
            >
              {error.detail}
            </div>
          )}
          <button
            type="submit"
            data-testid="auth-login-submit"
            disabled={busy || !email || !password}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-rms-ink text-white hover:bg-rms-accent disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Sign in
          </button>
          <p className="text-xs text-rms-mute">
            No account?{' '}
            <Link data-testid="auth-login-to-register" to="/auth/register" className="underline text-rms-ink">
              Create one
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
