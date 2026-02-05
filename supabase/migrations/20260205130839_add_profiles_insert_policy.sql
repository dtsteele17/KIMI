/*
  # Add INSERT policy for profiles table

  1. Security Changes
    - Add policy to allow authenticated users to insert their own profile during signup
    - Policy ensures users can only create a profile with their own auth.uid()

  ## Important Notes
  - This policy is required for the signup flow to work correctly
  - Without it, new users cannot create their profile records during registration
*/

CREATE POLICY "Users can insert own profile during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
