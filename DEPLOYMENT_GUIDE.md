# 🚀 Complete Step-by-Step Deployment Guide - Urban Services Platform

This comprehensive guide will walk you through deploying the Urban Services Platform from scratch to production, step by step.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Local Development Setup](#step-1-local-development-setup)
3. [Step 2: Supabase Setup](#step-2-supabase-setup)
4. [Step 3: Database Migrations](#step-3-database-migrations)
5. [Step 4: Storage Setup](#step-4-storage-setup)
6. [Step 5: Razorpay Setup](#step-5-razorpay-setup)
7. [Step 6: Environment Configuration](#step-6-environment-configuration)
8. [Step 7: Test Local Setup](#step-7-test-local-setup)
9. [Step 8: Deploy to Vercel](#step-8-deploy-to-vercel)
10. [Step 9: Post-Deployment Configuration](#step-9-post-deployment-configuration)
11. [Step 10: Verification & Testing](#step-10-verification--testing)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 18+** installed ([Download here](https://nodejs.org/))
- ✅ **npm** (comes with Node.js) or **yarn** or **pnpm**
- ✅ **Git** installed ([Download here](https://git-scm.com/))
- ✅ **A Supabase account** ([Sign up here](https://supabase.com))
- ✅ **A Razorpay account** ([Sign up here](https://razorpay.com))
- ✅ **A Vercel account** ([Sign up here](https://vercel.com))
- ✅ **A GitHub account** (for version control)

**Verify installations:**

```bash
node --version    # Should be 18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
git --version     # Should be installed
```

---

## Step 1: Local Development Setup

### 1.1 Navigate to Project Directory

```bash
cd "urban-services-platform"
```

### 1.2 Install Dependencies

```bash
npm install
```

**Expected output:** Dependencies will be installed. This may take 2-5 minutes.

### 1.3 Create Environment File

Create a `.env.local` file in the root directory (`urban-services-platform/.env.local`):

**Windows (PowerShell):**

```powershell
New-Item -Path .env.local -ItemType File
```

**Mac/Linux:**

```bash
touch .env.local
```

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## Step 2: Supabase Setup

### 2.1 Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"** button (top right)
3. Fill in the form:
   - **Project Name**: `urban-services-platform` (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Select closest to your users (e.g., `Southeast Asia (Singapore)` for India)
   - **Pricing Plan**: Select **Free** for development
4. Click **"Create new project"**
5. **Wait 2-3 minutes** for project initialization (you'll see a progress indicator)

### 2.2 Get Supabase Credentials

1. Once project is ready, go to **Settings** → **API** (left sidebar)
2. Copy the following values (you'll need them in Step 6):

   **Project URL:**

   ```
   https://xxxxx.supabase.co
   ```

   Copy this value - it looks like: `https://abcdefghijklmnop.supabase.co`

   **anon public key:**

   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   This is a long string starting with `eyJ`

   **service_role key:**

   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   This is also a long string starting with `eyJ`

   ⚠️ **IMPORTANT:** The service_role key has admin privileges. Keep it secret!

### 2.3 Verify Supabase Connection

1. Go to **Table Editor** (left sidebar)
2. You should see an empty list (no tables yet - we'll create them in Step 3)
3. If you can see the dashboard, Supabase is ready!

---

## Step 3: Database Migrations

**IMPORTANT:** Run migrations in the exact order listed below (001 → 009).

### 3.1 Open SQL Editor

1. In Supabase Dashboard, click **SQL Editor** (left sidebar)
2. Click **"New Query"** button (top right)

### 3.2 Run Migration 1: Initial Schema

1. Open file: `supabase/migrations/001_initial_schema.sql`
2. **Copy the entire contents** of the file
3. **Paste** into Supabase SQL Editor
4. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
5. **Wait for completion** - you should see "Success. No rows returned"

**Expected result:** Creates tables: profiles, services, bookings, payments, reviews

### 3.3 Run Migration 2: Fix RLS Recursion

1. Open file: `supabase/migrations/002_fix_rls_recursion.sql`
2. Copy entire contents
3. Paste into SQL Editor (create new query)
4. Click **"Run"**
5. Wait for completion

**Expected result:** Fixes RLS recursion issues

### 3.4 Run Migration 3: Comprehensive RLS Policies

1. Open file: `supabase/migrations/003_comprehensive_rls_policies.sql`
2. Copy entire contents
3. Paste into SQL Editor (create new query)
4. Click **"Run"**
5. Wait for completion

**Expected result:** Adds security policies for all tables

### 3.5 Run Migration 4: Auto-create Profile Trigger

1. Open file: `supabase/migrations/004_auto_create_profile_trigger.sql`
2. Copy entire contents
3. Paste into SQL Editor (create new query)
4. Click **"Run"**
5. Wait for completion

**Expected result:** Creates trigger to auto-create profiles on user signup

### 3.6 Run Migration 5: Fix Profile Trigger

1. Open file: `supabase/migrations/005_fix_profile_trigger.sql`
2. Copy entire contents
3. Paste into SQL Editor (create new query)
4. Click **"Run"**
5. Wait for completion

**Expected result:** Fixes profile trigger issues

### 3.7 Run Migration 6: Document Verification

1. Open file: `supabase/migrations/006_document_verification.sql`
2. Copy entire contents
3. Paste into SQL Editor (create new query)
4. Click **"Run"**
5. Wait for completion

**Expected result:** Creates professional_documents table

### 3.8 Run Migration 7: Professional Bank Accounts

1. Open file: `supabase/migrations/007_professional_bank_accounts.sql`
2. Copy entire contents
3. Paste into SQL Editor (create new query)
4. Click **"Run"**
5. Wait for completion

**Expected result:** Creates professional_bank_accounts table

### 3.9 Run Migration 8: Homepage Banners

1. Open file: `supabase/migrations/008_homepage_banners.sql`
2. Copy entire contents
3. Paste into SQL Editor (create new query)
4. Click **"Run"**
5. Wait for completion

**Expected result:** Creates homepage_banners table

### 3.10 Run Migration 9: Allow Customer Payment Insert

1. Open file: `supabase/migrations/009_allow_customer_payment_insert.sql`
2. Copy entire contents
3. Paste into SQL Editor (create new query)
4. Click **"Run"**
5. Wait for completion

**Expected result:** Allows customers to create payment records

### 3.11 Verify Migrations

Run this verification query in SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'profiles',
  'services',
  'bookings',
  'payments',
  'reviews',
  'professional_documents',
  'professional_bank_accounts',
  'homepage_banners'
)
ORDER BY table_name;
```

**Expected result:** You should see all 8 tables listed:

- bookings
- homepage_banners
- payments
- professional_bank_accounts
- professional_documents
- profiles
- reviews
- services

**If any table is missing:** Re-run the corresponding migration file.

---

## Step 4: Storage Setup

### 4.1 Create Storage Bucket

1. In Supabase Dashboard, click **Storage** (left sidebar)
2. Click **"New bucket"** button
3. Enter bucket name: `professional-documents` (exactly as shown, case-sensitive)
4. **Toggle "Public bucket"** to **ON** (important!)
5. Click **"Create bucket"**

### 4.2 Verify Storage Bucket

1. Go to **Storage** → **Buckets**
2. You should see `professional-documents` in the list
3. Verify it shows **"Public"** status (not Private)

**If bucket is Private:** Click on the bucket → Settings → Toggle "Public bucket" to ON

---

## Step 5: Razorpay Setup

### 5.1 Create Razorpay Account

1. Go to [https://razorpay.com](https://razorpay.com)
2. Click **"Sign Up"** (top right)
3. Fill in your details:
   - Business name
   - Email address
   - Phone number
   - Password
4. Verify your email address
5. Complete KYC verification (required for production, optional for testing)

### 5.2 Get API Keys (Test Mode)

1. Log in to Razorpay Dashboard
2. Go to **Settings** → **API Keys** (left sidebar)
3. Click **"Generate Test Keys"** (if you don't have test keys)
4. Copy the following values (you'll need them in Step 6):

   **Key ID:**

   ```
   rzp_test_xxxxxxxxxxxxx
   ```

   Starts with `rzp_test_`

   **Key Secret:**

   ```
   xxxxxxxxxxxxxxxxxxxxxx
   ```

   This is a long string (keep it secret!)

**Note:** For production, you'll need to generate **Live Keys** after completing KYC.

### 5.3 Verify Razorpay Account

1. Check that you can see the Razorpay Dashboard
2. Verify API Keys section shows your keys
3. Note: Test keys work for development, Live keys needed for production

---

## Step 6: Environment Configuration

### 6.1 Open `.env.local` File

Open the `.env.local` file you created in Step 1.3.

### 6.2 Add Supabase Configuration

Add these lines (replace with your actual values from Step 2.2):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace:**

- `https://xxxxx.supabase.co` with your Project URL from Step 2.2
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (anon key) with your anon public key
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (service role) with your service_role key

### 6.3 Add Razorpay Configuration

Add these lines (replace with your actual values from Step 5.2):

```env
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxx
```

**Replace:**

- `rzp_test_xxxxxxxxxxxxx` with your Key ID from Step 5.2
- `xxxxxxxxxxxxxxxxxxxxxx` with your Key Secret from Step 5.2

### 6.4 Add Application Configuration

Add these lines:

```env
# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 6.5 Complete `.env.local` File

Your complete `.env.local` should look like this:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1234567890123456
RAZORPAY_KEY_SECRET=abcdefghijklmnopqrstuvwxyz123456

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Important:**

- Never commit this file to Git
- Keep all keys secret
- Use test keys for development, live keys for production

---

## Step 7: Test Local Setup

### 7.1 Start Development Server

```bash
npm run dev
```

**Expected output:**

```
  ▲ Next.js 16.1.4
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

### 7.2 Test Application

1. Open browser: [http://localhost:3000](http://localhost:3000)
2. Verify homepage loads without errors
3. Check browser console (F12) for any errors
4. Try navigating to:
   - Services page: [http://localhost:3000/services](http://localhost:3000/services)
   - Login page: [http://localhost:3000/login](http://localhost:3000/login)
   - Register page: [http://localhost:3000/register](http://localhost:3000/register)

### 7.3 Test Authentication

1. Go to [http://localhost:3000/register](http://localhost:3000/register)
2. Register a new user (customer role)
3. Check Supabase Dashboard → **Authentication** → **Users**
4. Verify new user appears in the list
5. Check **Table Editor** → **profiles** table
6. Verify a profile was automatically created

**If authentication works:** ✅ You're ready to deploy!

**If you see errors:** Check the Troubleshooting section below.

---

## Step 8: Deploy to Vercel

### 8.1 Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Urban Services Platform"
```

### 8.2 Create GitHub Repository

1. Go to [https://github.com](https://github.com)
2. Click **"New repository"** (top right, + icon)
3. Fill in:
   - **Repository name**: `urban-services-platform`
   - **Description**: "Urban Services Platform - Service Marketplace"
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license
4. Click **"Create repository"**

### 8.3 Push Code to GitHub

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/urban-services-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Expected output:** Code will be uploaded to GitHub.

### 8.4 Import Project to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Click **"Add New..."** → **"Project"**
4. Click **"Import Git Repository"**
5. Select your GitHub account (if prompted, authorize Vercel)
6. Find and click on `urban-services-platform` repository
7. Click **"Import"**

### 8.5 Configure Vercel Project Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**Click "Deploy" button** - but wait! We need to add environment variables first.

### 8.6 Add Environment Variables in Vercel

**Before deploying**, add environment variables:

1. In Vercel project setup page, scroll to **"Environment Variables"** section
2. Click **"Add"** for each variable below:

   **Variable 1:**
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase Project URL (from Step 2.2)
   - **Environment**: Production, Preview, Development (select all)
   - Click **"Save"**

   **Variable 2:**
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key (from Step 2.2)
   - **Environment**: Production, Preview, Development (select all)
   - Click **"Save"**

   **Variable 3:**
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Your Supabase service_role key (from Step 2.2)
   - **Environment**: Production, Preview, Development (select all)
   - Click **"Save"**

   **Variable 4:**
   - **Name**: `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - **Value**: Your Razorpay Key ID (from Step 5.2)
   - **Environment**: Production, Preview, Development (select all)
   - Click **"Save"**

   **Variable 5:**
   - **Name**: `RAZORPAY_KEY_SECRET`
   - **Value**: Your Razorpay Key Secret (from Step 5.2)
   - **Environment**: Production, Preview, Development (select all)
   - Click **"Save"**

   **Variable 6:**
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: Production, Preview, Development (select all)
   - Click **"Save"**

   **Variable 7:**
   - **Name**: `NEXT_PUBLIC_APP_URL`
   - **Value**: Leave empty for now (we'll update after first deployment)
   - **Environment**: Production, Preview, Development (select all)
   - Click **"Save"**

### 8.7 Deploy to Vercel

1. After adding all environment variables, click **"Deploy"** button
2. **Wait 2-5 minutes** for build to complete
3. You'll see build logs in real-time
4. Once complete, you'll see: **"Congratulations! Your project has been deployed."**

### 8.8 Get Your Deployment URL

1. After deployment, Vercel will show your live URL:

   ```
   https://urban-services-platform.vercel.app
   ```

   (Your URL will be different)

2. **Copy this URL** - you'll need it in the next step

### 8.9 Update APP_URL Environment Variable

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Click **"Edit"**
4. Update value to your deployment URL: `https://your-project.vercel.app`
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"Redeploy"** → **"Redeploy"** (to apply the change)

---

## Step 9: Post-Deployment Configuration

### 9.1 Configure Razorpay Webhook

1. Go to Razorpay Dashboard → **Settings** → **Webhooks**
2. Click **"Add New Webhook"**
3. Fill in:
   - **Webhook URL**: `https://your-project.vercel.app/api/payments/webhook`
     (Replace `your-project.vercel.app` with your actual Vercel URL)
   - **Secret**: Leave empty for now (or generate one)
   - **Active Events**: Select:
     - ✅ `payment.captured`
     - ✅ `payment.failed`
     - ✅ `refund.created`
4. Click **"Create Webhook"**
5. **Copy the Webhook Secret** (if generated)

### 9.2 Add Webhook Secret to Vercel (Optional)

If you generated a webhook secret:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Click **"Add"**
3. **Name**: `RAZORPAY_WEBHOOK_SECRET`
4. **Value**: Your webhook secret from Step 9.1
5. **Environment**: Production, Preview, Development (select all)
6. Click **"Save"**
7. Redeploy your application

---

## Step 10: Verification & Testing

### 10.1 Test Production Deployment

1. Open your Vercel URL: `https://your-project.vercel.app`
2. Verify homepage loads
3. Check browser console (F12) for errors
4. Test navigation:
   - Services page
   - Login page
   - Register page

### 10.2 Test Authentication

1. Go to Register page
2. Create a new account (customer role)
3. Verify you can log in
4. Check Supabase Dashboard → **Authentication** → **Users**
5. Verify user appears in the list

### 10.3 Test Database Connection

1. Create a test booking (if possible)
2. Check Supabase Dashboard → **Table Editor** → **bookings**
3. Verify booking appears in the table

### 10.4 Test Payment Flow (Test Mode)

1. Create a booking that requires payment
2. Go through payment flow
3. Use Razorpay test card:
   - **Card Number**: `4111 1111 1111 1111`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVV**: Any 3 digits (e.g., `123`)
   - **Name**: Any name
4. Complete payment
5. Verify payment appears in Razorpay Dashboard → **Payments**

### 10.5 Verify Webhook (Optional)

1. Complete a test payment
2. Go to Razorpay Dashboard → **Settings** → **Webhooks**
3. Click on your webhook
4. Check **"Webhook Logs"**
5. Verify events are being received

### 10.6 Complete Verification Checklist

- [ ] Homepage loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Services page loads
- [ ] Booking creation works (if applicable)
- [ ] Payment flow works (test mode)
- [ ] Admin dashboard accessible (if you have admin account)
- [ ] No console errors in browser
- [ ] No errors in Vercel logs

---

## Troubleshooting

### Issue 1: "Table not found" Error

**Symptoms:** Error message about missing tables

**Solution:**

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the verification query from Step 3.11
3. If tables are missing, re-run the corresponding migration file
4. Verify migrations were run in order (001 → 009)

### Issue 2: "Bucket not found" Error

**Symptoms:** Error about storage bucket

**Solution:**

1. Go to Supabase Dashboard → **Storage** → **Buckets**
2. Verify `professional-documents` bucket exists
3. Verify bucket name is exactly `professional-documents` (case-sensitive)
4. Verify bucket is set to **Public**

### Issue 3: Authentication Not Working

**Symptoms:** Can't register or login

**Solution:**

1. Verify Supabase URL and keys in Vercel environment variables
2. Check Supabase Dashboard → **Authentication** → **Users**
3. Verify RLS policies are active: **Authentication** → **Policies**
4. Check browser console for errors
5. Verify `.env.local` has correct values (for local testing)

### Issue 4: Payment Not Working

**Symptoms:** Razorpay checkout doesn't open or payment fails

**Solution:**

1. Verify Razorpay keys in Vercel environment variables
2. Check Razorpay Dashboard → **Settings** → **API Keys**
3. Ensure you're using test keys for testing
4. Verify webhook URL is correct
5. Check Razorpay Dashboard → **Settings** → **Webhooks** → **Logs**

### Issue 5: Build Fails on Vercel

**Symptoms:** Deployment fails during build

**Solution:**

1. Check Vercel Dashboard → **Deployments** → Click on failed deployment → **Logs**
2. Common issues:
   - Missing environment variables → Add them in Vercel settings
   - TypeScript errors → Run `npm run lint` locally and fix errors
   - Missing dependencies → Check `package.json` is correct
3. Fix errors and push to GitHub (Vercel will auto-redeploy)

### Issue 6: RLS Policy Errors

**Symptoms:** "Permission denied" or "Row-level security" errors

**Solution:**

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Verify policies exist for all tables
3. Re-run migration 003: `003_comprehensive_rls_policies.sql`
4. Check user role in `profiles` table matches expected role

### Issue 7: Environment Variables Not Working

**Symptoms:** Variables are undefined or wrong values

**Solution:**

1. Verify variables are set in Vercel → **Settings** → **Environment Variables**
2. Ensure variable names match exactly (case-sensitive)
3. Variables starting with `NEXT_PUBLIC_` are exposed to browser
4. After adding/changing variables, **redeploy** the application
5. Check Vercel logs to verify variables are loaded

### Issue 8: CORS Errors

**Symptoms:** CORS errors in browser console

**Solution:**

1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check Supabase Dashboard → **Settings** → **API** → **CORS**
3. Add your Vercel domain to allowed origins (if needed)

---

## Production Checklist

Before going live with real users:

- [ ] Switch to **Live Razorpay Keys** (complete KYC first)
- [ ] Update `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel
- [ ] Set up **custom domain** (optional but recommended)
- [ ] Configure **email notifications** (if applicable)
- [ ] Set up **error tracking** (Sentry, LogRocket, etc.)
- [ ] Set up **analytics** (Google Analytics, Vercel Analytics)
- [ ] Configure **database backups** in Supabase
- [ ] Test all critical user flows
- [ ] Set up **monitoring** and **alerts**
- [ ] Review **security settings** in Supabase
- [ ] Test **payment flow** with real (small) transaction
- [ ] Set up **uptime monitoring**

---

## Next Steps After Deployment

1. **Custom Domain Setup:**
   - Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
   - Add your custom domain
   - Update DNS records as instructed
   - Update `NEXT_PUBLIC_APP_URL` environment variable

2. **Monitoring Setup:**
   - Set up error tracking (Sentry recommended)
   - Configure Vercel Analytics
   - Set up Supabase monitoring

3. **Backup Strategy:**
   - Configure automatic backups in Supabase
   - Set up database backup schedule

4. **Scaling Preparation:**
   - Monitor Supabase usage
   - Plan for increased traffic
   - Consider upgrading Supabase plan if needed

---

## Support & Resources

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Razorpay Docs**: [https://razorpay.com/docs](https://razorpay.com/docs)
- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)

---

## Quick Reference: Environment Variables

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### Optional Variables

```env
# Webhook (if using Razorpay webhooks)
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

---

**Last Updated:** 2024
**Version:** 2.0.0 - Complete Step-by-Step Guide

---

## 🎉 Congratulations!

You've successfully deployed the Urban Services Platform! Your application is now live and ready for users.

If you encounter any issues, refer to the Troubleshooting section above or check the project documentation.
