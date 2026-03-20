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

function getCryptoId(): string {
  const anyCrypto = globalThis.crypto as
    | undefined
    | { randomUUID?: () => string };
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
  return `u_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function readUsers(): DbUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DbUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: DbUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function createUser(input: {
  email: string;
  password: string;
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  const users = readUsers();
  const existing = users.find((u) => u.email === email);
  if (existing) {
    throw new Error('EMAIL_TAKEN');
  }

  const user: DbUser = {
    id: getCryptoId(),
    email,
    password,
  };

  users.push(user);
  writeUsers(users);

  return { id: user.id, email: user.email };
}

export async function authenticate(input: {
  email: string;
  password: string;
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  const users = readUsers();
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
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  return user ? { id: user.id, email: user.email } : null;
}
