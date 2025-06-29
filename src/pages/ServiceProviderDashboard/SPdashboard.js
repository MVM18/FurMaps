import './SPdashboard.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceProviderBookings  from './SPbookings';
import CustomerReview  from './SPreviews';
import ProfileModal  from './SPprofile'; 
import ServiceOffered from './SPservices';


const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('services');
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  
  // Sample data
  const stats = [
    { title: "Total Bookings", value: "127", icon: "bookings.svg", color: "#059669" },
    { title: "Average Rating", value: "4.9", icon: "star.svg", color: "#2563eb" },
    { title: "This Month", value: "₱1,250", icon: "pesos.svg", color: "#d97706" },
    { title: "Active Clients", value: "23", icon: "user.svg", color: "#16a34a" }
  ];

   const handleLogout = () => {
    // You might want to add logout logic here (clear tokens, etc.)
    navigate('/'); // Navigate to the home page
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-container">
          <img className="logo-icon" src="Images/gps.png" alt="Logo" />
          <h1 className="logo-text">FurMaps</h1>
        </div>
        
        <nav className="nav-menu">
          <button className="nav-button">
            <img src="Icons/notification.svg" alt="Notifications" />
            <span className="badge">2</span>
          </button>
          <button className="nav-button">
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
              <div className="stat-info">
                <p className="stat-title">{stat.title}</p>
                <h3 className="stat-value" style={{ color: stat.color }}>{stat.value}</h3>
              </div>
              <img src={`Icons/${stat.icon}`} alt={stat.title} className="stat-icon" />
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
    {activeTab === 'bookings' && <ServiceProviderBookings />}
    {activeTab === 'reviews' && <CustomerReview/>}
    {activeTab === 'gallery' && <p>Gallery content coming soon...</p>}
    {activeTab === 'analytics' && <p>Analytics content coming soon...</p>}
  </div>

      </main>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />} 
    </div>
  );
};

export default ProviderDashboard;