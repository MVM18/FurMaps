import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import './SPgallery.css';

const ServiceGallery = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get current user ID
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        fetchGalleryImages(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchGalleryImages = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('provider_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery images:', error);
        return;
      }

      setUploadedImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };

  const uploadImageToStorage = async (file) => {
    if (!currentUserId) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUserId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `gallery-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const saveImageToDatabase = async (imageUrl, fileName) => {
    if (!currentUserId) return null;

    const { data, error } = await supabase
      .from('gallery_images')
      .insert({
        provider_id: currentUserId,
        image_url: imageUrl,
        file_name: fileName,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving image to database:', error);
      return null;
    }

    return data;
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Maximum size is 5MB.`);
            continue;
          }

          // Upload to storage
          const imageUrl = await uploadImageToStorage(file);
          if (!imageUrl) {
            alert(`Failed to upload ${file.name}`);
            continue;
          }

          // Save to database
          const savedImage = await saveImageToDatabase(imageUrl, file.name);
          if (savedImage) {
            setUploadedImages(prev => [savedImage, ...prev]);
          }
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const removeImage = async (imageId) => {
    try {
      // Get image data to delete from storage
      const imageToDelete = uploadedImages.find(img => img.id === imageId);
      if (!imageToDelete) return;

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        console.error('Error deleting image from database:', dbError);
        return;
      }

      // Delete from storage (extract file path from URL)
      const urlParts = imageToDelete.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `gallery-images/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('gallery-images')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting image from storage:', storageError);
      }

      // Update local state
      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Error removing image. Please try again.');
    }
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
                src={image.image_url} 
                alt={image.file_name}
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
            <label className={`add-photos-button ${isUploading ? 'uploading' : ''}`}>
              {isUploading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>Add Photos</span>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                disabled={isUploading}
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
        
        {uploadedImages.length === 0 && !isUploading && (
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
                disabled={isUploading}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceGallery;