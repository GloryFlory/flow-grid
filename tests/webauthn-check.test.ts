/**
 * Tests for WebAuthn Passkey Check Endpoint
 * 
 * Validates enumeration-safe passkey availability checking
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('/api/webauthn/check', () => {
  describe('Valid email with passkey', () => {
    it('should return hasPasskey: true', async () => {
      const response = await fetch('http://localhost:3000/api/webauthn/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test-with-passkey@example.com' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('hasPasskey', true);
    });
  });

  describe('Unknown email or known email without passkey', () => {
    it('should return hasPasskey: false for unknown email', async () => {
      const response = await fetch('http://localhost:3000/api/webauthn/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'unknown@example.com' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('hasPasskey', false);
    });

    it('should return hasPasskey: false for email without passkey', async () => {
      const response = await fetch('http://localhost:3000/api/webauthn/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user-no-passkey@example.com' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('hasPasskey', false);
    });
  });

  describe('Invalid email', () => {
    it('should return 400 for invalid email format', async () => {
      const response = await fetch('http://localhost:3000/api/webauthn/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should return 400 for missing email', async () => {
      const response = await fetch('http://localhost:3000/api/webauthn/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Email is required');
    });
  });

  describe('Email normalization', () => {
    it('should normalize email case', async () => {
      const response1 = await fetch('http://localhost:3000/api/webauthn/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'TEST@EXAMPLE.COM' }),
      });

      const response2 = await fetch('http://localhost:3000/api/webauthn/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.hasPasskey).toBe(data2.hasPasskey);
    });
  });

  describe('Rate limiting', () => {
    it('should return 429 after exceeding rate limit', async () => {
      // Make 31 requests rapidly
      const requests = Array.from({ length: 31 }, () =>
        fetch('http://localhost:3000/api/webauthn/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'ratelimit@example.com' }),
        })
      );

      const responses = await Promise.all(requests);
      const statuses = responses.map(r => r.status);

      // At least one should be rate limited
      expect(statuses).toContain(429);
    });
  });

  describe('HTTP methods', () => {
    it('should return 405 for GET request', async () => {
      const response = await fetch('http://localhost:3000/api/webauthn/check');
      expect(response.status).toBe(405);
    });
  });
});
