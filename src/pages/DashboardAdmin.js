// DashboardAdmin.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/LoginUser');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Admin Dashboard</h1>
      <p className="mb-6">Welcome, Admin! You can manage users and content here.</p>

      <div className="space-y-2">
        <button className="px-4 py-2 bg-green-500 text-white rounded">Manage Users</button>
        <button className="px-4 py-2 bg-yellow-500 text-white rounded">Review Providers</button>
        <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardAdmin;