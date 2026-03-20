import { useMemo, useRef, useState } from 'react';
import type { Invite } from '../inviteService';
import {
  createInvite,
  getInviteUrlFromCode,
  getInvitesForInviter,
} from '../inviteService';
import type { PublicUser } from '../../api/mockApi';

export function FriendInvites(props: { inviter: PublicUser }) {
  const [invites, setInvites] = useState<Invite[]>(() =>
    getInvitesForInviter(props.inviter.id),
  );
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  );
  const [copiedPendingInviteCode, setCopiedPendingInviteCode] = useState<
    string | null
  >(null);
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canCreate = useMemo(() => !!props.inviter.id, [props.inviter.id]);

  async function onCreate() {
    if (!canCreate) return;
    setIsCreating(true);
    try {
      const { inviteUrl } = createInvite({ inviterId: props.inviter.id });
      setCreatedUrl(inviteUrl);
      setCopyStatus('idle');
      setInvites(getInvitesForInviter(props.inviter.id));
    } finally {
      setIsCreating(false);
    }
  }

  async function onCopyLink() {
    if (!createdUrl) return;
    try {
      if (!navigator.clipboard) {
        setCopyStatus('error');
        return;
      }
      await navigator.clipboard.writeText(createdUrl);
      setCopyStatus('copied');
      if (copyResetTimerRef.current) {
        clearTimeout(copyResetTimerRef.current);
      }
      copyResetTimerRef.current = setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch {
      setCopyStatus('error');
    }
  }

  async function onCopyPendingInviteLink(inviteCode: string) {
    try {
      if (!navigator.clipboard) return;
      const inviteUrl = getInviteUrlFromCode(inviteCode);
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedPendingInviteCode(inviteCode);
      if (copyResetTimerRef.current) {
        clearTimeout(copyResetTimerRef.current);
      }
      copyResetTimerRef.current = setTimeout(() => {
        setCopiedPendingInviteCode(null);
      }, 2000);
    } catch {
      // noop
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
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-medium text-zinc-700">Your link</div>
            <button
              type="button"
              data-testid="copy-invite-link-button"
              onClick={() => void onCopyLink()}
              className={[
                'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                copyStatus === 'copied'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50',
              ].join(' ')}
            >
              {copyStatus === 'copied' ? 'Copied' : 'Copy Link'}
            </button>
          </div>
          <a
            href={createdUrl}
            className="break-all text-sm text-zinc-900 underline"
            data-testid="invite-url"
          >
            {createdUrl}
          </a>
          {copyStatus === 'error' ? (
            <div className="mt-2 text-xs text-red-700">
              Could not copy link.
            </div>
          ) : null}
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
            <div className="flex items-center gap-2">
              {!inv.redeemedAt ? (
                <button
                  type="button"
                  data-testid="copy-pending-invite-link-button"
                  onClick={() => void onCopyPendingInviteLink(inv.code)}
                  className={[
                    'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                    copiedPendingInviteCode === inv.code
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50',
                  ].join(' ')}
                >
                  {copiedPendingInviteCode === inv.code
                    ? 'Copied'
                    : 'Copy Link'}
                </button>
              ) : null}
              <div
                className={[
                  'rounded-md border px-3 py-1.5 text-xs font-semibold',
                  inv.redeemedAt
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border border-zinc-200 bg-zinc-50 text-zinc-700',
                ].join(' ')}
              >
                {inv.redeemedAt ? 'Redeemed' : 'Pending'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
