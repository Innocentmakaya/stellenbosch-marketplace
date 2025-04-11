# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Student Marketplace

A platform for students to buy and sell items within a campus community.

## Features

- User authentication with Supabase
- Upload and manage marketplace listings
- Browse and search for items
- In-app messaging between buyers and sellers
- Responsive design for all devices

## Chat Feature Setup

The Student Marketplace includes a real-time chat system powered by Supabase Realtime.

### Database Setup

To set up the chat functionality, you need to create two tables in your Supabase database:

1. Run the SQL migration in `supabase/migrations/20240614000000_create_chat_tables.sql`

The migration creates:
- `chats` table - Stores conversation metadata
- `messages` table - Stores individual messages
- Proper indexes and Row Level Security policies

### Supabase Realtime Configuration

Ensure Supabase Realtime is enabled for your project:

1. Go to your Supabase dashboard
2. Navigate to Database > Replication
3. Make sure `supabase_realtime` publication includes the `chats` and `messages` tables
4. Enable "Broadcast changes on inserts" for both tables

## Environment Variables

Create a `.env` file with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Building for Production

```bash
npm run build
```
