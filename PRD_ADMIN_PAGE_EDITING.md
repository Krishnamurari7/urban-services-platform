# Product Requirements Document (PRD)
## Admin Page Editing System

**Document Version:** 1.0  
**Date:** 2024  
**Status:** Current Implementation + Future Enhancements

---

## 1. Executive Summary

यह PRD document admin के लिए page editing system की comprehensive requirements को define करता है। Current system में basic CMS functionality है, और यह document existing features को document करता है तथा future enhancements के लिए roadmap provide करता है।

---

## 2. Problem Statement

### Current Challenges:
- Admins को page content edit करने के लिए developers पर depend करना पड़ता था
- Simple text changes के लिए भी code changes की जरूरत थी
- Content updates में time लगता था
- Non-technical admins के लिए content management difficult था

### Solution:
एक comprehensive CMS system जो admins को code के बिना सभी pages का content edit करने की capability देता है।

---

## 3. Current System Overview

### 3.1 Existing Features ✅

#### **Page Content Management**
- **Location:** `/admin/page-content`
- **Access:** Admin role required
- **Functionality:**
  - Create, Edit, Delete page content
  - Content organized by page path और content key
  - Support for multiple content types: text, HTML, image URLs
  - Activate/Deactivate content
  - Display order management

#### **Supported Pages:**
1. **Homepage (Public)** - `/`
2. **Customer Dashboard** - `/customer/dashboard`
3. **Book Service Page** - `/customer/book-service`
4. **About Page** - `/about`
5. **Contact Page** - `/contact`
6. **FAQ Page** - `/faq`
7. **Help Center** - `/help-center`
8. **Become Professional** - `/become-professional`

#### **Section Management**
- **Location:** `/admin/sections`
- **Sections:**
  - Hero Section
  - Services Section
  - Features Section
  - CTA Section

#### **Banner Management**
- **Location:** `/admin/banners`
- Create और manage banners

### 3.2 Database Schema

```sql
-- page_contents table
CREATE TABLE page_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content_type TEXT DEFAULT 'text', -- text, html, image_url
  content_value TEXT,
  content_json JSONB,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page_path, content_key)
);
```

---

## 4. User Stories

### 4.1 Admin User Stories

#### **US-1: Content Editing**
**As an** admin  
**I want to** edit text content on any page  
**So that** I can update information without developer help

**Acceptance Criteria:**
- ✅ Admin can access `/admin/page-content`
- ✅ Admin can select any page from tabs
- ✅ Admin can edit existing content
- ✅ Admin can create new content
- ✅ Changes reflect immediately on the page

#### **US-2: Content Organization**
**As an** admin  
**I want to** organize content by page and content key  
**So that** I can easily find and manage specific content

**Acceptance Criteria:**
- ✅ Content is grouped by page path
- ✅ Each content has a unique key identifier
- ✅ Content can be sorted by display order
- ✅ Content can be activated/deactivated

#### **US-3: Multiple Content Types**
**As an** admin  
**I want to** use different content types (text, HTML, images)  
**So that** I can create rich content

**Acceptance Criteria:**
- ✅ Support for plain text
- ✅ Support for HTML content
- ✅ Support for image URLs
- ✅ Proper validation for each type

#### **US-4: Visual Page Editors**
**As an** admin  
**I want to** use visual editors for homepage and dashboard  
**So that** I can see what I'm editing

**Acceptance Criteria:**
- ✅ Homepage has dedicated visual editor
- ✅ Customer Dashboard has dedicated visual editor
- ✅ Other pages use standard form editor

---

## 5. Functional Requirements

### 5.1 Core Features

#### **FR-1: Page Content CRUD**
- **Create:** Admin can create new content for any page
- **Read:** Admin can view all content organized by page
- **Update:** Admin can edit existing content
- **Delete:** Admin can delete content (with confirmation)

#### **FR-2: Content Types**
1. **Text:** Plain text content
2. **HTML:** Formatted HTML content
3. **Image URL:** Link to images

#### **FR-3: Content Management**
- Content keys must be unique per page
- Display order for sorting
- Active/Inactive toggle
- Created/Updated timestamps
- Created by tracking

#### **FR-4: Page Organization**
- Tabbed interface for main pages
- Sub-pages grouped under main pages
- Easy navigation between pages

### 5.2 User Interface Requirements

#### **UI-1: Admin Dashboard**
- Clean, intuitive interface
- Responsive design (mobile-friendly)
- Clear navigation
- Visual feedback for actions

#### **UI-2: Content Forms**
- Clear form labels
- Input validation
- Error messages
- Success notifications
- Loading states

#### **UI-3: Content List**
- Table/Card view of content
- Search functionality
- Filter by page
- Sort by display order

### 5.3 Security Requirements

#### **SEC-1: Access Control**
- Only admin role can access
- Authentication required
- Session management

#### **SEC-2: Data Validation**
- Input sanitization
- XSS prevention
- SQL injection prevention
- Content type validation

#### **SEC-3: Audit Trail**
- Track who created content
- Track who updated content
- Timestamp all changes

