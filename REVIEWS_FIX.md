# Reviews System Fix Guide

## Issue
The error indicates that there's no foreign key relationship between the `reviews` table and the `profiles` table. This is causing the Supabase query to fail.

## Solution

### Step 1: Run the Fix Script

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `fix_reviews_foreign_keys.sql`
4. Execute the script

This script will:
- Check if the reviews table exists
- Drop any existing foreign key constraints
- Add proper foreign key constraints to the profiles table
- Verify the constraints were created correctly
- Test the relationship

### Step 2: Alternative Approach (Already Implemented)

I've also updated the code to use a two-step approach that doesn't rely on complex foreign key joins:

1. **First query**: Fetch reviews with booking and service data
2. **Second query**: Fetch profile data separately
3. **Combine**: Merge the data in JavaScript

This approach is more reliable and doesn't depend on complex foreign key relationships.

### Step 3: Verify the Fix

After running the SQL script, test the reviews system:

1. **As a Pet Owner**:
   - Complete a booking
   - Go to History tab
   - Leave a review
   - Verify the review appears

2. **As a Service Provider**:
   - Go to Reviews tab
   - Check if reviews are loading without errors
   - Verify the average rating updates in stats

## Database Structure

The reviews table should have these foreign key relationships:

```sql
-- Reviews table structure
CREATE TABLE reviews (
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

-- Foreign key constraints to profiles table
ALTER TABLE reviews ADD CONSTRAINT reviews_pet_owner_id_fkey 
    FOREIGN KEY (pet_owner_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

ALTER TABLE reviews ADD CONSTRAINT reviews_service_provider_id_fkey 
    FOREIGN KEY (service_provider_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
```

## Troubleshooting

### If the SQL script fails:

1. **Check if reviews table exists**:
   ```sql
   SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = 'reviews'
   );
   ```

2. **Check current foreign key constraints**:
   ```sql
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
   ```

3. **Manual fix if needed**:
   ```sql
   -- Drop existing constraints
   ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_pet_owner_id_fkey;
   ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_service_provider_id_fkey;
   
   -- Add new constraints
   ALTER TABLE reviews ADD CONSTRAINT reviews_pet_owner_id_fkey 
       FOREIGN KEY (pet_owner_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
   
   ALTER TABLE reviews ADD CONSTRAINT reviews_service_provider_id_fkey 
       FOREIGN KEY (service_provider_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
   ```

### If the code still doesn't work:

The updated code uses a two-step approach that should work regardless of foreign key constraints:

1. Fetch reviews with booking data
2. Fetch profile data separately
3. Combine the data in JavaScript

This approach is more robust and doesn't depend on complex database relationships.

## Testing

After applying the fix, test the complete flow:

1. **Create a booking** as a pet owner
2. **Mark it as completed** as a service provider
3. **Leave a review** as a pet owner
4. **View the review** as a service provider
5. **Check the average rating** updates in the dashboard

The system should now work without the foreign key relationship errors. 