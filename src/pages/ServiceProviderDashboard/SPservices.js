import React, { useEffect,useState } from 'react';
import './SPservices.css';
import { supabase } from '../../lib/supabaseClient'; // make sure this is correct
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import customMarkerIcon from '../../components/customMarker';



const ServiceOffered = () => {
  const [services, setServices] = useState([]);
  const [inactiveServices, setInactiveServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showInactiveServices, setShowInactiveServices] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    serviceType: '',
    contactNumber: '',
    price: '',
    pricingType: 'per_service',
    serviceDuration: 60,
    latitude: null,
    longitude: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check user status and role
  const checkUserStatus = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User fetch error:', userError);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return;
    }

    setUserStatus(profile.status);
    setUserRole(profile.role);
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  // Check if user is approved
  if (userStatus !== 'Approved' && userStatus !== 'Active') {
    alert("You cannot add services while your account is pending approval or suspended.");
    return;
  }

  const { name, location, serviceType, contactNumber, price, pricingType, serviceDuration, latitude, longitude, id } = formData;

  // Make sure all required fields are present
  if (!name || !location || !latitude || !longitude || !serviceType || !contactNumber || !price || !pricingType || !serviceDuration) {
    alert("Please complete all fields and select a location on the map.");
    return;
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('User not found:', userError);
    return;
  }

  if (id) {
    // 🔄 Update existing service
    const { error: updateError } = await supabase
      .from('services')
      .update({
        name,
        location,
        latitude,
        longitude,
        service_type: serviceType,
        contact_number: contactNumber,
        price: parseFloat(price),
        pricing_type: pricingType,
        service_duration: parseInt(serviceDuration)
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating service:', updateError);
      return;
    }

    setServices(prev =>
      prev.map(service =>
        service.id === id
          ? { ...service, name, location, latitude, longitude, serviceType, contactNumber, price, pricingType, serviceDuration }
          : service
      )
    );

  } else {
    // ➕ Add new service
    const { data: insertedService, error: insertError } = await supabase
      .from('services')
      .insert([{
        provider_id: user.id,
        name,
        location,
        latitude,
        longitude,
        service_type: serviceType,
        contact_number: contactNumber,
        price: parseFloat(price),
        pricing_type: pricingType,
        service_duration: parseInt(serviceDuration)
      }])
      .select();

    if (insertError) {
      console.error('Error adding service:', insertError);
      return;
    }

    setServices(prev => [
      ...prev,
      {
        id: insertedService[0].id,
        name,
        location,
        latitude,
        longitude,
        serviceType,
        contactNumber,
        price,
        pricingType,
        serviceDuration,
        createdAt: new Date(insertedService[0].created_at).toLocaleDateString()
      }
    ]);
  }

  // Reset form
  setFormData({
    id: '',
    name: '',
    location: '',
    latitude: null,
    longitude: null,
    serviceType: '',
    contactNumber: '',
    price: '',
    pricingType: 'per_service',
    serviceDuration: 60
  });
  setShowForm(false);
};


const LocationPicker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect({ lat, lng });
    }
  });
  return null;
};

useEffect(() => {
  const fetchServices = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User fetch error:', userError);
      return;
    }

    // Fetch active services
    const { data: activeData, error: activeError } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', user.id)
      .eq('is_active', true);

    if (activeError) {
      console.error('Error loading active services:', activeError);
    } else {
      setServices(activeData.map(service => ({
        id: service.id,
        name: service.name,
        location: service.location,
        serviceType: service.service_type,
        contactNumber: service.contact_number,
        price: service.price,
        pricingType: service.pricing_type || 'per_service',
        serviceDuration: service.service_duration || 60,
        latitude: service.latitude,
        longitude: service.longitude,
        createdAt: new Date(service.created_at).toLocaleDateString()
      })));
    }

    // Fetch inactive services
    const { data: inactiveData, error: inactiveError } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', user.id)
      .eq('is_active', false);

    if (inactiveError) {
      console.error('Error loading inactive services:', inactiveError);
    } else {
      setInactiveServices(inactiveData.map(service => ({
        id: service.id,
        name: service.name,
        location: service.location,
        serviceType: service.service_type,
        contactNumber: service.contact_number,
        price: service.price,
        pricingType: service.pricing_type || 'per_service',
        serviceDuration: service.service_duration || 60,
        latitude: service.latitude,
        longitude: service.longitude,
        createdAt: new Date(service.created_at).toLocaleDateString()
      })));
    }
  };

  fetchServices();
}, []);


 const handleDelete = async (id) => {
  // First check if there are any bookings for this service
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('service_id', id);

  if (bookingsError) {
    console.error('Error checking bookings:', bookingsError);
    return;
  }

  if (bookings && bookings.length > 0) {
    // Show warning to user
    const hasActiveBookings = bookings.some(booking => 
      ['pending', 'confirmed', 'in_progress'].includes(booking.status)
    );
    
    if (hasActiveBookings) {
      alert(`Cannot delete this service because it has active bookings. Please complete or cancel all bookings first.`);
      return;
    } else {
      const confirmed = window.confirm(
        `This service has ${bookings.length} completed/cancelled booking(s). Are you sure you want to deactivate it? (This will hide it from customers but preserve booking history)`
      );
      if (!confirmed) return;
    }
  } else {
    // No bookings exist, ask for confirmation
    const confirmed = window.confirm('Are you sure you want to deactivate this service?');
    if (!confirmed) return;
  }

  // Soft delete - mark as inactive instead of hard delete
  const { error } = await supabase
    .from('services')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error deactivating service:', error);
    alert('Error deactivating service. Please try again.');
    return;
  }

  setServices(prev => prev.filter(service => service.id !== id));
  alert('Service deactivated successfully!');
};

