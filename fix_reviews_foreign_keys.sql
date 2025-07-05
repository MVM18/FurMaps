-- Fix foreign key relationships for reviews table
-- Run this script in your Supabase SQL editor

-- First, check if the reviews table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'reviews'
);

-- Drop existing foreign key constraints if they exist
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_pet_owner_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_service_provider_id_fkey;

-- Add foreign key constraint to profiles table for pet_owner_id
ALTER TABLE reviews ADD CONSTRAINT reviews_pet_owner_id_fkey 
    FOREIGN KEY (pet_owner_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add foreign key constraint to profiles table for service_provider_id
ALTER TABLE reviews ADD CONSTRAINT reviews_service_provider_id_fkey 
    FOREIGN KEY (service_provider_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Verify the constraints were created
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'reviews';

-- Test the relationship by checking if we can query reviews with profiles
-- This should work after the foreign keys are properly set up
SELECT 
    r.id,
    r.rating,
    r.comment,
    r.created_at,
    p.first_name,
    p.last_name
FROM reviews r
LEFT JOIN profiles p ON r.pet_owner_id = p.user_id
LIMIT 5; 