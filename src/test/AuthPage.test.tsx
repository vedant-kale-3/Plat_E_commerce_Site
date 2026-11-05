import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthPage, { formatAuthError, splitName, isValidEmail, EMAIL_REGEX } from '../pages/AuthPage';
import { supabase } from '../lib/supabase';
import type { AuthError } from '@supabase/supabase-js';

describe('Authentication & Security Boundary Exceptions - AuthPage.tsx', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatAuthError utility', () => {
    it('maps "Invalid login credentials" to user-friendly "Invalid email or password"', () => {
      const error = { message: 'Invalid login credentials', status: 400 };
      expect(formatAuthError(error)).toBe('Invalid email or password');
    });

    it('maps TypeError "Failed to fetch" to user-friendly "Network error. Please try again."', () => {
      const error = new TypeError('Failed to fetch');
      expect(formatAuthError(error)).toBe('Network error. Please try again.');
    });

    it('maps network related messages to user-friendly network error', () => {
      expect(formatAuthError({ message: 'Network request failed' })).toBe('Network error. Please try again.');
      expect(formatAuthError({ message: 'fetch failed' })).toBe('Network error. Please try again.');
      expect(formatAuthError({ message: 'NetworkError when attempting to fetch resource' })).toBe('Network error. Please try again.');
    });

    it('returns custom message for other general errors', () => {
      expect(formatAuthError({ message: 'Password is too short' })).toBe('Password is too short');
      expect(formatAuthError(null)).toBe('An error occurred during authentication.');
    });
  });

  describe('EX-AUTH-01: Login with 400 Invalid login credentials', () => {
    it('catches invalid credentials error, displays "Invalid email or password" inline alert, and leaves form populated', async () => {
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
        data: { user: null, session: null },
        error: {
          name: 'AuthApiError',
          message: 'Invalid login credentials',
          status: 400,
        } as unknown as AuthError,
      });

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      // Populate form
      fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      expect(emailInput.value).toBe('testuser@example.com');
      expect(passwordInput.value).toBe('wrongpassword');

      // Submit form
      fireEvent.click(submitButton);

      // Verify inline alert appears with the required message
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });

      // Verify form inputs remain populated with user values
      expect(emailInput.value).toBe('testuser@example.com');
      expect(passwordInput.value).toBe('wrongpassword');

      // Verify button is re-enabled for retry
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('EX-AUTH-02: Login / Register with offline network during submission', () => {
    it('catches network offline failure during Login, displays user-friendly message, and preserves inputs', async () => {
      // Simulate network completely offline / fetch rejection
      vi.spyOn(supabase.auth, 'signInWithPassword').mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'securepassword123' } });

      fireEvent.click(submitButton);

      // Verify user-friendly message is shown and application does not crash
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
      });

      // Form remains populated
      expect(emailInput.value).toBe('user@example.com');
      expect(passwordInput.value).toBe('securepassword123');
      expect(submitButton).not.toBeDisabled();
    });

    it('catches network offline failure during Register, displays user-friendly message, and preserves inputs', async () => {
      vi.spyOn(supabase.auth, 'signUp').mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      // Switch to Register mode
      const switchButton = screen.getByRole('button', { name: /Sign up/i });
      fireEvent.click(switchButton);

      expect(screen.getByText('Create an account')).toBeInTheDocument();

      const nameInput = screen.getByPlaceholderText('Jane Doe') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('At least 6 characters') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Create Account/i });

      // Populate registration form
      fireEvent.change(nameInput, { target: { value: 'Jane Watson' } });
      fireEvent.change(emailInput, { target: { value: 'jane.watson@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      fireEvent.click(submitButton);

      // Verify friendly network error displayed inline
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
      });

      // Verify registration inputs remain populated
      expect(nameInput.value).toBe('Jane Watson');
      expect(emailInput.value).toBe('jane.watson@example.com');
      expect(passwordInput.value).toBe('password123');
      expect(submitButton).not.toBeDisabled();
    });

    it('handles offline mode when navigator.onLine is false', async () => {
      const originalOnLine = navigator.onLine;
      try {
        Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

        vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
          data: { user: null, session: null },
          error: { name: 'AuthRetryableFetchError', message: 'Fetch failed', status: 0 } as unknown as AuthError,
        });

        render(
          <MemoryRouter>
            <AuthPage />
          </MemoryRouter>
        );

        const emailInput = screen.getByPlaceholderText('you@example.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: /Sign In/i });

        fireEvent.change(emailInput, { target: { value: 'offline@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'mypassword' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
        });
      } finally {
        Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
      }
    });
  });
  describe('EX-AUTH-04: Register with single word or multi-spaced name', () => {
    it('correctly splits single-word names (e.g. "Cher") without undefined lastName or errors', () => {
      const result = splitName('Cher');
      expect(result.firstName).toBe('Cher');
      expect(result.lastName).toBe('');
      expect(result.lastNameParts).toEqual([]);
      expect(result.lastName).not.toBeUndefined();
    });

    it('handles names with multiple irregular spaces (e.g. "Mary   Jane   Watson")', () => {
      const result = splitName('Mary   Jane   Watson');
      expect(result.firstName).toBe('Mary');
      expect(result.lastName).toBe('Jane Watson');
      expect(result.lastNameParts).toEqual(['Jane', 'Watson']);
    });

    it('handles leading and trailing whitespace gracefully', () => {
      const result = splitName('   Cher   ');
      expect(result.firstName).toBe('Cher');
      expect(result.lastName).toBe('');
      expect(result.lastNameParts).toEqual([]);
    });

    it('handles empty or whitespace-only strings gracefully', () => {
      expect(splitName('')).toEqual({ firstName: '', lastName: '', lastNameParts: [] });
      expect(splitName('   ')).toEqual({ firstName: '', lastName: '', lastNameParts: [] });
    });

    it('submits registration with single-word name "Cher" sending correct metadata to Supabase without undefined', async () => {
      const signUpSpy = vi.spyOn(supabase.auth, 'signUp').mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      // Switch to Register mode
      fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

      const nameInput = screen.getByPlaceholderText('Jane Doe');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('At least 6 characters');
      const submitButton = screen.getByRole('button', { name: /Create Account/i });

      fireEvent.change(nameInput, { target: { value: 'Cher' } });
      fireEvent.change(emailInput, { target: { value: 'cher@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signUpSpy).toHaveBeenCalledTimes(1);
      });

      expect(signUpSpy).toHaveBeenCalledWith({
        email: 'cher@example.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'Cher',
            last_name: '',
            full_name: 'Cher',
          },
        },
      });
    });

    it('submits registration with multi-spaced name "Mary   Jane   Watson" sending clean metadata to Supabase', async () => {
      const signUpSpy = vi.spyOn(supabase.auth, 'signUp').mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

      const nameInput = screen.getByPlaceholderText('Jane Doe');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('At least 6 characters');
      const submitButton = screen.getByRole('button', { name: /Create Account/i });

      fireEvent.change(nameInput, { target: { value: 'Mary   Jane   Watson' } });
      fireEvent.change(emailInput, { target: { value: 'mary@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signUpSpy).toHaveBeenCalledTimes(1);
      });

      expect(signUpSpy).toHaveBeenCalledWith({
        email: 'mary@example.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'Mary',
            last_name: 'Jane Watson',
            full_name: 'Mary   Jane   Watson',
          },
        },
      });
    });
  });

  describe('EX-AUTH-05: Form Validation with invalid email format', () => {
    it('validates email formats via isValidEmail utility and EMAIL_REGEX', () => {
      // Invalid email formats
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('user name@example.com')).toBe(false);

      // EMAIL_REGEX pattern check
      expect(EMAIL_REGEX.test('user@')).toBe(false);
      expect(EMAIL_REGEX.test('notanemail')).toBe(false);
      expect(EMAIL_REGEX.test('user@example.com')).toBe(true);

      // Valid email formats
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('jane.doe@sub.domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@domain.com')).toBe(true);
    });

    it('blocks Login submission when email format is "user@", shows inline error, and does not call Supabase', async () => {
      const signInSpy = vi.spyOn(supabase.auth, 'signInWithPassword');

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('you@example.com') as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: 'user@' } });
      fireEvent.change(passwordInput, { target: { value: 'validpassword123' } });

      fireEvent.click(submitButton);

      // Verify inline error appears immediately via React 18 microtask
      await waitFor(() => {
        expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
      });

      // Verify Supabase auth was NOT called
      expect(signInSpy).not.toHaveBeenCalled();

      // Form remains populated
      expect(emailInput.value).toBe('user@');
      expect(passwordInput.value).toBe('validpassword123');
    });

    it('blocks Login submission when email format is "notanemail", shows inline error, and does not call Supabase', async () => {
      const signInSpy = vi.spyOn(supabase.auth, 'signInWithPassword');

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: 'notanemail' } });
      fireEvent.change(passwordInput, { target: { value: 'validpassword123' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
      });
      expect(signInSpy).not.toHaveBeenCalled();
    });

    it('blocks Register submission with invalid email without calling signUp', async () => {
      const signUpSpy = vi.spyOn(supabase.auth, 'signUp');

      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      // Switch to Register
      fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

      const nameInput = screen.getByPlaceholderText('Jane Doe');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('At least 6 characters');
      const submitButton = screen.getByRole('button', { name: /Create Account/i });

      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email-format' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
      });
      expect(signUpSpy).not.toHaveBeenCalled();
    });

    it('clears the inline email error when user starts typing a correction', async () => {
      render(
        <MemoryRouter>
          <AuthPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: 'bademail' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
      });

      // User corrects input
      fireEvent.change(emailInput, { target: { value: 'bademail@' } });
      await waitFor(() => {
        expect(screen.queryByText('Enter a valid email address.')).not.toBeInTheDocument();
      });
    });
  });
});
