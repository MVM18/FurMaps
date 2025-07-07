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
// import Modal from '../../components/Modal'; // Removed because Modal does not exist and is not needed

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

// Helper function to format dates and times properly for display
function formatBookingDateTime(dateTimeString) {
	if (!dateTimeString) return { date: '-', time: '' };
	
	// Parse the datetime string - treat it as local time since it's likely stored in user's timezone
	const date = new Date(dateTimeString);
	
	// Check if the date is valid
	if (isNaN(date.getTime())) {
		return { date: '-', time: '' };
	}
	
	// Format date (e.g., "7/9/2025")
	const dateStr = date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	});
	
	// Format time (e.g., "5:00 AM")
	const timeStr = date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
	
	return { date: dateStr, time: timeStr };
}

// Function that treats the time as local time (removes timezone offset)
function formatBookingDateTimeUTC(dateTimeString) {
	if (!dateTimeString) return { date: '-', time: '' };
	
	// Remove the timezone offset if present and treat as local time
	let cleanDateTime = dateTimeString;
	if (dateTimeString.includes('+')) {
		cleanDateTime = dateTimeString.split('+')[0];
	}
	
	// Create date object treating the time as local time (no timezone conversion)
	const date = new Date(cleanDateTime);
	
	// Check if the date is valid
	if (isNaN(date.getTime())) {
		return { date: '-', time: '' };
	}
	
	// Format date (e.g., "7/9/2025")
	const dateStr = date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	});
	
	// Format time (e.g., "5:00 AM")
	const timeStr = date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
	
	return { date: dateStr, time: timeStr };
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
	const [userStatus, setUserStatus] = useState(null);
	const [userRole, setUserRole] = useState(null);
	const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
	const [showBookingDetailModal, setShowBookingDetailModal] = useState(false);

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

	// Check user status and role
	const checkUserStatus = async () => {
		const { data: { user }, error: userError } = await supabase.auth.getUser();
		if (userError || !user) {
			console.error('User fetch error:', userError);
			return;
		}

		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('status, role')
			.eq('user_id', user.id)
			.single();

		if (profileError) {
			console.error('Profile fetch error:', profileError);
			return;
		}

		setUserStatus(profile.status);
		setUserRole(profile.role);
	};

	// Calculate stats based on booking status and completion
	const activeBookings = bookings.filter(booking => {
		const now = new Date();
		const serviceEndTime = booking.service_end_datetime ? new Date(booking.service_end_datetime) : null;
		const isServiceCompleted = booking.status === 'confirmed' && serviceEndTime && now > serviceEndTime;
		const isCompletedByProvider = booking.status === 'completed';
		return booking.status !== 'cancelled' && !isServiceCompleted && !isCompletedByProvider;
	});

	const completedBookings = bookings.filter(booking => {
		const now = new Date();
		const serviceEndTime = booking.service_end_datetime ? new Date(booking.service_end_datetime) : null;
		const isServiceCompleted = booking.status === 'confirmed' && serviceEndTime && now > serviceEndTime;
		const isCompletedByProvider = booking.status === 'completed';
		// Only count as completed if not cancelled
		return (isServiceCompleted || isCompletedByProvider) && booking.status !== 'cancelled';
	});

	// Calculate total spent from completed bookings (not cancelled)
	const totalSpent = completedBookings.reduce((total, booking) => {
		return total + (parseFloat(booking.total_price) || 0);
	}, 0);

	// Format total spent with proper currency formatting
	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	// Real data for pet owner dashboard
	const stats = [
		{ title: "Total Bookings", value: bookings.length.toString(), icon: "bookings.svg", color: "#059669" },
		{ title: "Ongoing Bookings", value: activeBookings.length.toString(), icon: "ongoing.svg", color: "#2563eb" },
		{ title: "Total Spent", value: formatCurrency(totalSpent), icon: "pesos.svg", color: "#d97706" },
		{ title: "Completed Bookings", value: completedBookings.length.toString(), icon: "done.svg", color: "#16a34a" }
	];

	// Fetch services from database
	useEffect(() => {
		checkUserStatus();
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
			const notifs = (data || []).filter(b => b.status === 'confirmed' || b.status === 'cancelled' || b.status === 'completed');
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
						provider_id
					)
				`)
				.eq('pet_owner_id', user.id)
				.order('created_at', { ascending: false });

			console.log('Bookings:', data, 'Error:', error);

			if (error) {
				console.error('Error fetching bookings:', error);
				return;
			}

			// Format the bookings data to include provider name and service info
			const formattedBookings = data?.map(booking => ({
				...booking,
				service_name: booking.services?.name || 'Service',
				service_type: booking.services?.service_type || '',
				service_provider_id: booking.services?.provider_id || booking.service_provider_id, // Use provider_id from service
				provider_name: 'Provider' // We'll get this from the service provider's profile
			})) || [];

			// Get provider details for each booking
			const providerIds = [...new Set(formattedBookings.map(booking => booking.service_provider_id).filter(Boolean))];
			
			if (providerIds.length > 0) {
				const { data: providers, error: providersError } = await supabase
					.from('profiles')
					.select('user_id, first_name, last_name, phone, address')
					.in('user_id', providerIds);

				if (!providersError && providers) {
					// Update bookings with provider details
					const updatedBookings = formattedBookings.map(booking => {
						const provider = providers.find(p => p.user_id === booking.service_provider_id);
						return {
							...booking,
							provider_name: provider ? `${provider.first_name} ${provider.last_name}`.trim() : 'Provider',
							contact_number: provider?.phone || booking.contact_number,
							address: provider?.address || booking.address
						};
					});
					setBookings(updatedBookings);
					return;
				}
			}

			setBookings(formattedBookings);
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

	// Real-time booking status monitoring
	useEffect(() => {
		let intervalId;
		const checkBookingStatus = async () => {
			// Check if any bookings have been completed
			const currentBookings = bookings;
			const now = new Date();
			
			let hasStatusChanges = false;
			const updatedBookings = currentBookings.map(booking => {
				const serviceEndTime = booking.service_end_datetime ? new Date(booking.service_end_datetime) : null;
				const isServiceCompleted = booking.status === 'confirmed' && serviceEndTime && now > serviceEndTime;
				
				// If a booking has been completed by time, update its status
				if (isServiceCompleted && booking.status === 'confirmed') {
					hasStatusChanges = true;
					return { ...booking, status: 'completed' };
				}
				return booking;
			});
			
			if (hasStatusChanges) {
				setBookings(updatedBookings);
				setToastMessage('Some bookings have been completed and moved to history!');
				setShowToast(true);
			}
		};
		
		// Check every minute for completed bookings
		intervalId = setInterval(checkBookingStatus, 60000);
		checkBookingStatus(); // Run immediately on mount
		
		return () => clearInterval(intervalId);
	}, [bookings]);

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
		// Check if user is suspended
		if (userStatus === 'Suspended') {
			setToastMessage('Your account has been suspended. You cannot book services at this time. Please contact support for assistance.');
			setShowToast(true);
			return;
		}

		// Check if user is a pet owner
		if (userRole !== 'owner') {
			setToastMessage('Only pet owners can book services.');
			setShowToast(true);
			return;
		}

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
		// Only refresh bookings or show a toast here. Do NOT close the modal.
		fetchBookings();
		// Optionally show a toast or alert, but do NOT call setShowBookingModal(false) or setSelectedService(null) here.
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
		const notifIds = notifList.map(n => n.id + n.status);
		setLastSeenNotifs(notifIds);
		setUnreadCount(0);
		setNotifRead(true);
	};

	// Add cancel booking function
	const handleCancelBooking = async (bookingId) => {
		if (!window.confirm('Are you sure you want to cancel this booking?')) {
			return;
		}

		try {
			const { error } = await supabase
				.from('bookings')
				.update({ 
					status: 'cancelled', 
					updated_at: new Date().toISOString() 
				})
				.eq('id', bookingId);

			if (error) {
				console.error('Error cancelling booking:', error);
				setToastMessage('Failed to cancel booking. Please try again.');
				setShowToast(true);
				return;
			}

			// Update local state
			setBookings(prev => prev.map(booking => 
				booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
			));

			setToastMessage('Booking cancelled successfully!');
			setShowToast(true);

        // Fetch latest bookings from the database to ensure UI is in sync
        await fetchBookings();
	} catch (error) {
		console.error('Error cancelling booking:', error);
		setToastMessage('Failed to cancel booking. Please try again.');
		setShowToast(true);
	}
};

	// Add message provider function for bookings
	const handleMessageProvider = (booking) => {
		if (booking.service_provider_id) {
			setSelectedProviderId(booking.service_provider_id);
			setShowMessagesModal(true);
		} else {
			setToastMessage('Provider information not available.');
			setShowToast(true);
		}
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
			
			{/* Status Message Banner */}
			{userStatus === 'Suspended' && (
				<div className={styles.statusBanner}>
					<div className={styles.statusMessage}>
						<p>🚫 Your account has been suspended. You cannot book services at this time. Please contact support for assistance.</p>
					</div>
				</div>
			)}

			{/* Header */}
			<header className={styles.dashboardHeader}>
				<div className={styles.logoContainer}>
					<img className={styles.logoIcon} src="/images/gps.png" alt="Logo" />
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
												<div style={{width:44, height:44, borderRadius:'50%', background:n.status==='confirmed'?'#e0f7ef':n.status==='completed'?'#d1fae5':'#ffeaea', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26}}>
													{n.status === 'confirmed' ? '✅' : n.status === 'completed' ? '🎉' : '❌'}
												</div>
												<div style={{flex:1, minWidth:0}}>
													<div style={{fontWeight:600, fontSize:'1.05rem', color:'#222', marginBottom:2}}>
														{n.status === 'confirmed' ? 'Booking Confirmed' : n.status === 'completed' ? 'Service Completed' : 'Booking Cancelled'}
													</div>
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
								
							</div>
							{/* Search Results Header */}
							<div className={styles.resultsHeader}>
								<div className={styles.resultsInfo}>
									<h3>{filteredServices.length} providers found</h3>
								</div>
								<div className={styles.viewControls}>
									
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
							<h3 className = {styles.leftAlign}>My Bookings</h3>
							{(() => {
								// Filter out completed/ended bookings from active bookings
								const activeBookings = bookings.filter(booking => {
									const now = new Date();
									const serviceEndTime = booking.service_end_datetime ? new Date(booking.service_end_datetime) : null;
									const isServiceCompleted = booking.status === 'confirmed' && serviceEndTime && now > serviceEndTime;
									const isCompletedByProvider = booking.status === 'completed';
									
									// Only show bookings that are not completed/ended, not cancelled, and not marked as completed by provider
									return booking.status !== 'cancelled' && !isServiceCompleted && !isCompletedByProvider;
								});
								
								return activeBookings.length > 0 ? (
									<div className={styles.bookingsList}>
										{activeBookings.map((booking) => {
										let serviceType = booking.service_type || '';
										let serviceIcon = '/images/dogies.png';
										if (serviceType) {
											switch (serviceType.toLowerCase()) {
												case 'dog walking':
													serviceIcon = '/images/dog-leash.png'; break;
												case 'pet grooming':
													serviceIcon = '/images/dog-cat.png'; break;
												case 'pet sitting':
													serviceIcon = '/images/dog-human.png'; break;
												case 'veterinary':
													serviceIcon = '/images/dog-background.png'; break;
												default:
													serviceIcon = '/images/dogies.png';
											}
										}
										// Determine the actual status based on booking status and service end time
										let actualStatus = booking.status;
										let statusClass = `status-${actualStatus}`;
										
										// Check if service has ended based on service_end_datetime
										const now = new Date();
										const serviceEndTime = booking.service_end_datetime ? new Date(booking.service_end_datetime) : null;
										
										if (booking.status === 'confirmed' && serviceEndTime && now > serviceEndTime) {
											actualStatus = 'ended';
											statusClass = 'status-ended';
										} else if (booking.status === 'confirmed') {
											actualStatus = 'ongoing';
											statusClass = 'status-ongoing';
										}
										
										let statusLabel = actualStatus;
										if (statusLabel) statusLabel = statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1);
										// Format dates/times using the UTC helper function
										const startDateTime = formatBookingDateTimeUTC(booking.service_start_datetime);
										const endDateTime = formatBookingDateTimeUTC(booking.service_end_datetime);
										return (
											<div
												key={booking.id}
												className={styles.bookingCard}
												data-booking-id={booking.id}
												style={{
													...(highlightedBookingId === booking.id ? {
														background: '#fef3c7',
														boxShadow: '0 4px 16px rgba(251,191,36,0.10)',
														border: '2px solid #f59e0b',
													} : {})
												}}
												onClick={() => {
													setSelectedBookingDetail(booking);
													setShowBookingDetailModal(true);
												}}
											>
												{/* Header Section */}
												<div className={styles.bookingHeader}>
													<div className={styles.serviceInfo}>
														<div className={styles.serviceIcon}>
															<img src={serviceIcon} alt={serviceType} />
														</div>
														<div className={styles.serviceDetails}>
															<h3 className={styles.serviceName}>{booking.service_name || 'Service'}</h3>
															{booking.service_type && (
																<span className={styles.serviceType}>{booking.service_type}</span>
															)}
														</div>
													</div>
													<div className={styles.bookingStatus}>
														<span className={`${styles.statusBadge} ${styles[statusClass]}`}>
															{statusLabel}
														</span>
													</div>
												</div>

												{/* Content Section */}
												<div className={styles.bookingContent}>
													<div className={styles.bookingDetails}>
														<div className={styles.detailRow}>
															<span className={styles.detailLabel}>👤 Provider:</span>
															<span className={styles.detailValue}>{booking.provider_name || 'Provider'}</span>
														</div>
														<div className={styles.detailRow}>
															<span className={styles.detailLabel}>📞 Contact:</span>
															<span className={styles.detailValue}>{booking.contact_number || 'Not provided'}</span>
														</div>
														<div className={styles.detailRow}>
															<span className={styles.detailLabel}>📍 Location:</span>
															<span className={styles.detailValue}>{booking.address || 'Not provided'}</span>
														</div>
														<div className={styles.detailRow}>
															<span className={styles.detailLabel}>🐾 Pet:</span>
															<span className={styles.detailValue}>{booking.pet_name} ({booking.pet_type})</span>
														</div>
														<div className={styles.detailRow}>
															<span className={styles.detailLabel}>📅 Date:</span>
															<span className={styles.detailValue}>
																{startDateTime.date} {startDateTime.time} - {endDateTime.time}
															</span>
														</div>
														{booking.special_instructions && (
															<div className={styles.detailRow}>
																<span className={styles.detailLabel}>📝 Notes:</span>
																<span className={styles.detailValue}>{booking.special_instructions}</span>
															</div>
														)}
													</div>
													
													<div className={styles.bookingPrice}>
														<span className={styles.priceAmount}>₱{booking.total_price}</span>
														<span className={styles.priceLabel}>Total</span>
													</div>
												</div>

												{/* Actions Section */}
												<div className={styles.bookingActions}>
													<button
														onClick={() => handleMessageProvider(booking)}
														className={styles.messageProviderBtn}
													>
														<img src="/Icons/chat.svg" alt="Message" />
														Message Provider
													</button>
													{actualStatus === 'pending' && (
														<button
															onClick={() => handleCancelBooking(booking.id)}
															className={styles.cancelBookingBtn}
														>
															<img src="/Icons/decline.svg" alt="Cancel" />
															Cancel Booking
														</button>
													)}
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<p>No active bookings found. Start by searching for pet services!</p>
							);
							})()}
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
							<div className={styles.historyHeader}>
								<h3>Booking History</h3>
								<p>View your past bookings and leave reviews for completed services</p>
							</div>
							{(() => {
								// Filter to show only completed/ended bookings and cancelled bookings in history
								const historyBookings = bookings.filter(booking => {
									const now = new Date();
									const serviceEndTime = booking.service_end_datetime ? new Date(booking.service_end_datetime) : null;
									const isServiceCompleted = booking.status === 'confirmed' && serviceEndTime && now > serviceEndTime;
									const isCompletedByProvider = booking.status === 'completed';
									
									// Show cancelled bookings, time-based completed bookings, and provider-marked completed bookings
									return booking.status === 'cancelled' || isServiceCompleted || isCompletedByProvider;
								});
								
								return historyBookings.length > 0 ? (
									<div className={styles.historyList}>
										{historyBookings.map((booking) => {
										// Check if this booking has been reviewed
										const hasReview = reviews.some(review => review.booking_id === booking.id);
										
										// Determine if service is completed based on status and end time
										const now = new Date();
										const serviceEndTime = booking.service_end_datetime ? new Date(booking.service_end_datetime) : null;
										const isServiceCompleted = booking.status === 'confirmed' && serviceEndTime && now > serviceEndTime;
										const isCompletedByProvider = booking.status === 'completed';
										const isCompleted = isServiceCompleted || isCompletedByProvider;
										const canReview = isCompleted && !hasReview;
										
										// Get service icon based on service type
										let serviceType = booking.service_type || '';
										let serviceIcon = '/images/dogies.png';
										if (serviceType) {
											switch (serviceType.toLowerCase()) {
												case 'dog walking':
													serviceIcon = '/images/dog-leash.png'; break;
												case 'pet grooming':
													serviceIcon = '/images/dog-cat.png'; break;
												case 'pet sitting':
													serviceIcon = '/images/dog-human.png'; break;
												case 'veterinary':
													serviceIcon = '/images/dog-background.png'; break;
												default:
													serviceIcon = '/images/dogies.png';
											}
										}
										
										// Format dates and times using the UTC helper function
										const startDateTime = formatBookingDateTimeUTC(booking.service_start_datetime);
										const endDateTime = formatBookingDateTimeUTC(booking.service_end_datetime);
										
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
												{/* Service Icon and Basic Info */}
												<div className={styles.historyServiceInfo}>
													<div className={styles.serviceIconContainer}>
														<img src={serviceIcon} alt={serviceType} className={styles.serviceIcon} />
													</div>
													<div className={styles.serviceDetails}>
														<h4 className={styles.serviceName}>{booking.service_name || 'Service'}</h4>
														{booking.service_type && (
															<span className={styles.serviceType}>{booking.service_type}</span>
														)}
														<div className={styles.providerInfo}>
															<span className={styles.providerName}>👤 {booking.provider_name || 'Provider'}</span>
														</div>
													</div>
												</div>
												
												{/* Booking Details */}
												<div className={styles.historyDetails}>
													<div className={styles.detailRow}>
														<span className={styles.detailLabel}>🐾 Pet:</span>
														<span className={styles.detailValue}>{booking.pet_name} ({booking.pet_type})</span>
													</div>
													<div className={styles.detailRow}>
														<span className={styles.detailLabel}>📅 Date:</span>
														<span className={styles.detailValue}>{startDateTime.date}</span>
													</div>
													<div className={styles.detailRow}>
														<span className={styles.detailLabel}>⏰ Time:</span>
														<span className={styles.detailValue}>{startDateTime.time} - {endDateTime.time}</span>
													</div>
													<div className={styles.detailRow}>
														<span className={styles.detailLabel}>💰 Price:</span>
														<span className={styles.detailValue}>₱{booking.total_price}</span>
													</div>
													<div className={styles.detailRow}>
														<span className={styles.detailLabel}>📊 Status:</span>
														<span className={`${styles.statusBadge} ${styles[`status-${isCompleted ? 'completed' : booking.status}`]}`}>
															{isCompleted ? 'Completed' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
														</span>
													</div>
												</div>
												
												{/* Review Section */}
												<div className={styles.historyReviewSection}>
													{canReview && (
														<div className={styles.reviewPrompt}>
															<div className={styles.reviewPromptContent}>
																<span className={styles.reviewIcon}>⭐</span>
																<div className={styles.reviewText}>
																	<h5>How was your experience?</h5>
																	<p>Share your feedback to help other pet owners</p>
																</div>
															</div>
															<button 
																className={styles.reviewButton}
																onClick={() => handleLeaveReview(booking)}
															>
																Leave Review
															</button>
														</div>
													)}
													{hasReview && (
														<div className={styles.reviewedStatus}>
															<span className={styles.reviewedIcon}>✅</span>
															<div className={styles.reviewedText}>
																<span className={styles.reviewedBadge}>Review Submitted</span>
																<p>Thank you for your feedback!</p>
															</div>
														</div>
													)}
													{!canReview && !hasReview && isCompleted && (
														<div className={styles.reviewPrompt}>
															<div className={styles.reviewPromptContent}>
																<span className={styles.reviewIcon}>⏰</span>
																<div className={styles.reviewText}>
																	<h5>Service Completed</h5>
																	<p>Your service has been completed</p>
																</div>
															</div>
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className={styles.emptyHistory}>
									<div className={styles.emptyHistoryContent}>
										<img src="/images/dog-hug.png" alt="No History" className={styles.emptyHistoryImage} />
										<h4>No Booking History Yet</h4>
										<p>Start by booking your first pet service to see your history here!</p>
										<button 
											className={styles.bookFirstServiceBtn}
											onClick={() => setActiveTab('search')}
										>
											Book Your First Service
										</button>
									</div>
								</div>
							);
							})()}
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
							<ProviderProfile 
								userId={selectedProviderId} 
								onServiceClick={(service) => {
									setSelectedService(service);
									setShowProviderProfileModal(false);
									setShowBookingModal(true);
								}}
							/>
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
			{showBookingDetailModal && selectedBookingDetail && (
				<div className="booking-modal-overlay" onClick={e => { if (e.target.classList.contains('booking-modal-overlay')) setShowBookingDetailModal(false); }}>
					<div className="booking-modal" style={{ maxWidth: 480, margin: '40px auto', position: 'relative', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 0 }}>
						<button className="close-btn" style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowBookingDetailModal(false)}>×</button>
						<div style={{ padding: 32 }}>
							<h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 20 }}>Booking Details</h2>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
								<div style={{ fontWeight: 600, color: '#374151' }}>Service:</div>
								<div>{selectedBookingDetail.service_name}</div>
								<div style={{ fontWeight: 600, color: '#374151' }}>Provider:</div>
								<div>{selectedBookingDetail.provider_name}</div>
								<div style={{ fontWeight: 600, color: '#374151' }}>Status:</div>
								<div style={{ textTransform: 'capitalize' }}>{selectedBookingDetail.status}</div>
								<div style={{ fontWeight: 600, color: '#374151' }}>Start:</div>
								<div>{selectedBookingDetail.service_start_datetime && (() => {
									const startDateTime = formatBookingDateTimeUTC(selectedBookingDetail.service_start_datetime);
									return `${startDateTime.date} ${startDateTime.time}`;
								})()}</div>
								<div style={{ fontWeight: 600, color: '#374151' }}>End:</div>
								<div>{selectedBookingDetail.service_end_datetime && (() => {
									const endDateTime = formatBookingDateTimeUTC(selectedBookingDetail.service_end_datetime);
									return `${endDateTime.date} ${endDateTime.time}`;
								})()}</div>
								<div style={{ fontWeight: 600, color: '#374151' }}>Contact:</div>
								<div>{selectedBookingDetail.contact_number}</div>
								<div style={{ fontWeight: 600, color: '#374151' }}>Location:</div>
								<div>{selectedBookingDetail.address}</div>
								<div style={{ fontWeight: 600, color: '#374151' }}>Special Instructions:</div>
								<div>{selectedBookingDetail.special_instructions || 'None'}</div>
							</div>
							<div style={{ borderTop: '1px solid #e5e7eb', margin: '24px 0 16px 0' }} />
							<div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12, color: '#2563eb' }}>Pet Information</div>
							<div style={{ display: 'grid', gridTemplateColumns: selectedBookingDetail.pet_image ? '1fr 140px' : '1fr', gap: 12, marginBottom: 8, alignItems: 'start' }}>
								<div>
									<div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 8, columnGap: 8 }}>
										<div style={{ fontWeight: 600, color: '#374151' }}>Name:</div>
										<div>{selectedBookingDetail.pet_name}</div>
										<div style={{ fontWeight: 600, color: '#374151' }}>Type:</div>
										<div>{selectedBookingDetail.pet_type}</div>
										<div style={{ fontWeight: 600, color: '#374151' }}>Age:</div>
										<div>{selectedBookingDetail.age || 'N/A'}</div>
										<div style={{ fontWeight: 600, color: '#374151' }}>Weight:</div>
										<div>{selectedBookingDetail.weight || 'N/A'}</div>
										<div style={{ fontWeight: 600, color: '#374151' }}>Breed:</div>
										<div>{selectedBookingDetail.breed || 'N/A'}</div>
									</div>
								</div>
								{selectedBookingDetail.pet_image && (
									<div style={{ textAlign: 'center' }}>
										<div style={{ fontWeight: 600, color: '#374151', marginBottom: 6 }}>Pet Photo:</div>
										<img src={selectedBookingDetail.pet_image} alt="Pet" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 12, border: '1px solid #e5e7eb', objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} />
									</div>
								)}
							</div>
							<div style={{ borderTop: '1px solid #e5e7eb', margin: '24px 0 16px 0' }} />
							<div style={{ fontWeight: 700, fontSize: 18, color: '#059669' }}>Total Price: ₱{selectedBookingDetail.total_price}</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default WPetOwnerDB;