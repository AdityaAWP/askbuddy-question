-- This file contains the SQL schema for the Supabase database
-- It's for reference only and should be executed in the Supabase SQL editor

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    host_id UUID REFERENCES auth.users(id), -- Foreign key to auth.users
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'setup',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- Foreign key to auth.users
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    avatar_emoji TEXT NOT NULL,
    is_host BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB -- Store additional data like guest_id
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    current_owner_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms
CREATE POLICY "Anyone can read rooms" ON public.rooms
    FOR SELECT USING (true);

-- Allow anyone to read players
CREATE POLICY "Anyone can read players" ON public.players
    FOR SELECT USING (true);

-- Allow anyone to read questions
CREATE POLICY "Anyone can read questions" ON public.questions
    FOR SELECT USING (true);

-- Add metadata column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'players' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.players ADD COLUMN metadata JSONB;
    END IF;
END $$;
