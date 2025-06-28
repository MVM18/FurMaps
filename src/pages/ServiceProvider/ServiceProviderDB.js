import styles from './ServiceProviderDB.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const reviewsData = [
  {
    initials: 'AS',
    name: 'Alice Smith',
    date: '2024-01-10',
    review: 'Sarah was amazing with Max. Very professional and caring.',
    rating: 5,
  },
  {
    initials: 'BJ',
    name: 'Bob Johnson',
    date: '2024-01-10',
    review: 'Excellent service, highly recommended!',
    rating: 5,
  },
];

const bookingsData = [
  {
    initials: 'AS',
    name: 'Alice Smith',
    service: 'Dog Walking',
    pet: 'Golden Retriever - Max',
    date: '2024-01-15',
    time: '10:00 AM',
    status: 'Confirmed',
    statusColor: '#22c55e',
    statusBg: '#dcfce7',
    icon: '✔️',
  },
  {
    initials: 'BJ',
    name: 'Bob Johnson',
    service: 'Pet Grooming',
    pet: 'Persian Cat - Luna',
    date: '2024-01-16',
    time: '2:00 PM',
    status: 'Pending',
    statusColor: '#eab308',
    statusBg: '#fef9c3',
    icon: '⏳',
  },
  {
    initials: 'CD',
    name: 'Carol Davis',
    service: 'Pet Sitting',
    pet: 'Labrador - Buddy',
    date: '2024-01-18',
    time: '9:00 AM',
    status: 'Completed',
    statusColor: '#38bdf8',
    statusBg: '#e0f2fe',
    icon: '🟦',
  },
];

