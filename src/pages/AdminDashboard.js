import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const providers = [
  {
    initials: 'JS',
    name: 'John Smith',
    email: 'john@example.com',
    services: 'Dog Walking, Pet Sitting',
    location: 'Downtown',
    submitted: '2024-01-10',
    documents: [
      { type: 'Professional Certificate', filename: 'certificate.pdf', color: 'blue', icon: 'public/images/locate.png' },
      { type: 'Valid ID', filename: 'id_copy.jpg', color: 'green', icon: 'SVG.svg' },
      { type: 'Proof of Address', filename: 'utility_bill.pdf', color: 'purple', icon: 'SVG.svg' },
    ],
  },
  {
    initials: 'MG',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    services: 'Pet Grooming',
    location: 'Westside',
    submitted: '2024-01-12',
    documents: [
      { type: 'Professional Certificate', filename: 'grooming_cert.pdf', color: 'blue', icon: 'SVG.svg' },
      { type: 'Valid ID', filename: 'drivers_license.jpg', color: 'green', icon: 'SVG.svg' },
      { type: 'Proof of Address', filename: 'lease_agreement.pdf', color: 'purple', icon: 'SVG.svg' },
    ],
  },
];

const stats = [
  { label: 'Total Users', value: '1,247', color: 'green', icon: 'total-users.svg' },
  { label: 'Active Providers', value: '89', color: 'blue', icon: 'active-providers.svg' },
  { label: 'Pending Approval', value: '2', color: 'yellow', icon: 'pending_approval.svg' },
  { label: 'Suspended', value: '3', color: 'red', icon: 'suspended_acc.svg' },
];

const tabs = [
  { label: 'Pending Approvals', count: 2 },
  { label: 'All Users' },
  { label: 'Analytics' },
];

const users = [
  {
    initials: 'AJ',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    joined: '2024-01-05',
    role: 'Pet Owner',
    bookings: 12,
    status: 'Active',
  },
  {
    initials: 'SD',
    name: 'Sarah Davis',
    email: 'sarah@example.com',
    joined: '2024-01-03',
    role: 'Service Provider',
    bookings: 45,
    status: 'Active',
  },
  {
    initials: 'MW',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    joined: '2024-01-01',
    role: 'Service Provider',
    bookings: 8,
    status: 'Suspended',
  },
];

const analyticsStats = [
  { label: 'Total Users', value: '1247', icon: 'total-users.svg', change: '+7.9%', desc: 'vs last period', color: 'green' },
  { label: 'Active Providers', value: '89', icon: 'active-providers.svg', change: '+6.4%', desc: 'vs last period', color: 'green' },
  { label: 'Total Bookings', value: '2341', icon: 'bookings.svg', change: '+8.8%', desc: 'vs last period', color: 'green' },
  { label: 'Platform Revenue', value: '$45670', icon: 'dollar.svg', change: '+10.9%', desc: 'vs last period', color: 'green' },
];

