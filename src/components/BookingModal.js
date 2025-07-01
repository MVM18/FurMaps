import React, { useState } from 'react';
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
        // 🔧 Fetch the profile using the user's ID
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
  setError("You must book at least 1 day in advance.");
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
  return now.toISOString().slice(0, 16); // returns format: "2025-07-02T00:00"
};

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal">
        <div className="booking-modal-header">
          <h3>Book Service</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="service-summary">
          <h4>{service.name}</h4>
          <p><strong>Provider:</strong> {service.provider_name || 'Service Provider'}</p>
          <p><strong>Location:</strong> {service.location}</p>
          <p><strong>Price:</strong> ₱{service.price}</p>
          <p><strong>Type:</strong> {service.serviceType}</p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
             <label htmlFor="serviceStartDatetime">Service Start Date & Time *</label>
  <input
    type="datetime-local"
    id="serviceStartDatetime"
    name="serviceStartDatetime"
    value={bookingData.serviceStartDatetime}
    onChange={handleInputChange}
    required
    min={getTomorrowDateTime()} // restrict past dates
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

          <div className="form-group">
            <label htmlFor="specialInstructions">Special Instructions</label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              value={bookingData.specialInstructions}
              onChange={handleInputChange}
              placeholder="Any special requirements or instructions..."
              rows="3"
            />
          </div>

          <div className="booking-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="confirm-btn" disabled={isLoading}>
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal; 