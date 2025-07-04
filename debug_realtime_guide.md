# Real-Time Messaging Debug Guide

## Step 1: Check Database Configuration

Run this SQL query in Supabase SQL Editor:

```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'messages';

-- Check RLS policies
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'messages';

-- Check real-time publication
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

**Expected Results:**
- `messages` table should have `rowsecurity = true`
- Should have policies for SELECT, INSERT, UPDATE
- `messages` should be in the real-time publication

## Step 2: Check Browser Console

1. Open the messaging system
2. Open browser console (F12)
3. Look for these messages:

**✅ Good signs:**
```
Current user set to: [user-id]
Setting up real-time listener for user: [user-id]
Real-time subscription status: SUBSCRIBED
✅ Real-time subscription successful
```

**❌ Bad signs:**
```
Real-time subscription status: CHANNEL_ERROR
❌ Real-time subscription failed
```

## Step 3: Test Real-Time Connection

1. Open messaging on Device A
2. Open messaging on Device B
3. Click "Test RT" button on Device A
4. Check console on Device B for:
   ```
   Real-time message received: [payload]
   Adding message to current conversation: [message]
   ```

## Step 4: Manual Database Test

Run this SQL to manually insert a test message:

```sql
-- Replace with actual user IDs from your system
INSERT INTO messages (sender_id, receiver_id, content, type) 
VALUES ('sender-user-id', 'receiver-user-id', 'Manual test message', 'text')
RETURNING *;
```

## Step 5: Check Network Issues

1. **Check Supabase Dashboard:**
   - Go to Database → Replication
   - Ensure "Real-time" is enabled
   - Check if there are any connection issues

2. **Check Browser Network Tab:**
   - Look for WebSocket connections
   - Check for any failed requests

## Step 6: Common Issues & Solutions

### Issue 1: "Real-time subscription failed"
**Solution:** Run the `fix_rls_settings.sql` script

### Issue 2: Messages appear on sender but not receiver
**Solution:** Check RLS policies - receiver might not have permission to view messages

### Issue 3: No console logs at all
**Solution:** Check if Supabase client is properly configured

### Issue 4: Messages appear after refresh
**Solution:** Real-time is not working, but polling fallback is working

## Step 7: Force Fix

If nothing works, run this complete fix:

```sql
-- Complete real-time fix
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;

CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

ALTER PUBLICATION supabase_realtime ADD TABLE messages;

GRANT ALL ON messages TO authenticated;
```

## Step 8: Test Again

After applying fixes:
1. Refresh both devices
2. Check console for successful subscription
3. Send test messages
4. Verify real-time delivery

## Troubleshooting Checklist

- [ ] RLS enabled on messages table
- [ ] Proper RLS policies in place
- [ ] Messages table in real-time publication
- [ ] Console shows "SUBSCRIBED" status
- [ ] No network errors in browser
- [ ] Supabase real-time enabled in dashboard
- [ ] Both users have proper permissions
- [ ] Test messages work manually 