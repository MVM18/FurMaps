//C:\xampp\htdocs\FurMaps\src\pages\ServiceProviderDashboard\SPmessages.js
import React, { useState, useRef, useEffect } from 'react';
import './SPmessages.css';
import { supabase } from '../../lib/supabaseClient';



const MessagesModal = ({ onClose, receiverId}) => {
  const [allMessages, setAllMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [lastMessageCheck, setLastMessageCheck] = useState(new Date());

  useEffect(() => {
  if (receiverId) {
    setSelectedConversation(receiverId);
  } else {
    // If no receiverId is provided, don't select any conversation initially
    setSelectedConversation(null);
  }
}, [receiverId]);
  useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('user_id', user.id)
        .single();

      if (error || !profile) {
        console.error('Profile not found or error:', error);
        return;
      }

      console.log('Current user set to:', profile.user_id);
      setCurrentUserId(profile.user_id); // Use profiles.user_id for messages table
      
      // Test real-time connection
      const testChannel = supabase
        .channel('test-connection')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
          console.log('Test real-time event received:', payload);
        })
        .subscribe((status) => {
          console.log('Test real-time connection status:', status);
        });
        
      // Clean up test channel after 5 seconds
      setTimeout(() => {
        supabase.removeChannel(testChannel);
      }, 5000);
    }
  };
  getUser();
}, []);
useEffect(() => {
  const fetchConversations = async () => {
    if (!currentUserId) return;

    // Fetch both sent and received messages to get all conversations
    const { data: receivedMessages, error: receivedError } = await supabase
      .from('messages')
      .select(`
        sender_id,
        content,
        created_at,
        sender:profiles!messages_sender_id_fkey (
          first_name,
          last_name,
          profile_picture
        )
      `)
      .eq('receiver_id', currentUserId)
      .order('created_at', { ascending: false });

    const { data: sentMessages, error: sentError } = await supabase
      .from('messages')
      .select(`
        receiver_id,
        content,
        created_at,
        receiver:profiles!messages_receiver_id_fkey (
          first_name,
          last_name,
          profile_picture
        )
      `)
      .eq('sender_id', currentUserId)
      .order('created_at', { ascending: false });

    if (receivedError || sentError) {
      console.error('Error fetching conversations:', receivedError || sentError);
      return;
    }



    const uniqueConversations = new Map();

    // Process received messages
    receivedMessages.forEach(msg => {
      if (!uniqueConversations.has(msg.sender_id)) {
        uniqueConversations.set(msg.sender_id, {
          id: msg.sender_id,
          name: `${msg.sender?.first_name || 'Unknown'} ${msg.sender?.last_name || ''}`,
          avatar: msg.sender?.profile_picture || '/default-avatar.png',
          lastMessage: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: 1,
          lastMessageTime: new Date(msg.created_at)
        });
      }
    });

    // Process sent messages
    sentMessages.forEach(msg => {
      if (!uniqueConversations.has(msg.receiver_id)) {
        uniqueConversations.set(msg.receiver_id, {
          id: msg.receiver_id,
          name: `${msg.receiver?.first_name || 'Unknown'} ${msg.receiver?.last_name || ''}`,
          avatar: msg.receiver?.profile_picture || '/default-avatar.png',
          lastMessage: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: 0,
          lastMessageTime: new Date(msg.created_at)
        });
      } else {
        // Update existing conversation if this message is more recent
        const existing = uniqueConversations.get(msg.receiver_id);
        if (new Date(msg.created_at) > existing.lastMessageTime) {
          existing.lastMessage = msg.content;
          existing.time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          existing.lastMessageTime = new Date(msg.created_at);
        }
      }
    });

    // Convert to array and sort by most recent message
    const conversationsArray = Array.from(uniqueConversations.values())
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    setConversations(conversationsArray);
  };

  fetchConversations();
}, [currentUserId]);
useEffect(() => {
  const fetchMessages = async () => {
    if (!currentUserId || !selectedConversation) return; // ✅ Prevent query if IDs aren't loaded

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setAllMessages(data); // ✅ This should now be an array, not an object
    }
  };

  fetchMessages();
}, [selectedConversation, currentUserId]);

