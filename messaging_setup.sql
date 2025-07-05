-- Messaging System Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    content TEXT,
    type TEXT DEFAULT 'text',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- 3. Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;

-- 5. Create RLS policies
-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can insert messages (only as sender)
CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages
CREATE POLICY "Users can update their messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- 6. Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-images', 
    'chat-images', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 7. Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view chat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;

-- 8. Create storage policies
-- Anyone can view chat images
CREATE POLICY "Anyone can view chat images" ON storage.objects
    FOR SELECT USING (bucket_id = 'chat-images');

-- Authenticated users can upload chat images
CREATE POLICY "Authenticated users can upload chat images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'chat-images' 
        AND auth.role() = 'authenticated'
        AND (storage.extension(name))::text IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
    );

-- Users can delete their own uploaded images
CREATE POLICY "Users can delete their chat images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'chat-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 9. Ensure real-time is enabled for messages table
-- Check if messages table is in real-time publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
END $$;

-- 10. Add helpful comments
COMMENT ON TABLE messages IS 'Stores chat messages between users';
COMMENT ON COLUMN messages.sender_id IS 'Reference to the sender profile (profiles.user_id)';
COMMENT ON COLUMN messages.receiver_id IS 'Reference to the receiver profile (profiles.user_id)';
COMMENT ON COLUMN messages.content IS 'Text content of the message';
COMMENT ON COLUMN messages.type IS 'Message type: text or image';
COMMENT ON COLUMN messages.image_url IS 'URL of the image if type is image';
COMMENT ON COLUMN messages.created_at IS 'Timestamp when message was created';

-- 11. Create a function to get conversation participants
CREATE OR REPLACE FUNCTION get_conversation_participants(user_id UUID)
RETURNS TABLE(participant_id UUID, participant_name TEXT, last_message TEXT, last_message_time TIMESTAMPTZ, unread_count BIGINT)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    WITH conversation_participants AS (
        SELECT 
            CASE 
                WHEN sender_id = user_id THEN receiver_id 
                ELSE sender_id 
            END as participant_id,
            MAX(created_at) as last_message_time
        FROM messages 
        WHERE sender_id = user_id OR receiver_id = user_id
        GROUP BY participant_id
    ),
    participant_details AS (
        SELECT 
            cp.participant_id,
            p.first_name || ' ' || p.last_name as participant_name,
            cp.last_message_time,
            m.content as last_message,
            COUNT(CASE WHEN m.sender_id = cp.participant_id AND m.created_at > COALESCE(
                (SELECT MAX(created_at) FROM messages WHERE sender_id = user_id AND receiver_id = cp.participant_id), 
                '1970-01-01'::timestamptz
            ) THEN 1 END) as unread_count
        FROM conversation_participants cp
        LEFT JOIN profiles p ON p.user_id = cp.participant_id
        LEFT JOIN messages m ON m.id = (
            SELECT id FROM messages 
            WHERE (sender_id = cp.participant_id AND receiver_id = user_id) 
               OR (sender_id = user_id AND receiver_id = cp.participant_id)
            ORDER BY created_at DESC 
            LIMIT 1
        )
        GROUP BY cp.participant_id, p.first_name, p.last_name, cp.last_message_time, m.content
    )
    SELECT 
        participant_id,
        participant_name,
        last_message,
        last_message_time,
        unread_count
    FROM participant_details
    ORDER BY last_message_time DESC;
$$;

-- 12. Create a function to mark messages as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(user_id UUID, other_user_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
    -- This function can be used to mark messages as read
    -- Currently, we track read status in the frontend
    -- You can extend this to add a 'read_at' column to messages table if needed
    SELECT NULL;
$$;

-- 13. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- 14. Create a view for easier message queries
CREATE OR REPLACE VIEW conversation_messages AS
SELECT 
    m.*,
    sender.first_name as sender_first_name,
    sender.last_name as sender_last_name,
    sender.profile_picture as sender_avatar,
    receiver.first_name as receiver_first_name,
    receiver.last_name as receiver_last_name,
    receiver.profile_picture as receiver_avatar
FROM messages m
LEFT JOIN profiles sender ON sender.user_id = m.sender_id
LEFT JOIN profiles receiver ON receiver.user_id = m.receiver_id;

-- 15. Add RLS to the view
ALTER VIEW conversation_messages SET (security_invoker = true);

-- 16. Create a function to get messages between two users
CREATE OR REPLACE FUNCTION get_messages_between_users(user1_id UUID, user2_id UUID, limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
    id UUID,
    sender_id UUID,
    receiver_id UUID,
    content TEXT,
    type TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ,
    sender_name TEXT,
    receiver_name TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.type,
        m.image_url,
        m.created_at,
        sender.first_name || ' ' || sender.last_name as sender_name,
        receiver.first_name || ' ' || receiver.last_name as receiver_name
    FROM messages m
    LEFT JOIN profiles sender ON sender.user_id = m.sender_id
    LEFT JOIN profiles receiver ON receiver.user_id = m.receiver_id
    WHERE (m.sender_id = user1_id AND m.receiver_id = user2_id)
       OR (m.sender_id = user2_id AND m.receiver_id = user1_id)
    ORDER BY m.created_at DESC
    LIMIT limit_count;
$$;

-- 17. Verify setup
DO $$
BEGIN
    -- Check if messages table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        RAISE EXCEPTION 'Messages table was not created successfully';
    END IF;
    
    -- Check if storage bucket exists
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'chat-images') THEN
        RAISE EXCEPTION 'Chat images storage bucket was not created successfully';
    END IF;
    
    -- Check if real-time is enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'messages'
    ) THEN
        RAISE EXCEPTION 'Real-time is not enabled for messages table';
    END IF;
    
    RAISE NOTICE 'Messaging system setup completed successfully!';
END $$; 