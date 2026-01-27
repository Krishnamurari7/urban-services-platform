# Setup Checklist - Urban Services Platform

Use this checklist to ensure all setup steps are completed correctly.

## ✅ Pre-Setup

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm/yarn/pnpm installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Code editor/IDE ready (VS Code recommended)

## ✅ Supabase Setup

- [ ] Supabase account created
- [ ] New project created in Supabase
- [ ] Project URL copied
- [ ] Anon key copied
- [ ] Service role key copied (kept secure)
- [ ] Project region selected (closest to users)

## ✅ Database Migrations

Run these migrations in **exact order** in Supabase SQL Editor:

- [ ] `001_initial_schema.sql` - Base tables and enums
- [ ] `002_fix_rls_recursion.sql` - RLS fixes
- [ ] `003_comprehensive_rls_policies.sql` - Security policies
- [ ] `004_auto_create_profile_trigger.sql` - Profile auto-creation
- [ ] `005_fix_profile_trigger.sql` - Trigger fixes
- [ ] `006_document_verification.sql` - Document uploads
- [ ] `007_professional_bank_accounts.sql` - Bank accounts
- [ ] `008_homepage_banners.sql` - Banner management
- [ ] `009_allow_customer_payment_insert.sql` - Payment permissions

**Verification:**
- [ ] All tables exist (run verification query)
- [ ] RLS policies are active
- [ ] Triggers are working

## ✅ Storage Setup

- [ ] Storage bucket `professional-documents` created
- [ ] Bucket set to **Public**
- [ ] Bucket verified in Storage dashboard

## ✅ Razorpay Setup

- [ ] Razorpay account created
- [ ] KYC verification completed (for production)
- [ ] Test API keys generated
- [ ] Key ID copied
- [ ] Key Secret copied (kept secure)
- [ ] Webhook configured (after deployment)

## ✅ Environment Variables

Create `.env.local` file with:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay key ID
- [ ] `RAZORPAY_KEY_SECRET` - Razorpay key secret
- [ ] `NEXT_PUBLIC_APP_URL` - App URL (localhost:3000 for dev)
- [ ] `NODE_ENV` - Environment (development/production)

## ✅ Local Development

- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created and configured
- [ ] Development server starts (`npm run dev`)
- [ ] Homepage loads at http://localhost:3000
- [ ] No console errors
- [ ] Can navigate between pages

## ✅ Testing (Local)

### Authentication
- [ ] User registration (customer) works
- [ ] User registration (professional) works
- [ ] Login with email/password works
- [ ] Profile created automatically
- [ ] Role stored correctly in database

### Features
- [ ] Browse services
- [ ] View service details
- [ ] Create booking (as customer)
- [ ] Payment flow works (test mode)
- [ ] Professional dashboard accessible
- [ ] Admin dashboard accessible (if admin user exists)

## ✅ Git & Version Control

- [ ] Git repository initialized
- [ ] `.gitignore` configured correctly
- [ ] `.env.local` NOT committed (in .gitignore)
- [ ] Initial commit made
- [ ] GitHub repository created
- [ ] Code pushed to GitHub

## ✅ Vercel Deployment

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Project imported to Vercel
- [ ] Environment variables added in Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` (production)
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (production)
  - [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` (production/live)
  - [ ] `RAZORPAY_KEY_SECRET` (production/live)
  - [ ] `NEXT_PUBLIC_APP_URL` (Vercel domain)
  - [ ] `NODE_ENV=production`
- [ ] Build successful
- [ ] Deployment live
- [ ] Domain accessible

## ✅ Post-Deployment

### Razorpay Webhook
- [ ] Webhook URL added: `https://your-domain.vercel.app/api/payments/webhook`
- [ ] Events selected: `payment.captured`, `payment.failed`, `refund.created`
- [ ] Webhook secret copied
- [ ] Webhook secret added to Vercel env vars (if needed)

### Testing (Production)
- [ ] Homepage loads
- [ ] Authentication works
- [ ] Booking creation works
- [ ] Payment integration works
- [ ] Webhook receives events
- [ ] All user roles work correctly

### Security
- [ ] RLS policies verified
- [ ] Admin routes protected
- [ ] Role-based access working
- [ ] Service role key not exposed
- [ ] Environment variables secure

### Monitoring
- [ ] Error tracking configured (optional)
- [ ] Analytics configured (optional)
- [ ] Uptime monitoring set up (optional)
- [ ] Logs accessible

## ✅ Documentation

- [ ] README.md reviewed
- [ ] DEPLOYMENT_GUIDE.md reviewed
- [ ] Setup documentation complete
- [ ] Team members have access to docs

---

## Quick Reference

### Important URLs

- **Supabase Dashboard**: https://app.supabase.com
- **Razorpay Dashboard**: https://dashboard.razorpay.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub**: https://github.com

### Important Files

- **Environment**: `.env.local` (local) / Vercel Environment Variables (production)
- **Migrations**: `supabase/migrations/` (run in order 001-009)
- **Storage**: Supabase Dashboard → Storage → Buckets

### Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Razorpay Docs**: https://razorpay.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

**Last Updated:** $(date)
**Status:** ✅ Ready for deployment
