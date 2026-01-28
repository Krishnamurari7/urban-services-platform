# Database Migration Setup Guide

## Required Migrations

To fix the "table not found" error, you need to run these migrations in order:

### Migration Order:

1. ✅ `001_initial_schema.sql` - Base tables
2. ✅ `002_fix_rls_recursion.sql` - RLS fixes
3. ✅ `003_comprehensive_rls_policies.sql` - RLS policies
4. ✅ `004_auto_create_profile_trigger.sql` - Profile trigger
5. ✅ `005_fix_profile_trigger.sql` - Profile trigger fix
6. ❌ `006_document_verification.sql` - **NEEDS TO BE RUN** (for document uploads)
7. ❌ `007_professional_bank_accounts.sql` - **NEEDS TO BE RUN** (for bank accounts)

## How to Run Migrations

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run Migration 006 (Document Verification)**
   - Open file: `supabase/migrations/006_document_verification.sql`
   - Copy ALL the contents
   - Paste into SQL Editor
   - Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
   - Wait for "Success" message

4. **Run Migration 007 (Bank Accounts)**
   - Open file: `supabase/migrations/007_professional_bank_accounts.sql`
   - Copy ALL the contents
   - Paste into SQL Editor
   - Click **Run**
   - Wait for "Success" message

### Method 2: Using Supabase CLI

```bash
# Navigate to project directory
cd urban-services-platform

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Run all pending migrations
supabase db push

# Or run specific migration
supabase db execute --file supabase/migrations/006_document_verification.sql
supabase db execute --file supabase/migrations/007_professional_bank_accounts.sql
```

## Verify Migrations

After running migrations, verify tables exist:

```sql
-- Check if professional_documents table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('professional_documents', 'professional_bank_accounts')
ORDER BY table_name;
```

You should see both tables listed.

## Quick Fix for Current Error

**To fix the immediate error:**

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `006_document_verification.sql`
3. Click Run
4. Try uploading document again

## Troubleshooting

### Error: "relation already exists"

- Table already exists, migration was already run
- You can skip this migration

### Error: "permission denied"

- Make sure you're logged in as project owner/admin
- Check RLS policies are correct

### Error: "syntax error"

- Check SQL syntax in the migration file
- Make sure you copied the entire file

## Next Steps After Migrations

1. ✅ Create Storage Bucket (see `STORAGE_SETUP.md`)
2. ✅ Test document upload
3. ✅ Test bank account addition
