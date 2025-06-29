import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './BookingModal.css';

const BookingModal = ({ service, isOpen, onClose, onBookingSuccess }) => {
  const [bookingData, setBookingData] = useState({
    serviceDate: '',
    serviceTime: '',
    petType: '',
    petName: '',
    specialInstructions: '',
    contactNumber: ''
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

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          service_id: service.id,
          pet_owner_id: user.id,
          service_provider_id: service.provider_id,
          service_date: bookingData.serviceDate,
          service_time: bookingData.serviceTime,
          pet_type: bookingData.petType,
          pet_name: bookingData.petName,
          special_instructions: bookingData.specialInstructions,
          contact_number: bookingData.contactNumber,
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
            <label htmlFor="serviceDate">Service Date *</label>
            <input
              type="date"
              id="serviceDate"
              name="serviceDate"
              value={bookingData.serviceDate}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="serviceTime">Service Time *</label>
            <input
              type="time"
              id="serviceTime"
              name="serviceTime"
              value={bookingData.serviceTime}
              onChange={handleInputChange}
              required
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
            <label htmlFor="contactNumber">Contact Number *</label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={bookingData.contactNumber}
              onChange={handleInputChange}
              required
              placeholder="Enter your contact number"
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