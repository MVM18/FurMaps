import L from 'leaflet';

const customMarkerIcon = new L.Icon({
  iconUrl: '/images/loc-marker.png', // 🐾 Use your own image here
  iconSize: [38, 45],
  iconAnchor: [19, 45],
  popupAnchor: [0, -40],
  shadowUrl: '/leaflet/marker-shadow.png',
  shadowSize: [50, 50],
  shadowAnchor: [15, 45],
});

export default customMarkerIcon;