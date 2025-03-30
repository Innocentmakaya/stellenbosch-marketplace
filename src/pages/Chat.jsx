import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPaperPlane, FaArrowLeft, FaEllipsisV, FaSearch, FaUser, FaTimes, FaPaperclip, FaImage, FaSmile } from "react-icons/fa";
import supabase from "../supabaseClient";
import "./Chat.css";

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileConversations, setShowMobileConversations] = useState(!chatId);
  const messagesEndRef = useRef(null);
  
  // Sample data for UI development - will be replaced with real data
  const sampleConversations = [
    {
      id: "1",
      seller: { id: "seller1", name: "John Doe", avatar: "https://i.pravatar.cc/150?img=1" },
      buyer: { id: "buyer1", name: "Alice Smith", avatar: "https://i.pravatar.cc/150?img=5" },
      listing: { id: "listing1", title: "MacBook Pro 2022", image: "https://via.placeholder.com/300x200?text=MacBook+Pro" },
      lastMessage: "Hi, is this still available?",
      lastMessageTime: "2023-08-10T14:30:00Z",
      unread: 3,
    },
    {
      id: "2",
      seller: { id: "seller2", name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?img=2" },
      buyer: { id: "buyer1", name: "Alice Smith", avatar: "https://i.pravatar.cc/150?img=5" },
      listing: { id: "listing2", title: "Calculus Textbook", image: "https://via.placeholder.com/300x200?text=Calculus+Textbook" },
      lastMessage: "Can you meet tomorrow at the library?",
      lastMessageTime: "2023-08-09T09:15:00Z",
      unread: 0,
    },
    {
      id: "3",
      seller: { id: "buyer1", name: "Alice Smith", avatar: "https://i.pravatar.cc/150?img=5" },
      buyer: { id: "seller3", name: "Michael Brown", avatar: "https://i.pravatar.cc/150?img=3" },
      listing: { id: "listing3", title: "Mountain Bike", image: "https://via.placeholder.com/300x200?text=Mountain+Bike" },
      lastMessage: "I'll take it for R2000, is that okay?",
      lastMessageTime: "2023-08-08T18:45:00Z",
      unread: 1,
    },
    {
      id: "4",
      seller: { id: "seller4", name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?img=4" },
      buyer: { id: "buyer1", name: "Alice Smith", avatar: "https://i.pravatar.cc/150?img=5" },
      listing: { id: "listing4", title: "Desk Lamp", image: "https://via.placeholder.com/300x200?text=Desk+Lamp" },
      lastMessage: "Thanks for the purchase!",
      lastMessageTime: "2023-08-05T11:20:00Z",
      unread: 0,
    },
  ];
  
  const sampleMessages = [
    { id: "m1", sender: "seller1", text: "Hi there! Are you interested in the MacBook Pro?", timestamp: "2023-08-10T14:25:00Z" },
    { id: "m2", sender: "buyer1", text: "Hi, is this still available?", timestamp: "2023-08-10T14:30:00Z" },
    { id: "m3", sender: "seller1", text: "Yes, it's still available! It's in great condition.", timestamp: "2023-08-10T14:32:00Z" },
    { id: "m4", sender: "seller1", text: "I've only had it for about 6 months. Works perfectly.", timestamp: "2023-08-10T14:33:00Z" },
    { id: "m5", sender: "buyer1", text: "Great! What's the lowest you can go on the price?", timestamp: "2023-08-10T14:35:00Z" },
    { id: "m6", sender: "seller1", text: "I could do R15000, it's already a good deal considering the specs and condition.", timestamp: "2023-08-10T14:40:00Z" },
    { id: "m7", sender: "buyer1", text: "Would you take R14500?", timestamp: "2023-08-10T14:45:00Z" },
    { id: "m8", sender: "seller1", text: "Hmm, let me think about it.", timestamp: "2023-08-10T14:50:00Z" },
    { id: "m9", sender: "seller1", text: "Okay, I can do R14500 if you can meet today or tomorrow.", timestamp: "2023-08-10T15:00:00Z" },
    { id: "m10", sender: "buyer1", text: "Perfect! I can meet tomorrow at 3pm. Where would be convenient for you?", timestamp: "2023-08-10T15:05:00Z" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
      setLoading(false);
    };

    fetchUser();
    // In the future, replace with real data fetch from Supabase
    setConversations(sampleConversations);
    
    // If chatId is provided in URL, open that conversation
    if (chatId) {
      const conversation = sampleConversations.find(conv => conv.id === chatId);
      if (conversation) {
        setActiveConversation(conversation);
        setMessages(sampleMessages);
        setShowMobileConversations(false);
      }
    }
  }, [chatId, navigate]);

  useEffect(() => {
    // Scroll to bottom of messages when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If same day, show time only
    if (date.getDate() === now.getDate() && 
        date.getMonth() === now.getMonth() && 
        date.getFullYear() === now.getFullYear()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday, show "Yesterday"
    if (date.getDate() === yesterday.getDate() && 
        date.getMonth() === yesterday.getMonth() && 
        date.getFullYear() === yesterday.getFullYear()) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: `m${messages.length + 1}`,
      sender: user?.id || "buyer1", // Using buyer1 as default for demo
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
    
    // In the future, also send to Supabase/Firebase
  };
  
  const selectConversation = (conversation) => {
    setActiveConversation(conversation);
    setMessages(sampleMessages);
    setShowMobileConversations(false);
    // In the future, fetch real messages from Supabase/Firebase
    
    // Update URL without full page reload
    navigate(`/chat/${conversation.id}`);
  };
  
  const filteredConversations = conversations.filter(conv => 
    conv.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading chat...</p>
      </div>
    );
  }
  
  // Helper to determine if message is from current user
  const isOwnMessage = (senderId) => {
    return user?.id === senderId || (!user && senderId === "buyer1"); // For demo purposes
  };
  
  return (
    <div className="chat-container">
      {/* Conversations Sidebar */}
      <div className={`conversations-sidebar ${showMobileConversations ? 'show-mobile' : 'hide-mobile'}`}>
        <div className="conversations-header">
          <h2>Messages</h2>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="conversations-list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conversation => (
              <div 
                key={conversation.id} 
                className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  <img 
                    src={user?.id === conversation.seller.id ? conversation.buyer.avatar : conversation.seller.avatar} 
                    alt="User Avatar" 
                  />
                  {conversation.unread > 0 && <span className="unread-badge">{conversation.unread}</span>}
                </div>
                <div className="conversation-info">
                  <div className="conversation-top">
                    <h4 className="conversation-name">
                      {user?.id === conversation.seller.id ? conversation.buyer.name : conversation.seller.name}
                    </h4>
                    <span className="conversation-time">{formatDate(conversation.lastMessageTime)}</span>
                  </div>
                  <div className="conversation-bottom">
                    <p className="conversation-product">{conversation.listing.title}</p>
                    <p className="conversation-preview">{conversation.lastMessage}</p>
                  </div>
                </div>
                <div className="conversation-image">
                  <img src={conversation.listing.image} alt={conversation.listing.title} />
                </div>
              </div>
            ))
          ) : (
            <div className="no-conversations">
              <FaUser className="no-conversations-icon" />
              <p>No conversations found</p>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>Clear search</button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className={`chat-area ${!showMobileConversations ? 'show-mobile' : 'hide-mobile'}`}>
        {activeConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-header-left">
                <button 
                  className="back-button mobile-only" 
                  onClick={() => setShowMobileConversations(true)}
                >
                  <FaArrowLeft />
                </button>
                <div className="chat-header-avatar">
                  <img 
                    src={user?.id === activeConversation.seller.id ? activeConversation.buyer.avatar : activeConversation.seller.avatar} 
                    alt="User Avatar" 
                  />
                </div>
                <div className="chat-header-info">
                  <h3>
                    {user?.id === activeConversation.seller.id ? activeConversation.buyer.name : activeConversation.seller.name}
                  </h3>
                  <p>{activeConversation.listing.title}</p>
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="menu-button">
                  <FaEllipsisV />
                </button>
              </div>
            </div>
            
            <div className="messages-container">
              <div className="listing-info">
                <div className="listing-image">
                  <img src={activeConversation.listing.image} alt={activeConversation.listing.title} />
                </div>
                <div className="listing-details">
                  <h3>{activeConversation.listing.title}</h3>
                  <p>You're chatting about this item</p>
                </div>
              </div>
              
              <div className="messages-list">
                {messages.map((message, index) => {
                  // Check if this is the first message of the day
                  const showDateDivider = index === 0 || 
                    new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();
                  
                  return (
                    <div key={message.id}>
                      {showDateDivider && (
                        <div className="date-divider">
                          <span>{new Date(message.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        </div>
                      )}
                      <div className={`message ${isOwnMessage(message.sender) ? 'own' : 'other'}`}>
                        <div className="message-content">
                          <p>{message.text}</p>
                          <span className="message-time">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              
              <form className="message-input" onSubmit={handleSendMessage}>
                <div className="input-actions">
                  <button type="button" className="attach-button">
                    <FaPaperclip />
                  </button>
                  <button type="button" className="image-button">
                    <FaImage />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="button" className="emoji-button">
                  <FaSmile />
                </button>
                <button 
                  type="submit" 
                  className="send-button"
                  disabled={!newMessage.trim()}
                >
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="no-conversation-content">
              <img src="/logo.png" alt="Marketplace Logo" className="no-conversation-logo" />
              <h2>Student Marketplace Chat</h2>
              <p>Select a conversation to start chatting</p>
              <button 
                className="mobile-view-conversations" 
                onClick={() => setShowMobileConversations(true)}
              >
                View Conversations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 