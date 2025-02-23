/*
  # Create admin users table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `admin_users` table
    - Add policy for authenticated admin users to read their own data
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can read their own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Admin users can insert their own data"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = email);