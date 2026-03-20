import type { FormEvent } from 'react';
import { useState } from 'react';
import type { PublicUser } from '../../api/mockApi';
import { AuthError, signIn } from '../authService';

export function SignInForm(props: { onSignedIn: (user: PublicUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await signIn({ email, password });
      props.onSignedIn(user);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Sign in failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label="Sign in">
      <div>
        <label
          className="block text-sm font-medium text-zinc-700"
          htmlFor="signin-email"
        >
          Email
        </label>
        <input
          id="signin-email"
          data-testid="signin-email-input"
          className="mt-1 w-full rounded border border-zinc-300 bg-white p-2 text-zinc-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-zinc-700"
          htmlFor="signin-password"
        >
          Password
        </label>
        <input
          id="signin-password"
          data-testid="signin-password-input"
          type="password"
          className="mt-1 w-full rounded border border-zinc-300 bg-white p-2 text-zinc-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        data-testid="signin-submit-button"
        disabled={isSubmitting}
        className="w-full rounded bg-zinc-900 py-2 text-white disabled:opacity-60"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
