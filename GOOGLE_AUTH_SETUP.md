# Google Authentication Setup Guide

This guide will walk you through setting up Google OAuth for Flow Grid.

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project** (or select existing)
   - Click "Select a project" at the top
   - Click "New Project"
   - Name it "Flow Grid" (or your preferred name)
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" (unless you have a Google Workspace)
   - Click "Create"
   
   **App Information:**
   - App name: `Flow Grid`
   - User support email: Your email
   - App logo: (optional, can upload later)
   
   **App domain:**
   - Application home page: `http://localhost:3000` (for development)
   - Privacy policy: (can skip for development)
   - Terms of service: (can skip for development)
   
   **Developer contact:**
   - Email: Your email
   
   - Click "Save and Continue"
   
   **Scopes:**
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click "Update" then "Save and Continue"
   
   **Test users (for development):**
   - Add your email and any test user emails
   - Click "Save and Continue"

5. **Create OAuth Client ID**
   - Go to "APIs & Services" > "Credentials"
   - Click "+ Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Name: `Flow Grid Web Client`
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://yourdomain.com (add when deploying)
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google (add when deploying)
   ```
   
   - Click "Create"
   - **IMPORTANT:** Copy your Client ID and Client Secret

## Step 2: Add Credentials to .env.local

Open your `.env.local` file and add:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

Replace with the actual values from Step 1.

## Step 3: Update NextAuth Secret (Production)

For production, generate a secure secret:

```bash
# Run this in your terminal
openssl rand -base64 32
```

Then update in `.env.local` (and production environment):

```bash
NEXTAUTH_SECRET="your-generated-secret-here"
```

## Step 4: Test the Integration

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Visit the sign-in page:**
   ```
   http://localhost:3000/auth/signin
   ```

3. **Click "Continue with Google"**
   - You should be redirected to Google's sign-in page
   - Sign in with your Google account
   - You'll be redirected back to your app at `/dashboard`

## Step 5: Production Deployment

When deploying to production (Vercel, etc.):

1. **Update authorized origins and redirect URIs** in Google Cloud Console:
   - Add your production domain (e.g., `https://flowgrid.com`)
   - Add redirect URI: `https://flowgrid.com/api/auth/callback/google`

2. **Set environment variables** in your hosting platform:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET` (strong secret from openssl command)

3. **Update consent screen** (optional but recommended):
   - Switch from "Testing" to "In Production"
   - This requires verification if you need more than 100 users

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- Check for trailing slashes (shouldn't have any)

### Error: "Access blocked: Flow Grid has not completed the Google verification process"
- This is normal for apps in "Testing" mode
- Add your email to "Test users" in OAuth consent screen
- For production with >100 users, you'll need to verify your app

### Users can't sign in
- Check that Google+ API is enabled
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Restart dev server after adding credentials

## Optional: Configure Supabase Auth (Alternative Approach)

If you want to use Supabase Auth instead of NextAuth:

1. **Go to Supabase Dashboard**
   - Navigate to: Authentication > Providers
   - Enable "Google"

2. **Add Google OAuth credentials:**
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)

3. **Add Supabase redirect URI to Google Console:**
   ```
   https://rfpoqcliiduvotlfzopv.supabase.co/auth/v1/callback
   ```

Note: Current setup uses NextAuth for more control. Supabase Auth is an alternative if you want to use Supabase's built-in auth system.

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all secrets
3. **Rotate secrets** periodically
4. **Use HTTPS** in production
5. **Enable 2FA** on your Google Cloud account
6. **Review OAuth scopes** regularly - only request what you need

## What Happens After Sign-In?

1. User clicks "Continue with Google"
2. Redirected to Google sign-in
3. User authorizes the app
4. Google redirects back with authorization code
5. NextAuth exchanges code for user info
6. Prisma Adapter creates/updates user in database
7. User is signed in and redirected to dashboard

The database automatically stores:
- Email (from Google)
- Name (from Google)
- Avatar/image (from Google profile picture)
- Account linking (in Account table via Prisma Adapter)
