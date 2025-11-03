# Passkey Implementation Guide

## Overview

This implementation provides a complete passwordless authentication system using WebAuthn passkeys with the following features:

- **Conditional Mediation**: Automatic passkey prompts when users type their email (on supported browsers)
- **First-Login Modal**: One-time setup prompt after magic link authentication
- **Graceful Fallback**: Magic link always available as backup
- **Platform-Aware**: Shows "Face ID", "Touch ID", or "Windows Hello" based on device
- **Privacy-First**: Biometric data never leaves the user's device

## User Flow

### First-Time User

1. User visits `/auth/signin-new`
2. Enters email and clicks "Continue with Email"
3. Receives magic link in email
4. Clicks link and lands on `/dashboard`
5. **Modal appears**: "Use Face ID or your fingerprint next time?"
6. User clicks "Set up" → browser prompts for Touch ID/Face ID
7. Passkey is registered and stored in database
8. Modal dismissed (won't show again)

### Returning User (with passkey)

**On supported browsers with conditional mediation:**
1. User visits `/auth/signin-new`
2. Starts typing email
3. Browser automatically shows passkey autofill suggestion
4. User selects passkey → instant sign-in (no email link needed!)

**On browsers without conditional mediation:**
1. User visits `/auth/signin-new`
2. Enters email
3. Sees "Sign in with [Face ID/Touch ID]" button
4. Clicks button → browser prompts → instant sign-in

**Fallback:**
- Magic link button always visible
- Works on any device/browser

## Files Created

### Core Library
- **`src/lib/passkeys.ts`**: Feature detection, API wrappers, analytics stubs
- **`src/lib/redis.ts`**: Upstash Redis client wrapper
- **`src/hooks/useConditionalPasskey.ts`**: React hook for conditional mediation

### API Endpoints
- **`src/app/api/webauthn/registration/options/route.ts`**: Generate registration challenge
- **`src/app/api/webauthn/registration/verify/route.ts`**: Verify and store new passkey
- **`src/app/api/webauthn/authentication/options/route.ts`**: Generate authentication challenge
- **`src/app/api/webauthn/authentication/verify/route.ts`**: Verify passkey and establish session

### UI Components
- **`src/app/dashboard/security/PasskeySetupModal.tsx`**: One-time setup modal
- **`src/components/DashboardWithPasskeySetup.tsx`**: Dashboard wrapper with modal logic
- **`src/app/auth/signin-new/page.tsx`**: Enhanced sign-in page (updated)
- **`src/app/dashboard/page.tsx`**: Dashboard with passkey check (updated)

## Environment Variables Required

```env
# Upstash Redis (for challenge storage)
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# WebAuthn Configuration
WEBAUTHN_RP_ID="localhost"  # Change to your domain in production
WEBAUTHN_RP_NAME="Flow Grid"
NEXTAUTH_URL="http://localhost:3000"  # Your app URL
```

## Testing Checklist

### Local Development (macOS with Touch ID)

1. **Clean Start**
   ```bash
   # Clear localStorage
   # In browser console:
   localStorage.clear()
   ```

2. **Test Magic Link → Passkey Setup**
   - Visit http://localhost:3000/auth/signin-new
   - Enter email (e.g., `test@example.com`)
   - Click "Continue with Email"
   - Check email and click magic link
   - **Verify**: Modal appears on dashboard
   - Click "Set up" → Touch ID prompt
   - Complete Touch ID → modal closes
   - **Database check**: `WebAuthnCredential` record created

3. **Test Conditional Mediation (Chrome/Edge)**
   - Sign out
   - Return to http://localhost:3000/auth/signin-new
   - Start typing the same email
   - **Verify**: Browser shows passkey autofill above email field
   - Select passkey → Touch ID prompt
   - Complete → redirected to dashboard (no email sent!)

4. **Test Manual Passkey Sign-In (Safari)**
   - Sign out
   - Return to http://localhost:3000/auth/signin-new
   - Enter email
   - **Verify**: "Sign in with Touch ID" button appears
   - Click button → Touch ID prompt
   - Complete → redirected to dashboard

5. **Test Fallback**
   - Sign out
   - Visit signin page
   - Enter different email (no passkey)
   - **Verify**: No passkey button shown, tip says "set up a passkey"
   - Click "Continue with Email" → magic link still works

### Production Checklist

Before deploying:

1. **Update Environment Variables**
   ```env
   WEBAUTHN_RP_ID="yourdomain.com"  # No protocol, no port
   NEXTAUTH_URL="https://yourdomain.com"
   ```

2. **Test on Multiple Browsers**
   - Chrome/Edge (conditional mediation works)
   - Safari (manual button only)
   - Firefox (check support)
   - Mobile Safari (Face ID/Touch ID)
   - Mobile Chrome (fingerprint)

3. **Test Cross-Device**
   - Passkey registered on laptop should NOT work on phone (device-specific)
   - User can register multiple passkeys (one per device)

4. **Analytics Verification**
   - Check console for analytics events:
     - `passkeys.registration.modal_shown`
     - `passkeys.registration.success`
     - `passkeys.auth.conditional_prompt_shown`
     - `passkeys.auth.success`
     - `passkeys.auth.fallback_magic_link`

## Security Notes

### Rate Limiting
- Registration options: 5 requests / 5 minutes per user
- Authentication options: 10 requests / minute per email
- Prevents brute force and enumeration attacks

### Challenge Storage
- Challenges stored in Redis with 5-minute TTL
- Consumed (deleted) after one use
- Prevents replay attacks

### Privacy
- Biometric data never leaves the device
- Credential IDs are public (not sensitive)
- User verification required on every authentication

### Account Enumeration Protection
- Authentication endpoints return generic errors
- No indication whether user exists or has passkey
- Empty allowCredentials for non-existent users

## Browser Compatibility

| Browser | Conditional Mediation | Manual Button | Notes |
|---------|----------------------|---------------|-------|
| Chrome 108+ | ✅ Yes | ✅ Yes | Best experience |
| Edge 108+ | ✅ Yes | ✅ Yes | Best experience |
| Safari 16+ | ❌ No | ✅ Yes | Manual only |
| Firefox 119+ | ⚠️ Partial | ✅ Yes | Check support |
| Mobile Safari | ✅ Yes | ✅ Yes | Face ID/Touch ID |
| Mobile Chrome | ✅ Yes | ✅ Yes | Fingerprint |

## Troubleshooting

### "Passkeys not supported" Error
- Check HTTPS (required in production)
- Verify browser version
- Ensure device has biometric sensor
- Check if incognito/private mode (some browsers block)

### Modal Not Showing
- Check localStorage: `fg:passkeySetupDismissed:v1` and `fg:firstLoginComplete`
- Verify user has no existing passkey in database
- Check browser console for errors

### Conditional Mediation Not Working
- Ensure `autocomplete="email webauthn"` on email input
- Check browser supports conditional mediation
- Verify passkey exists for that email
- Try clearing browser's autofill cache

### Challenge Expired Errors
- Check Redis connection (UPSTASH_REDIS_REST_URL)
- Verify system clock is synchronized
- Increase TTL if needed (currently 5 minutes)

## Future Enhancements

### Replace Analytics Stubs
Current implementation uses `console.log` stubs. Replace with your analytics provider:

```typescript
// In src/lib/passkeys.ts, replace:
export const analytics = {
  passkeys: {
    registration: {
      modal_shown: () => yourAnalytics.track('passkey_modal_shown'),
      success: () => yourAnalytics.track('passkey_registered'),
      // ...
    }
  }
};
```

### Add Passkey Management UI
Users can register multiple passkeys (home computer, work laptop, phone). Consider building:
- List of registered passkeys with device names
- Delete passkey functionality
- Rename passkey labels

### Platform Authenticators (YubiKey, etc.)
Current implementation prefers platform authenticators. To support security keys:

```typescript
// In registration options:
authenticatorSelection: {
  authenticatorAttachment: undefined, // Allow both platform and cross-platform
  residentKey: 'preferred',
  userVerification: 'preferred',
}
```

## Support

For issues or questions:
- Check browser console for error messages
- Verify all environment variables are set
- Ensure Prisma migrations have run (`npx prisma db push`)
- Check Redis connectivity (`redis.get('test')` in API route)
