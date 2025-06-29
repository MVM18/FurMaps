import './SPreviews.css';

const CustomerReview = () => {
  const reviews = [
    {
      initials: "AS",
      name: "Alice Smith",
      date: "2024-01-10",
      rating: 5, // Add rating (1-5)
      comment: "Sarah was amazing with Max. Very professional and caring.",
    },
    {
      initials: "BJ",
      name: "Bob Johnson",
      date: "2024-01-10",
      rating: 4, // Add rating (1-5)
      comment: "Excellent service, highly recommended!",
    },
  ];

  // Star rating component
  const StarRating = ({ rating }) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            className={`star ${i < rating ? 'filled' : ''}`}
          >
            {i < rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        <p>See what your customers are saying</p>
      </div>

      <div className="reviews-list">
        {reviews.map((review, index) => (
          <div key={index} className="review-card">
            <div className="reviewer-avatar">
              <span>{review.initials}</span>
            </div>
            <div className="review-content">
              <div className="reviewer-info">
                <div>
                  <h3>{review.name}</h3>
                  <StarRating rating={review.rating} />
                </div>
                <span>{review.date}</span>
              </div>
              <p>{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerReview;