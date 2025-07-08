import styles from './WAboutPage.module.css';
import { Helmet } from "react-helmet";


const WAboutPage = () => {
	return (
  <>
    <Helmet>
      <link href="https://fonts.googleapis.com/css2?family=Geist&display=swap" rel="stylesheet" />
    </Helmet>
		<div className={styles.wAboutPage}>
			{/* Header */}
			<div className={styles.headerSection}>
				<div className={styles.headerContainer}>
					<div className={styles.logoRow}>
						<img className={styles.backgroundIcon} alt="" src="/Images/gps.png" />
						<div className={styles.margin}><b className={styles.furmaps}>FurMaps</b></div>
					</div>
					<div className={styles.headerActions}>
						<a href="/LoginUser" className={styles.button}><div className={styles.login}>Login</div></a>
						<a href="/RegisterUser" className={styles.button1}><div className={styles.login}>Get Started</div></a>
					</div>
				</div>
			</div>

			{/* About Section */}
			<div className={styles.sectionAbout}>
				<div className={styles.sectionContainer}>
					<b className={styles.aboutFurmaps}>About FurMaps</b>
					<div className={styles.werePassionateAboutContainer}>
						<p className={styles.werePassionateAbout}>We're passionate about connecting pet owners with trusted, verified service providers to ensure every furry friend gets the best care possible.</p>
					</div>
				</div>
			</div>

			{/* Mission & How It Works Section */}
			<div className={styles.sectionMissionHow}>
				<div className={styles.missionHowGrid}>
					<div className={styles.missionBlock}>
						<b className={styles.ourMission}>Our Mission</b>
						<div className={styles.atFurmapsWeContainer}>
							<p className={styles.werePassionateAbout}>At FurMaps, we believe every pet deserves exceptional care. Our mission is to create a trusted platform that connects loving pet owners with verified, professional service providers in their local area.</p>
							<p className={styles.werePassionateAbout}>We understand that your pets are family members, and finding reliable care shouldn't be stressful. That's why we've built a comprehensive verification system and user-friendly platform to make pet care services accessible, transparent, and trustworthy.</p>
						</div>
						<div className={styles.goalBlock}>
							<img className={styles.backgroundIcon1} alt="" src="/Images/ourgoal.svg" />
							<div>
								<div className={styles.ourGoal}>Our Goal</div>
								<div className={styles.buildingTheMost}>Building the most trusted pet care network</div>
							</div>
						</div>
					</div>
					<div className={styles.howItWorksBlock}>
						<img className={styles.backgroundIcon2} alt="" src="/Images/gps.png" />
						<b className={styles.howFurmapsWorks}>How FurMaps Works</b>
						<div className={styles.howStepsGrid}>
							<div className={styles.howStep}><b>1</b><span>Search & Discover</span></div>
							<div className={styles.howStep}><b>2</b><span>Book & Connect</span></div>
							<div className={styles.howStep}><b>3</b><span>Enjoy & Review</span></div>
						</div>
					</div>
				</div>
			</div>

			{/* Team Section */}
			<div className={styles.sectionTeam}>
				<b className={styles.meetTheTeam}>Meet the Team</b>
				<div className={styles.teamGrid}>
					{/* Each team member card */}
					<div className={styles.teamCard}><img src="/Images/tweetie.svg" alt="" /><div><div className={styles.teamName}>Tweetie M. Zapanta</div><div className={styles.teamRole}>Project Manager</div><div className={styles.teamDesc}>Keeps everyone on track, bridges ideas into action, and makes sure the project stays true to its vision.</div></div></div>
					<div className={styles.teamCard}><img src="/Images/adharra.svg" alt="" /><div><div className={styles.teamName}>Adharra P. Alo</div><div className={styles.teamRole}>Software Developer</div><div className={styles.teamDesc}>Crafts the user-facing side, turning designs into responsive and interactive experiences.</div></div></div>
					<div className={styles.teamCard}><img src="/Images/marvy.svg" alt="" /><div><div className={styles.teamName}>Marvy M. Buot</div><div className={styles.teamRole}>UI/UX Developer</div><div className={styles.teamDesc}>Designs clean, user-friendly interfaces and makes sure the platform feels intuitive and easy to use.</div></div></div>
					<div className={styles.teamCard}><img src="/Images/aldrich.svg" alt="" /><div><div className={styles.teamName}>Aldrich A. Segura</div><div className={styles.teamRole}>Full Stack Developer</div><div className={styles.teamDesc}>Brings the platform to life from front to back, making sure everything works seamlessly for users.</div></div></div>
					<div className={styles.teamCard}><img src="/Images/ness.svg" alt="" /><div><div className={styles.teamName}>Nesserain C. De La Cruz</div><div className={styles.teamRole}>Quality Assurance</div><div className={styles.teamDesc}>Tests every feature with care, catching bugs and ensuring everything runs smoothly before launch.</div></div></div>
					<div className={styles.teamCard}><img src="/Images/mon.svg" alt="" /><div><div className={styles.teamName}>Mon Vencie Q. Medalla</div><div className={styles.teamRole}>Backend Developer</div><div className={styles.teamDesc}>Builds the backbone of the app, handling data, servers, and everything behind the scenes.</div></div></div>
				</div>
				<div className={styles.teamNote}><p>We're a team of students and animal lovers building a platform to help pet owners find trusted care, making pet services simpler, safer, and more accessible.</p></div>
			</div>

			{/* Services Section */}
			<div className={styles.sectionServices}>
				<b className={styles.meetTheTeam}>Services Available on FurMaps</b>
				<div className={styles.servicesGrid}>
					<div className={styles.serviceCard}><img src="/Images/petsitting.svg" alt="" /><div className={styles.serviceTitle}>Pet Sitting</div><div className={styles.serviceDesc}>Trusted caregivers who provide loving attention to your pets in the comfort of your own home.</div></div>
					<div className={styles.serviceCard}><img src="/Images/dogwalking.svg" alt="" /><div className={styles.serviceTitle}>Dog Walking</div><div className={styles.serviceDesc}>Professional dog walkers who ensure your pup gets the exercise and attention they need.</div></div>
					<div className={styles.serviceCard}><img src="/Images/petgrooming.svg" alt="" /><div className={styles.serviceTitle}>Pet Grooming</div><div className={styles.serviceDesc}>Professional grooming services to keep your pets looking and feeling their best.</div></div>
					<div className={styles.serviceCard}><img src="/Images/pettraining.svg" alt="" /><div className={styles.serviceTitle}>Pet Training</div><div className={styles.serviceDesc}>Certified trainers who help develop good behavior and strengthen the bond with your pet.</div></div>
					<div className={styles.serviceCard}><img src="/Images/petboarding.svg" alt="" /><div className={styles.serviceTitle}>Pet Boarding</div><div className={styles.serviceDesc}>Safe, comfortable boarding facilities where your pets receive personalized care while you're away.</div></div>
				</div>
				<div className={styles.connectWithVerifiedContainer}><p>Connect with verified professionals offering a wide range of pet care services to keep your furry friends happy and healthy.</p></div>
				<div className={styles.additionalServicesGrid}>
					<div className={styles.additionalServiceCard}><img src="/Images/petphot.svg" alt="" /><div className={styles.additionalServiceTitle}>Pet Photography</div><div className={styles.additionalServiceDesc}>Professional photos to capture precious moments</div></div>
					<div className={styles.additionalServiceCard}><img src="/Images/petmas.svg" alt="" /><div className={styles.additionalServiceTitle}>Pet Massage</div><div className={styles.additionalServiceDesc}>Therapeutic massage for senior pets and recovery</div></div>
				</div>
			</div>

			{/* Quality Assurance Section */}
			<div className={styles.sectionQuality}>
				<b className={styles.additionalSpecializedService}>Quality Assurance</b>
				<div className={styles.qualityGrid}>
					<div className={styles.qualityCard}><img src="/Images/verpro.svg" alt="" /><div className={styles.qualityTitle}>Verified Providers</div><div className={styles.qualityDesc}>All service providers undergo thorough background checks and verification</div></div>
					<div className={styles.qualityCard}><img src="/Images/license.svg" alt="" /><div className={styles.qualityTitle}>Licensed & Insured</div><div className={styles.qualityDesc}>Professional credentials, licenses, and insurance coverage verified</div></div>
					<div className={styles.qualityCard}><img src="/Images/starrev.svg" alt="" /><div className={styles.qualityTitle}>5-Star Reviews</div><div className={styles.qualityDesc}>Real reviews from pet parents help maintain service excellence</div></div>
				</div>
			</div>

			{/* Join Community Section */}
			<div className={styles.sectionJoin}>
				<div className={styles.background4}>
					<div className={styles.joinGrid}>
						<div className={styles.joinCard}>
							<img className={styles.overlayIcon} alt="" src="/Images/medall.svg" />
							<div className={styles.heading316}><div className={styles.petOwners}>Pet Owners</div></div>
							<div className={styles.container66}><div className={styles.buildingTheMost}>Find trusted, verified pet care services in your area</div></div>
							<div className={styles.list5}><div className={styles.heading1}><div className={styles.trustedCaregiversWhoContainer}>• Browse verified service providers</div></div><div className={styles.heading1}><div className={styles.trustedCaregiversWhoContainer}>• Read reviews from other pet parents</div></div><div className={styles.heading1}><div className={styles.trustedCaregiversWhoContainer}>• Book and manage appointments</div></div><div className={styles.heading1}><div className={styles.trustedCaregiversWhoContainer}>• Direct messaging with providers</div></div></div>
							<a href="/RegisterUser" className={styles.linkButton}><div className={styles.buttonText}>Find Pet Care</div></a>
						</div>
						<div className={styles.joinCard}>
							<img className={styles.overlayIcon} alt="" src="/Images/heartt.svg" />
							<div className={styles.heading316}><div className={styles.petOwners}>Service Providers</div></div>
							<div className={styles.container66}><div className={styles.buildingTheMost}><p className={styles.werePassionateAbout}>Grow your pet care business with our trusted</p><p className={styles.werePassionateAbout}>platform</p></div></div>
							<div className={styles.list6}><div className={styles.heading1}><div className={styles.trustedCaregiversWhoContainer}>• Reach more pet families</div></div><div className={styles.heading1}><div className={styles.trustedCaregiversWhoContainer}>• Manage bookings and calendar</div></div><div className={styles.heading1}><div className={styles.trustedCaregiversWhoContainer}>• Build your professional reputation</div></div><div className={styles.heading1}><div className={styles.trustedCaregiversWhoContainer}>• Secure payment processing</div></div></div>
							<a href="/RegisterUser" className={styles.linkButton1}><div className={styles.buttonTextAlt}>Start Your Business</div></a>
						</div>
					</div>
					<div className={styles.horizontalborder}>
						<div className={styles.heading23}><div className={styles.alreadyPartOf}>Already part of the FurMaps family?</div></div>
						<a href="/LoginUser" className={styles.linkButton2} style={{ textDecoration: 'none' }}><div className={styles.findPetCare}>Sign In to Your Account</div></a>
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className={styles.footerSection}>
				<div className={styles.footerContainer}>
					<div className={styles.footerLogoRow}>
						<img className={styles.backgroundIcon5} alt="" src="/Images/gps.png" />
						<div className={styles.margin}><b className={styles.werePassionateAboutContainer}>FurMaps</b></div>
					</div>
					{/*<div className={styles.footerLinks}>
						<a className={styles.link5} href="/AboutPage">About</a>
						<a className={styles.link5} href="/RegisterUser">Get Started</a>
						<a className={styles.link5} href="/LoginUser">Login</a>
					</div>*/}
					<div className={styles.footerCopyright}><div className={styles.alreadyPartOf}>© 2024 FurMaps. All rights reserved.</div></div>
				</div>
			</div>
		</div>
	</>
);
}
export default WAboutPage;
