-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_provider_id ON gallery_images(provider_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_gallery_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_gallery_images_updated_at 
    BEFORE UPDATE ON gallery_images 
    FOR EACH ROW 
    EXECUTE FUNCTION update_gallery_images_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery_images table
-- Service providers can view their own gallery images
CREATE POLICY "Service providers can view their own gallery images" ON gallery_images
    FOR SELECT USING (auth.uid() = provider_id);

-- Service providers can insert their own gallery images
CREATE POLICY "Service providers can insert their own gallery images" ON gallery_images
    FOR INSERT WITH CHECK (auth.uid() = provider_id);

-- Service providers can update their own gallery images
CREATE POLICY "Service providers can update their own gallery images" ON gallery_images
    FOR UPDATE USING (auth.uid() = provider_id);

-- Service providers can delete their own gallery images
CREATE POLICY "Service providers can delete their own gallery images" ON gallery_images
    FOR DELETE USING (auth.uid() = provider_id);

-- Allow public viewing of gallery images (for pet owners to see provider galleries)
CREATE POLICY "Public can view gallery images" ON gallery_images
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON gallery_images TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE gallery_images IS 'Stores gallery images for service providers';
COMMENT ON COLUMN gallery_images.provider_id IS 'Reference to the service provider who uploaded the image';
COMMENT ON COLUMN gallery_images.image_url IS 'Public URL of the uploaded image in Supabase Storage';
COMMENT ON COLUMN gallery_images.file_name IS 'Original filename of the uploaded image';

-- Note: You'll need to create the 'gallery-images' storage bucket in Supabase dashboard
-- Go to Storage > Create a new bucket named 'gallery-images'
-- Set it to public and configure the appropriate policies 