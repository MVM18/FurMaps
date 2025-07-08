import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './ProviderProfile.module.css';
import ProviderReviews from '../../components/ProviderReviews';
import BookingModal from '../../components/BookingModal';

const REPORT_REASONS = [
  'Fraud or Scam',
  'Inappropriate Content',
  'Abusive Behavior',
  'Other',
];

function getServiceIcon(serviceType) {
  switch ((serviceType || '').toLowerCase()) {
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
}

const ProviderProfile = ({ userId }) => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportError, setReportError] = useState('');
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [providerServices, setProviderServices] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // For booking modal

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

  // Report submit handler
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    setReportSuccess('');
    setReportError('');
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setReportError('You must be logged in to report.');
        setReportLoading(false);
        return;
      }
      // Fetch the current user's profile to get their user_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      if (profileError || !profile) {
        setReportError('Could not find your profile.');
        setReportLoading(false);
        return;
      }
      const reporterUserId = profile.user_id;
      if (!reportReason) {
        setReportError('Please select a reason.');
        setReportLoading(false);
        return;
      }
      const { error } = await supabase.from('provider_reports').insert([
        {
          provider_id: provider.user_id,
          reporter_id: reporterUserId,
          reason: reportReason,
          details: reportDetails,
        },
      ]);
      if (error) {
        setReportError('Failed to submit report.');
      } else {
        setReportSuccess('Report submitted successfully!');
        setShowReportModal(false);
        setReportReason('');
        setReportDetails('');
        alert('Report submitted successfully! Your report will be reviewed by the admin.');
      }
    } catch (err) {
      setReportError('An error occurred.');
    } finally {
      setReportLoading(false);
    }
  };

  // Handler for booking success
  const handleBookingSuccess = (booking) => {
    setSelectedService(null);
    alert('Booking successful!');
  };

  if (!userId) return null;
  if (loading) return <div style={{ padding: 32 }}>Loading provider profile...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;
  if (!provider) return null;

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
          <h2 className={styles['profile-name']} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {provider.first_name} {provider.last_name}
            {/* Report Icon Button */}
            <button
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                marginLeft: 8,
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: '#ef4444',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center'
              }}
              title="Report this provider"
              onClick={() => setShowReportModal(true)}
            >
              <span role="img" aria-label="Report">🚩</span>
            </button>
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
                onClick={() => setSelectedService(service)}
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
      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-title">Report Provider</div>
            <form onSubmit={handleReportSubmit}>
              <div className="modal-field">
                <label htmlFor="report-reason"><strong>Reason:</strong></label>
                <select
                  id="report-reason"
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: 4, marginBottom: 12 }}
                >
                  <option value="">Select a reason</option>
                  {REPORT_REASONS.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              <div className="modal-field">
                <label htmlFor="report-details"><strong>Details (optional):</strong></label>
                <textarea
                  id="report-details"
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px', marginTop: 4, resize: 'vertical' }}
                  placeholder="Add more details (optional)"
                />
              </div>
              {reportError && <div style={{ color: 'red', marginTop: 8 }}>{reportError}</div>}
              {reportSuccess && <div style={{ color: 'green', marginTop: 8 }}>{reportSuccess}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
                <button type="button" className="modal-close-btn" onClick={() => setShowReportModal(false)} disabled={reportLoading}>Cancel</button>
                <button type="submit" style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }} disabled={reportLoading}>
                  {reportLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Image Modal for Certificate/Proof */}
      {modalVisible && imageModalUrl && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, position: 'relative', maxWidth: '90vw', maxHeight: '90vh', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <button onClick={() => setModalVisible(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: '#ef4444' }}>×</button>
            <img src={imageModalUrl} alt="Document" style={{ maxWidth: '80vw', maxHeight: '70vh', borderRadius: 8 }} />
          </div>
        </div>
      )}
      {/* Booking Modal Placeholder */}
      {selectedService && (
        <BookingModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

// Helper function to check if a string is an image URL
function isImageUrl(url) {
  return typeof url === 'string' && url.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i);
}

export default ProviderProfile; 