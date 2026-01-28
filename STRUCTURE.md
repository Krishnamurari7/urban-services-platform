# Project Structure

This document outlines the scalable folder structure for the Urban Services Platform, a service marketplace with three user roles: Customer, Professional, and Admin.

## Folder Structure

```
urban-services-platform/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes (no authentication required)
│   │   ├── layout.tsx           # Public layout
│   │   ├── page.tsx             # Home page (/)
│   │   └── about/               # About page (/about)
│   │       └── page.tsx
│   │
│   ├── (auth)/                   # Authentication routes
│   │   ├── layout.tsx           # Auth layout (centered form layout)
│   │   ├── login/               # Login page (/login)
│   │   │   └── page.tsx
│   │   └── register/            # Registration page (/register)
│   │       └── page.tsx
│   │
│   ├── (customer)/               # Customer routes (protected)
│   │   ├── layout.tsx           # Customer layout with navigation
│   │   ├── dashboard/           # Customer dashboard (/customer/dashboard)
│   │   │   └── page.tsx
│   │   ├── bookings/            # Customer bookings
│   │   │   ├── page.tsx         # List bookings (/customer/bookings)
│   │   │   └── [id]/           # Booking detail (/customer/bookings/:id)
│   │   │       └── page.tsx
│   │   └── services/            # Browse services (/customer/services)
│   │       └── page.tsx
│   │
│   ├── (professional)/          # Professional routes (protected)
│   │   ├── layout.tsx           # Professional layout with navigation
│   │   ├── dashboard/           # Professional dashboard (/professional/dashboard)
│   │   │   └── page.tsx
│   │   ├── services/            # Manage services (/professional/services)
│   │   │   └── page.tsx
│   │   ├── bookings/            # Manage bookings (/professional/bookings)
│   │   │   └── page.tsx
│   │   └── profile/             # Professional profile (/professional/profile)
│   │       └── page.tsx
│   │
│   ├── (admin)/                 # Admin routes (protected, admin only)
│   │   ├── layout.tsx           # Admin layout with navigation
│   │   ├── dashboard/           # Admin dashboard (/admin/dashboard)
│   │   │   └── page.tsx
│   │   ├── users/               # User management (/admin/users)
│   │   │   └── page.tsx
│   │   ├── services/            # Service management (/admin/services)
│   │   │   └── page.tsx
│   │   └── bookings/            # Booking management (/admin/bookings)
│   │       └── page.tsx
│   │
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   │   └── route.ts
│   │   ├── users/               # User management endpoints
│   │   │   └── route.ts
│   │   ├── services/            # Service endpoints
│   │   │   └── route.ts
│   │   └── bookings/            # Booking endpoints
│   │       └── route.ts
│   │
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   └── button.tsx
│   ├── layout/                  # Layout components
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── auth/                    # Authentication components
│   │   └── login-form.tsx
│   ├── customer/                # Customer-specific components
│   │   └── booking-card.tsx
│   ├── professional/            # Professional-specific components
│   │   └── service-card.tsx
│   ├── admin/                   # Admin-specific components
│   │   └── user-table.tsx
│   └── index.ts                 # Component exports
│
├── lib/                         # Utility libraries
│   ├── api/                     # API client functions
│   ├── constants/               # App constants
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   ├── utils.ts                 # Common utilities (cn, etc.)
│   └── validations/             # Validation schemas
│
├── types/                       # Global TypeScript types
├── hooks/                       # Custom React hooks
├── middleware.ts                # Next.js middleware (route protection)
└── public/                      # Static assets
```

## Route Groups

Route groups in Next.js App Router are created using parentheses `(groupName)`. They allow you to:

- Organize routes without affecting the URL structure
- Apply different layouts to different route groups
- Share layouts between multiple routes

### Route Group URLs

- `(public)` routes: `/`, `/about`
- `(auth)` routes: `/login`, `/register`
- `(customer)` routes: `/customer/dashboard`, `/customer/bookings`, etc.
- `(professional)` routes: `/professional/dashboard`, `/professional/services`, etc.
- `(admin)` routes: `/admin/dashboard`, `/admin/users`, etc.

**Note:** The route group name `(customer)` does NOT appear in the URL. The actual URL structure depends on the folder names inside the route group.

## Component Organization

Components are organized by feature/domain:

- `ui/` - Reusable, generic UI components
- `layout/` - Layout-related components (header, footer, sidebar)
- `auth/` - Authentication-related components
- `customer/` - Customer-specific components
- `professional/` - Professional-specific components
- `admin/` - Admin-specific components

## Next Steps

1. **Authentication**: Implement authentication logic in `middleware.ts` to protect routes
2. **API Routes**: Implement actual API logic in `app/api/` routes
3. **Components**: Build out the component library as needed
4. **Types**: Define TypeScript interfaces in `lib/types/` and `types/`
5. **Validations**: Add form validation schemas in `lib/validations/`

## Route Protection

Update `middleware.ts` to protect routes based on user roles:

- `(customer)/*` - Requires customer role
- `(professional)/*` - Requires professional role
- `(admin)/*` - Requires admin role
- `(auth)/*` - Redirect authenticated users away
