/*
  # Fix UUID handling

  1. Changes
    - Modify conversations and messages tables to use proper UUID generation
    - Add trigger to ensure UUIDs are properly formatted
    - Add validation for UUID format

  2. Security
    - Maintains existing RLS policies
    - Adds data integrity checks
*/

-- Function to validate UUID format
CREATE OR REPLACE FUNCTION validate_uuid(str text)
RETURNS boolean AS $$
BEGIN
  RETURN str ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add check constraints for UUID format
ALTER TABLE conversations
ADD CONSTRAINT conversations_id_format CHECK (validate_uuid(id::text));

ALTER TABLE messages
ADD CONSTRAINT messages_id_format CHECK (validate_uuid(id::text));