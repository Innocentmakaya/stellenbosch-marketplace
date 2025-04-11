# Chat Feature Documentation

## Overview

The Student Marketplace app includes a real-time chat system that allows buyers and sellers to communicate directly within the platform. This feature uses Supabase Realtime for instant messaging.

## Features

- **Real-time messaging**: Messages appear instantly without refreshing
- **Chat history**: All conversations are saved and can be viewed at any time
- **Listing context**: Each chat is associated with a specific listing
- **Message status**: See when messages are read
- **Mobile responsive**: Works on any device size

## How to Use the Chat Feature

### For Buyers

1. **Start a Conversation**:
   - Browse to any listing you're interested in
   - Click the "Chat with Seller" button in the "Connect" tab
   - If you're not logged in, you'll be prompted to log in first

2. **Send Messages**:
   - Type your message in the input field at the bottom of the chat window
   - Press Enter or click the send button to send your message
   - Your message will appear immediately in the chat

3. **View All Conversations**:
   - Navigate to the Chat page from the navigation menu
   - All your conversations will be displayed in the sidebar
   - Click on any conversation to view and continue the chat

### For Sellers

1. **Respond to Messages**:
   - You'll receive a notification when a buyer sends you a message
   - Navigate to the Chat page from the navigation menu
   - Select the conversation to respond to
   - Type and send your message

2. **Manage Multiple Conversations**:
   - All conversations about your listings will appear in your chat list
   - The most recent conversations appear at the top
   - You can search for specific conversations using the search bar

## Technical Implementation

### Database Structure

The chat feature uses two main tables:

1. **chats**:
   - `id`: Unique identifier for the chat
   - `listing_id`: Reference to the listing being discussed
   - `buyer_id`: The user who initiated the chat
   - `seller_id`: The owner of the listing
   - `last_message`: The most recent message content
   - `last_message_time`: Timestamp of the most recent message

2. **messages**:
   - `id`: Unique identifier for the message
   - `chat_id`: Reference to the parent chat
   - `sender_id`: The user who sent the message
   - `message`: The message content
   - `read`: Boolean indicating if the message has been read
   - `created_at`: Timestamp when the message was sent

### Supabase Realtime

The chat feature leverages Supabase Realtime to provide instant messaging:

- Real-time subscriptions track new messages and conversation updates
- Row-level security ensures users can only access their own conversations
- Optimistic UI updates provide a smooth user experience

## Troubleshooting

**Messages not appearing instantly?**
- Ensure you have a stable internet connection
- Verify that Supabase Realtime is enabled in your project

**Can't start a new chat?**
- Make sure you're logged in
- Verify that you're not trying to chat with yourself about your own listing

**Messages marked as read incorrectly?**
- This happens automatically when you view a conversation
- If messages are not being marked as read, try refreshing the page

## Future Enhancements

Planned improvements for the chat feature:

- Image sharing in messages
- Group chats for items with multiple interested buyers
- Message delivery status indicators
- Push notifications for new messages
- Audio/video chat integration 