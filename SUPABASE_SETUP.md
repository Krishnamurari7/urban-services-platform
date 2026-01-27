# Supabase Integration Guide

This project uses Supabase for authentication and database management. Follow these steps to set up Supabase.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project in your Supabase dashboard

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2. Configure Environment Variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 3. Database Migrations

Run the database migrations in order:

1. **Initial Schema** (`001_initial_schema.sql`) - Creates all tables including `profiles`
2. **RLS Policies** (`003_comprehensive_rls_policies.sql`) - Sets up Row Level Security
3. **Auto-create Profile Trigger** (`004_auto_create_profile_trigger.sql`) - Automatically creates profiles when users sign up

The `profiles` table stores user roles (`customer`, `professional`, `admin`) and is automatically created when a user signs up via the database trigger.

### 4. Google OAuth Setup (Optional)

To enable Google authentication:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
5. Add authorized redirect URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

**Google Cloud Console Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs matching your Supabase redirect URL

## Project Structure

### Supabase Clients

- **`lib/supabase/client.ts`** - Client-side Supabase client (for use in Client Components)
- **`lib/supabase/server.ts`** - Server-side Supabase client (for use in Server Components and API routes)
- **`lib/supabase/middleware.ts`** - Middleware helper for session management

### Authentication Utilities

- **`lib/auth/session.ts`** - Server-side session helpers
  - `getSession()` - Get current user session
  - `getCurrentUser()` - Get current user
  - `hasRole()` - Check if user has a specific role
  - `requireAuth()` - Require authentication (throws if not authenticated)
  - `requireRole()` - Require specific role (throws if user doesn't have role)

- **`lib/auth/actions.ts`** - Server actions for authentication
  - `signIn()` - Sign in with email/password
  - `signUp()` - Sign up new user with role selection
  - `signInWithGoogle()` - Sign in with Google OAuth
  - `signOut()` - Sign out current user
  - `getSession()` - Get current session
  - `getUserRole()` - Get user role from profiles table

### Client-Side Hooks

- **`hooks/use-auth.ts`** - React hook for client-side auth state
- **`components/auth/auth-provider.tsx`** - Auth context provider (wraps the app)

## Usage Examples

### Server Component

```tsx
import { getSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const { user, isAuthenticated } = await getSession();

  if (!isAuthenticated) {
    redirect("/login");
  }

  return <div>Welcome, {user?.email}</div>;
}
```

### Client Component

```tsx
"use client";

import { useAuth } from "@/components/auth/auth-provider";

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;

  return <div>Welcome, {user?.email}</div>;
}
```

### Server Action

```tsx
"use server";

import { signIn } from "@/lib/auth/actions";

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await signIn(email, password);
  if (result?.error) {
    // Handle error
  }
}
```

### Require Role

```tsx
import { requireRole } from "@/lib/auth/session";

export default async function AdminPage() {
  // This will throw if user is not an admin
  const user = await requireRole("admin");

  return <div>Admin Dashboard</div>;
}
```

## Middleware Protection

The middleware (`middleware.ts`) automatically:
- Refreshes user sessions
- Fetches user role from `profiles` table
- Redirects unauthenticated users from protected routes to `/login`
- Redirects authenticated users away from auth pages (`/login`, `/register`)
- Enforces role-based access (e.g., `/users` requires admin role)

Protected routes:
- `/dashboard`, `/bookings`, `/services`, `/profile` - Requires authentication
- `/users` - Requires admin role

## Authentication Features

### Email + Password
- Users can sign up with email and password
- Role selection during registration (customer or professional)
- Admin accounts must be created by existing admins
- Email confirmation required (configurable in Supabase)

### Google OAuth
- One-click sign in with Google
- Profile automatically created with role from metadata or defaults to 'customer'
- Seamless integration with existing auth flow

### Role-Based Access
- Roles stored in `profiles` table
- Automatic profile creation via database trigger
- Middleware enforces role-based route protection
- Client-side and server-side role checking available

## Next Steps

1. Set up your Supabase project and add credentials to `.env.local`
2. Run database migrations in order (see `supabase/migrations/`)
3. Configure email templates in Supabase dashboard (Settings → Auth → Email Templates)
4. Set up Google OAuth if needed (Settings → Auth → Providers → Google)
5. Test authentication flow:
   - Sign up with email/password
   - Sign in with Google (if configured)
   - Verify profile creation in `profiles` table
   - Test role-based route protection

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js with Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
