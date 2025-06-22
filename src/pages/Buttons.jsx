import React from 'react';
import { useNavigate } from 'react-router-dom';

const Buttons = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/welcome'); // This navigates to Welcome.jsx route
  };

  return (
    <div className="button-wrapper">
      <button className="btn" onClick={handleGetStarted}>Get Started</button>
      <a href="#about" className="btn about-btn">About Us</a>
    </div>
  );
};

export default Buttons;
