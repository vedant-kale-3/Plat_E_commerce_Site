import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthPage, { formatAuthError } from '../AuthPage';
import { supabase } from '../../lib/supabase';

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
        } as any,
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
          error: { message: 'Fetch failed', status: 0 } as any,
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
});
