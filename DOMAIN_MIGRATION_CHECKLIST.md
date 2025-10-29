# Domain Migration Checklist: flowgrid.com → tryflowgrid.com

## ✅ Code Changes (COMPLETED)
- [x] Updated all domain references in codebase
- [x] Changed email addresses to @tryflowgrid.com
- [x] Fixed homepage routing (removed /marketing redirect)
- [x] Updated subdomain logic
- [x] Updated dashboard URL displays

## 🔧 External Configuration Updates (TODO)

### 1. Vercel Environment Variables
**Vercel Dashboard → Settings → Environment Variables:**

Update these variables:
- [ ] `NEXTAUTH_URL` → `https://tryflowgrid.com`
- [ ] `NEXT_PUBLIC_APP_URL` → `https://tryflowgrid.com` 
- [ ] `NEXT_PUBLIC_MARKETING_URL` → `https://tryflowgrid.com`

### 2. Google OAuth Configuration
**Google Cloud Console → APIs & Services → Credentials:**

**Authorized JavaScript Origins:**
- [ ] Remove: `https://flowgrid.com`
- [ ] Remove: `https://www.flowgrid.com` 
- [ ] Remove: `https://*.flowgrid.com`
- [ ] Add: `https://tryflowgrid.com`
- [ ] Add: `https://www.tryflowgrid.com`
- [ ] Add: `https://*.tryflowgrid.com`

**Authorized Redirect URIs:**
- [ ] Remove: `https://flowgrid.com/api/auth/callback/google`
- [ ] Remove: `https://www.flowgrid.com/api/auth/callback/google`
- [ ] Add: `https://tryflowgrid.com/api/auth/callback/google`
- [ ] Add: `https://www.tryflowgrid.com/api/auth/callback/google`

### 3. Vercel Domains
**Vercel Dashboard → Domains:**
- [ ] Add `tryflowgrid.com`
- [ ] Add `www.tryflowgrid.com`  
- [ ] Add `*.tryflowgrid.com` (wildcard for festival subdomains)
- [ ] Remove old flowgrid.com domains (after testing)

### 4. DNS Configuration
**DNS Provider (where you bought tryflowgrid.com):**
- [ ] Set A record for `@` (root) pointing to Vercel's IP
- [ ] Set CNAME for `www` pointing to `tryflowgrid.com`
- [ ] Set CNAME for `*` (wildcard) pointing to Vercel deployment URL
- [ ] Verify DNS propagation

### 5. SSL/TLS Certificates
**Automatic via Vercel:**
- [ ] Verify SSL certificates are issued for new domains
- [ ] Test HTTPS redirect is working

### 6. Additional Services (if applicable)
- [ ] Update Stripe webhook URLs (if using)
- [ ] Update email service configurations  
- [ ] Update analytics tracking (Google Analytics, etc.)
- [ ] Update social media links and bios
- [ ] Update any marketing materials

## 🧪 Testing Checklist
- [ ] Test homepage loads at tryflowgrid.com
- [ ] Test Google OAuth login works
- [ ] Test festival subdomains work (*.tryflowgrid.com)
- [ ] Test all footer links and support pages
- [ ] Test email functionality
- [ ] Test dashboard functionality
- [ ] Verify SEO meta tags are correct

## 📈 Post-Migration
- [ ] Set up 301 redirects from old domain (if needed)
- [ ] Monitor for any broken links
- [ ] Update documentation and help articles
- [ ] Notify users of domain change (if applicable)

---

**Current Status:** Code changes complete ✅
**Next Steps:** Configure external services (Vercel, Google OAuth, DNS)