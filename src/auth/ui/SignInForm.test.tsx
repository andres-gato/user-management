import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { signUp } from '../authService';
import { SignInForm } from './SignInForm';

describe('SignInForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('sign in fails with wrong password', async () => {
    await signUp({
      firstName: 'A',
      lastName: 'One',
      email: 'a@example.com',
      password: 'secret',
    });

    const onSignedIn = vi.fn();
    const user = userEvent.setup();

    render(<SignInForm onSignedIn={onSignedIn} />);

    await user.type(screen.getByTestId('signin-email-input'), 'a@example.com');
    await user.type(screen.getByTestId('signin-password-input'), 'wrong');
    await user.click(screen.getByTestId('signin-submit-button'));

    expect(onSignedIn).toHaveBeenCalledTimes(0);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Invalid email or password');
  });
});
