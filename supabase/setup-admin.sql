-- ==============================================================================
-- AIML HUB — SECTION A INITIAL ADMIN SETUP SCRIPT
-- Sets up initial administrator user 'eswar' with temporary password '123098'
-- Run this script in the Supabase SQL Editor
-- ==============================================================================

-- 1. Helper function to lookup login email from username (Public/Security Definer)
-- This allows the frontend to let the admin log in with username "eswar"
CREATE OR REPLACE FUNCTION public.get_auth_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_email TEXT;
BEGIN
    SELECT u.email INTO v_email
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE LOWER(p.username) = LOWER(p_username)
    LIMIT 1;

    RETURN v_email;
END;
$$;

-- Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_auth_email_by_username(TEXT) TO anon, authenticated;

-- 2. Setup or Update the 'eswar' Admin Account
DO $$
DECLARE
    v_admin_id UUID;
    v_email TEXT := 'eswar@aimlhub.internal';
    v_temp_pass TEXT := '123098';
    v_encrypted_pass TEXT;
BEGIN
    -- Check if auth user already exists with this email
    SELECT id INTO v_admin_id FROM auth.users WHERE email = v_email;

    -- Generate blowfish bcrypt hash for password
    v_encrypted_pass := crypt(v_temp_pass, gen_salt('bf'));

    IF v_admin_id IS NULL THEN
        -- Generate new UUID for admin
        v_admin_id := gen_random_uuid();

        -- Insert into auth.users (Supabase Auth internal schema)
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            v_admin_id,
            '00000000-0000-0000-0000-000000000000',
            v_email,
            v_encrypted_pass,
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"username":"eswar","display_name":"Eswar (Administrator)","must_change_password":true}',
            FALSE,
            'authenticated'
        );

        -- Insert identity record for email login
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_admin_id,
            format('{"sub":"%s","email":"%s"}', v_admin_id::text, v_email)::jsonb,
            'email',
            NOW(),
            NOW(),
            NOW()
        );
    ELSE
        -- Update password and metadata if existing
        UPDATE auth.users
        SET encrypted_password = v_encrypted_pass,
            raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{must_change_password}', 'true'::jsonb),
            updated_at = NOW()
        WHERE id = v_admin_id;
    END IF;

    -- Upsert profile for eswar with role 'admin'
    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        v_admin_id,
        'eswar',
        'Eswar (Administrator)',
        'admin',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        username = 'eswar',
        role = 'admin',
        display_name = 'Eswar (Administrator)',
        updated_at = NOW();

    -- Log initial setup action in admin audit logs
    INSERT INTO public.admin_audit_logs (
        admin_user_id,
        action,
        target_type,
        target_id,
        details
    ) VALUES (
        v_admin_id,
        'SYSTEM_INITIALIZE_ADMIN',
        'admin_user',
        v_admin_id::text,
        '{"note":"Initial administrator account eswar configured"}'::jsonb
    );

END $$;
