-- Quick fix for real-time messaging issues
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their messages" ON messages;

-- 3. Create proper policies
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their messages" ON messages
    FOR DELETE USING (auth.uid() = sender_id);

-- 4. Add messages table to real-time publication (only if not already there)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    ELSE
        RAISE NOTICE 'Messages table is already in real-time publication';
    END IF;
END $$;

-- 5. Grant permissions
GRANT ALL ON messages TO authenticated;

-- 6. Verify the setup
SELECT 
    'RLS Status' as check_type,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables 
WHERE tablename = 'messages'

UNION ALL

SELECT 
    'Real-time Publication' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN 'ENABLED' ELSE 'DISABLED' END as status

UNION ALL

SELECT 
    'Policies Count' as check_type,
    COUNT(*)::text as status
FROM pg_policies 
WHERE tablename = 'messages'; 