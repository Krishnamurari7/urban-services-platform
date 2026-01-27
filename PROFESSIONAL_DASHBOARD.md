# Professional Dashboard Documentation

This document describes the Professional Dashboard features and setup instructions.

## Features Implemented

### ✅ Job Requests Management
- View all job requests assigned to the professional
- Filter bookings by status (all, pending, confirmed, in_progress, completed)
- Accept/reject pending job requests
- Update job status (Start Job, Mark as Completed)
- View detailed booking information including customer details, address, and special instructions

### ✅ Job Status Updates
- Accept pending bookings (changes status to "confirmed")
- Reject pending bookings (changes status to "cancelled")
- Start confirmed jobs (changes status to "in_progress")
- Mark jobs as completed (changes status to "completed" and sets completed_at timestamp)

### ✅ Availability Calendar
- View all availability slots
- Add new availability slots with date, start time, and end time
- Support for recurring weekly slots
- Delete available slots
- Visual grouping by date
- Status indicators (available, booked, unavailable)

### ✅ Earnings Dashboard
- Total earnings overview
- Weekly, monthly, and yearly earnings breakdown
- Average earnings per job
- Monthly earnings breakdown chart (last 6 months)
- Recent payments list
- Period selector (week/month/year)

### ✅ Document Verification Upload
- Upload verification documents (ID Proof, Certificates, Licenses, Background Checks)
- View uploaded documents with status (pending, approved, rejected)
- Document status tracking
- File size validation (max 10MB)
- Support for multiple file formats (PDF, JPG, PNG, DOC, DOCX)

## Database Schema

### New Table: `professional_documents`
Created via migration `006_document_verification.sql`

```sql
CREATE TABLE professional_documents (
  id UUID PRIMARY KEY,
  professional_id UUID REFERENCES profiles(id),
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Setup Instructions

### 1. Run Database Migration

Apply the document verification migration:

```bash
# Using Supabase CLI
supabase migration up

# Or manually run the SQL file in Supabase SQL Editor
# File: supabase/migrations/006_document_verification.sql
```

### 2. Create Storage Bucket

The document upload feature requires a Supabase Storage bucket. Create it in the Supabase Dashboard:

1. Go to **Storage** in your Supabase project
2. Click **New bucket**
3. Name: `professional-documents`
4. Make it **Public** (or configure RLS policies for private access)
5. Click **Create bucket**

### 3. Configure Storage Policies (Optional)

If you want private storage, add RLS policies:

```sql
-- Allow professionals to upload their own documents
CREATE POLICY "Professionals can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'professional-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow professionals to view their own documents
CREATE POLICY "Professionals can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'professional-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. Earnings Calculation

The earnings dashboard calculates professional earnings as **80% of the final booking amount**. This can be adjusted in the `EarningsDashboard` component:

```typescript
const PROFESSIONAL_CUT = 0.8; // Change this value as needed
```

## Component Structure

```
components/professional/
├── job-requests-section.tsx      # Job requests with accept/reject
├── availability-calendar.tsx      # Availability management
├── earnings-dashboard.tsx         # Earnings overview and analytics
└── document-verification.tsx      # Document upload and verification
```

## Usage

### Accessing the Dashboard

Navigate to `/professional/dashboard` (requires professional role authentication).

### Tab Navigation

The dashboard has 5 main tabs:
1. **Overview** - Stats and recent bookings
2. **Job Requests** - Manage incoming job requests
3. **Availability** - Manage availability calendar
4. **Earnings** - View earnings and analytics
5. **Documents** - Upload and manage verification documents

### Accepting/Rejecting Jobs

1. Go to **Job Requests** tab
2. Find pending bookings
3. Click **Accept** to confirm or **Reject** to decline
4. Status updates automatically

### Updating Job Status

1. For confirmed bookings, click **Start Job** to change status to "in_progress"
2. For in-progress bookings, click **Mark as Completed** to finish the job

### Managing Availability

1. Go to **Availability** tab
2. Click **Add Slot**
3. Select date, start time, and end time
4. Optionally enable recurring weekly slots
5. Click **Add Slot** to save

### Uploading Documents

1. Go to **Documents** tab
2. Click **Upload Document**
3. Select document type
4. Enter document name
5. Choose file (max 10MB)
6. Click **Upload**

Documents will be reviewed by admins and status will be updated accordingly.

## API Integration

All features use Supabase client-side queries with RLS policies for security:

- **Bookings**: Filtered by `professional_id = auth.uid()`
- **Availability Slots**: Filtered by `professional_id = auth.uid()`
- **Documents**: Filtered by `professional_id = auth.uid()`
- **Payments**: Filtered through booking relationships

## Security

- All queries use Row Level Security (RLS)
- Professionals can only view/modify their own data
- Document uploads are scoped to the authenticated professional
- File size validation prevents oversized uploads

## Future Enhancements

Potential improvements:
- Real-time notifications for new job requests
- Calendar view for availability
- Export earnings reports
- Bulk availability slot creation
- Document preview before upload
- Integration with payment processing
