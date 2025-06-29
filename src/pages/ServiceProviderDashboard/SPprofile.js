import React, { useState, useRef } from 'react';
import './SPprofile.css';

const ProfileModal = ({ onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 987-6543',
    address: '456 Oak Avenue, Downtown, City 12345',
    experience: '5+ years',
    certifications: 'Pet First Aid, CPR Certified, Professional Dog Walker Certification',
    bio: 'Professional pet care provider with over 5 years of experience. I love all animals and provide personalized care for each pet. Certified in pet first aid and CPR.',
    hourlyRate: 1250
  });

  const [services, setServices] = useState([
    { id: 1, name: 'Dog Walking', active: true },
    { id: 2, name: 'Pet Sitting', active: true },
    { id: 3, name: 'Pet Feeding', active: false }
  ]);

  const [petSpecialties, setPetSpecialties] = useState({
    dogs: true,
    cats: true,
    smallAnimals: true,
    fish: false,
    reptiles: false,
    exoticPets: false
  });

  const [profilePhoto, setProfilePhoto] = useState('https://via.placeholder.com/120x120/e5e7eb/6b7280?text=Profile');
  const fileInputRef = useRef(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [showAddService, setShowAddService] = useState(false);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = () => fileInputRef.current?.click();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfilePhoto(e.target.result);
      reader.readAsDataURL(file);
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
              <button className="edit-btn" onClick={handleEditToggle}>
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