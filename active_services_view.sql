-- Active Services View
-- This view shows only active services from approved service providers

CREATE OR REPLACE VIEW public.active_services AS
SELECT
  s.id,
  s.provider_id,
  s.name,
  s.location,
  s.service_type,
  s.contact_number,
  s.price,
  s.created_at,
  s.latitude,
  s.longitude,
  s.is_active,
  p.first_name,
  p.last_name,
  p.status as provider_status,
  p.role as provider_role
FROM
  services s
  INNER JOIN profiles p ON s.provider_id = p.user_id
WHERE
  s.is_active = true
  AND p.status IN ('Approved', 'Active')
  AND p.role = 'provider';

-- Add comments for documentation
COMMENT ON VIEW public.active_services IS 'Shows only active services from approved service providers';
COMMENT ON COLUMN public.active_services.provider_status IS 'Status of the service provider (Approved/Active)';
COMMENT ON COLUMN public.active_services.provider_role IS 'Role of the user (should be provider)';

-- Grant permissions
GRANT SELECT ON public.active_services TO authenticated;
GRANT SELECT ON public.active_services TO anon;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_active_services_provider_status 
ON services(provider_id) 
WHERE is_active = true;

-- Verify the view works
DO $$
BEGIN
  -- Check if view was created successfully
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'active_services'
  ) THEN
    RAISE EXCEPTION 'Active services view was not created successfully';
  END IF;
  
  RAISE NOTICE 'Active services view created successfully!';
  RAISE NOTICE 'This view will only show services from approved providers';
END $$; 