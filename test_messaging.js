// Test script for messaging system
// Run this in browser console to test messaging functionality

const testMessaging = async () => {
  console.log('🧪 Testing messaging system...');
  
  try {
    // 1. Test user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return;
    }
    console.log('✅ User authenticated:', user.id);
    
    // 2. Test profile access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profile) {
      console.error('❌ Profile access failed:', profileError);
      return;
    }
    console.log('✅ Profile accessed:', profile);
    
    // 3. Test messages table access
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(5);
    
    if (messagesError) {
      console.error('❌ Messages table access failed:', messagesError);
      return;
    }
    console.log('✅ Messages table accessible, found', messages.length, 'messages');
    
    // 4. Test real-time subscription
    const channel = supabase
      .channel('test-messaging')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        console.log('✅ Real-time event received:', payload);
      })
      .subscribe((status) => {
        console.log('✅ Real-time subscription status:', status);
      });
    
    // 5. Test storage bucket access
    const { data: storageData, error: storageError } = await supabase.storage
      .from('chat-images')
      .list();
    
    if (storageError) {
      console.error('❌ Storage bucket access failed:', storageError);
    } else {
      console.log('✅ Storage bucket accessible, found', storageData.length, 'files');
    }
    
    // 6. Test message insertion (if you have another user ID to test with)
    console.log('📝 To test message sending, you need another user ID');
    console.log('💡 You can test this by opening the messaging modal and sending a message');
    
    // Clean up test channel
    setTimeout(() => {
      supabase.removeChannel(channel);
      console.log('🧹 Test channel cleaned up');
    }, 5000);
    
    console.log('✅ Messaging system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Test conversation participants function
const testConversationParticipants = async () => {
  console.log('🧪 Testing conversation participants function...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ User not authenticated');
      return;
    }
    
    const { data, error } = await supabase.rpc('get_conversation_participants', {
      user_id: user.id
    });
    
    if (error) {
      console.error('❌ Conversation participants function failed:', error);
      return;
    }
    
    console.log('✅ Conversation participants:', data);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Test message sending (requires another user ID)
const testMessageSending = async (receiverId) => {
  if (!receiverId) {
    console.error('❌ Please provide a receiver ID to test message sending');
    return;
  }
  
  console.log('🧪 Testing message sending...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ User not authenticated');
      return;
    }
    
    const testMessage = `Test message at ${new Date().toLocaleTimeString()}`;
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        content: testMessage,
        type: 'text'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Message sending failed:', error);
      return;
    }
    
    console.log('✅ Message sent successfully:', data);
    
    // Clean up test message after 10 seconds
    setTimeout(async () => {
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) {
        console.error('❌ Failed to clean up test message:', deleteError);
      } else {
        console.log('🧹 Test message cleaned up');
      }
    }, 10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Export functions for use in console
window.testMessaging = testMessaging;
window.testConversationParticipants = testConversationParticipants;
window.testMessageSending = testMessageSending;

console.log('🧪 Messaging test functions loaded!');
console.log('📝 Available functions:');
console.log('  - testMessaging() - Test basic messaging functionality');
console.log('  - testConversationParticipants() - Test conversation participants function');
console.log('  - testMessageSending(receiverId) - Test message sending (requires receiver ID)');
console.log('');
console.log('💡 Run testMessaging() to start testing...'); 