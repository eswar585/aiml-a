# AIML Hub — Section A
> **Centralized Academic Resource Portal for B.Tech Artificial Intelligence & Machine Learning (2nd Year, 1st Semester, Section A)**  
> *Tagline: "Your Classroom. Your Resources. Your Success."*

---

## 🌟 Project Overview
**AIML Hub — Section A** is a modern, responsive, production-ready educational web platform designed specifically for 2nd Year, 1st Semester B.Tech AI & ML students. It centralizes all syllabus copies, unit-wise notes, lecture presentations (PPT/PPTX), Word documents (.docx), lab manuals, previous year question papers (PYQs), and class announcements into an organized, high-performance portal.

### Key Highlights
- **Student Portal**: Clean, fast, mobile-first academic resource dashboard. Free from administrative distractions (strictly no admin links or buttons displayed in public interface).
- **Admin Panel**: Separate, secure administrative console (`/admin-login` and `/admin/*`) protected by role-based authorization (Supabase Auth + PostgreSQL RLS).
- **File Management**: Direct integration with Supabase Storage (`aiml-resources` bucket) with drag-and-drop file upload, file validation, in-browser PDF & image previews, and authenticated download capabilities.
- **Fixed Academic Scope**: Exactly seven core subjects for II Year I Semester:
  1. `def`: **DEF**
  2. `data-structures`: **Data Structures**
  3. `dms`: **DMS**
  4. `sfcds`: **SFCDS**
  5. `dbms`: **Database Management Systems (DBMS)**
  6. `oops`: **Object-Oriented Programming (OOPS)**
  7. `ai`: **Artificial Intelligence (AI)**
  *(Note: DEF, DMS, and SFCDS abbreviations are strictly preserved without assumptions until updated officially by the administrator).*

---

## 🛠️ Technology Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom navy & brand palette, dark/light theme support, glassmorphism, and responsive breakpoints
- **Icons**: Lucide React
- **Routing**: React Router (with SPA rewrites for Vercel deployment)
- **Database**: Supabase PostgreSQL (9 relational tables with indexes and triggers)
- **Authentication**: Supabase Auth (with username-to-email mapping)
- **Storage**: Supabase Storage (`aiml-resources` bucket)
- **Deployment**: Vercel ready (`vercel.json`)

---

## 🗄️ Database Architecture & Migrations

All SQL migrations and setup scripts are located in the `supabase/` folder:
- `supabase/migrations/20250101_initial_schema.sql`: Full database schema, indexes, functions, triggers, and RLS policies.
- `supabase/seed.sql`: Idempotent seed data for semester record, the 7 fixed subjects, and default units.
- `supabase/setup-admin.sql`: Script to create initial administrator `eswar` with temporary password `123098` and the username-to-email lookup function.

### Relational Schema (9 Tables)
1. **`profiles`**: Linked to `auth.users.id`. Contains `username`, `display_name`, and `role` (`student` or `admin`). Prevents self-promotion via strict RLS.
2. **`semesters`**: Contains academic year (`2025-2026`), year number (`2`), semester (`1`), branch (`AIML`), and section (`Section A`).
3. **`subjects`**: Exactly seven subjects with slug uniqueness constraint, display order, official subject code, description, and faculty details.
4. **`units`**: Subject syllabus units (Unit 1, Unit 2, Unit 3, etc.) with custom titles and reordering.
5. **`resources`**: Study materials metadata (title, category, file name, storage path, mime type, file size, tags, download and view counts).
6. **`announcements`**: Official bulletin notices with important marker, published date, and optional expiry date.
7. **`resource_events`**: Analytics tracking views and downloads with database trigger updating counters.
8. **`bookmarks`**: Student-saved resources (authenticated or browser local storage).
9. **`admin_audit_logs`**: Log of administrative actions (uploads, edits, deletions).

---

## 🔐 Setup & Installation Guide

### Step 1: Clone and Install Dependencies
```bash
git clone <repository-url>
cd aiml-a
npm install
```

### Step 2: Configure Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project (e.g. `aiml-hub-sec-a`).
2. Navigate to **SQL Editor** in your Supabase project dashboard.
3. Run the schema migration script:
   - Copy contents of `supabase/migrations/20250101_initial_schema.sql` and click **Run**.
4. Run the seed script:
   - Copy contents of `supabase/seed.sql` and click **Run**.
5. Run the admin setup script:
   - Copy contents of `supabase/setup-admin.sql` and click **Run**.
   *(This initializes administrator `eswar` with temporary setup password `123098`).*

### Step 3: Configure Storage Bucket
The migration script automatically registers the `aiml-resources` bucket. Verify in **Storage**:
- Bucket Name: `aiml-resources`
- Public: `Enabled` (for student resource access)
- Policies: Public can read files; only administrators can insert, update, or delete.

### Step 4: Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-or-publishable-key
```

> **Note**: If `.env` is not set yet, AIML Hub automatically runs in **Offline/Demo Mode** with persistent browser storage, allowing you to test all student and admin workflows immediately!

### Step 5: Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Administrative Access & First-Time Login

- **Admin Login Route**: Navigate directly to `/admin-login` (Notice: there is strictly no admin link visible anywhere in the student portal).
- **Initial Setup Credentials**:
  - **Username**: `eswar`
  - **Password**: `123098`
- **First-Time Password Change Flow**:
  - Upon first login with `123098`, the system prompts you with a compulsory modal to set a new, strong personal password (minimum 6 characters).
  - Passwords are never stored in plain text or client localStorage; they are handled via Supabase Auth bcrypt encryption.

---

## 🚀 Deployment to Vercel

The application is pre-configured for seamless Vercel deployment with single-page app (SPA) rewrites.

### Method 1: Deploy with Vercel CLI
```bash
npm install -g vercel
vercel
```

### Method 2: Deploy via Vercel Dashboard
1. Push your repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/new), select **Add New Project** and import the repository.
3. Configure **Environment Variables**:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-or-publishable-key`
4. Click **Deploy**.

`vercel.json` ensures that refreshing routes like `/subjects/dbms` or `/admin/dashboard` never produces a 404:
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🧪 Acceptance Criteria Checklist

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Academic Header** | Displays B.Tech AIML, II Year, I Semester, Section A, 7 Subjects | Verified |
| **7 Subjects** | DEF, Data Structures, DMS, SFCDS, DBMS, OOPS, AI | Verified |
| **No Admin Links in Student UI** | `/admin-login` not exposed in public navbar, footer, or search | Verified |
| **Global Search** | Debounced search with Subject, Unit, and Category filters | Verified |
| **File Previews** | Embedded in-browser PDF viewer and image viewer with download options | Verified |
| **Unit Management** | Administrators can add, edit, reorder, and remove subject units | Verified |
| **Drag & Drop Upload** | Upload form validates MIME types and stores files in Supabase Storage | Verified |
| **Admin Login** | Username `eswar` with temporary password `123098` + password update flow | Verified |
| **Row Level Security** | RLS enabled across all 9 database tables | Verified |
| **Build & Compilation** | `npm run build` passes with zero errors | Verified |

---

## 📄 License
Educational use for B.Tech Artificial Intelligence & Machine Learning students, Section A.
