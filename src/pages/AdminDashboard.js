import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-bg">
      {/* Header */}
      <div className="header" style={{ width: '100%', background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="header-content" style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 32px', height: 64 }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)',
              marginRight: 10
            }}>
              {/* Inline SVG heart icon */}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19s-7-4.35-7-9.5A4.5 4.5 0 0 1 11 5.5a4.5 4.5 0 0 1 7 4.01C18 14.65 11 19 11 19z" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="furmapsAdminLogoText" style={{
              fontWeight: 700,
              fontSize: '1.4rem',
              letterSpacing: 0.5,
              background: 'linear-gradient(90deg, #10b981 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1
            }}>
              FurMaps Admin
            </span>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 24, marginLeft: 'auto' }}>
            <button className="bell-btn" style={{ background: 'none', border: 'none', position: 'relative', cursor: 'pointer', marginRight: 8, display: 'flex', alignItems: 'center' }}>
              <img src="/Images/notification.svg" alt="Notifications" style={{ width: 20, height: 20, verticalAlign: 'middle' }} />
              <span className="bell-badge">2</span>
            </button>
            <button className="logout-btn" style={{ background: 'none', border: 'none', color: '#222', fontWeight: 400, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <img src="/Images/log-out.svg" alt="Logout" style={{ width: 20, height: 20, marginRight: 6, verticalAlign: 'middle' }} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        {/* Title */}
        <div style={{ marginTop: 32, marginBottom: 8 }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: 4 }}>Admin Dashboard</div>
          <div style={{ color: '#6b7280', fontSize: '1.05rem' }}>Manage users and approve service providers</div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          {stats.map((stat) => (
            <div key={stat.label} className={`stat-card ${stat.color}`}>
              <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={stat.icon.startsWith('/') ? stat.icon : `/Images/${stat.icon.replace(/^.*[\\/]/, '')}`} alt="icon" style={{ width: 20, height: 20 }} />
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
                <span style={{ marginLeft: 6, fontWeight: 'bold' }}>({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Approvals Card */}
        {activeTab === 0 && (
          <div className="card">
            <div className="card-title">Pending Service Provider Approvals</div>
            <div className="card-desc">Review and approve new service provider applications</div>
            {providers.map((provider) => (
              <div className="provider-approval" key={provider.email}>
                <div className="provider-header">
                  <div className="avatar">{provider.initials}</div>
                  <div className="provider-info">
                    <div className="provider-name">{provider.name}</div>
                    <div className="provider-email">{provider.email}</div>
                    <div className="provider-meta">Services: {provider.services}</div>
                    <div className="provider-meta">Location: {provider.location}</div>
                    <div className="provider-meta">Submitted: {provider.submitted}</div>
                  </div>
                  <div className="status-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <img src="/Images/pending_review.svg" alt="Pending Review" style={{ width: 18, height: 18 }} />
                    Pending Review
                  </div>
                </div>
                <div style={{ fontWeight: 500, marginTop: 18 }}>Submitted Documents:</div>
                <div className="documents-row">
                  {provider.documents.map((doc) => (
                    <div className={`document-card ${doc.color}`} key={doc.filename}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src={doc.icon.startsWith('/') ? doc.icon : `/Images/${doc.icon.replace(/^.*[\\/]/, '')}`} alt="doc" style={{ width: 18, height: 18 }} />
                        <div className={`document-title${doc.color !== 'blue' ? ' ' + doc.color : ''}`}>{doc.type}</div>
                      </div>
                      <div className="document-filename">{doc.filename}</div>
                      <button className={`document-btn${doc.color !== 'blue' ? ' ' + doc.color : ''}`}>View</button>
                    </div>
                  ))}
                </div>
                <div className="action-row">
                  <button className="approve-btn">Approve</button>
                  <button className="reject-btn">Reject</button>
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
                <button className="user-filter-btn">
                  Filter by type
                  <img src="/Images/filter.svg" alt="dropdown" style={{ width: 16, height: 16, marginLeft: 8 }} />
                </button>
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
                    <button className="user-action-btn">
                      <img src="/Images/see.svg" alt="View" />
                    </button>
                    {user.status === 'Active' ? (
                      <button className="user-action-btn suspend">Suspend</button>
                    ) : (
                      <button className="user-action-btn activate">Activate</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="card" style={{ background: 'transparent', boxShadow: 'none', padding: 0, maxWidth: 'none' }}>
            <div style={{ padding: '32px 32px 0 32px', maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.3rem', marginBottom: 2 }}>Platform Analytics</div>
                  <div style={{ color: '#6b7280', fontSize: '1rem' }}>Monitor platform metrics and user activity</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button className="user-filter-btn">Last 30 days <img src="/Images/filter.svg" alt="dropdown" style={{ width: 16, height: 16, marginLeft: 8 }} /></button>
                  <button className="user-filter-btn" style={{ color: '#2563eb', borderColor: '#2563eb' }}>Export</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
                {analyticsStats.map(stat => (
                  <div key={stat.label} style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <img src={`/Images/${stat.icon.replace(/^.*[\\/]/, '')}`} alt="icon" style={{ width: 22, height: 22 }} />
                      <span style={{ color: '#6b7280', fontSize: '1rem' }}>{stat.label}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#111', marginBottom: 2 }}>{stat.value}</div>
                    <div style={{ color: '#16a34a', fontSize: '0.98rem', fontWeight: 500 }}>{stat.change} <span style={{ color: '#6b7280', fontWeight: 400 }}>{stat.desc}</span></div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
                {/* Platform Growth Card */}
                <div style={{ flex: 2, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, minWidth: 320, minHeight: 260, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.08rem' }}>Platform Growth</div>
                    <button style={{ background: '#f3f4f6', border: 'none', borderRadius: 12, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
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
                <div style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, minWidth: 200, minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.08rem', alignSelf: 'flex-start', marginBottom: 2 }}>Service Distribution</div>
                  <div style={{ color: '#6b7280', fontSize: '0.97rem', alignSelf: 'flex-start', marginBottom: 18 }}>Platform-wide service popularity</div>
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
              <div style={{ display: 'flex', gap: 18 }}>
                <div style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, minWidth: 320 }}>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 2 }}>Top Performing Providers</div>
                  <div style={{ color: '#6b7280', fontSize: '0.97rem', marginBottom: 18 }}>Highest rated and most active service providers</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {topProviders.map((prov, idx) => (
                      <div key={prov.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', padding: '14px 18px', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#06b6d4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>{idx + 1}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#111', fontSize: '1.05rem' }}>{prov.name}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.97rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                              {prov.bookings} bookings ·
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="#f59e42" style={{ marginBottom: -2 }}><path d="M10 15.27L16.18 18l-1.64-7.03L19 7.24l-7.19-.61L10 0 8.19 6.63 1 7.24l5.46 3.73L4.82 18z"/></svg>
                              {prov.rating}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600, color: '#10b981', fontSize: '1.08rem' }}>${prov.revenue.toLocaleString()}</div>
                          <div style={{ color: '#6b7280', fontSize: '0.93rem', fontWeight: 400 }}>revenue</div>
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
    </div>
  );
};

export default AdminDashboard;
