import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './BookingModal.css';
import ProviderReviews from './ProviderReviews';
import ProviderProfile from '../pages/PetOwner/ProviderProfile';

const BookingModal = ({ service, isOpen, onClose, onBookingSuccess }) => {
  const [bookingData, setBookingData] = useState({
    serviceStartDatetime: '',
    serviceEndDatetime: '',
    petType: '',
    petName: '',
    age: '',
    weight: '',
    breed: '',
    petImage: null,
    specialInstructions: '',
    modeOfPayment: 'Cash', // Default to Cash
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showGcashModal, setShowGcashModal] = useState(false);
  const [lastBookingProvider, setLastBookingProvider] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(service?.price || 0);

  // Calculate price based on service duration for per-hour services
  const calculatePrice = (startDateTime, endDateTime) => {
    if (!startDateTime || !endDateTime || !service?.price) {
      return service?.price || 0;
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const durationInHours = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours

    if (service.pricingType === 'per_hour') {
      return Math.ceil(durationInHours) * service.price; // Round up to the nearest hour
    } else {
      return service.price; // Fixed price for per-service
    }
  };

  // Update calculated price when dates change
  useEffect(() => {
    if (bookingData.serviceStartDatetime && bookingData.serviceEndDatetime) {
      const newPrice = calculatePrice(bookingData.serviceStartDatetime, bookingData.serviceEndDatetime);
      setCalculatedPrice(newPrice);
    }
  }, [bookingData.serviceStartDatetime, bookingData.serviceEndDatetime, service?.price, service?.pricingType]);

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

  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
    
    // Auto-calculate end time for per-service bookings when start time changes
    if (name === 'serviceStartDatetime' && service?.pricingType === 'per_service' && service?.serviceDuration) {
      // Parse the datetime-local input value correctly
      const [datePart, timePart] = value.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      // Create date in local timezone
      const startDate = new Date(year, month - 1, day, hour, minute);
      const endDate = new Date(startDate.getTime() + (service.serviceDuration * 60 * 1000)); // Convert minutes to milliseconds
      
      // Format the end date back to datetime-local format
      const endYear = endDate.getFullYear();
      const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
      const endDay = String(endDate.getDate()).padStart(2, '0');
      const endHour = String(endDate.getHours()).padStart(2, '0');
      const endMinute = String(endDate.getMinutes()).padStart(2, '0');
      const endDateTimeLocal = `${endYear}-${endMonth}-${endDay}T${endHour}:${endMinute}`;
      
      setBookingData(prev => ({
        ...prev,
        serviceEndDatetime: endDateTimeLocal
      }));
    }
    
    // Clear availability message when user changes dates
    if (name === 'serviceStartDatetime' || name === 'serviceEndDatetime') {
      setAvailabilityMessage('');
    }
  };

  // Validate end time is after start time
  const validateEndTime = () => {
    if (!bookingData.serviceStartDatetime || !bookingData.serviceEndDatetime) {
      return true; // Allow empty values during input
    }

    const startDate = new Date(bookingData.serviceStartDatetime);
    const endDate = new Date(bookingData.serviceEndDatetime);
    
    return endDate > startDate;
  };

  // Get minimum end time for the end datetime input
  const getMinEndTime = () => {
    if (!bookingData.serviceStartDatetime) {
      return '';
    }
    
    // Add 1 minute to start time to ensure end time is after start time
    const startDate = new Date(bookingData.serviceStartDatetime);
    const minEndDate = new Date(startDate.getTime() + (1 * 60 * 1000)); // Add 1 minute
    
    const year = minEndDate.getFullYear();
    const month = String(minEndDate.getMonth() + 1).padStart(2, '0');
    const day = String(minEndDate.getDate()).padStart(2, '0');
    const hour = String(minEndDate.getHours()).padStart(2, '0');
    const minute = String(minEndDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  // Check availability when both start and end times are set
  useEffect(() => {
    const checkAvailability = async () => {
      if (!bookingData.serviceStartDatetime || !bookingData.serviceEndDatetime || !service?.id) {
        setAvailabilityMessage('');
        return;
      }

      const startDate = new Date(bookingData.serviceStartDatetime);
      const endDate = new Date(bookingData.serviceEndDatetime);

      // Don't check if end time is before start time
      if (endDate <= startDate) {
        setAvailabilityMessage('');
        return;
      }

      setIsCheckingAvailability(true);
      setAvailabilityMessage('Checking availability...');

      try {
        const conflictCheck = await checkBookingConflicts(
          service.id,
          bookingData.serviceStartDatetime,
          bookingData.serviceEndDatetime
        );

        if (conflictCheck.error) {
          setAvailabilityMessage('Unable to check availability');
        } else if (conflictCheck.hasConflict) {
          const conflictingBooking = conflictCheck.conflictingBookings[0];
          const conflictStart = new Date(conflictingBooking.service_start_datetime).toLocaleString();
          const conflictEnd = new Date(conflictingBooking.service_end_datetime).toLocaleString();
          
          setAvailabilityMessage(`⚠️ Time slot unavailable. There's a ${conflictingBooking.status} booking from ${conflictStart} to ${conflictEnd}.`);
        } else {
          setAvailabilityMessage('✅ Time slot available!');
        }
      } catch (error) {
        setAvailabilityMessage('Unable to check availability');
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    // Debounce the availability check
    const timeoutId = setTimeout(checkAvailability, 1000);
    return () => clearTimeout(timeoutId);
  }, [bookingData.serviceStartDatetime, bookingData.serviceEndDatetime, service?.id]);

  // Function to check for booking conflicts
  const checkBookingConflicts = async (serviceId, startDateTime, endDateTime) => {
    try {
      // Check for existing bookings that overlap with the requested time slot
      // We need to check for bookings that:
      // 1. Are for the same service
      // 2. Have a status that indicates they're active (pending, confirmed, ongoing)
      // 3. Overlap with the requested time slot
      const { data: conflictingBookings, error } = await supabase
        .from('bookings')
        .select('id, service_start_datetime, service_end_datetime, status, pet_name')
        .eq('service_id', serviceId)
        .in('status', ['pending', 'confirmed', 'ongoing']);

      if (error) {
        console.error('Error checking booking conflicts:', error);
        return { hasConflict: false, error: 'Failed to check availability' };
      }

      // Filter for overlapping bookings manually
      const overlappingBookings = (conflictingBookings || []).filter(booking => {
        const bookingStart = new Date(booking.service_start_datetime);
        const bookingEnd = new Date(booking.service_end_datetime);
        const requestedStart = new Date(startDateTime);
        const requestedEnd = new Date(endDateTime);

        // Check if the time ranges overlap
        // Two time ranges overlap if: start1 < end2 AND start2 < end1
        return bookingStart < requestedEnd && requestedStart < bookingEnd;
      });

      return { 
        hasConflict: overlappingBookings.length > 0,
        conflictingBookings: overlappingBookings
      };
    } catch (err) {
      console.error('Error in checkBookingConflicts:', err);
      return { hasConflict: false, error: 'Failed to check availability' };
    }
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
        .select('phone, address, status, role')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        setError('Unable to fetch profile information.');
        return;
      }

      // Check if user is suspended
      if (profile.status === 'Suspended') {
        setError('Your account has been suspended. You cannot book services at this time. Please contact support for assistance.');
        return;
      }

      // Check if user is a pet owner (should be able to book)
      if (profile.role !== 'owner') {
        setError('Only pet owners can book services.');
        return;
      }

      const selectedDate = new Date(bookingData.serviceStartDatetime);
      const selectedEndDate = new Date(bookingData.serviceEndDatetime);
      const nowPlusOneDay = new Date();
      nowPlusOneDay.setDate(nowPlusOneDay.getDate() + 1);

      if (selectedDate < nowPlusOneDay) {
        setError('You must book at least 1 day in advance.');
        return;
      }

      if (selectedEndDate <= selectedDate) {
        setError('Service end time must be after start time.');
        return;
      }

      // Additional validation for end time being after start time
      if (!validateEndTime()) {
        setError('Service end time must be after start time.');
        return;
      }

      // Check minimum duration for per-hour services
      if (service.pricingType === 'per_hour') {
        const durationInMinutes = (selectedEndDate - selectedDate) / (1000 * 60);
        if (durationInMinutes < 60) {
          setError('Per-hour services must have a minimum duration of 60 minutes.');
          return;
        }
      }

      // Check for booking conflicts before creating the booking
      const conflictCheck = await checkBookingConflicts(
        service.id,
        bookingData.serviceStartDatetime,
        bookingData.serviceEndDatetime
      );

      if (conflictCheck.error) {
        setError(conflictCheck.error);
        return;
      }

      if (conflictCheck.hasConflict) {
        const conflictingBooking = conflictCheck.conflictingBookings[0];
        const conflictStart = new Date(conflictingBooking.service_start_datetime).toLocaleString();
        const conflictEnd = new Date(conflictingBooking.service_end_datetime).toLocaleString();

        setError(`This time slot is already booked. There's a ${conflictingBooking.status} booking from ${conflictStart} to ${conflictEnd}. Please choose a different time.`);
        return;
      }

      // --- Pet Image Upload Logic ---
      let petImageUrl = '';
      if (bookingData.petImage) {
        const file = bookingData.petImage;
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `pet-images/${fileName}`;
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('pet-images')
          .upload(filePath, file);
        if (uploadError) {
          setError('Failed to upload pet image.');
          setIsLoading(false);
          return;
        }
        // Get public URL
        const { data: publicUrlData, error: urlError } = await supabase.storage
          .from('pet-images')
          .getPublicUrl(filePath);
        if (urlError) {
          setError('Failed to get pet image URL.');
          setIsLoading(false);
          return;
        }
        petImageUrl = publicUrlData.publicUrl;
      }
      // --- End Pet Image Upload Logic ---

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
          age: bookingData.age,
          weight: bookingData.weight,
          breed: bookingData.breed,
          pet_image: petImageUrl,
          special_instructions: bookingData.specialInstructions,
          contact_number: profile.phone,
          address: profile.address,
          status: 'pending',
          total_price: calculatedPrice,
          mode_of_payment: bookingData.modeOfPayment,
        }])
        .select();

      if (bookingError) {
        console.error('Booking error:', bookingError);
        setError('Failed to create booking. Please try again.');
        return;
      }

      // Show GCASH modal if payment is GCASH
      if (bookingData.modeOfPayment === 'GCASH' && provider?.gcash_details) {
        console.log('Should show GCASH modal', provider);
        setLastBookingProvider(provider);
        setShowGcashModal(true);
        // DO NOT call onClose() here!
      } else {
        onBookingSuccess(booking[0]);
        onClose();
      }
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
    isOpen && (
      <div className="booking-modal-overlay">
        <div className="booking-modal">
          {showGcashModal && lastBookingProvider ? (
            <div className="gcash-modal">
              <h3>GCASH Payment Details</h3>
              <p>Please use the following details to pay your provider via GCASH:</p>
              <div className="gcash-details-box">
                <div><strong>GCASH Details:</strong> {lastBookingProvider.gcash_details}</div>
                {lastBookingProvider.gcash_qr_url && (
                  <div style={{ marginTop: 8 }}>
                    <img src={lastBookingProvider.gcash_qr_url} alt="GCASH QR Code" style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, border: '1px solid #eee' }} />
                  </div>
                )}
              </div>
              <button className="confirm-btn" onClick={() => {
                setShowGcashModal(false);
                onBookingSuccess({ mode_of_payment: 'GCASH' });
                onClose();
              }}>
                Done
              </button>
            </div>
          ) : (
            <>
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
                    <span className="price-label">/{service.pricingType === 'per_hour' ? 'hour' : 'service'}</span>
                    {service.pricingType === 'per_service' && service.serviceDuration && (
                      <span className="service-duration-info">• {service.serviceDuration} min</span>
                    )}
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
              ) : null}

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
                      <label htmlFor="serviceEndDatetime">
                        Service End Date & Time *
                        {service.pricingType === 'per_service' && (
                          <span className="auto-calculated"> (Auto-calculated)</span>
                        )}
                      </label>
                      <input
                        type="datetime-local"
                        id="serviceEndDatetime"
                        name="serviceEndDatetime"
                        value={bookingData.serviceEndDatetime}
                        onChange={handleInputChange}
                        required
                        min={getMinEndTime()}
                        disabled={service.pricingType === 'per_service'}
                        style={service.pricingType === 'per_service' ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                      />
                      {service.pricingType === 'per_service' && (
                        <small className="form-help">
                          End time is automatically calculated based on service duration ({service.serviceDuration} minutes)
                        </small>
                      )}
                      {service.pricingType === 'per_hour' && (
                        <small className="form-help">
                          Minimum duration: 60 minutes
                        </small>
                      )}
                      {!validateEndTime() && bookingData.serviceStartDatetime && bookingData.serviceEndDatetime && (
                        <small className="form-error">
                          End time must be after start time
                        </small>
                      )}
                    </div>
                </div>
                {/* Availability Check Message */}
                  {availabilityMessage && (
                    <div className={`availability-message ${availabilityMessage.includes('✅') ? 'available' : availabilityMessage.includes('⚠️') ? 'unavailable' : 'checking'}`}>
                      {isCheckingAvailability && <span className="loading-spinner-small"></span>}
                      {availabilityMessage}
                    </div>
                  )}
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
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="age">Age</label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={bookingData.age}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="Pet's age (years)"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="weight">Weight</label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={bookingData.weight}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="Pet's weight (kg)"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="breed">Breed</label>
                      <input
                        type="text"
                        id="breed"
                        name="breed"
                        value={bookingData.breed}
                        onChange={handleInputChange}
                        placeholder="Pet's breed"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="petImage">Pet Image</label>
                      <input
                        type="file"
                        id="petImage"
                        name="petImage"
                        accept="image/*"
                        onChange={handleInputChange}
                      />
                      {bookingData.petImage && (
                        <img
                          src={URL.createObjectURL(bookingData.petImage)}
                          alt="Pet Preview"
                          style={{ marginTop: 8, maxWidth: 80, maxHeight: 80, borderRadius: 8, border: '1px solid #eee' }}
                        />
                      )}
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
                <div className="form-section">
                  <h4>Payment Method</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Mode of Payment *</label>
                      <div className="payment-options">
                        <label>
                          <input
                            type="radio"
                            name="modeOfPayment"
                            value="Cash"
                            checked={bookingData.modeOfPayment === 'Cash'}
                            onChange={handleInputChange}
                            required
                          />
                          Cash
                        </label>
                        {provider?.gcash_details && (
                          <label>
                            <input
                              type="radio"
                              name="modeOfPayment"
                              value="GCASH"
                              checked={bookingData.modeOfPayment === 'GCASH'}
                              onChange={handleInputChange}
                              required
                            />
                            GCASH (Online)
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  <button type="button" className="cancel-btn" onClick={onClose}>
                    Cancel
                  </button> <button
                    type="submit"
                    className="confirm-btn"
                    disabled={isLoading || (availabilityMessage && availabilityMessage.includes('⚠️')) || !validateEndTime()}
                    title={
                      availabilityMessage && availabilityMessage.includes('⚠️') 
                        ? 'Please choose a different time slot' 
                        : !validateEndTime() 
                        ? 'End time must be after start time'
                        : ''
                    }
                  >
                    {isLoading ? (
                      <>
                        <span className="loading-spinner-small"></span>
                        Booking...
                      </>
                      ) : availabilityMessage && availabilityMessage.includes('⚠️') ? (
                      'Time Slot Unavailable'
                    ) : !validateEndTime() ? (
                      'Invalid Time Range'
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>
              </form>

              {/* Price Breakdown for Per-Hour Services */}
              {service.pricingType === 'per_hour' && bookingData.serviceStartDatetime && bookingData.serviceEndDatetime && (
                <div className="price-breakdown">
                  <h4>Price Breakdown</h4>
                  <div className="breakdown-details">
                    <div className="breakdown-item">
                      <span>Base Rate:</span>
                      <span>₱{service.price} per hour</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Duration:</span>
                      <span>{(() => {
                        const start = new Date(bookingData.serviceStartDatetime);
                        const end = new Date(bookingData.serviceEndDatetime);
                        const hours = Math.ceil((end - start) / (1000 * 60 * 60));
                        return `${hours} hour${hours > 1 ? 's' : ''}`;
                      })()}</span>
                    </div>
                    <div className="breakdown-item total">
                      <span>Total:</span>
                      <span>₱{calculatedPrice}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  );
};

export default BookingModal; 