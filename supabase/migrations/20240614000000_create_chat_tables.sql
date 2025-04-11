-- Create chat tables for the Student Marketplace app
-- This migration adds tables for real-time chat functionality

-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
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