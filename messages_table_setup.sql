-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    content TEXT,
    type TEXT DEFAULT 'text',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);



-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages table
-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can insert messages
CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages
CREATE POLICY "Users can update their messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Stores chat messages between users';
COMMENT ON COLUMN messages.sender_id IS 'Reference to the sender profile';
COMMENT ON COLUMN messages.receiver_id IS 'Reference to the receiver profile';
COMMENT ON COLUMN messages.type IS 'Message type: text or image';
COMMENT ON COLUMN messages.image_url IS 'URL of the image if type is image'; 