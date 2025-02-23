/*
  # Create conversations and messages tables

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `timestamp` (timestamptz)
      - `appliance` (jsonb, for storing appliance details)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `role` (text, either 'user' or 'assistant')
      - `content` (text)
      - `timestamp` (timestamptz)
      - `error` (text, nullable)
      - `qr_data` (text, nullable)
      - `images` (text[], nullable)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  appliance jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  error text,
  qr_data text,
  images text[],
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Users can manage their own conversations"
  ON conversations
  USING (auth.uid() = user_id);

-- Create policies for messages
CREATE POLICY "Users can manage messages in their conversations"
  ON messages
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );