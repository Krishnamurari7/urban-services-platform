# Admin Panel Complete Guide
## सभी Admin Pages का Complete Documentation

---

## 📋 Table of Contents

1. [Dashboard](#1-dashboard)
2. [Users Management](#2-users-management)
3. [Professionals Management](#3-professionals-management)
4. [Services Management](#4-services-management)
5. [Bookings Management](#5-bookings-management)
6. [Payments Management](#6-payments-management)
7. [Reviews Management](#7-reviews-management)
8. [Disputes Management](#8-disputes-management)
9. [Banners Management](#9-banners-management)
10. [Sections Management](#10-sections-management)
11. [Page Content Management](#11-page-content-management)
12. [Audit Logs](#12-audit-logs)

---

## 1. Dashboard 📊

**URL:** `/admin/dashboard`

### क्या देख सकते हैं:
- **Total Users** - Platform पर कुल users की संख्या
- **Total Bookings** - कुल bookings की संख्या
- **Total Revenue** - कुल revenue (30 days)
- **Active Services** - Active services की संख्या
- **Booking Status Overview** - Status-wise booking counts:
  - Pending
  - Confirmed
  - In Progress
  - Completed
  - Cancelled
  - Refunded
- **Recent Bookings** - Latest 5 bookings की list

### क्या Edit कर सकते हैं:
- ❌ **कुछ नहीं** - यह सिर्फ analytics/view-only page है

### Features:
- Real-time statistics
- Visual cards with gradients
- Booking status breakdown
- Recent activity feed

---

## 2. Users Management 👥

**URL:** `/admin/users`

### क्या देख सकते हैं:
- **Statistics Cards:**
  - Total Users
  - Customers count
  - Professionals count
  - Active users
  - Inactive users

- **Users List:**
  - Name, Email, Phone
  - Role (Customer/Professional/Admin)
  - Booking counts
  - Status (Active/Pending/Suspended)
  - Join date
  - Verification status

- **Separate Sections:**
  - Customers table
  - Professionals table
  - All users table

### क्या Edit कर सकते हैं:
- ✅ **User Status:**
  - Suspend user (is_active = false)
  - Activate user (is_active = true)
- ✅ **View User Details:**
  - Click "View Details" to see full profile
  - URL: `/admin/users/[id]`

### Actions Available:
- **Suspend User** - User account को suspend करें
- **Activate User** - Suspended account को activate करें
- **View Details** - Complete user profile देखें

---

## 3. Professionals Management 👤

**URL:** `/admin/professionals`

### क्या देख सकते हैं:
- **Professional List:**
  - Name, Email, Phone
  - Bio, Skills, Experience
  - Rating & Reviews count
  - Hourly rate
  - Verification status
  - Documents status
  - Booking statistics

- **Document Verification:**
  - Document type
  - Document name
  - File URL
  - Verification status
  - Rejection reason (if rejected)

### क्या Edit कर सकते हैं:
- ✅ **Professional Verification:**
  - Approve professional (is_verified = true)
  - Reject professional (is_verified = false)
- ✅ **Professional Status:**
  - Suspend professional
  - Activate professional
- ✅ **View Details:**
  - URL: `/admin/professionals/[id]`

### Actions Available:
- **Approve Professional** - Professional को verify करें
- **Reject Professional** - Professional application reject करें
- **Suspend/Activate** - Account status change करें

---

## 4. Services Management 🔧

**URL:** `/admin/services`

### क्या देख सकते हैं:
- **Services List:**
  - Service name
  - Category
  - Base price
  - Duration (minutes)
  - Status (active/suspended/inactive)

### क्या Edit कर सकते हैं:
- ✅ **Create New Service:**
  - Service name
  - Category
  - Description
  - Base price
  - Duration
  - Status
- ✅ **Edit Existing Service:**
  - All above fields
- ✅ **Delete Service:**
  - Permanent deletion with confirmation

### Form Fields:
- Name (required)
- Category (dropdown)
- Description
- Base Price (₹)
- Duration (minutes)
- Status (active/suspended/inactive)

---

## 5. Bookings Management 📅

**URL:** `/admin/bookings`

### क्या देख सकते हैं:
- **Status Summary Cards:**
  - Pending bookings
  - Confirmed bookings
  - In Progress bookings
  - Completed bookings
  - Cancelled bookings
  - Refunded bookings

- **Bookings Table:**
  - Booking ID
  - Customer details (name, phone)
  - Professional details (name, phone)
  - Service name & category
  - Scheduled date & time
  - Amount (final_amount)
  - Service fee
  - Booking status
  - Payment status
  - Created date

### क्या Edit कर सकते हैं:
- ✅ **View Booking Details:**
  - URL: `/admin/bookings/[id]`
  - Complete booking information
  - Payment details
  - Status updates
- ✅ **Change Booking Status** (via detail page)
- ✅ **Process Refunds** (via detail page)

### Features:
- Mobile-responsive card view
- Desktop table view
- Status filtering
- Click to view full details

---

## 6. Payments Management 💰

**URL:** `/admin/payments`

### क्या देख सकते हैं:
- **Statistics:**
  - Total Revenue (all time)
  - Platform Commission (service fees)
  - Completed payments count
  - Refunded payments count

- **Payments Table:**
  - Transaction ID
  - Customer name
  - Service name
  - Amount
  - Commission (service fee)
  - Payment method
  - Payment status
  - Date

### क्या Edit कर सकते हैं:
- ❌ **Direct editing नहीं** - Payments view-only हैं
- ✅ **Refunds process कर सकते हैं** (via Disputes page)

### Payment Statuses:
- Completed
- Pending
- Failed
- Refunded

---

## 7. Reviews Management ⭐

**URL:** `/admin/reviews`

### क्या देख सकते हैं:
- **Statistics:**
  - Total Reviews
  - Visible Reviews
  - Hidden Reviews
  - Pending Reviews (unverified)

- **Reviews List:**
  - Customer name
  - Professional name
  - Service name
  - Rating (stars)
  - Comment
  - Verification status
  - Visibility status
  - Created date

### क्या Edit कर सकते हैं:
- ✅ **Approve Review:**
  - Mark as verified (is_verified = true)
  - Make visible (is_visible = true)
- ✅ **Reject Review:**
  - Hide from public (is_visible = false)
- ✅ **Hide/Show Review:**
  - Toggle visibility
  - Hide inappropriate content
  - Show approved reviews

### Actions Available:
- **Approve** - Review को verify करें और show करें
- **Reject** - Review को hide करें
- **Hide** - Temporarily hide करें
- **Show** - Hidden review को show करें

---

## 8. Disputes Management ⚖️

**URL:** `/admin/disputes`

### क्या देख सकते हैं:
- **Statistics:**
  - Pending Disputes count
  - Resolved Disputes count
  - Total Refunded amount

- **Pending Disputes:**
  - Booking details
  - Customer & Professional info
  - Service name
  - Cancellation reason
  - Amount to refund

- **Refund History:**
  - Payment ID
  - Customer name
  - Service name
  - Original amount
  - Refund amount
  - Refund reason
  - Refund date

### क्या Edit कर सकते हैं:
- ✅ **Process Refund:**
  - Refund amount process करें
  - Payment status update करें
- ✅ **Resolve Dispute:**
  - Dispute को resolve mark करें
  - Status update करें

### Actions Available:
- **Process Refund** - Refund process करें
- **Resolve Dispute** - Dispute को resolve mark करें

---

## 9. Banners Management 🎨

**URL:** `/admin/banners`

### क्या देख सकते हैं:
- **Active Banners:**
  - Banner image preview
  - Title
  - Description
  - Position number
  - Status

- **Inactive Banners:**
  - Same details as active
  - Grayed out display

### क्या Edit कर सकते हैं:
- ✅ **Create New Banner:**
  - Title
  - Description
  - Image URL
  - CTA (Call-to-Action) text
  - CTA link
  - Position (display order)
  - Active status
- ✅ **Edit Existing Banner:**
  - All above fields
- ✅ **Activate/Deactivate:**
  - Toggle is_active status

### Form Fields:
- Title (required)
- Description
- Image URL
- CTA Text
- CTA Link
- Position (number)
- Active (checkbox)

---

## 10. Sections Management 📄

**URL:** `/admin/sections`

### क्या देख सकते हैं:
- **Quick Access Buttons:**
  - Edit Hero Section → `/admin/sections/hero`
  - Edit Services Section → `/admin/sections/services`
  - Edit Features Section → `/admin/sections/features`
  - Edit CTA Section → `/admin/sections/cta`

- **Active Sections:**
  - Section type
  - Title, Subtitle
  - Description
  - Content (JSON)
  - Display order
  - Status

- **Inactive Sections:**
  - Same details
  - Grayed out

### क्या Edit कर सकते हैं:
- ✅ **Create New Section:**
  - Section type (hero/services/features/cta)
  - Title
  - Subtitle
  - Description
  - Content (JSON format)
  - Display order
  - Active status
- ✅ **Edit Existing Section:**
  - All above fields
- ✅ **Section-Specific Editors:**
  - Hero Section Editor (`/admin/sections/hero`)
  - Services Section Editor (`/admin/sections/services`)
  - Features Section Editor (`/admin/sections/features`)
  - CTA Section Editor (`/admin/sections/cta`)

### Section Types:
1. **Hero** - Homepage hero section
2. **Services** - Services showcase section
3. **Features** - Features list section
4. **CTA** - Call-to-action section

---

## 11. Page Content Management ✏️

**URL:** `/admin/page-content`

### क्या देख सकते हैं:
- **Page Tabs:**
  - Homepage (Public) - `/`
  - Customer Dashboard - `/customer/dashboard`
  - Book Service Page - `/customer/book-service`
  - About Page - `/about`
  - Contact Page - `/contact`
  - FAQ Page - `/faq`
  - Help Center - `/help-center`
  - Become Professional - `/become-professional`

- **Content List per Page:**
  - Content key
  - Content type (text/html/image_url)
  - Content value
  - Display order
  - Active status

### क्या Edit कर सकते हैं:
- ✅ **Create New Content:**
  - Page Path (auto-filled from tab)
  - Content Key (unique identifier)
  - Content Type (text/html/image_url)
  - Content Value (actual content)
  - Display Order
  - Active status
- ✅ **Edit Existing Content:**
  - All above fields
- ✅ **Delete Content:**
  - Remove content permanently
- ✅ **Visual Editors:**
  - Homepage Editor (visual interface)
  - Customer Dashboard Editor (visual interface)

### Content Types:
- **text** - Plain text content
- **html** - HTML formatted content
- **image_url** - Image link

### Common Content Keys:
**Homepage:**
- `hero_title`
- `hero_description`
- `hero_cta_text`
- `services_title`
- `services_description`
- `features_title`
- `features_description`

**Customer Dashboard:**
- `welcome_message`
- `hero_title`
- `hero_description`
- `popular_services_title`
- `popular_services_description`
- `recent_bookings_title`
- `recent_bookings_description`

---

## 12. Audit Logs 📋

**URL:** `/admin/audit-logs`

### क्या देख सकते हैं:
- **All Admin Actions:**
  - Timestamp
  - Admin name (who performed action)
  - Action type
  - Target type (user/service/booking/etc.)
  - Target ID
  - Description
  - User Agent
  - IP Address
  - Metadata (JSON)

### क्या Edit कर सकते हैं:
- ❌ **कुछ नहीं** - यह read-only log है
- ✅ **View Details:**
  - Click eye icon to see full details
  - View metadata
  - View IP address & user agent

### Action Types Tracked:
- `user_suspended`
- `user_activated`
- `service_created`
- `service_updated`
- `service_deleted`
- `booking_cancelled`
- `payment_refunded`
- `other`

### Features:
- Search functionality
- Filter by action type
- Detailed view modal
- Real-time updates

---

## 🔐 Access Control

### Admin Role Required:
सभी admin pages के लिए `role = "admin"` required है। Non-admin users को automatically redirect किया जाता है `/dashboard` पर।

### Authentication:
- Login required
- Session-based authentication
- Automatic redirect if not authenticated

---

## 📱 Responsive Design

सभी admin pages mobile-responsive हैं:
- Mobile: Card-based layout
- Tablet: Grid layout
- Desktop: Full table view

---

## 🎨 UI Features

- **Gradient Cards** - Beautiful color gradients
- **Status Badges** - Color-coded status indicators
- **Hover Effects** - Interactive elements
- **Loading States** - Smooth loading indicators
- **Toast Notifications** - Success/error messages
- **Confirmation Dialogs** - For destructive actions

---

## 🔄 Common Actions Across Pages

### Create:
- Click "Add" or "Create" button
- Fill form
- Submit

### Edit:
- Click "Edit" button on item
- Modify form fields
- Save changes

### Delete:
- Click "Delete" button
- Confirm in dialog
- Item removed

### Activate/Deactivate:
- Toggle switch or button
- Status updated immediately

---

## 📊 Summary Table

| Page | URL | Can Edit? | Main Features |
|------|-----|-----------|----------------|
| Dashboard | `/admin/dashboard` | ❌ No | View analytics only |
| Users | `/admin/users` | ✅ Yes | Suspend/Activate users |
| Professionals | `/admin/professionals` | ✅ Yes | Approve/Reject, Suspend/Activate |
| Services | `/admin/services` | ✅ Yes | Create/Edit/Delete services |
| Bookings | `/admin/bookings` | ✅ Yes | View details, Change status |
| Payments | `/admin/payments` | ❌ No | View payments only |
| Reviews | `/admin/reviews` | ✅ Yes | Approve/Reject, Hide/Show |
| Disputes | `/admin/disputes` | ✅ Yes | Process refunds, Resolve disputes |
| Banners | `/admin/banners` | ✅ Yes | Create/Edit banners |
| Sections | `/admin/sections` | ✅ Yes | Create/Edit homepage sections |
| Page Content | `/admin/page-content` | ✅ Yes | Edit all page content |
| Audit Logs | `/admin/audit-logs` | ❌ No | View logs only |

---

## 🚀 Quick Navigation

### Most Used Pages:
1. **Dashboard** - `/admin/dashboard` - Quick overview
2. **Users** - `/admin/users` - Manage users
3. **Services** - `/admin/services` - Manage services
4. **Bookings** - `/admin/bookings` - View bookings
5. **Page Content** - `/admin/page-content` - Edit website content

### Content Management:
- **Banners** - `/admin/banners` - Homepage banners
- **Sections** - `/admin/sections` - Homepage sections
- **Page Content** - `/admin/page-content` - All page content

### Moderation:
- **Reviews** - `/admin/reviews` - Moderate reviews
- **Disputes** - `/admin/disputes` - Handle disputes
- **Professionals** - `/admin/professionals` - Verify professionals

---

## 📝 Notes

1. **All changes are logged** in Audit Logs
2. **Confirmation required** for destructive actions
3. **Real-time updates** after changes
4. **Mobile-friendly** interface
5. **Search & Filter** available on most pages

---

**Last Updated:** 2024  
**Version:** 1.0
