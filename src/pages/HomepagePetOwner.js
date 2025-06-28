import styles from './HomepagePetOwner.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';


const WPetOwnerDB = () => {
  	const navigate = useNavigate();
  	const [searchQuery, setSearchQuery] = useState('');
  	const [locationQuery, setLocationQuery] = useState('');
  	const [isSearchFocused, setIsSearchFocused] = useState(false);
  	const [isLocationFocused, setIsLocationFocused] = useState(false);

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
    		alert('Profile feature coming soon!');
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
    		<div className={styles.wPetOwnerDb}>
      			<div className={styles.header}>
        				<div className={styles.container}>
          					<div className={styles.container1}>
            						<img className={styles.backgroundIcon} alt="Logo" src="/images/paw-logo.png" />
            						<div className={styles.margin}>
              							<b className={styles.furmaps}>FurMaps</b>
            						</div>
          					</div>
          					<div className={styles.container2}>
            						<div className={styles.linkmargin}>
              							<div className={styles.linkButton} onClick={handleMessages} style={{cursor:'pointer'}}>
                								<img className={styles.svgmarginIcon} alt="Arrow" src="/images/arrow.png" />
                								<div className={styles.messages}>Messages</div>
              							</div>
            						</div>
            						<div className={styles.linkmargin1}>
              							<div className={styles.linkButton} onClick={handleMyBookings} style={{cursor:'pointer'}}>
                								<img className={styles.svgmarginIcon} alt="Arrow" src="/images/arrow.png" />
                								<div className={styles.messages}>My Bookings</div>
              							</div>
            						</div>
            						<div className={styles.linkmargin2}>
              							<div className={styles.linkButton} onClick={handleProfile} style={{cursor:'pointer'}}>
                								<img className={styles.svgmarginIcon} alt="Arrow" src="/images/arrow.png" />
                								<div className={styles.messages}>Profile</div>
              							</div>
            						</div>
            						<div className={styles.linkmargin3}>
              							<div className={styles.linkButton} onClick={handleLogout} style={{cursor:'pointer'}}>
                								<img className={styles.svgmarginIcon} alt="Arrow" src="/images/arrow.png" />
                								<div className={styles.messages}>Logout</div>
              							</div>
            						</div>
            						<div className={styles.buttonMenu}>
              							<img className={styles.svgIcon} alt="Arrow" src="/images/arrow.png" />
              							<div className={styles.background}>
                								<div className={styles.div}>2</div>
              							</div>
            						</div>
          					</div>
        				</div>
      			</div>
      			<div className={styles.container3}>
        				<div className={styles.container4}>
          					<div className={styles.heading1}>
            						<b className={styles.findPetServices}>Find Pet Services</b>
          					</div>
          					<div className={styles.container5}>
            						<div className={styles.discoverTrustedPet}>Discover trusted pet care providers in your area</div>
          					</div>
        				</div>
        				<div className={styles.container6}>
          					<div className={styles.overlaybordershadowoverlayb}>
            						<div className={styles.container7}>
              							<div className={styles.buttonDialogmargin}>
                								<div className={styles.buttonDialog} onClick={handleFilters} style={{cursor:'pointer'}}>
                  									<img className={styles.svgmarginIcon} alt="Arrow" src="/images/arrow.png" />
                  									<div className={styles.messages}>Filters</div>
                  									<div className={styles.margin1}>
                    										<div className={styles.background1}>
                      											<div className={styles.div}>2</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
              							<div className={styles.container8}>
                								<div className={styles.input}>
                  									<div className={styles.container9}>
                    										<input
                      											type="text"
                      											placeholder="Search services or providers..."
                      											value={searchQuery}
                      											onChange={(e) => setSearchQuery(e.target.value)}
                      											onKeyPress={handleSearchKeyPress}
                      											onFocus={() => setIsSearchFocused(true)}
                      											onBlur={() => setIsSearchFocused(false)}
                      											style={{
                        												border: 'none',
                        												outline: 'none',
                        												background: 'transparent',
                        												width: '100%',
                        												height: '100%',
                        												fontSize: '14px',
                        												color: '#333',
                        												fontFamily: 'inherit',
                        												padding: '0',
                        												margin: '0',
                        												position: 'relative',
                        												zIndex: 2
                      											}}
                    										/>
                  									</div>
                  									<div className={styles.container10} />
                								</div>
                								<img 
                  									className={styles.svgIcon1} 
                  									alt="Search" 
                  									src="/images/arrow.png" 
                  									onClick={handleSearch}
                  									style={{cursor: 'pointer', zIndex: 3}}
                								/>
              							</div>
              							<div className={styles.margin2}>
                								<div className={styles.container11}>
                  									<div className={styles.input1}>
                    										<div className={styles.container12}>
                      											<input
                        												type="text"
                        												placeholder="Location"
                        												value={locationQuery}
                        												onChange={(e) => setLocationQuery(e.target.value)}
                        												onKeyPress={handleSearchKeyPress}
                        												onFocus={() => setIsLocationFocused(true)}
                        												onBlur={() => setIsLocationFocused(false)}
                        												style={{
                          													border: 'none',
                          													outline: 'none',
                          													background: 'transparent',
                          													width: '100%',
                          													height: '100%',
                          													fontSize: '14px',
                          													color: '#333',
                          													fontFamily: 'inherit',
                          													padding: '0',
                          													margin: '0',
                          													position: 'relative',
                          													zIndex: 2
                        												}}
                      											/>
                    										</div>
                    										<div className={styles.container13} />
                  									</div>
                  									<img className={styles.svgIcon2} alt="Arrow" src="/images/arrow.png" />
                								</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.container14}>
            						<div className={styles.container15}>
              							<div className={styles.heading2}>
                								<b className={styles.providersFound}>0 providers found</b>
              							</div>
            						</div>
            						<div className={styles.container16}>
              							<div className={styles.combobox}>
                								<div className={styles.container17}>
                  									<div className={styles.relevance}>Relevance</div>
                								</div>
                								<img className={styles.svgIcon3} alt="Arrow" src="/images/arrow.png" />
              							</div>
              							<div className={styles.margin3}>
                								<div className={styles.border}>
                  									<div className={styles.button} onClick={() => handleListMapToggle('List')} style={{cursor:'pointer'}}>
                    										<div className={styles.messages}>List</div>
                  									</div>
                  									<div className={styles.button1} onClick={() => handleListMapToggle('Map')} style={{cursor:'pointer'}}>
                    										<div className={styles.messages}>Map</div>
                  									</div>
                								</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.container18}>
            						<div className={styles.button2} onClick={handleClearFilters} style={{cursor:'pointer'}}>
              							<div className={styles.messages}>Clear all filters</div>
            						</div>
          					</div>
          					<div className={styles.container19}>
            						<div className={styles.overlaybordershadowoverlayb}>
              							<div className={styles.container20}>
                								<div className={styles.container21}>
                  									<div className={styles.margin4}>
                    										<div className={styles.container22}>
                      											<div className={styles.container23}>
                        												<div className={styles.heading3}>
                          													<div className={styles.sarahJohnson}>No Service Providers Available</div>
                        												</div>
                        												<div className={styles.margin5}>
                          													<div className={styles.backgroundborder}>
                            														<div className={styles.div}>Coming Soon</div>
                          													</div>
                        												</div>
                      											</div>
                      											<div className={styles.container24}>
                        												<div className={styles.discoverTrustedPet}>We're working on connecting you with amazing pet care providers!</div>
                      											</div>
                      											<div className={styles.container25}>
                        												<div className={styles.container1}>
                          													<img className={styles.svgmarginIcon5} alt="Arrow" src="/images/arrow.png" />
                          													<div className={styles.relevance}>Check back soon for local providers</div>
                        												</div>
                        												<div className={styles.margin6}>
                          													<div className={styles.container1}>
                            														<img className={styles.svgmarginIcon5} alt="Arrow" src="/images/arrow.png" />
                            														<div className={styles.relevance}>Be the first to know when we launch</div>
                          													</div>
                        												</div>
                      											</div>
                      											<div className={styles.container29}>
                        												<div className={styles.background2}>
                          													<div className={styles.div}>Dogs</div>
                        												</div>
                        												<div className={styles.background2}>
                          													<div className={styles.div}>Cats</div>
                        												</div>
                        												<div className={styles.background2}>
                          													<div className={styles.div}>Other Pets</div>
                        												</div>
                      											</div>
                      											<div className={styles.container30}>
                        												<div className={styles.experience5Years}>We'll notify you when providers join!</div>
                      											</div>
                    										</div>
                  									</div>
                  									<img className={styles.containerIcon} alt="User" src="/images/user.png" />
                								</div>
                								<div className={styles.container31}>
                  									<div className={styles.link}>
                    										<b className={styles.providersFound}>Stay Tuned!</b>
                  									</div>
                  									<div className={styles.container33}>
                    										<div className={styles.link}>
                      											<div className={styles.button3} onClick={() => alert('We\'ll notify you when booking is available!')} style={{cursor:'pointer'}}>
                        												<div className={styles.messages}>Get Notified</div>
                      											</div>
                    										</div>
                    										<div className={styles.linkmargin4}>
                      											<div className={styles.link}>
                        												<div className={styles.button4} onClick={() => alert('Contact us at support@furmaps.com')} style={{cursor:'pointer'}}>
                          													<img className={styles.svgmarginIcon} alt="Arrow" src="/images/arrow.png" />
                          													<div className={styles.messages}>Contact</div>
                        												</div>
                      											</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
            						</div>
          					</div>
        				</div>
        				<div className={styles.container48} />
      			</div>
    		</div>);
};

export default WPetOwnerDB;
