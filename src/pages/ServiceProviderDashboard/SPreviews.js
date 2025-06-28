import './SPreviews.css';

const CustomerReview = () => {
  const reviews = [
    {
      initials: "AS",
      name: "Alice Smith",
      date: "2024-01-10",
      comment: "Sarah was amazing with Max. Very professional and caring.",
    },
    {
      initials: "BJ",
      name: "Bob Johnson",
      date: "2024-01-10",
      comment: "Excellent service, highly recommended!",
    },
  ];

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
                <h3>{review.name}</h3>
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