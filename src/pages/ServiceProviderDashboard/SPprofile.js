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
   // experience: '',
  //  certifications: '',
    bio: ''
    //hourlyRate: 0
  });

  const [services, setServices] = useState([
     { id: 1, name: 'Dog Walking', active: true },
    { id: 2, name: 'Pet Sitting', active: true },
    { id: 3, name: 'Pet Feeding', active: false }
  ]);
  const [profilePhoto, setProfilePhoto] = useState('https://via.placeholder.com/120x120/e5e7eb/6b7280?text=Profile');
  const fileInputRef = useRef(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [showAddService, setShowAddService] = useState(false);


useEffect(() => {
  const fetchProfile = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return console.error('User fetch error:', userError);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setProfileData({
        firstName: data.first_name,
        lastName: data.last_name,
        email: user.email,
        phone: data.phone,
        address: data.address,
        //experience: data.experience || '',
        //certifications: data.certificate || '',
        bio: data.bio || '',
        //hourlyRate: data.hourly_rate || 0,
      });

      if (data.profile_picture) {
        setProfilePhoto(data.profile_picture);
      }

      // Optionally, parse services_offered if stored as a comma-separated string
      if (data.services_offered) {
        const parsed = data.services_offered.split(',').map((name, i) => ({
          id: i + 1,
          name: name.trim(),
          active: true
        }));
        setServices(parsed);
      }
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
     // certificate: profileData.certifications,
      bio: profileData.bio,
      //experience: profileData.experience,
      //hourly_rate: profileData.hourlyRate,
     // services_offered: services.map(s => s.name).join(', '),
      profile_picture: profilePhoto // only if it’s a URL or already uploaded
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating provider profile:', error);
  } else {
    setIsEditing(false);
  }
};


  const [petSpecialties, setPetSpecialties] = useState({
    dogs: true,
    cats: true,
    smallAnimals: true,
    fish: false,
    reptiles: false,
    exoticPets: false
  });

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = () => fileInputRef.current?.click();

  const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('User fetch error:', userError);
    return;
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `profile-pictures/${user.id}-${Date.now()}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase
    .storage
    .from('avatars') // 👈 Make sure this bucket exists
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return;
  }

  // Get public URL
  const { data: publicUrlData, error: urlError } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(filePath);

  if (urlError) {
    console.error('URL error:', urlError);
    return;
  }

  if (publicUrlData?.publicUrl) {
    setProfilePhoto(publicUrlData.publicUrl); // ✅ Set uploaded photo to preview
  }
};

  const toggleService = (serviceId) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId ? { ...service, active: !service.active } : service
    ));
  };

  const handleAddService = () => {
    if (newServiceName.trim()) {
      setServices(prev => [...prev, {
        id: Date.now(),
        name: newServiceName.trim(),
        active: true
      }]);
      setNewServiceName('');
      setShowAddService(false);
    }
  };

  const handleRemoveService = (serviceId) => {
    setServices(prev => prev.filter(service => service.id !== serviceId));
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
            <h3>Services Offered</h3>
            <p>Manage the services you provide</p>
            
            <div className="service-tags">
              {services.map(service => (
                <div key={service.id} className="service-tag-container">
                  <span className={`service-tag ${service.active ? 'active' : ''}`}>
                    {service.name}
                  </span>
                  {isEditing && (
                    <button 
                      className="remove-service-btn"
                      onClick={() => handleRemoveService(service.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              
              {isEditing && (
                <div className="add-service-container">
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="New service"
                    className="add-service-input"
                  />
                  <button className="add-service-btn" onClick={handleAddService}>
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="pricing-section">
              <h4>Pricing</h4>
              <div className="price-input">
                <label>Hourly Rate (₱)</label>
                <input 
                  type="number" 
                  value={profileData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="pet-specialties">
              <h4>Pet Specialties</h4>
              <p>What types of pets do you specialize in?</p>
              <div className="pet-checkboxes-grid">
                <div className="pet-checkbox-group">
                  <label className="pet-checkbox-label">
                    <input
                      type="checkbox"
                      checked={petSpecialties.dogs}
                      onChange={() => handlePetSpecialtyChange('dogs')}
                      disabled={!isEditing}
                    />
                    Dogs
                  </label>
                  <label className="pet-checkbox-label">
                    <input
                      type="checkbox"
                      checked={petSpecialties.cats}
                      onChange={() => handlePetSpecialtyChange('cats')}
                      disabled={!isEditing}
                    />
                    Cats
                  </label>
                </div>
                
                <div className="pet-checkbox-group">
                  <label className="pet-checkbox-label">
                    <input
                      type="checkbox"
                      checked={petSpecialties.fish}
                      onChange={() => handlePetSpecialtyChange('fish')}
                      disabled={!isEditing}
                    />
                    Fish
                  </label>
                  <label className="pet-checkbox-label">
                    <input
                      type="checkbox"
                      checked={petSpecialties.reptiles}
                      onChange={() => handlePetSpecialtyChange('reptiles')}
                      disabled={!isEditing}
                    />
                    Reptiles
                  </label>
                </div>
                
                <div className="pet-checkbox-group">
                  <label className="pet-checkbox-label">
                    <input
                      type="checkbox"
                      checked={petSpecialties.smallAnimals}
                      onChange={() => handlePetSpecialtyChange('smallAnimals')}
                      disabled={!isEditing}
                    />
                    Small Animals
                  </label>
                  <label className="pet-checkbox-label">
                    <input
                      type="checkbox"
                      checked={petSpecialties.exoticPets}
                      onChange={() => handlePetSpecialtyChange('exoticPets')}
                      disabled={!isEditing}
                    />
                    Exotic Pets
                  </label>
                </div>
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
              <button className="edit-btn" onClick={isEditing ? handleSave: handleEditToggle}>
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>
            <p>Update your account details</p>
            
            <div className="info-grid">
              <div className="info-item">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                ) : (
                  <div className="info-value">{profileData.firstName}</div>
                )}
              </div>
              <div className="info-item">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                ) : (
                  <div className="info-value">{profileData.lastName}</div>
                )}
              </div>
              <div className="info-item">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <div className="info-value">{profileData.email}</div>
                )}
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <div className="info-value">{profileData.phone}</div>
                )}
              </div>
              <div className="info-item full-width">
                <label>Address</label>
                {isEditing ? (
                  <textarea
                    value={profileData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                ) : (
                  <div className="info-value">{profileData.address}</div>
                )}
              </div>
              <div className="info-item">
                <label>Years of Experience</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                  />
                ) : (
                  <div className="info-value">{profileData.experience}</div>
                )}
              </div>
              <div className="info-item full-width">
                <label>Certifications</label>
                {isEditing ? (
                  <textarea
                    value={profileData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                  />
                ) : (
                  <div className="info-value">{profileData.certifications}</div>
                )}
              </div>
              <div className="info-item full-width">
                <label>Professional Bio</label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                ) : (
                  <div className="info-value bio">{profileData.bio}</div>
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