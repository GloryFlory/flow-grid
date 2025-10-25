# 🚀 Quick Deployment Checklist

## Before You Deploy

- [x] Code is working locally
- [x] Environment variables in `.env.local`
- [ ] Code pushed to GitHub
- [ ] sessions.json file is committed

## Deploy to Vercel

1. **Go to vercel.com** and sign in with GitHub
2. **Import repository**: flow-grid
3. **Don't deploy yet** - configure first!

## Configure Environment Variables in Vercel

Copy these from your `.env.local`:

### Essential (for app to work):
```
DATABASE_URL=postgresql://postgres.rfpoqcliiduvotlfzopv:VBkiMiI0BUg3I5oP@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.rfpoqcliiduvotlfzopv:VBkiMiI0BUg3I5oP@aws-1-eu-north-1.pooler.supabase.com:5432/postgres

NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

SUPABASE_URL=https://rfpoqcliiduvotlfzopv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcG9xY2xpaWR1dm90bGZ6b3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTM3MDcsImV4cCI6MjA3NjE2OTcwN30.3TTof6rKWWDJ-Fzcs2wSLfTxxQnHPPWSFn-IJbYO8l4
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcG9xY2xpaWR1dm90bGZ6b3B2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU5MzcwNywiZXhwIjoyMDc2MTY5NzA3fQ.CRcm57HxSot6id8LZpWX-aKREAUJSVOw8tZGQd-1yds

NEXT_PUBLIC_APP_NAME=Flow Grid
```

### Update after first deployment:
```
NEXTAUTH_URL=https://your-app.vercel.app  (get this after deploy)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### For Google OAuth (add later):
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Deploy!

Click "Deploy" and wait ~2-3 minutes

## After First Deployment

1. **Get your Vercel URL** (e.g., `flow-grid-xyz.vercel.app`)

2. **Update environment variables**:
   - `NEXTAUTH_URL=https://flow-grid-xyz.vercel.app`
   - `NEXT_PUBLIC_APP_URL=https://flow-grid-xyz.vercel.app`
   
3. **Redeploy**:
   - Vercel Dashboard → Deployments → Latest → "..." → Redeploy

## Set Up Google OAuth

1. **Google Cloud Console**:
   - Authorized origins: `https://flow-grid-xyz.vercel.app`
   - Redirect URI: `https://flow-grid-xyz.vercel.app/api/auth/callback/google`

2. **Add to Vercel env vars**:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

3. **Redeploy again**

## Test Your Deployment

- [ ] Visit your Vercel URL
- [ ] Try signing in (email/password)
- [ ] Try signing in with Google
- [ ] Check public schedule works
- [ ] Check admin dashboard works

## If Something Goes Wrong

### Build fails with "Prisma" error:
✅ Already fixed! The `postinstall` script will handle it.

### Can't connect to database:
- Check DATABASE_URL is correct in Vercel env vars
- Make sure you're using the pooling URL (with `?pgbouncer=true`)

### NextAuth error:
- Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- Make sure NEXTAUTH_URL matches your Vercel domain

### Google OAuth not working:
- Verify redirect URI is EXACTLY: `https://your-url.vercel.app/api/auth/callback/google`
- No trailing slashes!
- Must match what's in Google Console

## Quick Commands

### Generate NextAuth secret:
```bash
openssl rand -base64 32
```

### Push code to trigger redeploy:
```bash
git add .
git commit -m "Update"
git push
```

Vercel will auto-deploy on every push to main!

---

**Need help?** Check `VERCEL_DEPLOYMENT.md` for detailed instructions.

**What's your Vercel URL?** Share it and I can help verify Google OAuth setup!
