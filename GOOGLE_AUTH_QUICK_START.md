# Google Authentication - Quick Start ✅

## What's Been Done

✅ **Code Changes Complete:**
- Enabled Google Provider in `src/lib/auth.ts`
- Uncommented Google sign-in button on sign-in page
- Uncommented Google sign-up button on signup page

✅ **Packages Installed:**
- `next-auth` v4.24.11
- `@next-auth/prisma-adapter` v1.0.7
- All dependencies ready

## What You Need To Do

### Step 1: Get Google OAuth Credentials (15 minutes)

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google+ API
4. Configure OAuth consent screen
5. Create OAuth Client ID (Web application)
6. **Add these redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

See detailed instructions in `GOOGLE_AUTH_SETUP.md`

### Step 2: Add Credentials to Environment

Add to your `.env.local`:

```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### Step 3: Restart Dev Server

```bash
npm run dev
```

### Step 4: Test

1. Go to http://localhost:3000/auth/signin
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected to dashboard

## How It Works

```
User clicks "Continue with Google"
        ↓
Redirected to Google sign-in
        ↓
User authorizes app
        ↓
Google redirects to /api/auth/callback/google
        ↓
NextAuth creates/updates user in database
        ↓
User signed in → redirected to /dashboard
```

## Database Integration

The Prisma Adapter automatically:
- Creates user record in `User` table
- Links Google account in `Account` table
- Stores OAuth tokens in `Account` table
- Links sessions in `Session` table

No additional database setup needed! Your existing Prisma schema already has the required tables.

## Troubleshooting

**"redirect_uri_mismatch" error:**
- Check redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`
- No trailing slashes

**Can't see the button:**
- Make sure dev server is restarted
- Clear browser cache

**Error after Google redirects back:**
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Verify credentials are saved in `.env.local`
- Restart dev server

## Production Deployment

When deploying:
1. Add production domain to Google Console authorized origins
2. Add `https://yourdomain.com/api/auth/callback/google` to redirect URIs
3. Set environment variables in hosting platform
4. Update `NEXTAUTH_URL` to production domain

## Next Steps

After Google auth is working:
- [ ] Test sign-up flow with Google
- [ ] Test existing users signing in with Google
- [ ] Verify user data appears in dashboard
- [ ] Test subscription assignment for new Google users
- [ ] Configure additional OAuth providers (GitHub, etc.)

Need help? Check `GOOGLE_AUTH_SETUP.md` for detailed instructions.