---

## 6. User Flows

### 6.1 Edit Existing Content Flow

```
1. Admin logs in
2. Navigate to /admin/page-content
3. Select page tab (e.g., "Homepage")
4. Click "Edit" on content item
5. Modal/form opens with current content
6. Admin modifies content
7. Admin clicks "Update"
8. Success message shown
9. Page refreshes with updated content
10. Changes visible on public page
```

### 6.2 Create New Content Flow

```
1. Admin logs in
2. Navigate to /admin/page-content
3. Select page tab
4. Click "Add Content" button
5. Fill form:
   - Page Path (auto-filled for tab)
   - Content Key (unique identifier)
   - Content Type (text/html/image_url)
   - Content Value
   - Display Order
   - Active status
6. Click "Create"
7. Success message shown
8. New content appears in list
9. Content visible on page
```

### 6.3 Delete Content Flow

```
1. Admin logs in
2. Navigate to /admin/page-content
3. Select page tab
4. Click "Delete" on content item
5. Confirmation dialog appears
6. Admin confirms deletion
7. Content removed from database
8. Success message shown
9. Page refreshes
10. Content no longer visible on page
```

---

## 7. Technical Specifications

### 7.1 Architecture

#### **Frontend:**
- Next.js 14+ (App Router)
- React Server Components
- Client Components for interactive elements
- Tailwind CSS for styling
- shadcn/ui components

#### **Backend:**
- Supabase (PostgreSQL database)
- Server Actions for mutations
- Row Level Security (RLS) policies
- Real-time updates capability

#### **Key Files:**
```
app/admin/page-content/
├── page.tsx                    # Main page component
├── actions.ts                   # Server actions (CRUD)
├── page-content-form.tsx        # Content form component
├── page-content-tabs.tsx        # Tab navigation
├── home-page-editor.tsx         # Visual homepage editor
└── customer-dashboard-editor.tsx # Visual dashboard editor
```

### 7.2 API/Server Actions

#### **createPageContent**
```typescript
async function createPageContent(data: {
  page_path: string;
  content_key: string;
  content_type?: string;
  content_value?: string;
  display_order?: number;
  is_active?: boolean;
})
```

#### **updatePageContent**
```typescript
async function updatePageContent(
  id: string,
  data: {
    content_value?: string;
    content_type?: string;
    display_order?: number;
    is_active?: boolean;
  }
)
```

#### **deletePageContent**
```typescript
async function deletePageContent(id: string)
```

#### **getPageContentsForAdmin**
```typescript
async function getPageContentsForAdmin()
```

### 7.3 Client-Side Hooks

#### **usePageContent Hook**
```typescript
function usePageContent(
  pagePath: string,
  contentKey: string,
  fallback: string
)
```

### 7.4 Server-Side Utilities

#### **getPageContentWithFallback**
```typescript
async function getPageContentWithFallback(
  pagePath: string,
  contentKey: string,
  fallback: string
): Promise<string>
```

---

## 8. Content Keys Reference

### 8.1 Homepage (`/`)
- `hero_title` - Main hero title
- `hero_description` - Hero section description
- `hero_cta_text` - Call-to-action button text
- `services_title` - Services section title
- `services_description` - Services section description
- `features_title` - Features section title
- `features_description` - Features section description

### 8.2 Customer Dashboard (`/customer/dashboard`)
- `welcome_message` - Welcome message with user name
- `hero_title` - Main hero title
- `hero_description` - Hero section description
- `popular_services_title` - Popular Services section title
- `popular_services_description` - Popular Services description
- `recent_bookings_title` - Recent Bookings section title
- `recent_bookings_description` - Recent Bookings description

### 8.3 Other Pages
- Each page can have custom content keys
- Keys should follow naming convention: `section_element` (e.g., `hero_title`, `footer_copyright`)

---

## 9. Future Enhancements (Roadmap)

### 9.1 Phase 1: Enhanced Editing (Priority: High)

#### **FR-5: Rich Text Editor**
- **Description:** WYSIWYG editor for HTML content
- **Benefits:** Easier formatting, no HTML knowledge needed
- **Implementation:**
  - Integrate TinyMCE or similar
  - Support for bold, italic, links, lists
  - Image insertion capability

#### **FR-6: Image Upload**
- **Description:** Direct image upload instead of URLs
- **Benefits:** Better image management
- **Implementation:**
  - Supabase Storage integration
  - Image optimization
  - CDN delivery

#### **FR-7: Content Preview**
- **Description:** Preview content before publishing
- **Benefits:** See changes before going live
- **Implementation:**
  - Modal preview
  - Side-by-side comparison
  - Mobile preview

### 9.2 Phase 2: Advanced Features (Priority: Medium)

#### **FR-8: Content Versioning**
- **Description:** Track content history and rollback
- **Benefits:** Undo mistakes, see change history
- **Implementation:**
  - Version table
  - Diff view
  - Rollback functionality

#### **FR-9: Scheduled Publishing**
- **Description:** Schedule content to go live at specific time
- **Benefits:** Plan content updates
- **Implementation:**
  - Scheduled jobs
  - Cron integration
  - Notification system

