-- SQL Schema for Web-OS Supabase Project
-- Production-ready schema for account creation flow: Email+Password → OTP → Username Selection

-- ===================================
-- ACCOUNT MANAGEMENT SCHEMA
-- ===================================

-- Profiles Table (created by default with Supabase Auth)
-- Stores user profile information after successful signup and OTP verification
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 15),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- ===================================
-- LETTER SYSTEM SCHEMA
-- ===================================

-- Letters Table
-- Stores all user correspondence 
CREATE TABLE public.letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id),
  recipient_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT DEFAULT 'normal',
  expires_at TIMESTAMP WITH TIME ZONE,
  read BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security (RLS) on letters
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for letters
CREATE POLICY "Users can view letters they sent or received" 
  ON public.letters 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create letters" 
  ON public.letters 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own letters" 
  ON public.letters 
  FOR DELETE 
  USING (auth.uid() = sender_id);

CREATE POLICY "Public links are viewable by everyone" 
  ON public.letters 
  FOR SELECT 
  USING (recipient_id IS NULL);

-- Search function for letters
CREATE OR REPLACE FUNCTION search_letters(search_term TEXT) 
RETURNS SETOF letters 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public 
AS $$
  SELECT * FROM letters
  WHERE 
    (auth.uid() = sender_id OR auth.uid() = recipient_id) 
    AND (
      content ILIKE '%' || search_term || '%'
    )
  ORDER BY created_at DESC;
$$; 

-- Allow users to insert their own profile
CREATE POLICY "Users can create their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);