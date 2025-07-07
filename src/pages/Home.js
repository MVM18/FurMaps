//Home.js
import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';

const Homepage = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleGetStarted = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/RegisterUser');
    }, 1500);
  };

  const handleLogin = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/LoginUser');
    }, 1000);
  };

  return (
    <div className={styles.homepage}>
      {/* Loading Screen */}
      {isNavigating && <LoadingScreen />}

      {/* Navigation Bar */}
      <nav className={styles.navMenu}>
        <div className={styles.brandLogo}>

        </div>
        <div style={{ display: 'flex', gap: '5rem', alignItems: 'center' }}>
          <div
            className={styles.navItem}
            onClick={() => window.location.href = '/AboutPage'}
            style={{ cursor: 'pointer' }}
          >
            About Us
          </div>
          <div
            className={styles.navItem}
            onClick={handleLogin}
            style={{ cursor: 'pointer' }}
          >
            Log in
          </div>
        </div>
      </nav>

      {/* Branding */}
      <header className={styles.furmapsHeader}>
        <div className={styles.furmaps}>
          <span>Fur</span>
          <span className={styles.maps}>Maps</span>
        </div>
        <div className={styles.yourPetsComfort}>Your Pet's Comfort, Just a Click Away</div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContentWrapper}>
          <div className={styles.heroTextBlock}>
            <div className={styles.heroTitle}>Find Pet Services<br />Near You</div>
            <div className={styles.heroSubtitle}>
              Easily locate trusted pet sitters, groomers, and boarding near your area.
            </div>
            <button className={styles.getStartedBtn} onClick={handleGetStarted}>Get Started</button>
          </div>
          <div className={styles.heroImageWrapper}>
            <img className={styles.heroImage} src="images/cat-dog.png" alt="Cat and Dog" />
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className={styles.highlightsSection}>
        <div className={`${styles.highlightCard} ${styles.fadeIn}`}>
          <div className={styles.cardAccent} style={{ background: '#b6e24b' }} />
          <img src="images/dog-hug.png" alt="Pet Parent" className={styles.cardIcon} />
          <b className={styles.cardTitle}>Better for Pet Parents</b>
          <div>Pets stay happy, comfortable, and well-cared for in a familiar and loving environment while you're away.</div>
        </div>
        <div className={`${styles.highlightCard} ${styles.fadeIn}`}>
          <div className={styles.cardAccent} style={{ background: '#fae6c3' }} />
          <img src="images/dog-cat.png" alt="Pets" className={styles.cardIcon} />
          <b className={styles.cardTitle}>Better for Pets</b>
          <div>Pet parents enjoy peace of mind knowing your pet is in trusted hands, receiving quality care even when you're not around.</div>
        </div>
        <div className={`${styles.highlightCard} ${styles.fadeIn}`}>
          <div className={styles.cardAccent} style={{ background: '#8fd400' }} />
          <img src="images/book.png" alt="Service Provider" className={styles.cardIcon} />
          <b className={styles.cardTitle}>Better for Service Providers</b>
          <div>Service providers can grow their business with flexible opportunities, reliable bookings, and a trusted platform that connects them with pet owners who need their care.</div>
        </div>
      </section>

      {/* CTA Buttons */}
      <section className={styles.ctaSection}>
      </section>

      {/* Info/Features Section */}
      <section className={styles.infoSection}>
        <div className={`${styles.infoCard} ${styles.fadeIn}`}>
          <div className={styles.cardAccent} style={{ background: '#fae6c3' }} />
          <b className={styles.cardTitle}>What pets do you have?</b>
          <div className={styles.petsType}>
            <img src="/Images/blck-dog.png" alt="Dog" className={styles.petIcon} />
            <span>DOGS</span>
            <img src="/Images/blck-cat.png" alt="Cat" className={styles.petIcon} />
            <span>CATS</span>
          </div>
        </div>
        <div className={`${styles.infoCard} ${styles.fadeIn}`}>
          <div className={styles.cardAccent} style={{ background: '#b6e24b' }} />
          <b className={styles.cardTitle}>How FurMaps work</b>
          <ol>
            <li>Enter your location and the type of service you need.</li>
            <li>See trusted nearby providers. Book right away or plan ahead.</li>
            <li>Rest easy while your pet gets quality care.</li>
          </ol>
        </div>
        <div className={`${styles.infoCard} ${styles.fadeIn}`}>
          <div className={styles.cardAccent} style={{ background: '#8fd400' }} />
          <img src="/Images/dog-hug.png" alt="Pet Sitters" className={styles.cardIcon} />
          <b className={styles.cardTitle}>Connect with awesome pet sitters</b>
          <div>Easily find verified, reviewed sitters who will give your pets the care, companionship, and attention they deserve while you're away.</div>
        </div>
        <div className={`${styles.infoCard} ${styles.fadeIn}`}>
          <div className={styles.cardAccent} style={{ background: '#b6e24b' }} />
          <img src="/Images/walk-dog.png" alt="Dog Walking" className={styles.cardIcon} />
          <b className={styles.cardTitle}>Discover local dog walking services</b>
          <div>Quickly connect with nearby dog walkers who'll give your pup the exercise, fresh air, and attention they need.</div>
        </div>
        <div className={`${styles.infoCard} ${styles.fadeIn}`}>
          <div className={styles.cardAccent} style={{ background: '#fae6c3' }} />
          <img src="/Images/dogies.png" alt="Pet Hotels" className={styles.cardIcon} />
          <b className={styles.cardTitle}>Book and locate trusted pet hotels</b>
          <div>Find verified, well-reviewed hosts who'll welcome your pet into a cozy home, offering round-the-clock care, comfort, and attention while you're away.</div>
        </div>
        <div className={`${styles.infoCard} ${styles.fadeIn}`}>
          <div className={styles.cardAccent} style={{ background: '#8fd400' }} />
          <img src="/Images/locate.png" alt="Daycare" className={styles.cardIcon} />
          <b className={styles.cardTitle}>Find nearby pet daycare centers</b>
          <div>Easily locate trusted pet daycare spots where your pet can stay active, social, and well-cared for throughout the day.</div>
        </div>
        <div className={`${styles.infoCard} ${styles.fadeIn}`}>
          <div className={styles.cardAccent} style={{ background: '#b6e24b' }} />
          <img src="/Images/cat-fur.png" alt="Groomers" className={styles.cardIcon} />
          <b className={styles.cardTitle}>Explore pet pampering services</b>
          <div>Easily locate trusted groomers who'll keep your pet looking fresh, clean, and feeling their best.</div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <img src="/Images/gps.png" alt="FurMaps Logo" className={styles.footerLogo} />
          <span>FurMaps</span>
        </div>
        <div className={styles.footerLinks}>
          <a href="#about">About us</a>
          <a href="#terms">Terms of Use</a>
          <a href="#privacy">Privacy Policy</a>
        </div>
        <div className={styles.footerContact}>
          <b>Contact Us</b>
          <div>Email us: <a href="mailto:support@furmaps.com">support@furmaps.com</a></div>
          <div className={styles.footerSocials}>
            <a href="#"><img src="/Images/fb.png" alt="Facebook" /></a>
            <a href="#"><img src="/Images/ig.png" alt="Instagram" /></a>
          </div>
        </div>
        <div className={styles.footerCopyright}>
          <img src="/Images/copyright.png" alt="Copyright" />
          <span>Copyright FurMaps 2025</span>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;