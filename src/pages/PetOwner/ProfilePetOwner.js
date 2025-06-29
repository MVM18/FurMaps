import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import styles from './ProfilePetOwner.module.css';
import LoadingScreen from '../../components/LoadingScreen';
import Toast from '../../components/Toast';

const mockPets = [
  {
    id: 1,
    name: 'Max',
    breed: 'Golden Retriever',
    age: 3,
    weight: 65,
    temperament: 'Friendly, energetic, loves other dogs',
    medicalNotes: 'Up to date on all vaccinations. Allergic to chicken.',
    image: '',
  },
  {
    id: 2,
    name: 'Luna',
    breed: 'Border Collie',
    age: 2,
    weight: 45,
    temperament: 'Intelligent, active, good with children',
    medicalNotes: 'No known allergies. Needs daily exercise.',
    image: '',
  },
];

const ProfilePetOwner = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [userProfile, setUserProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profile_picture: '',
    role: 'owner'
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    bio: ''
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [pets, setPets] = useState(mockPets);

  useEffect(() => {
    fetchUserProfile();
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/LoginUser');
        return;
      }

      // Fetch profile data from profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setToastMsg('Failed to load profile data');
        setShowToast(true);
        return;
      }

      if (profileData) {
        setUserProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: user.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          bio: profileData.bio || '',
          profile_picture: profileData.profile_picture || '',
          role: profileData.role || 'owner'
        });

        setFormData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          bio: profileData.bio || ''
        });

        // Set image preview if profile picture exists
        if (profileData.profile_picture) {
          setImagePreview(profileData.profile_picture);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setToastMsg('Failed to load profile');
      setShowToast(true);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setToastMsg('Please select an image file');
        setShowToast(true);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToastMsg('Image size should be less than 5MB');
        setShowToast(true);
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }

      // Get public URL
    const { data, error } = await supabase.storage.from('avatars').getPublicUrl(filePath);

if (error) {
  console.error('Error getting public URL:', error);
  return null;
}

return data.publicUrl;

    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (formData.bio && formData.bio.length > 500) errors.bio = 'Bio should be less than 500 characters';
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setToastMsg('User not authenticated');
        setShowToast(true);
        return;
      }

      let profilePictureUrl = userProfile.profile_picture;

      // Upload new image if selected
      if (selectedImage) {
        setUploadingImage(true);
        profilePictureUrl = await uploadProfilePicture(selectedImage);
        setUploadingImage(false);
        
        if (!profilePictureUrl) {
          setToastMsg('Failed to upload profile picture');
          setShowToast(true);
          return;
        }
      }
      console.log('Uploading image URL:', profilePictureUrl);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
          profile_picture: profilePictureUrl
        })
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error updating profile:', error);

        setToastMsg('Failed to update profile');
        setShowToast(true);
        return;
      }

      setUserProfile({
        ...userProfile,
        ...formData,
        profile_picture: profilePictureUrl
      });
      console.log('Selected Image:', selectedImage);
