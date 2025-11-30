/**
 * Anonymous User Identification Utility
 * 
 * Manages anonymous user IDs for visitors without requiring login.
 * Uses localStorage to persist the ID across sessions.
 */

const ANON_USER_KEY = 'flowgrid_anon_user_id'

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get or create an anonymous user ID
 * 
 * @returns The anonymous user ID (UUID v4)
 * 
 * @example
 * ```ts
 * const anonUserId = getAnonUserId()
 * // => "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function getAnonUserId(): string {
  // Only run on client side
  if (typeof window === 'undefined') {
    return ''
  }

  // Check if we already have an ID
  let anonUserId = localStorage.getItem(ANON_USER_KEY)

  if (!anonUserId) {
    // Generate a new UUID v4
    anonUserId = generateUUID()
    localStorage.setItem(ANON_USER_KEY, anonUserId)
  }

  return anonUserId
}

/**
 * Clear the anonymous user ID (useful for testing or "forget me" feature)
 */
export function clearAnonUserId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ANON_USER_KEY)
}

/**
 * Check if an anonymous user ID exists
 */
export function hasAnonUserId(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(ANON_USER_KEY) !== null
}