const ServiceProviderDB = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState('bookings');
	const [fade, setFade] = useState(true);

	const handleLogout = () => {
		localStorage.clear();
		navigate('/');
	};

	const handleMessages = () => {
		alert('Messages feature coming soon!');
	};

	const handleProfile = () => {
		alert('Profile feature coming soon!');
	};

	const handleTabChange = (tab) => {
		if (tab !== activeTab) {
			setFade(false);
			setTimeout(() => {
				setActiveTab(tab);
				setFade(true);
			}, 200);
		}
	};

	// Tab button style helper
	const tabBtn = (tab, label) => (
		<button
			onClick={() => handleTabChange(tab)}
			style={{
				background: activeTab === tab ? '#2563eb' : 'transparent',
				color: activeTab === tab ? '#fff' : '#222',
				border: 'none',
				borderRadius: 6,
				padding: '8px 22px',
				fontWeight: 600,
				fontSize: 15,
				marginRight: 8,
				cursor: 'pointer',
				boxShadow: activeTab === tab ? '0 1px 4px rgba(37,99,235,0.08)' : 'none',
				transition: 'all 0.18s',
			}}
		>
			{label}
		</button>
	);

	// Tab content renderers
	const renderTabContent = () => {
		if (activeTab === 'reviews') {
			return (
				<div className={`tab-content${fade ? ' fade-in' : ' fade-out'}`} style={{transition: 'opacity 0.2s'}}>
					<div style={{background: '#f8fafc', borderRadius: 12, padding: 24, marginTop: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.03)'}}>
						<div style={{fontWeight: 700, fontSize: 20, marginBottom: 2}}>Customer Reviews</div>
						<div style={{color: '#64748b', fontSize: 14, marginBottom: 18}}>See what your customers are saying</div>
						{reviewsData.map((r, i) => (
							<div key={i} style={{display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, padding: 18, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.02)'}}>
								<div style={{width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, marginRight: 18, color: '#222'}}>{r.initials}</div>
								<div style={{flex: 1}}>
									<div style={{fontWeight: 600, fontSize: 16, color: '#222'}}>{r.name}</div>
									<div style={{fontSize: 13, color: '#64748b', marginBottom: 4}}>{r.date}</div>
									<div style={{fontSize: 15, color: '#222'}}>{r.review}</div>
								</div>
								<div style={{marginLeft: 18, minWidth: 90, textAlign: 'right'}}>
									{Array.from({length: r.rating}).map((_, idx) => (
										<span key={idx} style={{color: '#fbbf24', fontSize: 22, marginLeft: 1}}>★</span>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			);
		}
		if (activeTab === 'gallery') {
			return (
				<div className={`tab-content${fade ? ' fade-in' : ' fade-out'}`} style={{transition: 'opacity 0.2s', padding: 32, textAlign: 'center'}}>
					<h2>Gallery</h2>
					<p>Showcase your best pet care moments here soon!</p>
				</div>
			);
		}
		if (activeTab === 'analytics') {
			return (
				<div className={`tab-content${fade ? ' fade-in' : ' fade-out'}`} style={{transition: 'opacity 0.2s', padding: 32, textAlign: 'center'}}>
					<h2>Analytics</h2>
					<p>Track your performance and growth here soon!</p>
				</div>
			);
		}
		// Default: Bookings
		return (
			<div className={`tab-content${fade ? ' fade-in' : ' fade-out'}`} style={{transition: 'opacity 0.2s'}}>
				<div style={{background: '#f8fafc', borderRadius: 12, padding: 24, marginTop: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.03)'}}>
					<div style={{fontWeight: 700, fontSize: 20, marginBottom: 2}}>All Bookings</div>
					<div style={{color: '#64748b', fontSize: 14, marginBottom: 18}}>Manage your upcoming and past bookings</div>
					{bookingsData.map((b, i) => (
						<div key={i} style={{display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, padding: 18, marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.02)'}}>
							<div style={{width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, marginRight: 18, color: '#222'}}>{b.initials}</div>
							<div style={{flex: 1}}>
								<div style={{fontWeight: 600, fontSize: 16, color: '#222'}}>{b.name}</div>
								<div style={{fontSize: 14, color: '#64748b'}}>{b.service}</div>
								<div style={{fontSize: 14, color: '#64748b'}}>{b.pet}</div>
							</div>
							<div style={{marginLeft: 18, minWidth: 120, textAlign: 'right'}}>
								<div style={{fontSize: 14, color: '#222', fontWeight: 500}}>{b.date}</div>
								<div style={{fontSize: 13, color: '#64748b'}}>{b.time}</div>
								<span style={{display: 'inline-block', marginTop: 6, padding: '2px 12px', borderRadius: 12, background: b.statusBg, color: b.statusColor, fontWeight: 600, fontSize: 13}}>
									{b.icon} {b.status}
								</span>
							</div>
							<div style={{marginLeft: 18, minWidth: 32, textAlign: 'center'}}>
								<span style={{fontSize: 20, color: '#64748b', cursor: 'pointer'}} title="Message">💬</span>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className={styles.wServiceProviderDashboard}>
			<div className={styles.header}>
				<div className={styles.container}>
					<div className={styles.container1}>
						<img className={styles.imageIcon} alt="Logo" src="/images/paw-logo.png" />
						<div className={styles.margin}>
							<b className={styles.furmaps}>FurMaps</b>
						</div>
					</div>
					<div className={styles.container2}>
						<div className={styles.linkmargin}>
							<div className={styles.linkButton} onClick={handleMessages} style={{cursor:'pointer'}}>
								<img className={styles.svgmarginIcon} alt="Messages" src="/images/arrow.png" />
								<div className={styles.messages}>Messages</div>
							</div>
						</div>
						<div className={styles.linkmargin1}>
							<div className={styles.linkButton} onClick={handleProfile} style={{cursor:'pointer'}}>
								<img className={styles.svgmarginIcon} alt="Profile" src="/images/arrow.png" />
								<div className={styles.messages}>Profile</div>
							</div>
						</div>
						<div className={styles.linkmargin2}>
							<div className={styles.linkButton} onClick={handleLogout} style={{cursor:'pointer'}}>
								<img className={styles.svgmarginIcon} alt="Logout" src="/images/arrow.png" />
								<div className={styles.messages}>Logout</div>
							</div>
						</div>
						<div className={styles.buttonMenu}>
							<img className={styles.svgIcon} alt="Menu" src="/images/arrow.png" />
							<div className={styles.background}>
								<div className={styles.div}>2</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Dashboard Stats */}
			<div style={{maxWidth: 1100, margin: '0 auto', marginTop: 24, marginBottom: 0}}>
				<div style={{display: 'flex', gap: 24, marginBottom: 24}}>
					<div style={{flex: 1, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: 16}}>
						<div style={{fontSize: 32, color: '#22c55e', fontWeight: 700}}>127</div>
						<div style={{marginLeft: 8}}>
							<div style={{fontWeight: 600, fontSize: 15, color: '#222'}}>Total Bookings</div>
							<div style={{fontSize: 18, color: '#a3a3a3', marginTop: 2}}><span role="img" aria-label="calendar">📅</span></div>
						</div>
					</div>
					<div style={{flex: 1, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: 16}}>
						<div style={{fontSize: 32, color: '#2563eb', fontWeight: 700}}>4.9</div>
						<div style={{marginLeft: 8}}>
							<div style={{fontWeight: 600, fontSize: 15, color: '#222'}}>Average Rating</div>
							<div style={{fontSize: 18, color: '#fbbf24', marginTop: 2}}><span role="img" aria-label="star">⭐</span></div>
						</div>
					</div>
					<div style={{flex: 1, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: 16}}>
						<div style={{fontSize: 32, color: '#eab308', fontWeight: 700}}>$1,250</div>
						<div style={{marginLeft: 8}}>
							<div style={{fontWeight: 600, fontSize: 15, color: '#222'}}>This Month</div>
							<div style={{fontSize: 18, color: '#eab308', marginTop: 2}}><span role="img" aria-label="dollar">💲</span></div>
						</div>
					</div>
					<div style={{flex: 1, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: 16}}>
						<div style={{fontSize: 32, color: '#22d3ee', fontWeight: 700}}>23</div>
						<div style={{marginLeft: 8}}>
							<div style={{fontWeight: 600, fontSize: 15, color: '#222'}}>Active Clients</div>
							<div style={{fontSize: 18, color: '#22d3ee', marginTop: 2}}><span role="img" aria-label="clients">👤</span></div>
						</div>
					</div>
				</div>
			</div>
			{/* Tabs */}
			<div style={{maxWidth: 1100, margin: '0 auto', marginTop: 0}}>
				<div style={{display: 'flex', gap: 0, background: '#f8fafc', borderRadius: 8, padding: 6, marginBottom: 8, border: '1px solid #e0e7ef'}}>
					{tabBtn('bookings', 'Bookings')}
					{tabBtn('reviews', 'Reviews')}
					{tabBtn('gallery', 'Gallery')}
					{tabBtn('analytics', 'Analytics')}
				</div>
				{/* Tab Content */}
				{renderTabContent()}
			</div>
		</div>
	);
};

export default ServiceProviderDB;
