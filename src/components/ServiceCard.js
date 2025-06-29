import React from 'react';
import './ServiceCard.css';

const ServiceCard = ({ service, onBookNow, onMessage }) => {
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

  return (
    <div className="service-card">
      <div className="service-card-header">
        <div className="service-icon">
          <img src={getServiceIcon(service.serviceType)} alt={service.serviceType} />
        </div>
        <div className="service-info">
          <h3 className="service-name">{service.name}</h3>
          <p className="service-type">{service.serviceType}</p>
          <div className="service-location">
            <img src="/images/location.png" alt="Location" />
            <span>{service.location}</span>
          </div>
        </div>
        <div className="service-price">
          <span className="price-amount">₱{service.price}</span>
          <span className="price-label">per service</span>
        </div>
      </div>

      <div className="service-card-body">
        <div className="provider-info">
          <div className="provider-avatar">
            <img src="/images/user.png" alt="Provider" />
          </div>
          <div className="provider-details">
            <p className="provider-name">{service.provider_name || 'Service Provider'}</p>
            <p className="provider-contact">{service.contactNumber}</p>
          </div>
        </div>

        <div className="service-actions">
          <button 
            className="book-now-btn"
            onClick={() => onBookNow(service)}
          >
            <img src="/Icons/check.svg" alt="Book" />
            Book Now
          </button>
          <button 
            className="message-btn"
            onClick={() => onMessage(service)}
          >
            <img src="/Icons/chat.svg" alt="Message" />
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard; 