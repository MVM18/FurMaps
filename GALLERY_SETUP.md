# Gallery Setup Guide

This guide explains how to set up the gallery functionality for service providers in the FurMaps application.

## Database Setup

### 1. Create the Gallery Images Table

Run the SQL script in `gallery_setup.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `gallery_setup.sql`
4. Execute the script

This will create:
- A `gallery_images` table with all necessary fields
- Indexes for better performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### 2. Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Click "Create a new bucket"
4. Name it `gallery-images`
5. Set it to **Public** (so images can be viewed by pet owners)
6. Click "Create bucket"

### 3. Configure Storage Policies

After creating the bucket, you need to set up storage policies. Go to Storage > Policies and add these policies for the `gallery-images` bucket:

#### For INSERT (Upload):
```sql
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery-images' AND 
  auth.role() = 'authenticated'
);
```

#### For SELECT (View):
```sql
-- Allow public viewing of gallery images
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery-images');
```

#### For DELETE:
```sql
-- Allow users to delete their own images
CREATE POLICY "Allow users to delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gallery-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Features

### 1. Image Upload
- Service providers can upload multiple images at once
- File size validation (max 5MB per image)
- Image type validation (only image files)
- Progress indication during upload

### 2. Image Management
- View all uploaded images in a grid layout
- Delete images with confirmation
- Automatic cleanup from both database and storage

### 3. Gallery Display
- Responsive grid layout (4 columns on desktop, 2 on tablet, 1 on mobile)
- Empty state with call-to-action
- Loading states during upload

### 4. Security
- Row Level Security ensures users can only manage their own images
- Public viewing allowed for pet owners to see provider galleries
- Secure file uploads with unique filenames

## How to Use

### For Service Providers:

1. **Upload Images:**
   - Go to the "Gallery" tab in your dashboard
   - Click "Add Photos" or "Upload Your First Photo"
   - Select one or multiple image files
   - Wait for upload to complete

2. **Manage Images:**
   - Hover over any image to see the delete button
   - Click the X button to remove an image
   - Images are automatically removed from both database and storage

3. **View Gallery:**
   - All uploaded images are displayed in a grid
   - Maximum of 8 images can be displayed
   - Images are sorted by upload date (newest first)

## Database Schema

The `gallery_images` table includes:
- `id`: Unique identifier for each image
- `provider_id`: Reference to the service provider
- `image_url`: Public URL of the uploaded image
- `file_name`: Original filename of the uploaded image
- `created_at` and `updated_at`: Timestamps

## Storage Structure

Images are stored in the `gallery-images` bucket with the following path structure:
```
gallery-images/
├── {provider_id}-{timestamp}-{random}.jpg
├── {provider_id}-{timestamp}-{random}.png
└── ...
```

## Troubleshooting

### Common Issues:

1. **Upload fails:**
   - Check if the storage bucket exists
   - Verify storage policies are set correctly
   - Check file size (max 5MB)
   - Ensure file is an image type

2. **Images not displaying:**
   - Check if the storage bucket is public
   - Verify the image URLs are accessible
   - Check browser console for errors

3. **Delete not working:**
   - Verify RLS policies are in place
   - Check if user is authenticated
   - Ensure the image belongs to the current user

### Database Queries for Debugging:

```sql
-- Check if gallery_images table exists
SELECT * FROM gallery_images LIMIT 5;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'gallery_images';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'gallery-images';
```

## Future Enhancements

Potential improvements for the gallery system:
- Image compression and optimization
- Multiple image formats support
- Image categories/tags
- Gallery sharing with pet owners
- Image editing capabilities
- Bulk upload/download
- Gallery templates/themes

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify database and storage setup is correct
3. Ensure all required tables and policies are in place
4. Contact the development team for assistance 