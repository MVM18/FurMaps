import React, { useEffect, useState } from 'react';
import styles from './Welcome.module.css';

const Welcome = ({ closeModal }) => {
  const [fade, setFade] = useState('fade-in');

  const handleClose = () => {
    setFade('fade-out');
    setTimeout(() => {
      closeModal();
    }, 300);
  };

  useEffect(() => {
    setFade('fade-in');
  }, []);

  const handlePetOwnerClick = () => {
    alert('Pet Owner clicked');
  };

  const handleServiceProviderClick = () => {
    alert('Service Provider clicked');
  };

  return (
    <div
      className={`${styles.modalOverlay} ${styles[fade]}`}
      onClick={handleClose}
    >
      <div
        className={styles.welcomeWrapper}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.logoContainer}>
            <img src="/images/gps.png" alt="FurMaps Logo" className={styles.logoImg} />
            <div className={styles.logoText}>FurMaps</div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h1>
            Welcome to <span className={styles.highlight}>FurMaps</span>
          </h1>
          <h2>Use FurMaps as</h2>

          <div className={styles.buttonGroup}>
            <button className={`${styles.btn} ${styles.petOwner}`} onClick={handlePetOwnerClick}>
              Pet Owner
            </button>
            <div className={styles.orText}>or</div>
            <button className={`${styles.btn} ${styles.serviceProvider}`} onClick={handleServiceProviderClick}>
              Service Provider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
