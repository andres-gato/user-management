import type { PublicUser } from '../api/mockApi';
import { getPublicUserById, getSessionUserId } from '../api/mockApi';
import { randomId } from '../utils/id';
import { readJsonArray, writeJsonArray } from '../utils/storage';

export type Invite = {
  code: string;
  inviterId: string;
  createdAt: number;
  redeemedAt?: number;
  redeemedByUserId?: string;
};

export type Conversion = {
  referrerId: string;
  referredUserId: string;
  convertedAt: number;
};

export type ConversionStats = {
  totalInvites: number;
  redeemedInvites: number;
  conversionRate: number; // 0..1
};

const INVITES_KEY = 'um_invites';
const CONVERSIONS_KEY = 'um_conversions';
const REFERRAL_CODE_KEY = 'um_referral_code';

const DEFAULT_REF_QUERY_PARAM = 'ref';

function buildInviteUrl(code: string, baseUrl: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set(DEFAULT_REF_QUERY_PARAM, code);
  return url.toString();
}

function getBaseUrlForLinks(): string {
  // In tests, `window.location.href` exists under jsdom.
  return typeof window !== 'undefined'
    ? window.location.href
    : 'http://localhost/';
}

export function captureReferralFromUrl(
  urlString: string,
  opts?: { queryParam?: string },
): string | null {
  const queryParam = opts?.queryParam ?? DEFAULT_REF_QUERY_PARAM;
  const url = new URL(urlString);
  const code = url.searchParams.get(queryParam);
  if (!code) return null;

  localStorage.setItem(REFERRAL_CODE_KEY, code);
  return code;
}

export function getStoredReferralCode(): string | null {
  return localStorage.getItem(REFERRAL_CODE_KEY);
}

export function consumeStoredReferralCode(): string | null {
  const code = getStoredReferralCode();
  if (!code) return null;
  localStorage.removeItem(REFERRAL_CODE_KEY);
  return code;
}

export function createInvite(input: { inviterId: string; baseUrl?: string }): {
  inviteCode: string;
  inviteUrl: string;
} {
  const code = randomId('i');
  const invite: Invite = {
    code,
    inviterId: input.inviterId,
    createdAt: Date.now(),
  };

  const invites = readJsonArray<Invite>(INVITES_KEY);
  invites.push(invite);
  writeJsonArray(INVITES_KEY, invites);

  const baseUrl = input.baseUrl ?? getBaseUrlForLinks();
  const inviteUrl = buildInviteUrl(code, baseUrl);
  return { inviteCode: code, inviteUrl };
}

export function getInvitesForInviter(inviterId: string): Invite[] {
  const invites = readJsonArray<Invite>(INVITES_KEY);
  return invites
    .filter((i) => i.inviterId === inviterId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getConversionStatsForReferrer(
  referrerId: string,
): ConversionStats {
  const invites = getInvitesForInviter(referrerId);
  const totalInvites = invites.length;
  const redeemedInvites = invites.filter((i) => !!i.redeemedAt).length;
  const conversionRate = totalInvites ? redeemedInvites / totalInvites : 0;
  return { totalInvites, redeemedInvites, conversionRate };
}

export function attributeConversionFromStoredReferralCode(params: {
  referredUserId: string;
}): Conversion | null {
  const storedCode = consumeStoredReferralCode();
  if (!storedCode) return null;

  const invites = readJsonArray<Invite>(INVITES_KEY);
  const invite = invites.find((i) => i.code === storedCode);
  if (!invite) return null;
  if (invite.redeemedByUserId) return null;

  invite.redeemedAt = Date.now();
  invite.redeemedByUserId = params.referredUserId;
  writeJsonArray(INVITES_KEY, invites);

  const conversion: Conversion = {
    referrerId: invite.inviterId,
    referredUserId: params.referredUserId,
    convertedAt: invite.redeemedAt!,
  };
  const conversions = readJsonArray<Conversion>(CONVERSIONS_KEY);
  conversions.push(conversion);
  writeJsonArray(CONVERSIONS_KEY, conversions);

  return conversion;
}

export function getConversionsForReferrer(referrerId: string): Conversion[] {
  const conversions = readJsonArray<Conversion>(CONVERSIONS_KEY);
  return conversions
    .filter((c) => c.referrerId === referrerId)
    .sort((a, b) => b.convertedAt - a.convertedAt);
}

export function getInviterForCurrentSession(): PublicUser | null {
  const inviterId = getSessionUserId();
  if (!inviterId) return null;
  return getPublicUserById(inviterId);
}
