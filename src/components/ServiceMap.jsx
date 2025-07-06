import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import customMarkerIcon from '../components/customMarker';
import BookingModal from './BookingModal';
import 'leaflet/dist/leaflet.css';

const ServiceMap = ({ services }) => {
  const defaultCenter = [10.3157, 123.8854]; // Cebu City
  const [selectedService, setSelectedService] = useState(null); // To open modal

  return (
    <>
      {/* Custom styles for tooltip */}
      <style>
        {`
          .custom-tooltip {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-radius: 8px;
            padding: 12px;
            min-width: 140px;
            text-align: center;
          }
          .custom-tooltip::before {
            border-top-color: rgba(255, 255, 255, 0.95) !important;
          }
        `}
      </style>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "400px", width: "100%", borderRadius: "18px", border: "1px solid #e5e7eb" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {services.map((service) => {
          const lat = parseFloat(service.latitude);
          const lng = parseFloat(service.longitude);
          const isValidLat = !isNaN(lat) && Math.abs(lat) <= 90;
          const isValidLng = !isNaN(lng) && Math.abs(lng) <= 180;

          if (!isValidLat || !isValidLng) {
            console.warn("Invalid coordinates for:", service);
            return null;
          }

          return (
            <Marker
              key={service.id}
              position={[lat, lng]}
              icon={customMarkerIcon}
              eventHandlers={{
                click: () => setSelectedService(service),
              }}
            >
              <Tooltip 
                className="custom-tooltip"
                direction="top"
                offset={[0, -10]}
                opacity={1}
                permanent={false}
              >
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                    {service.name}
                  </h4>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '12px', 
                    color: '#666',
                    backgroundColor: '#f3f4f6',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {service.serviceType}
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#888' }}>
                    {service.provider_name}
                  </p>
                  <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#059669' }}>
                    ₱{service.price}
                  </p>
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    fontSize: '10px', 
                    color: '#2563eb',
                    fontStyle: 'italic'
                  }}>
                    Click to book
                  </p>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Booking Modal for clicked marker */}
      {selectedService && (
        <BookingModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          onBookingSuccess={(booking) => {
            console.log("Booking created:", booking);
            setSelectedService(null);
          }}
        />
      )}
    </>
  );
};

export default ServiceMap;
