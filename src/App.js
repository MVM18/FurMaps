//app.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import RegisterUser from './pages/RegisterUser'; 
import LoginUser from './pages/LoginUser';
import PageTransition from './components/PageTransition';
import HomepagePetOwner from './pages/HomepagePetOwner';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardProvider from './pages/DashboardProvider';



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
      <Route path="/DashboardAdmin" element={
  <PageTransition isLoading={isLoading}>
    <DashboardAdmin />
  </PageTransition>
} />
<Route path="/DashboardProvider" element={
  <PageTransition isLoading={isLoading}>
    <DashboardProvider />
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
