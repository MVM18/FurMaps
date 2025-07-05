# Messaging System Setup & Troubleshooting Guide

## Overview
The messaging system allows pet owners and service providers to communicate directly through a real-time chat interface. It includes features like:
- Real-time messaging
- Image sharing
- Typing indicators
- Conversation management
- Message history

## Database Setup

### 1. Messages Table
Run this SQL in your Supabase SQL Editor:

```sql
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
```

### 2. Storage Bucket for Images
Create a storage bucket for chat images:

```sql
-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-images', 'chat-images', true);

-- Create policy for chat images
CREATE POLICY "Anyone can view chat images" ON storage.objects
    FOR SELECT USING (bucket_id = 'chat-images');

-- Create policy for authenticated users to upload chat images
CREATE POLICY "Authenticated users can upload chat images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'chat-images' 
        AND auth.role() = 'authenticated'
    );
```

## Real-Time Configuration

### 1. Enable Real-Time in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Database → Replication
3. Ensure "Real-time" is enabled for the `messages` table
4. Check that the `supabase_realtime` publication includes the `messages` table

### 2. Verify Real-Time Publication
Run this SQL to check real-time configuration:

```sql
-- Check if messages table is in real-time publication
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- If messages is not listed, add it:
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

## Frontend Integration

### 1. Pet Owner Messaging
The pet owner can message service providers from:
- Service cards (message button)
- Booking history (message provider button)
- Direct conversation access

### 2. Service Provider Messaging
Service providers can message pet owners from:
- Booking management (message button)
- Direct conversation access via messages tab

### 3. Message Modal Usage
```javascript
// Open messaging modal with specific receiver
<MessagesModal
  onClose={() => setShowMessages(false)}
  receiverId={selectedProviderId} // or selectedPetOwnerId
/>
```

## Troubleshooting

### Common Issues

#### 1. Messages Not Loading
**Symptoms:** Empty conversation list or no messages displayed

**Solutions:**
- Check browser console for errors
- Verify user authentication
- Check RLS policies
- Ensure proper user_id references

**Debug Steps:**
```javascript
// Check current user
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Check user profile
const { data: profile, error } = await supabase
  .from('profiles')
  .select('user_id, first_name, last_name')
  .eq('user_id', user.id)
  .single();
console.log('User profile:', profile, 'Error:', error);
```

#### 2. Real-Time Not Working
**Symptoms:** Messages don't appear in real-time

**Solutions:**
- Check Supabase real-time configuration
- Verify WebSocket connections
- Check browser console for real-time errors

**Debug Steps:**
```javascript
// Test real-time connection
const channel = supabase
  .channel('test')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
    console.log('Real-time event:', payload);
  })
  .subscribe((status) => {
    console.log('Real-time status:', status);
  });
```

#### 3. Image Upload Fails
**Symptoms:** Images don't upload or display

**Solutions:**
- Check storage bucket exists
- Verify storage policies
- Check file size limits
- Ensure proper CORS configuration

**Debug Steps:**
```javascript
// Test storage bucket access
const { data, error } = await supabase.storage
  .from('chat-images')
  .list();
console.log('Storage bucket contents:', data, 'Error:', error);
```

#### 4. Foreign Key Errors
**Symptoms:** Database errors when sending messages

**Solutions:**
- Ensure sender_id and receiver_id reference valid profiles.user_id
- Check that users have profiles created
- Verify user authentication

**Debug Steps:**
```sql
-- Check if user has profile
SELECT * FROM profiles WHERE user_id = 'your-user-id';

-- Check messages table structure
\d messages;
```

### Performance Optimization

#### 1. Message Pagination
For large message histories, implement pagination:

```javascript
const fetchMessages = async (page = 0, limit = 50) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${currentUserId})`)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);
  
  return { data, error };
};
```

#### 2. Conversation Caching
Cache conversations to reduce database queries:

```javascript
const [conversationCache, setConversationCache] = useState(new Map());

const getCachedConversation = (conversationId) => {
  return conversationCache.get(conversationId);
};

const cacheConversation = (conversationId, data) => {
  setConversationCache(prev => new Map(prev).set(conversationId, data));
};
```

## Security Considerations

### 1. Message Privacy
- Messages are only visible to sender and receiver
- RLS policies enforce access control
- No admin access to private messages

### 2. Content Moderation
Consider implementing:
- Message filtering for inappropriate content
- Rate limiting for message sending
- File type restrictions for uploads

### 3. Data Retention
Consider implementing:
- Message deletion policies
- Archive old conversations
- GDPR compliance features

## Testing

### 1. Manual Testing
1. Create two test accounts (pet owner and service provider)
2. Send messages between accounts
3. Test real-time functionality
4. Test image uploads
5. Test conversation switching

### 2. Automated Testing
```javascript
// Example test for message sending
test('should send message successfully', async () => {
  const message = 'Test message';
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: testUserId,
      receiver_id: testReceiverId,
      content: message,
      type: 'text'
    })
    .select()
    .single();
  
  expect(error).toBeNull();
  expect(data.content).toBe(message);
});
```

## Monitoring

### 1. Error Tracking
Monitor for:
- Failed message sends
- Real-time connection failures
- Storage upload errors
- Authentication issues

### 2. Performance Metrics
Track:
- Message delivery time
- Real-time latency
- Storage upload success rate
- User engagement metrics

## Support

If you encounter issues:
1. Check this guide first
2. Review browser console errors
3. Check Supabase dashboard logs
4. Verify database configuration
5. Test with minimal setup

For persistent issues, check:
- Supabase documentation
- Real-time troubleshooting guides
- Storage configuration guides 