import './SPdashboard.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceProviderBookings  from './SPbookings';
import CustomerReview  from './SPreviews';
import ProfileModal  from './SPprofile'; 
import ServiceOffered from './SPservices';
import { supabase } from '../../lib/supabaseClient';
import Toast from '../../components/Toast';
import ServiceGallery from './SPgallery';
import MessagesModal from './SPmessages';
import SPAnalytics from './SPanalytics';


const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('services');
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [highlightedBookingId, setHighlightedBookingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [providerId, setProviderId] = useState(null);
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [selectedReceiverName, setSelectedReceiverName] = useState('');
  const [stats, setStats] = useState([
    { title: "Total Bookings", value: "0", icon: "bookings.svg", color: "#059669" },
    { title: "Average Rating", value: "0.0", icon: "star.svg", color: "#2563eb" },
    { title: "This Month", value: "₱0", icon: "pesos.svg", color: "#d97706" },
    { title: "Active Clients", value: "0", icon: "user.svg", color: "#16a34a" }
  ]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  useEffect(() => {
  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setProviderId(user.id);
      fetchStats(user.id);
    }
  };
  getUserId();
}, []);

   const handleLogout = () => {
    // You might want to add logout logic here (clear tokens, etc.)
    navigate('/'); // Navigate to the home page
  };

  // Helper to get/set last seen notifs in localStorage
  function getLastSeenNotifs() {
    return JSON.parse(localStorage.getItem('providerLastSeenNotifs') || '[]');
  }
  function setLastSeenNotifs(ids) {
    localStorage.setItem('providerLastSeenNotifs', JSON.stringify(ids));
  }

  // Fetch all pending bookings for notifications (persistent)
  useEffect(() => {
    let isMounted = true;
    const fetchBookings = async () => {
      const lastSeen = getLastSeenNotifs();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('bookings')
        .select('id, created_at, pet_name, status, services(name)')
        .eq('service_provider_id', user.id)
        .order('created_at', { ascending: false });
      if (error) return;
      // Only show notifications for pending bookings
      const pendingBookings = (data || []).filter(b => b.status === 'pending');
      if (isMounted) {
        setNotifList(pendingBookings.map(b => ({
          id: b.id,
          created_at: b.created_at,
          status: b.status,
          serviceName: b.services?.name || 'A service',
          petName: b.pet_name,
        })));
        // Update unread count based on localStorage
        const newNotifs = pendingBookings.filter(b => !lastSeen.includes(b.id));
        setUnreadCount(newNotifs.length);
      }
    };
    fetchBookings();
    const intervalId = setInterval(fetchBookings, 10000); // 10 seconds
    return () => { isMounted = false; clearInterval(intervalId); };
  }, []);

  const handleNotifClick = () => {
    setShowNotifPanel(v => !v);
  };

  const handleNotificationItemClick = (bookingId) => {
    // Switch to bookings tab
    setActiveTab('bookings');
    // Close notification panel
    setShowNotifPanel(false);
    // Set the highlighted booking ID
    setHighlightedBookingId(bookingId);
    // Refresh stats after handling notification
    if (providerId) {
      fetchStats(providerId);
    }
    // Scroll to bookings section after a short delay to ensure tab content is rendered
    setTimeout(() => {
      const bookingsSection = document.querySelector('.bookings-container');
      if (bookingsSection) {
        bookingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Scroll to the specific booking item
      setTimeout(() => {
        const bookingElement = document.querySelector(`[data-booking-id="${bookingId}"]`);
        if (bookingElement) {
          bookingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a temporary highlight effect
          bookingElement.style.backgroundColor = '#fef3c7';
          bookingElement.style.border = '2px solid #f59e0b';
          bookingElement.style.borderRadius = '8px';
          bookingElement.style.transition = 'all 0.3s ease';
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            bookingElement.style.backgroundColor = '';
            bookingElement.style.border = '';
            bookingElement.style.borderRadius = '';
            setHighlightedBookingId(null);
          }, 3000);
        }
      }, 200);
    }, 100);
  };

  const handleMarkAsRead = () => {
    // Mark all current notifs as seen
    const ids = notifList.map(n => n.id);
    setLastSeenNotifs(ids);
    setNotifRead(true);
    setUnreadCount(0);
  };

  // Refresh stats when switching to bookings tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'bookings' && providerId) {
      fetchStats(providerId);
    }
  };

  function timeAgo(date) {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return then.toLocaleDateString();
  }

  const handleMessageClick = (receiverId, receiverName) => {
    setSelectedReceiverId(receiverId);
    setSelectedReceiverName(receiverName);
    setShowMessages(true);
  };

  const fetchStats = async (userId) => {
    try {
      setIsLoadingStats(true);
      
      // Fetch all bookings for this provider
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, status, total_price, created_at, pet_owner_id')
        .eq('service_provider_id', userId);

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return;
      }

      // Calculate statistics
      const totalBookings = bookings.length;
      
      // Calculate this month's revenue (from accepted, confirmed, and completed bookings)
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        const isThisMonth = bookingDate >= firstDayOfMonth;
        const isRevenueGenerating = ['accepted', 'confirmed', 'completed'].includes(booking.status);
        return isThisMonth && isRevenueGenerating;
      });
      
      const thisMonthRevenue = thisMonthBookings.reduce((sum, booking) => 
        sum + (parseFloat(booking.total_price) || 0), 0
      );

      // Calculate unique active clients (pet owners with accepted, confirmed, or completed bookings)
      const activeClientIds = new Set();
      bookings.forEach(booking => {
        if (['accepted', 'confirmed', 'completed'].includes(booking.status)) {
          activeClientIds.add(booking.pet_owner_id);
        }
      });
      const activeClients = activeClientIds.size;

      // Calculate average rating from provider_ratings view
      const { data: ratingData, error: ratingError } = await supabase
        .from('provider_ratings')
        .select('average_rating, total_reviews')
        .eq('service_provider_id', userId)
        .single();

      let averageRating = "0.0";
      if (!ratingError && ratingData) {
        averageRating = (ratingData.average_rating || 0).toFixed(1);
      }

      // Update stats with proper formatting
      setStats([
        { 
          title: "Total Bookings", 
          value: totalBookings.toString(), 
          icon: "bookings.svg", 
          color: "#059669" 
        },
        { 
          title: "Average Rating", 
          value: averageRating, 
          icon: "star.svg", 
          color: "#2563eb" 
        },
        { 
          title: "This Month", 
          value: thisMonthRevenue > 0 ? `₱${thisMonthRevenue.toFixed(2)}` : "₱0", 
          icon: "pesos.svg", 
          color: "#d97706" 
        },
        { 
          title: "Active Clients", 
          value: activeClients.toString(), 
          icon: "user.svg", 
          color: "#16a34a" 
        }
      ]);

    } catch (error) {
      console.error('Error fetching stats:', error);
      // Show error toast
      setToastMessage('Failed to load statistics. Please try again.');
      setShowToast(true);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-container">
          <img className="logo-Icon" src="Images/gps.png" alt="Logo" />
          <h1 className="logo-Text">FurMaps</h1>
        </div>
        
        <nav className="nav-menu">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button 
             className="nav-button notification-button" 
             onClick={handleNotifClick} 
             style={{ position: 'relative' }}
            >
              <img src="Icons/notification.svg" alt="Notifications" />
               {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            {showNotifPanel && (
              <div className="notif-panel">
                {/* Triangle pointer */}
                <div className="notif-panel-pointer" />
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.25rem 0.5rem 1.25rem'}}>
                  <h4 style={{margin: 0, fontWeight:700, fontSize:'1.15rem'}}>Notification</h4>
                  <button onClick={handleMarkAsRead} style={{background:'none', border:'none', color:'#2563eb', fontWeight:500, cursor:'pointer', fontSize:'0.98rem'}}>Mark as read</button>
                </div>
                <div style={{maxHeight:'340px', overflowY:'auto', padding:'0.5rem 0'}}>
                  {notifList.length === 0 ? (
                    <p style={{ color: '#888', fontSize: '0.95rem', textAlign:'center', margin:'2rem 0' }}>No notifications yet.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {notifList.map((n, idx) => (
                        <li key={n.id} 
                          onClick={() => handleNotificationItemClick(n.id)}
                          onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                          onMouseLeave={(e) => e.target.style.background = '#fff'}
                          style={{
                            display:'flex', alignItems:'center', gap:14, padding:'1rem 1.25rem', borderBottom: idx!==notifList.length-1?'1px solid #f3f4f6':'none', background:'#fff', transition:'background 0.2s', cursor:'pointer'
                          }}>
                          {/* Avatar/Icon */}
                          <div style={{width:44, height:44, borderRadius:'50%', background:'#e0f7ef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26}}>
                            🐾
                          </div>
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{fontWeight:600, fontSize:'1.05rem', color:'#222', marginBottom:2}}>New Booking</div>
                            <div style={{fontSize:'0.97rem', color:'#555', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{n.serviceName} {n.petName ? `for ${n.petName}` : ''}</div>
                          </div>
                          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4}}>
                            <span style={{fontSize:'0.92rem', color:'#888'}}>{timeAgo(n.created_at)}</span>
                            {!notifRead && idx === 0 && <span style={{width:9, height:9, background:'#2563eb', borderRadius:'50%', display:'inline-block', marginTop:2}}></span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>      
          <button className="nav-button" onClick={() => {
            setSelectedReceiverId(null);
            setSelectedReceiverName('');
            setShowMessages(true);
          }}>
            <img src="Icons/chat.svg" alt="Messages" />
            <span>Messages</span>
          </button>
          <button className="nav-button" onClick={() => setShowProfile(true)}>
            <img src="Icons/simpleUser.svg" alt="Profile" />
            <span>Profile</span>
          </button>
         <button className="nav-button" onClick={handleLogout}>
            <img src="Icons/logout.svg" alt="Logout" />
            <span>Logout</span>
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="dashboard-header-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2>Provider Dashboard</h2>
              <p>Manage your services and bookings</p>
            </div>
         
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ borderColor: stat.color }}>
              <div className="stat-details">
                <p className="stat-title">{stat.title}</p>
                <div className="stat-value-container">
                  {isLoadingStats ? (
                    <div className="stat-loading">
                      <div className="loading-spinner"></div>
                    </div>
                  ) : (
                    <h3 className="stat-value" style={{ color: stat.color }}>
                      {stat.title === "This Month" && stat.value === "₱0.00" ? "₱0" : stat.value}
                    </h3>
                  )}
                </div>
              </div>
              <img src={`Icons/${stat.icon}`} alt={stat.title} className="stat-icon" />
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => handleTabChange('services')}
          >
            Service Offered
          </button>
          <button 
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => handleTabChange('bookings')}
          >
            Bookings
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => handleTabChange('reviews')}
          >
            Reviews
          </button>
          <button 
            className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => handleTabChange('gallery')}
          >
            Gallery
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleTabChange('analytics')}
          >
            Analytics
          </button>
        </div>

        {/* Dynamic Tab Content */}
  <div className="tab-content">
    {activeTab === 'services' && <ServiceOffered />}
    {activeTab === 'bookings' && <ServiceProviderBookings highlightedBookingId={highlightedBookingId} onMessageClick={handleMessageClick} onShowToast={(message) => { setToastMessage(message); setShowToast(true); }} />}
    {activeTab === 'reviews' && <CustomerReview/>}
    {activeTab === 'gallery' && <ServiceGallery/>}
    {activeTab === 'analytics' && <SPAnalytics/>}
  </div>

      </main>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />} 
      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
      {showMessages && 
        <MessagesModal
          onClose={() => {
            setShowMessages(false);
            setSelectedReceiverId(null);
            setSelectedReceiverName('');
          }}
          receiverId={selectedReceiverId}
        />}
    </div>
  );
};

export default ProviderDashboard;