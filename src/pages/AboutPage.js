import styles from './WAboutPage.module.css';
import { Helmet } from "react-helmet";


const WAboutPage = () => {
	return (
  <>
    <Helmet>
      <link href="https://fonts.googleapis.com/css2?family=Geist&display=swap" rel="stylesheet" />
    </Helmet>
		<div className={styles.wAboutPage}>
<div className={styles.header}>
  <div className={styles.container}>
    <div className={styles.link}>
      <img className={styles.backgroundIcon} alt="" src="/Images/gps.png" />
      <div className={styles.margin}>
        <b className={styles.furmaps}>FurMaps</b>
      </div>
    </div>

    <div className={styles.container1}>
      {/* Login Button */}
      <div className={styles.list}>
        <a href="/LoginUser" className={styles.button}>
          <div className={styles.login}>Login</div>
        </a>
      </div>

      {/* Get Started Button */}
      <div className={styles.linkmargin}>
        <div className={styles.link2}>
          <a href="/RegisterUser" className={styles.button1}>
            <div className={styles.login}>Get Started</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

			<div className={styles.section}>
				<div className={styles.container2}>
					<div className={styles.heading1}>
						<b className={styles.aboutFurmaps}>About FurMaps</b>
					</div>
					<div className={styles.container3}>
						<div className={styles.werePassionateAboutContainer}>
							<p className={styles.werePassionateAbout}>We're passionate about connecting pet owners with trusted, verified service</p>
							<p className={styles.werePassionateAbout}>providers to ensure every furry friend gets the best care possible.</p>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.section1}>
				<div className={styles.container4}>
					<div className={styles.container5}>
						<div className={styles.container6}>
							<div className={styles.heading2}>
								<b className={styles.ourMission}>Our Mission</b>
							</div>
							<div className={styles.container7}>
								<div className={styles.atFurmapsWeContainer}>
									<p className={styles.werePassionateAbout}>At FurMaps, we believe every pet deserves exceptional care. Our mission is</p>
									<p className={styles.werePassionateAbout}>to create a trusted platform that connects loving pet owners with verified,</p>
									<p className={styles.werePassionateAbout}>professional service providers in their local area.</p>
								</div>
							</div>
							<div className={styles.container7}>
								<div className={styles.atFurmapsWeContainer}>
									<p className={styles.werePassionateAbout}>We understand that your pets are family members, and finding reliable care</p>
									<p className={styles.werePassionateAbout}>shouldn't be stressful. That's why we've built a comprehensive verification</p>
									<p className={styles.werePassionateAbout}>system and user-friendly platform to make pet care services accessible,</p>
									<p className={styles.werePassionateAbout}>transparent, and trustworthy.</p>
								</div>
							</div>
							<div className={styles.container9}>
								<img className={styles.backgroundIcon1} alt="" src="/Images/ourgoal.svg" />
								<div className={styles.margin1}>
									<div className={styles.container10}>
										<div className={styles.heading3}>
											<div className={styles.ourGoal}>Our Goal</div>
										</div>
										<div className={styles.container11}>
											<div className={styles.buildingTheMost}>Building the most trusted pet care network</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className={styles.overlayborderoverlayblur}>
							<div className={styles.container12}>
								<img className={styles.backgroundIcon2} alt="" src="/Images/gps.png" />
								<div className={styles.heading31}>
									<b className={styles.howFurmapsWorks}>How FurMaps Works</b>
								</div>
								<div className={styles.background}>
									<div className={styles.container13}>
										<b className={styles.howFurmapsWorks}>1</b>
									</div>
								</div>
								<div className={styles.background1}>
									<div className={styles.container13}>
										<b className={styles.howFurmapsWorks}>2</b>
									</div>
								</div>
								<div className={styles.background2}>
									<div className={styles.container13}>
										<b className={styles.howFurmapsWorks}>3</b>
									</div>
								</div>
								<div className={styles.searchDiscover}>{`Search & Discover`}</div>
								<div className={styles.bookConnect}>{`Book & Connect`}</div>
								<div className={styles.enjoyReview}>{`Enjoy & Review`}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.section2}>
				<div className={styles.container16}>
					<div className={styles.container17} />
					<div className={styles.heading21} />
					<div className={styles.container18}>
						<div className={styles.overlaybordershadowoverlayb}>
							<div className={styles.container19}>
								<img className={styles.marginIcon} alt="" src="/Images/tweetie.svg" />
								<div className={styles.heading3margin}>
									<div className={styles.heading32}>
										<div className={styles.heading3Child} />
									</div>
								</div>
								<div className={styles.tweetieMZapanta}>Tweetie M. Zapanta</div>
								<div className={styles.projectManager}>Project Manager</div>
							</div>
							<div className={styles.keepsEveryoneOnTrackBridgWrapper}>
								<div className={styles.keepsEveryoneOn}>Keeps everyone on track, bridges ideas into action, and makes sure the project stays true to its vision.</div>
							</div>
						</div>
						<div className={styles.overlaybordershadowoverlayb1}>
							<div className={styles.container19}>
								<img className={styles.marginIcon} alt="" src="/Images/adharra.svg" />
								<div className={styles.heading3margin}>
									<div className={styles.heading32}>
										<div className={styles.heading3Child} />
									</div>
								</div>
								<div className={styles.tweetieMZapanta}>Adharra P. Alo</div>
								<div className={styles.projectManager}>Software Developer</div>
							</div>
							<div className={styles.keepsEveryoneOnTrackBridgWrapper}>
								<div className={styles.keepsEveryoneOn}>Crafts the user-facing side, turning designs into responsive and interactive experiences.</div>
							</div>
						</div>
						<div className={styles.overlaybordershadowoverlayb2}>
							<div className={styles.container19}>
								<img className={styles.marginIcon} alt="" src="/Images/marvy.svg" />
								<div className={styles.heading3margin}>
									<div className={styles.heading32}>
										<div className={styles.heading3Child} />
									</div>
								</div>
								<div className={styles.tweetieMZapanta}>Marvy M. Buot</div>
								<div className={styles.projectManager}>UI/UX Developer</div>
							</div>
							<div className={styles.keepsEveryoneOnTrackBridgWrapper}>
								<div className={styles.keepsEveryoneOn}>Designs clean, user-friendly interfaces and makes sure the platform feels intuitive and easy to use.</div>
							</div>
						</div>
						<div className={styles.overlaybordershadowoverlayb3}>
							<div className={styles.container19}>
								<img className={styles.marginIcon} alt="" src="/Images/aldrich.svg" />
								<div className={styles.heading3margin}>
									<div className={styles.heading32}>
										<div className={styles.heading3Child} />
									</div>
								</div>
								<div className={styles.tweetieMZapanta}>Aldrich A. Segura</div>
								<div className={styles.projectManager}>Full Stack Developer</div>
							</div>
							<div className={styles.keepsEveryoneOnTrackBridgWrapper}>
								<div className={styles.keepsEveryoneOn}>Brings the platform to life from front to back, making sure everything works seamlessly for users.</div>
							</div>
						</div>
						<div className={styles.overlaybordershadowoverlayb4}>
							<div className={styles.container19}>
								<img className={styles.marginIcon} alt="" src="/Images/ness.svg" />
								<div className={styles.heading3margin}>
									<div className={styles.heading32}>
										<div className={styles.heading3Child} />
									</div>
								</div>
								<div className={styles.tweetieMZapanta}>Nesserain C. De La Cruz</div>
								<div className={styles.projectManager}>Quality Assurance</div>
							</div>
							<div className={styles.keepsEveryoneOnTrackBridgWrapper}>
								<div className={styles.keepsEveryoneOn}>Tests every feature with care, catching bugs and ensuring everything runs smoothly before launch.</div>
							</div>
						</div>
						<div className={styles.overlaybordershadowoverlayb5}>
							<div className={styles.container19}>
								<img className={styles.marginIcon} alt="" src="/Images/mon.svg" />
								<div className={styles.heading3margin}>
									<div className={styles.heading32}>
										<div className={styles.heading3Child} />
									</div>
								</div>
								<div className={styles.tweetieMZapanta}>Mon Vencie Q. Medalla</div>
								<div className={styles.projectManager}>Backend Developer</div>
							</div>
							<div className={styles.keepsEveryoneOnTrackBridgWrapper}>
								<div className={styles.keepsEveryoneOn}>Builds the backbone of the app, handling data, servers, and everything behind the scenes.</div>
							</div>
						</div>
						<div className={styles.wereATeamContainer}>
							<p className={styles.werePassionateAbout}>{`We're a team of students and animal lovers building a platform to help pet owners find trusted care, `}</p>
							<p className={styles.werePassionateAbout}> making pet services simpler, safer, and more accessible.</p>
						</div>
						<b className={styles.meetTheTeam}>Meet the Team</b>
					</div>
					<div className={styles.container25}>
						<div className={styles.heading38} />
						<div className={styles.container26}>
							<div className={styles.container27} />
							<div className={styles.container27} />
							<div className={styles.container27}>
								<div className={styles.margin2} />
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.section3}>
				<div className={styles.container30}>
					<div className={styles.container31} />
					<div className={styles.heading21} />
					<div className={styles.container32}>
						<div className={styles.overlaybordershadowoverlayb6}>
							<div className={styles.container33}>
								<img className={styles.marginIcon6} alt="" src="/Images/petsitting.svg" />
								<div className={styles.heading3margin6}>
									<div className={styles.heading3}>
										<div className={styles.petSitting}>Pet Sitting</div>
									</div>
								</div>
							</div>
							<div className={styles.container34}>
								<div className={styles.list}>
									<div className={styles.trustedCaregiversWhoContainer}>
										<p className={styles.werePassionateAbout}>Trusted caregivers who provide loving attention to your</p>
										<p className={styles.werePassionateAbout}>pets in the comfort of your own home.</p>
									</div>
								</div>
								<div className={styles.list}>
									<div className={styles.item} />
								</div>
							</div>
						</div>
						<div className={styles.overlaybordershadowoverlayb7}>
							<div className={styles.container33}>
								<img className={styles.marginIcon6} alt="" src="/Images/dogwalking.svg" />
								<div className={styles.heading3margin6}>
									<div className={styles.heading3}>
										<div className={styles.petSitting}>Dog Walking</div>
									</div>
								</div>
							</div>
							<div className={styles.container34}>
								<div className={styles.list}>
									<div className={styles.trustedCaregiversWhoContainer}>
										<p className={styles.werePassionateAbout}>Professional dog walkers who ensure your pup gets the</p>
										<p className={styles.werePassionateAbout}>exercise and attention they need.</p>
									</div>
								</div>
								<div className={styles.list}>
									<div className={styles.item} />
								</div>
							</div>
						</div>
						<div className={styles.overlaybordershadowoverlayb8}>
							<div className={styles.container33}>
								<img className={styles.marginIcon6} alt="" src="/Images/petgrooming.svg" />
								<div className={styles.heading3margin6}>
									<div className={styles.heading3}>
										<div className={styles.petSitting}>Pet Grooming</div>
									</div>
								</div>
							</div>
							<div className={styles.container34}>
								<div className={styles.list}>
									<div className={styles.trustedCaregiversWhoContainer}>
										<p className={styles.werePassionateAbout}>Professional grooming services to keep your pets looking</p>
										<p className={styles.werePassionateAbout}>and feeling their best.</p>
									</div>
								</div>
								<div className={styles.list}>
									<div className={styles.item} />
								</div>
							</div>
						</div>
						<div className={styles.overlaybordershadowoverlayb9}>
							<div className={styles.container33}>
								<img className={styles.marginIcon6} alt="" src="/Images/pettraining.svg" />
								<div className={styles.heading3margin6}>
									<div className={styles.heading3}>
										<div className={styles.petSitting}>Pet Training</div>
									</div>
								</div>
							</div>
							<div className={styles.container34}>
								<div className={styles.list}>
									<div className={styles.trustedCaregiversWhoContainer}>
										<p className={styles.werePassionateAbout}>Certified trainers who help develop good behavior and</p>
										<p className={styles.werePassionateAbout}>strengthen the bond with your pet.</p>
									</div>
								</div>
								<div className={styles.list}>
									<div className={styles.item} />
								</div>
							</div>
						</div>
						<div className={styles.overlaybordershadowoverlayb10}>
							<div className={styles.container33}>
								<img className={styles.marginIcon6} alt="" src="/Images/petboarding.svg" />
								<div className={styles.heading3margin6}>
									<div className={styles.heading3}>
										<div className={styles.petSitting}>Pet Boarding</div>
									</div>
								</div>
							</div>
							<div className={styles.container34}>
								<div className={styles.list}>
									<div className={styles.trustedCaregiversWhoContainer}>
										<p className={styles.werePassionateAbout}>Safe, comfortable boarding facilities where your pets</p>
										<p className={styles.werePassionateAbout}>receive personalized care while you're away.</p>
									</div>
								</div>
								<div className={styles.list}>
									<div className={styles.item} />
								</div>
							</div>
						</div>
						<div className={styles.connectWithVerifiedContainer}>
							<p className={styles.werePassionateAbout}>Connect with verified professionals offering a wide range of pet care services to keep your</p>
							<p className={styles.werePassionateAbout}>furry friends happy and healthy.</p>
						</div>
						<b className={styles.meetTheTeam}>Services Available on FurMaps</b>
					</div>
					<div className={styles.background3}>
						<div className={styles.heading1}>
							<b className={styles.additionalSpecializedService}>Additional Specialized Services</b>
						</div>
						<div className={styles.container48}>
							<div className={styles.container49}>
								<img className={styles.backgroundIcon3} alt="" src="/Images/petphot.svg" />
								<div className={styles.heading4}>
									<div className={styles.ourGoal}>Pet Photography</div>
								</div>
								<div className={styles.container50}>
									<div className={styles.professionalPhotosTo}>Professional photos to capture precious moments</div>
								</div>
							</div>
							<div className={styles.container49}>
								<img className={styles.backgroundIcon3} alt="" src="/Images/petmas.svg" />
								<div className={styles.heading41}>
									<div className={styles.ourGoal}>Pet Massage</div>
								</div>
								<div className={styles.container50}>
									<div className={styles.professionalPhotosTo}>Therapeutic massage for senior pets and recovery</div>
								</div>
							</div>
						</div>
					</div>
					<div className={styles.container53}>
						<div className={styles.heading1}>
							<b className={styles.additionalSpecializedService}>Quality Assurance</b>
						</div>
						<div className={styles.container54}>
							<div className={styles.container27}>
								<img className={styles.marginIcon11} alt="" src="/Images/verpro.svg" />
								<div className={styles.heading4margin}>
									<div className={styles.heading42}>
										<div className={styles.ourGoal}>Verified Providers</div>
									</div>
								</div>
								<div className={styles.container56}>
									<div className={styles.buildingTheMost}>
										<p className={styles.werePassionateAbout}>All service providers undergo thorough background</p>
										<p className={styles.werePassionateAbout}>checks and verification</p>
									</div>
								</div>
							</div>
							<div className={styles.container27}>
								<img className={styles.marginIcon11} alt="" src="/Images/license.svg" />
								<div className={styles.heading4margin1}>
									<div className={styles.heading43}>
										<div className={styles.ourGoal}>{`Licensed & Insured`}</div>
									</div>
								</div>
								<div className={styles.container58}>
									<div className={styles.buildingTheMost}>
										<p className={styles.werePassionateAbout}>Professional credentials, licenses, and insurance</p>
										<p className={styles.werePassionateAbout}>coverage verified</p>
									</div>
								</div>
							</div>
							<div className={styles.container27}>
								<img className={styles.margin2} alt="" src="/Images/starrev.svg" />
								<div className={styles.heading4margin2}>
									<div className={styles.heading44}>
										<div className={styles.ourGoal}>5-Star Reviews</div>
									</div>
								</div>
								<div className={styles.container60}>
									<div className={styles.buildingTheMost}>
										<p className={styles.werePassionateAbout}>Real reviews from pet parents help maintain service</p>
										<p className={styles.werePassionateAbout}>excellence</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.section4}>
				<div className={styles.container61} />
			</div>
			<div className={styles.section5}>
				<div className={styles.container4}>
					<div className={styles.background4}>
						<div className={styles.container63}>
							<div className={styles.heading23}>
								<b className={styles.joinTheFurmaps}>Join the FurMaps Community</b>
							</div>
							<div className={styles.container64}>
								<div className={styles.werePassionateAboutContainer}>
									<p className={styles.werePassionateAbout}>Connect with trusted pet care professionals or grow your pet service</p>
									<p className={styles.werePassionateAbout}>business. Your furry friends deserve the best care possible.</p>
								</div>
							</div>
							<div className={styles.container65}>
								<div className={styles.overlayborderoverlayblur1}>
									<img className={styles.overlayIcon} alt="" src="/Images/medall.svg" />
									<div className={styles.heading316}>
										<div className={styles.petOwners}>Pet Owners</div>
									</div>
									<div className={styles.container66}>
										<div className={styles.buildingTheMost}>Find trusted, verified pet care services in your area</div>
									</div>
									<div className={styles.list5}>
										<div className={styles.heading1}>
											<div className={styles.trustedCaregiversWhoContainer}>• Browse verified service providers</div>
										</div>
										<div className={styles.heading1}>
											<div className={styles.trustedCaregiversWhoContainer}>• Read reviews from other pet parents</div>
										</div>
										<div className={styles.heading1}>
											<div className={styles.trustedCaregiversWhoContainer}>• Book and manage appointments</div>
										</div>
										<div className={styles.heading1}>
											<div className={styles.trustedCaregiversWhoContainer}>• Direct messaging with providers</div>
										</div>
									</div>
