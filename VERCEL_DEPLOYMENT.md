# Vercel Deployment Guide for Flow Grid

## Quick Deploy Steps

### 1. Push to GitHub

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your `flow-grid` repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `prisma generate && next build`
   - **Install Command**: `npm install`

### 3. Set Environment Variables

In Vercel project settings → Environment Variables, add:

#### Required Variables:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.rfpoqcliiduvotlfzopv:VBkiMiI0BUg3I5oP@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.rfpoqcliiduvotlfzopv:VBkiMiI0BUg3I5oP@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://your-app-name.vercel.app"  # Update after deployment
NEXTAUTH_SECRET="your-generated-secret"  # Use: openssl rand -base64 32

# Google OAuth (after setup)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Supabase
SUPABASE_URL="https://rfpoqcliiduvotlfzopv.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcG9xY2xpaWR1dm90bGZ6b3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTM3MDcsImV4cCI6MjA3NjE2OTcwN30.3TTof6rKWWDJ-Fzcs2wSLfTxxQnHPPWSFn-IJbYO8l4"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcG9xY2xpaWR1dm90bGZ6b3B2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU5MzcwNywiZXhwIjoyMDc2MTY5NzA3fQ.CRcm57HxSot6id8LZpWX-aKREAUJSVOw8tZGQd-1yds"

# App Settings
NEXT_PUBLIC_APP_URL="https://your-app-name.vercel.app"
NEXT_PUBLIC_APP_NAME="Flow Grid"
```

**Important**: Set all variables for **Production**, **Preview**, and **Development** environments.

### 4. Deploy

Click "Deploy" - Vercel will:
1. Install dependencies
2. Generate Prisma client
3. Build Next.js app
4. Deploy to global CDN

### 5. Update Google OAuth

After deployment, get your Vercel URL (e.g., `https://flow-grid.vercel.app`) and:

1. **Go to Google Cloud Console**
2. **Update OAuth Client**:
   
   **Authorized JavaScript origins:**
   ```
   https://flow-grid.vercel.app
   ```
   
   **Authorized redirect URIs:**
   ```
   https://flow-grid.vercel.app/api/auth/callback/google
   ```

3. **Update Vercel environment variable**:
   - Set `NEXTAUTH_URL` to `https://flow-grid.vercel.app`
   - Redeploy (Settings → Deployments → Redeploy)

## Common Deployment Issues

### ❌ "Prisma Client not generated"

**Solution**: Make sure build command includes `prisma generate`:
```json
{
  "buildCommand": "prisma generate && next build"
}
```

Or add to `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### ❌ "Module not found: sessions.json"

**Solution**: Make sure `src/data/sessions.json` is committed to git:
```bash
git add src/data/sessions.json
git commit -m "Add sessions data"
git push
```

### ❌ "Database connection failed"

**Solution**: 
1. Check DATABASE_URL in Vercel environment variables
2. Make sure Supabase allows connections from `0.0.0.0/0` (all IPs)
3. Use connection pooling URL for Vercel (with `?pgbouncer=true`)

### ❌ "NextAuth configuration error"

**Solution**:
1. Verify NEXTAUTH_URL matches your Vercel domain
2. Generate secure NEXTAUTH_SECRET: `openssl rand -base64 32`
3. Redeploy after updating env vars

### ❌ "Image optimization error"

**Solution**: Supabase images are already configured in `next.config.mjs`. If you see errors:
```javascript
// next.config.mjs
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'rfpoqcliiduvotlfzopv.supabase.co',
    },
  ],
}
```

## Post-Deployment Checklist

- [ ] App loads at Vercel URL
- [ ] Database connection works (check /dashboard)
- [ ] Google OAuth works (try sign in)
- [ ] Images load correctly
- [ ] Public schedules accessible
- [ ] Admin dashboard accessible
- [ ] Environment variables all set
- [ ] Custom domain configured (optional)

## Custom Domain Setup (Optional)

1. **In Vercel**:
   - Settings → Domains
   - Add your domain (e.g., `flowgrid.com`)
   - Follow DNS instructions

2. **Update Environment Variables**:
   ```bash
   NEXTAUTH_URL="https://flowgrid.com"
   NEXT_PUBLIC_APP_URL="https://flowgrid.com"
   ```

3. **Update Google OAuth**:
   - Add custom domain to authorized origins
   - Add `https://flowgrid.com/api/auth/callback/google` to redirect URIs

## Monitoring & Logs

**View deployment logs**:
- Vercel Dashboard → Your Project → Deployments → Click deployment
- View build logs and runtime logs

**Check errors**:
- Vercel Dashboard → Your Project → Logs
- Filter by error level

## Rollback

If deployment fails:
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

## Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Edge caching
- ✅ Image optimization
- ✅ Automatic HTTPS
- ✅ Zero-config deployment

## Need Help?

Common fixes:
1. **Clear build cache**: Settings → General → Clear Build Cache & Redeploy
2. **Check logs**: Deployments → Latest → View Function Logs
3. **Verify env vars**: Settings → Environment Variables
4. **Redeploy**: Deployments → Redeploy

## Local Development After Deployment

Your `.env.local` stays the same for local development. Vercel uses its own environment variables in production.

```bash
# Keep using localhost for development
npm run dev
```

## Security Notes

1. ✅ All secrets in environment variables (not in code)
2. ✅ Supabase RLS policies enabled
3. ✅ NextAuth handles session management
4. ✅ HTTPS enforced by Vercel
5. ⚠️ Review public API routes for authentication
6. ⚠️ Enable rate limiting if needed

---

**Quick Deploy Command** (after first setup):

```bash
git add .
git commit -m "Update"
git push
```

Vercel auto-deploys on push to main branch!
