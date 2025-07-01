import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ServiceCard.css';

const ServiceCard = ({ service, onBookNow, onMessage, onProviderClick }) => {
  const navigate = useNavigate();

  const getServiceIcon = (serviceType) => {
    switch (serviceType.toLowerCase()) {
      case 'dog walking':
        return '/images/dog-leash.png';
      case 'pet grooming':
        return '/images/dog-cat.png';
      case 'pet sitting':
        return '/images/dog-human.png';
      case 'veterinary':
        return '/images/dog-background.png';
      default:
        return '/images/dogies.png';
    }
  };

  const handleCardClick = () => {
    if (onProviderClick && service.provider_user_id) {
      onProviderClick(service.provider_user_id);
    } else if (service.provider_user_id) {
      navigate(`/provider/${service.provider_user_id}`);
    }
  };

  return (
    <div className="service-card-horizontal" onClick={handleCardClick}>
      <div className="service-card-image">
        <img src={getServiceIcon(service.serviceType)} alt={service.serviceType} />
      </div>
      <div className="service-card-info">
        <div className="service-card-title-row">
          <h3 className="service-card-title">{service.name}</h3>
          <span className="service-card-type">{service.serviceType}</span>
        </div>
        <div className="service-card-location">{service.location}</div>
        <div className="service-card-provider">
          <span className="provider-label">Provider:</span> {service.provider_name}
        </div>
        <div className="service-card-contact">
          <span className="contact-label">Contact:</span> {service.contactNumber}
        </div>
      </div>
      <div className="service-card-price-block">
        <span className="service-card-price">₱{service.price}</span>
        <span className="service-card-price-label">/service</span>
        <div className="service-card-actions">
          <button className="book-now-btn" onClick={e => { e.stopPropagation(); onBookNow(service); }}>
            Book Now
          </button>
          <button className="message-btn" onClick={e => { e.stopPropagation(); onMessage(service); }}>
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard; 