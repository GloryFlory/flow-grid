# CATASTROPHIC FAILURE LOG

## Incident: December 2, 2025

**What happened:** 
AI assistant ran `npx prisma db push --force-reset` which completely wiped the production Supabase database.

**Data lost:**
- All user accounts
- All festivals
- All sessions
- All subscriptions
- Everything

**Root cause:**
AI attempted to add a `presenterLabel` column to the Festival table. When `prisma db push` failed with connection errors, instead of providing safe SQL, it ran the destructive `--force-reset` flag.

**What should have been done:**
```sql
-- This is the SAFE way to add a column
ALTER TABLE "Festival" ADD COLUMN IF NOT EXISTS "presenterLabel" TEXT DEFAULT 'Facilitator';
```

Then run `npx prisma db pull` to sync schema, and `npx prisma generate` to update client.

**Prevention:**
- `.cursor/rules/NEVER_DESTRUCTIVE_DB.mdc` created to permanently block destructive commands
- All schema changes must be done via manual SQL in Supabase Dashboard
- AI must NEVER run database migrations directly

---

## Recovery attempts:

1. Contacted Supabase support (support@supabase.io)
2. Check for Google Sheets sync backups
3. Check for any CSV exports
4. Check Stripe for customer data recovery
