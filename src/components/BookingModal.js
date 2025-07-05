import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './BookingModal.css';

const BookingModal = ({ service, isOpen, onClose, onBookingSuccess }) => {
  const [bookingData, setBookingData] = useState({
    serviceStartDatetime: '',
    serviceEndDatetime: '',
    petType: '',
    petName: '',
    specialInstructions: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch provider details and gallery images
  useEffect(() => {
    if (!service?.provider_id) return;
    
    const fetchProviderAndGallery = async () => {
      setLoadingProvider(true);
      try {
        // Fetch provider details
        const { data: providerData, error: providerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', service.provider_id)
          .single();

        if (!providerError && providerData) {
          setProvider(providerData);
        }

        // Fetch gallery images
        const { data: galleryData, error: galleryError } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('provider_id', service.provider_id)
          .order('created_at', { ascending: false })
          .limit(6); // Limit to 6 images for the modal

        if (!galleryError && galleryData) {
          setGalleryImages(galleryData);
        }
      } catch (error) {
        console.error('Error fetching provider data:', error);
      } finally {
        setLoadingProvider(false);
      }
    };

    fetchProviderAndGallery();
  }, [service?.provider_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Please log in to book a service');
        return;
      }
      
      // Fetch the profile using the user's ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone, address')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        setError('Unable to fetch profile information.');
        return;
      }

      const selectedDate = new Date(bookingData.serviceStartDatetime);
      const nowPlusOneDay = new Date();
      nowPlusOneDay.setDate(nowPlusOneDay.getDate() + 1);

      if (selectedDate < nowPlusOneDay) {
        setError('You must book at least 1 day in advance.');
        return;
      }

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          service_id: service.id,
          pet_owner_id: user.id,
          service_provider_id: service.provider_id,
          service_start_datetime: bookingData.serviceStartDatetime,
          service_end_datetime: bookingData.serviceEndDatetime,
          pet_type: bookingData.petType,
          pet_name: bookingData.petName,
          special_instructions: bookingData.specialInstructions,
          contact_number: profile.phone,
          address: profile.address,
          status: 'pending',
          total_price: service.price
        }])
        .select();

      if (bookingError) {
        console.error('Booking error:', bookingError);
        setError('Failed to create booking. Please try again.');
        return;
      }

      onBookingSuccess(booking[0]);
      onClose();
    } catch (err) {
      console.error('Booking error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTomorrowDateTime = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.toISOString().slice(0, 16);
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType?.toLowerCase()) {
      case 'dog walking':
        return '/images/dog-leash.png';
      case 'pet grooming':
        return '/images/dog-cat.png';
      case 'pet sitting':
        return '/images/dog-human.png';
      case 'veterinary':
        return '/images/dog-background.png';
      default:
        return '/images/dogies.png';
    }
  };

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal">
        <div className="booking-modal-header">
          <h3>Book Service</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Service Summary with Enhanced UI */}
        <div className="service-summary">
          <div className="service-header">
            <div className="service-icon">
              <img src={getServiceIcon(service.serviceType)} alt={service.serviceType} />
            </div>
            <div className="service-details">
              <h4 className="service-name">{service.name}</h4>
              <span className="service-type-badge">{service.serviceType}</span>
            </div>
            <div className="service-price">
              <span className="price-amount">₱{service.price}</span>
              <span className="price-label">/service</span>
            </div>
          </div>
          
          <div className="service-info-grid">
            <div className="info-item">
              <span className="info-label">Provider:</span>
              <span className="info-value">{service.provider_name || 'Service Provider'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Location:</span>
              <span className="info-value">{service.location}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Contact:</span>
              <span className="info-value">{service.contactNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Provider Profile Section */}
        {loadingProvider ? (
          <div className="provider-section loading">
            <div className="loading-spinner"></div>
            <p>Loading provider information...</p>
          </div>
        ) : provider && (
          <div className="provider-section">
            <div className="provider-header">
              <h4>About the Provider</h4>
            </div>
            <div className="provider-profile">
              <div className="provider-avatar">
                <img 
                  src={provider.profile_picture || '/images/user.png'} 
                  alt={`${provider.first_name} ${provider.last_name}`}
                  onError={(e) => {
                    e.target.src = '/images/user.png';
                  }}
                />
              </div>
              <div className="provider-info">
                <h5>{provider.first_name} {provider.last_name}</h5>
                <div className="provider-rating">
                  <span className="stars">★★★★★</span>
                  <span className="rating-text">4.9 (89 reviews)</span>
                </div>
                {provider.bio && (
                  <p className="provider-bio">{provider.bio}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {galleryImages.length > 0 && (
          <div className="gallery-section">
            <div className="gallery-header">
              <h4>Provider Gallery</h4>
              <p>See their work and experience</p>
            </div>
            <div className="gallery-grid">
              {galleryImages.slice(0, 4).map((image, index) => (
                <div 
                  key={image.id} 
                  className="gallery-item"
                  onClick={() => setSelectedImage(image)}
                >
                  <img 
                    src={image.image_url} 
                    alt={`Gallery ${index + 1}`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {index === 3 && galleryImages.length > 4 && (
                    <div className="gallery-overlay">
                      <span>+{galleryImages.length - 4} more</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
            <div className="image-modal" onClick={(e) => e.stopPropagation()}>
              <button className="image-close-btn" onClick={() => setSelectedImage(null)}>×</button>
              <img src={selectedImage.image_url} alt="Gallery" />
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="booking-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h4>Service Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="serviceStartDatetime">Service Start Date & Time *</label>
                <input
                  type="datetime-local"
                  id="serviceStartDatetime"
                  name="serviceStartDatetime"
                  value={bookingData.serviceStartDatetime}
                  onChange={handleInputChange}
                  required
                  min={getTomorrowDateTime()}
                />
              </div>

              <div className="form-group">
                <label htmlFor="serviceEndDatetime">Service End Date & Time *</label>
                <input
                  type="datetime-local"
                  id="serviceEndDatetime"
                  name="serviceEndDatetime"
                  value={bookingData.serviceEndDatetime}
                  onChange={handleInputChange}
                  required
                  min={bookingData.serviceStartDatetime}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Pet Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="petType">Pet Type *</label>
                <select
                  id="petType"
                  name="petType"
                  value={bookingData.petType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select pet type</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Fish">Fish</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="petName">Pet Name *</label>
                <input
                  type="text"
                  id="petName"
                  name="petName"
                  value={bookingData.petName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your pet's name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="specialInstructions">Special Instructions</label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                value={bookingData.specialInstructions}
                onChange={handleInputChange}
                placeholder="Any special requirements, dietary needs, medical conditions, or specific instructions for your pet..."
                rows="3"
              />
            </div>
          </div>

          <div className="booking-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="confirm-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 