const handleReactivate = async (id) => {
  const confirmed = window.confirm('Are you sure you want to reactivate this service?');
  if (!confirmed) return;

  const { error } = await supabase
    .from('services')
    .update({ is_active: true })
    .eq('id', id);

  if (error) {
    console.error('Error reactivating service:', error);
    alert('Error reactivating service. Please try again.');
    return;
  }

  // Move service from inactive to active list
  const serviceToReactivate = inactiveServices.find(service => service.id === id);
  if (serviceToReactivate) {
    setServices(prev => [...prev, serviceToReactivate]);
    setInactiveServices(prev => prev.filter(service => service.id !== id));
  }

  alert('Service reactivated successfully!');
};


  const handleEdit = (service) => {
  setFormData({
    id: service.id, // make sure this is preserved for update
    name: service.name,
    location: service.location,
    serviceType: service.serviceType,
    contactNumber: service.contactNumber,
    price: service.price,
    pricingType: service.pricingType || 'per_service',
    serviceDuration: service.serviceDuration || 60,
    latitude: service.latitude ?? null,
    longitude: service.longitude ?? null
  });
  setShowForm(true);
};

  return (
    <div className="services-container">
      <div className="services-header">
        <h3>Services Offered</h3>
        <p>Manage your pet care services and offerings</p>
        
        {/* Status-based messaging */}
        {userStatus === 'Pending' && (
          <div className="status-message pending">
            <p>⏳ Your account is pending approval. You cannot add services until your account is approved by an admin.</p>
          </div>
        )}
        
        {userStatus === 'Suspended' && (
          <div className="status-message suspended">
            <p>🚫 Your account has been suspended. Please contact support for assistance.</p>
          </div>
        )}
        
        {userStatus === 'Rejected' && (
          <div className="status-message rejected">
            <p>❌ Your application has been rejected. Please contact support for more information.</p>
          </div>
        )}
        
        <div className="services-controls">
          <button 
            className={`toggle-btn ${!showInactiveServices ? 'active' : ''}`}
            onClick={() => setShowInactiveServices(false)}
          >
            Active Services ({services.length})
          </button>
          <button 
            className={`toggle-btn ${showInactiveServices ? 'active' : ''}`}
            onClick={() => setShowInactiveServices(true)}
          >
            Inactive Services ({inactiveServices.length})
          </button>
          <button 
            className={`add-service-btn ${(userStatus !== 'Approved' && userStatus !== 'Active') ? 'disabled' : ''}`}
            onClick={async () => {
              // Check status before allowing service addition
              if (userStatus !== 'Approved' && userStatus !== 'Active') {
                alert("You cannot add services while your account is pending approval or suspended.");
                return;
              }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("User fetch failed:", userError);
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('address, phone')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile fetch failed:", profileError);
    return;
  }
  if (!profile) {
  console.warn("No profile data found for this user.");
  return; // Or you can still show the form with empty/default values
}

  setFormData(prev => ({
    ...prev,
    location: profile.address || '',
    contactNumber: profile.phone || '',
    pricingType: 'per_service',
    serviceDuration: 60
  }));

  setShowForm(true);
}}
            disabled={userStatus !== 'Approved' && userStatus !== 'Active'}
          >
            <img src="Icons/check.svg" alt="Add" />
            Add New Service
          </button>
        </div>
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
                    price: '',
                    pricingType: 'per_service',
                    serviceDuration: 60
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
                  placeholder="e.g., Cebu City, Metro Manila"
                  required
                />
              </div>

             <div className="form-group">
  <label>Pin Your Service Location *</label>
  <div style={{ height: '250px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
    <MapContainer
      center={[10.3157, 123.8854]} // Cebu City
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* ✅ Add this to detect map click */}
  <LocationPicker onSelect={({ lat, lng }) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
     // location: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
    }));
  }} />
      {formData.latitude && formData.longitude && (
       <Marker 
  position={[formData.latitude, formData.longitude]} 
  icon={customMarkerIcon} // ✅ now it's used!
/>
      )}
    </MapContainer>
  </div>
 {typeof formData.latitude === 'number' && typeof formData.longitude === 'number' && (
  <p style={{ fontSize: '0.9rem', color: '#555' }}>
    Selected Location: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
  </p>
)}
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

              <div className="form-group">
                <label htmlFor="pricingType">Pricing Type *</label>
                <select
                  id="pricingType"
                  name="pricingType"
                  value={formData.pricingType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="per_service">Per Service</option>
                  <option value="per_hour">Per Hour</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="serviceDuration">
                  {formData.pricingType === 'per_hour' ? 'Minimum Duration (minutes) *' : 'Service Duration (minutes) *'}
                </label>
                <input
                  type="number"
                  id="serviceDuration"
                  name="serviceDuration"
                  value={formData.serviceDuration}
                  onChange={handleInputChange}
                  min={formData.pricingType === 'per_hour' ? 60 : 15}
                  max={1440} // 24 hours in minutes
                  step="15"
                  required
                  placeholder={formData.pricingType === 'per_hour' ? '60' : '60'}
                />
                <small className="form-help">
                  {formData.pricingType === 'per_hour' 
                    ? 'Minimum duration for per-hour services (minimum 60 minutes)'
                    : 'How long this service typically takes to complete'
                  }
                </small>
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
                      price: '',
                      pricingType: 'per_service',
                      serviceDuration: 60
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
        {!showInactiveServices ? (
          // Active Services
          services.length === 0 ? (
            <div className="empty-state">
              <img src="Images/dog-cat.png" alt="No services" />
              {userStatus === 'Pending' ? (
                <>
                  <h4>Account Pending Approval</h4>
                  <p>You cannot add services until your account is approved by an admin.</p>
                  <div className="status-info">
                    <p>⏳ Please wait for admin approval to start offering services.</p>
                  </div>
                </>
              ) : userStatus === 'Suspended' ? (
                <>
                  <h4>Account Suspended</h4>
                  <p>Your account has been suspended. Please contact support for assistance.</p>
                  <div className="status-info">
                    <p>🚫 You cannot add or manage services while suspended.</p>
                  </div>
                </>
              ) : userStatus === 'Rejected' ? (
                <>
                  <h4>Application Rejected</h4>
                  <p>Your service provider application has been rejected.</p>
                  <div className="status-info">
                    <p>❌ Please contact support for more information about the rejection.</p>
                  </div>
                </>
              ) : (
                <>
              <h4>No active services</h4>
              <p>Start by adding your first service offering</p>
              <button 
                className="add-first-service-btn"
                onClick={async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("User fetch failed:", userError);
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('address, phone')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Profile fetch failed:", profileError);
    return;
  }

  setFormData({
    name: '',
    location: profile.address || '',
    serviceType: '',
    contactNumber: profile.phone || '',
    price: '',
    pricingType: 'per_service',
    serviceDuration: 60
  });

  setShowForm(true);
}}
              >
                Add Your First Service
              </button>
                </>
              )}
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
                        <img src="Icons/edit.svg" alt="Edit" />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(service.id)}
                        title="Deactivate Service"
                      >
                        <img src="Icons/decline.svg" alt="Deactivate" />
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
                      <span className="pricing-type">({service.pricingType === 'per_hour' ? 'per hour' : 'per service'})</span>
                      {service.pricingType === 'per_service' && (
                        <span className="service-duration">• {service.serviceDuration} min</span>
                      )}
                    </div>
                    
                    <div className="service-date">
                      <span>Added: {service.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Inactive Services
          inactiveServices.length === 0 ? (
            <div className="empty-state">
              <img src="Images/dog-cat.png" alt="No inactive services" />
              <h4>No inactive services</h4>
              <p>All your services are currently active</p>
            </div>
          ) : (
            <div className="services-grid">
              {inactiveServices.map(service => (
                <div key={service.id} className="service-card inactive">
                  <div className="service-header">
                    <h4>{service.name}</h4>
                    <div className="service-actions">
                      <button 
                        className="reactivate-btn"
                        onClick={() => handleReactivate(service.id)}
                        title="Reactivate Service"
                      >
                        <img src="Icons/check.svg" alt="Reactivate" />
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
                      <span className="pricing-type">({service.pricingType === 'per_hour' ? 'per hour' : 'per service'})</span>
                      {service.pricingType === 'per_service' && (
                        <span className="service-duration">• {service.serviceDuration} min</span>
                      )}
                    </div>
                    
                    <div className="service-date">
                      <span>Added: {service.createdAt}</span>
                    </div>
                    <div className="service-status">
                      <span className="status-inactive">Inactive</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ServiceOffered; 