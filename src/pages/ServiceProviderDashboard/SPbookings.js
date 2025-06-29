import React, { useState } from 'react';

const ServiceProviderBookings = () => {
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
      status: "pending"
    }
  ]);

  const handleAccept = (bookingId) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: 'accepted' } : booking
    ));
  };

  const handleDecline = (bookingId) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: 'declined' } : booking
    ));
  };

  const renderActionButtons = (booking) => {
    if (booking.status === 'accepted') {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          background: 'linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%)',
          color: '#22543d',
          border: '1px solid #9ae6b4'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          Accepted
        </div>
      );
    } else if (booking.status === 'declined') {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
          color: '#742a2a',
          border: '1px solid #feb2b2'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          Declined
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              background: '#dc2626',
              border: 'none',
              color: 'white',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#b91c1c';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#dc2626';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.3)';
            }}
            onClick={() => handleDecline(booking.id)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            Decline
          </button>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              border: 'none',
              color: 'white',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(72, 187, 120, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(72, 187, 120, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(72, 187, 120, 0.3)';
            }}
            onClick={() => handleAccept(booking.id)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Accept
          </button>
        </div>
      );
    }
  };

  return (
    <div style={{
      width: '100%',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      color: '#333',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <div style={{
        marginBottom: '32px',
        padding: '20px 0'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#1a202c',
          letterSpacing: '-0.025em',
          margin: '0 0 8px 0'
        }}>All Bookings</h1>
        <p style={{
          fontSize: '16px',
          color: '#718096',
          margin: '0',
          fontWeight: '400'
        }}>Manage your upcoming and past bookings</p>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {bookings.map((booking) => (
          <div key={booking.id} style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '18px',
                color: 'white',
                flexShrink: '0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>{booking.initials}</div>
              <div style={{ flex: '1' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 4px 0',
                  color: '#2d3748'
                }}>{booking.name}</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: '0',
                    color: '#4a5568'
                  }}>{booking.service}</span>
                  <span style={{
                    fontWeight: '700',
                    color: '#059669',
                    fontSize: '18px',
                    marginLeft: 'auto'
                  }}>{booking.price}</span>
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                color: '#4a5568',
                padding: '4px 0'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{opacity: 0.7, flexShrink: 0}}>
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                {booking.date} {booking.time}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                color: '#4a5568',
                padding: '4px 0'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{opacity: 0.7, flexShrink: 0}}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {booking.location}
              </div>
            </div>
            
            <div style={{
              height: '1px',
              background: 'linear-gradient(to right, transparent, #e2e8f0, transparent)',
              margin: '20px 0'
            }}></div>
            
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#f7fafc',
              borderRadius: '8px',
              borderLeft: '4px solid #4299e1'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 8px 0',
                color: '#2d3748'
              }}>Pet: {booking.pet.name}</div>
              <div style={{
                fontSize: '14px',
                margin: '0 0 8px 0',
                color: '#4a5568',
                fontWeight: '500'
              }}>{booking.pet.breed} • {booking.pet.age}</div>
              <div style={{
                fontSize: '14px',
                margin: '0',
                color: '#718096',
                lineHeight: '1.5'
              }}>{booking.pet.description}</div>
            </div>
            
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#fffbeb',
              borderRadius: '8px',
              borderLeft: '4px solid #f59e0b'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 8px 0',
                color: '#2d3748'
              }}>Special Requests:</div>
              <div style={{
                fontSize: '14px',
                margin: '0',
                color: '#92400e',
                lineHeight: '1.5'
              }}>{booking.specialRequests}</div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: '1px solid #e2e8f0',
                color: '#4a5568',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '10px 16px',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f7fafc';
                e.target.style.borderColor = '#cbd5e0';
                e.target.style.color = '#2d3748';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.color = '#4a5568';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                </svg>
                Message
              </button>
              {renderActionButtons(booking)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceProviderBookings;