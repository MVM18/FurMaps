import React, { useEffect, useState } from 'react';
import './SPbookings.css';
import { supabase } from '../../lib/supabaseClient';

const ServiceProviderBookings = () => {
  const [bookings, setBookings] = useState([
    /*{
      id: 1,
      initials: "AS",
      name: "Alice Smith",
      service: "Dog Walking",
      pet: {
        name: "Max",
        breed: "Golden Retriever",
        age: "3 years",
        description: "Very friendly, loves to play fetch. Gets excited around other dogs but is well-behaved."
      },
      date: "2024-01-20",
      time: "10:00 AM (1 hour)",
      location: "Downtown Park",
      price: "₱500.00",
      specialRequests: "Please bring water for Max and let him play for a few minutes at the dog park.",
      status: "pending"
    }*/
  ]);

  useEffect(() => {
  const fetchBookings = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return;
    }

  const { data, error } = await supabase
  .from('bookings')
  .select(`
    id,
    service_start_datetime,
    service_end_datetime,
    pet_name,
    pet_type,
    special_instructions,
    contact_number,
    total_price,
    status,
    created_at,
    profiles!fk_bookings_pet_owner (
      first_name,
      last_name,
      address
    ),
    services (
      name
    )
  `)
  .eq('service_provider_id', user.id);

    if (error) {
      console.error('Error fetching bookings:', error);
      return;
    }

    const formatted = data.map(b => {
  const startDate = new Date(b.service_start_datetime);
  const endDate = new Date(b.service_end_datetime);

  return {
    id: b.id,
    name: `${b.profiles?.first_name || ''} ${b.profiles?.last_name || ''}`,
    initials: `${b.profiles?.first_name?.[0] || ''}${b.profiles?.last_name?.[0] || ''}`,
    service: b.services?.name || "Unknown",
    pet: {
      name: b.pet_name,
      breed: b.pet_type,
      age: '', // If you want to calculate based on DOB, you can add logic later
      description: b.special_instructions
    },
    date: `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    location: b.profiles?.address || 'No address provided',
    price: `₱${b.total_price?.toFixed(2)}`,
    specialRequests: b.special_instructions,
    status: b.status
  };
});

    setBookings(formatted);
  };

  fetchBookings();
}, []);
  

  const handleAccept = async (bookingId) => {
    await supabase
    .from('bookings')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  setBookings(prev => prev.map(booking => 
    booking.id === bookingId ? { ...booking, status: 'accepted' } : booking
  ));
  };

  const handleDecline = async (bookingId) => {
  await supabase
    .from('bookings')
    .update({ status: 'declined', updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  setBookings(prev => prev.map(booking => 
    booking.id === bookingId ? { ...booking, status: 'declined' } : booking
  ));
};

  const renderActionButtons = (booking) => {
    if (booking.status === 'accepted') {
      return <div className="status-accepted"><CheckIcon /> Accepted</div>;
    } else if (booking.status === 'declined') {
      return <div className="status-declined"><XIcon /> Declined</div>;
    } else {
      return (
        <div className="action-buttons">
          <button className="decline-button" onClick={() => handleDecline(booking.id)}>
            <XIcon /> Decline
          </button>
          <button className="accept-button" onClick={() => handleAccept(booking.id)}>
            <CheckIcon /> Accept
          </button>
        </div>
      );
    }
  };

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>All Bookings</h1>
        <p>Manage your upcoming and past bookings</p>
      </div>
      
      <div className="bookings-list">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            <div className="booking-header">
              <div className="customer-avatar">{booking.initials}</div>
              <div className="customer-info">
                <div className="customer-name">{booking.name}</div>
                <div className="service-info">
                  <span className="service-name">{booking.service}</span>
                  <span className="service-price">{booking.price}</span>
                </div>
              </div>
            </div>
            
            <div className="booking-details">
              <div className="detail-item">
                <CalendarIcon />
                {booking.date} {booking.time}
              </div>
              <div className="detail-item">
                <LocationIcon />
                {booking.location}
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="pet-info">
              <div className="pet-name">Pet: {booking.pet.name}</div>
              <div className="pet-breed-age">{booking.pet.breed} • {booking.pet.age}</div>
              <div className="pet-description">{booking.pet.description}</div>
            </div>
            
            <div className="special-requests">
              <div className="requests-title">Special Requests:</div>
              <div className="requests-content">{booking.specialRequests}</div>
            </div>
            
            <div className="booking-footer">
              <button className="message-button">
                <MessageIcon /> Message
              </button>
              {renderActionButtons(booking)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Icon components
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="detail-icon">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="detail-icon">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
  </svg>
);

export default ServiceProviderBookings;