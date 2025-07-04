-- Test and debug real-time messaging issues

-- 1. Check if real-time is enabled for messages table
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'messages';

-- 2. Check current RLS policies on messages
SELECT 
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'messages';

-- 3. Check if messages table is in real-time publication
SELECT 
    pubname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'messages';

-- 4. Test inserting a message manually (replace with actual user IDs)
-- This will help verify if the issue is with RLS or real-time
-- INSERT INTO messages (sender_id, receiver_id, content, type) 
-- VALUES ('your-sender-id', 'your-receiver-id', 'Test message', 'text');

-- 5. Check if there are any existing messages
SELECT 
    id,
    sender_id,
    receiver_id,
    content,
    created_at
FROM messages 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Verify permissions
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'messages' AND grantee = 'authenticated'; 