import { useState } from 'react';
import type { PublicUser } from '../../api/mockApi';
import { getCurrentUser, signOut } from '../authService';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { FriendInvites } from '../../invitations/ui/FriendInvites';

type Mode = 'signin' | 'signup';

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>('signup');
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(() =>
    getCurrentUser(),
  );

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      {currentUser ? (
        <div className="space-y-4">
          <div className="text-sm text-zinc-600">
            Signed in as{' '}
            <span className="font-medium text-zinc-900">
              {currentUser.firstName} {currentUser.lastName} (
              {currentUser.email})
            </span>
          </div>
          <button
            type="button"
            data-testid="signout-button"
            className="rounded bg-zinc-900 px-4 py-2 text-white"
            onClick={() => {
              signOut();
              setCurrentUser(null);
            }}
          >
            Sign out
          </button>

          <FriendInvites inviter={currentUser} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-3">
            <button
              type="button"
              data-testid="mode-signup-button"
              className={[
                'flex-1 rounded border px-3 py-2 text-sm font-medium',
                mode === 'signup'
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50',
              ].join(' ')}
              onClick={() => setMode('signup')}
            >
              Sign up
            </button>
            <button
              type="button"
              data-testid="mode-signin-button"
              className={[
                'flex-1 rounded border px-3 py-2 text-sm font-medium',
                mode === 'signin'
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50',
              ].join(' ')}
              onClick={() => setMode('signin')}
            >
              Sign in
            </button>
          </div>

          {mode === 'signup' ? (
            <SignUpForm onSignedUp={(user) => setCurrentUser(user)} />
          ) : (
            <SignInForm onSignedIn={(user) => setCurrentUser(user)} />
          )}
        </div>
      )}
    </div>
  );
}
