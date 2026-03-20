import { useMemo, useState } from 'react';
import type { Invite } from '../inviteService';
import { createInvite, getInvitesForInviter } from '../inviteService';
import type { PublicUser } from '../../api/mockApi';

export function FriendInvites(props: { inviter: PublicUser }) {
  const [invites, setInvites] = useState<Invite[]>(() =>
    getInvitesForInviter(props.inviter.id),
  );
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const canCreate = useMemo(() => !!props.inviter.id, [props.inviter.id]);

  async function onCreate() {
    if (!canCreate) return;
    setIsCreating(true);
    try {
      const { inviteUrl } = createInvite({ inviterId: props.inviter.id });
      setCreatedUrl(inviteUrl);
      setInvites(getInvitesForInviter(props.inviter.id));
    } finally {
      setIsCreating(false);
    }
  }

  const redeemedInvites = invites.filter((i) => !!i.redeemedAt).length;
  const conversionRate = invites.length ? redeemedInvites / invites.length : 0;

  return (
    <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Invite friends
          </h2>
          <p className="text-sm text-zinc-600">They sign up from your link.</p>
          <div className="mt-2 text-xs text-zinc-600">
            Conversion rate:{' '}
            <span className="font-medium text-zinc-900">
              {Math.round(conversionRate * 100)}%
            </span>{' '}
            ({redeemedInvites}/{invites.length || 0} redeemed)
          </div>
        </div>
        <button
          type="button"
          data-testid="create-invite-button"
          disabled={!canCreate || isCreating}
          onClick={() => void onCreate()}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isCreating ? 'Creating...' : 'Create invite'}
        </button>
      </div>

      {createdUrl ? (
        <div className="mt-3 rounded border border-zinc-200 bg-white p-3">
          <div className="text-xs font-medium text-zinc-700">Your link</div>
          <a
            href={createdUrl}
            className="break-all text-sm text-zinc-900 underline"
            data-testid="invite-url"
          >
            {createdUrl}
          </a>
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {invites.length === 0 ? (
          <div className="text-sm text-zinc-600">No invites yet.</div>
        ) : null}

        {invites.map((inv) => (
          <div
            key={inv.code}
            className="flex items-center justify-between gap-3 rounded border border-zinc-200 bg-white px-3 py-2"
          >
            <div className="text-sm">
              <div className="font-medium text-zinc-900">Code: {inv.code}</div>
              <div className="text-xs text-zinc-600">
                Created: {new Date(inv.createdAt).toLocaleString()}
              </div>
            </div>
            <div
              className={[
                'rounded px-2 py-1 text-xs font-medium',
                inv.redeemedAt
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border border-zinc-200 bg-zinc-50 text-zinc-700',
              ].join(' ')}
            >
              {inv.redeemedAt ? 'Redeemed' : 'Pending'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
