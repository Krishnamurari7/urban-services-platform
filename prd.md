Role & Mindset

You are a Senior Full-Stack Architect & Lead Developer with experience building scalable service marketplaces like Urban Company.
Your task is to design and implement an end-to-end production-ready platform, considering UI/UX, security, scalability, performance, and business logic.

🎯 Project Goal

Build a service marketplace platform (Urban Company–like) where:

Users can book home services

Professionals can accept jobs

Admins can manage everything centrally

The system must be fully role-based, secure, and scalable, using Next.js + Supabase.

🧱 Tech Stack (Mandatory)

Frontend: Next.js (App Router), TypeScript

Styling: Tailwind CSS + Shadcn UI

Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions)

Auth: Supabase Auth (Email, OTP, Social login ready)

State: Server Components + Client Components (minimal global state)

Payments: Razorpay (service booking payments)

Deployment: Vercel + Supabase

Security: RLS (Row Level Security), API protection

👥 User Roles (Strict Role-Based System)
1️⃣ Customer

Sign up / login

Browse services (AC Repair, Cleaning, Salon, etc.)

Select service → choose date/time → address

Book & pay

Track booking status

Rate & review professional

View booking history

Manage profile & addresses

2️⃣ Service Professional

Sign up with verification details

Upload documents (ID, certificates)

Select service categories

Availability management

Accept / reject jobs

Job status updates (Accepted → On the Way → Completed)

Wallet & earnings dashboard

Ratings & performance metrics

3️⃣ Admin

Dashboard analytics

Approve / reject professionals

Manage services & pricing

Assign professionals manually (if needed)

View all bookings

Handle disputes & refunds

Manage commissions

User & professional management

CMS for banners & homepage content

🔐 Authentication & Authorization

Supabase Auth with:

Email + Password

OTP login

Role stored in profiles table

Middleware-based route protection

Server-side session validation

Admin-only routes enforced

Secure logout & session refresh

🗂️ Database Design (Supabase – PostgreSQL)
Core Tables:

profiles (user_id, role, name, phone, verified)

services (id, name, category, price, duration)

bookings (customer_id, professional_id, status, payment_status)

professional_services

availability_slots

addresses

payments

reviews

admin_actions

Requirements:

Proper indexing

Foreign keys

RLS policies per role

Audit logs for admin actions

🧭 Application Pages & Flows
Public Pages

Home (Hero, categories, trust badges)

Service Listing

Service Detail Page (very detailed like Urban Company)

Become a Professional

Login / Register

Customer Panel

Dashboard

Book Service Flow (multi-step)

My Bookings

Wallet / Payments

Profile & Address Management

Professional Panel

Dashboard

Job Requests

Active Jobs

Earnings

Availability

Profile Verification

Admin Panel

Analytics Dashboard

Booking Control

Professional Approval

Payments & Commission

CMS Controls

💳 Payment & Business Logic

Razorpay integration

Advance payment / full payment

Platform commission deduction

Refund handling

Payment failure recovery

Secure webhook handling (Edge Functions)

🧠 Advanced Features

Real-time booking updates (Supabase Realtime)

Notification system (Email + WhatsApp ready)

Rating & review moderation

Search & filter (location, rating, price)

SEO-optimized service pages

Performance optimization (ISR, caching)

Error handling & logging

🎨 UI / UX Expectations

Premium, minimal, Urban Company–style UI

Mobile-first responsive design

Skeleton loaders

Smooth animations

Clear CTAs

Accessibility compliance

📦 Deliverables

Folder structure (production-ready)

Supabase SQL schema

RLS policies

Auth flow implementation

Booking & payment logic

Admin dashboard architecture

Deployment instructions

Security best practices