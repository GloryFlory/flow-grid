/**
 * Hook for conditional passkey authentication on sign-in page
 * 
 * Handles automatic WebAuthn prompting when user types email,
 * with graceful fallback to magic link if unsupported or cancelled.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  conditionalMediationAvailable,
  passkeysSupported,
  getAuthenticationOptions,
  verifyAuthentication,
  analytics,
  base64ToBuffer,
} from '@/lib/passkeys';

interface UseConditionalPasskeyOptions {
  emailRef: React.RefObject<HTMLInputElement>;
  onSuccess: () => void;
  onUnsupported?: () => void;
}

interface UseConditionalPasskeyReturn {
  supported: boolean;
  conditionalSupported: boolean;
  tryOptional: () => Promise<void>;
  isAuthenticating: boolean;
  error: string | null;
}

/**
 * Custom hook for managing conditional passkey authentication
 * 
 * Features:
 * - Auto-detects passkey support on mount
 * - Triggers conditional mediation when email field is focused
 * - Provides manual "Sign in with Passkey" method
 * - Handles errors gracefully with fallback to magic link
 * 
 * @param emailRef - Ref to email input field (for conditional mediation)
 * @param onSuccess - Callback when authentication succeeds
 * @param onUnsupported - Optional callback when passkeys not supported
 */
export function useConditionalPasskey({
  emailRef,
  onSuccess,
  onUnsupported,
}: UseConditionalPasskeyOptions): UseConditionalPasskeyReturn {
  const [supported, setSupported] = useState(false);
  const [conditionalSupported, setConditionalSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if conditional mediation is already running to prevent duplicates
  const conditionalAbortController = useRef<AbortController | null>(null);

  // Feature detection on mount
  useEffect(() => {
    let mounted = true;

    async function detectSupport() {
      const [passkeySupport, conditionalSupport] = await Promise.all([
        passkeysSupported(),
        conditionalMediationAvailable(),
      ]);

      if (!mounted) return;

      setSupported(passkeySupport);
      setConditionalSupported(conditionalSupport);

      if (!passkeySupport && onUnsupported) {
        onUnsupported();
      }
    }

    detectSupport();

    return () => {
      mounted = false;
      // Cancel any pending conditional mediation
      conditionalAbortController.current?.abort();
    };
  }, [onUnsupported]);

  /**
   * Start conditional mediation when email field is ready
   * This allows passkeys to appear in autofill UI automatically
   */
  useEffect(() => {
    if (!conditionalSupported || !emailRef.current) return;

    const email = emailRef.current.value.trim();
    if (!email) return; // Wait for user to type email

    // Don't start if already authenticating
    if (conditionalAbortController.current) return;

    const controller = new AbortController();
    conditionalAbortController.current = controller;

    startConditionalAuth(email, controller.signal);

    return () => {
      controller.abort();
      conditionalAbortController.current = null;
    };
  }, [conditionalSupported, emailRef]);

  /**
   * Start conditional authentication (auto-prompt)
   */
  const startConditionalAuth = async (email: string, signal: AbortSignal) => {
    try {
      analytics.passkeys.auth.conditional_prompt_shown();

      const { options, challengeKey } = await getAuthenticationOptions(email);
      
      // Convert base64url to ArrayBuffer for WebAuthn
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        ...options,
        challenge: base64ToBuffer(options.challenge as unknown as string),
        allowCredentials: options.allowCredentials?.map((cred) => ({
          ...cred,
          id: base64ToBuffer(cred.id as unknown as string),
          // Remove transports to prevent Chrome from asking for Bluetooth/USB keys
          // Platform authenticators (Touch ID/Face ID) don't need transports specified
          transports: undefined,
        })),
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions,
        // @ts-ignore - mediation is valid but not in all TS defs
        mediation: 'conditional',
        signal,
      }) as PublicKeyCredential | null;

      if (!credential) return; // User cancelled or no credential

      setIsAuthenticating(true);

      const result = await verifyAuthentication(email, credential, challengeKey);

      if (result.success) {
        analytics.passkeys.auth.success();
        onSuccess();
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (err) {
      // Ignore AbortError (normal when user navigates away)
      if (err instanceof Error && err.name === 'AbortError') return;
      
      // NotAllowedError means user cancelled - don't show error
      if (err instanceof Error && err.name === 'NotAllowedError') {
        analytics.passkeys.auth.fallback_magic_link();
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      console.error('[Passkey] Conditional auth error:', errorMessage);
      analytics.passkeys.auth.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsAuthenticating(false);
      conditionalAbortController.current = null;
    }
  };

  /**
   * Try passkey authentication with optional mediation (manual button click)
   * This shows the system passkey picker UI
   */
  const tryOptional = useCallback(async () => {
    if (!supported || !emailRef.current) {
      setError('Passkeys not supported on this device');
      return;
    }

    const email = emailRef.current.value.trim();
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      const { options, challengeKey } = await getAuthenticationOptions(email);

      // Convert base64url to ArrayBuffer
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        ...options,
        challenge: base64ToBuffer(options.challenge as unknown as string),
        allowCredentials: options.allowCredentials?.map((cred) => ({
          ...cred,
          id: base64ToBuffer(cred.id as unknown as string),
          // Remove transports to prevent Chrome from asking for Bluetooth/USB keys
          // Platform authenticators (Touch ID/Face ID) don't need transports specified
          transports: undefined,
        })),
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions,
        // @ts-ignore - mediation is valid
        mediation: 'optional',
      }) as PublicKeyCredential | null;

      if (!credential) {
        analytics.passkeys.auth.fallback_magic_link();
        setError('Passkey authentication cancelled');
        return;
      }

      const result = await verifyAuthentication(email, credential, challengeKey);

      if (result.success) {
        analytics.passkeys.auth.success();
        onSuccess();
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (err) {
      // NotAllowedError means user cancelled
      if (err instanceof Error && err.name === 'NotAllowedError') {
        analytics.passkeys.auth.fallback_magic_link();
        setError('Authentication cancelled - you can use magic link instead');
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      console.error('[Passkey] Optional auth error:', errorMessage);
      analytics.passkeys.auth.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  }, [supported, emailRef, onSuccess]);

  return {
    supported,
    conditionalSupported,
    tryOptional,
    isAuthenticating,
    error,
  };
}
