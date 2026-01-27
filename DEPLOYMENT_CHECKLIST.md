# ✅ Deployment Checklist - Quick Reference

Use this checklist alongside the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for quick reference.

## 📋 Pre-Deployment Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] npm/yarn/pnpm installed
- [ ] Git installed
- [ ] Supabase account created
- [ ] Razorpay account created
- [ ] Vercel account created
- [ ] GitHub account created

---

## 🔧 Step 1: Local Setup
- [ ] Navigated to project directory
- [ ] Ran `npm install`
- [ ] Created `.env.local` file

---

## 🗄️ Step 2: Supabase Setup
- [ ] Created Supabase project
- [ ] Copied Project URL
- [ ] Copied anon public key
- [ ] Copied service_role key
- [ ] Verified Supabase connection

---

## 📊 Step 3: Database Migrations
- [ ] Ran migration 001_initial_schema.sql
- [ ] Ran migration 002_fix_rls_recursion.sql
- [ ] Ran migration 003_comprehensive_rls_policies.sql
- [ ] Ran migration 004_auto_create_profile_trigger.sql
- [ ] Ran migration 005_fix_profile_trigger.sql
- [ ] Ran migration 006_document_verification.sql
- [ ] Ran migration 007_professional_bank_accounts.sql
- [ ] Ran migration 008_homepage_banners.sql
- [ ] Ran migration 009_allow_customer_payment_insert.sql
- [ ] Verified all tables exist (ran verification query)

---

## 📦 Step 4: Storage Setup
- [ ] Created `professional-documents` bucket
- [ ] Set bucket to Public
- [ ] Verified bucket exists

---

## 💳 Step 5: Razorpay Setup
- [ ] Created Razorpay account
- [ ] Generated test API keys
- [ ] Copied Key ID
- [ ] Copied Key Secret

---

## ⚙️ Step 6: Environment Configuration
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` to `.env.local`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] Added `NEXT_PUBLIC_RAZORPAY_KEY_ID` to `.env.local`
- [ ] Added `RAZORPAY_KEY_SECRET` to `.env.local`
- [ ] Added `NEXT_PUBLIC_APP_URL` to `.env.local`
- [ ] Added `NODE_ENV` to `.env.local`

---

## 🧪 Step 7: Local Testing
- [ ] Ran `npm run dev`
- [ ] Homepage loads at http://localhost:3000
- [ ] No console errors
- [ ] Tested user registration
- [ ] Tested user login
- [ ] Verified profile auto-creation in Supabase

---

## 🚀 Step 8: Vercel Deployment
- [ ] Initialized Git repository
- [ ] Created GitHub repository
- [ ] Pushed code to GitHub
- [ ] Imported project to Vercel
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` to Vercel env vars
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel env vars
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to Vercel env vars
- [ ] Added `NEXT_PUBLIC_RAZORPAY_KEY_ID` to Vercel env vars
- [ ] Added `RAZORPAY_KEY_SECRET` to Vercel env vars
- [ ] Added `NODE_ENV` to Vercel env vars
- [ ] Added `NEXT_PUBLIC_APP_URL` to Vercel env vars
- [ ] Deployed to Vercel
- [ ] Got deployment URL
- [ ] Updated `NEXT_PUBLIC_APP_URL` with deployment URL
- [ ] Redeployed to apply URL change

---

## 🔗 Step 9: Post-Deployment
- [ ] Configured Razorpay webhook URL
- [ ] Added webhook events (payment.captured, payment.failed, refund.created)
- [ ] Added `RAZORPAY_WEBHOOK_SECRET` to Vercel (if generated)
- [ ] Redeployed after webhook secret addition

---

## ✅ Step 10: Verification
- [ ] Production homepage loads
- [ ] No console errors in production
- [ ] User registration works in production
- [ ] User login works in production
- [ ] Services page loads
- [ ] Booking creation works (if applicable)
- [ ] Payment flow works (test mode)
- [ ] Admin dashboard accessible (if applicable)
- [ ] No errors in Vercel logs
- [ ] Webhook receives events (check Razorpay dashboard)

---

## 🎯 Production Readiness Checklist

### Before Going Live
- [ ] Switched to Live Razorpay Keys (after KYC)
- [ ] Updated Razorpay keys in Vercel
- [ ] Set up custom domain (optional)
- [ ] Configured email notifications
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up analytics
- [ ] Configured database backups
- [ ] Tested all critical user flows
- [ ] Set up monitoring and alerts
- [ ] Reviewed security settings
- [ ] Tested payment with real transaction (small amount)

---

## 🔍 Quick Troubleshooting Reference

| Issue | Quick Fix |
|-------|-----------|
| Table not found | Re-run migrations in order |
| Bucket not found | Create `professional-documents` bucket, set to Public |
| Auth not working | Check Supabase keys in env vars |
| Payment not working | Check Razorpay keys, verify webhook URL |
| Build fails | Check Vercel logs, verify env vars |
| RLS errors | Re-run migration 003 |

---

## 📝 Environment Variables Quick Copy

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_APP_URL=
NODE_ENV=production
```

---

**Last Updated:** 2024
**Use with:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
