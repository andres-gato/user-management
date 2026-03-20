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
});
