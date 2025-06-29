import styles from './HomepagePetOwner.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const WPetOwnerDB = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState('search');
	const [searchQuery, setSearchQuery] = useState('');
	const [locationQuery, setLocationQuery] = useState('');
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [isLocationFocused, setIsLocationFocused] = useState(false);

	// Sample data for pet owner dashboard
	const stats = [
		{ title: "Total Bookings", value: "15", icon: "bookings.svg", color: "#059669" },
		{ title: "Favorite Providers", value: "8", icon: "star.svg", color: "#2563eb" },
		{ title: "This Month", value: "₱2,450", icon: "pesos.svg", color: "#d97706" },
		{ title: "Active Services", value: "3", icon: "user.svg", color: "#16a34a" }
	];

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

	const handleBookNow = (providerName) => {
		// Navigate to booking page or show booking modal
		alert(`Booking feature for ${providerName} coming soon!`);
	};

	const handleMessage = (providerName) => {
		// Navigate to messaging or show message modal
		alert(`Messaging feature for ${providerName} coming soon!`);
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim() || locationQuery.trim()) {
			alert(`Searching for: "${searchQuery}" in "${locationQuery}"\n\nSearch functionality coming soon!`);
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
									<h3>0 providers found</h3>
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

							{/* No Results Message */}
							<div className={styles.noResults}>
								<div className={styles.noResultsContent}>
									<div className={styles.noResultsHeader}>
										<h3>No Service Providers Available</h3>
										<div className={styles.comingSoonBadge}>Coming Soon</div>
									</div>
									<p>We're working on connecting you with amazing pet care providers!</p>
									<div className={styles.featuresList}>
										<div className={styles.featureItem}>
											<img src="/images/arrow.png" alt="Check" />
											<span>Check back soon for local providers</span>
										</div>
										<div className={styles.featureItem}>
											<img src="/images/arrow.png" alt="Notify" />
											<span>Be the first to know when we launch</span>
										</div>
									</div>
									<div className={styles.petTypes}>
										<span className={styles.petType}>Dogs</span>
										<span className={styles.petType}>Cats</span>
										<span className={styles.petType}>Other Pets</span>
									</div>
									<p className={styles.notifyText}>We'll notify you when providers join!</p>
									<div className={styles.actionButtons}>
										<button className={styles.primaryButton} onClick={() => alert('We\'ll notify you when booking is available!')}>
											Get Notified
										</button>
										<button className={styles.secondaryButton} onClick={() => alert('Contact us at support@furmaps.com')}>
											<img src="/images/arrow.png" alt="Contact" />
											<span>Contact</span>
										</button>
									</div>
								</div>
								<img className={styles.noResultsImage} src="/images/user.png" alt="User" />
							</div>
						</div>
					)}
					
					{activeTab === 'bookings' && (
						<div className={styles.bookingsSection}>
							<h3>My Bookings</h3>
							<p>No active bookings found. Start by searching for pet services!</p>
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
		</div>
	);
};

export default WPetOwnerDB;
