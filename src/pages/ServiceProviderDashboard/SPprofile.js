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
    bio: ''
  });

  const [profilePhoto, setProfilePhoto] = useState('https://via.placeholder.com/120x120/e5e7eb/6b7280?text=Profile');
  const fileInputRef = useRef(null);

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
        });

        if (data.profile_picture) setProfilePhoto(data.profile_picture);
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
        profile_picture: profilePhoto
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

  const handlePetSpecialtyChange = (specialty) => {
    setPetSpecialties(prev => ({ ...prev, [specialty]: !prev[specialty] }));
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
                <span className="stars">★★★★★</span>
                <span className="rating-text">4.9 (89 reviews)</span>
              </div>
            </div>
          </div>

          <div className="services-section">
            <div className="pet-specialties">
              <h4>Pet Specialties</h4>
              <p>What types of pets do you specialize in?</p>
              <div className="pet-checkboxes-grid">
                {Object.keys(petSpecialties).map((key) => (
                  <label key={key} className="pet-checkbox-label">
                    <input
                      type="checkbox"
                      checked={petSpecialties[key]}
                      onChange={() => handlePetSpecialtyChange(key)}
                      disabled={!isEditing}
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="service-area">
              <h4>Service Area</h4>
              <p>Areas You Serve</p>
              <div className="areas-tags">
                <span className="area-tag">Downtown</span>
                <span className="area-tag">Westside</span>
                <span className="area-tag">City Center</span>
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
              </div>
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
              </div>
              <div className="info-item full-width">
                <label>Professional Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
