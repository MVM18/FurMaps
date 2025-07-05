-- Add soft delete functionality to services table
-- This allows services to be "deleted" without breaking foreign key constraints

-- 1. Add is_active column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Create index for better performance when filtering active services
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- 3. Update existing services to be active
UPDATE services SET is_active = true WHERE is_active IS NULL;

-- 4. Create a view for active services only (optional)
CREATE OR REPLACE VIEW active_services AS
SELECT * FROM services WHERE is_active = true;

-- 5. Update RLS policies to consider is_active status
DROP POLICY IF EXISTS "Users can view their services" ON services;
CREATE POLICY "Users can view their services" ON services
    FOR SELECT USING (
        (auth.uid() = provider_id AND is_active = true) OR
        (is_active = true) -- Allow viewing of all active services
    );

-- 6. Add policy for soft delete
CREATE POLICY "Users can soft delete their services" ON services
    FOR UPDATE USING (auth.uid() = provider_id);

-- 7. Verify the changes
SELECT 
    'Services Table' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'services' AND column_name = 'is_active'; 