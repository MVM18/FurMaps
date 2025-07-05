import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './ReviewModal.css';

const ReviewModal = ({ booking, isOpen, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to leave a review');
        return;
      }

      // Check if review already exists for this booking
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', booking.id)
        .single();

      if (existingReview) {
        setError('You have already reviewed this booking');
        return;
      }

      // Create the review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          booking_id: booking.id,
          pet_owner_id: user.id,
          service_provider_id: booking.service_provider_id,
          service_id: booking.service_id,
          rating: rating,
          comment: comment.trim()
        });

      if (reviewError) {
        console.error('Error creating review:', reviewError);
        setError('Failed to submit review. Please try again.');
        return;
      }

      // Success - close modal and refresh
      onReviewSubmitted();
      onClose();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
    setError('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      setError('');
      onClose();
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="review-modal-overlay" onClick={handleClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h2>Leave a Review</h2>
          <button className="close-btn" onClick={handleClose} disabled={isSubmitting}>
            &times;
          </button>
        </div>

        <div className="review-modal-content">
          <div className="booking-info">
            <h3>{booking.services?.name || 'Service'}</h3>
            <p>Date: {new Date(booking.service_date).toLocaleDateString()}</p>
            <p>Pet: {booking.pet_name} ({booking.pet_type})</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rating-section">
              <label>Your Rating:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => handleStarClick(star)}
                    disabled={isSubmitting}
                  >
                    {star <= rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
              <span className="rating-text">
                {rating === 0 && 'Select a rating'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </span>
            </div>

            <div className="comment-section">
              <label htmlFor="comment">Your Review:</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setError('');
                }}
                placeholder="Share your experience with this service..."
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
              />
              <span className="char-count">{comment.length}/500</span>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="review-modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || rating === 0 || !comment.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal; 