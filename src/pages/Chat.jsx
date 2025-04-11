import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPaperPlane, FaArrowLeft, FaEllipsisV, FaSearch, FaUser, FaTimes, FaPaperclip, FaImage, FaSmile, FaComment, FaArrowDown, FaMapMarkerAlt } from "react-icons/fa";
import supabase from "../supabaseClient";
import LocationShare from "../components/LocationShare";
import "./Chat.css";

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileConversations, setShowMobileConversations] = useState(!chatId);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);
  const messagesSubscription = useRef(null);
  const conversationsSubscription = useRef(null);
  const [showLocationShare, setShowLocationShare] = useState(false);
  
  // Check for mobile screens on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Fetch initial data and set up subscriptions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          navigate('/login', { state: { from: '/chat' } });
          return;
        }
        
        setUser(currentUser);
        
        // Ensure tables exist
        await setupTables();
        
        // Fetch conversations after tables are set up
        await fetchConversations(currentUser.id);
        
        // Check profile table structure after user is set
        await setupProfileColumns(currentUser);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup
    return () => {
      if (messagesSubscription.current) {
        supabase.removeChannel(messagesSubscription.current);
      }
      if (conversationsSubscription.current) {
        supabase.removeChannel(conversationsSubscription.current);
      }
    };
  }, [navigate]);

  // Effect to handle direct navigation to a specific chat
  useEffect(() => {
    if (chatId && conversations.length > 0) {
      const targetConversation = conversations.find(conv => conv.id === chatId);
      if (targetConversation) {
        setActiveConversation(targetConversation);
        fetchMessages(targetConversation.id, user?.id);
      } else {
        // Chat not found - redirect to main chat page
        console.error(`Chat with ID ${chatId} not found`);
        navigate('/chat', { replace: true });
        setError(`The conversation you're looking for couldn't be found.`);
      }
    }
  }, [chatId, conversations, user?.id]);

  // Fetch conversations for the user
  const fetchConversations = async (userId) => {
    try {
      console.log("Fetching conversations for user:", userId);
      
      // First, let's get the basic chat data without complex joins
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id, 
          listing_id, 
          buyer_id, 
          seller_id, 
          last_message,
          last_message_time
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('last_message_time', { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        setError("Failed to load your conversations. Please try again later.");
        return;
      }

      console.log("Fetched conversations:", data);
      
      if (!data || data.length === 0) {
        setConversations([]);
        return;
      }
      
      // Now get the listings and profiles separately
      const formattedConversations = await Promise.all(data.map(async (chat) => {
        // Get listing details
        let listing = {
          id: chat.listing_id,
          title: "Listing",
          image: "https://via.placeholder.com/50"
        };
        
        try {
          const { data: listingData } = await supabase
            .from('listings')
            .select('id, title, image_url')
            .eq('id', chat.listing_id)
            .single();
            
          if (listingData) {
            listing = {
              id: listingData.id,
              title: listingData.title || "Listing",
              image: listingData.image_url || "https://via.placeholder.com/50"
            };
          }
        } catch (listingError) {
          console.error("Error fetching listing:", listingError);
        }
        
        // Get buyer profile
        let buyer = {
          id: chat.buyer_id,
          name: "User",
          avatar: `https://ui-avatars.com/api/?name=U&background=8b0000&color=fff`
        };
        
        try {
          const { data: buyerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', chat.buyer_id)
            .single();
            
          if (buyerData) {
            console.log("Buyer profile data:", buyerData);
            // Try to use any available name field, with fallbacks
            const buyerName = buyerData.username || 
                             buyerData.full_name || 
                             buyerData.name || 
                             (buyerData.first_name && `${buyerData.first_name} ${buyerData.last_name || ''}`.trim()) || 
                             'User';
            
            buyer = {
              id: buyerData.id,
              name: buyerName,
              avatar: buyerData.avatar_url || `https://ui-avatars.com/api/?name=${buyerName[0] || 'U'}&background=8b0000&color=fff`
            };
          }
        } catch (buyerError) {
          console.error("Error fetching buyer:", buyerError);
        }
        
        // Get seller profile
        let seller = {
          id: chat.seller_id,
          name: "User",
          avatar: `https://ui-avatars.com/api/?name=U&background=8b0000&color=fff`
        };
        
        try {
          const { data: sellerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', chat.seller_id)
            .single();
            
          if (sellerData) {
            console.log("Seller profile data:", sellerData);
            // Try to use any available name field, with fallbacks
            const sellerName = sellerData.username || 
                              sellerData.full_name || 
                              sellerData.name || 
                              (sellerData.first_name && `${sellerData.first_name} ${sellerData.last_name || ''}`.trim()) || 
                              'User';
            
            seller = {
              id: sellerData.id,
              name: sellerName,
              avatar: sellerData.avatar_url || `https://ui-avatars.com/api/?name=${sellerName[0] || 'U'}&background=8b0000&color=fff`
            };
          }
        } catch (sellerError) {
          console.error("Error fetching seller:", sellerError);
        }
        
        const isSeller = chat.seller_id === userId;
        const otherPerson = isSeller ? buyer : seller;
        
        return {
          id: chat.id,
          listing,
          otherPerson,
          lastMessage: chat.last_message || "Start chatting...",
          lastMessageTime: chat.last_message_time || new Date().toISOString(),
          unread: 0 // We'll fetch this separately
        };
      }));

      console.log("Formatted conversations:", formattedConversations);
      setConversations(formattedConversations);

      // After fetching conversations, check if we need to open a specific one
      if (chatId && formattedConversations.length > 0) {
        const targetConversation = formattedConversations.find(conv => conv.id === chatId);
        if (targetConversation) {
          console.log("Opening target conversation:", targetConversation);
          setActiveConversation(targetConversation);
          fetchMessages(targetConversation.id, userId);
        }
      }

      // Subscribe to chat updates
      setupConversationsSubscription(userId);
    } catch (error) {
      console.error("Error in fetchConversations:", error);
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  // Setup real-time subscription for conversations
  const setupConversationsSubscription = (userId) => {
    // Clean up existing subscription if any
    if (conversationsSubscription.current) {
      supabase.removeChannel(conversationsSubscription.current);
    }

    // Create new subscription
    conversationsSubscription.current = supabase
      .channel('public:chats')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'chats',
          filter: `buyer_id=eq.${userId}` 
        },
        (payload) => handleChatUpdate(payload)
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'chats',
          filter: `seller_id=eq.${userId}` 
        },
        (payload) => handleChatUpdate(payload)
      )
      .subscribe();
  };

  // Handle chat updates from real-time subscription
  const handleChatUpdate = async (payload) => {
    const updatedChat = payload.new;
    
    // Refresh conversations to get the latest data
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetchConversations(user.id);
    }
  };

  // Fetch messages for a specific chat
  const fetchMessages = async (chatId, userId) => {
    try {
      console.log("Fetching messages for chat:", chatId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        setError(`Could not load messages: ${error.message}`);
        return;
      }

      console.log("Fetched messages:", data?.length || 0, "messages");
      setMessages(data || []);

      // Mark messages as read
      await markMessagesAsRead(chatId, userId);

      // Set up subscription for new messages
      setupMessagesSubscription(chatId);
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      setError("Failed to load messages. Please try again later.");
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (chatId, userId) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .match({ 
          chat_id: chatId,
          read: false
        })
        .neq('sender_id', userId);

      if (error) {
        console.error("Error marking messages as read:", error);
      }
    } catch (error) {
      console.error("Error in markMessagesAsRead:", error);
    }
  };

  // Setup real-time subscription for messages
  const setupMessagesSubscription = (chatId) => {
    try {
      console.log("Setting up messages subscription for chat:", chatId);
      
      // Clean up existing subscription if any
      if (messagesSubscription.current) {
        console.log("Removing existing messages subscription");
        supabase.removeChannel(messagesSubscription.current);
      }

      // Create new subscription
      console.log("Creating new messages subscription");
      messagesSubscription.current = supabase
        .channel(`public:messages:${chatId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `chat_id=eq.${chatId}` 
          },
          (payload) => {
            console.log("Received new message:", payload);
            const newMessage = payload.new;
            setMessages(prevMessages => [...prevMessages, newMessage]);
            
            // Mark message as read if it's not from current user
            if (newMessage.sender_id !== user?.id) {
              markMessagesAsRead(chatId, user?.id);
            }
          }
        )
        .subscribe((status) => {
          console.log("Messages subscription status:", status);
        });
        
      console.log("Messages subscription set up successfully");
    } catch (error) {
      console.error("Error setting up messages subscription:", error);
    }
  };

  // Function to handle sending a location
  const handleSendLocation = (locationData) => {
    if (!activeConversation || !user) return;
    
    try {
      setSendingMessage(true);
      
      // Format the location message
      const locationMessage = JSON.stringify({
        type: 'location',
        data: locationData
      });
      
      // Send the message with the location data
      handleSendMessage(null, locationMessage);
      
      // Close the location share modal
      setShowLocationShare(false);
    } catch (error) {
      console.error("Error sending location:", error);
      setError("Failed to send location. Please try again.");
      setSendingMessage(false);
    }
  };
  
  // Update the handleSendMessage function to accept custom message content
  const handleSendMessage = async (e, customContent = null) => {
    if (e) e.preventDefault();
    
    const messageContent = customContent || newMessage.trim();
    if (!messageContent || !activeConversation || sendingMessage) return;
    
    try {
      setSendingMessage(true);
      
      // Send the message to Supabase
      const { data, error } = await supabase.from('messages').insert({
        chat_id: activeConversation.id,
        sender_id: user.id,
        message: messageContent,
        read: false
      });
      
      if (error) throw error;
      
      // Clear the input field if this was a text message
      if (!customContent) setNewMessage("");
      
      // Update the last message in the chat
      const { error: updateError } = await supabase
        .from('chats')
        .update({
          last_message: messageContent,
          last_message_time: new Date().toISOString()
        })
        .eq('id', activeConversation.id);
      
      if (updateError) {
        console.error("Error updating last message:", updateError);
        // Not critical, so we don't need to show an error
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Select conversation and fetch messages
  const selectConversation = async (conversation) => {
    if (conversation.id === activeConversation?.id) return;
    
    setActiveConversation(conversation);
    setMessages([]);
    setShowMobileConversations(false);
    
    // Fetch messages for this conversation
    await fetchMessages(conversation.id, user?.id);
    
    // Update URL to include the chat ID without refreshing the page
    navigate(`/chat/${conversation.id}`, { replace: true });
  };
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => 
    conv.otherPerson.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Detect when scrolled away from bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesListRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = messagesListRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };
    
    const messagesList = messagesListRef.current;
    if (messagesList) {
      messagesList.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (messagesList) {
        messagesList.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeConversation]);
  
  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
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
  
  // Format date for day separators
  const formatDayOnly = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If today, show "Today"
    if (date.getDate() === today.getDate() && 
        date.getMonth() === today.getMonth() && 
        date.getFullYear() === today.getFullYear()) {
      return 'Today';
    }
    
    // If yesterday, show "Yesterday"
    if (date.getDate() === yesterday.getDate() && 
        date.getMonth() === yesterday.getMonth() && 
        date.getFullYear() === yesterday.getFullYear()) {
      return 'Yesterday';
    }
    
    // Otherwise show date
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };
  
  // Check if a new day separator should be shown
  const shouldShowDaySeparator = (currentMessage, previousMessage) => {
    if (!previousMessage || !currentMessage) return false;
    
    const currentDate = new Date(currentMessage.created_at);
    const previousDate = new Date(previousMessage.created_at);
    
    return (
      currentDate.getDate() !== previousDate.getDate() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getFullYear() !== previousDate.getFullYear()
    );
  };
  
  // Update the renderMessages function to handle location messages
  const renderMessages = () => {
    if (!messages || messages.length === 0) {
      return (
        <div className="no-messages">
          <div className="logo-placeholder">
            <FaComment className="logo-icon" />
          </div>
          <p>No messages yet</p>
          <p className="hint">Start the conversation by sending a message</p>
        </div>
      );
    }

    let lastMessageDate = null;
    
    return messages.map((message, index) => {
      // Check if we need to show a day separator
      const showDaySeparator = shouldShowDaySeparator(
        message, 
        index > 0 ? messages[index - 1] : null
      );
      
      // Update last message date if showing separator
      if (showDaySeparator) {
        lastMessageDate = new Date(message.created_at).toDateString();
      }
      
      // Check if this is a location message
      let isLocationMessage = false;
      let locationData = null;
      
      try {
        const messageData = JSON.parse(message.message);
        if (messageData.type === 'location') {
          isLocationMessage = true;
          locationData = messageData.data;
        }
      } catch (e) {
        // Not a JSON message, treat as normal text
      }
      
      // Message classes
      const messageClass = isOwnMessage(message.sender_id) 
        ? "message-bubble own" 
        : "message-bubble other";
        
      return (
        <React.Fragment key={message.id}>
          {showDaySeparator && (
            <div className="day-separator">
              <span className="day-label">{formatDayOnly(message.created_at)}</span>
            </div>
          )}
          
          <div className={`message ${isOwnMessage(message.sender_id) ? 'own' : 'other'}`}>
            {isLocationMessage ? (
              <div className={`${messageClass} location-message`}>
                <div className="location-message-content">
                  <div className="location-icon-container">
                    <FaMapMarkerAlt className="location-icon" />
                  </div>
                  <div className="location-info">
                    <div className="location-name">{locationData.name}</div>
                    <div className="location-coords">
                      {locationData.position.lat.toFixed(6)}, {locationData.position.lng.toFixed(6)}
                    </div>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${locationData.position.lat},${locationData.position.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-map-link"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>
                <div className="message-time">{formatDate(message.created_at)}</div>
              </div>
            ) : (
              <div className={messageClass}>
                <div className="message-content">{message.message}</div>
                <div className="message-time">{formatDate(message.created_at)}</div>
              </div>
            )}
          </div>
        </React.Fragment>
      );
    });
  };
  
  // Helper to determine if message is from current user
  const isOwnMessage = (senderId) => user?.id === senderId;
  
  // Add a new function to create a test chat
  const createTestChat = async () => {
    if (!user) {
      console.error("No user found, cannot create test chat");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Creating test chat with user:", user.id);
      
      // First check if we have any listings
      const { data: listings, error: listingError } = await supabase
        .from('listings')
        .select('id, user_id, title, image_url')
        .limit(5);
      
      if (listingError) {
        console.error("Error fetching listings:", listingError);
        throw listingError;
      }
      
      console.log("Available listings:", listings);
      
      if (!listings || listings.length === 0) {
        console.error("No listings found");
        alert("No listings found. Please create a listing first.");
        navigate('/sell');
        return;
      }
      
      // Try to find a listing that's not by the current user
      let listing = listings.find(l => l.user_id !== user.id);
      
      // If all listings are from the current user, just use the first one
      if (!listing) {
        console.log("All listings are from current user, using the first one anyway");
        listing = listings[0];
      }
      
      console.log("Selected listing for test chat:", listing);
      
      // Create a new chat
      const chatData = {
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.user_id,
        last_message: `Test chat about: ${listing.title}`,
        last_message_time: new Date().toISOString()
      };
      
      console.log("Creating chat with data:", chatData);
      
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert(chatData)
        .select();
      
      if (createError) {
        console.error("Error creating test chat:", createError);
        throw createError;
      }
      
      console.log("Created test chat:", newChat);
      
      if (newChat && newChat.length > 0) {
        // Create initial message
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            chat_id: newChat[0].id,
            sender_id: user.id,
            message: "Hi! This is a test message.",
            read: false
          });
          
        if (messageError) {
          console.error("Error creating initial message:", messageError);
          // Continue anyway
        } else {
          console.log("Created initial message for test chat");
        }
        
        // Refresh conversations
        await fetchConversations(user.id);
        
        // Navigate to the new chat
        navigate(`/chat/${newChat[0].id}`);
      }
    } catch (error) {
      console.error("Error creating test chat:", error);
      setError("Failed to create test chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Ensure profile table has needed columns
  const setupProfileColumns = async (currentUser) => {
    if (!currentUser) return;
    
    try {
      console.log("Checking profile table structure...");
      
      // Check if we have a profile entry for the current user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return;
      }
      
      console.log("Current user profile:", profile);
      
      // Check if we need to update the profile to include first_name and last_name
      if (profile && (!profile.first_name || !profile.last_name)) {
        console.log("Updating profile with missing name fields");
        
        // Get name parts from email or username
        let firstName = "User";
        let lastName = "";
        
        if (currentUser.email) {
          const emailName = currentUser.email.split('@')[0];
          const nameParts = emailName.split(/[._-]/);
          if (nameParts.length > 0) {
            firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
            if (nameParts.length > 1) {
              lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
            }
          }
        }
        
        // Update profile if this user doesn't have a first_name or last_name
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            first_name: profile.first_name || firstName,
            last_name: profile.last_name || lastName 
          })
          .eq('id', currentUser.id);
        
        if (updateError) {
          console.error("Error updating profile:", updateError);
        } else {
          console.log("Updated profile with name fields");
        }
      }
    } catch (error) {
      console.error("Error in setupProfileColumns:", error);
    }
  };
  
  // Setup tables if they don't exist
  const setupTables = async () => {
    try {
      console.log("Checking if chat tables exist...");
      
      // Try to query the chats table
      const { error: chatError } = await supabase
        .from('chats')
        .select('id')
        .limit(1);
      
      // If there's an error, the table might not exist
      if (chatError) {
        console.error("Error querying chats table:", chatError);
        console.log("Showing alert to create tables...");
        
        // Alert the user that they need to set up the tables
        const shouldSetup = window.confirm(
          "The chat tables might not be set up correctly. Would you like to see SQL commands to create them?"
        );
        
        if (shouldSetup) {
          const sqlCommands = `
-- Create chat tables for the Student Marketplace app
-- Run this in your Supabase SQL Editor

-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id BIGINT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Create a unique constraint to prevent duplicate chats for the same listing and buyer
    UNIQUE (listing_id, buyer_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_chats_buyer_id ON public.chats(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chats_seller_id ON public.chats(seller_id);
CREATE INDEX IF NOT EXISTS idx_chats_listing_id ON public.chats(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chats table
CREATE POLICY "Buyers and sellers can view their own chats" 
ON public.chats FOR SELECT 
TO authenticated
USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id
);

CREATE POLICY "Buyers can insert chats" 
ON public.chats FOR INSERT 
TO authenticated
WITH CHECK (
    auth.uid() = buyer_id
);

CREATE POLICY "Buyers and sellers can update their own chats" 
ON public.chats FOR UPDATE 
TO authenticated
USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id
);

-- Create RLS policies for messages table
CREATE POLICY "Chat participants can view messages" 
ON public.messages FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chats
        WHERE chats.id = messages.chat_id
        AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    )
);

CREATE POLICY "Chat participants can insert messages" 
ON public.messages FOR INSERT 
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chats
        WHERE chats.id = messages.chat_id
        AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    ) AND
    sender_id = auth.uid()
);

CREATE POLICY "Participants can update message read status" 
ON public.messages FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chats
        WHERE chats.id = messages.chat_id
        AND (chats.buyer_id = auth.uid() OR chats.seller_id = auth.uid())
    )
);

