import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import './PageTransition.css';

const PageTransition = ({ children, isLoading = false }) => {
  const [showLoading, setShowLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      setShowContent(false);
    } else {
      // Simulate loading time for smooth transition
      const timer = setTimeout(() => {
        setShowLoading(false);
        setShowContent(true);
      }, 1500); // 1.5 seconds loading time

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <>
      {showLoading && <LoadingScreen />}
      <div className={`page-transition ${showContent ? 'fade-in' : 'fade-out'}`}>
        {children}
      </div>
    </>
  );
};

export default PageTransition; 