# 🚀 Deploy to Production - Quick Guide

## ✅ Pre-Flight Check

- [x] Strong NEXTAUTH_SECRET generated
- [x] Production URLs configured
- [x] WebAuthn RP_ID set to `tryflowgrid.com`
- [x] Server actions origins updated
- [x] Email DNS verified (ImprovMX)
- [x] Redis fallback code updated
- [x] Duplicate config files removed
- [x] Test files cleaned up

**Status**: Ready to deploy! 🎉

---

## 📦 Step 1: Push to GitHub

```bash
git add .
git commit -m "Production ready - configured for tryflowgrid.com"
git push origin main
```

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to **https://vercel.com/new**
2. Click "Import Git Repository"
3. Select your GitHub repository
4. **STOP - Don't deploy yet!**

### Option B: Via CLI

```bash
npm install -g vercel
vercel
```

---

## ⚙️ Step 3: Add Environment Variables

**Before deploying**, add all variables from `VERCEL_ENV_VARS.md`:

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Copy-paste each variable from `VERCEL_ENV_VARS.md`
3. Set environment to: **Production**, **Preview**, and **Development**

**Quick copy-paste ready in**: `VERCEL_ENV_VARS.md`

---

## 🚀 Step 4: Deploy!

Click "Deploy" and wait ~2-3 minutes.

You'll get a URL like: `https://flow-grid-abc123.vercel.app`

---

## 🔗 Step 5: Connect Custom Domain

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `tryflowgrid.com`
3. Add domain: `www.tryflowgrid.com`

### DNS Configuration

Add these records in your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**SSL Certificate**: Automatic (takes ~1 minute)

---

## 🔄 Step 6: Update Environment Variables

After domain is connected:

1. Vercel → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to `https://tryflowgrid.com`
3. Go to Deployments → Latest → "..." → **Redeploy**

---

## ✅ Step 7: Test Everything

Visit `https://tryflowgrid.com` and test:

- [ ] Homepage loads
- [ ] Sign up with email (magic link)
- [ ] Check your email inbox (magic link should arrive)
- [ ] Sign in
- [ ] Create a festival
- [ ] Upload CSV
- [ ] View public schedule (/{festival-slug})
- [ ] Add passkey in settings
- [ ] Sign out and sign in with passkey

---

## 🐛 Troubleshooting

### Build fails

Check Vercel build logs. Common issues:
- Missing environment variables
- Database connection issues

### Magic links not working

1. Check Resend dashboard (resend.com/emails)
2. Verify DNS records are correct
3. Check `NEXTAUTH_URL` matches your domain exactly

### Passkeys not working

1. Verify `WEBAUTHN_RP_ID=tryflowgrid.com` (no https://, no www)
2. Must use HTTPS (works automatically on Vercel)
3. Check browser console for errors

### Database errors

1. Verify `DATABASE_URL` is correct in Vercel
2. Check Supabase connection limits
3. Run `npx prisma migrate deploy` if needed

---

## 📊 Monitor Your App

### Vercel Dashboard
- **Function Logs**: Real-time API errors
- **Analytics**: Page views, performance
- **Speed Insights**: Core Web Vitals

### Recommended Tools
- **Uptime**: UptimeRobot (free)
- **Errors**: Sentry (free tier)
- **Analytics**: Plausible or Fathom (privacy-focused)

---

## 🎯 What's Next?

After successful deployment:

1. **Soft Launch**
   - Share with 5-10 beta users
   - Collect feedback
   - Fix any bugs

2. **Monitor for 24-48 hours**
   - Watch Vercel function logs
   - Check email delivery
   - Monitor database performance

3. **Public Launch**
   - Announce on social media
   - Post to Product Hunt (optional)
   - Share in relevant communities

---

## 📞 Need Help?

- **Vercel Issues**: Check function logs in dashboard
- **Database Issues**: Check Supabase dashboard
- **Email Issues**: Check Resend dashboard
- **Domain Issues**: Check DNS propagation (whatsmydns.net)

---

**Your app is production ready!** 🚀

When you're ready to deploy, just push to GitHub and Vercel will auto-deploy from main branch.
