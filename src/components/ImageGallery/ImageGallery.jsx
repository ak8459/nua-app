import { useState } from 'react';
import styles from './ImageGallery.module.scss';

const ImageGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className={styles.placeholder}>No image available</div>;
  }

  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className={styles.gallery}>
      {/* Primary Display */}
      <div className={styles.primaryWrapper}>
        <img 
          src={images[activeIndex]} 
          alt={`Product view ${activeIndex + 1}`} 
          className={styles.primaryImage} 
        />
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className={styles.thumbnailContainer}>
          <div className={styles.thumbnailTrack}>
            {images.map((img, index) => (
              <button
                key={index}
                className={`${styles.thumbnailBtn} ${index === activeIndex ? styles.active : ''}`}
                onClick={() => handleThumbnailClick(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${index + 1}`} 
                  className={styles.thumbnailImage} 
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
