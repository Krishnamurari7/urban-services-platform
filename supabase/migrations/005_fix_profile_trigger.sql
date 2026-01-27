-- ============================================
-- Fix Profile Trigger - Ensure it works with RLS
-- ============================================
-- This migration fixes the profile creation trigger to ensure it works properly
-- even when RLS policies are in place

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role user_role;
  user_full_name TEXT;
BEGIN
  -- Extract role from user metadata, default to 'customer'
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'customer'::user_role
  );
  
  -- Extract full_name from user metadata
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  
  -- Create profile for the new user
  -- SECURITY DEFINER ensures this bypasses RLS
  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    avatar_url,
    is_verified,
    is_active
  )
  VALUES (
    NEW.id,
    user_role,
    user_full_name,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    COALESCE((NEW.raw_user_meta_data->>'is_verified')::boolean, false),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;

-- Add comment
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates a profile entry when a new user signs up via Supabase Auth. Uses SECURITY DEFINER to bypass RLS policies.';
