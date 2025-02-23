/*
  # Fix messages RLS policy

  1. Changes
    - Update RLS policy for messages table to allow users to insert messages into their own conversations
    - Add policy for inserting messages
    - Keep existing policy for reading messages

  2. Security
    - Maintains row-level security
    - Only allows users to insert messages into conversations they own
    - Preserves existing read access control
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage messages in their conversations" ON messages;

-- Create separate policies for select and insert
CREATE POLICY "Users can read messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages into their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );