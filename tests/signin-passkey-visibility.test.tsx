/**
 * Tests for Signin Passkey Visibility
 * 
 * Validates conditional display of passkey signin button
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignInPage from '../src/app/auth/signin/page';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock fetch for passkey check
global.fetch = jest.fn();

describe('SignIn Passkey Visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Typing email with hasPasskey=true', () => {
    it('should show passkey button after debounce', async () => {
      // Mock passkey check API to return true
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hasPasskey: true }),
      });

      render(<SignInPage />);

      const emailInput = screen.getByLabelText(/email/i);
      
      // Type email
      fireEvent.change(emailInput, { target: { value: 'user-with-passkey@example.com' } });

      // Wait for debounce (300ms) and API call
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledWith(
            '/api/webauthn/check',
            expect.objectContaining({
              method: 'POST',
              body: JSON.stringify({ email: 'user-with-passkey@example.com' }),
            })
          );
        },
        { timeout: 500 }
      );

      // Passkey button should be visible
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in with/i })).toBeInTheDocument();
      });
    });
  });

  describe('Typing email with hasPasskey=false', () => {
    it('should hide passkey button and show hint', async () => {
      // Mock passkey check API to return false
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hasPasskey: false }),
      });

      render(<SignInPage />);

      const emailInput = screen.getByLabelText(/email/i);
      
      // Type email
      fireEvent.change(emailInput, { target: { value: 'user-without-passkey@example.com' } });

      // Wait for debounce and API call
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalled();
        },
        { timeout: 500 }
      );

      // Passkey button should NOT be visible
      expect(screen.queryByRole('button', { name: /sign in with.*passkey/i })).not.toBeInTheDocument();

      // Hint should be visible
      await waitFor(() => {
        expect(screen.getByText(/no passkey for this email yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Invalid email', () => {
    it('should not check passkey for invalid email', async () => {
      render(<SignInPage />);

      const emailInput = screen.getByLabelText(/email/i);
      
      // Type invalid email
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });

      // Wait beyond debounce time
      await new Promise(resolve => setTimeout(resolve, 400));

      // API should not be called
      expect(global.fetch).not.toHaveBeenCalled();

      // No hint should be shown
      expect(screen.queryByText(/no passkey/i)).not.toBeInTheDocument();
    });
  });

  describe('Debouncing', () => {
    it('should only check once after rapid typing', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ hasPasskey: true }),
      });

      render(<SignInPage />);

      const emailInput = screen.getByLabelText(/email/i);
      
      // Rapid typing
      fireEvent.change(emailInput, { target: { value: 'u' } });
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.change(emailInput, { target: { value: 'us' } });
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

      // Wait for final debounce
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 }
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels on buttons', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hasPasskey: true }),
      });

      render(<SignInPage />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

      await waitFor(() => {
        const passkeyButton = screen.getByRole('button', { name: /sign in with/i });
        expect(passkeyButton).toHaveAttribute('aria-label');
      });
    });

    it('should announce passkey availability with aria-live', () => {
      render(<SignInPage />);

      // Find the aria-live region
      const liveRegion = screen.getByLabelText(/email/i).closest('div')?.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });
});
