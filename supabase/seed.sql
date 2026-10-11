-- ==============================================================================
-- AIML HUB — SECTION A INITIAL SEED DATA
-- Safe, idempotent seed script for Semester & the 7 Fixed Subjects
-- ==============================================================================

DO $$
DECLARE
    v_semester_id UUID;
    v_def_id UUID;
    v_ds_id UUID;
    v_dms_id UUID;
    v_sfcds_id UUID;
    v_dbms_id UUID;
    v_oops_id UUID;
    v_ai_id UUID;
BEGIN
    -- 1. Insert or get Initial Semester
    SELECT id INTO v_semester_id FROM public.semesters 
    WHERE academic_year = '2025-2026' AND year_number = 2 AND semester_number = 1 AND section = 'Section A'
    LIMIT 1;

    IF v_semester_id IS NULL THEN
        INSERT INTO public.semesters (
            academic_year, year_number, semester_number, title, branch, section, display_order
        ) VALUES (
            '2025-2026', 2, 1, '2nd Year, 1st Semester', 'Artificial Intelligence and Machine Learning', 'Section A', 1
        ) RETURNING id INTO v_semester_id;
    END IF;

    -- 2. Insert or update the Exactly Seven Fixed Subjects
    -- Subject 1: DEF
    INSERT INTO public.subjects (semester_id, slug, subject_name, display_order, is_active)
    VALUES (v_semester_id, 'def', 'DEF', 1, TRUE)
    ON CONFLICT (slug) DO UPDATE SET 
        display_order = EXCLUDED.display_order
    RETURNING id INTO v_def_id;

    -- Subject 2: Data Structures
    INSERT INTO public.subjects (semester_id, slug, subject_name, display_order, is_active)
    VALUES (v_semester_id, 'data-structures', 'Data Structures', 2, TRUE)
    ON CONFLICT (slug) DO UPDATE SET 
        display_order = EXCLUDED.display_order
    RETURNING id INTO v_ds_id;

    -- Subject 3: DMS
    INSERT INTO public.subjects (semester_id, slug, subject_name, display_order, is_active)
    VALUES (v_semester_id, 'dms', 'DMS', 3, TRUE)
    ON CONFLICT (slug) DO UPDATE SET 
        display_order = EXCLUDED.display_order
    RETURNING id INTO v_dms_id;

    -- Subject 4: SFCDS
    INSERT INTO public.subjects (semester_id, slug, subject_name, display_order, is_active)
    VALUES (v_semester_id, 'sfcds', 'SFCDS', 4, TRUE)
    ON CONFLICT (slug) DO UPDATE SET 
        display_order = EXCLUDED.display_order
    RETURNING id INTO v_sfcds_id;

    -- Subject 5: Database Management Systems (DBMS)
    INSERT INTO public.subjects (semester_id, slug, subject_name, display_order, is_active)
    VALUES (v_semester_id, 'dbms', 'Database Management Systems (DBMS)', 5, TRUE)
    ON CONFLICT (slug) DO UPDATE SET 
        display_order = EXCLUDED.display_order
    RETURNING id INTO v_dbms_id;

    -- Subject 6: Object-Oriented Programming (OOPS)
    INSERT INTO public.subjects (semester_id, slug, subject_name, display_order, is_active)
    VALUES (v_semester_id, 'oops', 'Object-Oriented Programming (OOPS)', 6, TRUE)
    ON CONFLICT (slug) DO UPDATE SET 
        display_order = EXCLUDED.display_order
    RETURNING id INTO v_oops_id;

    -- Subject 7: Artificial Intelligence (AI)
    INSERT INTO public.subjects (semester_id, slug, subject_name, display_order, is_active)
    VALUES (v_semester_id, 'ai', 'Artificial Intelligence (AI)', 7, TRUE)
    ON CONFLICT (slug) DO UPDATE SET 
        display_order = EXCLUDED.display_order
    RETURNING id INTO v_ai_id;

    -- 3. Initial Units for subjects (if no units exist yet)
    IF NOT EXISTS (SELECT 1 FROM public.units WHERE subject_id = v_def_id) THEN
        INSERT INTO public.units (subject_id, unit_number, unit_title, display_order) VALUES
        (v_def_id, 1, 'Unit 1: Fundamentals & Introduction', 1),
        (v_def_id, 2, 'Unit 2: Core Concepts', 2),
        (v_def_id, 3, 'Unit 3: Theoretical Models', 3),
        (v_def_id, 4, 'Unit 4: Advanced Principles', 4),
        (v_def_id, 5, 'Unit 5: Applications & Case Studies', 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.units WHERE subject_id = v_ds_id) THEN
        INSERT INTO public.units (subject_id, unit_number, unit_title, display_order) VALUES
        (v_ds_id, 1, 'Unit 1: Linear Data Structures, Stacks & Queues', 1),
        (v_ds_id, 2, 'Unit 2: Linked Lists & Applications', 2),
        (v_ds_id, 3, 'Unit 3: Trees & Binary Search Trees', 3),
        (v_ds_id, 4, 'Unit 4: Graphs & Shortest Path Algorithms', 4),
        (v_ds_id, 5, 'Unit 5: Hashing, Searching & Sorting', 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.units WHERE subject_id = v_dms_id) THEN
        INSERT INTO public.units (subject_id, unit_number, unit_title, display_order) VALUES
        (v_dms_id, 1, 'Unit 1: Mathematical Logic & Predicates', 1),
        (v_dms_id, 2, 'Unit 2: Set Theory, Relations & Functions', 2),
        (v_dms_id, 3, 'Unit 3: Algebraic Structures & Lattices', 3),
        (v_dms_id, 4, 'Unit 4: Combinatorics & Recurrence Relations', 4),
        (v_dms_id, 5, 'Unit 5: Graph Theory & Trees', 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.units WHERE subject_id = v_sfcds_id) THEN
        INSERT INTO public.units (subject_id, unit_number, unit_title, display_order) VALUES
        (v_sfcds_id, 1, 'Unit 1: Foundations & Architecture', 1),
        (v_sfcds_id, 2, 'Unit 2: Core Computational Methods', 2),
        (v_sfcds_id, 3, 'Unit 3: Data Systems & Processing', 3),
        (v_sfcds_id, 4, 'Unit 4: Analytical Paradigms', 4),
        (v_sfcds_id, 5, 'Unit 5: Emerging Frontiers', 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.units WHERE subject_id = v_dbms_id) THEN
        INSERT INTO public.units (subject_id, unit_number, unit_title, display_order) VALUES
        (v_dbms_id, 1, 'Unit 1: Introduction to DBMS & Relational Model', 1),
        (v_dbms_id, 2, 'Unit 2: SQL & Relational Algebra', 2),
        (v_dbms_id, 3, 'Unit 3: Database Design & Normalization', 3),
        (v_dbms_id, 4, 'Unit 4: Transaction Management & Concurrency Control', 4),
        (v_dbms_id, 5, 'Unit 5: Indexing, B+ Trees & Query Optimization', 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.units WHERE subject_id = v_oops_id) THEN
        INSERT INTO public.units (subject_id, unit_number, unit_title, display_order) VALUES
        (v_oops_id, 1, 'Unit 1: OOP Paradigms & Classes', 1),
        (v_oops_id, 2, 'Unit 2: Inheritance & Polymorphism', 2),
        (v_oops_id, 3, 'Unit 3: Exception Handling & File I/O', 3),
        (v_oops_id, 4, 'Unit 4: Templates, Generics & Collections', 4),
        (v_oops_id, 5, 'Unit 5: Design Patterns & Best Practices', 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.units WHERE subject_id = v_ai_id) THEN
        INSERT INTO public.units (subject_id, unit_number, unit_title, display_order) VALUES
        (v_ai_id, 1, 'Unit 1: Introduction to AI & Intelligent Agents', 1),
        (v_ai_id, 2, 'Unit 2: Problem Solving by Search (DFS, BFS, A*)', 2),
        (v_ai_id, 3, 'Unit 3: Adversarial Search & Game Playing', 3),
        (v_ai_id, 4, 'Unit 4: Knowledge Representation & Logic', 4),
        (v_ai_id, 5, 'Unit 5: Probabilistic Reasoning & Learning Foundations', 5);
    END IF;

    -- 4. Initial Welcome Announcement
    IF NOT EXISTS (SELECT 1 FROM public.announcements WHERE title LIKE '%Welcome to AIML Hub%') THEN
        INSERT INTO public.announcements (
            title,
            content,
            is_important,
            is_published,
            published_at
        ) VALUES (
            'Welcome to AIML Hub — Section A!',
            'Welcome to the centralized academic resource portal for B.Tech AIML (II Year, I Semester). Access your syllabus, unit-wise notes, lecture presentations, previous question papers, and lab manuals from the subject dashboards.',
            TRUE,
            TRUE,
            NOW()
        );
    END IF;

END $$;
