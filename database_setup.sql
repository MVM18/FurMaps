-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    pet_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    service_time TIME NOT NULL,
    pet_type VARCHAR(50) NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    special_instructions TEXT,
    contact_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_pet_owner_id ON bookings(pet_owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_provider_id ON bookings(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_service_date ON bookings(service_date);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings table
-- Pet owners can view their own bookings
CREATE POLICY "Pet owners can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = pet_owner_id);

-- Pet owners can create bookings
CREATE POLICY "Pet owners can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = pet_owner_id);

-- Pet owners can update their own bookings
CREATE POLICY "Pet owners can update their own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = pet_owner_id);

-- Service providers can view bookings for their services
CREATE POLICY "Service providers can view their bookings" ON bookings
    FOR SELECT USING (auth.uid() = service_provider_id);

-- Service providers can update bookings for their services
CREATE POLICY "Service providers can update their bookings" ON bookings
    FOR UPDATE USING (auth.uid() = service_provider_id);

-- Add comments for documentation
COMMENT ON TABLE bookings IS 'Stores booking information for pet care services';
COMMENT ON COLUMN bookings.service_id IS 'Reference to the service being booked';
COMMENT ON COLUMN bookings.pet_owner_id IS 'Reference to the pet owner making the booking';
COMMENT ON COLUMN bookings.service_provider_id IS 'Reference to the service provider';
COMMENT ON COLUMN bookings.status IS 'Booking status: pending, confirmed, completed, or cancelled'; 