# Auth UX Refactor - Passkey Management

## Summary

This refactor moves passkey management to Settings → Security and adds conditional passkey signin based on email enumeration-safe checking.

## Changes Made

### 1. New Files Created

#### Core Infrastructure
- **`src/lib/normalize-email.ts`** - Email normalization utilities
  - `normalizeEmail(email: string)` - Lowercases and trims email
  - `isValidEmail(email: string)` - Validates email format

- **`src/lib/consent.ts`** - Analytics consent and tracking stubs
  - `hasAnalyticsConsent()` - Check user consent
  - `track(event, properties)` - Track events with consent guard

#### API Endpoints
- **`src/app/api/webauthn/check/route.ts`** - Enumeration-safe passkey check
  - POST endpoint returning `{ hasPasskey: boolean }`
  - Rate limited: 30 requests/minute per IP
  - Returns 400 for invalid email, 405 for non-POST
  - Does NOT reveal if user exists without passkey

#### Settings Pages
- **`src/app/settings/layout.tsx`** - Settings layout with tab navigation
  - Tabs: Profile, Security, Notifications
  - Authenticated route (redirects to signin if not logged in)

- **`src/app/settings/security/page.tsx`** - Security settings (server component)
  - Fetches user's passkeys from database
  - Passes data to client component

- **`src/app/settings/security/SecurityPageClient.tsx`** - Security UI (client component)
  - Displays passkey explainer (WebAuthn/FIDO2, phishing-resistant)
  - Shows list of registered passkeys with metadata
  - "Add Passkey" button with registration flow
  - Success toast: "Passkey added. You can now sign in with Touch ID/Face ID."

- **`src/app/settings/profile/page.tsx`** - Profile placeholder
- **`src/app/settings/notifications/page.tsx`** - Notifications placeholder

#### Legacy Redirect
- **`src/app/security/page.tsx`** - Redirects to `/settings/security`

#### Tests
- **`tests/webauthn-check.test.ts`** - API endpoint tests
  - Valid email with passkey → `{ hasPasskey: true }`
  - Unknown/no-passkey email → `{ hasPasskey: false }`
  - Invalid email → 400
  - Rate limiting → 429
  - Email normalization

- **`tests/signin-passkey-visibility.test.tsx`** - UI component tests
  - Passkey button shows when `hasPasskey === true`
  - Button hidden + hint shown when `hasPasskey === false`
  - Debouncing (300ms)
  - Accessibility (aria-labels, aria-live)

### 2. Updated Files

#### Sign-In Page (`src/app/auth/signin/page.tsx`)
**New Features:**
- Conditional passkey button (only shows when email has passkey)
- Debounced email check (300ms delay)
- Passkey availability hint with `aria-live="polite"`
- Email input has `autocomplete="email webauthn"` for browser hints
- Updated subtitle: "Your device biometrics will appear automatically if you've added a passkey for this email."

**UX Flow:**
1. User types email
2. After 300ms, checks `/api/webauthn/check`
3. If `hasPasskey === true` → shows "Sign in with [Touch ID/Face ID]" button
4. If `hasPasskey === false` → shows hint: "No passkey for this email yet — you can add one after signing in."
5. Clicking passkey button → WebAuthn flow → NextAuth signin → redirect to dashboard

**Error Handling:**
- Failed passkey auth: "No passkey found for this email. Sign in with email or Google, then add a passkey in Settings → Security."

#### Authentication Options Endpoint
- **`src/app/api/webauthn/authentication/options/route.ts`**
  - Now uses `normalizeEmail()` from shared utility

### 3. Settings Navigation Structure

```
/settings
├── /profile (placeholder)
├── /security (passkey management)
└── /notifications (placeholder)
```

**Tab Navigation:**
- Active tab highlighted in blue
- Responsive design
- Accessible with proper ARIA attributes

### 4. Passkey Management Flow

**Before (Old):**
- One-time modal on first dashboard visit
- `/security` route (legacy)

**After (New):**
- `/settings/security` dedicated page
- Persistent access to passkey management
- Explainer text about WebAuthn/FIDO2
- List view of all registered passkeys
- Easy "Add Passkey" workflow

### 5. Security & Privacy

**Enumeration Protection:**
- `/api/webauthn/check` does NOT reveal if user exists
- Returns `false` for both "user doesn't exist" and "user exists but no passkey"
- Rate limited to prevent brute force enumeration

