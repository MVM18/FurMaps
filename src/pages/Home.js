// Home.js
import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';

const Homepage = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGetStarted = () => {
    setIsNavigating(true);
    setTimeout(() => navigate('/RegisterUser'), 1500);
  };

  const handleLogin = () => {
    setIsNavigating(true);
    setTimeout(() => navigate('/LoginUser'), 1000);
  };

  return (
    <div className={styles.homepage}>
      {isNavigating && <LoadingScreen />}

      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <img src="/Images/gps.png" alt="FurMaps Logo" className={styles.logoImage} />
          <span className={styles.loGo}>FurMaps</span>
        </div>
        <div className={styles.navLinks}>
          <button className={styles.navLink} onClick={() => window.location.href = '/AboutPage'}>
            About
          </button>
          <button className={styles.navButton} onClick={handleLogin}>
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Connect Pet Owners with Trusted Service Providers
            </h1>
            <p className={styles.heroSubtitle}>
              FurMaps is your one-stop platform for finding reliable pet care services. From grooming to walking, connect with verified professionals in your area.
            </p>
            <div className={styles.heroButtons}>
              <button className={styles.primaryButton} onClick={handleGetStarted}>
                Get Started
              </button>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <img 
              src="Images/cat-dog.png" 
              alt="Happy pets" 
              className={styles.heroImage}
            />
          </div>
        </div>
      

      {/* Highlights Section */}
      <section className={styles.highlights}>
        <div className={styles.sectionHeader}>
          <h2>Why Choose FurMaps?</h2>
        </div>
        <div className={styles.highlightCards}>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.green}`}>
              <img src="Images/users.png" alt="Verified" />
            </div>
            <h3>Verified Providers</h3>
            <p>All service providers are strongly vetted to help customers take informed decisions about your pet's care.</p>
          </div>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.blue}`}>
              <img src="Images/loc.png" alt="Location" />
            </div>
            <h3>Location-Based</h3>
            <p>Find services that may be delivered to your location or nearby facilities.</p>
          </div>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.orange}`}>
              <img src="Images/star.png" alt="Reviews" />
            </div>
            <h3>Trusted Reviews</h3>
            <p>Read genuine reviews from other pet owners to make reserved decisions about your pet's care.</p>
          </div>
        </div>
      </section>
  

{/* How It Works Section */}
<section className={styles.howItWorks}>
  <div className={styles.sectionHeader}>
    <h2>How FurMaps Work</h2>
  </div>
  <div className={styles.highlightCards}>
    <div className={styles.card}>
       <div className={`${styles.cardIcon} ${styles.blue}`}>
        <img src="/Images/magnifying.png" alt="Search" />
      </div>
      <h3>Search</h3>
      <p>Enter your location and the type of service you need.</p>
    </div>
    <div className={styles.card}>
       <div className={`${styles.cardIcon} ${styles.orange}`}>
        <img src="/Images/loc-marker.png" alt="Locate" />
      </div>
      <h3>Locate</h3>
      <p>See trusted nearby providers. Book right away or plan ahead.</p>
    </div>
   <div className={styles.card}>
       <div className={`${styles.cardIcon} ${styles.green}`}>
        <img src="/Icons/done.svg" alt="Book" />
      </div>
      <h3>Book</h3>
      <p>Rest easy while your pet gets quality care.</p>
    </div>
  </div>
</section>
</section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>  
              <div className={styles.footerLogoAlign}>
               <img src="/Images/gps.png" alt="FurMaps Logo" className={styles.footerLogoImg} />         
               <span className={styles.footerLogoText}>FurMaps</span>         
            </div>        
            <p>© 2025 FurMaps. All rights reserved</p>
          </div>
          <div className={styles.footerLinks}>
      <button className={styles.footerLink} onClick={() => navigate('/AboutPage')}>About</button>
      <button className={styles.footerLink} onClick={handleGetStarted}>Get Started</button>
      <button className={styles.footerLink} onClick={handleLogin}>Login</button>
    </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;

