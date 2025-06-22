import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Welcome from './pages/Welcome';
import RegisterUser from './pages/RegisterUser'; 
import LoginUser from './pages/LoginUser';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/RegisterUser" element={<RegisterUser />} /> 
        <Route path="/LoginUser" element={<LoginUser />} />

      </Routes>
    </Router>
  );
}

export default App;