console.log('Generated URL:', profilePictureUrl);
console.log('Form Data:', formData);
console.log('User ID for update:', user.id);

      setSelectedImage(null);
      setIsEditing(false);
      setToastMsg('Profile updated successfully!');
      setShowToast(true);
    } catch (error) {
      console.error('Error:', error);
      setToastMsg('Failed to update profile');
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      phone: userProfile.phone,
      address: userProfile.address,
      bio: userProfile.bio
    });
    setSelectedImage(null);
    setImagePreview(userProfile.profile_picture || '');
    setIsEditing(false);
    setFormErrors({});
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/HomepagePetOwner');
  };

  // Pet actions (mock only)
  const handleAddPet = () => {
    setToastMsg('Add Pet feature coming soon!');
    setShowToast(true);
  };
  const handleEditPet = (pet) => {
    setToastMsg(`Edit Pet Info for ${pet.name} coming soon!`);
    setShowToast(true);
  };
  const handleDeletePet = (petId) => {
    setPets(pets.filter((pet) => pet.id !== petId));
    setToastMsg('Pet deleted (mock only)');
    setShowToast(true);
  };

  return (
    <div className={styles.profileWrapper}>
      {/* Loading Screen */}
      {isLoading && <LoadingScreen />}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMsg}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Header */}
      <header className={styles.profileHeader}>
        <div className={styles.logoContainer}>
          <img className={styles.logoIcon} src="/images/paw-logo.png" alt="Logo" />
          <h1 className={styles.logoText}>FurMaps</h1>
        </div>
        
        <nav className={styles.navMenu}>
          <button className={styles.navButton} onClick={handleBackToDashboard}>
            <img src="/Icons/simpleUser.svg" alt="Dashboard" />
            <span>Dashboard</span>
          </button>
          <button className={styles.navButton} onClick={handleLogout}>
            <img src="/Icons/logout.svg" alt="Logout" />
            <span>Logout</span>
          </button>
        </nav>
      </header>

      {/* Tabs */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span role="img" aria-label="Profile">👤</span> Profile
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'pets' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pets')}
        >
          <span role="img" aria-label="My Pets">🐾</span> My Pets ({pets.length})
        </button>
      </div>

      {/* Main Content */}
      <main className={styles.profileContent}>
        {activeTab === 'profile' && (
          <>
            <div className={styles.profileHeaderSection}>
              <h2>Pet Owner Profile</h2>
              <p>Manage your account information and preferences</p>
            </div>

            {/* Profile Card */}
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <div className={styles.profileAvatarContainer}>
                  <div className={styles.profileAvatar}>
                    <img 
                     src={imagePreview || userProfile.profile_picture || '/default-avatar.png'}
                       alt="Profile"
                        className={styles.profileImage}
                    />
                    {isEditing && (
                      <div className={styles.avatarOverlay}>
                        <label htmlFor="profile-picture" className={styles.uploadButton}>
                          <img src="/Icons/simpleUser.svg" alt="Upload" />
                          <span>Change Photo</span>
                        </label>
                        <input
                          type="file"
                          id="profile-picture"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                    )}
                  </div>
                  {uploadingImage && (
                    <div className={styles.uploadingIndicator}>
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
                <div className={styles.profileInfo}>
                  <h3>{userProfile.first_name} {userProfile.last_name}</h3>
                  <p className={styles.userRole}>Pet Owner</p>
                  <p className={styles.userEmail}>{userProfile.email}</p>
                  {userProfile.bio && (
                    <p className={styles.userBio}>{userProfile.bio}</p>
                  )}
                </div>
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className={styles.profileForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={formErrors.first_name ? styles.error : ''}
                    />
                    {formErrors.first_name && (
                      <span className={styles.errorText}>{formErrors.first_name}</span>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={formErrors.last_name ? styles.error : ''}
                    />
                    {formErrors.last_name && (
                      <span className={styles.errorText}>{formErrors.last_name}</span>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={userProfile.email}
                      disabled
                      className={styles.disabled}
                    />
                    <small>Email cannot be changed</small>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={formErrors.phone ? styles.error : ''}
                    />
                    {formErrors.phone && (
                      <span className={styles.errorText}>{formErrors.phone}</span>
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows="3"
                    className={formErrors.address ? styles.error : ''}
                  />
                  {formErrors.address && (
                    <span className={styles.errorText}>{formErrors.address}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows="4"
                    placeholder="Tell us about yourself and your pets..."
                    className={formErrors.bio ? styles.error : ''}
                  />
                  <div className={styles.bioCounter}>
                    <small>{formData.bio.length}/500 characters</small>
                  </div>
                  {formErrors.bio && (
                    <span className={styles.errorText}>{formErrors.bio}</span>
                  )}
                </div>

                {isEditing && (
                  <div className={styles.formActions}>
                    <button 
                      className={styles.saveButton}
                      onClick={handleSave}
                      disabled={submitting || uploadingImage}
                    >
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      className={styles.cancelButton}
                      onClick={handleCancel}
                      disabled={submitting || uploadingImage}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Stats */}
            <div className={styles.statsSection}>
              <h3>Account Statistics</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <p className={styles.statTitle}>Total Bookings</p>
                    <h4 className={styles.statValue}>15</h4>
                  </div>
                  <img src="/Icons/bookings.svg" alt="Bookings" className={styles.statIcon} />
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <p className={styles.statTitle}>Favorite Providers</p>
                    <h4 className={styles.statValue}>8</h4>
                  </div>
                  <img src="/Icons/star.svg" alt="Favorites" className={styles.statIcon} />
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <p className={styles.statTitle}>This Month</p>
                    <h4 className={styles.statValue}>₱2,450</h4>
                  </div>
                  <img src="/Icons/pesos.svg" alt="Spending" className={styles.statIcon} />
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statInfo}>
                    <p className={styles.statTitle}>Active Services</p>
                    <h4 className={styles.statValue}>3</h4>
                  </div>
                  <img src="/Icons/user.svg" alt="Services" className={styles.statIcon} />
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === 'pets' && (
          <div className={styles.petsTabWrapper}>
            <div className={styles.petsHeader}>
              <h2>My Pets</h2>
              <p>Manage your pet information for service providers</p>
              <button className={styles.addPetButton} onClick={handleAddPet}>
                <span>+ Add Pet</span>
              </button>
            </div>
            <div className={styles.petsGrid}>
              {pets.map((pet) => (
                <div key={pet.id} className={styles.petCard}>
                  <div className={styles.petCardHeader}>
                    <div className={styles.petAvatar}>
                      <img src={pet.image || '/images/user.png'} alt={pet.name} />
                    </div>
                    <div className={styles.petInfoMain}>
                      <div className={styles.petName}>{pet.name}</div>
                      <div className={styles.petBreed}>{pet.breed}</div>
                      <div className={styles.petDetails}>{pet.age} years • {pet.weight} lbs</div>
                    </div>
                    <button className={styles.deletePetButton} onClick={() => handleDeletePet(pet.id)} title="Delete">
                      <span style={{fontSize: '1.25rem', color: '#ef4444'}}>×</span>
                    </button>
                  </div>
                  <div className={styles.petCardBody}>
                    <div className={styles.petSection}><strong>Temperament</strong><br />{pet.temperament}</div>
                    <div className={styles.petSection}><strong>Medical Notes</strong><br />{pet.medicalNotes}</div>
                  </div>
                  <div className={styles.petCardFooter}>
                    <button className={styles.editPetButton} onClick={() => handleEditPet(pet)}>
                      <span role="img" aria-label="Edit">✏️</span> Edit Pet Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePetOwner;
