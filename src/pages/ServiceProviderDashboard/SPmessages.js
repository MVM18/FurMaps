import React, { useState, useRef, useEffect } from 'react';
import './SPmessages.css';
import { supabase } from '../../lib/supabaseClient'; 
import { useMemo } from 'react';



const MessagesModal = ({ onClose, receiverId}) => {
  const [allMessages, setAllMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
   const [messages, setMessages] = useState([]);

  useEffect(() => {
  if (receiverId) {
    setSelectedConversation(receiverId);
  }
}, [receiverId]);
  useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (error || !profile) {
        console.error('Profile not found or error:', error);
        return;
      }

      setCurrentUserId(profile.user_id); // ✅ Use profiles.id (primary key) as sender_id
    }
  };
  getUser();
}, []);
useEffect(() => {
  const fetchConversations = async () => {
    if (!currentUserId) return;

  const { data, error } = await supabase
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

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }

    const uniqueSenders = [];
    const seen = new Set();

    for (const msg of data) {
      if (!seen.has(msg.sender_id)) {
        seen.add(msg.sender_id);
        uniqueSenders.push({
         id: msg.sender_id,
  name: `${msg.sender?.first_name || 'Unknown'} ${msg.sender?.last_name || ''}`,
  avatar: msg.sender?.profile_picture || '/default-avatar.png',
  lastMessage: msg.content,
  time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  unread: 1,
        });
      }
    }

    setConversations(uniqueSenders);
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
  const messageListener = supabase
    .channel('public:messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`,
      },
      (payload) => {
        const newMsg = payload.new;
        if (
          newMsg.sender_id === selectedConversation ||
          newMsg.receiver_id === selectedConversation
        ) {
          setAllMessages(prev => [...prev, newMsg]);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(messageListener);
  };
}, [selectedConversation, currentUserId]);



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

  const { error } = await supabase.from('messages').insert({
    sender_id: currentUserId,
    receiver_id: selectedConversation,
    content: newMessage.trim(),
    type: 'text',
  });

  if (error) console.error('Send failed:', error);
  else setNewMessage('');
};


 const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const fileName = `${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase
    .storage
    .from('chat-images') // make sure this bucket exists
    .upload(fileName, file);

  if (uploadError) {
    console.error('Image upload failed:', uploadError);
    return;
  }

  // Get public URL of uploaded image
  const { data: publicUrlData } = supabase
    .storage
    .from('chat-images')
    .getPublicUrl(fileName);

  const imageUrl = publicUrlData.publicUrl;

  // Insert message with image URL
  const { error: insertError } = await supabase.from('messages').insert({
    sender_id: currentUserId,
    receiver_id: selectedConversation,
    type: 'image',
    image_url: imageUrl,
  });

  if (insertError) {
    console.error('Error saving image message:', insertError);
  }

  // Reset input
  e.target.value = '';
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

  return (
    <div className="messages-modal-overlay" onClick={onClose}>
      <div className="messages-modal" onClick={(e) => e.stopPropagation()}>
        <div className="messages-container">
          {/* Conversations List */}
          <div className="conversations-panel">
            <div className="conversations-header">
              <h3>Messages</h3>
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
             {currentMessages.map((message) => (
                <div key={message.id} className={`message ${message.sender_id === currentUserId ? 'own-message' : 'other-message'}`}>
                  <div className="message-bubble">
                    {message.type === 'image' ? (
                      <div className="message-image">
                        <img src={message.image_url} alt="Sent" />
                      </div>
                    ) : (
                      <div className="message-content">{message.content}</div>
                    )}
                    <div className="message-time">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="message-input-area">
              <div className="message-form">
                <button 
                  type="button" 
                  className="attachment-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Send photo"
                >
                  📎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden-file-input"
                />
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="message-input"
                />
                <button 
                  onClick={handleSendMessage}
                  className="send-btn"
                  disabled={!newMessage.trim()}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesModal;