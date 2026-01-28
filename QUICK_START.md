# Quick Start Guide - Urban Services Platform

Get your Urban Services Platform up and running in 15 minutes!

## 🚀 Quick Setup (5 Steps)

### Step 1: Install Dependencies (2 min)

```bash
cd urban-services-platform
npm install
```

### Step 2: Set Up Supabase (5 min)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy **Project URL** and **anon key** from Settings → API
4. Go to **SQL Editor** → Run all 9 migrations from `supabase/migrations/` in order
5. Go to **Storage** → Create bucket `professional-documents` (make it Public)

### Step 3: Set Up Razorpay (3 min)

1. Create account at [razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys → Generate Test Keys
3. Copy **Key ID** and **Key Secret**

### Step 4: Configure Environment (2 min)

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 5: Run Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📋 Migration Order (Important!)

Run these in **exact order** in Supabase SQL Editor:

1. `001_initial_schema.sql`
2. `002_fix_rls_recursion.sql`
3. `003_comprehensive_rls_policies.sql`
4. `004_auto_create_profile_trigger.sql`
5. `005_fix_profile_trigger.sql`
6. `006_document_verification.sql`
7. `007_professional_bank_accounts.sql`
8. `008_homepage_banners.sql`
9. `009_allow_customer_payment_insert.sql`

---

## 🔍 Verify Setup

### Check Database Tables

Run in Supabase SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should see: `bookings`, `homepage_banners`, `payments`, `profiles`, `professional_bank_accounts`, `professional_documents`, `reviews`, `services`, etc.

### Check Storage

- Go to Supabase → Storage → Buckets
- Verify `professional-documents` exists and is **Public**

### Test Local Server

- ✅ Homepage loads
- ✅ No console errors
- ✅ Can navigate to `/login`
- ✅ Can navigate to `/services`

---

## 🚢 Deploy to Production

### Option 1: Vercel (Recommended - 5 min)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import GitHub repository
4. Add environment variables (same as `.env.local` but use production values)
5. Deploy!

### Option 2: Other Platforms

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for Railway, Render, AWS, etc.

---

## 🐛 Common Issues

### "Table not found"

→ Run migrations in order (001-009)

### "Bucket not found"

→ Create `professional-documents` bucket in Supabase Storage

### "Authentication failed"

→ Check Supabase URL and keys in `.env.local`

### "Payment not working"

→ Verify Razorpay keys and webhook URL (after deployment)

---

## 📚 Full Documentation

- **Complete Setup**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Setup Checklist**: [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
- **Supabase Setup**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Migration Guide**: [MIGRATION_SETUP.md](./MIGRATION_SETUP.md)
- **Storage Setup**: [STORAGE_SETUP.md](./STORAGE_SETUP.md)

---

## 🎯 Next Steps

After setup:

1. ✅ Test user registration
2. ✅ Create a test booking
3. ✅ Test payment flow
4. ✅ Configure webhook (production)
5. ✅ Set up monitoring

---

**Need Help?** Check the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
