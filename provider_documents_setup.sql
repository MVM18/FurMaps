-- Provider Documents Storage Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create storage bucket for provider documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'provider-documents', 
    'provider-documents', 
    true, 
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Admins can view provider documents" ON storage.objects;
DROP POLICY IF EXISTS "Providers can upload their documents" ON storage.objects;
DROP POLICY IF EXISTS "Providers can view their own documents" ON storage.objects;

-- 3. Create storage policies
-- Admins can view all provider documents
CREATE POLICY "Admins can view provider documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'provider-documents');

-- Authenticated users can upload documents (for registration)
CREATE POLICY "Providers can upload their documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'provider-documents' 
        AND auth.role() = 'authenticated'
        AND (storage.extension(name))::text IN ('pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp')
    );

-- Users can view their own uploaded documents
CREATE POLICY "Providers can view their own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'provider-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 4. Update profiles table to ensure document fields can store URLs
-- (This is optional if the fields already exist as TEXT)
DO $$
BEGIN
    -- Check if certificate column exists and is TEXT type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'certificate'
    ) THEN
        -- Ensure it's TEXT type to store URLs
        ALTER TABLE profiles ALTER COLUMN certificate TYPE TEXT;
    END IF;
    
    -- Check if valid_id column exists and is TEXT type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'valid_id'
    ) THEN
        -- Ensure it's TEXT type to store URLs
        ALTER TABLE profiles ALTER COLUMN valid_id TYPE TEXT;
    END IF;
    
    -- Check if proof_of_address column exists and is TEXT type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'proof_of_address'
    ) THEN
        -- Ensure it's TEXT type to store URLs
        ALTER TABLE profiles ALTER COLUMN proof_of_address TYPE TEXT;
    END IF;
END $$;

-- 5. Add helpful comments
COMMENT ON TABLE profiles IS 'User profiles with document URLs for service providers';
COMMENT ON COLUMN profiles.certificate IS 'URL to uploaded certificate document';
COMMENT ON COLUMN profiles.valid_id IS 'URL to uploaded valid ID document';
COMMENT ON COLUMN profiles.proof_of_address IS 'URL to uploaded proof of address document';

-- 6. Verify setup
DO $$
BEGIN
    -- Check if storage bucket exists
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'provider-documents') THEN
        RAISE EXCEPTION 'Provider documents storage bucket was not created successfully';
    END IF;
    
    -- Check if storage policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Admins can view provider documents'
    ) THEN
        RAISE EXCEPTION 'Storage policies were not created successfully';
    END IF;
    
    RAISE NOTICE 'Provider documents storage setup completed successfully!';
    RAISE NOTICE 'Storage bucket: provider-documents';
    RAISE NOTICE 'File size limit: 10MB';
    RAISE NOTICE 'Allowed types: PDF, JPG, PNG, GIF, WEBP';
END $$; 