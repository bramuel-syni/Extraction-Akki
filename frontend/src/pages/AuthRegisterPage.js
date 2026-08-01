/**
 * AuthRegisterPage — Phase 8 Stage B-1.
 *
 * Open registration (Owner E1 default: registration open at B-1; new users
 * default to `ask_console_user` role with no key_grants).
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatApiErrorDetail } from '../apiClient';

export default function AuthRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const r = await register(email, password, name || null);
    setBusy(false);
    if (r.ok) {
      navigate('/', { replace: true });
      return;
    }
    setError({ detail: formatApiErrorDetail(r.body?.detail || r.body?.reason) });
  };

  return (
    <div data-testid="auth-register-page" className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-rms-line">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold tracking-tight text-rms-ink">
              Akki OS
            </h1>
            <span className="text-[10px] font-mono uppercase text-rms-mute tracking-wider">
              Create account
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <form
          data-testid="auth-register-form"
          onSubmit={onSubmit}
          className="w-full max-w-md space-y-4"
        >
          <h2 className="text-2xl font-light text-rms-ink">Create your account</h2>
          <div>
            <label htmlFor="reg-name" className="text-xs uppercase tracking-wide text-rms-mute">
              Name (optional)
            </label>
            <input
              id="reg-name"
              type="text"
              data-testid="auth-register-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
              autoComplete="name"
              className="mt-1 w-full px-3 py-2 border border-rms-line rounded-md focus:outline-none focus:ring-2 focus:ring-rms-accent"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="text-xs uppercase tracking-wide text-rms-mute">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              data-testid="auth-register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              required
              autoComplete="email"
              className="mt-1 w-full px-3 py-2 border border-rms-line rounded-md focus:outline-none focus:ring-2 focus:ring-rms-accent"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="text-xs uppercase tracking-wide text-rms-mute">
              Password (8+ chars)
            </label>
            <input
              id="reg-password"
              type="password"
              data-testid="auth-register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 w-full px-3 py-2 border border-rms-line rounded-md focus:outline-none focus:ring-2 focus:ring-rms-accent"
            />
          </div>
          {error && (
            <div
              data-testid="auth-register-error"
              className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900"
            >
              {error.detail}
            </div>
          )}
          <button
            type="submit"
            data-testid="auth-register-submit"
            disabled={busy || !email || !password}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-rms-ink text-white hover:bg-rms-accent disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Create account
          </button>
          <p className="text-xs text-rms-mute">
            Already have an account?{' '}
            <Link data-testid="auth-register-to-login" to="/auth/login" className="underline text-rms-ink">
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
