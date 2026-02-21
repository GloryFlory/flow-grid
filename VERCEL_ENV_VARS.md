# 🚀 Vercel Deployment - Environment Variables Checklist# 🚀 Vercel Deployment - Environment Variables Checklist



## Copy-Paste These Into Vercel Environment Variables## Copy-Paste These Into Vercel Environment Variables



When deploying to Vercel, add these environment variables in:When deploying to Vercel, add these environment variables in:

**Vercel Dashboard → Your Project → Settings → Environment Variables****Vercel Dashboard → Your Project → Settings → Environment Variables**



------



## ✅ CRITICAL - Required for Production## ✅ CRITICAL - Required for Production



```bash```bash

# NextAuth# NextAuth

NEXTAUTH_URL=https://tryflowgrid.comNEXTAUTH_URL=https://tryflowgrid.com

NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>



# Database# Database

DATABASE_URL=<your-supabase-pooler-connection-string>DATABASE_URL=<your-supabase-pooler-connection-string>

DIRECT_URL=<your-supabase-direct-connection-string>DIRECT_URL=<your-supabase-direct-connection-string>



# Email (Resend)# Email (Resend)

RESEND_API_KEY=<your-resend-api-key>RESEND_API_KEY=<your-resend-api-key>

EMAIL_FROM=Flow Grid <noreply@tryflowgrid.com>EMAIL_FROM=Flow Grid <noreply@tryflowgrid.com>

FROM_EMAIL=Flow Grid <noreply@tryflowgrid.com>FROM_EMAIL=Flow Grid <noreply@tryflowgrid.com>

NEXTAUTH_EMAIL_FROM=Flow Grid <noreply@tryflowgrid.com>NEXTAUTH_EMAIL_FROM=Flow Grid <noreply@tryflowgrid.com>



# Redis (Upstash) - For passkeys & rate limits# Redis (Upstash) - For passkeys & rate limits

# Get these from: https://console.upstash.com/# Get these from: https://console.upstash.com/

UPSTASH_REDIS_REST_URL=<your-upstash-redis-url>UPSTASH_REDIS_REST_URL=<your-upstash-redis-url>

UPSTASH_REDIS_REST_TOKEN=<your-upstash-redis-token>UPSTASH_REDIS_REST_TOKEN=<your-upstash-redis-token>



# WebAuthn (Passkeys)# WebAuthn (Passkeys)

WEBAUTHN_RP_ID=tryflowgrid.comWEBAUTHN_RP_ID=tryflowgrid.com

WEBAUTHN_RP_NAME=Flow GridWEBAUTHN_RP_NAME=Flow Grid



# Supabase Storage# Supabase Storage

SUPABASE_URL=<your-supabase-project-url>SUPABASE_URL=<your-supabase-project-url>

SUPABASE_ANON_KEY=<your-supabase-anon-key>SUPABASE_ANON_KEY=<your-supabase-anon-key>

SUPABASE_SERVICE_KEY=<your-supabase-service-role-key>SUPABASE_SERVICE_KEY=<your-supabase-service-role-key>



# Application URLs (public)# Application URLs (public)

NEXT_PUBLIC_APP_URL=https://tryflowgrid.comNEXT_PUBLIC_APP_URL=https://tryflowgrid.com

NEXT_PUBLIC_MARKETING_URL=https://tryflowgrid.comNEXT_PUBLIC_MARKETING_URL=https://tryflowgrid.com

NEXT_PUBLIC_APP_NAME=Flow GridNEXT_PUBLIC_APP_NAME=Flow Grid



# Feature Flags# Feature Flags

NEXT_PUBLIC_ENABLE_ANALYTICS=trueNEXT_PUBLIC_ENABLE_ANALYTICS=true

NEXT_PUBLIC_ENABLE_CUSTOM_DOMAINS=falseNEXT_PUBLIC_ENABLE_CUSTOM_DOMAINS=false

``````



------



## 🔄 Cron Jobs## 🔄 Cron Jobs



```bash```bash

# Secret for authenticating Vercel Cron Jobs# Secret for authenticating Vercel Cron Jobs

# Generate with: openssl rand -base64 32# Generate with: openssl rand -base64 32

CRON_SECRET=<your-random-secret-here>CRON_SECRET=your_random_secret_here

``````



Used by:Used by:

- `/api/cron/waitlist-expiry` - Runs every 5 minutes to handle expired waitlist offers- `/api/cron/waitlist-expiry` - Runs every 5 minutes to handle expired waitlist offers



------



## ⚙️ Optional - Add Later## ⚙️ Optional - Add Later



```bash```bash

# Google OAuth (when ready to configure)# Google OAuth (when ready to configure)

GOOGLE_CLIENT_ID=<your-google-oauth-client-id>GOOGLE_CLIENT_ID=<your-google-oauth-client-id>

GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>



# Stripe (not using yet)# Stripe (not using yet)

STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>

STRIPE_SECRET_KEY=<your-stripe-secret-key>STRIPE_SECRET_KEY=<your-stripe-secret-key>

STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

``````



------



## 📝 Important Notes## 📝 Important Notes



1. **Environment Scope**: Set all variables for "Production", "Preview", and "Development"1. **Environment Scope**: Set all variables for "Production", "Preview", and "Development"

2. **NEXTAUTH_URL**: Will be `https://your-app.vercel.app` initially, update to `https://tryflowgrid.com` after domain is connected2. **NEXTAUTH_URL**: Will be `https://your-app.vercel.app` initially, update to `https://tryflowgrid.com` after domain is connected

3. **WEBAUTHN_RP_ID**: MUST match your production domain exactly (no https://, no www)3. **WEBAUTHN_RP_ID**: MUST match your production domain exactly (no https://, no www)

4. **Sensitive Values**: Never commit these to git! They're only in Vercel dashboard4. **Sensitive Values**: Never commit these to git! They're only in Vercel dashboard



------



## 🔄 After Adding Variables## 🔄 After Adding Variables



1. Go to **Deployments** tab1. Go to **Deployments** tab

2. Click "..." on latest deployment2. Click "..." on latest deployment

3. Click "Redeploy"3. Click "Redeploy"

4. Wait for build to complete4. Wait for build to complete



------



## ✅ Post-Deployment Checklist## ✅ Post-Deployment Checklist



- [ ] Visit your Vercel URL- [ ] Visit your Vercel URL

- [ ] Test sign in with magic link- [ ] Test sign in with magic link

- [ ] Test passkey registration- [ ] Test passkey registration

- [ ] Create a test festival- [ ] Create a test festival

- [ ] Check public schedule view- [ ] Check public schedule view

- [ ] Verify emails are being sent- [ ] Verify emails are being sent



If anything fails, check Vercel logs:If anything fails, check Vercel logs:

**Vercel Dashboard → Your Project → Deployments → [Latest] → Function Logs****Vercel Dashboard → Your Project → Deployments → [Latest] → Function Logs**

