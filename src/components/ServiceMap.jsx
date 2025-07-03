import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import customMarkerIcon from '../components/customMarker';
import BookingModal from './BookingModal';
import 'leaflet/dist/leaflet.css';

const ServiceMap = ({ services }) => {
  const defaultCenter = [10.3157, 123.8854]; // Cebu City
  const [selectedService, setSelectedService] = useState(null); // To open modal

  return (
    <>
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
            />
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