<a href="/RegisterUser" className={styles.linkButton}>
  <div className={styles.buttonText}>Find Pet Care</div>
</a>
								</div>
								<div className={styles.overlayborderoverlayblur1}>
									<img className={styles.overlayIcon} alt="" src="/Images/heartt.svg" />
									<div className={styles.heading316}>
										<div className={styles.petOwners}>Service Providers</div>
									</div>
									<div className={styles.container66}>
										<div className={styles.buildingTheMost}>
											<p className={styles.werePassionateAbout}>Grow your pet care business with our trusted</p>
											<p className={styles.werePassionateAbout}>platform</p>
										</div>
									</div>
									<div className={styles.list6}>
										<div className={styles.heading1}>
											<div className={styles.trustedCaregiversWhoContainer}>• Reach more pet families</div>
										</div>
										<div className={styles.heading1}>
											<div className={styles.trustedCaregiversWhoContainer}>• Manage bookings and calendar</div>
										</div>
										<div className={styles.heading1}>
											<div className={styles.trustedCaregiversWhoContainer}>• Build your professional reputation</div>
										</div>
										<div className={styles.heading1}>
											<div className={styles.trustedCaregiversWhoContainer}>• Secure payment processing</div>
										</div>
									</div>
<a href="/RegisterUser" className={styles.linkButton1}>
  <div className={styles.buttonTextAlt}>Start Your Business</div>
