# Urban Services Platform

A production-ready Next.js marketplace platform for home services, built with TypeScript, Tailwind CSS, and Shadcn UI.

> 🚀 **New to this project?** Start with [QUICK_START.md](./QUICK_START.md) for a 15-minute setup guide!

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 15 minutes ⚡
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment instructions 📘
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step setup checklist ✅
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Supabase configuration guide 🔐
- **[MIGRATION_SETUP.md](./MIGRATION_SETUP.md)** - Database migration guide 🗄️
- **[STORAGE_SETUP.md](./STORAGE_SETUP.md)** - Storage bucket setup 📦

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Linting**: ESLint + Prettier
- **Package Manager**: npm

## Project Structure

```
urban-services-platform/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes (login, register)
│   ├── (customer)/        # Customer panel routes
│   ├── (professional)/    # Professional panel routes
│   ├── (admin)/           # Admin panel routes
│   └── (public)/          # Public routes
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components
│   ├── customer/         # Customer-specific components
│   ├── professional/     # Professional-specific components
│   ├── admin/            # Admin-specific components
│   └── shared/           # Shared components
├── lib/                  # Utility libraries
│   ├── api/             # API client functions
│   ├── utils/           # Utility functions
│   ├── validations/     # Form validation schemas
│   ├── constants/       # App constants
│   └── types/           # TypeScript type definitions
├── hooks/               # Custom React hooks
├── middleware/         # Next.js middleware
└── types/              # Global type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Features

- ✅ Next.js App Router with TypeScript
- ✅ Tailwind CSS for styling
- ✅ Shadcn UI component library
- ✅ ESLint + Prettier configuration
- ✅ Marketplace-optimized folder structure
- ✅ Role-based routing structure (Customer, Professional, Admin)
- ✅ Type-safe development with TypeScript
- ✅ Production-ready configuration

## Development Guidelines

- Use TypeScript for all new files
- Follow the existing folder structure
- Use Shadcn UI components from `@/components/ui`
- Write reusable components in `components/shared`
- Place API logic in `lib/api`
- Define types in `lib/types`
- Use Prettier for code formatting
- Run ESLint before committing

## Deployment

> 📘 **For complete step-by-step deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

### Prerequisites for Deployment

1. **Supabase Project**: Set up a Supabase project and run all migrations from `supabase/migrations/`
2. **Razorpay Account**: Create a Razorpay account and get API keys
3. **Vercel Account** (recommended) or any Node.js hosting platform

### Quick Start

1. **Set up environment variables** (see `.env.example` or `DEPLOYMENT_GUIDE.md`)
2. **Run database migrations** (9 migrations in `supabase/migrations/`)
3. **Create storage bucket** (`professional-documents` in Supabase)
4. **Deploy to Vercel** (see detailed guide below)

### Deploying to Vercel

1. **Push your code to GitHub**:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import project to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**:
   In Vercel project settings, add all environment variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NODE_ENV=production
   ```

4. **Deploy**:
   - Vercel will automatically deploy on every push to main branch
   - Or click "Deploy" button to deploy manually

5. **Configure Razorpay Webhook**:
   - Go to Razorpay Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-domain.vercel.app/api/payments/webhook`
   - Select events: `payment.captured`, `payment.failed`, `refund.created`

### Database Setup

1. **Run Migrations**:

   ```bash
   # Using Supabase CLI (recommended)
   supabase db push

   # Or manually run SQL files from supabase/migrations/ in Supabase SQL Editor
   ```

2. **Set up RLS Policies**:
   - All RLS policies are included in migration files
   - Verify policies are active in Supabase Dashboard → Authentication → Policies

3. **Configure Storage** (if using file uploads):
   - Create storage buckets in Supabase Dashboard
   - Set up bucket policies for public/private access

### Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test authentication flow (login/register)
- [ ] Test booking creation flow
- [ ] Test payment integration with Razorpay test keys
- [ ] Verify webhook is receiving events
- [ ] Test admin panel access
- [ ] Verify email notifications (if configured)
- [ ] Check error logs in Vercel dashboard
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate (automatic with Vercel)

### Alternative Deployment Options

#### Deploying to Other Platforms

**Railway**:

1. Connect GitHub repository
2. Select Node.js template
3. Add environment variables
4. Deploy

**Render**:

1. Create new Web Service
2. Connect GitHub repository
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables

**AWS/Google Cloud/Azure**:

- Use Docker containerization
- Build Dockerfile with Node.js
- Deploy container to respective cloud platform
- Configure environment variables and networking

### Performance Optimization

- ✅ ISR (Incremental Static Regeneration) enabled on service pages
- ✅ Server-side rendering for better SEO
- ✅ Image optimization with Next.js Image component
- ✅ Database queries optimized with proper indexing

### Monitoring & Analytics

- Set up error tracking (Sentry, LogRocket, etc.)
- Configure analytics (Google Analytics, Vercel Analytics)
- Monitor Supabase usage and performance
- Set up uptime monitoring

## License

Private project
