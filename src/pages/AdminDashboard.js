import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { supabase } from '../lib/supabaseClient';

const providers = [];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  
  // Additional state for button functionality
  const [showNotification, setShowNotification] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [viewedDocument, setViewedDocument] = useState(null);
  const [userFilterOpen, setUserFilterOpen] = useState(false);
  const [viewedUser, setViewedUser] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('Last 30 days');
  const [showExportMsg, setShowExportMsg] = useState(false);
  const [providersList, setProvidersList] = useState(providers);
  const [usersList, setUsersList] = useState([]);
  const [userTypeFilter, setUserTypeFilter] = useState('All');
  const [showAnalyticsDropdown, setShowAnalyticsDropdown] = useState(false);
  const [providerFilterOpen, setProviderFilterOpen] = useState(false);
  const [providerStatusFilter, setProviderStatusFilter] = useState('Pending');
  const [providerSort, setProviderSort] = useState('A-Z');
  const [providerSortOpen, setProviderSortOpen] = useState(false);
  const [userSort, setUserSort] = useState('A-Z');
  const [userSortOpen, setUserSortOpen] = useState(false);
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '0', color: 'green', icon: 'total-users.svg' },
    { label: 'Active Providers', value: '0', color: 'blue', icon: 'active-providers.svg' },
    { label: 'Pending Approval', value: '0', color: 'yellow', icon: 'pending_approval.svg' },
    { label: 'Suspended', value: '0', color: 'red', icon: 'suspended_acc.svg' },
  ]);

  // Fetch profiles from Supabase on mount
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }
    // Map data to expected format
    const mappedUsers = data.map(profile => ({
      user_id: profile.user_id,
      name: `${profile.first_name} ${profile.last_name}`,
      email: profile.email, // or profile.user_id if you use email as user_id
      role: profile.role,
      status: profile.status || 'Active',
      joined: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '',
      bookings: 0,
      initials: `${profile.first_name[0] || ''}${profile.last_name[0] || ''}`.toUpperCase(),
      services: profile.services_offered || '',
      location: profile.address || '',
      submitted: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '',
      documents: [
        ...(profile.certificate ? [{ type: 'Certificate', filename: profile.certificate, color: 'blue', icon: 'certificate.svg' }] : []),
        ...(profile.valid_id ? [{ type: 'Valid ID', filename: profile.valid_id, color: 'green', icon: 'id-card.svg' }] : []),
        ...(profile.proof_of_address ? [{ type: 'Proof of Address', filename: profile.proof_of_address, color: 'yellow', icon: 'address.svg' }] : []),
      ],
    }));

    setUsersList(mappedUsers.filter(profile => profile.role === 'owner' || profile.role === 'provider'));
    setProvidersList(mappedUsers.filter(profile => profile.role === 'provider'));
    recalculateStats(mappedUsers);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  function recalculateStats(users) {
    const totalUsers = users.length;
    const activeProviders = users.filter(u => u.role === 'provider' && u.status === 'Active').length;
    const pendingApproval = users.filter(u => u.role === 'provider' && u.status === 'Pending').length;
    const suspended = users.filter(u => u.status === 'Suspended').length;

    setStats([
      { label: 'Total Users', value: totalUsers, color: 'green', icon: 'total-users.svg' },
      { label: 'Active Providers', value: activeProviders, color: 'blue', icon: 'active-providers.svg' },
      { label: 'Pending Approval', value: pendingApproval, color: 'yellow', icon: 'pending_approval.svg' },
      { label: 'Suspended', value: suspended, color: 'red', icon: 'suspended_acc.svg' },
    ]);
  }

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

  const handleApproveProvider = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'Approved' })
      .eq('user_id', userId);

    if (error) {
      alert('Failed to approve provider: ' + error.message);
      console.error(error);
    } else {
      fetchProfiles();
      alert(`Provider ${userId} has been approved!`);
    }
  };

  const handleRejectProvider = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'Rejected' })
      .eq('user_id', userId);

    if (error) {
      alert('Failed to reject provider: ' + error.message);
      console.error(error);
    } else {
      fetchProfiles();
      alert(`Provider ${userId} has been rejected!`);
    }
  };

  const handleUserFilterClick = () => {
    setUserFilterOpen(!userFilterOpen);
  };

  const handleViewUser = (user) => {
    setViewedUser(user);
  };

  const handleCloseUser = () => setViewedUser(null);

  const handleSuspendUser = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'Suspended' })
      .eq('user_id', userId);

    if (error) {
      alert('Failed to suspend user: ' + error.message);
      console.error(error);
    } else {
      await fetchProfiles(); // Await here!
      alert(`User ${userId} has been suspended!`);
    }
  };

  const handleActivateUser = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'Active' })
      .eq('user_id', userId);

    if (error) {
      alert('Failed to activate user: ' + error.message);
      console.error(error);
    } else {
      await fetchProfiles(); // Await here!
      alert(`User ${userId} has been activated!`);
    }
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

  const filteredUsers = sortList(
    usersList.filter(
      (u) =>
        (userTypeFilter === 'All' || u.role === userTypeFilter) &&
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    userSort
  );

  const filteredProviders = sortList(
    providersList.filter(provider => {
      const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           provider.email.toLowerCase().includes(searchTerm.toLowerCase());
      if (providerStatusFilter === 'All' || providerStatusFilter === 'Pending') {
        return provider.status === 'Pending' && matchesSearch;
      } else {
        return provider.status === providerStatusFilter && matchesSearch;
      }
    }),
    providerSort
  );

  console.log('usersList:', usersList);
  console.log('providersList:', providersList);
  console.log('filteredUsers:', filteredUsers);
  console.log('filteredProviders:', filteredProviders);

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
            </button>
          ))}
        </div>

        {/* Pending Approvals Card */}
        {activeTab === 0 && (
          <div className="card">
            <div className="card-title">Service Provider Approvals</div>
            <div className="card-desc">Review and approve new service provider applications</div>
            <div className="search-filter-bar">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-bar-input"
              />
              <div className="user-filter-box">
                <button className="user-filter-btn" onClick={() => setProviderFilterOpen(open => !open)}>
                  {providerStatusFilter === 'All' ? 'Filter by type' : providerStatusFilter}
                  <img src="/Images/filter.svg" alt="dropdown" />
                </button>
                {providerFilterOpen && (
                  <div className="user-filter-dropdown">
                    <div className={`user-filter-dropdown-item ${providerStatusFilter === 'All' ? 'active' : ''}`}
                      onClick={() => { setProviderStatusFilter('All'); setProviderFilterOpen(false); }}>All</div>
                    <div className={`user-filter-dropdown-item ${providerStatusFilter === 'Pending' ? 'active' : ''}`}
                      onClick={() => { setProviderStatusFilter('Pending'); setProviderFilterOpen(false); }}>Pending</div>
                    <div className={`user-filter-dropdown-item ${providerStatusFilter === 'Approved' ? 'active' : ''}`}
                      onClick={() => { setProviderStatusFilter('Approved'); setProviderFilterOpen(false); }}>Approved</div>
                    <div className={`user-filter-dropdown-item ${providerStatusFilter === 'Rejected' ? 'active' : ''}`}
                      onClick={() => { setProviderStatusFilter('Rejected'); setProviderFilterOpen(false); }}>Rejected</div>
                  </div>
                )}
              </div>
              <div className="user-filter-box">
                <button className="user-filter-btn" onClick={() => setProviderSortOpen(open => !open)}>
                  {providerSort === 'A-Z' ? 'Sort: Name (A-Z)' :
                    providerSort === 'Z-A' ? 'Sort: Name (Z-A)' :
                    providerSort === 'Oldest' ? 'Sort: Oldest Joined' :
                    'Sort: Latest Joined'}
                  <img src="/Images/filter.svg" alt="dropdown" />
                </button>
                {providerSortOpen && (
                  <div className="user-filter-dropdown">
                    <div className={`user-filter-dropdown-item ${providerSort === 'A-Z' ? 'active' : ''}`}
                      onClick={() => { setProviderSort('A-Z'); setProviderSortOpen(false); }}>Name (A-Z)</div>
                    <div className={`user-filter-dropdown-item ${providerSort === 'Z-A' ? 'active' : ''}`}
                      onClick={() => { setProviderSort('Z-A'); setProviderSortOpen(false); }}>Name (Z-A)</div>
                    <div className={`user-filter-dropdown-item ${providerSort === 'Oldest' ? 'active' : ''}`}
                      onClick={() => { setProviderSort('Oldest'); setProviderSortOpen(false); }}>Oldest Joined</div>
                    <div className={`user-filter-dropdown-item ${providerSort === 'Latest' ? 'active' : ''}`}
                      onClick={() => { setProviderSort('Latest'); setProviderSortOpen(false); }}>Latest Joined</div>
                  </div>
                )}
              </div>
            </div>
            {filteredProviders.map((provider) => {
              const missingDocs = getMissingDocuments(provider);
              const allDocsUploaded = missingDocs.length === 0;
              return (
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
                  {/* Document completeness badge */}
                  <div className="provider-doc-status">
                    {allDocsUploaded ? (
                      <span className="doc-status-badge complete">All required documents uploaded</span>
                    ) : (
                      <span className="doc-status-badge incomplete">
                        Missing: {missingDocs.join(', ')}
                      </span>
                    )}
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
                    <button className="approve-btn" onClick={() => handleApproveProvider(provider.user_id)} disabled={!allDocsUploaded}>Approve</button>
                    <button className="reject-btn" onClick={() => handleRejectProvider(provider.user_id)}>Reject</button>
                  </div>
                </div>
              );
            })}
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
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="user-filter-box">
                <button className="user-filter-btn" onClick={handleUserFilterClick}>
                  {userTypeFilter === 'All' ? 'Filter by type' : userTypeFilter}
                  <img src="/Images/filter.svg" alt="dropdown" />
                </button>
                {userFilterOpen && (
                  <div className="user-filter-dropdown">
                    <div className={`user-filter-dropdown-item ${userTypeFilter === 'All' ? 'active' : ''}`}
                      onClick={() => { setUserTypeFilter('All'); setUserFilterOpen(false); }}>All</div>
                    <div className={`user-filter-dropdown-item ${userTypeFilter === 'owner' ? 'active' : ''}`}
                      onClick={() => { setUserTypeFilter('owner'); setUserFilterOpen(false); }}>Pet Owner</div>
                    <div className={`user-filter-dropdown-item ${userTypeFilter === 'provider' ? 'active' : ''}`}
                      onClick={() => { setUserTypeFilter('provider'); setUserFilterOpen(false); }}>Service Provider</div>
                  </div>
                )}
              </div>
              <div className="user-filter-box">
                <button className="user-filter-btn" onClick={() => setUserSortOpen(open => !open)}>
                  {userSort === 'A-Z' ? 'Sort: Name (A-Z)' :
                    userSort === 'Z-A' ? 'Sort: Name (Z-A)' :
                    userSort === 'Oldest' ? 'Sort: Oldest Joined' :
                    'Sort: Latest Joined'}
                  <img src="/Images/filter.svg" alt="dropdown" />
                </button>
                {userSortOpen && (
                  <div className="user-filter-dropdown">
                    <div className={`user-filter-dropdown-item ${userSort === 'A-Z' ? 'active' : ''}`}
                      onClick={() => { setUserSort('A-Z'); setUserSortOpen(false); }}>Name (A-Z)</div>
                    <div className={`user-filter-dropdown-item ${userSort === 'Z-A' ? 'active' : ''}`}
                      onClick={() => { setUserSort('Z-A'); setUserSortOpen(false); }}>Name (Z-A)</div>
                    <div className={`user-filter-dropdown-item ${userSort === 'Oldest' ? 'active' : ''}`}
                      onClick={() => { setUserSort('Oldest'); setUserSortOpen(false); }}>Oldest Joined</div>
                    <div className={`user-filter-dropdown-item ${userSort === 'Latest' ? 'active' : ''}`}
                      onClick={() => { setUserSort('Latest'); setUserSortOpen(false); }}>Latest Joined</div>
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
                    <span className={`user-status-badge ${user.status === 'Active' || user.status === 'Approved' ? 'active' : 'suspended'}`}>
                      {user.status}
                    </span>
                    <button className="user-action-btn" onClick={() => handleViewUser(user)}>
                      <img src="/Images/see.svg" alt="View" />
                    </button>
                    {user.status === 'Active' || user.status === 'Approved' ? (
                      <button className="user-action-btn suspend" onClick={() => handleSuspendUser(user.user_id)}>Suspend</button>
                    ) : (
                      <button className="user-action-btn activate" onClick={() => handleActivateUser(user.user_id)}>Activate</button>
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
                  {/* Bar Chart: Only render bars if analyticsStats has data */}
                  {analyticsStats.length > 0 ? (
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
                  ) : (
                    <div className="empty-chart-placeholder">No data available</div>
                  )}
                </div>
                {/* Service Distribution Card */}
                <div className="service-distribution-card">
                  <div className="service-distribution-title">Service Distribution</div>
                  <div className="service-distribution-subtitle">Platform-wide service popularity</div>
                  {/* Pie Chart: Only render pie if analyticsStats has data */}
                  {analyticsStats.length > 0 ? (
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle r="60" cx="70" cy="70" fill="#f3f4f6" />
                      <path d="M70 70 L70 10 A60 60 0 0 1 130 70 Z" fill="#2563eb" />
                      <path d="M70 70 L130 70 A60 60 0 0 1 70 130 Z" fill="#10b981" />
                      <path d="M70 70 L70 130 A60 60 0 0 1 10 70 Z" fill="#f59e42" />
                      <path d="M70 70 L10 70 A60 60 0 0 1 70 10 Z" fill="#ef4444" />
                    </svg>
                  ) : (
                    <div className="empty-chart-placeholder">No data available</div>
                  )}
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

const tabs = [
  { label: 'Service Provider Approvals' },
  { label: 'All Users' },
  { label: 'Analytics' },
];

// If you want to require certain documents for providers, list them here:
const requiredDocuments = ['Certificate', 'Valid ID', 'Proof of Address'];

// Helper to get missing documents for a provider
const getMissingDocuments = (provider) => {
  const uploadedTypes = provider.documents.map(doc => doc.type);
  return requiredDocuments.filter(req => !uploadedTypes.includes(req));
};

// Dummy analytics stats (replace with real data if you have it)
const analyticsStats = [
  { label: 'Bookings', value: 120, change: '+10%', desc: 'vs last month', icon: 'bookings.svg' },
  { label: 'Revenue', value: '$5,200', change: '+5%', desc: 'vs last month', icon: 'revenue.svg' },
];

// Dummy top providers (replace with real data if you have it)
const topProviders = [
  { name: 'Jane Doe', bookings: 32, rating: 4.9, revenue: 1200 },
  { name: 'John Smith', bookings: 28, rating: 4.8, revenue: 1100 },
];

function sortList(list, sortType) {
  const sorted = [...list];
  if (sortType === 'A-Z') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortType === 'Z-A') {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortType === 'Oldest') {
    sorted.sort((a, b) => new Date(a.joined) - new Date(b.joined));
  } else if (sortType === 'Latest') {
    sorted.sort((a, b) => new Date(b.joined) - new Date(a.joined));
  }
  return sorted;
}

export default AdminDashboard;
