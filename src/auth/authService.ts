import type { PublicUser } from '../api/mockApi';
import {
  authenticate,
  clearSession,
  createUser,
  getPublicUserById,
  getSessionUserId,
  setSessionUserId,
} from '../api/mockApi';

export type SignUpInput = { email: string; password: string };
export type SignInInput = { email: string; password: string };

export class AuthError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}

function toAuthError(code: string) {
  const message =
    code === 'EMAIL_TAKEN'
      ? 'Email is already registered'
      : code === 'INVALID_CREDENTIALS'
        ? 'Invalid email or password'
        : 'Authentication failed';
  return new AuthError(code, message);
}

export async function signUp(input: SignUpInput): Promise<PublicUser> {
  try {
    const user = await createUser(input);
    setSessionUserId(user.id);
    return user;
  } catch (err) {
    const code = err instanceof Error ? err.message : 'UNKNOWN';
    throw toAuthError(code);
  }
}

export async function signIn(input: SignInInput): Promise<PublicUser> {
  try {
    const user = await authenticate(input);
    setSessionUserId(user.id);
    return user;
  } catch (err) {
    const code = err instanceof Error ? err.message : 'UNKNOWN';
    throw toAuthError(code);
  }
}

export function signOut() {
  clearSession();
}

export function getCurrentUser(): PublicUser | null {
  const userId = getSessionUserId();
  if (!userId) return null;
  return getPublicUserById(userId);
}