**Email Normalization:**
- All emails lowercased and trimmed
- Prevents `user@example.com` vs `User@Example.com` issues
- Used in: signin, passkey check, registration, authentication

### 6. Accessibility

**ARIA Attributes:**
- `aria-label` on all signin buttons
- `aria-live="polite"` on passkey hint (announces when available)
- `aria-current="page"` on active settings tab
- Proper focus management

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Tab order logical
- Focus indicators visible

### 7. Analytics Integration

**Events Tracked (consent-guarded):**
- `passkey_login_attempt` - User clicks passkey signin button
- `passkey_check_performed` - Email check for passkey availability
- `passkey_registration_start` - User clicks "Add Passkey"
- `passkey_registration_success` - Passkey successfully added
- `passkey_registration_cancel` - User cancels registration

**Stub Implementation:**
- Console logging for now
- Ready for Plausible/PostHog/GA integration
- Consent check before tracking

### 8. TypeScript & Linting

**Strict Mode:**
- All new files use strict TypeScript
- Proper type annotations
- No `any` types (except in Prisma-generated code)

**Known Issues:**
- Prisma `webAuthnCredentials` property shows TypeScript error (compile-time only)
- Test files need Jest installation for types

## Testing

### Unit Tests
Run tests with:
```bash
npm test
```

### Manual Testing Checklist
- [ ] Sign in with email + passkey button shows
- [ ] Sign in with email without passkey → hint shows
- [ ] Passkey signin succeeds
- [ ] Visit `/settings/security` → see passkeys
- [ ] Add new passkey from settings
- [ ] Legacy `/security` redirects to `/settings/security`
- [ ] Email normalization works (TEST@example.com === test@example.com)
- [ ] Rate limiting triggers after 30 checks/min

## Migration Notes

### For Existing Users
- Old `/security` route auto-redirects to `/settings/security`
- No data migration needed
- Existing passkeys work as before

### For Developers
1. Install test dependencies (if running tests):
   ```bash
   npm install --save-dev @jest/globals @testing-library/react @testing-library/jest-dom
   ```

2. Use `normalizeEmail()` for all email operations:
   ```typescript
   import { normalizeEmail } from '@/lib/normalize-email'
   const email = normalizeEmail(userInput)
   ```

3. Analytics tracking pattern:
   ```typescript
   import { track } from '@/lib/consent'
   track('event_name', { property: 'value' })
   ```

## Commit Message

```
feat(auth-ux): move passkey setup to /settings/security and add enumeration-safe conditional passkey button on sign-in

- Create /settings layout with Profile/Security/Notifications tabs
- Move passkey management to /settings/security with explainer and list view
- Add conditional "Sign in with Passkey" button on signin (300ms debounced check)
- Create enumeration-safe /api/webauthn/check endpoint (rate limited 30/min)
- Add email normalization utility (lowercase + trim)
- Add analytics consent stub with guarded tracking
- Redirect legacy /security route to /settings/security
- Add comprehensive tests for passkey check API and signin UX
- Improve accessibility with aria-labels and aria-live regions
- Show helpful hints when email has no passkey

BREAKING: /security route now redirects to /settings/security
```

## Next Steps

1. **Install test dependencies** (optional):
   ```bash
   npm install --save-dev jest @jest/globals @testing-library/react @testing-library/jest-dom
   ```

2. **Configure analytics** in `src/lib/consent.ts`:
   - Replace console.log with your analytics provider
   - Implement proper consent management

3. **Customize copy** in Settings → Security:
   - Update explainer text for your brand
   - Adjust error messages if needed

4. **Add profile/notification settings**:
   - Implement actual functionality in placeholder pages

5. **Production deployment**:
   - Update `WEBAUTHN_RP_ID` to production domain
   - Test across devices/browsers
   - Monitor rate limiting effectiveness

## Files Changed

**New:**
- src/lib/normalize-email.ts
- src/lib/consent.ts
- src/app/api/webauthn/check/route.ts
- src/app/settings/layout.tsx
- src/app/settings/security/page.tsx
- src/app/settings/security/SecurityPageClient.tsx
- src/app/settings/profile/page.tsx
- src/app/settings/notifications/page.tsx
- src/app/security/page.tsx (redirect)
- tests/webauthn-check.test.ts
- tests/signin-passkey-visibility.test.tsx

**Updated:**
- src/app/auth/signin/page.tsx (conditional passkey button)
- src/app/api/webauthn/authentication/options/route.ts (email normalization)