useEffect(() => {
  if (!currentUserId) return;

  console.log('Setting up real-time listener for user:', currentUserId);

  // Create a more robust real-time subscription
  const messageListener = supabase
    .channel(`messages-${currentUserId}-${Date.now()}`) // Unique channel name
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId})`,
      },
      (payload) => {
        console.log('Real-time message received:', payload);
        const newMsg = payload.new;
        
        // Don't add optimistic messages again
        if (newMsg.isOptimistic) {
          console.log('Skipping optimistic message');
          return;
        }
        
        console.log('Processing new message:', newMsg);
        console.log('Current conversation:', selectedConversation);
        console.log('Message sender:', newMsg.sender_id);
        console.log('Message receiver:', newMsg.receiver_id);
        
        // Add new message to messages list if it's in the current conversation
        if (
          newMsg.sender_id === selectedConversation ||
          newMsg.receiver_id === selectedConversation
        ) {
          console.log('Adding message to current conversation:', newMsg);
          setAllMessages(prev => {
            // Check if message already exists (to avoid duplicates)
            const exists = prev.some(msg => msg.id === newMsg.id);
            if (exists) {
              console.log('Message already exists, skipping');
              return prev;
            }
            console.log('Adding new message to chat');
            return [...prev, newMsg];
          });
        } else {
          console.log('Message not for current conversation, updating conversation list only');
        }

        // Update conversations list with new message
        setConversations(prev => {
          const updatedConversations = [...prev];
          const conversationId = newMsg.sender_id === currentUserId ? newMsg.receiver_id : newMsg.sender_id;
          const conversationIndex = updatedConversations.findIndex(conv => conv.id === conversationId);
          
          if (conversationIndex !== -1) {
            // Update existing conversation
            updatedConversations[conversationIndex] = {
              ...updatedConversations[conversationIndex],
              lastMessage: newMsg.content || 'Image sent',
              time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              lastMessageTime: new Date(newMsg.created_at),
              unread: newMsg.sender_id === currentUserId ? 0 : (updatedConversations[conversationIndex].unread || 0) + 1
            };
            console.log('Updated existing conversation');
          } else {
            // Add new conversation if it doesn't exist
            const otherUserId = newMsg.sender_id === currentUserId ? newMsg.receiver_id : newMsg.sender_id;
            console.log('Fetching profile for new conversation:', otherUserId);
            // Fetch the other user's profile to add them to conversations
            fetchUserProfile(otherUserId).then(profile => {
              if (profile) {
                const newConversation = {
                  id: profile.user_id,
                  name: `${profile.first_name || 'Unknown'} ${profile.last_name || ''}`,
                  avatar: profile.profile_picture || '/default-avatar.png',
                  lastMessage: newMsg.content || 'Image sent',
                  time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  unread: newMsg.sender_id === currentUserId ? 0 : 1,
                  lastMessageTime: new Date(newMsg.created_at)
                };
                setConversations(prev => [newConversation, ...prev]);
                console.log('Added new conversation');
              }
            });
          }
          
          // Sort conversations by most recent message
          return updatedConversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        });
      }
    )
    .subscribe((status) => {
      console.log('Real-time subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time subscription successful');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Real-time subscription failed');
      }
    });

  return () => {
    console.log('Cleaning up real-time listener');
    supabase.removeChannel(messageListener);
  };
}, [selectedConversation, currentUserId]);

// Fallback: Poll for new messages every 5 seconds if real-time fails
useEffect(() => {
  if (!currentUserId || !selectedConversation) return;

  const pollInterval = setInterval(async () => {
    try {
      const { data: newMessages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${currentUserId})`)
        .gt('created_at', lastMessageCheck.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Polling error:', error);
        return;
      }

      if (newMessages && newMessages.length > 0) {
        console.log('Found new messages via polling:', newMessages);
        setAllMessages(prev => {
          const existingIds = new Set(prev.map(msg => msg.id));
          const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
          return [...prev, ...uniqueNewMessages];
        });
        setLastMessageCheck(new Date());
      }
    } catch (error) {
      console.error('Polling failed:', error);
    }
  }, 5000);

  return () => clearInterval(pollInterval);
}, [currentUserId, selectedConversation, lastMessageCheck]);

