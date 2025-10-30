# Google Authentication Issue Investigation

## Problem Description
When logging in with `florian.hohenleitner@gmail.com` via Google OAuth, the system logs into an account associated with `mediterraneanacroconvention@gmail.com`.

## Possible Causes

### 1. Account Linking in Database
NextAuth automatically links accounts with the same email address. If there's already a user with one email, and Google returns a different email but they get linked, this could cause confusion.

### 2. Google Account Configuration
- Check if both emails are associated with the same Google account
- Verify Google OAuth app configuration in Google Cloud Console
- Check if there are multiple accounts in the same Google profile

### 3. Database State
- There might be existing user records that are causing conflicts
- Check the `User` and `Account` tables in the database

## Investigation Steps

### Step 1: Check Database Users
```sql
SELECT id, email, name, provider FROM User WHERE email LIKE '%mediterranean%' OR email LIKE '%florian%';
SELECT * FROM Account WHERE provider = 'google';
```

### Step 2: Check Google OAuth Settings
- Verify authorized domains in Google Cloud Console
- Check OAuth consent screen settings
- Verify client ID and secret are correct

### Step 3: Clear Browser Data
- Clear cookies and localStorage for the domain
- Try logging in from incognito mode
- Check if the issue persists

### Step 4: Check NextAuth Debug Logs
The auth configuration already has extensive logging. Check the server console when logging in to see what's happening in the callbacks.

## Recommended Actions

1. **Immediate**: Clear all auth-related cookies and try again
2. **Investigation**: Check the database for duplicate or linked accounts
3. **Debug**: Enable more detailed NextAuth debugging
4. **Google Console**: Verify OAuth app configuration

## Files to Check
- `/src/lib/auth.ts` - NextAuth configuration
- `/src/app/api/debug/seed/route.ts` - Database seeding
- Database tables: User, Account, Session