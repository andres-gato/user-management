import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SignUpForm } from './SignUpForm';

describe('SignUpForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('creates an account and calls onSignedUp', async () => {
    const onSignedUp = vi.fn();
    const user = userEvent.setup();

    render(<SignUpForm onSignedUp={onSignedUp} />);

    await user.type(screen.getByTestId('signup-first-name-input'), 'Test');
    await user.type(screen.getByTestId('signup-last-name-input'), 'User');
    await user.type(
      screen.getByTestId('signup-email-input'),
      'Test@Example.com',
    );
    await user.type(screen.getByTestId('signup-password-input'), 'secret');
    await user.click(screen.getByTestId('signup-submit-button'));

    expect(onSignedUp).toHaveBeenCalledTimes(1);
    expect(onSignedUp.mock.calls[0]?.[0]).toMatchObject({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
    });
  });

  test('shows error when email already exists', async () => {
    const onSignedUp = vi.fn();
    const user = userEvent.setup();

    render(<SignUpForm onSignedUp={onSignedUp} />);

    await user.type(screen.getByTestId('signup-first-name-input'), 'A');
    await user.type(screen.getByTestId('signup-last-name-input'), 'One');
    await user.type(screen.getByTestId('signup-email-input'), 'a@example.com');
    await user.type(screen.getByTestId('signup-password-input'), 'secret');
    await user.click(screen.getByTestId('signup-submit-button'));

    // Try to sign up again with the same email.
    await user.clear(screen.getByTestId('signup-last-name-input'));
    await user.type(screen.getByTestId('signup-last-name-input'), 'Two');
    await user.clear(screen.getByTestId('signup-password-input'));
    await user.type(screen.getByTestId('signup-password-input'), 'secret2');
    await user.click(screen.getByTestId('signup-submit-button'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Email is already registered');
  });
});
