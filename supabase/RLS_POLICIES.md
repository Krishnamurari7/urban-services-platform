# Row Level Security (RLS) Policies Documentation

This document describes the comprehensive RLS policies implemented for the Urban Services Platform, ensuring strict role-based access control.

## Overview

The RLS policies enforce three distinct access levels:

- **Customer**: Access only to their own data
- **Professional**: Access only to assigned jobs/bookings
- **Admin**: Full access to all data

## Security Functions

To prevent RLS recursion issues, we use security definer functions that bypass RLS:

- `is_admin(user_id UUID)`: Checks if a user has admin role
- `is_customer(user_id UUID)`: Checks if a user has customer role
- `is_professional(user_id UUID)`: Checks if a user has professional role

These functions use `SECURITY DEFINER` to bypass RLS when checking user roles.

## Policy Breakdown by Table

### 1. Profiles Table

**Customer Access:**

- ✅ View own profile
- ✅ Update own profile
- ❌ Cannot view other profiles (except active professionals)
- ❌ Cannot delete profiles

**Professional Access:**

- ✅ View own profile
- ✅ Update own profile
- ✅ View other active professionals (for booking purposes)
- ❌ Cannot view customer profiles
- ❌ Cannot delete profiles

**Admin Access:**

- ✅ View all profiles
- ✅ Update all profiles
- ✅ Delete profiles

**Public Access:**

- ✅ View active professionals (for service discovery)

---

### 2. Services Table

**Customer/Professional Access:**

- ✅ View active services (public catalog)
- ❌ Cannot create, update, or delete services

**Admin Access:**

- ✅ View all services (including inactive/suspended)
- ✅ Create services
- ✅ Update services
- ✅ Delete services

---

### 3. Professional Services Table

**Customer Access:**

- ✅ View available professional services (for booking)
- ❌ Cannot manage professional services

**Professional Access:**

- ✅ View own services
- ✅ Create own services
- ✅ Update own services
- ✅ Delete own services
- ❌ Cannot access other professionals' services

**Admin Access:**

- ✅ Full access to all professional services

---

### 4. Addresses Table

**Customer Access:**

- ✅ View own addresses
- ✅ Create own addresses
- ✅ Update own addresses
- ✅ Delete own addresses
- ❌ Cannot access other users' addresses

**Professional Access:**

- ✅ View own addresses
- ✅ Create own addresses
- ✅ Update own addresses
- ✅ Delete own addresses
- ❌ Cannot access other users' addresses

**Admin Access:**

- ✅ Full access to all addresses

---

### 5. Bookings Table

**Customer Access:**

- ✅ View own bookings
- ✅ Create bookings (as customer)
- ✅ Update own pending bookings
- ✅ Cancel own bookings (pending or confirmed status)
- ❌ Cannot view other customers' bookings
- ❌ Cannot modify bookings after confirmation

**Professional Access:**

- ✅ View bookings assigned to them (`professional_id = auth.uid()`)
- ✅ Update assigned bookings (status changes: confirmed, in_progress, completed, cancelled)
- ❌ Cannot view bookings assigned to other professionals
- ❌ Cannot create bookings
- ❌ Cannot delete bookings

**Admin Access:**

- ✅ View all bookings
- ✅ Create bookings
- ✅ Update all bookings
- ✅ Delete bookings

---

### 6. Payments Table

**Customer Access:**

- ✅ View own payments (`customer_id = auth.uid()`)
- ❌ Cannot create, update, or delete payments
- ⚠️ Payment creation should be done via service role or admin

**Professional Access:**

- ❌ Cannot access payments (no direct access)
- ⚠️ Professionals can see payment info through bookings if needed

**Admin Access:**

- ✅ View all payments
- ✅ Create payments
- ✅ Update all payments
- ✅ Delete payments

---

### 7. Reviews Table

**Customer Access:**

- ✅ View visible reviews (public)
- ✅ View own reviews (even if not visible)
- ✅ Create reviews for completed bookings
- ✅ Update own reviews
- ✅ Delete own reviews
- ❌ Cannot view other customers' private reviews

**Professional Access:**

- ✅ View visible reviews (public)
- ✅ View reviews about them (`professional_id = auth.uid()`)
- ❌ Cannot create, update, or delete reviews

**Admin Access:**

- ✅ View all reviews (including non-visible)
- ✅ Create reviews
- ✅ Update all reviews
- ✅ Delete reviews

**Public Access:**

- ✅ View visible reviews (`is_visible = true`)

---

### 8. Availability Slots Table

**Customer Access:**

- ✅ View available slots (for booking)
- ❌ Cannot manage availability slots

**Professional Access:**

- ✅ View own availability slots
- ✅ Create own availability slots
- ✅ Update own availability slots
- ✅ Delete own availability slots
- ❌ Cannot access other professionals' availability

**Admin Access:**

- ✅ Full access to all availability slots

**Public Access:**

- ✅ View available slots (`status = 'available'`)

---

### 9. Admin Actions Table

**Customer/Professional Access:**

- ❌ No access to admin actions (audit log)

**Admin Access:**

- ✅ View all admin actions
- ✅ Create admin actions
- ✅ Update admin actions
- ✅ Delete admin actions

---

## Security Best Practices

### 1. Principle of Least Privilege

- Each role has the minimum permissions necessary
- Customers can only access their own data
- Professionals can only access assigned bookings
- Admins have full access but should use it responsibly

### 2. Data Isolation

- Customer data is strictly isolated
- Professionals cannot see other professionals' bookings
- No cross-customer data leakage

### 3. Audit Trail

- Admin actions are logged in `admin_actions` table
- Only admins can view audit logs

### 4. Payment Security

- Customers cannot create or modify payments directly
- Payment operations should use service role key
- Admins can manage payments for support purposes

### 5. Review Integrity

- Customers can only review their own completed bookings
- Reviews are public by default but can be hidden
- Admins can moderate all reviews

## Testing RLS Policies

To test RLS policies:

1. **Test as Customer:**

   ```sql
   -- Should only see own bookings
   SELECT * FROM bookings WHERE customer_id = auth.uid();
   ```

2. **Test as Professional:**

   ```sql
   -- Should only see assigned bookings
   SELECT * FROM bookings WHERE professional_id = auth.uid();
   ```

3. **Test as Admin:**
   ```sql
   -- Should see all bookings
   SELECT * FROM bookings;
   ```

## Migration Order

1. `001_initial_schema.sql` - Creates tables and initial RLS
2. `002_fix_rls_recursion.sql` - Fixes recursion with `is_admin()` function
3. `003_comprehensive_rls_policies.sql` - Comprehensive strict policies (this migration)

## Notes

- All policies use `auth.uid()` to identify the current user
- Policies are evaluated in order (first matching policy applies)
- `WITH CHECK` clauses ensure data integrity on INSERT/UPDATE
- `USING` clauses control SELECT/UPDATE/DELETE visibility
- Security definer functions prevent infinite recursion in RLS checks

## Troubleshooting

If you encounter issues:

1. **RLS Recursion:** Ensure you're using the security definer functions (`is_admin()`, `is_customer()`, `is_professional()`)

2. **Access Denied:** Check that:
   - User has the correct role in `profiles` table
   - User is authenticated (`auth.uid()` is not null)
   - Policy conditions match your use case

3. **Missing Policies:** Verify all tables have appropriate policies for your use case

4. **Performance:** RLS policies can impact query performance. Use indexes on columns used in policy conditions (e.g., `customer_id`, `professional_id`).
