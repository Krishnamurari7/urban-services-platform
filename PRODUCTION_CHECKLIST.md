# Production Readiness Checklist

This document outlines all the checks and configurations needed before deploying to production.

## ✅ Pre-Deployment Checklist

### Environment Variables

- [ ] **Supabase Configuration**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` - Set to production Supabase project URL
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production anon key
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` - Production service role key (server-side only)

- [ ] **Razorpay Configuration**
  - [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Production Razorpay key ID
  - [ ] `RAZORPAY_KEY_SECRET` - Production Razorpay secret key
  - [ ] `RAZORPAY_WEBHOOK_SECRET` - Production webhook secret (if using webhooks)

- [ ] **Application Configuration**
  - [ ] `NEXT_PUBLIC_APP_URL` - Set to production domain (e.g., `https://your-domain.com`)
  - [ ] `NODE_ENV` - Set to `production`

- [ ] **Optional Services**
  - [ ] `MSG91_AUTH_KEY` - If using SMS notifications
  - [ ] `MSG91_TEMPLATE_ID` - If using SMS notifications

### Database Setup

- [ ] **Run All Migrations**
  - [ ] All migration files from `supabase/migrations/` have been applied
  - [ ] Database schema is up to date
  - [ ] All RLS (Row Level Security) policies are active

- [ ] **Storage Buckets**
  - [ ] `professional-documents` bucket created (if using file uploads)
  - [ ] Bucket policies configured correctly
  - [ ] Public/private access settings configured

- [ ] **Database Indexes**
  - [ ] Verify indexes are created for frequently queried columns
  - [ ] Check query performance

### Security

- [ ] **Authentication**
  - [ ] Supabase Auth is configured correctly
  - [ ] Email templates are customized (if needed)
  - [ ] OAuth providers configured (Google, etc.)
  - [ ] Password reset flow tested

- [ ] **API Security**
  - [ ] All API routes have proper authentication checks
  - [ ] Admin routes are protected
  - [ ] Webhook signatures are verified
  - [ ] Rate limiting considered (if needed)

- [ ] **Environment Variables**
  - [ ] No secrets committed to git
  - [ ] `.env.local` is in `.gitignore`
  - [ ] All production secrets are in deployment platform (Vercel, etc.)

### Code Quality

- [ ] **Build Checks**
  - [ ] `npm run build` completes successfully
  - [ ] No TypeScript errors
  - [ ] No ESLint errors (or acceptable warnings)
  - [ ] All imports resolve correctly

- [ ] **Error Handling**
  - [ ] Error boundaries are in place
  - [ ] API routes have proper error handling
  - [ ] User-friendly error messages

- [ ] **Logging**
  - [ ] Production logging configured (if using external service)
  - [ ] Sensitive data not logged
  - [ ] Error tracking set up (Sentry, LogRocket, etc.)

### Performance

- [ ] **Optimization**
  - [ ] Images optimized (Next.js Image component used)
  - [ ] Fonts optimized
  - [ ] Bundle size checked
  - [ ] Lazy loading implemented where appropriate

- [ ] **Caching**
  - [ ] Static pages cached appropriately
  - [ ] API responses cached where applicable
  - [ ] CDN configured (if using)

### SEO & Metadata

- [ ] **Metadata**
  - [ ] Page titles are descriptive
  - [ ] Meta descriptions are set
  - [ ] Open Graph tags configured
  - [ ] Twitter Card tags configured
  - [ ] Favicon and app icons set

- [ ] **SEO Files**
  - [ ] `robots.txt` configured correctly
  - [ ] `sitemap.xml` generated and accessible
  - [ ] Canonical URLs set

### Third-Party Integrations

- [ ] **Razorpay**
  - [ ] Production API keys are set
  - [ ] Webhook URL configured in Razorpay dashboard
  - [ ] Webhook events selected (payment.captured, payment.failed, etc.)
  - [ ] Test payment flow works

- [ ] **Supabase**
  - [ ] Production project created
  - [ ] Database backups configured
  - [ ] Monitoring set up

- [ ] **Email Service** (if using)
  - [ ] SMTP configured or Supabase email configured
  - [ ] Email templates tested
  - [ ] Transactional emails working

### Testing

- [ ] **Functional Testing**
  - [ ] User registration works
  - [ ] User login works
  - [ ] Password reset works
  - [ ] Service booking flow works
  - [ ] Payment flow works
  - [ ] Admin panel accessible
  - [ ] Professional dashboard works
  - [ ] Customer dashboard works

- [ ] **Security Testing**
  - [ ] Protected routes redirect unauthenticated users
  - [ ] Role-based access control works
  - [ ] Admin routes are protected
  - [ ] API routes validate authentication

- [ ] **Cross-Browser Testing**
  - [ ] Chrome/Edge
  - [ ] Firefox
  - [ ] Safari
  - [ ] Mobile browsers

### Deployment Platform

- [ ] **Vercel (or chosen platform)**
  - [ ] Project connected to Git repository
  - [ ] Environment variables set
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `.next` (default)
  - [ ] Node.js version: 18+ (check `package.json` engines if specified)

- [ ] **Domain Configuration**
  - [ ] Custom domain configured (if using)
  - [ ] SSL certificate active (automatic with Vercel)
  - [ ] DNS records configured correctly

### Post-Deployment

- [ ] **Verification**
  - [ ] Homepage loads correctly
  - [ ] All public pages accessible
  - [ ] Authentication flow works
  - [ ] Payment integration works
  - [ ] Webhooks receiving events
  - [ ] Error pages display correctly

- [ ] **Monitoring**
  - [ ] Error tracking configured
  - [ ] Analytics configured (Google Analytics, Vercel Analytics, etc.)
  - [ ] Uptime monitoring set up
  - [ ] Performance monitoring active

- [ ] **Documentation**
  - [ ] README updated with production URLs
  - [ ] API documentation updated (if applicable)
  - [ ] Deployment guide reviewed

## 🚨 Critical Issues to Fix Before Production

1. **Environment Variables**: All must be set in production environment
2. **Database Migrations**: All must be applied
3. **Security**: No hardcoded secrets, proper authentication
4. **Error Handling**: Graceful error handling throughout
5. **Build**: Must build successfully without errors

## 📝 Notes

- Update `robots.txt` with your actual domain before deployment
- Update `sitemap.ts` with your actual domain before deployment
- Test payment flow with Razorpay test keys before switching to production keys
- Monitor Supabase usage and set up alerts for quota limits
- Set up database backups if not automatic

## 🔗 Useful Links

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-to-prod)
- [Razorpay Production Setup](https://razorpay.com/docs/payments/server-integration/)
