import styles from './HomepagePetOwner.module.css';
import { useNavigate } from 'react-router-dom';


const WPetOwnerDB = () => {
  	const navigate = useNavigate();

  	const handleLogout = () => {
    		localStorage.clear();
    		// If using supabase, you can also sign out here
    		// supabase.auth.signOut();
    		navigate('/');
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
              							<div className={styles.linkButton}>
                								<img className={styles.svgmarginIcon} alt="Arrow" src="/images/arrow.png" />
                								<div className={styles.messages}>Messages</div>
              							</div>
            						</div>
            						<div className={styles.linkmargin1}>
              							<div className={styles.linkButton}>
                								<img className={styles.svgmarginIcon} alt="Arrow" src="/images/arrow.png" />
                								<div className={styles.messages}>My Bookings</div>
              							</div>
            						</div>
            						<div className={styles.linkmargin2}>
              							<div className={styles.linkButton}>
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
                								<div className={styles.buttonDialog}>
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
                    										<div className={styles.searchServicesOr}>Search services or providers...</div>
                  									</div>
                  									<div className={styles.container10} />
                								</div>
                								<img className={styles.svgIcon1} alt="Arrow" src="/images/arrow.png" />
              							</div>
              							<div className={styles.margin2}>
                								<div className={styles.container11}>
                  									<div className={styles.input1}>
                    										<div className={styles.container12}>
                      											<div className={styles.searchServicesOr}>Location</div>
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
                								<b className={styles.providersFound}>3 providers found</b>
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
                  									<div className={styles.button}>
                    										<div className={styles.messages}>List</div>
                  									</div>
                  									<div className={styles.button1}>
                    										<div className={styles.messages}>Map</div>
                  									</div>
                								</div>
              							</div>
            						</div>
          					</div>
          					<div className={styles.container18}>
            						<div className={styles.button2}>
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
                          													<div className={styles.sarahJohnson}>Sarah Johnson</div>
                        												</div>
                        												<div className={styles.margin5}>
                          													<div className={styles.backgroundborder}>
                            														<div className={styles.div}>Verified</div>
                          													</div>
                        												</div>
                      											</div>
                      											<div className={styles.container24}>
                        												<div className={styles.discoverTrustedPet}>{`Dog Walking & Pet Sitting`}</div>
                      											</div>
                      											<div className={styles.container25}>
                        												<div className={styles.container1}>
                          													<img className={styles.svgmarginIcon5} alt="Arrow" src="/images/arrow.png" />
                          													<div className={styles.relevance}>Downtown, City Center (2.3 mi)</div>
                        												</div>
                        												<div className={styles.margin6}>
                          													<div className={styles.container1}>
                            														<img className={styles.svgmarginIcon5} alt="Arrow" src="/images/arrow.png" />
                            														<div className={styles.relevance}>4.9 (127 reviews)</div>
                          													</div>
                        												</div>
                        												<div className={styles.margin6}>
                          													<div className={styles.container1}>
                            														<img className={styles.svgmarginIcon5} alt="Arrow" src="/images/arrow.png" />
                            														<div className={styles.relevance}>{`< 1 hour`}</div>
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
                      											</div>
                      											<div className={styles.container30}>
                        												<div className={styles.experience5Years}>Experience: 5+ years</div>
                      											</div>
                    										</div>
                  									</div>
                  									<img className={styles.containerIcon} alt="User" src="/images/user.png" />
                								</div>
                								<div className={styles.container31}>
                  									<div className={styles.link}>
                    										<b className={styles.providersFound}>$25/hour</b>
                  									</div>
                  									<div className={styles.container33}>
                    										<div className={styles.link}>
                      											<div className={styles.button3}>
                        												<div className={styles.messages}>Book Now</div>
                      											</div>
                    										</div>
                    										<div className={styles.linkmargin4}>
                      											<div className={styles.link}>
                        												<div className={styles.button4}>
                          													<img className={styles.svgmarginIcon} alt="Arrow" src="/images/arrow.png" />
                          													<div className={styles.messages}>Message</div>
                        												</div>
                      											</div>
                    										</div>
                  									</div>
                								</div>
              							</div>
            						</div>
            						<div className={styles.overlaybordershadowoverlayb}>
              							<div className={styles.container20}>
                								<div className={styles.container35}>
                  									<div className={styles.margin4}>
                    										<div className={styles.container22}>
                      											<div className={styles.container23}>
                        												<div className={styles.heading3}>
                          													<div className={styles.sarahJohnson}>Mike Chen</div>
                        												</div>
                        												<div className={styles.margin5}>
                          													<div className={styles.backgroundborder}>
                            														<div className={styles.div}>Verified</div>
                          													</div>
                        												</div>
                      											</div>
                      											<div className={styles.container24}>
                        												<div className={styles.discoverTrustedPet}>Pet Grooming</div>
                      											</div>
                      											<div className={styles.container25}>
                        												<div className={styles.container1}>
                          													<img className={styles.svgmarginIcon5} alt="Arrow" src="/images/arrow.png" />
                          													<div className={styles.relevance}>Westside, Mall Area (4.1 mi)</div>
                        												</div>
                        												<div className={styles.margin6}>
                          													<div className={styles.container1}>
                            														<img className={styles.svgmarginIcon5} alt="Arrow" src="/images/arrow.png" />
                            														<div className={styles.relevance}>4.8 (89 reviews)</div>
                          													</div>
                        												</div>
                        												<div className={styles.margin6}>
                          													<div className={styles.container1}>
                            														<img className={styles.svgmarginIcon5} alt="Arrow" src="/images/arrow.png" />
                            														<div className={styles.relevance}>{`< 2 hours`}</div>
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
                          													<div className={styles.div}>Rabbits</div>
                        												</div>
                      											</div>
                      											<div className={styles.container30}>
                        												<div className={styles.experience5Years}>Experience: 3-5 years</div>
                      											</div>
                    										</div>
                  									</div>
                  									<img className={styles.containerIcon} alt="User" src="/images/user.png" />
                								</div>
                								<div className={styles.container31}>
                  									<div className={styles.link}>
                    										<b className={styles.providersFound}>$40/session</b>
                  									</div>
                  									<div className={styles.container33}>
                    										<div className={styles.link}>
                      											<div className={styles.button3}>
                        												<div className={styles.messages}>Book Now</div>
                      											</div>
                    										</div>
                    										<div className={styles.linkmargin4}>
                      											<div className={styles.link}>
                        												<div className={styles.buttonDialog}>
                          													<img className={styles.svgmarginIcon} alt="Arrow" src="/images/arrow.png" />
                          													<div className={styles.messages}>Message</div>
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
