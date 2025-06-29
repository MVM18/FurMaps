import { useState } from 'react';
import './SPbookings.css';

const OverlayBorderShadowOverlayBlur = () => {
  const [bookings, setBookings] = useState([
    {
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
      status: "pending",
      statusColor: "#a16207",
      statusBg: "#fef9c3",
      icon: "Icons/pending.svg",
      actionStatus: null // null, 'accepted', or 'declined'
    },
    // ... other bookings
  ]);

  const handleAction = (id, action) => {
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, actionStatus: action } : booking
    ));
  };

  return (
    <div className="overlaybordershadowoverlayb">
      <div className="container">
        <div className="heading-3">
          <div className="all-bookings">All Bookings</div>
        </div>
        <div className="margin">
          <div className="heading-3">
            <div className="manage-your-upcoming">Manage your bookings</div>
          </div>
        </div>
      </div>     
      <div className="container2">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            {/* ... (keep your existing card content) */}
            <div className="booking-header">
              <div className="avatar">{booking.initials}</div>
              <div className="client-info">
                <h3>{booking.name}</h3>
                <div className="service-info">
                  <span>{booking.service}</span>
                  <span className="price">{booking.price}</span>
                </div>
              </div>
            </div>
            <div className="booking-details">
              <div className="detail-row">
                <img src="Icons/calendar.svg" alt="Date" />
                <span>{booking.date} {booking.time}</span>
              </div>
              <div className="detail-row">
                <img src="Icons/location.svg" alt="Location" />
                <span>{booking.location}</span>
              </div>

            </div>
             <div className="pet-info">
              <h4>Pet: {booking.pet.name}</h4>
              <p>{booking.pet.breed} • {booking.pet.age}</p>
              <p>{booking.pet.description}</p>
            </div>
            
            <div className="special-requests">
              <h4>Special Requests:</h4>
              <p>{booking.specialRequests}</p>
            </div>     
            <div className="booking-actions">
              <button className="message-btn">
                <img src="Icons/chat.svg" alt="Message" />
                Message
              </button>
              
              {booking.actionStatus ? (
                <div className={`action-status ${booking.actionStatus}`}>
                  {booking.actionStatus === 'accepted' ? (
                    <>
                      <img src="Icons/done.svg" alt="Accepted" />
                      Accepted
                    </>
                  ) : (
                    <>
                      <img src="Icons/declin.svg" alt="" />
                      Declined
                    </>
                  )}
                </div>
              ) : (
                <div className="action-buttons">
                  <button 
                    className="decline-btn"
                    onClick={() => handleAction(booking.id, 'declined')}
                  >
                    <img src="Icons/declin.svg" alt="" />
                    Decline
                  </button>
                  <button 
                    className="accept-btn"
                    onClick={() => handleAction(booking.id, 'accepted')}
                  >
                    <img src="Icons/checked.svg" alt="Accept" />
                    Accept
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverlayBorderShadowOverlayBlur;