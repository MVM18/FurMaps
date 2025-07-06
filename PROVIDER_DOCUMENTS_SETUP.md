# Provider Documents Upload & Review System

This guide explains how to set up the provider documents upload and review system for the FurMaps application.

## Overview

The system allows service providers to upload required documents during registration:
- Professional Certificates
- Valid ID
- Proof of Address

These documents are stored in Supabase Storage and can be reviewed by admins for approval.

## Database Setup

### 1. Run the Storage Setup Script

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `provider_documents_setup.sql`
4. Execute the script

This will create:
- A `provider-documents` storage bucket
- Storage policies for secure access
- Ensure database fields can store URLs

### 2. Verify Storage Bucket Creation

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Verify that `provider-documents` bucket exists
4. Check that it's set to **Public** (so admins can view documents)

## Features

### 1. Provider Registration
- Service providers can upload documents during registration
- File validation (PDF, JPG, PNG, GIF, WEBP)
- File size limit (10MB per document)
- Automatic file organization by user ID

### 2. Document Storage
- Documents are stored in Supabase Storage
- Organized by user ID: `provider-documents/{userId}/`
- Unique filenames with timestamps
- Public URLs for admin access

### 3. Admin Review
- Admins can view all uploaded documents
- Document preview for images
- Direct links to open documents
- Approval/rejection workflow

## File Structure

```
provider-documents/
├── {userId}/
│   ├── certificate-{timestamp}-{filename}
│   ├── valid-id-{timestamp}-{filename}
│   └── proof-of-address-{timestamp}-{filename}
```

## Security

### Storage Policies
- **Admins**: Can view all provider documents
- **Providers**: Can upload documents during registration
- **Providers**: Can view their own uploaded documents

### File Validation
- File type validation (PDF, images only)
- File size limits (10MB per file)
- Unique file naming to prevent conflicts

## Admin Workflow

### 1. Review Pending Providers
1. Go to Admin Dashboard
2. Navigate to "Service Provider Approvals" tab
3. View providers with "Pending" status

### 2. Review Documents
1. Click "View" on any document card
2. Preview images directly in the modal
3. Click "Open Document" to view in new tab
4. Review all required documents

### 3. Approve/Reject
1. Ensure all required documents are uploaded
2. Click "Approve" to approve the provider
3. Click "Reject" to reject the application
4. Provider status will be updated accordingly

## Required Documents

For a provider to be approved, they must upload:
- ✅ Professional Certificates
- ✅ Valid ID
- ✅ Proof of Address

## Status Flow

```
Registration → Pending → Approved/Rejected
     ↓
Upload Documents → Admin Review → Status Update
```

## Troubleshooting

### Common Issues

1. **Documents not uploading**
   - Check file size (max 10MB)
   - Verify file type (PDF, JPG, PNG, GIF, WEBP)
   - Ensure user is authenticated

2. **Admin can't view documents**
   - Verify storage bucket is public
   - Check storage policies are applied
   - Ensure document URLs are stored in database

3. **File upload errors**
   - Check Supabase storage quota
   - Verify storage bucket exists
   - Check network connectivity

### Debug Commands

Run these in browser console to debug:

```javascript
// Check if storage bucket exists
const { data, error } = await supabase.storage.from('provider-documents').list();
console.log('Storage bucket check:', { data, error });

// Check provider documents
const { data: profiles } = await supabase.from('profiles').select('user_id, certificate, valid_id, proof_of_address');
console.log('Provider documents:', profiles);
```

## API Endpoints

The system uses these Supabase operations:

### Storage Operations
- `supabase.storage.from('provider-documents').upload()` - Upload documents
- `supabase.storage.from('provider-documents').getPublicUrl()` - Get document URLs

### Database Operations
- `supabase.from('profiles').insert()` - Create provider profile with document URLs
- `supabase.from('profiles').update()` - Update provider status

## Future Enhancements

Potential improvements:
- Document expiration tracking
- Automated document verification
- Document re-upload functionality
- Email notifications for approval/rejection
- Document version history 