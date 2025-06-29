# Booking System Setup Guide

This guide explains how to set up and use the new booking functionality in the FurMaps application.

## Database Setup

### 1. Create the Bookings Table

Run the SQL script in `database_setup.sql` in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database_setup.sql`
4. Execute the script

This will create:
- A `bookings` table with all necessary fields
- Indexes for better performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### 2. Verify Table Structure

The bookings table includes:
- `id`: Unique identifier for each booking
- `service_id`: Reference to the service being booked
- `pet_owner_id`: Reference to the pet owner
- `service_provider_id`: Reference to the service provider
- `service_date`: Date of the service
- `service_time`: Time of the service
- `pet_type`: Type of pet (Dog, Cat, etc.)
- `pet_name`: Name of the pet
- `special_instructions`: Any special requirements
- `contact_number`: Contact number for the booking
- `status`: Booking status (pending, confirmed, completed, cancelled)
- `total_price`: Total price of the booking
- `created_at` and `updated_at`: Timestamps

## New Features

### 1. Service Display in Pet Owner Dashboard

The pet owner dashboard now displays all available services from service providers:
- Services are fetched from the `services` table
- Real-time search and filtering by service name, type, and location
- Beautiful service cards with provider information
- Service icons based on service type

### 2. Booking Modal

A comprehensive booking modal that allows pet owners to:
- Select service date and time
- Specify pet type and name
- Add special instructions
- Provide contact information
- Review booking details before confirmation

### 3. Booking Management

Pet owners can:
- View all their bookings in the "My Bookings" tab
- See booking status (pending, confirmed, completed, cancelled)
- Track booking history

### 4. Real-time Updates

The dashboard stats are now dynamic:
- Total bookings count updates automatically
- Active services count reflects confirmed bookings
- All data is fetched from the database in real-time

## How to Use

### For Pet Owners:

1. **Search for Services**:
   - Go to the "Search Services" tab
   - Use the search bar to find specific services or providers
   - Filter by location using the location input
   - Browse through available services

2. **Book a Service**:
   - Click "Book Now" on any service card
   - Fill out the booking form with your details
   - Select service date and time
   - Provide pet information
   - Add any special instructions
   - Confirm the booking

3. **Manage Bookings**:
   - Go to the "My Bookings" tab to view all your bookings
   - See the status of each booking
   - Track your booking history

### For Service Providers:

1. **Add Services**:
   - Use the existing service provider dashboard
   - Add new services with details like name, location, type, and price
   - Services will automatically appear in the pet owner search

2. **View Bookings**:
   - Bookings for your services will be visible in your dashboard
   - You can update booking status (confirm, complete, cancel)

## Security Features

- Row Level Security (RLS) ensures users can only access their own data
- Pet owners can only view and manage their own bookings
- Service providers can only view bookings for their services
- All database operations are properly authenticated

## Troubleshooting

### Common Issues:

1. **Services not appearing**:
   - Check if services exist in the database
   - Verify the service provider has added services
   - Check browser console for any errors

2. **Booking not working**:
   - Ensure you're logged in as a pet owner
   - Check if the bookings table was created properly
   - Verify RLS policies are in place

3. **Search not working**:
   - Check if the search query is valid
   - Verify the location filter is working
   - Check browser console for any errors

### Database Queries for Debugging:

```sql
-- Check if services exist
SELECT * FROM services;

-- Check if bookings table exists
SELECT * FROM bookings LIMIT 5;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

## Future Enhancements

Potential improvements for the booking system:
- Email notifications for booking confirmations
- Payment integration
- Rating and review system
- Calendar integration
- Recurring booking options
- Service provider availability management

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify database setup is correct
3. Ensure all required tables and policies are in place
4. Contact the development team for assistance 