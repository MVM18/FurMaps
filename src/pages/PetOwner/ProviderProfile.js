import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './ProviderProfile.module.css';
import ProviderReviews from '../../components/ProviderReviews';

const REPORT_REASONS = [
  'Fraud or Scam',
  'Inappropriate Content',
  'Abusive Behavior',
  'Other',
];

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
          <div className={styles['rating']}>★★★★★ 4.9 (89 reviews)</div>
        </div>
      </div>
      <div className={styles['info-grid']}>
        <div><span className={styles['info-label']}>Phone:</span> <span className={styles['info-value']}>{provider.phone || 'N/A'}</span></div>
        <div><span className={styles['info-label']}>Address:</span> <span className={styles['info-value']}>{provider.address || 'N/A'}</span></div>
        <div><span className={styles['info-label']}>Provider ID:</span> <span className={styles['info-value']}>{provider.user_id?.slice(0, 8) || 'N/A'}...</span></div>
        {provider.services_offered && (
          <div><span className={styles['info-label']}>Services:</span> <span className={styles['info-value']}>{provider.services_offered}</span></div>
        )}
        {provider.certificate && (
          <div><span className={styles['info-label']}>Certificate:</span> <span className={styles['info-value']}>{provider.certificate}</span></div>
        )}
        {provider.valid_id && (
          <div><span className={styles['info-label']}>Valid ID:</span> <span className={styles['info-value']}>{provider.valid_id}</span></div>
        )}
        {provider.proof_of_address && (
          <div><span className={styles['info-label']}>Proof of Address:</span> <span className={styles['info-value']}>{provider.proof_of_address}</span></div>
        )}
      </div>
      <div className={styles['bio']}>
        <span className={styles['info-label']}>Bio:</span> {provider.bio || 'No bio provided.'}
      </div>
      {/* Customer Reviews Section - inserted here */}
      <ProviderReviews providerId={provider.user_id} hideHeader />
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
    </div>
  );
};

export default ProviderProfile; 