import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-logo">
          <img src="/Images/gps.png" alt="FurMaps Logo" />
          <span className="logo-text">FurMaps</span>
        </div>
        {/* Spinner removed as requested */}
        <div className="loading-text">Loading...</div>
        <div className="loading-paws">
          <span className="paw">🐾</span>
          <span className="paw">🐾</span>
          <span className="paw">🐾</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 