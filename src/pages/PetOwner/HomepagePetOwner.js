import styles from './HomepagePetOwner.module.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ServiceCard from '../../components/ServiceCard';
import BookingModal from '../../components/BookingModal';
import ProviderProfile from './ProviderProfile';
import Toast from '../../components/Toast';
import MessagesModal from '../ServiceProviderDashboard/SPmessages';
import ServiceMap from '../../components/ServiceMap';
import ReviewModal from '../../components/ReviewModal';

// Place timeAgo function here so it's defined before use
function timeAgo(date) {
	const now = new Date();
	const then = new Date(date);
	const diff = Math.floor((now - then) / 1000);
	if (diff < 60) return `${diff}s ago`;
	if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
	return then.toLocaleDateString();
}


const WPetOwnerDB = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState('search');
	const [searchQuery, setSearchQuery] = useState('');
	const [locationQuery, setLocationQuery] = useState('');
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [isLocationFocused, setIsLocationFocused] = useState(false);
	
	// New state for services and booking
	const [services, setServices] = useState([]);
	const [filteredServices, setFilteredServices] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedService, setSelectedService] = useState(null);
	const [showBookingModal, setShowBookingModal] = useState(false);
	const [bookings, setBookings] = useState([]);
	const [selectedProviderId, setSelectedProviderId] = useState(null);
	const [showProviderProfileModal, setShowProviderProfileModal] = useState(false);
	const [toastMessage, setToastMessage] = useState('');
	const [showToast, setShowToast] = useState(false);
	const [showNotifPanel, setShowNotifPanel] = useState(false);
	const [notifList, setNotifList] = useState([]);
	const [notifRead, setNotifRead] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [highlightedBookingId, setHighlightedBookingId] = useState(null);
	const prevNewIdsRef = useRef([]);
	const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

	// Helper to get/set last seen notifs in localStorage
	function getLastSeenNotifs() {
		return JSON.parse(localStorage.getItem('petOwnerLastSeenNotifs') || '[]');
	}
	function setLastSeenNotifs(ids) {
		localStorage.setItem('petOwnerLastSeenNotifs', JSON.stringify(ids));
	}
	const [showMessagesModal, setShowMessagesModal] = useState(false);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
	const [reviews, setReviews] = useState([]);

	// Sample data for pet owner dashboard
	const stats = [
		{ title: "Total Bookings", value: bookings.length.toString(), icon: "bookings.svg", color: "#059669" },
		{ title: "Favorite Providers", value: "8", icon: "star.svg", color: "#2563eb" },
		{ title: "This Month", value: "₱2,450", icon: "pesos.svg", color: "#d97706" },
		{ title: "Active Services", value: bookings.filter(b => b.status === 'confirmed').length.toString(), icon: "user.svg", color: "#16a34a" }
	];

	// Fetch services from database
	useEffect(() => {
		fetchServices();
		fetchBookings();
		fetchReviews();
	}, []);

	// Filter services based on search query
	useEffect(() => {
		const filtered = services.filter(service => {
			const matchesSearch = searchQuery === '' || 
				service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				service.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(service.provider_name && service.provider_name.toLowerCase().includes(searchQuery.toLowerCase()));
			
			const matchesLocation = locationQuery === '' || 
				service.location.toLowerCase().includes(locationQuery.toLowerCase());
			
			return matchesSearch && matchesLocation;
		});
		setFilteredServices(filtered);
	}, [services, searchQuery, locationQuery]);

	// Polling for booking status changes every 10 seconds
	useEffect(() => {
		let intervalId;
		const fetchNotifications = async () => {
			const lastNotifIds = getLastSeenNotifs();
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			const { data, error } = await supabase
				.from('bookings')
				.select('id, created_at, status, services(name), pet_name')
				.eq('pet_owner_id', user.id)
				.order('created_at', { ascending: false });
			if (error) return;
			const notifs = (data || []).filter(b => b.status === 'accepted' || b.status === 'declined');
			setNotifList(notifs.map(b => ({
				id: b.id,
				created_at: b.created_at,
				status: b.status,
				serviceName: b.services?.name || 'A service',
				petName: b.pet_name,
			})));
			const newIds = notifs.map(b => b.id + b.status);
			const newNotifs = newIds.filter(id => !lastNotifIds.includes(id));
			setUnreadCount(newNotifs.length);
			// Only show toast if there are truly new notifications since the last poll
			const prevNewIds = prevNewIdsRef.current;
			const trulyNew = newNotifs.filter(id => !prevNewIds.includes(id));
			if (lastNotifIds.length > 0 && trulyNew.length > 0) {
				setShowToast(true);
				setToastMessage('A booking was updated!');
				setNotifRead(false);
			}
			prevNewIdsRef.current = newNotifs;
		};
		fetchNotifications();
		intervalId = setInterval(fetchNotifications, 10000);
		return () => clearInterval(intervalId);
	}, []);

	const fetchServices = async () => {
		setIsLoading(true);
		try {
			// 1. Fetch all active services only
			const { data: services, error: servicesError } = await supabase
				.from('services')
				.select('*')
				.eq('is_active', true)
				.order('created_at', { ascending: false });

			if (servicesError) {
				setServices([]);
				return;
			}

			// 2. Fetch all provider profiles
			const { data: providers, error: providersError } = await supabase
				.from('profiles')
				.select('id, user_id, first_name, last_name, role')
				.eq('role', 'provider');

			if (providersError) {
				setServices([]);
				return;
			}

			// 3. Join services with provider profiles
			const formattedServices = services
				.map(service => {
					const provider = providers.find(
						p => p.user_id === service.provider_id
					);
					if (!provider) return null; // Only show services with a valid provider
					return {
						id: service.id,
						name: service.name,
						location: service.location,
						latitude: service.latitude,        // ✅ add this
                        longitude: service.longitude,      // ✅ add this
						serviceType: service.service_type,
						contactNumber: service.contact_number,
						price: service.price,
						provider_id: service.provider_id,
						provider_user_id: provider.user_id,
						provider_name: `${provider.first_name} ${provider.last_name}`.trim(),
						provider_role: provider.role,
						createdAt: new Date(service.created_at).toLocaleDateString()
					};
				})
				.filter(Boolean); // Remove any nulls

			setServices(formattedServices);
		} catch (error) {
			setServices([]);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchBookings = async () => {
		try {
			const { data: { user }, error: userError } = await supabase.auth.getUser();
			if (userError || !user) return;

			const { data, error } = await supabase
				.from('bookings')
				.select(`
					*,
					services (
						name,
						service_type,
						price
					)
				`)
				.eq('pet_owner_id', user.id)
				.order('created_at', { ascending: false });

			if (error) {
				console.error('Error fetching bookings:', error);
				return;
			}

			setBookings(data || []);
		} catch (error) {
			console.error('Error fetching bookings:', error);
		}
	};

	const fetchReviews = async () => {
		try {
			const { data: { user }, error: userError } = await supabase.auth.getUser();
			if (userError || !user) return;

			const { data, error } = await supabase
				.from('reviews')
				.select(`
					*,
					bookings (
						services (
							name
						)
					)
				`)
				.eq('pet_owner_id', user.id)
				.order('created_at', { ascending: false });

			if (error) {
				console.error('Error fetching reviews:', error);
				return;
			}

			setReviews(data || []);
		} catch (error) {
			console.error('Error fetching reviews:', error);
		}
	};

	const handleLogout = () => {
		localStorage.clear();
		// If using supabase, you can also sign out here
		// supabase.auth.signOut();
		navigate('/');
	};

	const handleMessages = () => {
		setSelectedProviderId(null); // Clear any previous selection
		setShowMessagesModal(true);
	};

	const handleMyBookings = () => {
		// Switch to bookings tab
		setActiveTab('bookings');
		// Scroll to bookings section after a short delay to ensure tab content is rendered
		setTimeout(() => {
			const bookingsSection = document.querySelector(`.${styles.bookingsSection}`);
			if (bookingsSection) {
				bookingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 100);
	};

	const handleProfile = () => {
		// Navigate to profile page
		navigate('/ProfilePetOwner');
	};

	const handleFilters = () => {
		// Show filters modal or panel
		alert('Filters feature coming soon!');
	};

	const handleClearFilters = () => {
		// Clear all applied filters
		setSearchQuery('');
		setLocationQuery('');
		alert('Filters cleared!');
	};

	const handleListMapToggle = (view) => {
		setViewMode(view.toLowerCase());
	};

	const handleBookNow = (service) => {
		setSelectedService(service);
		setShowBookingModal(true);
	};

const handleMessage = async (service) => {
  const providerId = service.provider_user_id; // Use profiles.user_id for messaging
   const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('User not found');
    return;
  }
  // Open the modal (if you use one)
  setSelectedProviderId(providerId);
  setShowMessagesModal(true);

};
	const handleBookingSuccess = (booking) => {
		// Refresh bookings after successful booking
		fetchBookings();
		alert('Booking created successfully! The service provider will contact you soon.');
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim() || locationQuery.trim()) {
			// Search is handled by the useEffect filter
			console.log(`Searching for: "${searchQuery}" in "${locationQuery}"`);
		} else {
			alert('Please enter a search term or location');
		}
	};

	const handleSearchKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleSearch(e);
		}
	};

	const handleProviderCardClick = (providerId, service) => {
		setSelectedProviderId(providerId);
		setSelectedService(service);
		setShowProviderProfileModal(true);
	};

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
			const bookingsSection = document.querySelector(`.${styles.bookingsSection}`);
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
		const ids = notifList.map(n => n.id + n.status);
		setLastSeenNotifs(ids);
		setNotifRead(true);
		setUnreadCount(0);
	};

	const handleLeaveReview = (booking) => {
		setSelectedBookingForReview(booking);
		setShowReviewModal(true);
	};

	const handleReviewSubmitted = () => {
		fetchReviews();
		setToastMessage('Review submitted successfully!');
		setShowToast(true);
	};

	return (
		<div className={styles.dashboard}>
			{/* Toast Notification */}
			<Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />

			{/* Header */}
			<header className={styles.dashboardHeader}>
				<div className={styles.logoContainer}>
					<img className={styles.logoIcon} src="/images/paw-logo.png" alt="Logo" />
					<h1 className={styles.logoText}>FurMaps</h1>
				</div>
				
				<nav className={styles.navMenu}>
					<div style={{ position: 'relative', display: 'inline-block' }}>
						<button className={styles.navButton} onClick={handleNotifClick} style={{ position: 'relative' }}>
							<img src="/Icons/notification.svg" alt="Notifications" />
							{unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
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
											<li key={n.id + n.status} 
												onClick={() => handleNotificationItemClick(n.id)}
												onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
												onMouseLeave={(e) => e.target.style.background = '#fff'}
												style={{
													display:'flex', alignItems:'center', gap:14, padding:'1rem 1.25rem', borderBottom: idx!==notifList.length-1?'1px solid #f3f4f6':'none', background:'#fff', transition:'background 0.2s', cursor:'pointer'
												}}>
												{/* Avatar/Icon */}
												<div style={{width:44, height:44, borderRadius:'50%', background:n.status==='accepted'?'#e0f7ef':'#ffeaea', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26}}>
													{n.status === 'accepted' ? '✅' : '❌'}
												</div>
												<div style={{flex:1, minWidth:0}}>
													<div style={{fontWeight:600, fontSize:'1.05rem', color:'#222', marginBottom:2}}>{n.status === 'accepted' ? 'Booking Approved' : 'Booking Declined'}</div>
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
					<button className={styles.navButton} onClick={handleMessages}>
						<img src="/Icons/chat.svg" alt="Messages" />
						<span>Messages</span>
					</button>
					<button className={styles.navButton} onClick={handleMyBookings}>
						<img src="/Icons/bookings.svg" alt="Bookings" />
						<span>My Bookings</span>
					</button>
					<button className={styles.navButton} onClick={handleProfile}>
						<img src="/Icons/simpleUser.svg" alt="Profile" />
						<span>Profile</span>
					</button>
					<button className={styles.navButton} onClick={handleLogout}>
						<img src="/Icons/logout.svg" alt="Logout" />
						<span>Logout</span>
					</button>
				</nav>
			</header>

			{/* Main Content */}
			<main className={styles.dashboardContent}>
				<div className={styles.dashboardHeaderSection}>
					<h2>Pet Owner Dashboard</h2>
					<p>Find and book trusted pet care services</p>
				</div>

				{/* Stats Cards */}
				<div className={styles.statsGrid}>
					{stats.map((stat, index) => (
						<div key={index} className={styles.statCard} style={{ borderColor: stat.color }}>
							<div className={styles.statInfo}>
								<p className={styles.statTitle}>{stat.title}</p>
								<h3 className={styles.statValue} style={{ color: stat.color }}>{stat.value}</h3>
							</div>
							<img src={`/Icons/${stat.icon}`} alt={stat.title} className={styles.statIcon} />
						</div>
					))}
				</div>

				{/* Navigation Tabs */}
				<div className={styles.dashboardTabs}>
					<button 
						className={`${styles.tabButton} ${activeTab === 'search' ? styles.active : ''}`}
						onClick={() => setActiveTab('search')}
					>
						Search Services
					</button>
					<button 
						className={`${styles.tabButton} ${activeTab === 'bookings' ? styles.active : ''}`}
						onClick={() => setActiveTab('bookings')}
					>
						My Bookings
					</button>
					<button 
						className={`${styles.tabButton} ${activeTab === 'favorites' ? styles.active : ''}`}
						onClick={() => setActiveTab('favorites')}
					>
						Favorites
					</button>
					<button 
						className={`${styles.tabButton} ${activeTab === 'history' ? styles.active : ''}`}
						onClick={() => setActiveTab('history')}
					>
						History
					</button>
				</div>

				{/* Dynamic Tab Content */}
				<div className={styles.tabContent}>
					{activeTab === 'search' && (
						<div className={styles.searchSection}>
							{/* Search Bar */}
							<div className={styles.searchContainer}>
								<div className={styles.searchBar}>
									<div className={styles.searchInput}>
										<input
											type="text"
											placeholder="Search services or providers..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											onKeyPress={handleSearchKeyPress}
											onFocus={() => setIsSearchFocused(true)}
											onBlur={() => setIsSearchFocused(false)}
										/>
									</div>
									<button className={styles.searchButton} onClick={handleSearch}>
										<img src="/images/magnifying.png" alt="Search" />
									</button>
								</div>
								<div className={styles.locationInput}>
									<input
										type="text"
										placeholder="Location"
										value={locationQuery}
										onChange={(e) => setLocationQuery(e.target.value)}
										onKeyPress={handleSearchKeyPress}
										onFocus={() => setIsLocationFocused(true)}
										onBlur={() => setIsLocationFocused(false)}
									/>
									<img src="/images/gps.png" alt="Location" />
								</div>
								<div className={styles.searchControls}>
									<button className={styles.filterButton} onClick={handleFilters}>
										<img src="/images/arrow.png" alt="Filter" />
										<span>Filters</span>
									</button>
									<button className={styles.clearButton} onClick={handleClearFilters}>
										Clear all filters
									</button>
								</div>
							</div>
							{/* Search Results Header */}
							<div className={styles.resultsHeader}>
								<div className={styles.resultsInfo}>
									<h3>{filteredServices.length} providers found</h3>
								</div>
								<div className={styles.viewControls}>
									<div className={styles.sortDropdown}>
										<span>Relevance</span>
										<img src="/images/arrow.png" alt="Sort" />
									</div>
									<div className={styles.viewToggle}>
										<button 
											className={styles.viewButton + (viewMode === 'list' ? ' ' + styles.activeView : '')}
											onClick={() => handleListMapToggle('List')}
										>
											List
										</button>
										<button 
											className={styles.viewButton + (viewMode === 'map' ? ' ' + styles.activeView : '')}
											onClick={() => handleListMapToggle('Map')}
										>
											Map
										</button>
									</div>
								</div>
							</div>
							{/* Search Results */}
							{viewMode === 'list' ? (
								<div className={styles.searchResults}>
									{isLoading ? (
										<div className={styles.loadingState}>
											<div className={styles.loadingSpinner}></div>
											<p>Loading services...</p>
										</div>
									) : filteredServices.length > 0 ? (
										<div className={styles.servicesGrid}>
											{filteredServices.map((service) => (
												<ServiceCard
													key={service.id}
													service={service}
													onBookNow={handleBookNow}
													onMessage={handleMessage}
													onProviderClick={providerId => handleProviderCardClick(providerId, service)}
												/>
											))}
										</div>
									) : (
										<div className={styles.noResults}>
											<div className={styles.noResultsContent}>
												<div className={styles.noResultsHeader}>
													<h3>No Service Providers Found</h3>
												</div>
												<p>Try adjusting your search criteria or location to find available services.</p>
												<div className={styles.featuresList}>
													<div className={styles.featureItem}>
														<img src="/images/arrow.png" alt="Check" />
														<span>Check your search terms</span>
													</div>
													<div className={styles.featureItem}>
														<img src="/images/arrow.png" alt="Notify" />
														<span>Try a different location</span>
													</div>
												</div>
											</div>
											<img className={styles.noResultsImage} src="/images/user.png" alt="User" />
										</div>
									)}
								</div>
							) : (
																	// MAP VIEW UI
																	<div className={styles.mapViewSection}>
										{/* 🌍 Actual Map */}
										<ServiceMap services={filteredServices} />

										{/* List Below Map */}
										<div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '16px' }}>
											{filteredServices.length > 0 ? (
											filteredServices.map((service) => (
												<ServiceCard
												key={service.id}
												service={service}
												onBookNow={handleBookNow}
												onMessage={handleMessage}
												onProviderClick={providerId => handleProviderCardClick(providerId, service)}
												/>
											))
											) : (
											<div className={styles.noResults}>
												<div className={styles.noResultsContent}>
												<div className={styles.noResultsHeader}>
													<h3>No Service Providers Found</h3>
												</div>
												<p>Try adjusting your search criteria or location to find available services.</p>
												<div className={styles.featuresList}>
													<div className={styles.featureItem}>
													<img src="/images/arrow.png" alt="Check" />
													<span>Check your search terms</span>
													</div>
													<div className={styles.featureItem}>
													<img src="/images/arrow.png" alt="Notify" />
													<span>Try a different location</span>
													</div>
												</div>
												</div>
												<img className={styles.noResultsImage} src="/images/user.png" alt="User" />
											</div>
											)}
										</div>
										</div>
																	
							)}
						</div>
					)}
					{activeTab === 'bookings' && (
						<div className={styles.bookingsSection}>
							<h3>My Bookings</h3>
							{bookings.length > 0 ? (
								<div className={styles.bookingsList}>
									{bookings.map((booking) => (
										<div 
											key={booking.id} 
											className={styles.bookingItem}
											data-booking-id={booking.id}
											style={{
												backgroundColor: highlightedBookingId === booking.id ? '#fef3c7' : '',
												border: highlightedBookingId === booking.id ? '2px solid #f59e0b' : '',
												borderRadius: highlightedBookingId === booking.id ? '8px' : '',
												transition: 'all 0.3s ease'
											}}
										>
											<div className={styles.bookingInfo}>
												<h4>{booking.services?.name || 'Service'}</h4>
												<p>Date: {new Date(booking.service_date).toLocaleDateString()}</p>
												<p>Time: {booking.service_time}</p>
												<p>Status: <span className={`status-${booking.status}`}>{booking.status}</span></p>
												<p>Pet: {booking.pet_name} ({booking.pet_type})</p>
											</div>
											<div className={styles.bookingPrice}>
												₱{booking.total_price}
											</div>
										</div>
									))}
								</div>
							) : (
								<p>No active bookings found. Start by searching for pet services!</p>
							)}
						</div>
					)}
					{activeTab === 'favorites' && (
						<div className={styles.favoritesSection}>
							<h3>Favorite Providers</h3>
							<p>No favorite providers yet. Start exploring to find your perfect match!</p>
						</div>
					)}
					{activeTab === 'history' && (
						<div className={styles.historySection}>
							<h3>Booking History</h3>
							{bookings.length > 0 ? (
								<div className={styles.historyList}>
									{bookings.map((booking) => {
										// Check if this booking has been reviewed
										const hasReview = reviews.some(review => review.booking_id === booking.id);
										
										return (
											<div 
												key={booking.id} 
												className={styles.historyItem}
												data-booking-id={booking.id}
												style={{
													backgroundColor: highlightedBookingId === booking.id ? '#fef3c7' : '',
													border: highlightedBookingId === booking.id ? '2px solid #f59e0b' : '',
													borderRadius: highlightedBookingId === booking.id ? '8px' : '',
													transition: 'all 0.3s ease'
												}}
											>
												<div className={styles.historyInfo}>
													<h4>{booking.services?.name || 'Service'}</h4>
													<p>Date: {new Date(booking.service_date).toLocaleDateString()}</p>
													<p>Time: {booking.service_time}</p>
													<p>Status: <span className={`status-${booking.status}`}>{booking.status}</span></p>
													<p>Pet: {booking.pet_name} ({booking.pet_type})</p>
													<p>Price: ₱{booking.total_price}</p>
												</div>
												<div className={styles.historyActions}>
													{booking.status === 'completed' && !hasReview && (
														<button 
															className={styles.reviewButton}
															onClick={() => handleLeaveReview(booking)}
														>
															Leave Review
														</button>
													)}
													{booking.status === 'completed' && hasReview && (
														<span className={styles.reviewedBadge}>
															✓ Reviewed
														</span>
													)}
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<p>No booking history found. Start by searching for pet services!</p>
							)}
						</div>
					)}
				</div>
			</main>

			{/* Provider Profile Modal */}
			{showProviderProfileModal && (
				<div
					className="booking-modal-overlay"
					onClick={e => {
						if (e.target.classList.contains('booking-modal-overlay')) {
							setShowProviderProfileModal(false);
							setSelectedProviderId(null);
							setSelectedService(null);
						}
					}}
				>
					<div className="booking-modal" style={{ padding: 0, maxWidth: 520, position: 'relative' }}>
						<button
							className="close-btn"
							onClick={() => { setShowProviderProfileModal(false); setSelectedProviderId(null); setSelectedService(null); }}
							style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}
						>
							&times;
						</button>
						<div style={{ padding: 0 }}>
							<ProviderProfile userId={selectedProviderId} />
							{selectedService && (
								<div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 8px 0' }}>
									<button
										className="book-now-btn"
										style={{ fontSize: '1rem', padding: '12px 32px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 8px rgba(59,130,246,0.08)' }}
										onClick={() => {
											setShowProviderProfileModal(false);
											setShowBookingModal(true);
										}}
									>
										Book Now
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Booking Modal */}
			{showBookingModal && selectedService && (
				<BookingModal
					service={selectedService}
					isOpen={showBookingModal}
					onClose={() => { setShowBookingModal(false); setSelectedService(null); }}
					onBookingSuccess={handleBookingSuccess}
				/>
			)}
			{showMessagesModal && (
				<MessagesModal
					onClose={() => setShowMessagesModal(false)}
					receiverId={selectedProviderId}
				/>
			)}
			{showReviewModal && selectedBookingForReview && (
				<ReviewModal
					booking={selectedBookingForReview}
					isOpen={showReviewModal}
					onClose={() => {
						setShowReviewModal(false);
						setSelectedBookingForReview(null);
					}}
					onReviewSubmitted={handleReviewSubmitted}
				/>
			)}
		</div>
	);
};

export default WPetOwnerDB;