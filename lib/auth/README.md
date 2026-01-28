# Authentication Guide

This directory contains authentication utilities for the Urban Services Platform.

## Quick Start

### 1. Environment Setup

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Server-Side Usage

#### Get Current User

```tsx
import { getCurrentUser } from "@/lib/auth/session";

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <div>Welcome, {user.email}</div>;
}
```

#### Require Authentication

```tsx
import { requireAuth } from "@/lib/auth/session";

export default async function Page() {
  // Throws error if not authenticated
  const user = await requireAuth();

  return <div>Protected content</div>;
}
```

#### Require Specific Role

```tsx
import { requireRole } from "@/lib/auth/session";

export default async function AdminPage() {
  // Throws error if not admin
  const user = await requireRole("admin");

  return <div>Admin only content</div>;
}
```

### 3. Client-Side Usage

#### Using Auth Context

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

#### Using Protected Route Component

```tsx
"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <div>Customer dashboard content</div>
    </ProtectedRoute>
  );
}
```

### 4. Server Actions

#### Sign In

```tsx
"use server";

import { signIn } from "@/lib/auth/actions";

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await signIn(email, password);

  if (result?.error) {
    // Handle error
    return { error: result.error };
  }

  // User is redirected automatically
}
```

#### Sign Up

```tsx
"use server";

import { signUp } from "@/lib/auth/actions";

export async function handleSignUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  const result = await signUp(email, password, {
    full_name: fullName,
    role: "customer", // or "professional" or "admin"
  });

  if (result?.error) {
    return { error: result.error };
  }

  // User is redirected automatically
}
```

#### Sign Out

```tsx
"use server";

import { signOut } from "@/lib/auth/actions";

export async function handleSignOut() {
  await signOut();
  // User is redirected automatically
}
```

## Files Overview

- **`session.ts`** - Server-side session helpers
  - `getSession()` - Get current session
  - `getCurrentUser()` - Get current user
  - `hasRole()` - Check user role
  - `requireAuth()` - Require authentication
  - `requireRole()` - Require specific role

- **`actions.ts`** - Server actions for auth operations
  - `signIn()` - Sign in user
  - `signUp()` - Sign up new user
  - `signOut()` - Sign out user
  - `getSession()` - Get current session

## Role-Based Access Control

Roles are stored in either:

1. User metadata (`user.user_metadata.role`)
2. A separate `user_roles` table (recommended for production)

To use the `user_roles` table approach, create the table in Supabase:

```sql
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'professional', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);
```

## Middleware Protection

Routes are automatically protected by middleware. See `middleware.ts` for configuration.

Protected routes:

- `/dashboard`
- `/bookings`
- `/services`
- `/profile`
- `/users` (admin only)

Public routes:

- `/`
- `/about`
- `/login`
- `/register`
