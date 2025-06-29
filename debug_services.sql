-- Debug script to check services table and data

-- Check if services table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'services'
);

-- Check services table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'services'
ORDER BY ordinal_position;

-- Check if RLS is enabled on services table
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'services';

-- Check RLS policies on services table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'services';

-- Check if there's any data in services table
SELECT COUNT(*) as total_services FROM services;

-- Show sample data from services table
SELECT * FROM services LIMIT 5;

-- Check if there are any services with provider_id
SELECT provider_id, COUNT(*) as service_count
FROM services
GROUP BY provider_id;

-- Test query that should work for all users (if RLS allows)
SELECT id, name, location, service_type, contact_number, price, provider_id, created_at
FROM services
ORDER BY created_at DESC
LIMIT 10; 