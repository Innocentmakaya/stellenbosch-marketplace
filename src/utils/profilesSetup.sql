-- Check if profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Check if policies exist, if not create them
DO $$
BEGIN
    -- Check and create policies for the profiles table
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Anyone can view profiles'
    ) THEN
        CREATE POLICY "Anyone can view profiles"
        ON profiles FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
        ON profiles FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile"
        ON profiles FOR UPDATE
        TO authenticated
        USING (auth.uid() = id);
    END IF;
END
$$;

-- Check if the update_timestamp function exists
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if trigger exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_profiles_timestamp'
    ) THEN
        CREATE TRIGGER update_profiles_timestamp
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
    END IF;
END
$$;

-- Create a profile for each existing user that doesn't have one
INSERT INTO profiles (id, full_name)
SELECT 
    id, 
    COALESCE(
        raw_user_meta_data->>'full_name', 
        email
    ) as full_name
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- Update the rides-profiles relationship
CREATE OR REPLACE FUNCTION get_profile_by_user_id(user_id UUID)
RETURNS jsonb AS $$
DECLARE
    profile_data jsonb;
BEGIN
    SELECT jsonb_build_object(
        'id', id,
        'full_name', full_name,
        'avatar_url', avatar_url
    ) INTO profile_data
    FROM profiles
    WHERE id = user_id;
    
    RETURN profile_data;
END;
$$ LANGUAGE plpgsql; 