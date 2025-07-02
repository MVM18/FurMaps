import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import L from 'leaflet';
// Optional: fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});
const ServiceMap = ({ services }) => {
  const defaultCenter = [10.3157, 123.8854]; // Default to Cebu City

  return (
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
    <Marker key={service.id} position={[lat, lng]}>
      <Popup>
        <strong>{service.name}</strong><br />
        {service.location}<br />
        Price: ₱{service.price}
      </Popup>
    </Marker>
  );
})}
    </MapContainer>
  );
};

export default ServiceMap;
