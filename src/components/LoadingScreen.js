import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-logo">
          <img src="/Images/paw-logo.png" alt="FurMaps Logo" />
          <span className="logo-text">FurMaps</span>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
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