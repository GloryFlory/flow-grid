/**
 * Passkey feature detection and API helpers
 * 
 * Provides type-safe wrappers around WebAuthn APIs and server endpoints
 * for passkey registration and authentication with conditional mediation support.
 */

// ============================================================================
// Feature Detection
// ============================================================================

/**
 * Check if passkeys (platform authenticators) are supported on this device
 * @returns Promise<boolean> - true if device has Face ID, Touch ID, Windows Hello, etc.
 */
export const passkeysSupported = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (!('PublicKeyCredential' in window)) return false;
  
  try {
    const uvpaa = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
    return Boolean(uvpaa);
  } catch {
    return false;
  }
};

/**
 * Check if conditional mediation (autofill UI) is available
 * Allows passkeys to appear in autofill suggestions when user focuses email field
 * @returns Promise<boolean> - true if browser supports conditional mediation
 */
export const conditionalMediationAvailable = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (!('PublicKeyCredential' in window)) return false;
  
  try {
    const available = await PublicKeyCredential.isConditionalMediationAvailable?.();
    return Boolean(available);
  } catch {
    return false;
  }
};

/**
 * Get user-friendly authenticator name based on platform
 * @returns string - "Face ID", "Touch ID", "Windows Hello", or "Passkey"
 */
export const getAuthenticatorName = (): string => {
  if (typeof window === 'undefined') return 'Passkey';
  
  const ua = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';
  
  // iOS/iPadOS
  if (/iphone|ipad|ipod/.test(ua)) return 'Face ID or Touch ID';
  
  // macOS
  if (/mac/.test(platform)) return 'Touch ID';
  
  // Windows
  if (/win/.test(platform)) return 'Windows Hello';
  
  // Android
  if (/android/.test(ua)) return 'fingerprint or face unlock';
  
  return 'Passkey';
};

// ============================================================================
// Type Definitions
// ============================================================================

export interface RegistrationOptionsResponse {
  options: PublicKeyCredentialCreationOptions;
  challengeKey: string;
}

export interface RegistrationVerifyRequest {
  challengeKey: string;
  credential: PublicKeyCredential;
}

export interface RegistrationVerifyResponse {
  success: boolean;
  credentialId?: string;
  error?: string;
}

export interface AuthenticationOptionsRequest {
  email: string;
}

export interface AuthenticationOptionsResponse {
  options: PublicKeyCredentialRequestOptions;
  challengeKey: string;
}

export interface AuthenticationVerifyRequest {
  email: string;
  challengeKey: string;
  credential: PublicKeyCredential;
}

export interface AuthenticationVerifyResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

// ============================================================================
// Analytics Stubs
// ============================================================================

/**
 * Analytics event tracking (console stubs for now)
 * Replace with your analytics provider (Plausible, PostHog, etc.)
 */
export const analytics = {
  passkeys: {
    registration: {
      modal_shown: () => console.log('[Analytics] passkeys.registration.modal_shown'),
      success: () => console.log('[Analytics] passkeys.registration.success'),
      cancel: () => console.log('[Analytics] passkeys.registration.cancel'),
      error: (error: string) => console.log('[Analytics] passkeys.registration.error', { error }),
    },
    auth: {
      conditional_prompt_shown: () => console.log('[Analytics] passkeys.auth.conditional_prompt_shown'),
      success: () => console.log('[Analytics] passkeys.auth.success'),
      fallback_magic_link: () => console.log('[Analytics] passkeys.auth.fallback_magic_link'),
      error: (error: string) => console.log('[Analytics] passkeys.auth.error', { error }),
    },
  },
};

// ============================================================================
// API Helpers - Registration
// ============================================================================

/**
 * Get registration options from server to start passkey creation
 * User must be authenticated (session required on server)
 * @returns Promise<RegistrationOptionsResponse> - WebAuthn options and challenge
 */
export async function getRegistrationOptions(): Promise<RegistrationOptionsResponse> {
  const response = await fetch('/api/webauthn/registration/options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get registration options' }));
    throw new Error(error.error || 'Failed to get registration options');
  }

  return response.json();
}

/**
 * Verify passkey registration with server
 * User must be authenticated (session required on server)
 * @param credential - PublicKeyCredential from navigator.credentials.create()
 * @param challengeKey - Challenge key from registration options response
 * @returns Promise<RegistrationVerifyResponse> - Success status and credential ID
 */
export async function verifyRegistration(
  credential: PublicKeyCredential,
  challengeKey: string
): Promise<RegistrationVerifyResponse> {
  // Serialize credential for transmission
  const response = credential.response as AuthenticatorAttestationResponse;
  const serializedCredential = {
    id: credential.id,
    rawId: bufferToBase64(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64(response.clientDataJSON),
      attestationObject: bufferToBase64(response.attestationObject),
    },
  };

  const res = await fetch('/api/webauthn/registration/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      challengeKey,
      credential: serializedCredential,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to verify registration' }));
    throw new Error(error.error || 'Failed to verify registration');
  }

  return res.json();
}

// ============================================================================
// API Helpers - Authentication
// ============================================================================

/**
 * Get authentication options from server to start passkey sign-in
 * @param email - User's email address
 * @returns Promise<AuthenticationOptionsResponse> - WebAuthn options and challenge
 */
export async function getAuthenticationOptions(
  email: string
): Promise<AuthenticationOptionsResponse> {
  const response = await fetch('/api/webauthn/authentication/options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get authentication options' }));
    throw new Error(error.error || 'Failed to get authentication options');
  }

  return response.json();
}

/**
 * Verify passkey authentication with server
 * @param email - User's email address
 * @param credential - PublicKeyCredential from navigator.credentials.get()
 * @param challengeKey - Challenge key from authentication options response
 * @returns Promise<AuthenticationVerifyResponse> - Success status and user ID
 */
export async function verifyAuthentication(
  email: string,
  credential: PublicKeyCredential,
  challengeKey: string
): Promise<AuthenticationVerifyResponse> {
  // Serialize credential for transmission
  const response = credential.response as AuthenticatorAssertionResponse;
  const serializedCredential = {
    id: credential.id,
    rawId: bufferToBase64(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToBase64(response.clientDataJSON),
      authenticatorData: bufferToBase64(response.authenticatorData),
      signature: bufferToBase64(response.signature),
      userHandle: response.userHandle ? bufferToBase64(response.userHandle) : null,
    },
  };

  const res = await fetch('/api/webauthn/authentication/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      challengeKey,
      credential: serializedCredential,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to verify authentication' }));
    throw new Error(error.error || 'Failed to verify authentication');
  }

  return res.json();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert ArrayBuffer to base64url string for transmission
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert base64url string to ArrayBuffer
 */
export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
