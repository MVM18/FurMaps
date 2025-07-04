-- Check current real-time messaging setup
-- Run this to see what's currently configured

-- 1. Check RLS status
SELECT 
    'RLS Status' as check_type,
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables 
WHERE tablename = 'messages';

-- 2. Check existing policies
SELECT 
    'Policy' as check_type,
    policyname,
    cmd as operation,
    permissive as is_permissive
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd;

-- 3. Check real-time publication
SELECT 
    'Real-time Publication' as check_type,
    pubname,
    tablename,
    'ENABLED' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'messages';

-- 4. Check permissions
SELECT 
    'Permission' as check_type,
    grantee,
    privilege_type,
    'GRANTED' as status
FROM information_schema.role_table_grants 
WHERE table_name = 'messages' AND grantee = 'authenticated';

-- 5. Check recent messages (if any)
SELECT 
    'Recent Messages' as check_type,
    COUNT(*) as message_count,
    MAX(created_at) as latest_message
FROM messages;

-- 6. Check if real-time is enabled in Supabase
SELECT 
    'Supabase Real-time' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime'
        ) THEN 'ENABLED'
        ELSE 'DISABLED'
    END as status; 