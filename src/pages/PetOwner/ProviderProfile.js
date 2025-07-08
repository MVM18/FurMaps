import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './ProviderProfile.module.css';
import ProviderReviews from '../../components/ProviderReviews';

// Helper function to get service icon
const getServiceIcon = (serviceType) => {
  switch (serviceType?.toLowerCase()) {
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

const ProviderProfile = ({ userId, onServiceClick }) => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [providerServices, setProviderServices] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    const fetchProviderAndGallery = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch provider details
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (error) {
          setError('Provider not found.');
          setProvider(null);
        } else {
          setProvider(data);
        }

        // Fetch gallery images
        const { data: galleryData, error: galleryError } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('provider_id', userId)
          .order('created_at', { ascending: false })
          .limit(8);

        if (!galleryError && galleryData) {
          setGalleryImages(galleryData);
        }

        // Fetch average rating and review count
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('service_provider_id', userId);

        if (!reviewsError && reviewsData) {
          const ratings = reviewsData.map(r => r.rating).filter(r => typeof r === 'number');
          if (ratings.length > 0) {
            const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
            setAvgRating(avg.toFixed(1));
            setReviewCount(ratings.length);
          } else {
            setAvgRating(null);
            setReviewCount(0);
          }
        } else {
          setAvgRating(null);
          setReviewCount(0);
        }

        // Fetch provider's services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', userId)
          .eq('is_active', true);
        if (!servicesError && servicesData) {
          // Format services to match the expected structure for BookingModal
          const formattedServices = servicesData.map(service => ({
            id: service.id,
            name: service.name,
            location: service.location,
            latitude: service.latitude,
            longitude: service.longitude,
            serviceType: service.service_type,
            contactNumber: service.contact_number,
            price: service.price,
            pricingType: service.pricing_type || 'per_service',
            serviceDuration: service.service_duration || 60,
            provider_id: service.provider_id,
            provider_user_id: service.provider_id, // Use provider_id as user_id for consistency
            provider_name: `${provider?.first_name || ''} ${provider?.last_name || ''}`.trim(),
            provider_role: 'provider',
            createdAt: new Date(service.created_at).toLocaleDateString()
          }));
          setProviderServices(formattedServices);
        } else {
          setProviderServices([]);
        }
      } catch (error) {
        console.error('Error fetching provider data:', error);
        setError('Failed to load provider information.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProviderAndGallery();
  }, [userId]);

  if (!userId) return null;
  if (loading) return <div style={{ padding: 32 }}>Loading provider profile...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;
  if (!provider) return null;

  const handleServiceClick = (service) => {
    if (onServiceClick) {
      onServiceClick(service);
    }
  };

  return (
    <div className={styles['provider-profile-card']}>
      <div className={styles['profile-info-row']}>
        <img
          src={provider.profile_picture || '/images/user.png'}
          alt="Profile"
          className={styles['profile-photo']}
          onError={(e) => {
            e.target.src = '/images/user.png';
          }}
        />
        <div className={styles['profile-details']}>
          <h2 className={styles['profile-name']}>
            {provider.first_name} {provider.last_name}
          </h2>
          <div
            className={styles['rating']}
            id="providerProfile_rating_o1k94"
            style={{ cursor: avgRating ? 'pointer' : 'default', userSelect: 'none' }}
            onClick={() => { if (avgRating) setShowReviews(v => !v); }}
            title={avgRating ? 'Click to view reviews' : ''}
          >
            {avgRating ? (
              <>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.1em' }}>{avgRating}</span>
                <span style={{ color: '#fbbf24', marginLeft: 4 }}>★</span>
                <span style={{ color: '#555', marginLeft: 8, fontSize: '0.98em' }}>({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
              </>
            ) : (
              <span style={{ color: '#888' }}>No ratings yet</span>
            )}
          </div>
        </div>
      </div>
      {/* Services Offered Section */}
      {providerServices.length > 0 && (
        <div style={{ margin: '18px 0 8px 0', padding: '12px 16px', background: '#f9fafb', borderRadius: 10 }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '1.08em', color: '#2563eb' }}>Other Services Offered</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {providerServices.map(service => (
              <div 
                key={service.id} 
                style={{ 
                  padding: '12px 16px', 
                  background: '#fff', 
                  borderRadius: '8px', 
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59,130,246,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
                onClick={() => handleServiceClick(service)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={getServiceIcon(service.serviceType)} 
                      alt={service.serviceType}
                      style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                    />
                    <strong style={{ fontSize: '1.05em', color: '#1f2937' }}>{service.name}</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ color: '#d97706', fontWeight: 600, fontSize: '1.1em' }}>₱{service.price}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                      /{service.pricingType === 'per_hour' ? 'hour' : 'service'}
                      {service.pricingType === 'per_service' && service.serviceDuration && (
                        <span style={{ color: '#059669', marginLeft: '4px' }}>• {service.serviceDuration} min</span>
                      )}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.95em' }}>{service.serviceType}</span>
                  <span style={{ 
                    color: '#3b82f6', 
                    fontSize: '0.9em', 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    Book Now
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={styles['info-grid']}>
        <div><span className={styles['info-label']}>Phone:</span> <span className={styles['info-value']}>{provider.phone || 'N/A'}</span></div>
        <div><span className={styles['info-label']}>Address:</span> <span className={styles['info-value']}>{provider.address || 'N/A'}</span></div>
       {/* <div><span className={styles['info-label']}>Provider ID:</span> <span className={styles['info-value']}>{provider.user_id?.slice(0, 8) || 'N/A'}...</span></div>*/}
        {provider.services_offered && (
          <div><span className={styles['info-label']}>Services:</span> <span className={styles['info-value']}>{provider.services_offered}</span></div>
        )}
        {provider.certificate && (
          <div style={{ marginBottom: 12 }}>
            <span className={styles['info-label']}>Certificate:</span>
            {isImageUrl(provider.certificate) ? (
              <button
                onClick={() => { setImageModalUrl(provider.certificate); setModalVisible(true); }}
                style={{
                  marginLeft: 12,
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,246,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.2)';
                }}
              >
                <span style={{ fontSize: 16 }}>📷</span>
                View Certificate
              </button>
            ) : (
              <span className={styles['info-value']}>{provider.certificate}</span>
            )}
          </div>
        )}
        {/*provider.valid_id && (
          <div><span className={styles['info-label']}>Valid ID:</span> <span className={styles['info-value']}>{provider.valid_id}</span></div>
        )*/}
        {provider.proof_of_address && (
          <div style={{ marginBottom: 12 }}>
            <span className={styles['info-label']}>Proof of Address:</span>
            {isImageUrl(provider.proof_of_address) ? (
              <button
                onClick={() => { setImageModalUrl(provider.proof_of_address); setModalVisible(true); }}
                style={{
                  marginLeft: 12,
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,246,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.2)';
                }}
              >
                <span style={{ fontSize: 16 }}>📷</span>
                View Proof
              </button>
            ) : (
              <span className={styles['info-value']}>{provider.proof_of_address}</span>
            )}
          </div>
        )}
      </div>
      <div className={styles['bio']}>
        <span className={styles['info-label']}>Bio:</span> {provider.bio || 'No bio provided.'}
      </div>
      {/* Customer Reviews Section - only show when rating is clicked */}
      {showReviews && <ProviderReviews providerId={provider.user_id} hideHeader />}
      <div className={styles['gallery-section']}>
        <div className={styles['gallery-header']}>
          <h4>Service Gallery</h4>
          <p>View photos from this service provider</p>
        </div>
        {galleryImages.length > 0 ? (
          <div className={styles['gallery-grid']}>
            {galleryImages.map((image) => (
              <div key={image.id} className={styles['gallery-item']}>
                <img 
                  src={image.image_url} 
                  alt={`Gallery ${image.file_name}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles['empty-gallery']}>
            <p>No images uploaded yet</p>
          </div>
        )}
      </div>
      {imageModalUrl && modalVisible && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,41,59,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeInBg 0.25s' }} onClick={() => { setModalVisible(false); setTimeout(() => setImageModalUrl(null), 200); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 18, maxWidth: '92vw', maxHeight: '92vh', boxShadow: '0 8px 32px rgba(37,99,235,0.18)', position: 'relative', animation: 'fadeInImg 0.32s' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 10, right: 16, fontSize: 32, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', zIndex: 2, borderRadius: 8, transition: 'background 0.18s' }} onMouseEnter={e => e.currentTarget.style.background = '#e0e7ef'} onMouseLeave={e => e.currentTarget.style.background = 'none'} onClick={() => { setModalVisible(false); setTimeout(() => setImageModalUrl(null), 200); }}>&times;</button>
            <img src={imageModalUrl} alt="Preview" style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: 12, display: 'block', margin: '0 auto', boxShadow: '0 2px 12px #2563eb22', animation: 'fadeInImg 0.32s' }} />
          </div>
                     <style>{`
             @keyframes fadeInBg { from { opacity: 0; } to { opacity: 1; } }
             @keyframes fadeInImg { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
           `}</style>
        </div>
      )}
    </div>
  );
};

// Helper function to check if a string is an image URL
function isImageUrl(url) {
  return typeof url === 'string' && url.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i);
}

export default ProviderProfile; 