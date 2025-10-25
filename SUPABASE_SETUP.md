# Supabase Setup Guide for Flow Grid

## Step 1: Get Your Supabase Credentials

From your Supabase dashboard, you'll need:

### Database Connection
1. Go to **Settings** > **Database**
2. Find **Connection parameters**:
   - Host: `db.[YOUR-PROJECT-REF].supabase.co`
   - Database name: `postgres`
   - Port: `5432`
   - User: `postgres`
   - Password: [The password you set when creating the project]

### API Keys
1. Go to **Settings** > **API**
2. Copy these values:
   - Project URL: `https://[YOUR-PROJECT-REF].supabase.co`
   - `anon` public key
   - `service_role` secret key (for admin operations)

## Step 2: Update .env.local

Replace the placeholders in your `.env.local` file:

```bash
# Database URLs (replace [YOUR-PASSWORD] and [YOUR-PROJECT-REF])
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase API (replace [YOUR-PROJECT-REF] and keys)
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_KEY="[YOUR-SERVICE-KEY]"
```

## Step 3: Test Connection

Once you've updated `.env.local`, run:

```bash
npm run db:push
```

This will create all the tables in your Supabase database.

## Step 4: Verify in Supabase

Go to your Supabase dashboard > **Table Editor** and you should see:
- users
- accounts  
- sessions
- festivals
- festival_sessions
- bookings
- subscriptions
- analytics
- verification_tokens

---

**Next Steps:**
1. Update your `.env.local` with the correct values
2. Run `npm run db:push` to create tables
3. Run `npm run dev` to start the development server
4. We'll build the marketing site and onboarding flow!