#### **FR-10: Multi-language Support**
- **Description:** Manage content in multiple languages
- **Benefits:** Internationalization
- **Implementation:**
  - Language selector
  - Translation management
  - Language-specific content keys

#### **FR-11: Content Templates**
- **Description:** Pre-defined content templates
- **Benefits:** Faster content creation
- **Implementation:**
  - Template library
  - Template application
  - Custom templates

### 9.3 Phase 3: Analytics & Optimization (Priority: Low)

#### **FR-12: Content Analytics**
- **Description:** Track content performance
- **Benefits:** Data-driven content decisions
- **Implementation:**
  - View counts
  - Engagement metrics
  - A/B testing

#### **FR-13: SEO Management**
- **Description:** Manage meta tags, descriptions
- **Benefits:** Better search rankings
- **Implementation:**
  - Meta tag editor
  - SEO preview
  - Schema markup

#### **FR-14: Bulk Operations**
- **Description:** Edit multiple content items at once
- **Benefits:** Time-saving for large updates
- **Implementation:**
  - Multi-select
  - Bulk edit form
  - Batch operations

---

## 10. Success Metrics

### 10.1 Key Performance Indicators (KPIs)

1. **Time to Update Content**
   - Target: < 5 minutes for simple text changes
   - Current: Achieved ✅

2. **Admin Adoption Rate**
   - Target: 80% of admins use CMS monthly
   - Measurement: Track admin logins to `/admin/page-content`

3. **Content Update Frequency**
   - Target: 10+ content updates per week
   - Measurement: Track create/update operations

4. **Error Rate**
   - Target: < 1% of operations fail
   - Measurement: Track failed operations

5. **User Satisfaction**
   - Target: 4+ out of 5 rating
   - Measurement: Admin feedback surveys

---

## 11. Non-Functional Requirements

### 11.1 Performance
- Page load time: < 2 seconds
- Content update time: < 1 second
- Support for 1000+ content items

### 11.2 Reliability
- 99.9% uptime
- Automatic backups
- Data recovery capability

### 11.3 Usability
- Intuitive interface (no training required)
- Mobile-responsive design
- Accessibility compliance (WCAG 2.1 AA)

### 11.4 Scalability
- Support for unlimited pages
- Support for unlimited content per page
- Efficient database queries

---

## 12. Risk Assessment

### 12.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database performance issues | High | Low | Indexing, query optimization |
| Security vulnerabilities | High | Medium | Regular security audits, input validation |
| Data loss | High | Low | Automated backups, versioning |

### 12.2 User Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Accidental content deletion | Medium | Medium | Confirmation dialogs, versioning |
| Incorrect content updates | Medium | High | Preview feature, validation |
| Learning curve | Low | Medium | Intuitive UI, documentation |

---

## 13. Dependencies

### 13.1 External Dependencies
- Supabase (Database & Auth)
- Next.js Framework
- React Library
- Tailwind CSS

### 13.2 Internal Dependencies
- Admin authentication system
- User role management
- Page routing system

---

## 14. Testing Requirements

### 14.1 Unit Tests
- Server actions testing
- Utility functions testing
- Component testing

### 14.2 Integration Tests
- CRUD operations flow
- Authentication flow
- Permission checks

### 14.3 User Acceptance Tests
- Admin user workflows
- Content editing scenarios
- Error handling scenarios

---

## 15. Documentation Requirements

### 15.1 User Documentation
- ✅ Admin user guide (CMS_SYSTEM.md)
- Admin training materials
- Video tutorials

### 15.2 Technical Documentation
- ✅ API documentation
- Database schema documentation
- Architecture diagrams

### 15.3 Content Guidelines
- Content key naming conventions
- Best practices guide
- Content style guide

---

## 16. Implementation Timeline

### Phase 1: Current System ✅
- ✅ Basic CMS implementation
- ✅ Page content CRUD
- ✅ Admin interface
- ✅ Visual editors for homepage/dashboard

### Phase 2: Enhanced Editing (Q1 2024)
- Rich text editor integration
- Image upload functionality
- Content preview feature

### Phase 3: Advanced Features (Q2 2024)
- Content versioning
- Scheduled publishing
- Multi-language support

### Phase 4: Analytics & Optimization (Q3 2024)
- Content analytics
- SEO management
- Bulk operations

---

## 17. Approval & Sign-off

**Product Owner:** _________________  
**Tech Lead:** _________________  
**Design Lead:** _________________  
**Date:** _________________

---

## 18. Appendix

### 18.1 Glossary
- **CMS:** Content Management System
- **Content Key:** Unique identifier for content within a page
- **Page Path:** URL path of the page (e.g., `/customer/dashboard`)
- **RLS:** Row Level Security (Supabase feature)
- **WYSIWYG:** What You See Is What You Get

### 18.2 References
- CMS_SYSTEM.md - Technical documentation
- Supabase Documentation
- Next.js Documentation

### 18.3 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2024 | Initial PRD creation | AI Assistant |

---

**End of Document**
