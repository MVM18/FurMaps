-- Fix RLS settings for all tables

-- 1. MESSAGES TABLE - Should have RLS enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;

-- Create proper policies for messages
CREATE POLICY "Users can view their messages" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

CREATE POLICY "Users can update their messages" ON messages
    FOR UPDATE USING (
        auth.uid() = sender_id
    );

-- 2. PROFILES TABLE - Should have RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policies for profiles
CREATE POLICY "Users can view profiles" ON profiles
    FOR SELECT USING (true); -- Allow viewing all profiles (needed for service browsing)

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- 3. BOOKINGS TABLE - Should have RLS enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Pet owners can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Service providers can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update bookings" ON bookings;

-- Create policies for bookings
CREATE POLICY "Pet owners can view their bookings" ON bookings
    FOR SELECT USING (
        auth.uid() = pet_owner_id
    );

CREATE POLICY "Service providers can view their bookings" ON bookings
    FOR SELECT USING (
        auth.uid() = service_provider_id
    );

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (
        auth.uid() = pet_owner_id
    );

CREATE POLICY "Service providers can update their bookings" ON bookings
    FOR UPDATE USING (
        auth.uid() = service_provider_id
    );

-- 4. SERVICES TABLE - Should NOT have RLS (disable it)
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies on services
DROP POLICY IF EXISTS "Users can view services" ON services;
DROP POLICY IF EXISTS "Service providers can manage their services" ON services;

-- Create simple policies for services (without RLS)
-- Note: These won't be enforced since RLS is disabled, but they're here for reference
-- CREATE POLICY "Users can view services" ON services FOR SELECT USING (true);
-- CREATE POLICY "Service providers can manage their services" ON services 
--     FOR ALL USING (auth.uid() = provider_id);

-- 5. Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 6. Grant necessary permissions
GRANT ALL ON messages TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON bookings TO authenticated;
GRANT ALL ON services TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 7. Verify the setup
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN tablename IN ('messages', 'profiles', 'bookings') AND rowsecurity = true THEN '✅ CORRECT'
        WHEN tablename = 'services' AND rowsecurity = false THEN '✅ CORRECT'
        ELSE '❌ NEEDS FIXING'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 