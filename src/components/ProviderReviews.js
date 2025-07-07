import '../pages/ServiceProviderDashboard/SPreviews.css';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const ProviderReviews = ({ providerId }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!providerId) return;
    fetchReviews();
    // eslint-disable-next-line
  }, [providerId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      // Fetch reviews for the given providerId
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          bookings (
            pet_name,
            pet_type,
            services (
              name
            )
          )
        `)
        .eq('service_provider_id', providerId)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        setError('Failed to load reviews');
        return;
      }

      // Fetch profile data for all pet owners who left reviews
      if (reviewsData && reviewsData.length > 0) {
        const petOwnerIds = [...new Set(reviewsData.map(review => review.pet_owner_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', petOwnerIds);

        // Combine reviews with profile data
        const reviewsWithProfiles = reviewsData.map(review => {
          const profile = profilesData?.find(p => p.user_id === review.pet_owner_id);
          return {
            ...review,
            profiles: profile || null
          };
        });
        setReviews(reviewsWithProfiles);
      } else {
        setReviews([]);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const StarRating = ({ rating }) => (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
          {i < rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return (first + last).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="reviews-container">
        <div className="reviews-header">
          <h2>Customer Reviews</h2>
          <p>See what pet owners are saying</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-container">
        <div className="reviews-header">
          <h2>Customer Reviews</h2>
          <p>See what pet owners are saying</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        <p>See what pet owners are saying</p>
      </div>
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          <p>No reviews yet. Complete some bookings to start receiving reviews!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="reviewer-avatar">
                <span>{getInitials(review.profiles?.first_name, review.profiles?.last_name)}</span>
              </div>
              <div className="review-content">
                <div className="reviewer-info">
                  <div>
                    <h3>{`${review.profiles?.first_name || 'Anonymous'} ${review.profiles?.last_name || ''}`}</h3>
                    <StarRating rating={review.rating} />
                  </div>
                  <span>{formatDate(review.created_at)}</span>
                </div>
                <p>{review.comment}</p>
                {review.bookings && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <em>Service: {review.bookings.services?.name || 'Unknown service'}</em>
                    {review.bookings.pet_name && (
                      <span> • Pet: {review.bookings.pet_name} ({review.bookings.pet_type})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderReviews; 