</a>
								</div>
							</div>
<div className={styles.horizontalborder}>
  <div className={styles.heading23}><div className={styles.alreadyPartOf}>Already part of the FurMaps family?</div></div>
  <a href="/LoginUser" className={styles.linkButton2} style={{ textDecoration: 'none' }}>
    <div className={styles.findPetCare}>Sign In to Your Account</div>
  </a>
</div>

						</div>
					</div>
				</div>
			</div>
			<div className={styles.footer}>
				<div className={styles.container69}>
					<div className={styles.link3}>
						<img className={styles.backgroundIcon5} alt="" src="/Images/gps.png" />
						<div className={styles.margin}>
							<div className={styles.container13}>
								<b className={styles.werePassionateAboutContainer}>FurMaps</b>
							</div>
						</div>
					</div>
					<div className={styles.container71}>
						<div className={styles.linkmargin1}>
							<a className={styles.link5} href="/AboutPage">About</a>
						</div>
						<div className={styles.linkmargin1}>
							<a className={styles.link5} href="/RegisterUser">Get Started</a>
						</div>
						<div className={styles.linkmargin1}>
							<a className={styles.link5} href="/LoginUser">Login</a>
						</div>
					</div>

					<div className={styles.heading23}>
						<div className={styles.alreadyPartOf}>© 2024 FurMaps. All rights reserved.</div>
					</div>
				</div>
			</div>
		</div>;

  </>
);
}
export default WAboutPage;
