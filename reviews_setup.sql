-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    pet_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to profiles table for pet_owner_id
ALTER TABLE reviews ADD CONSTRAINT reviews_pet_owner_id_fkey 
    FOREIGN KEY (pet_owner_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Add foreign key constraint to profiles table for service_provider_id
ALTER TABLE reviews ADD CONSTRAINT reviews_service_provider_id_fkey 
    FOREIGN KEY (service_provider_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pet_owner_id ON reviews(pet_owner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_provider_id ON reviews(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service_id ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_reviews_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews table
-- Pet owners can view their own reviews
CREATE POLICY "Pet owners can view their own reviews" ON reviews
    FOR SELECT USING (auth.uid() = pet_owner_id);

-- Pet owners can create reviews for their completed bookings
CREATE POLICY "Pet owners can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = pet_owner_id);

-- Pet owners can update their own reviews
CREATE POLICY "Pet owners can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = pet_owner_id);

-- Service providers can view reviews for their services
CREATE POLICY "Service providers can view their reviews" ON reviews
    FOR SELECT USING (auth.uid() = service_provider_id);

-- Allow public viewing of reviews (for service browsing)
CREATE POLICY "Public can view reviews" ON reviews
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON reviews TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE reviews IS 'Stores customer reviews for completed bookings';
COMMENT ON COLUMN reviews.booking_id IS 'Reference to the completed booking';
COMMENT ON COLUMN reviews.pet_owner_id IS 'Reference to the pet owner who wrote the review';
COMMENT ON COLUMN reviews.service_provider_id IS 'Reference to the service provider being reviewed';
COMMENT ON COLUMN reviews.service_id IS 'Reference to the service being reviewed';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN reviews.comment IS 'Text review/comment from the pet owner';

-- Create a view for average ratings by service provider
CREATE OR REPLACE VIEW provider_ratings AS
SELECT 
    service_provider_id,
    COUNT(*) as total_reviews,
    AVG(rating) as average_rating,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_reviews,
    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_reviews,
    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_reviews,
    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_reviews,
    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_reviews
FROM reviews
GROUP BY service_provider_id;

-- Grant permissions on the view
GRANT SELECT ON provider_ratings TO authenticated; 