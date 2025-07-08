-- Add service_duration column to services table
-- This allows service providers to set the duration for per-service bookings

-- 1. Add service_duration column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_duration INTEGER DEFAULT 60 CHECK (service_duration >= 15 AND service_duration <= 1440);

-- 2. Update existing services to have a default duration
UPDATE services SET service_duration = 60 WHERE service_duration IS NULL;

-- 3. Create index for better performance when filtering by service duration
CREATE INDEX IF NOT EXISTS idx_services_duration ON services(service_duration);

-- 4. Add comment for documentation
COMMENT ON COLUMN services.service_duration IS 'Duration of service in minutes (15-1440 minutes)';

-- 5. Verify the column was added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name = 'service_duration';

-- 6. Show sample data with the new column
SELECT 
    id, 
    name, 
    service_type, 
    price, 
    pricing_type,
    service_duration,
    created_at
FROM services 
ORDER BY created_at DESC 
LIMIT 5; 