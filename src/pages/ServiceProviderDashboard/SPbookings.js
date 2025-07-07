import React, { useEffect, useState } from 'react';
import './SPbookings.css';
import { supabase } from '../../lib/supabaseClient';

const ServiceProviderBookings = ({ highlightedBookingId, onMessageClick, onShowToast }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [pendingNotifications, setPendingNotifications] = useState([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeFilter === 'dropdown-open' && !event.target.closest('.filter-dropdown')) {
        setActiveFilter('all');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeFilter]);

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
    pet_owner_id,
    services (
      name,
      service_type
    )
  `)
  .eq('service_provider_id', user.id);

    if (error) {
      console.error('Error fetching bookings:', error);
      return;
    }

    // Fetch profiles for all pet owners
    const petOwnerIds = data.map(b => b.pet_owner_id).filter(id => id);
    let profiles = {};
    
    if (petOwnerIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, address')
        .in('user_id', petOwnerIds);
      
      if (!profileError && profileData) {
        profiles = profileData.reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {});
      }
    }

    const formatted = data.map(b => {
  // Format the datetime for display
  const startDate = new Date(b.service_start_datetime);
  const endDate = new Date(b.service_end_datetime);
  
  // Get profile data for this booking
  const profile = profiles[b.pet_owner_id];
  
  // Format the date and time for display
  const formattedDate = startDate.toLocaleDateString();
  const formattedTime = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return {
    id: b.id,
    petOwnerId: b.pet_owner_id, // Add pet owner's user ID
    name: `${profile?.first_name || ''} ${profile?.last_name || ''}`,
    initials: `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`,
    service: b.services?.name || "Unknown",
    serviceType: b.services?.service_type || "Unknown",
    pet: {
      name: b.pet_name,
      breed: b.pet_type,
      age: '', // If you want to calculate based on DOB, you can add logic later
      description: b.special_instructions
    },
    date: formattedDate,
    time: formattedTime,
    service_start_datetime: b.service_start_datetime,
    service_end_datetime: b.service_end_datetime,
    location: profile?.address || 'No address provided',
    price: `₱${b.total_price?.toFixed(2)}`,
    specialRequests: b.special_instructions,
    status: b.status
  };
});

    setBookings(formatted);
  };

  fetchBookings();
  
  // Request notification permission on component mount
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []);

  // Auto-update booking statuses based on time
  useEffect(() => {
    const updateBookingStatuses = async () => {
      const now = new Date();
      let hasUpdates = false;
      const updatedBookings = bookings.map(booking => {
        const startTime = new Date(booking.service_start_datetime);
        const endTime = new Date(booking.service_end_datetime);
        
        let newStatus = booking.status;
        
        // Auto-update logic based on time and current status
        if (booking.status === 'pending') {
          // If service start time has passed, automatically cancel
          if (now >= startTime) {
            newStatus = 'cancelled';
            hasUpdates = true;
          }
        } else if (booking.status === 'confirmed') {
          // If service start time has passed, change to ongoing
          if (now >= startTime) {
            newStatus = 'ongoing';
            hasUpdates = true;
          }
        } else if (booking.status === 'ongoing') {
          // If service end time has passed, change to completed
          if (now >= endTime) {
            newStatus = 'completed';
            hasUpdates = true;
          }
        }
        
        return {
          ...booking,
          status: newStatus
        };
      });
      
      // Update local state
      if (hasUpdates) {
        setBookings(updatedBookings);
        
        // Update database for bookings that changed status
        updatedBookings.forEach(async (booking) => {
          const originalBooking = bookings.find(b => b.id === booking.id);
          if (originalBooking && originalBooking.status !== booking.status) {
            await supabase
              .from('bookings')
              .update({ 
                status: booking.status, 
                updated_at: new Date().toISOString() 
              })
              .eq('id', booking.id);
          }
        });
      }
    };
    
    // Check every minute for status updates
    const interval = setInterval(updateBookingStatuses, 60000);
    updateBookingStatuses(); // Run immediately on mount
    
    return () => clearInterval(interval);
  }, [bookings]);

  // Check for pending bookings that need attention (2 hours before start time)
  useEffect(() => {
    const checkPendingBookings = () => {
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours from now
      
      const urgentPendingBookings = bookings.filter(booking => {
        if (booking.status !== 'pending') return false;
        
        const startTime = new Date(booking.service_start_datetime);
        const timeUntilStart = startTime - now;
        const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);
        
        // Check if booking starts within 2 hours and hasn't been notified yet
        return hoursUntilStart <= 2 && hoursUntilStart > 0 && 
               !pendingNotifications.includes(booking.id);
      });
      
      if (urgentPendingBookings.length > 0) {
        // Add to notifications
        setPendingNotifications(prev => [...prev, ...urgentPendingBookings.map(b => b.id)]);
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          urgentPendingBookings.forEach(booking => {
            new Notification('Urgent: Pending Booking', {
              body: `Booking for ${booking.service} (${booking.pet.name}) starts in less than 2 hours. Please review and respond.`,
              icon: '/favicon.ico',
              tag: `pending-${booking.id}`
            });
          });
        }
        
        // Show toast notification for urgent bookings
        if (onShowToast) {
          urgentPendingBookings.forEach(booking => {
            onShowToast(`⚠️ URGENT: Booking for ${booking.service} (${booking.pet.name}) starts in less than 2 hours!`);
          });
        }
        console.log('Urgent pending bookings:', urgentPendingBookings);
      }
    };
    
    // Check every 5 minutes for urgent pending bookings
    const interval = setInterval(checkPendingBookings, 5 * 60 * 1000);
    checkPendingBookings(); // Run immediately on mount
    
    return () => clearInterval(interval);
  }, [bookings, pendingNotifications]);

  // Filter bookings based on active filter
  useEffect(() => {
    let filtered = bookings;
    const now = new Date();
    switch (activeFilter) {
      case 'pending':
        filtered = bookings.filter(booking => booking.status === 'pending');
        break;
      case 'confirmed':
        filtered = bookings.filter(booking => booking.status === 'confirmed');
        break;
      case 'ongoing':
        filtered = bookings.filter(booking => booking.status === 'ongoing');
        break;
      case 'cancelled':
        filtered = bookings.filter(booking => booking.status === 'cancelled');
        break;
      case 'completed':
        filtered = bookings.filter(booking => booking.status === 'completed');
        break;
      case 'urgent':
        filtered = bookings.filter(booking => {
          if (booking.status !== 'pending') return false;
          const startTime = new Date(booking.service_start_datetime);
          const timeUntilStart = startTime - now;
          const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);
          return hoursUntilStart <= 2 && hoursUntilStart > 0;
        });
        break;
      case 'dropdown-open':
        filtered = bookings; // Show all when dropdown is open
        break;
      default:
        filtered = bookings; // 'all' case
    }
    setFilteredBookings(filtered);
  }, [bookings, activeFilter]);
  

  const handleAccept = async (bookingId) => {
    await supabase
    .from('bookings')
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  setBookings(prev => prev.map(booking => 
    booking.id === bookingId ? { ...booking, status: 'confirmed' } : booking
  ));
  };

  const handleDecline = async (bookingId) => {
  await supabase
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  setBookings(prev => prev.map(booking => 
    booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
  ));
};

  const handleMessage = (petOwnerId, petOwnerName) => {
    if (!petOwnerId) {
      console.error('No pet owner ID available for messaging');
      return;
    }
    
    if (onMessageClick) {
      onMessageClick(petOwnerId, petOwnerName);
    }
  };

  const renderActionButtons = (booking) => {
    if (booking.status === 'pending') {
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
    } else if (booking.status === 'confirmed') {
      return <div className="status-accepted"><CheckIcon /> Confirmed</div>;
    } else if (booking.status === 'ongoing') {
      return <div className="status-ongoing"><ClockIcon /> Ongoing</div>;
    } else if (booking.status === 'completed') {
      return <div className="status-completed"><CheckIcon /> Completed</div>;
    } else if (booking.status === 'cancelled') {
      return <div className="status-declined"><XIcon /> Cancelled</div>;
    } else {
      return <div className="status-unknown">Unknown Status</div>;
    }
  };

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>All Bookings</h1>
        <p>Manage your upcoming and past bookings</p>
      </div>
      
      {/* Filter Dropdown */}
      <div className="bookings-header-row">
        <div></div> {/* Empty div for spacing */}
        <div className="filter-dropdown-container">
          <div className="filter-dropdown">
            <button 
              className="filter-dropdown-button"
              onClick={() => setActiveFilter(prev => prev === 'dropdown-open' ? 'all' : 'dropdown-open')}
            >
              <span>
                {activeFilter === 'all' && `All (${bookings.length})`}
                {activeFilter === 'pending' && `Pending (${bookings.filter(b => b.status === 'pending').length})`}
                {activeFilter === 'confirmed' && `Confirmed (${bookings.filter(b => b.status === 'confirmed').length})`}
                {activeFilter === 'ongoing' && `Ongoing (${bookings.filter(b => b.status === 'ongoing').length})`}
                {activeFilter === 'cancelled' && `Cancelled (${bookings.filter(b => b.status === 'cancelled').length})`}
                {activeFilter === 'completed' && `Completed (${bookings.filter(b => b.status === 'completed').length})`}
                {activeFilter === 'urgent' && `Urgent (${bookings.filter(b => {
                  if (b.status !== 'pending') return false;
                  const startTime = new Date(b.service_start_datetime);
                  const timeUntilStart = startTime - new Date();
                  const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);
                  return hoursUntilStart <= 2 && hoursUntilStart > 0;
                }).length})`}
              </span>
              <svg className="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            {activeFilter === 'dropdown-open' && (
              <div className="filter-dropdown-menu">
                <button 
                  className="filter-dropdown-item"
                  onClick={() => setActiveFilter('all')}
                >
                  All ({bookings.length})
                </button>
                <button 
                  className="filter-dropdown-item"
                  onClick={() => setActiveFilter('pending')}
                >
                  Pending ({bookings.filter(b => b.status === 'pending').length})
                </button>
                <button 
                  className="filter-dropdown-item"
                  onClick={() => setActiveFilter('confirmed')}
                >
                  Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
                </button>
                <button 
                  className="filter-dropdown-item"
                  onClick={() => setActiveFilter('ongoing')}
                >
                  Ongoing ({bookings.filter(b => b.status === 'ongoing').length})
                </button>
                <button 
                  className="filter-dropdown-item"
                  onClick={() => setActiveFilter('cancelled')}
                >
                  Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
                </button>
                <button 
                  className="filter-dropdown-item"
                  onClick={() => setActiveFilter('completed')}
                >
                  Completed ({bookings.filter(b => b.status === 'completed').length})
                </button>
                <button 
                  className="filter-dropdown-item"
                  onClick={() => setActiveFilter('urgent')}
                >
                  Urgent ({bookings.filter(b => {
                    if (b.status !== 'pending') return false;
                    const startTime = new Date(b.service_start_datetime);
                    const timeUntilStart = startTime - new Date();
                    const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);
                    return hoursUntilStart <= 2 && hoursUntilStart > 0;
                  }).length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📋</div>
            <h3>No bookings found</h3>
            <p>
              {activeFilter === 'all' 
                ? "You don't have any bookings yet." 
                : `No ${activeFilter} bookings found.`
              }
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div 
              key={booking.id} 
              className="booking-card"
              data-booking-id={booking.id}
              style={{
                backgroundColor: highlightedBookingId === booking.id ? '#fef3c7' : '',
                border: highlightedBookingId === booking.id ? '2px solid #f59e0b' : '',
                borderRadius: highlightedBookingId === booking.id ? '8px' : '',
                transition: 'all 0.3s ease'
              }}
            >
            <div className="booking-header">
              <div className="customer-avatar">{booking.initials}</div>
              <div className="customer-info">
                <div className="customer-name">{booking.name}</div>
                <div className="service-info">
                   <span className="service-name">{booking.service} ({booking.serviceType})</span>
                  <span className="service-price">{booking.price}</span>
                </div>
              </div>
            </div>
            
            <div className="booking-details">
              <div className="detail-item">
                <CalendarIcon />
                {booking.date} at {booking.time}
              </div>
              <div className="detail-item">
                <LocationIcon />
                {booking.location}
              </div>
              {booking.status === 'pending' && (() => {
                const now = new Date();
                const startTime = new Date(booking.service_start_datetime);
                const timeDiff = startTime - now;
                const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                
                if (timeDiff < 0) {
                  return (
                    <div className="detail-item time-status urgent">
                      <ClockIcon />
                      <span className="time-status-text urgent">OVERDUE - Auto-cancelling soon</span>
                    </div>
                  );
                } else if (hours <= 2) {
                  return (
                    <div className="detail-item time-status urgent">
                      <ClockIcon />
                      <span className="time-status-text urgent">
                        URGENT: Starts in {hours > 0 ? `${hours}h ` : ''}{minutes}m
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div className="detail-item time-status">
                      <ClockIcon />
                      <span className="time-status-text">
                        Starts in {hours}h {minutes}m
                      </span>
                    </div>
                  );
                }
              })()}
              {booking.status === 'confirmed' && (
                <div className="detail-item time-status">
                  <ClockIcon />
                  <span className="time-status-text">
                    {(() => {
                      const now = new Date();
                      const startTime = new Date(booking.service_start_datetime);
                      const timeDiff = startTime - now;
                      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                      
                      if (timeDiff < 0) {
                        return 'Service should start now';
                      } else if (hours > 0) {
                        return `Starts in ${hours}h ${minutes}m`;
                      } else if (minutes > 0) {
                        return `Starts in ${minutes}m`;
                      } else {
                        return 'Starts soon';
                      }
                    })()}
                  </span>
                </div>
              )}
              {booking.status === 'ongoing' && (
                <div className="detail-item time-status">
                  <ClockIcon />
                  <span className="time-status-text">
                    {(() => {
                      const now = new Date();
                      const endTime = new Date(booking.service_end_datetime);
                      const timeDiff = endTime - now;
                      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                      
                      if (timeDiff < 0) {
                        return 'Service should end now';
                      } else if (hours > 0) {
                        return `Ends in ${hours}h ${minutes}m`;
                      } else if (minutes > 0) {
                        return `Ends in ${minutes}m`;
                      } else {
                        return 'Ends soon';
                      }
                    })()}
                  </span>
                </div>
              )}
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
              <button 
                className={`message-button ${!booking.petOwnerId ? 'disabled' : ''}`}
                onClick={() => handleMessage(booking.petOwnerId, booking.name)}
                disabled={!booking.petOwnerId}
                title={!booking.petOwnerId ? 'Pet owner information not available' : 'Send message to pet owner'}
              >
                <MessageIcon /> Message
              </button>
              {renderActionButtons(booking)}
            </div>
          </div>
        ))
        )}
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

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

export default ServiceProviderBookings;