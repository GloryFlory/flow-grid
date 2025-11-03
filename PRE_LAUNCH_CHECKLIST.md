# 🚀 Flow Grid Pre-Launch Checklist

**Target**: Production deployment at `tryflowgrid.com`  
**Status**: Review required before public launch

---

## 🔴 CRITICAL - Must Fix Before Launch

### 1. Security & Environment Variables

- [ ] **Remove hardcoded Redis credentials from code**
  - Files affected: `src/lib/redis.ts`, `src/lib/rate-limit.ts`
  - Current issue: Credentials hardcoded due to env loading bug
  - **Action**: Fix environment variable loading, then remove hardcoded values
  - **Risk**: Redis credentials exposed in source code → potential abuse

- [ ] **Generate strong production secrets**
  - [ ] `NEXTAUTH_SECRET`: Run `openssl rand -base64 32`
  - Current value: `"your-super-secret-jwt-key-for-development"` ❌
  - **Risk**: Weak secret = session hijacking possible

- [ ] **Update production URLs**
  - [ ] `NEXTAUTH_URL="https://tryflowgrid.com"`
  - [ ] `NEXT_PUBLIC_APP_URL="https://tryflowgrid.com"`
  - [ ] `NEXT_PUBLIC_MARKETING_URL="https://tryflowgrid.com"`
  - Current: All set to `localhost:3000` ❌

- [ ] **Update WebAuthn (Passkeys) configuration**
  - [ ] `WEBAUTHN_RP_ID="tryflowgrid.com"` (apex domain, no www)
  - Current: `"localhost"` ❌
  - **Risk**: Passkeys won't work in production

- [ ] **Configure server actions allowed origins**
  - File: `next.config.js`
  - Current: `'*.flowgrid.com'` but domain is `tryflowgrid.com`
  - **Action**: Change to `['tryflowgrid.com', '*.tryflowgrid.com']`

### 2. Payment & Stripe Configuration

- [ ] **Set up Stripe account** (if monetizing)
  - [ ] Create production Stripe account
  - [ ] Set `STRIPE_PUBLISHABLE_KEY` (pk_live_...)
  - [ ] Set `STRIPE_SECRET_KEY` (sk_live_...)
  - [ ] Configure webhook endpoint: `https://tryflowgrid.com/api/webhooks/stripe`
  - [ ] Set `STRIPE_WEBHOOK_SECRET` from Stripe dashboard
  - Current: All empty ❌

- [ ] **Create Stripe products** (if using subscription model)
  - [ ] Free tier (if applicable)
  - [ ] Pro tier
  - [ ] Enterprise tier

### 3. Email Configuration

- [ ] **Verify Resend domain**
  - Current: Using `tryflowgrid.com` in FROM addresses
  - **Action**: Add DNS records in domain registrar:
    - SPF record
    - DKIM record  
    - DMARC record (optional but recommended)
  - [ ] Verify domain in Resend dashboard
  - **Risk**: Emails will fail without domain verification

- [ ] **Test email sending in production**
  - [ ] Magic link sign-in
  - [ ] Password reset
  - [ ] Welcome email (if applicable)

### 4. Database & Data

- [ ] **Review Supabase production setup**
  - Current: Using development database
  - [ ] Consider separate production database
  - [ ] Set up automated backups
  - [ ] Configure row-level security (RLS) if needed

- [ ] **Run database migrations**
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **Review Prisma schema**
  - [ ] Ensure all indexes are optimal
  - [ ] Check cascade delete rules are correct
  - [ ] Verify BigInt fields work correctly (e.g., `counter` in WebAuthnCredential)

### 5. Authentication & OAuth

- [ ] **Configure Google OAuth for production**
  - Current: Has client ID but no secret
  - [ ] Google Cloud Console → Add authorized origins:
    - `https://tryflowgrid.com`
    - `https://www.tryflowgrid.com` (if using www)
  - [ ] Add redirect URIs:
    - `https://tryflowgrid.com/api/auth/callback/google`
  - [ ] Set `GOOGLE_CLIENT_SECRET` in production env

- [ ] **Test all authentication flows**
  - [ ] Email magic link
  - [ ] Password sign-in
  - [ ] Password reset
  - [ ] Google OAuth
  - [ ] Passkey registration
  - [ ] Passkey sign-in

---

## 🟡 HIGH PRIORITY - Recommended Before Launch

### 6. Code Quality & Technical Debt

- [ ] **Fix environment variable loading issue**
  - Current workaround: Hardcoded Redis credentials
  - Root cause: `process.env` reads "PASTE_YOUR_URL_HERE" instead of actual values
  - **Action**: Investigate Next.js 15.5.4 env loading, may need to upgrade/downgrade

- [ ] **Remove development files from production**
  - [ ] Delete or gitignore: `email-backup.ts`, `test-*.js`, `*.sql` files
  - [ ] Clean up TODO comments in code
  - [ ] Remove debug console.log statements (especially in auth flows)

- [ ] **Update Next.js config**
  - File: `next.config.js`
  - [ ] Remove duplicate `next.config.mjs` (you have both .js and .mjs)
  - [ ] Update Content-Security-Policy header (remove YOUR-SQUARESPACE-DOMAIN placeholder)
  - [ ] Update serverActions.allowedOrigins to match production domain

### 7. Performance & Optimization

- [ ] **Enable production optimizations**
  - [ ] Verify `swcMinify: true` is enabled ✅ (already set)
  - [ ] Check bundle size: `npm run build`
  - [ ] Review for unused dependencies

- [ ] **Configure CDN/Caching**
  - [ ] Set up Vercel Edge Network (automatic)
  - [ ] Review `public/` folder for static assets
  - [ ] Consider CDN for user-uploaded images (Supabase storage or Cloudflare)

- [ ] **Database connection pooling**
  - Current: Using pgBouncer ✅
  - [ ] Monitor connection limits in production
  - [ ] Consider upgrading Supabase plan if needed

### 8. Monitoring & Error Tracking

- [ ] **Set up error tracking**
  - Options: Sentry, LogRocket, or Vercel Analytics
  - [ ] Track JavaScript errors
  - [ ] Track API errors
  - [ ] Monitor Prisma query performance

- [ ] **Set up uptime monitoring**
  - Options: UptimeRobot, Pingdom, Better Uptime
  - [ ] Monitor main domain
  - [ ] Monitor API endpoints
  - [ ] Set up alerts (email/SMS)

- [ ] **Analytics**
  - Current: `NEXT_PUBLIC_ENABLE_ANALYTICS="true"`
  - [ ] Verify analytics implementation in code
  - [ ] Set up Google Analytics / Plausible / Fathom
  - [ ] Track key user flows (signup, festival creation, etc.)

### 9. Legal & Compliance

- [ ] **Review Terms of Service**
  - File: `src/app/terms/page.tsx`
  - [ ] Update contact information
  - [ ] Review liability clauses
  - [ ] Consult with lawyer if handling sensitive data

- [ ] **Review Privacy Policy**
  - File: `src/app/privacy/page.tsx`
  - [ ] Ensure GDPR compliance (if serving EU users)
  - [ ] Document data retention policies
  - [ ] Add cookie consent if needed
  - [ ] Review consent implementation in `src/lib/consent.ts`

- [ ] **Cookie Consent**
  - Current: TODO in `src/lib/consent.ts`
  - [ ] Implement proper consent banner
  - [ ] Track user preferences
  - [ ] Disable analytics if consent not given

### 10. Rate Limiting & Security

- [ ] **Review rate limits**
  - Current implementation: Upstash Redis
  - [ ] Test rate limits work correctly
  - [ ] Adjust limits based on expected traffic
  - [ ] Monitor for abuse

- [ ] **Security headers**
  - [ ] Review CSP (Content Security Policy)
  - [ ] Add Strict-Transport-Security (HSTS)
  - [ ] Review X-Frame-Options ✅ (already DENY)
  - [ ] Consider adding Permissions-Policy

- [ ] **API security**
  - [ ] All API routes check authentication
  - [ ] All mutations verify user owns resource
  - [ ] File uploads have size limits
  - [ ] Image uploads validate file types

---

## 🟢 NICE TO HAVE - Post-Launch Improvements

### 11. User Experience

- [ ] **Create onboarding flow**
  - [ ] Welcome email with getting started guide
  - [ ] First-time user tutorial
  - [ ] Sample festival template

- [ ] **Error handling improvements**
  - [ ] User-friendly error messages
  - [ ] Helpful troubleshooting guides
  - [ ] Contact support option

- [ ] **Loading states**
  - [ ] Skeleton screens for data loading
  - [ ] Progress indicators for uploads
  - [ ] Optimistic UI updates

### 12. Documentation

- [ ] **User documentation**
  - [ ] Getting started guide
  - [ ] Festival creation tutorial
  - [ ] CSV upload format reference
  - [ ] Custom domain setup (if enabling)

- [ ] **API documentation**
  - [ ] Public API endpoints (if offering API access)
  - [ ] Webhook documentation
  - [ ] Rate limit information

### 13. Feature Flags & Rollout

