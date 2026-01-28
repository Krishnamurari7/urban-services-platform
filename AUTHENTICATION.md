# Authentication Implementation

This document describes the complete authentication system implemented for the Urban Services Platform.

## Features Implemented

### ✅ Email + Password Authentication

- User registration with role selection (customer/professional)
- Email/password login
- Secure session handling with Supabase Auth
- Automatic profile creation via database trigger

### ✅ Google OAuth Authentication

- One-click sign in with Google
- Automatic profile creation with role from metadata
- Seamless OAuth callback handling

### ✅ Role-Based Access Control

- Roles stored in `profiles` table (customer, professional, admin)
- Automatic profile creation on user signup
- Server-side and client-side role checking
- Middleware-based route protection

### ✅ Secure Session Handling

- Server-side session management with `@supabase/ssr`
- Automatic session refresh in middleware
- Secure cookie handling
- Client-side auth state management

## Architecture

### Database Layer

**Profiles Table**

- Stores user role and profile information
- Linked to `auth.users` via foreign key
- Auto-created via database trigger on user signup

**Auto-Create Profile Trigger**

- Located in: `supabase/migrations/004_auto_create_profile_trigger.sql`
- Automatically creates profile when new user signs up
- Extracts role from user metadata (defaults to 'customer')

### Server-Side Authentication

**Session Management** (`lib/auth/session.ts`)

- `getSession()` - Get current session with role
- `getCurrentUser()` - Get current user
- `getUserRole()` - Get user role from profiles table
- `hasRole()` - Check if user has specific role
- `requireAuth()` - Require authentication (throws if not)
- `requireRole()` - Require specific role (throws if not)

**Auth Actions** (`lib/auth/actions.ts`)

- `signIn(email, password)` - Email/password login
- `signUp(email, password, fullName, role)` - User registration
- `signInWithGoogle()` - Google OAuth sign in
- `signOut()` - Sign out current user
- `getUserRole(userId)` - Get user role by ID

### Client-Side Authentication

**Auth Provider** (`components/auth/auth-provider.tsx`)

- Provides auth context to entire app
- Tracks user, role, loading state, and authentication status
- Automatically fetches role from profiles table
- Listens for auth state changes

**Protected Route Component** (`components/auth/protected-route.tsx`)

- Client-side route protection
- Optional role-based access control
- Loading states and error handling
- Automatic redirects for unauthorized access

### Middleware Protection

**Route Protection** (`middleware.ts`)

- Automatically refreshes user sessions
- Fetches user role from profiles table
- Protects routes based on authentication
- Enforces role-based access (e.g., admin-only routes)
- Redirects unauthenticated users to login
- Redirects authenticated users away from auth pages

## Usage Examples

### Server Component

```tsx
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { user, role, isAuthenticated } = await getSession();

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <p>Your role: {role}</p>
    </div>
  );
}
```

### Require Specific Role

```tsx
import { requireRole } from "@/lib/auth/session";

export default async function AdminPage() {
  // Throws error if not admin
  const user = await requireRole("admin");

  return <div>Admin Dashboard</div>;
}
```

### Client Component

```tsx
"use client";

import { useAuth } from "@/components/auth/auth-provider";

export default function ProfilePage() {
  const { user, role, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {role}</p>
    </div>
  );
}
```

### Protected Route

```tsx
"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin-only content</div>
    </ProtectedRoute>
  );
}
```

### Login Form

```tsx
"use client";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
```

## Route Protection

### Public Routes

- `/` - Home page
- `/about` - About page
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Require Authentication)

- `/dashboard` - User dashboard
- `/bookings` - Bookings management
- `/services` - Services management
- `/profile` - User profile

### Admin-Only Routes

- `/users` - User management (requires admin role)

## Environment Variables

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Setup Instructions

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Run Database Migrations**
   - Run migrations in order from `supabase/migrations/`
   - Migration `004_auto_create_profile_trigger.sql` is required for auto profile creation

3. **Configure Supabase**
   - Set up Google OAuth in Supabase dashboard (optional)
   - Configure email templates
   - Set up redirect URLs for OAuth

4. **Set Environment Variables**
   - Create `.env.local` with required variables

5. **Test Authentication**
   - Sign up with email/password
   - Sign in with Google (if configured)
   - Verify profile creation
   - Test role-based access

## Security Features

- ✅ Secure session handling with HTTP-only cookies
- ✅ Automatic session refresh
- ✅ Role-based access control
- ✅ Server-side route protection
- ✅ Client-side route protection
- ✅ Protected API routes
- ✅ Row Level Security (RLS) on database

## Files Modified/Created

### New Files

- `supabase/migrations/004_auto_create_profile_trigger.sql` - Auto-create profile trigger
- `app/auth/callback/route.ts` - OAuth callback handler
- `components/auth/register-form.tsx` - Registration form
- `AUTHENTICATION.md` - This documentation

### Modified Files

- `lib/auth/actions.ts` - Added Google OAuth and role handling
- `lib/auth/session.ts` - Updated to fetch role from profiles table
- `components/auth/auth-provider.tsx` - Added role tracking
- `components/auth/login-form.tsx` - Complete login form with Google OAuth
- `components/auth/protected-route.tsx` - Added role-based protection
- `middleware.ts` - Added role-based route protection
- `app/(auth)/login/page.tsx` - Updated with LoginForm
- `app/(auth)/register/page.tsx` - Updated with RegisterForm
- `package.json` - Added @supabase/ssr and @supabase/supabase-js
- `SUPABASE_SETUP.md` - Updated with new authentication features

## Next Steps

1. Configure Google OAuth in Supabase dashboard
2. Customize email templates
3. Add password reset functionality (if needed)
4. Add email verification flow customization
5. Implement additional OAuth providers (if needed)
