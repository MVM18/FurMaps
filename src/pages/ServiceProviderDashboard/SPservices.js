import React, { useState } from 'react';
import './SPservices.css';

const ServiceOffered = () => {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    serviceType: '',
    contactNumber: '',
    price: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.location && formData.serviceType && formData.contactNumber && formData.price) {
      const newService = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toLocaleDateString()
      };
      setServices(prev => [...prev, newService]);
      setFormData({
        name: '',
        location: '',
        serviceType: '',
        contactNumber: '',
        price: ''
      });
      setShowForm(false);
    }
  };

  const handleDelete = (id) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  const handleEdit = (service) => {
    setFormData(service);
    setShowForm(true);
    setServices(prev => prev.filter(s => s.id !== service.id));
  };

  return (
    <div className="services-container">
      <div className="services-header">
        <h3>Services Offered</h3>
        <p>Manage your pet care services and offerings</p>
        <button 
          className="add-service-btn"
          onClick={() => setShowForm(true)}
        >
          <img src="Icons/check.svg" alt="Add" />
          Add New Service
        </button>
      </div>

      {/* Add/Edit Service Form */}
      {showForm && (
        <div className="service-form-overlay">
          <div className="service-form">
            <div className="form-header">
              <h4>{formData.id ? 'Edit Service' : 'Add New Service'}</h4>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    name: '',
                    location: '',
                    serviceType: '',
                    contactNumber: '',
                    price: ''
                  });
                }}
              >
                <img src="Icons/decline.svg" alt="Close" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Service Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Dog Walking, Pet Grooming"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Quezon City, Metro Manila"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="serviceType">Service Type *</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a service type</option>
                  <option value="Dog Walking">Dog Walking</option>
                  <option value="Pet Grooming">Pet Grooming</option>
                  <option value="Pet Sitting">Pet Sitting</option>
                  <option value="Pet Training">Pet Training</option>
                  <option value="Veterinary Care">Veterinary Care</option>
                  <option value="Pet Boarding">Pet Boarding</option>
                  <option value="Pet Transportation">Pet Transportation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number *</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., +63 912 345 6789"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <div className="price-input">
                  <span className="currency">₱</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      name: '',
                      location: '',
                      serviceType: '',
                      contactNumber: '',
                      price: ''
                    });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {formData.id ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="services-list">
        {services.length === 0 ? (
          <div className="empty-state">
            <img src="Images/dog-cat.png" alt="No services" />
            <h4>No services added yet</h4>
            <p>Start by adding your first service offering</p>
            <button 
              className="add-first-service-btn"
              onClick={() => setShowForm(true)}
            >
              Add Your First Service
            </button>
          </div>
        ) : (
          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <h4>{service.name}</h4>
                  <div className="service-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(service)}
                    >
                      <img src="Icons/view.svg" alt="Edit" />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(service.id)}
                    >
                      <img src="Icons/decline.svg" alt="Delete" />
                    </button>
                  </div>
                </div>
                
                <div className="service-details">
                  <div className="service-info">
                    <div className="info-item">
                      <img src="Icons/location.svg" alt="Location" />
                      <span>{service.location}</span>
                    </div>
                    <div className="info-item">
                      <img src="Icons/calendar.svg" alt="Type" />
                      <span>{service.serviceType}</span>
                    </div>
                    <div className="info-item">
                      <img src="Icons/chat.svg" alt="Contact" />
                      <span>{service.contactNumber}</span>
                    </div>
                  </div>
                  
                  <div className="service-price">
                    <span className="price-label">Price:</span>
                    <span className="price-value">₱{parseFloat(service.price).toLocaleString()}</span>
                  </div>
                  
                  <div className="service-date">
                    <span>Added: {service.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceOffered; 