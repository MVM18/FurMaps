-- Add pricing_type column to services table
-- This allows service providers to specify if their service is priced per hour or per service

-- 1. Add pricing_type column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(20) DEFAULT 'per_service' CHECK (pricing_type IN ('per_service', 'per_hour'));

-- 2. Update existing services to have a default pricing type
UPDATE services SET pricing_type = 'per_service' WHERE pricing_type IS NULL;

-- 3. Create index for better performance when filtering by pricing type
CREATE INDEX IF NOT EXISTS idx_services_pricing_type ON services(pricing_type);

-- 4. Add comment for documentation
COMMENT ON COLUMN services.pricing_type IS 'Pricing model: per_service or per_hour';

-- 5. Verify the column was added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name = 'pricing_type';

-- 6. Show sample data with the new column
SELECT 
    id, 
    name, 
    service_type, 
    price, 
    pricing_type,
    created_at
FROM services 
ORDER BY created_at DESC 
LIMIT 5; 