const topProviders = [
  { name: 'Sarah Johnson', bookings: 127, rating: 4.9, revenue: 3175 },
  { name: 'Mike Chen', bookings: 89, rating: 4.8, revenue: 2670 },
  { name: 'Emma Davis', bookings: 203, rating: 5.0, revenue: 12180 },
  { name: 'Tom Wilson', bookings: 76, rating: 4.7, revenue: 2280 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  
  // Additional state for button functionality
  const [showNotification, setShowNotification] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [viewedDocument, setViewedDocument] = useState(null);
  const [userFilterOpen, setUserFilterOpen] = useState(false);
  const [viewedUser, setViewedUser] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('Last 30 days');
  const [showExportMsg, setShowExportMsg] = useState(false);
  const [providersList, setProvidersList] = useState(providers);
  const [usersList, setUsersList] = useState(users);
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [showAnalyticsDropdown, setShowAnalyticsDropdown] = useState(false);

  // Handler functions
  const handleBellClick = () => {
    setShowNotification(!showNotification);
    console.log('Notifications clicked');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);


    alert('Successfully logged out!');
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleViewDocument = (provider, doc) => {
    setViewedDocument({ provider, doc });
    console.log(`Viewing document: ${doc.filename} for ${provider.name}`);
  };

  const handleCloseDocument = () => {
    setViewedDocument(null);
  };

  const handleApproveProvider = (email) => {
    setProvidersList(prev => prev.filter(p => p.email !== email));
    alert(`Provider ${email} has been approved!`);
  };

  const handleRejectProvider = (email) => {
    setProvidersList(prev => prev.filter(p => p.email !== email));
    alert(`Provider ${email} has been rejected!`);
  };

  const handleUserFilterClick = () => {
    setUserFilterOpen(!userFilterOpen);
  };

  const handleViewUser = (user) => {
    setViewedUser(user);
  };

  const handleCloseUser = () => setViewedUser(null);

  const handleSuspendUser = (email) => {
    setUsersList(prev => prev.map(user =>
      user.email === email ? { ...user, status: 'Suspended' } : user
    ));
    alert(`User ${email} has been suspended!`);
  };

  const handleActivateUser = (email) => {
    setUsersList(prev => prev.map(user =>
      user.email === email ? { ...user, status: 'Active' } : user
    ));
    alert(`User ${email} has been activated!`);
  };

  const handleAnalyticsPeriodChange = (period) => {
    setAnalyticsPeriod(period);
    console.log(`Analytics period changed to: ${period}`);
  };

  const handleExport = () => {
    setShowExportMsg(true);
    setTimeout(() => setShowExportMsg(false), 2000);
    console.log('Exporting analytics data...');
  };

  const filteredUsers = usersList.filter(
    (u) =>
      (userTypeFilter === 'All' || u.role === userTypeFilter) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
       u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="dashboard-bg">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">
              {/* Inline SVG heart icon */}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19s-7-4.35-7-9.5A4.5 4.5 0 0 1 11 5.5a4.5 4.5 0 0 1 7 4.01C18 14.65 11 19 11 19z" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="furmapsAdminLogoText">
              FurMaps Admin
            </span>
          </div>
          <div className="header-actions">
            <button className="bell-btn" onClick={handleBellClick}>
              <img src="/Images/notification.svg" alt="Notifications" />
              <span className="bell-badge">2</span>
            </button>
            <button className="logout-btn" onClick={handleLogoutClick}>
              <img src="/Images/log-out.svg" alt="Logout" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-main">
        {/* Title */}
        <div className="admin-dashboard-title-section">
          <div className="admin-dashboard-title">Admin Dashboard</div>
          <div className="admin-dashboard-desc">Manage users and approve service providers</div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.color}`}>
              <div className="stat-label">
                <img src={stat.icon.startsWith('/') ? stat.icon : `/Images/${stat.icon.replace(/^.*[\\/]/, '')}`} alt="icon" />
                {stat.label}
              </div>
              <div className="stat-value">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              className={`tab${activeTab === i ? ' active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="tab-count">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Approvals Card */}
        {activeTab === 0 && (
          <div className="card">
            <div className="card-title">Pending Service Provider Approvals</div>
            <div className="card-desc">Review and approve new service provider applications</div>
            {providersList.map((provider) => (
              <div className="provider-approval" key={provider.email}>
                <div className="provider-header">
                  <div className="provider-avatar">{provider.initials}</div>
                  <div className="provider-details">
                    <div className="provider-name">{provider.name}</div>
                    <div className="provider-email">{provider.email}</div>
                    <div className="provider-meta">Services: {provider.services}</div>
                    <div className="provider-meta">Location: {provider.location}</div>
                    <div className="provider-meta">Submitted: {provider.submitted}</div>
                  </div>
                </div>
                <div className="submitted-documents-title">Submitted Documents:</div>
                <div className="documents-row">
                  {provider.documents.map((doc) => (
                    <div className={`document-card ${doc.color}`} key={doc.filename}>
                      <div className="document-header">
                        <img src={doc.icon.startsWith('/') ? doc.icon : `/Images/${doc.icon.replace(/^.*[\\/]/, '')}`} alt="doc" />
                        <div className={`document-title${doc.color !== 'blue' ? ' ' + doc.color : ''}`}>{doc.type}</div>
                      </div>
                      <div className="document-filename">{doc.filename}</div>
                      <button className={`document-btn${doc.color !== 'blue' ? ' ' + doc.color : ''}`} onClick={() => handleViewDocument(provider, doc)}>View</button>
                    </div>
                  ))}
                </div>
                <div className="action-row">
                  <button className="approve-btn" onClick={() => handleApproveProvider(provider.email)}>Approve</button>
                  <button className="reject-btn" onClick={() => handleRejectProvider(provider.email)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 1 && (
          <div className="card">
            <div className="card-title">User Management</div>
            <div className="card-desc">Manage all platform users</div>
            <div className="user-management-bar">
              <div className="user-search-box">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="user-filter-box">
                <button className="user-filter-btn" onClick={handleUserFilterClick}>
                  {userTypeFilter === 'All' ? 'Filter by type' : userTypeFilter}
                  <img src="/Images/filter.svg" alt="dropdown" />
                </button>
                {userFilterOpen && (
                  <div className="user-filter-dropdown">
                    <div
                      className={`user-filter-dropdown-item ${userTypeFilter === 'All' ? 'active' : ''}`}
                      onClick={() => { setUserTypeFilter('All'); setUserFilterOpen(false); }}
                    >All</div>
                    <div
                      className={`user-filter-dropdown-item ${userTypeFilter === 'Pet Owner' ? 'active' : ''}`}
                      onClick={() => { setUserTypeFilter('Pet Owner'); setUserFilterOpen(false); }}
                    >Pet Owner</div>
                    <div
                      className={`user-filter-dropdown-item ${userTypeFilter === 'Service Provider' ? 'active' : ''}`}
                      onClick={() => { setUserTypeFilter('Service Provider'); setUserFilterOpen(false); }}
                    >Service Provider</div>
                  </div>
                )}
              </div>
            </div>
            <div className="user-list">
              {filteredUsers.map(user => (
                <div className="user-row" key={user.email}>
                  <div className="user-avatar">{user.initials}</div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-joined">Joined: {user.joined}</div>
                  </div>
                  <div className="user-role">
                    {user.role}
                    <div className="user-bookings">{user.bookings} bookings</div>
                  </div>
                  <div className="user-status-actions">
                    <span className={`user-status-badge ${user.status === 'Active' ? 'active' : 'suspended'}`}>{user.status}</span>
                    <button className="user-action-btn" onClick={() => handleViewUser(user)}>
                      <img src="/Images/see.svg" alt="View" />
                    </button>
                    {user.status === 'Active' ? (
                      <button className="user-action-btn suspend" onClick={() => handleSuspendUser(user.email)}>Suspend</button>
                    ) : (
                      <button className="user-action-btn activate" onClick={() => handleActivateUser(user.email)}>Activate</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="card analytics-card-transparent">
            <div className="analytics-container">
              <div className="analytics-header">
                <div>
                  <div className="analytics-title">Platform Analytics</div>
                  <div className="analytics-subtitle">Monitor platform metrics and user activity</div>
                </div>
                <div className="analytics-controls">
                  <div className="analytics-period-dropdown">
                    <button className="user-filter-btn analytics-period-btn" onClick={() => setShowAnalyticsDropdown(open => !open)}>
                      {analyticsPeriod} <img src="/Images/filter.svg" alt="dropdown" />
                    </button>
                    {showAnalyticsDropdown && (
                      <div className="analytics-dropdown">
                        {['Last 7 days', 'Last 30 days', 'Last 90 days'].map(period => (
                          <div
                            key={period}
                            className={`analytics-dropdown-item ${analyticsPeriod === period ? 'active' : ''}`}
                            onClick={() => { handleAnalyticsPeriodChange(period); setShowAnalyticsDropdown(false); }}
                          >{period}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={handleExport} className="user-filter-btn export-btn">Export</button>
                </div>
              </div>
              <div className="analytics-stats-grid">
                {analyticsStats.map(stat => (
                  <div key={stat.label} className="analytics-stat-card">
                    <div className="analytics-stat-header">
                      <img src={`/Images/${stat.icon.replace(/^.*[\\/]/, '')}`} alt="icon" className="analytics-stat-icon" />
                      <span className="analytics-stat-label">{stat.label}</span>
                    </div>
                    <div className="analytics-stat-value">{stat.value}</div>
                    <div className="analytics-stat-change">{stat.change} <span className="analytics-stat-desc">{stat.desc}</span></div>
                  </div>
                ))}
              </div>
              <div className="analytics-charts-grid">
                {/* Platform Growth Card */}
                <div className="platform-growth-card">
                  <div className="platform-growth-header">
                    <div className="platform-growth-title">Platform Growth</div>
                    <button className="chart-toggle-btn">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="#2563eb"><rect x="3" y="12" width="3" height="5"/><rect x="8.5" y="8" width="3" height="9"/><rect x="14" y="4" width="3" height="13"/></svg>
                    </button>
                  </div>
                  {/* Bar Chart with paired bars and visible axes */}
                  <svg width="100%" height="180" viewBox="0 0 380 180">
                    {/* Grid lines */}
                    <g stroke="#e5e7eb" strokeWidth="1">
                      <line x1="50" y1="30" x2="350" y2="30" />
                      <line x1="50" y1="60" x2="350" y2="60" />
                      <line x1="50" y1="90" x2="350" y2="90" />
                      <line x1="50" y1="120" x2="350" y2="120" />
                      <line x1="50" y1="150" x2="350" y2="150" />
                    </g>
                    {/* Y axis labels */}
                    <text x="38" y="35" fontSize="11" fill="#6b7280">80</text>
                    <text x="38" y="65" fontSize="11" fill="#6b7280">60</text>
                    <text x="38" y="95" fontSize="11" fill="#6b7280">40</text>
                    <text x="38" y="125" fontSize="11" fill="#6b7280">20</text>
                    <text x="38" y="155" fontSize="11" fill="#6b7280">0</text>
                    {/* Bars: for each month, two bars side by side */}
                    <g>
                      {/* Jan */}
                      <rect x="65" y="100" width="14" height="50" fill="#2563eb" rx="3" />
                      <rect x="81" y="80" width="14" height="70" fill="#10b981" rx="3" />
                      {/* Feb */}
                      <rect x="115" y="70" width="14" height="80" fill="#2563eb" rx="3" />
                      <rect x="131" y="50" width="14" height="100" fill="#10b981" rx="3" />
                      {/* Mar */}
                      <rect x="165" y="80" width="14" height="70" fill="#2563eb" rx="3" />
                      <rect x="181" y="60" width="14" height="90" fill="#10b981" rx="3" />
                      {/* Apr */}
                      <rect x="215" y="90" width="14" height="60" fill="#2563eb" rx="3" />
                      <rect x="231" y="70" width="14" height="80" fill="#10b981" rx="3" />
                      {/* May */}
                      <rect x="265" y="110" width="14" height="40" fill="#2563eb" rx="3" />
                      <rect x="281" y="90" width="14" height="60" fill="#10b981" rx="3" />
                      {/* Jun */}
                      <rect x="315" y="130" width="14" height="20" fill="#2563eb" rx="3" />
                      <rect x="331" y="110" width="14" height="40" fill="#10b981" rx="3" />
                    </g>
                    {/* X axis labels */}
                    <text x="73" y="170" fontSize="12" fill="#6b7280">Jan</text>
                    <text x="123" y="170" fontSize="12" fill="#6b7280">Feb</text>
                    <text x="173" y="170" fontSize="12" fill="#6b7280">Mar</text>
                    <text x="223" y="170" fontSize="12" fill="#6b7280">Apr</text>
                    <text x="273" y="170" fontSize="12" fill="#6b7280">May</text>
                    <text x="323" y="170" fontSize="12" fill="#6b7280">Jun</text>
                  </svg>
                </div>
                {/* Service Distribution Card */}
                <div className="service-distribution-card">
                  <div className="service-distribution-title">Service Distribution</div>
                  <div className="service-distribution-subtitle">Platform-wide service popularity</div>
                  {/* Pie Chart */}
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle r="60" cx="70" cy="70" fill="#f3f4f6" />
                    <path d="M70 70 L70 10 A60 60 0 0 1 130 70 Z" fill="#2563eb" />
                    <path d="M70 70 L130 70 A60 60 0 0 1 70 130 Z" fill="#10b981" />
                    <path d="M70 70 L70 130 A60 60 0 0 1 10 70 Z" fill="#f59e42" />
                    <path d="M70 70 L10 70 A60 60 0 0 1 70 10 Z" fill="#ef4444" />
                  </svg>
                </div>
              </div>
              <div className="analytics-charts-grid">
                <div className="top-providers-card">
                  <div className="top-providers-title">Top Performing Providers</div>
                  <div className="top-providers-subtitle">Highest rated and most active service providers</div>
                  <div className="top-providers-list">
                    {topProviders.map((prov, idx) => (
                      <div key={prov.name} className="provider-item">
                        <div className="provider-info-section">
                          <div className="provider-rank">{idx + 1}</div>
                          <div className="provider-details">
                            <div className="provider-name">{prov.name}</div>
                            <div className="provider-stats">
                              {prov.bookings} bookings ·
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="#f59e42"><path d="M10 15.27L16.18 18l-1.64-7.03L19 7.24l-7.19-.61L10 0 8.19 6.63 1 7.24l5.46 3.73L4.82 18z"/></svg>
                              {prov.rating}
                            </div>
                          </div>
                        </div>
                        <div className="provider-revenue-section">
                          <div className="provider-revenue">${prov.revenue.toLocaleString()}</div>
                          <div className="provider-revenue-label">revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {viewedDocument && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">
              {viewedDocument.doc.type}
            </div>
            <div className="modal-field">
              <strong>Filename:</strong> {viewedDocument.doc.filename}
            </div>
            <div className="modal-field">
              <strong>Provider:</strong> {viewedDocument.provider.name}
            </div>
            <button onClick={handleCloseDocument} className="modal-close-btn">Close</button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal-content">
            <div className="logout-modal-title">Confirm Logout</div>
            <div className="logout-modal-message">Are you sure you want to logout?</div>
            <div className="logout-modal-actions">
              <button onClick={handleLogoutCancel} className="logout-modal-cancel-btn">Cancel</button>
              <button onClick={handleLogoutConfirm} className="logout-modal-confirm-btn">Logout</button>
            </div>
          </div>
        </div>
      )}

      {viewedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">
              User Details
            </div>
            <div className="modal-field">
              <strong>Name:</strong> {viewedUser.name}
            </div>
            <div className="modal-field">
              <strong>Email:</strong> {viewedUser.email}
            </div>
            <div className="modal-field">
              <strong>Role:</strong> {viewedUser.role}
            </div>
            <div className="modal-field">
              <strong>Joined:</strong> {viewedUser.joined}
            </div>
            <div className="modal-field">
              <strong>Bookings:</strong> {viewedUser.bookings}
            </div>
            <div className="modal-field">
              <strong>Status:</strong> {viewedUser.status}
            </div>
            <button onClick={handleCloseUser} className="modal-close-btn">Close</button>
          </div>
        </div>
      )}

      {showExportMsg && (
        <div className="export-message">
          Exported!
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
