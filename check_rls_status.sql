-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN tablename IN ('messages', 'profiles', 'bookings') THEN 'SHOULD HAVE RLS'
        WHEN tablename IN ('services') THEN 'SHOULD NOT HAVE RLS'
        ELSE 'CHECK MANUALLY'
    END as recommendation
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check current RLS policies for each table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if real-time is enabled for tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN tablename IN ('messages') THEN 'NEEDS REAL-TIME'
        ELSE 'OPTIONAL'
    END as realtime_needed
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 