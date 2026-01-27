-- ============================================
-- Auto-create Profile Trigger
-- ============================================
-- This trigger automatically creates a profile entry when a new user signs up
-- The role is extracted from user metadata, defaulting to 'customer' if not specified

-- Function to handle new user signup and create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'is_verified')::boolean, false),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add comment
COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates a profile entry when a new user signs up via Supabase Auth';