-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
`;
          
          alert("Copy the following SQL and run it in your Supabase SQL Editor:\n\n" + sqlCommands);
          
          // For convenience, copy to clipboard
          try {
            await navigator.clipboard.writeText(sqlCommands);
            alert("SQL commands copied to clipboard!");
          } catch (clipboardError) {
            console.error("Could not copy to clipboard:", clipboardError);
          }
        }
      } else {
        console.log("Chat tables exist, checking messages table...");
        
        // Check if messages table exists
        const { error: messageError } = await supabase
          .from('messages')
          .select('id')
          .limit(1);
          
        if (messageError) {
          console.error("Error querying messages table:", messageError);
        } else {
          console.log("Messages table exists, table setup is complete");
        }
      }
    } catch (error) {
      console.error("Error in setupTables:", error);
    }
  };
  
  // Render loading state
  if (loading && !activeConversation) {
    return (
      <div className="page-container">
        <div className="chat-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container" style={{ marginTop: isMobile ? '60px' : '70px' }}>
      <div className="chat-container">
        {/* Conversations sidebar */}
        <div className={`conversations-container ${showMobileConversations ? 'mobile-visible' : 'mobile-hidden'}`}>
          <div className="conversations-header">
            <h2>Messages</h2>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-messages">
                <p>No conversations yet</p>
                {/* Create Test Chat Button for testing */}
                <button onClick={createTestChat} className="create-test-chat">
                  Create Test Chat
                </button>
              </div>
            ) : (
              conversations
                .filter(conv => 
                  searchQuery === '' || 
                  conv.otherPerson.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((conversation) => (
                  <div 
                    key={conversation.id} 
                    className={`conversation-item ${activeConversation?.id === conversation.id ? 'active' : ''}`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="conversation-avatar">
                      <img 
                        src={conversation.otherPerson.avatar} 
                        alt={conversation.otherPerson.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.otherPerson.name)}&background=8b0000&color=fff`;
                        }}
                      />
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <span className="conversation-name">{conversation.otherPerson.name}</span>
                        <span className="conversation-time">{formatDate(conversation.lastMessageTime)}</span>
                      </div>
                      <div className="conversation-preview">
                        <span className="conversation-listing">{conversation.listing.title}</span>
                        <span className="conversation-last-message">{conversation.lastMessage}</span>
                        {conversation.unread > 0 && (
                          <span className="unread-badge">{conversation.unread}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className={`messages-container ${!showMobileConversations ? 'mobile-visible' : 'mobile-hidden'}`}>
          {activeConversation ? (
            <>
              <div className="messages-header">
                <button 
                  className="back-button" 
                  onClick={() => setShowMobileConversations(true)}
                  aria-label="Back to conversations"
                >
                  <FaArrowLeft />
                </button>
                <div className="active-conversation-info">
                  <div className="active-avatar">
                    <img 
                      src={activeConversation.otherPerson.avatar} 
                      alt={activeConversation.otherPerson.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.otherPerson.name)}&background=8b0000&color=fff`;
                      }}
                    />
                  </div>
                  <div className="active-details">
                    <h3>{activeConversation.otherPerson.name}</h3>
                    <p className="listing-title">Re: {activeConversation.listing.title}</p>
                  </div>
                </div>
                <button className="options-button" aria-label="More options">
                  <FaEllipsisV />
                </button>
              </div>

              <div className="messages-list" ref={messagesListRef}>
                {renderMessages()}
                <div ref={messagesEndRef} />
              </div>
              
              {showScrollButton && (
                <button 
                  className="scroll-bottom-button" 
                  onClick={scrollToBottom}
                  aria-label="Scroll to bottom"
                >
                  <FaArrowDown />
                </button>
              )}

              <div className="message-input-container">
                <button 
                  className="attachment-button"
                  onClick={() => setShowLocationShare(true)}
                  disabled={!activeConversation}
                  title="Share location"
                >
                  <FaMapMarkerAlt />
                </button>
                <form onSubmit={handleSendMessage} className="message-form">
                  <input
                    type="text"
                    className="message-input"
                    placeholder={activeConversation ? "Type a message..." : "Select a conversation to start messaging"}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={!activeConversation || sendingMessage}
                  />
                  <button
                    type="submit"
                    className={`send-button ${sendingMessage ? 'sending' : ''}`}
                    disabled={!activeConversation || !newMessage.trim() || sendingMessage}
                  >
                    {sendingMessage ? (
                      <div className="spinner"></div>
                    ) : (
                      <FaPaperPlane />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="select-conversation">
              <div className="logo-placeholder">
                <FaComment className="logo-icon" />
              </div>
              <h2>Student Marketplace Chat</h2>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Location Share Modal */}
      {showLocationShare && (
        <>
          <div className="location-share-overlay" onClick={() => setShowLocationShare(false)} />
          <LocationShare 
            onSelectLocation={handleSendLocation}
            onClose={() => setShowLocationShare(false)}
          />
        </>
      )}
    </div>
  );
};

export default Chat; 