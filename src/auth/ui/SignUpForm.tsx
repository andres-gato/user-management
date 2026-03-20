import type { FormEvent } from 'react';
import { useState } from 'react';
import type { PublicUser } from '../../api/mockApi';
import { AuthError, signUp } from '../authService';

export function SignUpForm(props: { onSignedUp: (user: PublicUser) => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('First name, last name, email, and password are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await signUp({ firstName, lastName, email, password });
      props.onSignedUp(user);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Sign up failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label="Sign up">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            className="block text-sm font-medium text-zinc-700"
            htmlFor="signup-first-name"
          >
            First name
          </label>
          <input
            id="signup-first-name"
            data-testid="signup-first-name-input"
            className="mt-1 w-full rounded border border-zinc-300 bg-white p-2 text-zinc-900"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-zinc-700"
            htmlFor="signup-last-name"
          >
            Last name
          </label>
          <input
            id="signup-last-name"
            data-testid="signup-last-name-input"
            className="mt-1 w-full rounded border border-zinc-300 bg-white p-2 text-zinc-900"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-medium text-zinc-700"
          htmlFor="signup-email"
        >
          Email
        </label>
        <input
          id="signup-email"
          data-testid="signup-email-input"
          className="mt-1 w-full rounded border border-zinc-300 bg-white p-2 text-zinc-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-zinc-700"
          htmlFor="signup-password"
        >
          Password
        </label>
        <input
          id="signup-password"
          data-testid="signup-password-input"
          type="password"
          className="mt-1 w-full rounded border border-zinc-300 bg-white p-2 text-zinc-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
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
        data-testid="signup-submit-button"
        disabled={isSubmitting}
        className="w-full rounded bg-zinc-900 py-2 text-white disabled:opacity-60"
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
