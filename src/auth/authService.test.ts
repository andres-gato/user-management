import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  AuthError,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from './authService';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('signUp creates a user and persists session', async () => {
    const user = await signUp({
      email: 'Test@Example.com',
      password: 'secret',
    });
    expect(user.email).toBe('test@example.com');

    const current = getCurrentUser();
    expect(current?.email).toBe('test@example.com');
    expect(current?.id).toBe(user.id);
  });

  test('signUp rejects duplicate email', async () => {
    await signUp({ email: 'a@example.com', password: 'secret' });

    await expect(
      signUp({ email: 'a@example.com', password: 'secret2' }),
    ).rejects.toMatchObject({ code: 'EMAIL_TAKEN' });
  });

  test('signIn rejects invalid credentials', async () => {
    await signUp({ email: 'a@example.com', password: 'secret' });

    await expect(
      signIn({ email: 'a@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(AuthError);
    await expect(
      signIn({ email: 'a@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  test('signOut clears session', async () => {
    await signIn({ email: 'a@example.com', password: 'secret' }).catch(
      () => {},
    );
    await signUp({ email: 'a@example.com', password: 'secret' });
    signOut();
    expect(getCurrentUser()).toBeNull();
  });
});
