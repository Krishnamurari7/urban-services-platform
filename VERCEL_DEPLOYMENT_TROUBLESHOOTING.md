# Vercel Deployment Troubleshooting Guide

## Common Deployment Errors and Solutions

### 1. Missing Environment Variables

**Error Symptoms:**
- Build fails with "undefined" errors
- Runtime errors related to Supabase or Razorpay
- Build completes but app crashes on load

**Solution:**
Ensure all required environment variables are set in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

**Important:** 
- Set `NEXT_PUBLIC_APP_URL` to your actual Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- Make sure to set these for **Production**, **Preview**, and **Development** environments if needed
- After adding variables, trigger a new deployment

### 2. TypeScript Build Errors

**Error Symptoms:**
- Build fails with TypeScript errors
- Error messages mentioning type mismatches

**Solution:**

**Option A: Fix TypeScript Errors (Recommended)**
- Review the build logs for specific TypeScript errors
- Fix the type errors in your code
- Ensure all imports are correct

**Option B: Temporarily Ignore TypeScript Errors**
If you need to deploy quickly, temporarily update `next.config.ts`:

```typescript
typescript: {
  ignoreBuildErrors: true, // Change from false to true
},
```

⚠️ **Warning:** Only use this temporarily. Fix type errors as soon as possible.

### 3. Next.js 15 Compatibility Issues

**Error Symptoms:**
- Build fails with Next.js version-related errors
- Errors about React Server Components

**Solution:**
- Ensure you're using compatible versions:
  - Next.js: 15.5.12 ✓ (current)
  - React: 18.3.1 ✓ (current)
  - React DOM: 18.3.1 ✓ (current)

### 4. Build Timeout

**Error Symptoms:**
- Build fails with timeout errors
- Build takes too long

**Solution:**
- Check for large dependencies
- Optimize images and assets
- Consider using Vercel's build cache
- Review `vercel.json` configuration

### 5. Module Resolution Errors

**Error Symptoms:**
- "Cannot find module" errors
- Import path errors

**Solution:**
- Verify `tsconfig.json` paths configuration
- Ensure all dependencies are in `package.json`
- Check that `node_modules` is not in `.gitignore` incorrectly

### 6. Missing Dependencies

**Error Symptoms:**
- "Module not found" errors
- Missing package warnings

**Solution:**
- Run `npm install` locally to verify all dependencies install correctly
- Check `package.json` for missing dependencies
- Ensure `package-lock.json` is committed to git

## Step-by-Step Deployment Checklist

### Pre-Deployment

- [ ] All environment variables are documented in `.env.example`
- [ ] Code builds successfully locally (`npm run build`)
- [ ] No TypeScript errors (`npm run build` should pass)
- [ ] All dependencies are listed in `package.json`
- [ ] `package-lock.json` is committed

### Vercel Configuration

- [ ] Project is connected to GitHub repository
- [ ] All environment variables are set in Vercel dashboard
- [ ] `NEXT_PUBLIC_APP_URL` points to your Vercel domain
- [ ] Build command is set to `npm run build`
- [ ] Output directory is `.next` (default for Next.js)

### Post-Deployment

- [ ] Application loads without errors
- [ ] Environment variables are accessible
- [ ] API routes are working
- [ ] Database connections are successful
- [ ] External services (Razorpay, Supabase) are configured

## Debugging Build Logs

1. **Check Build Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the failed deployment
   - Review the build logs for specific error messages

2. **Common Log Patterns:**
   - `Error: Cannot find module` → Missing dependency
   - `Type error:` → TypeScript error
   - `undefined is not defined` → Missing environment variable
   - `Build timed out` → Build taking too long

3. **Test Locally:**
   - Run `npm run build` locally to reproduce errors
   - Fix errors locally before pushing to GitHub

## Quick Fixes

### If build fails immediately:
1. Check environment variables are set
2. Verify `package.json` has all dependencies
3. Check `next.config.ts` for configuration issues

### If build succeeds but app crashes:
1. Check runtime environment variables
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Verify Supabase and Razorpay credentials

### If specific route fails:
1. Check middleware configuration
2. Verify route file exists
3. Check for TypeScript errors in that route

## Getting Help

If issues persist:
1. Check Vercel build logs for specific error messages
2. Test build locally: `npm run build`
3. Verify all environment variables are set
4. Check Next.js and React versions compatibility
5. Review recent code changes that might have broken the build

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Razorpay publishable key |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Razorpay webhook secret |
| `NEXT_PUBLIC_APP_URL` | Yes | Your application URL (Vercel domain) |
| `NODE_ENV` | Yes | Set to `production` for Vercel |
