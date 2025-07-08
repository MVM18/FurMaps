import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './SPprofile.css';

const ProfileModal = ({ onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    experience: '',       // Not stored in DB
    certifications: '',   // Not stored in DB
    bio: '',
    gcashDetails: '',
    gcashQrUrl: '',
    certificate: '',
    validId: '',
    proofOfAddress: '',
  });

  const [profilePhoto, setProfilePhoto] = useState('https://via.placeholder.com/120x120/e5e7eb/6b7280?text=Profile');
  const [ratingData, setRatingData] = useState({
    averageRating: 0,
    totalReviews: 0
  });
  const fileInputRef = useRef(null);
  const gcashQrInputRef = useRef(null);
  const certificateInputRef = useRef(null);
  const validIdInputRef = useRef(null);
  const proofOfAddressInputRef = useRef(null);

  const [petSpecialties, setPetSpecialties] = useState({
    dogs: true,
    cats: true,
    smallAnimals: true,
    fish: false,
    reptiles: false,
    exoticPets: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return console.error('User fetch error:', userError);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) return console.error('Error fetching profile:', error);

      if (data) {
        setProfileData({
          firstName: data.first_name,
          lastName: data.last_name,
          email: user.email,
          phone: data.phone,
          address: data.address,
          experience: '',       // Blank
          certifications: '',   // Blank
          bio: data.bio || '',
          gcashDetails: data.gcash_details || '',
          gcashQrUrl: data.gcash_qr_url || '',
          certificate: data.certificate || '',
          validId: data.valid_id || '',
          proofOfAddress: data.proof_of_address || '',
        });

        if (data.profile_picture) setProfilePhoto(data.profile_picture);
      }

      // Fetch rating data from provider_ratings view
      const { data: ratingData, error: ratingError } = await supabase
        .from('provider_ratings')
        .select('average_rating, total_reviews')
        .eq('service_provider_id', user.id)
        .single();

      if (!ratingError && ratingData) {
        setRatingData({
          averageRating: ratingData.average_rating || 0,
          totalReviews: ratingData.total_reviews || 0
        });
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        profile_picture: profilePhoto,
        gcash_details: profileData.gcashDetails,
        gcash_qr_url: profileData.gcashQrUrl,
        certificate: profileData.certificate,
        valid_id: profileData.validId,
        proof_of_address: profileData.proofOfAddress,
        // experience and certifications are NOT included here
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating provider profile:', error);
    } else {
      setIsEditing(false);
    }
  };

  const handleEditToggle = () => setIsEditing(true);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = () => fileInputRef.current?.click();

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return console.error('User fetch error:', userError);

    const fileExt = file.name.split('.').pop();
    const filePath = `profile-pictures/${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) return console.error('Upload error:', uploadError);

    const { data: publicUrlData, error: urlError } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (urlError) return console.error('URL error:', urlError);

    if (publicUrlData?.publicUrl) {
      setProfilePhoto(publicUrlData.publicUrl);
    }
  };

  const handleGcashQrChange = () => gcashQrInputRef.current?.click();
  const handleGcashQrFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return console.error('User fetch error:', userError);
    const fileExt = file.name.split('.').pop();
    const filePath = `gcash-qr/${user.id}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });
    if (uploadError) return console.error('Upload error:', uploadError);
    const { data: publicUrlData, error: urlError } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);
    if (urlError) return console.error('URL error:', urlError);
    if (publicUrlData?.publicUrl) {
      setProfileData(prev => ({ ...prev, gcashQrUrl: publicUrlData.publicUrl }));
    }
  };

  const handleDocumentUpload = async (event, documentType) => {
    const file = event.target.files[0];
    if (!file) return;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return console.error('User fetch error:', userError);

    const fileExt = file.name.split('.').pop();
    const filePath = `provider-documents/${user.id}/${documentType}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase
      .storage
      .from('provider-documents')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) return console.error('Upload error:', uploadError);

    const { data: publicUrlData, error: urlError } = supabase
      .storage
      .from('provider-documents')
      .getPublicUrl(filePath);

    if (urlError) return console.error('URL error:', urlError);

    if (publicUrlData?.publicUrl) {
      setProfileData(prev => ({ ...prev, [documentType]: publicUrlData.publicUrl }));
    }
  };

  const handleCertificateChange = () => certificateInputRef.current?.click();
  const handleValidIdChange = () => validIdInputRef.current?.click();
  const handleProofOfAddressChange = () => proofOfAddressInputRef.current?.click();

  const handlePetSpecialtyChange = (specialty) => {
    setPetSpecialties(prev => ({ ...prev, [specialty]: !prev[specialty] }));
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} style={{ color: '#fbbf24' }}>★</span>
        ))}
        {hasHalfStar && <span style={{ color: '#fbbf24' }}>☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} style={{ color: '#d1d5db' }}>☆</span>
        ))}
      </>
    );
  };

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-content">
        <button className="modal-close-button" onClick={onClose}>&times;</button>

        <div className="profile-container">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Manage your profile and service settings</p>
          </div>

          <div className="profile-info">
            <div className="profile-photo-section">
              <img src={profilePhoto} alt="Profile" className="profile-photo" />
              <button className="change-photo-btn" onClick={handlePhotoChange}>
                Change Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-details">
              <div className="name-with-badge">
                <h2>{profileData.firstName} {profileData.lastName}</h2>
              </div>
              <div className="rating">
                {ratingData.totalReviews > 0 ? (
                  <>
                    <span className="stars">{renderStars(ratingData.averageRating)}</span>
                    <span className="rating-text">
                      {ratingData.averageRating.toFixed(1)} ({ratingData.totalReviews} reviews)
                    </span>
                  </>
                ) : (
                  <span className="rating-text">No reviews yet</span>
                )}
              </div>
            </div>
          </div>

          <div className="personal-info-section">
            <div className="section-header">
              <h3>Personal Information</h3>
              <button
                className="edit-btn"
                onClick={isEditing ? handleSave : handleEditToggle}
              >
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>
            <p>Update your account details</p>

            <div className="info-grid">
              <div className="info-item">
                <label>First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="info-item">
                <label>Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="info-item">
                <label>Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="info-item full-width">
                <label>Address</label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                />
              </div>{/*
              <div className="info-item">
                <label>Years of Experience</label>
                <input
                  type="text"
                  value={profileData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="info-item full-width">
                <label>Certifications</label>
                <textarea
                  value={profileData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  disabled={!isEditing}
                />
              </div>*/}
              <div className="info-item full-width">
                <label>Professional Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="info-item full-width">
                <label>GCASH Details (optional)</label>
                <input
                  type="text"
                  value={profileData.gcashDetails}
                  onChange={e => handleInputChange('gcashDetails', e.target.value)}
                  disabled={!isEditing}
                  placeholder="GCASH number or account name"
                />
              </div>
              <div className="info-item full-width">
                <label>GCASH QR Code (optional)</label>
                {profileData.gcashQrUrl && (
                  <div style={{ marginBottom: 8 }}>
                    <img src={profileData.gcashQrUrl} alt="GCASH QR Code" style={{ maxWidth: 160, maxHeight: 160, borderRadius: 8, border: '1px solid #eee' }} />
                  </div>
                )}
                {isEditing && (
                  <>
                    <button className="change-photo-btn" type="button" onClick={handleGcashQrChange}>
                      {profileData.gcashQrUrl ? 'Change QR Code' : 'Upload QR Code'}
                    </button>
                    <input
                      type="file"
                      ref={gcashQrInputRef}
                      onChange={handleGcashQrFileSelect}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Provider Documents Section */}
          <div className="personal-info-section">
            <div className="section-header">
              <h3>Provider Documents</h3>
              <button
                className="edit-btn"
                onClick={isEditing ? handleSave : handleEditToggle}
              >
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>
            <p>Manage your verification documents</p>

            <div className="info-grid">
              <div className="info-item full-width">
                <label>Professional Certificate</label>
                {profileData.certificate && (
                  <div style={{ marginBottom: 8 }}>
                    <a href={profileData.certificate} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                      View Certificate
                    </a>
                  </div>
                )}
                {isEditing && (
                  <>
                    <button className="change-photo-btn" type="button" onClick={handleCertificateChange}>
                      {profileData.certificate ? 'Change Certificate' : 'Upload Certificate'}
                    </button>
                    <input
                      type="file"
                      ref={certificateInputRef}
                      onChange={(e) => handleDocumentUpload(e, 'certificate')}
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      style={{ display: 'none' }}
                    />
                  </>
                )}
              </div>

              <div className="info-item full-width">
                <label>Valid ID</label>
                {profileData.validId && (
                  <div style={{ marginBottom: 8 }}>
                    <a href={profileData.validId} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                      View Valid ID
                    </a>
                  </div>
                )}
                {isEditing && (
                  <>
                    <button className="change-photo-btn" type="button" onClick={handleValidIdChange}>
                      {profileData.validId ? 'Change Valid ID' : 'Upload Valid ID'}
                    </button>
                    <input
                      type="file"
                      ref={validIdInputRef}
                      onChange={(e) => handleDocumentUpload(e, 'validId')}
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      style={{ display: 'none' }}
                    />
                  </>
                )}
              </div>

              <div className="info-item full-width">
                <label>Proof of Address</label>
                {profileData.proofOfAddress && (
                  <div style={{ marginBottom: 8 }}>
                    <a href={profileData.proofOfAddress} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                      View Proof of Address
                    </a>
                  </div>
                )}
                {isEditing && (
                  <>
                    <button className="change-photo-btn" type="button" onClick={handleProofOfAddressChange}>
                      {profileData.proofOfAddress ? 'Change Proof of Address' : 'Upload Proof of Address'}
                    </button>
                    <input
                      type="file"
                      ref={proofOfAddressInputRef}
                      onChange={(e) => handleDocumentUpload(e, 'proofOfAddress')}
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                      style={{ display: 'none' }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
