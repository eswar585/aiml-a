-- ==============================================================================
-- AIML HUB — SECTION A DATABASE SCHEMA MIGRATION
-- B.Tech Artificial Intelligence and Machine Learning (2nd Year, 1st Semester)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Helper function to check if current authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- ------------------------------------------------------------------------------
-- 2. SEMESTERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year TEXT NOT NULL DEFAULT '2025-2026',
    year_number INT NOT NULL DEFAULT 2,
    semester_number INT NOT NULL DEFAULT 1,
    title TEXT NOT NULL DEFAULT '2nd Year, 1st Semester',
    branch TEXT NOT NULL DEFAULT 'Artificial Intelligence and Machine Learning',
    section TEXT NOT NULL DEFAULT 'Section A',
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. SUBJECTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    subject_name TEXT NOT NULL,
    official_subject_code TEXT,
    description TEXT,
    faculty_name TEXT,
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subjects_slug ON public.subjects(slug);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester_id);

-- ------------------------------------------------------------------------------
-- 4. UNITS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    unit_number INT NOT NULL,
    unit_title TEXT NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_units_subject ON public.units(subject_id);

-- ------------------------------------------------------------------------------
-- 5. RESOURCES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    archived_at TIMESTAMPTZ,
    exam_year TEXT,
    faculty_contributor TEXT,
    download_count INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_subject ON public.resources(subject_id);
CREATE INDEX IF NOT EXISTS idx_resources_unit ON public.resources(unit_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_published ON public.resources(is_published, archived_at);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON public.resources USING gin(tags);

-- ------------------------------------------------------------------------------
-- 6. ANNOUNCEMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_important BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_published ON public.announcements(is_published, published_at);

-- ------------------------------------------------------------------------------
-- 7. RESOURCE EVENTS (ANALYTICS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resource_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'download')),
    user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_events_resource ON public.resource_events(resource_id);

-- Function & Trigger to increment download or view count on resource
CREATE OR REPLACE FUNCTION public.handle_resource_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.event_type = 'download' THEN
        UPDATE public.resources SET download_count = download_count + 1 WHERE id = NEW.resource_id;
    ELSIF NEW.event_type = 'view' THEN
        UPDATE public.resources SET view_count = view_count + 1 WHERE id = NEW.resource_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_resource_event_count ON public.resource_events;
CREATE TRIGGER trg_resource_event_count
AFTER INSERT ON public.resource_events
FOR EACH ROW
EXECUTE FUNCTION public.handle_resource_event();

-- ------------------------------------------------------------------------------
-- 8. BOOKMARKS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- ------------------------------------------------------------------------------
-- 9. ADMIN AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
-- Users can read their own profile; admins can read all profiles
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Users can update only their display_name, never their role
CREATE POLICY "Users can update own display_name" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Only admins can change roles
CREATE POLICY "Admins full manage profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- 2. SEMESTERS POLICIES
-- Public read
CREATE POLICY "Public read semesters" ON public.semesters
    FOR SELECT USING (true);

-- Admin manage semesters
CREATE POLICY "Admins manage semesters" ON public.semesters
    FOR ALL USING (public.is_admin());

-- 3. SUBJECTS POLICIES
-- Public read active subjects; admins see all
CREATE POLICY "Public read active subjects" ON public.subjects
    FOR SELECT USING (is_active = true OR public.is_admin());

-- Admin manage subjects
CREATE POLICY "Admins manage subjects" ON public.subjects
    FOR ALL USING (public.is_admin());

-- 4. UNITS POLICIES
-- Public read units
CREATE POLICY "Public read units" ON public.units
    FOR SELECT USING (true);

-- Admin manage units
CREATE POLICY "Admins manage units" ON public.units
    FOR ALL USING (public.is_admin());

-- 5. RESOURCES POLICIES
-- Public read published & unarchived resources; admins see all
CREATE POLICY "Public read published resources" ON public.resources
    FOR SELECT USING ((is_published = true AND archived_at IS NULL) OR public.is_admin());

-- Admin insert, update, delete resources
CREATE POLICY "Admins manage resources" ON public.resources
    FOR ALL USING (public.is_admin());

-- 6. ANNOUNCEMENTS POLICIES
-- Public read published & non-expired announcements; admins see all
CREATE POLICY "Public read active announcements" ON public.announcements
    FOR SELECT USING (
        (is_published = true AND (expires_at IS NULL OR expires_at > NOW()))
        OR public.is_admin()
    );

-- Admin manage announcements
CREATE POLICY "Admins manage announcements" ON public.announcements
    FOR ALL USING (public.is_admin());

-- 7. RESOURCE EVENTS POLICIES
-- Anyone can insert event (tracking a view/download)
CREATE POLICY "Allow tracking resource events" ON public.resource_events
    FOR INSERT WITH CHECK (true);

-- Admins can read analytics
CREATE POLICY "Admins read resource events" ON public.resource_events
    FOR SELECT USING (public.is_admin());

-- 8. BOOKMARKS POLICIES
-- Authenticated users manage their own bookmarks
CREATE POLICY "Users read own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own bookmarks" ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own bookmarks" ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- 9. AUDIT LOGS POLICIES
-- Admins can view and insert audit logs
CREATE POLICY "Admins view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins insert audit logs" ON public.admin_audit_logs
    FOR INSERT WITH CHECK (public.is_admin() OR auth.uid() IS NOT NULL);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION & POLICIES
-- ==============================================================================
-- Run these in Supabase SQL editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('aiml-resources', 'aiml-resources', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies:
-- 1. Public can read files from aiml-resources bucket
CREATE POLICY "Public read aiml-resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'aiml-resources');

-- 2. Only admins can upload files
CREATE POLICY "Admin upload aiml-resources"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'aiml-resources' AND public.is_admin());

-- 3. Only admins can update files
CREATE POLICY "Admin update aiml-resources"
ON storage.objects FOR UPDATE
USING (bucket_id = 'aiml-resources' AND public.is_admin());

-- 4. Only admins can delete files
CREATE POLICY "Admin delete aiml-resources"
ON storage.objects FOR DELETE
USING (bucket_id = 'aiml-resources' AND public.is_admin());