// Typing indicator listener
useEffect(() => {
  if (!currentUserId || !selectedConversation) return;

  const typingListener = supabase
    .channel('typing')
    .on('broadcast', { event: 'typing' }, (payload) => {
      const { userId, conversationId, isTyping: userIsTyping } = payload.payload;
      
      if (userId !== currentUserId && conversationId === selectedConversation) {
        if (userIsTyping) {
          setTypingUsers(prev => new Set([...prev, userId]));
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(typingListener);
  };
}, [currentUserId, selectedConversation]);

// Helper function to fetch user profile
const fetchUserProfile = async (userId) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, profile_picture')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return profile;
};



  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentConversation = conversations.find(conv => conv.id === selectedConversation);
 const currentMessages = allMessages;
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  /*const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };*/
  
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!newMessage.trim()) return;

  const messageContent = newMessage.trim();
  setNewMessage(''); // Clear input immediately

  // Create optimistic message (appears immediately)
  const optimisticMessage = {
    id: `temp-${Date.now()}`, // Temporary ID
    sender_id: currentUserId,
    receiver_id: selectedConversation,
    content: messageContent,
    type: 'text',
    created_at: new Date().toISOString(),
    isOptimistic: true // Flag to identify optimistic messages
  };

  // Add message to chat immediately (optimistic update)
  setAllMessages(prev => [...prev, optimisticMessage]);

  // Send to database
  const { data, error } = await supabase.from('messages').insert({
    sender_id: currentUserId,
    receiver_id: selectedConversation,
    content: messageContent,
    type: 'text',
  }).select().single();

  if (error) {
    console.error('Send failed:', error);
    // Remove optimistic message if send failed
    setAllMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    setNewMessage(messageContent); // Restore the message in input
  } else {
    // Replace optimistic message with real message from database
    setAllMessages(prev => prev.map(msg => 
      msg.id === optimisticMessage.id ? { ...data, isOptimistic: false } : msg
    ));
  }
};


 const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  // Create optimistic message for image
  const optimisticMessage = {
    id: `temp-${Date.now()}`,
    sender_id: currentUserId,
    receiver_id: selectedConversation,
    type: 'image',
    image_url: URL.createObjectURL(file), // Temporary local URL
    created_at: new Date().toISOString(),
    isOptimistic: true
  };

  // Add optimistic message immediately
  setAllMessages(prev => [...prev, optimisticMessage]);

  // Reset input
  e.target.value = '';

  const fileName = `${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase
    .storage
    .from('chat-images') // make sure this bucket exists
    .upload(fileName, file);

  if (uploadError) {
    console.error('Image upload failed:', uploadError);
    // Remove optimistic message if upload failed
    setAllMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    return;
  }

  // Get public URL of uploaded image
  const { data: publicUrlData } = supabase
    .storage
    .from('chat-images')
    .getPublicUrl(fileName);

  const imageUrl = publicUrlData.publicUrl;

  // Insert message with image URL
  const { data, error: insertError } = await supabase.from('messages').insert({
    sender_id: currentUserId,
    receiver_id: selectedConversation,
    type: 'image',
    image_url: imageUrl,
  }).select().single();

  if (insertError) {
    console.error('Error saving image message:', insertError);
    // Remove optimistic message if insert failed
    setAllMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
  } else {
    // Replace optimistic message with real message from database
    setAllMessages(prev => prev.map(msg => 
      msg.id === optimisticMessage.id ? { ...data, isOptimistic: false } : msg
    ));
  }
};


  const markAsRead = (conversationId) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unread: 0 } : conv
    ));
  };

  const handleConversationSelect = (convId) => {
    setSelectedConversation(convId);
    markAsRead(convId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Test function to verify real-time is working
  const testRealtime = async () => {
    if (!currentUserId || !selectedConversation) {
      console.log('Cannot test real-time: missing currentUserId or selectedConversation');
      return;
    }
    
    console.log('Testing real-time with test message...');
    const { data, error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: selectedConversation,
      content: `Test message at ${new Date().toLocaleTimeString()}`,
      type: 'text',
    }).select().single();
    
    if (error) {
      console.error('Test message failed:', error);
    } else {
      console.log('Test message sent successfully:', data);
    }
  };

  // Typing indicator functionality
  const handleTyping = (e) => {
    if (!isTyping) {
      setIsTyping(true);
      // Broadcast typing status
      supabase
        .channel('typing')
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { 
            userId: currentUserId, 
            conversationId: selectedConversation,
            isTyping: true 
          }
        });
    }
    
    // Clear typing indicator after 3 seconds of no typing
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setIsTyping(false);
      supabase
        .channel('typing')
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { 
            userId: currentUserId, 
            conversationId: selectedConversation,
            isTyping: false 
          }
        });
    }, 3000);
  };

  // Add new useEffect to fetch receiver profile when starting a new conversation
  useEffect(() => {
    const fetchReceiverProfile = async () => {
      if (!receiverId || !currentUserId) return;
      
      // Check if receiver is already in conversations
      const existingConversation = conversations.find(conv => conv.id === receiverId);
      if (existingConversation) return;

      // Fetch receiver profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, profile_picture')
        .eq('user_id', receiverId)
        .single();

      if (error) {
        console.error('Error fetching receiver profile:', error);
        return;
      }

      // Add receiver to conversations list
      const newConversation = {
        id: profile.user_id,
        name: `${profile.first_name || 'Unknown'} ${profile.last_name || ''}`,
        avatar: profile.profile_picture || '/default-avatar.png',
        lastMessage: 'Start a conversation...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
        lastMessageTime: new Date()
      };

      setConversations(prev => [newConversation, ...prev]);
    };

    fetchReceiverProfile();
  }, [receiverId, currentUserId]);

  return (
    <>
      <style>
        {`
          @keyframes typing {
            0%, 60%, 100% { opacity: 0; }
            30% { opacity: 1; }
          }
        `}
      </style>
      <div className="messages-modal-overlay" onClick={onClose}>
      <div className="messages-modal" onClick={(e) => e.stopPropagation()}>
        <div className="messages-container">
          {/* Conversations List */}
          <div className="conversations-panel">
            <div className="conversations-header">
              <h3>Messages</h3>
              {selectedConversation && (
                <button 
                  onClick={testRealtime}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginLeft: '8px'
                  }}
                >
                  Test RT
                </button>
              )}
            </div>
            <div className="conversations-list">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${selectedConversation === conv.id ? 'active' : ''}`}
                  onClick={() => handleConversationSelect(conv.id)}
                >
                  <div className="conversation-avatar">
                    <img src={conv.avatar} alt={conv.name} />
                    {conv.online && <div className="online-indicator"></div>}
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-header">
                      <span className="conversation-name">{conv.name}</span>
                      <span className="conversation-time">{conv.time}</span>
                    </div>
                    <div className="conversation-preview">
                      <span className="last-message">{conv.lastMessage}</span>
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <div className="unread-badge">{conv.unread}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="chat-panel">
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-user-info">
                <img src={currentConversation?.avatar} alt={currentConversation?.name} />
                <div className="chat-user-details">
                  <span className="chat-user-name">{currentConversation?.name}</span>
                  <span className="chat-user-status">
                    {currentConversation?.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <button className="close-chat-btn" onClick={onClose}>
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="messages-area">
              {!selectedConversation ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: '300px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#374151'
                    }}>Select a conversation</h3>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              ) : (
                <>
                  {currentMessages.map((message) => (
                    <div key={message.id} className={`message ${message.sender_id === currentUserId ? 'own-message' : 'other-message'}`}>
                      <div className="message-bubble" style={{
                        opacity: message.isOptimistic ? 0.7 : 1,
                        position: 'relative'
                      }}>
                        {message.type === 'image' ? (
                          <div className="message-image">
                            <img src={message.image_url} alt="Sent" />
                          </div>
                        ) : (
                          <div className="message-content">{message.content}</div>
                        )}
                        <div className="message-time">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {message.isOptimistic && (
                            <span style={{
                              marginLeft: '8px',
                              fontSize: '12px',
                              opacity: 0.7
                            }}>sending...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {typingUsers.size > 0 && (
                    <div className="message other-message">
                      <div className="message-bubble" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '14px'
                        }}>
                          <span>typing</span>
                          <span style={{
                            animation: 'typing 1.4s infinite',
                            animationDelay: '0s'
                          }}>.</span>
                          <span style={{
                            animation: 'typing 1.4s infinite',
                            animationDelay: '0.2s'
                          }}>.</span>
                          <span style={{
                            animation: 'typing 1.4s infinite',
                            animationDelay: '0.4s'
                          }}>.</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="message-input-area">
              <div className="message-form">
                <button 
                  type="button" 
                  className="attachment-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Send photo"
                  disabled={!selectedConversation}
                >
                  📎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden-file-input"
                  disabled={!selectedConversation}
                />
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping(e);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedConversation ? "Type your message..." : "Select a conversation to start messaging"}
                  className="message-input"
                  disabled={!selectedConversation}
                />
                <button 
                  onClick={handleSendMessage}
                  className="send-btn"
                  disabled={!newMessage.trim() || !selectedConversation}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default MessagesModal;