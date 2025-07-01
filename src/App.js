//app.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import RegisterUser from './pages/RegisterUser'; 
import LoginUser from './pages/LoginUser';
import PageTransition from './components/PageTransition';
import HomepagePetOwner from './pages/PetOwner/HomepagePetOwner';
import ProfilePetOwner from './pages/PetOwner/ProfilePetOwner';
import SPdashboard from './pages/ServiceProviderDashboard/SPdashboard';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import ProviderProfile from './pages/PetOwner/ProviderProfile';

// Custom hook to handle route changes
const useRouteChange = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return isLoading;
};

// Wrapper component to handle transitions
const AppContent = () => {
  const isLoading = useRouteChange();

  return (
    <Routes>
      <Route path="/" element={
        <PageTransition isLoading={isLoading}>
          <Home />
        </PageTransition>
      } />
      <Route path="/RegisterUser" element={
        <PageTransition isLoading={isLoading}>
          <RegisterUser />
        </PageTransition>
      } /> 
      <Route path="/LoginUser" element={
        <PageTransition isLoading={isLoading}>
          <LoginUser />
        </PageTransition>
      } />
      <Route path="/HomepagePetOwner" element={
        <PageTransition isLoading={isLoading}>
          <HomepagePetOwner />
        </PageTransition>
      } />
      <Route path="/ProfilePetOwner" element={
        <PageTransition isLoading={isLoading}>
          <ProfilePetOwner />
        </PageTransition>
      } />
      <Route path="/SPdashboard" element={
        <PageTransition isLoading={isLoading}>
          <SPdashboard />
        </PageTransition>
      } />
      
      <Route path="/AdminDashboard" element={
        <PageTransition isLoading={isLoading}>
          <AdminDashboard />
        </PageTransition>
      } />

                  <Route path="/AboutPage" element={
        <PageTransition isLoading={isLoading}>
          <AboutPage />
        </PageTransition>
      } />

      <Route path="/provider/:userId" element={
        <PageTransition isLoading={isLoading}>
          <ProviderProfile />
        </PageTransition>
      } />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
