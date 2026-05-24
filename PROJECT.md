# Gardening Business Management App — Project Description

## Overview

A mobile-first Progressive Web App (PWA) for managing a gardening business. Built with Next.js, hosted on Vercel, and backed by Supabase. Designed to be installed on iPhone home screen and feel like a native application.

**Primary goals:**
- Fast mobile UX
- Simple daily usage
- Minimal clicks
- Clear scheduling and job management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Hosting | Vercel |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password) |
| Calendar | FullCalendar |
| Forms | React Hook Form + Zod |
| Dates | date-fns |
| Icons | lucide-react |
| State | Zustand |

---

## Authentication

- Email/password login via Supabase Auth
- Persistent login session
- All routes protected — unauthenticated users redirected to `/login`
- Authenticated users redirected to `/calendar`

---

## Database

### TABLE: customers

```sql
create table customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  phone text not null,
  created_at timestamptz default now()
);
```

**Rules:**
- Every customer belongs to one authenticated user
- Users can only access their own customers
- Customers must be searchable by name or phone number

---

### TABLE: jobs

```sql
create table jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  customer_id uuid not null,
  date timestamptz not null,
  price numeric not null,
  description text,
  status text not null,
  recurrence_days int8,
  auto_generated boolean default false,
  parent_job_id uuid,
  recurring_group_id uuid,
  created_at timestamptz default now()
);
```

**Job Statuses:**

| Status | Description |
|---|---|
| `pending` | Waiting for approval |
| `approved` | Approved and waiting for execution |
| `completed` | Job completed successfully |
| `cancelled` | Job cancelled |

---

## Recurring Jobs System

Jobs may repeat automatically every X days (e.g. 7, 14, 30).

**Logic — when a recurring job is marked as completed:**
1. Current job status → `completed`
2. A new future job is automatically created with:
   - Same customer, price, description, recurrence_days
   - Date = current date + `recurrence_days`
   - Status = `pending`
   - `auto_generated` = `true`

**Weekend Rule:**
The business does not work on Friday or Saturday. If the computed next job date falls on Friday or Saturday, automatically move it to Sunday.

---

## Application Screens

### 1. Login Screen

- Fields: Email, Password
- Actions: Login / Logout
- Mobile-first, modern clean design
- Redirects authenticated users to `/calendar`

---

### 2. Calendar Screen (Main Screen)

- Views: Daily / Weekly / Monthly
- Add new job
- Open existing job
- Visual job status colors

**Job Colors:**

| Status | Color |
|---|---|
| pending | Yellow |
| approved | Blue |
| completed | Green |
| cancelled | Red |

---

### 3. Jobs By Status Screen

Four separate lists:
- Pending jobs
- Approved jobs
- Completed jobs
- Cancelled jobs

Each row displays: Customer name, Date, Price, Description, Phone number.
Sorted by ascending date. Mobile optimized.

---

### 4. Job Details Screen

**Displays:** Customer name, Phone number, Date, Price, Description, Recurrence interval, Current status.

**Status Action Buttons** (status changes only via action buttons, never the edit form):

| Current Status | Available Actions |
|---|---|
| pending | Approve Job / Cancel Job |
| approved | Mark as Completed / Cancel Job |
| completed | Restore to Approved |
| cancelled | Restore Job |

---

### 5. Edit Job Screen

**Editable fields:** Date, Price, Description, Recurrence days, Customer.

> ⚠️ Job status must NOT be editable from the edit form.

---

### 6. Customers Screen

- Search customers (by name or phone)
- Add customer
- Edit customer
- Open customer details page

---

### 7. Customer Details Screen

- Customer name, phone number, edit button
- All jobs related to this customer (all statuses), sorted by date
- Each job item is clickable

---

## Create Job Flow

1. Select customer
2. Select date
3. Enter price
4. Enter description
5. Enter recurrence days (optional)
6. Save → status defaults to **approved**

---

## Complete Job Flow

When a recurring job is marked as completed:
1. Current job → `completed`
2. New job auto-created → `pending`, `auto_generated: true`, date offset by `recurrence_days` (with weekend rule applied)

---

## Supabase / Security Requirements

- Row Level Security (RLS) enabled on all tables
- All queries filter by authenticated `user_id`
- Policies: users can only CREATE, READ, UPDATE, DELETE their own customers and jobs
- Zero cross-user data access

---

## Frontend Structure

```
app/
├── login/
├── calendar/
├── customers/
├── customers/[id]/
├── jobs/[id]/
├── components/
├── hooks/
├── services/
├── lib/
│   └── supabase.ts
├── types/
└── utils/
```

---

## PWA Requirements

- Installable to iPhone home screen
- Works in standalone mode
- Includes web manifest
- Includes app icons
- Supports responsive viewport settings
- Safari optimized

---

## Mobile UX Requirements

- Mobile-first design
- Large touch-friendly buttons
- Fast interactions, minimal clicks
- Smooth animations
- Clean, simple interface
- Safari optimized

---

## Future Features (Not in scope now)

- Push notifications
- WhatsApp integration
- Google Maps / Waze links
- Before/after job photos
- Invoice generation
- Revenue analytics
- Multi-worker support
- Google Calendar synchronization
- Dark mode
