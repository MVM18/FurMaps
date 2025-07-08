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
        <header className={styles.headerSection}>
          <div className={styles.headerContainer}>
            <div className={styles.logoRow}>
              <img className={styles.logoIcon} src="/Images/gps.png" alt="FurMaps Logo" />
              <h1 className={styles.logoText}>FurMaps</h1>
            </div>
            <div className={styles.headerActions}>
              <a href="/LoginUser" className={styles.loginButton}>Login</a>
              <a href="/RegisterUser" className={styles.getStartedButton}>Get Started</a>
            </div>
          </div>
        </header>

        {/* About Section */}
        <section className={styles.sectionAbout}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>About FurMaps</h2>
            <p className={styles.sectionDescription}>
              We're passionate about connecting pet owners with trusted, verified service providers to ensure every furry friend gets the best care possible.
            </p>
          </div>
        </section>

        {/* Mission & How It Works Section */}
        <section className={styles.sectionMissionHow}>
          <div className={styles.missionHowGrid}>
            <div className={styles.missionBlock}>
              <h3 className={styles.blockTitle}>Our Mission</h3>
              <div className={styles.missionContent}>
                <p>
                  At FurMaps, we believe every pet deserves exceptional care. Our mission is to create a trusted platform that connects loving pet owners with verified, professional service providers in their local area.
                </p>
                <p>
                  We understand that your pets are family members, and finding reliable care shouldn't be stressful. That's why we've built a comprehensive verification system and user-friendly platform to make pet care services accessible, transparent, and trustworthy.
                </p>
              </div>
              <div className={styles.goalBlock}>
                <img src="/Images/ourgoal.svg" alt="Our Goal" />
                <div>
                  <h4>Our Goal</h4>
                  <p>Building the most trusted pet care network</p>
                </div>
              </div>
            </div>
            
            <div className={styles.howItWorksBlock}>
              <img src="/Images/gps.png" alt="How It Works" />
              <h3 className={styles.blockTitle}>How FurMaps Works</h3>
              <div className={styles.howStepsGrid}>
                <div className={styles.howStep}>
                  <span>1</span>
                  <p>Search & Discover</p>
                </div>
                <div className={styles.howStep}>
                  <span>2</span>
                  <p>Book & Connect</p>
                </div>
                <div className={styles.howStep}>
                  <span>3</span>
                  <p>Enjoy & Review</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className={styles.sectionTeam}>
          <h2 className={styles.sectionTitle}>Meet the Team</h2>
          <p className={styles.teamIntro}>
            We're a team of students and animal lovers building a platform to help pet owners find trusted care, making pet services simpler, safer, and more accessible.
          </p>
          
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.teamCard}>
                <img src={member.image} alt={member.name} />
                <h3>{member.name}</h3>
                <p className={styles.teamRole}>{member.role}</p>
                <p className={styles.teamDesc}>{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className={styles.sectionServices}>
          <h2 className={styles.sectionTitle}>Services Available on FurMaps</h2>
          <p className={styles.sectionDescription}>
            Connect with verified professionals offering a wide range of pet care services to keep your furry friends happy and healthy.
          </p>
          
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <div key={index} className={styles.serviceCard}>
                <img src={service.image} alt={service.title} />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
          
          <h3 className={styles.subsectionTitle}>Additional Specialized Services</h3>
          <div className={styles.additionalServicesGrid}>
            {additionalServices.map((service, index) => (
              <div key={index} className={styles.additionalServiceCard}>
                <img src={service.image} alt={service.title} />
                <h4>{service.title}</h4>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quality Assurance Section */}
        <section className={styles.sectionQuality}>
          <h2 className={styles.sectionTitle}>Quality Assurance</h2>
          <div className={styles.qualityGrid}>
            {qualityFeatures.map((feature, index) => (
              <div key={index} className={styles.qualityCard}>
                <img src={feature.image} alt={feature.title} />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Join Community Section */}
        <section className={styles.sectionJoin}>
          <div className={styles.joinContainer}>
            <h2 className={styles.joinTitle}>Join the FurMaps Community</h2>
            <p className={styles.joinSubtitle}>
              Connect with trusted pet care professionals or grow your pet service business. Your furry friends deserve the best care possible.
            </p>
            
            <div className={styles.joinGrid}>
              <div className={styles.joinCard}>
                <img src="/Images/medall.svg" alt="Pet Owners" />
                <h3>Pet Owners</h3>
                <p className={styles.cardDescription}>Find trusted, verified pet care services in your area</p>
                <ul className={styles.benefitsList}>
                  <li>Browse verified service providers</li>
                  <li>Read reviews from other pet parents</li>
                  <li>Book and manage appointments</li>
                  <li>Direct messaging with providers</li>
                </ul>
                <a href="/RegisterUser" className={styles.primaryButton}>Find Pet Care</a>
              </div>
              
              <div className={styles.joinCard}>
                <img src="/Images/heartt.svg" alt="Service Providers" />
                <h3>Service Providers</h3>
                <p className={styles.cardDescription}>Grow your pet care business with our trusted platform</p>
                <ul className={styles.benefitsList}>
                  <li>Reach more pet families</li>
                  <li>Manage bookings and calendar</li>
                  <li>Build your professional reputation</li>
                  <li>Secure payment processing</li>
                </ul>
                <a href="/RegisterUser" className={styles.secondaryButton}>Start Your Business</a>
              </div>
            </div>
            
            <div className={styles.signInPrompt}>
              <p>Already part of the FurMaps family?</p>
              <a href="/LoginUser" className={styles.signInButton}>Sign In to Your Account</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footerSection}>
          <div className={styles.footerContainer}>
            <div className={styles.footerLogoRow}>
              <img src="/Images/gps.png" alt="FurMaps Logo" />
              <span>FurMaps</span>
            </div>
            <div className={styles.footerLinks}>
              <a href="/">Home</a>
              <a href="/RegisterUser">Get Started</a>
              <a href="/LoginUser">Login</a>
            </div>
            <div className={styles.footerCopyright}>
              © 2024 FurMaps. All rights reserved
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

// Data for dynamic content
const teamMembers = [
  {
    name: "Tweetie M. Zapanta",
    role: "Project Manager",
    description: "Keeps everyone on track, bridges ideas into action, and makes sure the project stays true to its vision.",
    image: "/Images/tweetie.svg"
  },
  {
    name: "Adharra P. Alo",
    role: "Software Developer",
    description: "Crafts the user-facing side, turning designs into responsive and interactive experiences.",
    image: "/Images/adharra.svg"
  },
  {
    name: "Marvy M. Buot",
    role: "UI/UX Developer",
    description: "Designs clean, user-friendly interfaces and makes sure the platform feels intuitive and easy to use.",
    image: "/Images/marvy.svg"
  },
  {
    name: "Aldrich A. Segura",
    role: "Full Stack Developer",
    description: "Brings the platform to life from front to back, making sure everything works seamlessly for users.",
    image: "/Images/aldrich.svg"
  },
  {
    name: "Nesserain C. De La Cruz",
    role: "Quality Assurance",
    description: "Tests every feature with care, catching bugs and ensuring everything runs smoothly before launch.",
    image: "/Images/ness.svg"
  },
  {
    name: "Mon Vencie Q. Medalla",
    role: "Backend Developer",
    description: "Builds the backbone of the app, handling data, servers, and everything behind the scenes.",
    image: "/Images/mon.svg"
  }
];

const services = [
  {
    title: "Pet Sitting",
    description: "Trusted caregivers who provide loving attention to your pets in the comfort of your own home.",
    image: "/Images/petsitting.svg"
  },
  {
    title: "Dog Walking",
    description: "Professional dog walkers who ensure your pup gets the exercise and attention they need.",
    image: "/Images/dogwalking.svg"
  },
  {
    title: "Pet Grooming",
    description: "Professional grooming services to keep your pets looking and feeling their best.",
    image: "/Images/petgrooming.svg"
  },
  {
    title: "Pet Training",
    description: "Certified trainers who help develop good behavior and strengthen the bond with your pet.",
    image: "/Images/pettraining.svg"
  },
  {
    title: "Pet Boarding",
    description: "Safe, comfortable boarding facilities where your pets receive personalized care while you're away.",
    image: "/Images/petboarding.svg"
  }
];

const additionalServices = [
  {
    title: "Pet Photography",
    description: "Professional photos to capture precious moments",
    image: "/Images/petphot.svg"
  },
  {
    title: "Pet Massage",
    description: "Therapeutic massage for senior pets and recovery",
    image: "/Images/petmas.svg"
  }
];

const qualityFeatures = [
  {
    title: "Verified Providers",
    description: "All service providers undergo thorough background checks and verification",
    image: "/Images/verpro.svg"
  },
  {
    title: "Licensed & Insured",
    description: "Professional credentials, licenses, and insurance coverage verified",
    image: "/Images/license.svg"
  },
  {
    title: "5-Star Reviews",
    description: "Real reviews from pet parents help maintain service excellence",
    image: "/Images/starrev.svg"
  }
];

export default WAboutPage;