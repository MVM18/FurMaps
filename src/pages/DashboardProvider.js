// DashboardProvider.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardProvider = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/LoginUser');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-purple-600 mb-4">Provider Dashboard</h1>
      <p className="mb-6">Hello Provider! Manage your services and view bookings below.</p>

      <div className="space-y-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded">My Services</button>
        <button className="px-4 py-2 bg-teal-500 text-white rounded">View Bookings</button>
        <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardProvider;