import { describe, expect, test } from 'vitest';
import {
  attributeConversionFromStoredReferralCode,
  captureReferralFromUrl,
  createInvite,
  getConversionStatsForReferrer,
  getConversionsForReferrer,
  getInvitesForInviter,
  removeReferralQueryParamFromCurrentUrl,
} from './inviteService';
import { signUp } from '../auth/authService';

describe('inviteService', () => {
  test('removeReferralQueryParamFromCurrentUrl removes only ref param', () => {
    window.history.replaceState({}, '', '/welcome?ref=abc123&tab=home#section');

    removeReferralQueryParamFromCurrentUrl();

    expect(window.location.search).toBe('?tab=home');
    expect(window.location.hash).toBe('#section');
  });

  test('createInvite builds a unique URL with the referral code', () => {
    localStorage.clear();

    const { inviteCode, inviteUrl } = createInvite({
      inviterId: 'inviter_1',
      baseUrl: 'http://localhost/app',
    });

    expect(inviteCode).toBeTruthy();
    expect(inviteUrl).toContain(`ref=${encodeURIComponent(inviteCode)}`);
  });

  test('attributeConversionFromStoredReferralCode redeems the matching invite', () => {
    localStorage.clear();

    const { inviteCode } = createInvite({
      inviterId: 'inviter_1',
      baseUrl: 'http://localhost/app?foo=1',
    });

    const referralUrl = `http://localhost/landing?ref=${inviteCode}`;
    captureReferralFromUrl(referralUrl);

    const conversion = attributeConversionFromStoredReferralCode({
      referredUserId: 'friend_1',
    });

    expect(conversion).not.toBeNull();
    expect(conversion?.referrerId).toBe('inviter_1');
    expect(conversion?.referredUserId).toBe('friend_1');

    const invites = getInvitesForInviter('inviter_1');
    expect(invites).toHaveLength(1);
    expect(invites[0]?.redeemedByUserId).toBe('friend_1');

    // Second redemption attempt should not create another conversion.
    const second = attributeConversionFromStoredReferralCode({
      referredUserId: 'friend_2',
    });
    expect(second).toBeNull();
    expect(getConversionsForReferrer('inviter_1')).toHaveLength(1);
  });

  test('signUp attributes conversion using the stored referral code', async () => {
    localStorage.clear();
    window.history.replaceState({}, '', '/signup?ref=pending_code&step=1');

    const { inviteCode } = createInvite({
      inviterId: 'inviter_2',
      baseUrl: 'http://localhost/app',
    });

    captureReferralFromUrl(`http://localhost/accept?ref=${inviteCode}`);

    const friend = await signUp({
      firstName: 'Friend',
      lastName: 'One',
      email: 'friend@example.com',
      password: 'secret',
    });

    const conversions = getConversionsForReferrer('inviter_2');
    expect(conversions).toHaveLength(1);
    expect(conversions[0]?.referredUserId).toBe(friend.id);
    expect(window.location.search).toBe('?step=1');
  });

  test('getConversionStatsForReferrer returns the correct conversion rate', async () => {
    localStorage.clear();

    const { inviteCode: c1 } = createInvite({
      inviterId: 'inviter_3',
      baseUrl: 'http://localhost/app',
    });
    createInvite({
      inviterId: 'inviter_3',
      baseUrl: 'http://localhost/app',
    });

    captureReferralFromUrl(`http://localhost/accept?ref=${c1}`);
    const friend = await signUp({
      firstName: 'Friend',
      lastName: 'Three',
      email: 'friend3@example.com',
      password: 'secret',
    });

    expect(friend.id).toBeTruthy();

    const stats = getConversionStatsForReferrer('inviter_3');
    expect(stats.totalInvites).toBe(2);
    expect(stats.redeemedInvites).toBe(1);
    expect(stats.conversionRate).toBe(0.5);
  });
});
