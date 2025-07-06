# Status-Based Restrictions System

This guide explains the status-based restrictions implemented in the FurMaps application to ensure proper user access control and platform security.

## Overview

The system implements different restrictions based on user status and role:
- **Service Providers**: Cannot add services while pending approval or suspended
- **Pet Owners**: Cannot book services while suspended
- **All Users**: Status-based access control throughout the platform

## User Status Types

### For Service Providers:
- **Pending**: Account awaiting admin approval (cannot add services)
- **Approved**: Account approved by admin (can add services)
- **Active**: Account is active (can add services)
- **Suspended**: Account suspended by admin (cannot add services)
- **Rejected**: Application rejected by admin (cannot add services)

### For Pet Owners:
- **Approved**: Account is active (can book services)
- **Active**: Account is active (can book services)
- **Suspended**: Account suspended by admin (cannot book services)

## Implementation Details

### 1. Service Provider Restrictions (`SPservices.js`)

#### Status Checking:
```javascript
// Check user status and role on component mount
const checkUserStatus = async () => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('status, role')
    .eq('user_id', user.id)
    .single();
  
  setUserStatus(profile.status);
  setUserRole(profile.role);
};
```

#### Service Addition Restrictions:
```javascript
const handleSubmit = async (e) => {
  // Check if user is approved
  if (userStatus !== 'Approved' && userStatus !== 'Active') {
    alert("You cannot add services while your account is pending approval or suspended.");
    return;
  }
  // ... rest of submission logic
};
```

#### UI Feedback:
- **Pending Status**: Shows message "Your account is pending approval. You cannot add services until your account is approved by an admin."
- **Suspended Status**: Shows message "Your account has been suspended. Please contact support for assistance."
- **Rejected Status**: Shows message "Your application has been rejected. Please contact support for more information."
- **Add Service Button**: Disabled for non-approved users

### 2. Pet Owner Restrictions (`HomepagePetOwner.js` & `BookingModal.js`)

#### Booking Restrictions:
```javascript
const handleBookNow = (service) => {
  // Check if user is suspended
  if (userStatus === 'Suspended') {
    setToastMessage('Your account has been suspended. You cannot book services at this time.');
    return;
  }

  // Check if user is a pet owner
  if (userRole !== 'owner') {
    setToastMessage('Only pet owners can book services.');
    return;
  }
  
  setSelectedService(service);
  setShowBookingModal(true);
};
```

#### Booking Modal Validation:
```javascript
// In BookingModal.js
if (profile.status === 'Suspended') {
  setError('Your account has been suspended. You cannot book services at this time.');
  return;
}

if (profile.role !== 'owner') {
  setError('Only pet owners can book services.');
  return;
}
```

#### UI Feedback:
- **Suspended Status**: Shows banner "🚫 Your account has been suspended. You cannot book services at this time."
- **Booking Buttons**: Disabled for suspended users
- **Toast Messages**: Clear error messages for restricted actions

### 3. Active Services View (`active_services_view.sql`)

#### Database View:
```sql
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
```

This view ensures that only services from approved providers are visible to pet owners.

## Status Flow

### Service Provider Flow:
```
Registration → Pending → Approved/Rejected
     ↓
Upload Documents → Admin Review → Status Update
     ↓
Can Add Services (if Approved) → Can Receive Bookings
```

### Pet Owner Flow:
```
Registration → Approved → Can Book Services
     ↓
Admin Suspension → Cannot Book Services
     ↓
Admin Reactivation → Can Book Services Again
```

## Admin Controls

### Service Provider Management:
- **Approve**: Changes status to "Approved" - provider can add services
- **Reject**: Changes status to "Rejected" - provider cannot add services
- **Suspend**: Changes status to "Suspended" - provider cannot add services

### Pet Owner Management:
- **Suspend**: Changes status to "Suspended" - owner cannot book services
- **Activate**: Changes status to "Active" - owner can book services

## Security Features

### 1. Frontend Validation:
- Status checks before allowing actions
- Clear error messages for restricted users
- Disabled UI elements for unauthorized actions

### 2. Backend Validation:
- Database view filters out unauthorized services
- RLS policies ensure data security
- Status-based access control at API level

### 3. Real-time Updates:
- Status changes reflect immediately in UI
- Automatic refresh of user permissions
- Consistent state across all components

## Error Messages

### Service Provider Messages:
- **Pending**: "⏳ Your account is pending approval. You cannot add services until your account is approved by an admin."
- **Suspended**: "🚫 Your account has been suspended. Please contact support for assistance."
- **Rejected**: "❌ Your application has been rejected. Please contact support for more information."

### Pet Owner Messages:
- **Suspended**: "🚫 Your account has been suspended. You cannot book services at this time. Please contact support for assistance."
- **Wrong Role**: "Only pet owners can book services."

## Testing Scenarios

### 1. Service Provider Testing:
- [ ] Pending provider cannot add services
- [ ] Approved provider can add services
- [ ] Suspended provider cannot add services
- [ ] Rejected provider cannot add services
- [ ] Status messages display correctly

### 2. Pet Owner Testing:
- [ ] Active owner can book services
- [ ] Suspended owner cannot book services
- [ ] Suspended owner sees appropriate messages
- [ ] Booking modal validates status
- [ ] Status banner displays for suspended users

### 3. Admin Testing:
- [ ] Can approve providers
- [ ] Can reject providers
- [ ] Can suspend users
- [ ] Can activate users
- [ ] Status changes reflect immediately

## Troubleshooting

### Common Issues:

1. **User can still access restricted features**
   - Check if status check is running on component mount
   - Verify database status is correct
   - Clear browser cache and reload

2. **Status not updating in real-time**
   - Ensure `checkUserStatus()` is called after status changes
   - Check if component is re-rendering properly
   - Verify Supabase real-time subscriptions

3. **Services still showing for suspended providers**
   - Verify `active_services` view is being used
   - Check if services are properly filtered
   - Ensure database view is up to date

### Debug Commands:

```javascript
// Check user status
const { data: profile } = await supabase
  .from('profiles')
  .select('status, role')
  .eq('user_id', user.id)
  .single();
console.log('User status:', profile.status, 'Role:', profile.role);

// Check active services
const { data: services } = await supabase
  .from('active_services')
  .select('*');
console.log('Active services:', services);
```

## Future Enhancements

Potential improvements:
- Email notifications for status changes
- Automatic status expiration
- Temporary suspensions with expiry dates
- Appeal process for rejected/suspended accounts
- Status change audit logs
- Bulk status management for admins 