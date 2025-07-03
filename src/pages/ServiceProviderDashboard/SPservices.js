import React, { useEffect,useState } from 'react';
import './SPservices.css';
import { supabase } from '../../lib/supabaseClient'; // make sure this is correct
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import customMarkerIcon from '../../components/customMarker';



const ServiceOffered = () => {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    serviceType: '',
    contactNumber: '',
    price: '',
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

const handleSubmit = async (e) => {
  e.preventDefault();

  const { name, location, serviceType, contactNumber, price, latitude, longitude, id } = formData;

  // Make sure all required fields are present
  if (!name || !location || !latitude || !longitude || !serviceType || !contactNumber || !price) {
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
        price: parseFloat(price)
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating service:', updateError);
      return;
    }

    setServices(prev =>
      prev.map(service =>
        service.id === id
          ? { ...service, name, location, latitude, longitude, serviceType, contactNumber, price }
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
        price: parseFloat(price)
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
    price: ''
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

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', user.id); // ✅ Only fetch current user's services

    if (error) {
      console.error('Error loading services:', error);
    } else {
      setServices(data.map(service => ({
        id: service.id,
        name: service.name,
        location: service.location,
        serviceType: service.service_type,
        contactNumber: service.contact_number,
        price: service.price,
         latitude: service.latitude,
  longitude: service.longitude,
        createdAt: new Date(service.created_at).toLocaleDateString()
      })));
    }
  };

  fetchServices();
}, []);


 const handleDelete = async (id) => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service:', error);
    return;
  }

  setServices(prev => prev.filter(service => service.id !== id));
};


  const handleEdit = (service) => {
  setFormData({
    id: service.id, // make sure this is preserved for update
    name: service.name,
    location: service.location,
    serviceType: service.serviceType,
    contactNumber: service.contactNumber,
    price: service.price,
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
        <button 
          className="add-service-btn"
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
  if (!profile) {
  console.warn("No profile data found for this user.");
  return; // Or you can still show the form with empty/default values
}

  setFormData(prev => ({
    ...prev,
    location: profile.address || '',
    contactNumber: profile.phone || ''
  }));

  setShowForm(true);
}}
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
    price: ''
  });

  setShowForm(true);
}}

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
                      <img src="Icons/edit.svg" alt="Edit" />
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