import React, { useState, useRef, useEffect } from 'react';
import './SPmessages.css';

const MessagesModal = ({ onClose }) => {
  const [selectedConversation, setSelectedConversation] = useState('sarah');
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([
    {
      id: 'sarah',
      name: 'Sarah Johnson',
      lastMessage: "I'll be there at 10 AM tomorro…",
      time: '2 min ago',
      unread: 2,
      online: true,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 'mike',
      name: 'Mike Chen',
      lastMessage: 'Thanks for booking! Looking forwar…',
      time: '1 hour ago',
      unread: 0,
      online: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 'emma',
      name: 'Emma Davis',
      lastMessage: 'The checkup went great! Ma…',
      time: 'Yesterday',
      unread: 1,
      online: false,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    }
  ]);

  const [allMessages, setAllMessages] = useState({
    sarah: [
      {
        id: 1,
        sender: 'sarah',
        content: "Hi! I received your booking request for tomorrow. I'm excited to walk Max!",
        time: '10:30 AM',
        isOwn: false,
        type: 'text'
      },
      {
        id: 2,
        sender: 'me',
        content: "Great! Max is very friendly but gets excited around other dogs. Is that okay?",
        time: '10:32 AM',
        isOwn: true,
        type: 'text'
      },
      {
        id: 3,
        sender: 'sarah',
        content: "That's perfectly fine! I have experience with energetic dogs. I'll make sure he gets plenty of exercise.",
        time: '10:35 AM',
        isOwn: false,
        type: 'text'
      },
      {
        id: 4,
        sender: 'me',
        content: "Perfect! Should I leave his leash and treats by the door?",
        time: '10:37 AM',
        isOwn: true,
        type: 'text'
      },
      {
        id: 5,
        sender: 'sarah',
        content: "Yes, that would be great! I'll be there at 10 AM tomorrow!",
        time: '10:40 AM',
        isOwn: false,
        type: 'text'
      }
    ],
    mike: [
      {
        id: 1,
        sender: 'mike',
        content: "Thanks for booking my grooming service! When would be a good time?",
        time: '9:15 AM',
        isOwn: false,
        type: 'text'
      },
      {
        id: 2,
        sender: 'me',
        content: "How about this Friday afternoon?",
        time: '9:20 AM',
        isOwn: true,
        type: 'text'
      }
    ],
    emma: [
      {
        id: 1,
        sender: 'emma',
        content: "The checkup went great! Max is healthy and happy.",
        time: '2:30 PM',
        isOwn: false,
        type: 'text'
      }
    ]
  });

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentConversation = conversations.find(conv => conv.id === selectedConversation);
  const currentMessages = allMessages[selectedConversation] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageId = Date.now();
      const newMsg = {
        id: messageId,
        sender: 'me',
        content: newMessage.trim(),
        time: formatTime(),
        isOwn: true,
        type: 'text'
      };

      // Add message to current conversation
      setAllMessages(prev => ({
        ...prev,
        [selectedConversation]: [...(prev[selectedConversation] || []), newMsg]
      }));

      // Update conversation preview
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation 
          ? { ...conv, lastMessage: newMessage.substring(0, 25) + '…', time: 'now' }
          : conv
      ));

      setNewMessage('');

      // Simulate response after 2 seconds
      setTimeout(() => {
        const responses = [
          "That sounds great!",
          "Perfect, looking forward to it!",
          "Thanks for letting me know!",
          "Got it, I'll be ready!",
          "Awesome, see you then!",
          "No problem at all!",
          "That works for me!"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseMsg = {
          id: Date.now() + 1,
          sender: selectedConversation,
          content: randomResponse,
          time: formatTime(),
          isOwn: false,
          type: 'text'
        };

        setAllMessages(prev => ({
          ...prev,
          [selectedConversation]: [...(prev[selectedConversation] || []), responseMsg]
        }));

        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation 
            ? { ...conv, lastMessage: randomResponse.substring(0, 25) + '…', time: 'now', unread: conv.unread + 1 }
            : conv
        ));
      }, 2000);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const messageId = Date.now();
        const imageMsg = {
          id: messageId,
          sender: 'me',
          content: event.target.result,
          time: formatTime(),
          isOwn: true,
          type: 'image',
          fileName: file.name
        };

        setAllMessages(prev => ({
          ...prev,
          [selectedConversation]: [...(prev[selectedConversation] || []), imageMsg]
        }));

        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation 
            ? { ...conv, lastMessage: '📷 Photo', time: 'now' }
            : conv
        ));

        // Simulate response to image
        setTimeout(() => {
          const imageResponses = [
            "Great photo!",
            "That's a beautiful picture!",
            "Love it!",
            "Thanks for sharing!",
            "Wow, that's nice!"
          ];
          
          const randomResponse = imageResponses[Math.floor(Math.random() * imageResponses.length)];
          const responseMsg = {
            id: Date.now() + 1,
            sender: selectedConversation,
            content: randomResponse,
            time: formatTime(),
            isOwn: false,
            type: 'text'
          };

          setAllMessages(prev => ({
            ...prev,
            [selectedConversation]: [...(prev[selectedConversation] || []), responseMsg]
          }));

          setConversations(prev => prev.map(conv => 
            conv.id === selectedConversation 
              ? { ...conv, lastMessage: randomResponse.substring(0, 25) + '…', time: 'now', unread: conv.unread + 1 }
              : conv
          ));
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
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
                <div
                  key={message.id}
                  className={`message ${message.isOwn ? 'own-message' : 'other-message'}`}
                >
                  <div className="message-bubble">
                    {message.type === 'image' ? (
                      <div className="message-image">
                        <img 
                          src={message.content} 
                          alt="Shared image" 
                        />
                      </div>
                    ) : (
                      <div className="message-content">{message.content}</div>
                    )}
                    <div className="message-time">{message.time}</div>
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