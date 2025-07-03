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
  
  // Sample data
  const stats = [
    { title: "Total Bookings", value: "127", icon: "bookings.svg", color: "#059669" },
    { title: "Average Rating", value: "4.9", icon: "star.svg", color: "#2563eb" },
    { title: "This Month", value: "₱1,250", icon: "pesos.svg", color: "#d97706" },
    { title: "Active Clients", value: "23", icon: "user.svg", color: "#16a34a" }
  ];

  useEffect(() => {
  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setProviderId(user.id);
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
  function timeAgo(date) {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return then.toLocaleDateString();
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-container">
          <img className="logo-icon" src="Images/gps.png" alt="Logo" />
          <h1 className="logo-text">FurMaps</h1>
        </div>
        
        <nav className="nav-menu">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button className="nav-button" onClick={handleNotifClick} style={{ position: 'relative' }}>
              <img src="Icons/notification.svg" alt="Notifications" />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            {showNotifPanel && (
              <div style={{
                position: 'absolute',
                top: '48px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '370px',
                background: '#fff',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                borderRadius: '18px',
                zIndex: 9999,
                padding: '0',
                border: '1px solid #e5e7eb',
              }}>
                {/* Triangle pointer */}
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '12px solid transparent',
                  borderRight: '12px solid transparent',
                  borderBottom: '14px solid #fff',
                  zIndex: 9999,
                }} />
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
          <button className="nav-button" onClick={() => setShowMessages(true)}>
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
          <h2>Provider Dashboard</h2>
          <p>Manage your services and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ borderColor: stat.color }}>
              <div className="stat-details">
              <p className="stat-title">{stat.title}</p>
              <div className="stat-value-container">
               <h3 className="stat-value" style={{ color: stat.color }}>{stat.value}</h3>
               <img src={`Icons/${stat.icon}`} alt={stat.title} className="stat-icon" />
             </div>
             </div>
          </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Service Offered
          </button>
          <button 
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
          <button 
            className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            Gallery
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        {/* Dynamic Tab Content */}
  <div className="tab-content">
    {activeTab === 'services' && <ServiceOffered />}
    {activeTab === 'bookings' && <ServiceProviderBookings highlightedBookingId={highlightedBookingId} />}
    {activeTab === 'reviews' && <CustomerReview/>}
    {activeTab === 'gallery' && <ServiceGallery/>}
    {activeTab === 'analytics' && <p>Analytics content coming soon...</p>}
  </div>

      </main>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />} 
      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
      {showMessages && 
        <MessagesModal
       onClose={() => setShowMessages(false)}
      
        />}
    </div>
  );
};

export default ProviderDashboard;