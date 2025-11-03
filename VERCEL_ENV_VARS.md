# 🚀 Vercel Deployment - Environment Variables Checklist

## Copy-Paste These Into Vercel Environment Variables

When deploying to Vercel, add these environment variables in:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

---

## ✅ CRITICAL - Required for Production

```bash
# NextAuth
NEXTAUTH_URL=https://tryflowgrid.com
NEXTAUTH_SECRET=9Hchsf3IUHcDSuU8FqCeHq/5D3h//u3n9qgix4Rj+Y4=

# Database
DATABASE_URL=postgresql://postgres.rfpoqcliiduvotlfzopv:VBkiMiI0BUg3I5oP@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.rfpoqcliiduvotlfzopv:VBkiMiI0BUg3I5oP@aws-1-eu-north-1.pooler.supabase.com:5432/postgres

# Email (Resend)
RESEND_API_KEY=re_6geNnwvZ_LU51HgBY7BMX16hG4hHxUabd
EMAIL_FROM=Flow Grid <noreply@tryflowgrid.com>
FROM_EMAIL=Flow Grid <noreply@tryflowgrid.com>
NEXTAUTH_EMAIL_FROM=Flow Grid <noreply@tryflowgrid.com>

# Redis (Upstash) - For passkeys & rate limits
UPSTASH_REDIS_REST_URL=https://still-haddock-22951.upstash.io
UPSTASH_REDIS_REST_TOKEN=AVmnAAIncDI0ZjVkNTYyYWUzZWU0NzkwYjc1MGIxMmY2YmJjN2E3OHAyMjI5NTE

# WebAuthn (Passkeys)
WEBAUTHN_RP_ID=tryflowgrid.com
WEBAUTHN_RP_NAME=Flow Grid

# Supabase Storage
SUPABASE_URL=https://rfpoqcliiduvotlfzopv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcG9xY2xpaWR1dm90bGZ6b3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTM3MDcsImV4cCI6MjA3NjE2OTcwN30.3TTof6rKWWDJ-Fzcs2wSLfTxxQnHPPWSFn-IJbYO8l4
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcG9xY2xpaWR1dm90bGZ6b3B2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU5MzcwNywiZXhwIjoyMDc2MTY5NzA3fQ.CRcm57HxSot6id8LZpWX-aKREAUJSVOw8tZGQd-1yds

# Application URLs (public)
NEXT_PUBLIC_APP_URL=https://tryflowgrid.com
NEXT_PUBLIC_MARKETING_URL=https://tryflowgrid.com
NEXT_PUBLIC_APP_NAME=Flow Grid

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CUSTOM_DOMAINS=false
```

---

## ⚙️ Optional - Add Later

```bash
# Google OAuth (when ready to configure)
GOOGLE_CLIENT_ID=936407110657-0kjr0fugbobangfl0vl73slo099pdell.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=

# Stripe (not using yet)
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## 📝 Important Notes

1. **Environment Scope**: Set all variables for "Production", "Preview", and "Development"
2. **NEXTAUTH_URL**: Will be `https://your-app.vercel.app` initially, update to `https://tryflowgrid.com` after domain is connected
3. **WEBAUTHN_RP_ID**: MUST match your production domain exactly (no https://, no www)
4. **Sensitive Values**: Never commit these to git! They're only in Vercel dashboard

---

## 🔄 After Adding Variables

1. Go to **Deployments** tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for build to complete

---

## ✅ Post-Deployment Checklist

- [ ] Visit your Vercel URL
- [ ] Test sign in with magic link
- [ ] Test passkey registration
- [ ] Create a test festival
- [ ] Check public schedule view
- [ ] Verify emails are being sent

If anything fails, check Vercel logs:
**Vercel Dashboard → Your Project → Deployments → [Latest] → Function Logs**
