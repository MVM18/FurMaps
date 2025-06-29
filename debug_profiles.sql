-- Debug script to check profiles table and provider roles

-- Check if profiles table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'profiles'
);

-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if RLS is enabled on profiles table
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- Check RLS policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Check all users and their roles
SELECT id, full_name, email, role, created_at
FROM profiles
ORDER BY created_at DESC;

-- Count users by role
SELECT role, COUNT(*) as user_count
FROM profiles
GROUP BY role;

-- Check providers specifically
SELECT id, full_name, email, role, created_at
FROM profiles
WHERE role = 'provider'
ORDER BY created_at DESC;

-- Check services and their providers
SELECT 
    s.id as service_id,
    s.name as service_name,
    s.provider_id,
    p.full_name as provider_name,
    p.role as provider_role,
    p.email as provider_email
FROM services s
LEFT JOIN profiles p ON s.provider_id = p.id
ORDER BY s.created_at DESC;

-- Check services from providers only
SELECT 
    s.id as service_id,
    s.name as service_name,
    s.location,
    s.service_type,
    s.price,
    p.full_name as provider_name,
    p.role as provider_role
FROM services s
INNER JOIN profiles p ON s.provider_id = p.id
WHERE p.role = 'provider'
ORDER BY s.created_at DESC;

-- Count services by provider role
SELECT 
    p.role,
    COUNT(s.id) as service_count
FROM profiles p
LEFT JOIN services s ON p.id = s.provider_id
GROUP BY p.role; 