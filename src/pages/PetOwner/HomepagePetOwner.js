import styles from './HomepagePetOwner.module.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ServiceCard from '../../components/ServiceCard';
import BookingModal from '../../components/BookingModal';

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

	const fetchServices = async () => {
		setIsLoading(true);
		try {
			// 1. Fetch all services
			const { data: services, error: servicesError } = await supabase
				.from('services')
				.select('*')
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
						serviceType: service.service_type,
						contactNumber: service.contact_number,
						price: service.price,
						provider_id: service.provider_id,
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

	const handleLogout = () => {
		localStorage.clear();
		// If using supabase, you can also sign out here
		// supabase.auth.signOut();
		navigate('/');
	};

	const handleMessages = () => {
		// Navigate to messages page or show messages modal
		alert('Messages feature coming soon!');
	};

	const handleMyBookings = () => {
		// Navigate to bookings page
		alert('My Bookings feature coming soon!');
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
		// Toggle between list and map view
		alert(`${view} view selected!`);
	};

	const handleBookNow = (service) => {
		setSelectedService(service);
		setShowBookingModal(true);
	};

	const handleMessage = (service) => {
		// Navigate to messaging or show message modal
		alert(`Messaging feature for ${service.name} coming soon!`);
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

	return (
		<div className={styles.dashboard}>
			{/* Header */}
			<header className={styles.dashboardHeader}>
				<div className={styles.logoContainer}>
					<img className={styles.logoIcon} src="/images/paw-logo.png" alt="Logo" />
					<h1 className={styles.logoText}>FurMaps</h1>
				</div>
				
				<nav className={styles.navMenu}>
					<button className={styles.navButton}>
						<img src="/Icons/notification.svg" alt="Notifications" />
						<span className={styles.badge}>2</span>
					</button>
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
											className={styles.viewButton} 
											onClick={() => handleListMapToggle('List')}
										>
											List
										</button>
										<button 
											className={styles.viewButton} 
											onClick={() => handleListMapToggle('Map')}
										>
											Map
										</button>
									</div>
								</div>
							</div>

							{/* Search Results */}
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
						</div>
					)}
					
					{activeTab === 'bookings' && (
						<div className={styles.bookingsSection}>
							<h3>My Bookings</h3>
							{bookings.length > 0 ? (
								<div className={styles.bookingsList}>
									{bookings.map((booking) => (
										<div key={booking.id} className={styles.bookingItem}>
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
							<p>Your past bookings will appear here once you start using our services.</p>
						</div>
					)}
				</div>
			</main>

			{/* Booking Modal */}
			{selectedService && (
				<BookingModal
					service={selectedService}
					isOpen={showBookingModal}
					onClose={() => {
						setShowBookingModal(false);
						setSelectedService(null);
					}}
					onBookingSuccess={handleBookingSuccess}
				/>
			)}
		</div>
	);
};

export default WPetOwnerDB;
