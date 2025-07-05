# Reviews System Setup Guide

This guide explains how to set up and use the new reviews functionality in the FurMaps application.

## Database Setup

### 1. Create the Reviews Table

Run the SQL script in `reviews_setup.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `reviews_setup.sql`
4. Execute the script

This will create:
- A `reviews` table with all necessary fields
- Indexes for better performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates
- A `provider_ratings` view for aggregated rating data

### 2. Verify Table Structure

The reviews table includes:
- `id`: Unique identifier for each review
- `booking_id`: Reference to the completed booking
- `pet_owner_id`: Reference to the pet owner who wrote the review
- `service_provider_id`: Reference to the service provider being reviewed
- `service_id`: Reference to the service being reviewed
- `rating`: Rating from 1 to 5 stars
- `comment`: Text review/comment from the pet owner
- `created_at` and `updated_at`: Timestamps

## Features

### 1. Pet Owner Review System

**History Tab:**
- Shows all past bookings in the "History" tab
- Completed bookings display a "Leave Review" button
- Bookings that have been reviewed show a "✓ Reviewed" badge
- Click "Leave Review" to open the review modal

**Review Modal:**
- Star rating system (1-5 stars)
- Text comment field (up to 500 characters)
- Shows booking details (service name, date, pet info)
- Prevents duplicate reviews for the same booking
- Real-time character count
- Form validation and error handling

### 2. Service Provider Reviews Display

**Reviews Tab:**
- Shows all reviews received from customers
- Displays reviewer name, rating, comment, and date
- Shows service and pet information for context
- Loading states and error handling
- Empty state when no reviews exist

**Dashboard Stats:**
- Average rating is now calculated from real review data
- Updates automatically when new reviews are submitted
- Shows "0.0" when no reviews exist

### 3. Security Features

- Row Level Security (RLS) ensures users can only access their own data
- Pet owners can only review their own completed bookings
- Service providers can only view reviews for their services
- Public viewing allowed for service browsing
- Prevents duplicate reviews for the same booking

## How to Use

### For Pet Owners:

1. **Complete a Booking:**
   - Book a service through the search interface
   - Wait for the service provider to mark the booking as "completed"

2. **Leave a Review:**
   - Go to the "History" tab in your dashboard
   - Find the completed booking
   - Click "Leave Review" button
   - Rate the service (1-5 stars)
   - Write a comment about your experience
   - Submit the review

3. **View Your Reviews:**
   - Your reviews are stored and can be viewed in the history
   - Completed bookings show "✓ Reviewed" badge

### For Service Providers:

1. **Complete Bookings:**
   - Mark bookings as "completed" in your dashboard
   - This allows pet owners to leave reviews

2. **View Reviews:**
   - Go to the "Reviews" tab in your dashboard
   - See all reviews from your customers
   - View average rating in the stats section

3. **Monitor Performance:**
   - Track your average rating over time
   - Read customer feedback to improve services

## Database Queries for Debugging

```sql
-- Check if reviews table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'reviews'
);

-- Check reviews table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- Check RLS policies on reviews table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'reviews';

-- View all reviews
SELECT * FROM reviews ORDER BY created_at DESC;

-- View provider ratings
SELECT * FROM provider_ratings;

-- Check reviews for a specific provider
SELECT 
    r.*,
    p.first_name,
    p.last_name,
    b.pet_name,
    s.name as service_name
FROM reviews r
JOIN profiles p ON r.pet_owner_id = p.user_id
JOIN bookings b ON r.booking_id = b.id
JOIN services s ON r.service_id = s.id
WHERE r.service_provider_id = 'your-provider-id'
ORDER BY r.created_at DESC;
```

## Troubleshooting

### Common Issues:

1. **Reviews not appearing:**
   - Check if the reviews table was created properly
   - Verify RLS policies are in place
   - Ensure bookings are marked as "completed"
   - Check browser console for any errors

2. **Cannot leave review:**
   - Ensure the booking status is "completed"
   - Check if you've already reviewed this booking
   - Verify you're logged in as the pet owner
   - Check browser console for any errors

3. **Average rating not updating:**
   - Refresh the dashboard stats
   - Check if reviews exist for the provider
   - Verify the reviews query is working

4. **Permission errors:**
   - Check RLS policies are correctly configured
   - Ensure user authentication is working
   - Verify foreign key relationships

### Database Issues:

1. **Foreign key constraint errors:**
   - Ensure all referenced tables exist
   - Check that user IDs match between tables
   - Verify booking IDs are valid

2. **RLS policy issues:**
   - Check that policies allow the necessary operations
   - Verify user authentication is working
   - Test policies with different user roles

## Future Enhancements

Potential improvements for the reviews system:
- Review editing and deletion
- Review responses from service providers
- Review filtering and sorting
- Review helpfulness voting
- Review photos/attachments
- Review moderation system
- Review analytics and insights
- Email notifications for new reviews

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify database setup is correct
3. Ensure all required tables and policies are in place
4. Test with different user accounts and roles
5. Contact the development team for assistance 