- [ ] **Custom domains**
  - Current: `NEXT_PUBLIC_ENABLE_CUSTOM_DOMAINS="false"`
  - [ ] Complete custom domain implementation
  - [ ] Set up SSL certificate automation
  - [ ] Enable feature flag when ready

- [ ] **Gradual rollout**
  - [ ] Soft launch with limited users
  - [ ] Collect feedback
  - [ ] Fix bugs before full public launch
  - [ ] Announce publicly

### 14. Marketing & SEO

- [ ] **SEO optimization**
  - [ ] Add meta descriptions
  - [ ] Set up sitemap.xml
  - [ ] Configure robots.txt
  - [ ] Add OpenGraph images
  - [ ] Schema.org markup for events

- [ ] **Marketing site**
  - [ ] Landing page
  - [ ] Features page
  - [ ] Pricing page (if monetizing)
  - [ ] Contact/support page

---

## 📋 Pre-Deployment Checklist

### Before Deploying to Production

1. [ ] All CRITICAL items above are completed
2. [ ] Code is pushed to GitHub main branch
3. [ ] Environment variables prepared in `.env.production` file
4. [ ] Database migrations tested
5. [ ] All tests pass (if you have tests)
6. [ ] Reviewed git history for accidentally committed secrets

### Deployment Steps

1. **Deploy to Vercel**
   ```bash
   # Option 1: Deploy via Vercel dashboard
   # - Import GitHub repo
   # - Add environment variables
   # - Deploy
   
   # Option 2: Deploy via CLI
   npm install -g vercel
   vercel --prod
   ```

2. **Post-deployment verification**
   - [ ] Visit production URL
   - [ ] Test authentication flows
   - [ ] Create test festival
   - [ ] Upload test CSV
   - [ ] Test public schedule view
   - [ ] Verify emails are sending
   - [ ] Test passkey registration

3. **Set up domain**
   - [ ] Configure DNS records at registrar
   - [ ] Point `tryflowgrid.com` to Vercel
   - [ ] Configure `www.tryflowgrid.com` redirect
   - [ ] Wait for SSL certificate (automatic via Vercel)

4. **Update configurations**
   - [ ] Update NEXTAUTH_URL in Vercel env vars
   - [ ] Update WebAuthn RP_ID
   - [ ] Redeploy to apply changes

---

## 🔍 Known Issues to Fix

### Immediate Fixes Required

1. **Redis credentials hardcoded**
   - Location: `src/lib/redis.ts` line 24, `src/lib/rate-limit.ts` line 45
   - Issue: "WORKAROUND: Hardcoded values due to environment variable loading issue"
   - Fix: Debug why process.env not reading .env.local correctly

2. **Weak NextAuth secret**
   - Location: `.env.local`
   - Current: `"your-super-secret-jwt-key-for-development"`
   - Fix: Generate with `openssl rand -base64 32`

3. **Incomplete consent implementation**
   - Location: `src/lib/consent.ts` line 24
   - Issue: "TODO: Implement proper consent check"
   - Fix: Implement GDPR-compliant cookie consent banner

4. **Missing Stripe configuration**
   - All Stripe env vars are empty
   - Decision needed: Are you monetizing at launch?

5. **Duplicate Next.js config files**
   - Both `next.config.js` and `next.config.mjs` exist
   - Fix: Delete one (keep .js, it's being used)

### Non-Blocking Issues

- Session booking system not implemented (`currentBookings: 0` TODO)
- Level filtering in SessionCard (TODO comment)
- Error toasts in sessions page (TODO comments)

---

## 🎯 Launch Readiness Score

**Current Status**: ~40% ready for production

### Blocking Issues: 5
1. Hardcoded Redis credentials
2. Weak NEXTAUTH_SECRET
3. Wrong domain URLs (localhost)
4. Wrong WEBAUTHN_RP_ID
5. Email domain not verified

### High Priority: 8
1. Environment variable loading bug
2. Missing Stripe config (if monetizing)
3. Google OAuth secret missing
4. Consent implementation incomplete
5. Error tracking not set up
6. Rate limiting not tested
7. Security headers incomplete
8. Duplicate config files

### Recommended Timeline

- **Week 1**: Fix all CRITICAL issues
- **Week 2**: Complete HIGH PRIORITY items
- **Week 3**: Soft launch with beta users
- **Week 4**: Public launch

---

## 📞 Support & Help

**Questions about this checklist?** Review these docs:
- `DEPLOY_CHECKLIST.md` - Vercel deployment steps
- `VERCEL_DEPLOYMENT.md` - Detailed deployment guide
- `DOMAIN_MIGRATION_CHECKLIST.md` - Domain setup

**Need help with specific items?** Let me know which section you'd like to tackle first!
