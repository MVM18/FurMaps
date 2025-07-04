-- Fix real-time messaging issues

-- First, let's check if RLS is enabled on messages table
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'messages';

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'messages';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;

-- Create new, more permissive policies for real-time to work
-- Policy for viewing messages (users can see messages they sent or received)
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

-- Policy for inserting messages (users can send messages)
CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

-- Policy for updating messages (users can update their own messages)
CREATE POLICY "Users can update their messages" ON messages
    FOR UPDATE USING (
        auth.uid() = sender_id
    );

-- Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Grant necessary permissions
GRANT ALL ON messages TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Test query to ensure policies work
-- This should return messages for the current user
SELECT * FROM messages 
WHERE auth.uid() = sender_id OR auth.uid() = receiver_id
LIMIT 5; 