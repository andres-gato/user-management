import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'vitest';
import type { PublicUser } from '../../api/mockApi';
import { FriendInvites } from './FriendInvites';

describe('FriendInvites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('creates an invite link and displays it', async () => {
    const inviter: PublicUser = { id: 'inviter_ui_1', email: 'me@example.com' };
    const user = userEvent.setup();

    render(<FriendInvites inviter={inviter} />);

    await user.click(screen.getByTestId('create-invite-button'));

    const link = await screen.findByTestId('invite-url');
    expect(link).toHaveAttribute('href');
    expect(link.getAttribute('href')).toContain('ref=');
  });

  test('copy button shows copied state, then resets', async () => {
    const inviter: PublicUser = {
      id: 'inviter_ui_2',
      email: 'me2@example.com',
    };
    const user = userEvent.setup();

    render(<FriendInvites inviter={inviter} />);
    await user.click(screen.getByTestId('create-invite-button'));

    const copyButton = screen.getByTestId('copy-invite-link-button');
    expect(copyButton).toHaveTextContent('Copy Link');

    await user.click(copyButton);
    expect(copyButton).toHaveTextContent('Copied');

    await new Promise((resolve) => setTimeout(resolve, 2100));
    expect(copyButton).toHaveTextContent('Copy Link');
  });

  test('pending invite row has copy link button', async () => {
    const inviter: PublicUser = {
      id: 'inviter_ui_3',
      email: 'me3@example.com',
    };
    const user = userEvent.setup();

    render(<FriendInvites inviter={inviter} />);
    await user.click(screen.getByTestId('create-invite-button'));

    const pendingCopyButtons = screen.getAllByTestId(
      'copy-pending-invite-link-button',
    );
    await user.click(pendingCopyButtons[0]!);

    expect(pendingCopyButtons[0]).toHaveTextContent('Copied');

    await new Promise((resolve) => setTimeout(resolve, 2100));
    expect(pendingCopyButtons[0]).toHaveTextContent('Copy Link');
  });
});
