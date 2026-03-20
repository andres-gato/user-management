import { randomId } from '../utils/id';
import { readJsonArray, writeJsonArray } from '../utils/storage';

export type DbUser = {
  id: string;
  email: string;
  password: string; // Mock only; do not store plaintext passwords in real apps.
};

export type PublicUser = {
  id: string;
  email: string;
};

const USERS_KEY = 'um_users';
const SESSION_KEY = 'um_session_userId';

export async function createUser(input: {
  email: string;
  password: string;
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  const users = readJsonArray<DbUser>(USERS_KEY);
  const existing = users.find((u) => u.email === email);
  if (existing) {
    throw new Error('EMAIL_TAKEN');
  }

  const user: DbUser = {
    id: randomId('u'),
    email,
    password,
  };

  users.push(user);
  writeJsonArray(USERS_KEY, users);

  return { id: user.id, email: user.email };
}

export async function authenticate(input: {
  email: string;
  password: string;
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  const users = readJsonArray<DbUser>(USERS_KEY);
  const user = users.find((u) => u.email === email);
  if (!user || user.password !== password) {
    throw new Error('INVALID_CREDENTIALS');
  }

  return { id: user.id, email: user.email };
}

export function setSessionUserId(userId: string) {
  localStorage.setItem(SESSION_KEY, userId);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function getPublicUserById(userId: string): PublicUser | null {
  const users = readJsonArray<DbUser>(USERS_KEY);
  const user = users.find((u) => u.id === userId);
  return user ? { id: user.id, email: user.email } : null;
}
