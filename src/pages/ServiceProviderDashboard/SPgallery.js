import React, { useState } from 'react';
import './SPgallery.css';

const ServiceGallery = () => {
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),
            url: e.target.result,
            name: file.name
          };
          setUploadedImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset the input
    event.target.value = '';
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const renderPlaceholders = () => {
    const placeholders = [];
    const totalSlots = 8;
    
    // Add uploaded images
    uploadedImages.forEach((image, index) => {
      if (index < totalSlots) {
        placeholders.push(
          <div key={`image-${image.id}`} className="gallery-item-container">
            <div className="gallery-item uploaded">
              <img 
                src={image.url} 
                alt={image.name}
                className="gallery-image"
              />
              <div className="gallery-overlay">
                <button
                  onClick={() => removeImage(image.id)}
                  className="remove-button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      }
    });
    
    // Add empty placeholders
    const remainingSlots = totalSlots - uploadedImages.length;
    for (let i = 0; i < remainingSlots; i++) {
      placeholders.push(
        <div key={`placeholder-${i}`} className="gallery-item-container">
          <div className="gallery-item placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>
      );
    }
    
    return placeholders;
  };

  return (
    <div className="service-gallery-wrapper">
      <div className="service-gallery-container">
        <div className="gallery-header">
          <div className="gallery-title-section">
            <h2 className="gallery-title">Service Gallery</h2>
            <label className="add-photos-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Add Photos</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <div className="gallery-subtitle">
            <p>Showcase your work with photos</p>
          </div>
        </div>
        
        <div className="gallery-grid">
          {renderPlaceholders()}
        </div>
        
        {uploadedImages.length === 0 && (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <p className="empty-message">No photos uploaded yet</p>
            <label className="upload-first-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Upload Your First Photo
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceGallery;