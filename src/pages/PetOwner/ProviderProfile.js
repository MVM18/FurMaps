import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './ProviderProfile.module.css';

const ProviderProfile = ({ userId }) => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const fetchProvider = async () => {
      setLoading(true);
      setError(null);
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
      setLoading(false);
    };
    fetchProvider();
    setGalleryImages([]); // No placeholder images, only real images should be set here
  }, [userId]);

  const fetchGalleryImages = async () => {
    // Placeholder gallery logic; replace with real fetch if available
    setGalleryImages([
      '/images/dog-human.png',
      '/images/dog-cat.png',
      '/images/dog-leash.png',
      '/images/dog-background.png',
    ]);
  };

  if (!userId) return null;
  if (loading) return <div style={{ padding: 32 }}>Loading provider profile...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;
  if (!provider) return null;

  return (
    <div className={styles['provider-profile-card']}>
      <div className={styles['profile-info-row']}>
        <img
          src={provider.profile_picture || 'https://via.placeholder.com/120x120/e5e7eb/6b7280?text=Profile'}
          alt="Profile"
          className={styles['profile-photo']}
        />
        <div className={styles['profile-details']}>
          <h2 className={styles['profile-name']}>
            {provider.first_name} {provider.last_name}
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
      <div className={styles['gallery-section']}>
        <div className={styles['gallery-header']}>
          <h4>Service Gallery</h4>
          <p>View photos from this service provider</p>
        </div>
        {galleryImages.length > 0 ? (
          <div className={styles['gallery-grid']}>
            {galleryImages.map((image, idx) => (
              <div key={idx} className={styles['gallery-item']}>
                <img src={image} alt={`Gallery ${idx + 1}`} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles['empty-gallery']}>
            <p>No images uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile; 