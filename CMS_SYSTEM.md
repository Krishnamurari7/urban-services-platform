# Content Management System (CMS) - Documentation

## Overview

A comprehensive CMS system has been implemented that allows admins to edit all content on public pages and customer pages without touching code. All content is stored in the database and can be managed through the admin panel.

## Features

✅ **Universal Content Management**
- Edit any text, title, description on any page
- Support for text, HTML, JSON, and image URLs
- Content organized by page path and content key
- Fallback to default values if content not found

✅ **Admin Interface**
- Easy-to-use admin panel at `/admin/page-content`
- Tabbed interface for different pages
- Create, edit, and delete content
- Preview content before publishing
- Activate/deactivate content

✅ **Pages Supported**
- Homepage (Public)
- Customer Dashboard
- Book Service Page
- About Page
- Contact Page
- FAQ Page
- Help Center
- Become Professional Page

## Database Schema

### `page_contents` Table

```sql
- id: UUID (Primary Key)
- page_path: TEXT (e.g., "/", "/customer/dashboard")
- content_key: TEXT (e.g., "hero_title", "welcome_message")
- content_type: TEXT (text, html, json, image_url)
- content_value: TEXT (The actual content)
- content_json: JSONB (For complex structured content)
- display_order: INTEGER (Order of display)
- is_active: BOOLEAN (Active/Inactive)
- created_by: UUID (Admin who created)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## How to Use

### For Admins

1. **Access CMS Panel**
   - Login as admin
   - Navigate to `/admin/page-content`
   - Or click "Page Content" in admin sidebar

2. **Edit Content**
   - Select the page tab you want to edit
   - Click "Add Content" to create new content
   - Click "Edit" on existing content to modify
   - Fill in the form:
     - **Page Path**: The URL path (e.g., `/customer/dashboard`)
     - **Content Key**: Unique identifier (e.g., `welcome_message`)
     - **Content Type**: Choose text, HTML, JSON, or image URL
     - **Content Value**: The actual content
     - **Display Order**: Order for sorting
     - **Active**: Toggle to show/hide content

3. **Content Keys for Customer Dashboard**
   - `welcome_message` - Welcome message with user name
   - `hero_title` - Main hero title
   - `hero_description` - Hero section description
   - `popular_services_title` - Popular Services section title
   - `popular_services_description` - Popular Services description
   - `recent_bookings_title` - Recent Bookings section title
   - `recent_bookings_description` - Recent Bookings description

4. **Save Changes**
   - Click "Create" or "Update" button
   - Changes are immediately reflected on the page
   - Page is automatically revalidated

### For Developers

#### Server-Side Usage

```typescript
import { getPageContent, getPageContentWithFallback } from "@/lib/cms/page-content";

// Get content with fallback
const title = await getPageContentWithFallback(
  "/customer/dashboard",
  "hero_title",
  "Default Title"
);

// Get all content for a page
const contents = await getPageContents("/customer/dashboard");
```

#### Client-Side Usage

```typescript
import { usePageContent } from "@/lib/cms/client-page-content";

function MyComponent() {
  const { content, loading } = usePageContent(
    "/customer/dashboard",
    "welcome_message",
    "Welcome back!"
  );

  if (loading) return <div>Loading...</div>;
  
  return <div>{content}</div>;
}
```

## Migration

Run the migration to create the `page_contents` table:

```bash
# The migration file is located at:
supabase/migrations/013_page_contents.sql
```

Apply it through your Supabase dashboard or CLI.

## Security

- **RLS Policies**: Only active content is visible to public
- **Admin Only**: Only admins can create, update, or delete content
- **Validation**: Content is validated before saving
- **Audit Trail**: All content changes track the admin who made them

## Best Practices

1. **Content Keys**: Use descriptive, lowercase keys with underscores
   - ✅ Good: `welcome_message`, `hero_title`, `popular_services_description`
   - ❌ Bad: `msg1`, `title`, `desc`

2. **Page Paths**: Always use exact URL paths
   - ✅ Good: `/customer/dashboard`, `/about`
   - ❌ Bad: `dashboard`, `customer-dashboard`

3. **Content Types**:
   - Use `text` for simple text content
   - Use `html` for formatted content with HTML tags
   - Use `json` for structured data (arrays, objects)
   - Use `image_url` for image links

4. **Fallbacks**: Always provide default values in code
   - This ensures the page works even if CMS content is missing

## Example: Adding New Editable Content

### Step 1: Update Component

```tsx
"use client";

import { usePageContent } from "@/lib/cms/client-page-content";

export function MyComponent() {
  const { content: title } = usePageContent(
    "/customer/dashboard",
    "my_section_title",
    "Default Title" // Fallback
  );

  return <h1>{title}</h1>;
}
```

### Step 2: Admin Adds Content

1. Go to `/admin/page-content`
2. Select "Customer Dashboard" tab
3. Click "Add Content"
4. Fill in:
   - Page Path: `/customer/dashboard`
   - Content Key: `my_section_title`
   - Content Type: `text`
   - Content Value: `My Custom Title`
5. Click "Create"

The component will now display "My Custom Title" instead of "Default Title".

## Troubleshooting

### Content Not Showing

1. Check if content is marked as `is_active = true`
2. Verify the `page_path` matches exactly
3. Verify the `content_key` matches exactly
4. Check browser console for errors

### Changes Not Reflecting

1. Clear browser cache
2. Check if page revalidation is working
3. Verify RLS policies allow viewing

## Future Enhancements

- [ ] Rich text editor for HTML content
- [ ] Image upload functionality
- [ ] Content versioning
- [ ] Scheduled publishing
- [ ] Multi-language support
- [ ] Content templates
