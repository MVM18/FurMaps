import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './ProviderProfile.module.css';

const ProviderProfile = ({ userId }) => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const fetchProvider = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, address, bio, profile_picture')
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
  }, [userId]);

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
      </div>
      <div className={styles['bio']}>
        <span className={styles['info-label']}>Bio:</span> {provider.bio || 'No bio provided.'}
      </div>
    </div>
  );
};

export default ProviderProfile; 