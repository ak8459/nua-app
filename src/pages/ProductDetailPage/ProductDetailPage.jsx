import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiMinus, FiShoppingBag, FiTruck, FiShield, FiRotateCcw } from 'react-icons/fi';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import { getEnrichedProduct } from '../../utils/mockGenerator';
import { useCart } from '../../context/CartContext';
import styles from './ProductDetailPage.module.scss';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  // Fetch product detail
  useEffect(() => {
    let active = true;
    const fetchProductDetail = async () => {
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found.');
        }
        const data = await response.json();

        // Enrich
        const enriched = getEnrichedProduct(data);
        if (active) {
          setProduct(enriched);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Error loading product details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProductDetail();
    return () => { active = false; };
  }, [id]);

  // Handle URL parameter sync and initial variant selection
  useEffect(() => {
    if (!product) return;

    const queryColor = searchParams.get('color');
    const querySize = searchParams.get('size');

    // Validate if the color from query exists
    const validColor = product.colors.find(c => c.name === queryColor);
    const colorToSet = validColor ? validColor.name : product.colors[0].name;

    // Validate if the size from query exists
    const validSize = product.sizes.find(s => s === querySize);

    let sizeToSet;
    if (validSize) {
      sizeToSet = validSize;
    } else {
      // Find first size that is not sold out for this color
      const sizeMatrix = product.variants[colorToSet];
      const firstAvailableSize = product.sizes.find(
        size => sizeMatrix[size]?.status !== 'sold-out'
      );
      // Fallback to first size if all sold out
      sizeToSet = firstAvailableSize || product.sizes[0];
    }

    // Call updates asynchronously to prevent synchronous cascading renders inside effect
    Promise.resolve().then(() => {
      setSelectedColor(colorToSet);
      setSelectedSize(sizeToSet);
    });

    // Sync back to URL parameters replacing current history state if they differ
    if (queryColor !== colorToSet || querySize !== sizeToSet) {
      setSearchParams(
        { color: colorToSet, size: sizeToSet },
        { replace: true }
      );
    }
  }, [product, searchParams, setSearchParams]);

  // Update selected variant in UI and URL
  const handleColorChange = (colorName) => {
    // Reset quantity to 1 when variant changes
    setQuantity(1);
    setAddError(null);

    // Choose size that is available in new color, if current size is sold out in new color
    const newSizeMatrix = product.variants[colorName];
    let nextSize = selectedSize;
    if (newSizeMatrix[selectedSize]?.status === 'sold-out') {
      const firstAvailable = product.sizes.find(size => newSizeMatrix[size]?.status !== 'sold-out');
      if (firstAvailable) {
        nextSize = firstAvailable;
      }
    }

    setSelectedColor(colorName);
    setSelectedSize(nextSize);
    setSearchParams({ color: colorName, size: nextSize }, { replace: true });
  };

  const handleSizeChange = (sizeName) => {
    setQuantity(1);
    setAddError(null);
    setSelectedSize(sizeName);
    setSearchParams({ color: selectedColor, size: sizeName }, { replace: true });
  };

  if (loading) {
    return (
      <div className={`container ${styles.loadingContainer}`}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
          <p>Retrieving product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`container ${styles.errorContainer}`}>
        <div className={styles.errorWrapper}>
          <h3>Unable to load product</h3>
          <p>{error || 'The requested product could not be loaded.'}</p>
          <Link to="/" className={styles.backLink}>
            <FiArrowLeft /> Return to Collection
          </Link>
        </div>
      </div>
    );
  }

  // Selected Variant stock specifications
  const variantInfo = product.variants?.[selectedColor]?.[selectedSize] || { stock: 10, status: 'available' };
  const maxStock = variantInfo.stock;
  const isSoldOut = variantInfo.status === 'sold-out';
  const isLowStock = variantInfo.status === 'low-stock';

  const handleAddToCart = async () => {
    if (isSoldOut || isAdding) return;

    setIsAdding(true);
    setAddError(null);

    try {
      // Simulate API call with 1.2s delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 25% chance of simulated network failure
      if (Math.random() < 0.25) {
        throw new Error('Network Error: Failed to add item to bag. Please try again.');
      }

      addToCart(product, selectedColor, selectedSize, quantity);
    } catch (err) {
      setAddError(err.message || 'Failed to add item. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Back Link */}
        <Link to="/" className={styles.breadcrumbLink}>
          <FiArrowLeft /> Back to collection
        </Link>

        {/* Product View Split Layout */}
        <div className={styles.splitLayout}>
          {/* Left: Image Gallery */}
          <div className={styles.galleryCol}>
            <ImageGallery key={product.id} images={product.images} />
          </div>

          {/* Right: Product Details Panel */}
          <div className={styles.detailsCol}>
            <div className={styles.header}>
              <span className={styles.brand}>{product.brand}</span>
              <h1 className={styles.title}>{product.title}</h1>

              <div className={styles.priceSection}>
                <span className={styles.price}>${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className={styles.originalPrice}>${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
            </div>

            <hr className={styles.divider} />

            {/* Colors Swatches */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Color: <span className={styles.selectionVal}>{selectedColor}</span>
              </h3>
              <div className={styles.colorSwatches}>
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    className={`${styles.colorBtn} ${selectedColor === color.name ? styles.activeColor : ''}`}
                    style={{ '--swatch-color': color.hex }}
                    onClick={() => handleColorChange(color.name)}
                    aria-label={`Select color ${color.name}`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Sizes Selection */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Size: <span className={styles.selectionVal}>{selectedSize}</span>
              </h3>
              <div className={styles.sizeButtons}>
                {product.sizes.map((size) => {
                  const sizeStatus = product.variants[selectedColor]?.[size]?.status;
                  const isSizeSoldOut = sizeStatus === 'sold-out';
                  const isSizeLowStock = sizeStatus === 'low-stock';

                  return (
                    <button
                      key={size}
                      className={`
                        ${styles.sizeBtn} 
                        ${selectedSize === size ? styles.activeSize : ''} 
                        ${isSizeSoldOut ? styles.sizeSoldOut : ''}
                        ${isSizeLowStock ? styles.sizeLowStock : ''}
                      `}
                      onClick={() => handleSizeChange(size)}
                      disabled={isSizeSoldOut}
                      title={isSizeSoldOut ? `${size} - Sold Out` : isSizeLowStock ? `${size} - Low Stock` : `${size} - Available`}
                    >
                      <span>{size}</span>
                      {isSizeLowStock && <span className={styles.lowStockDot} />}
                    </button>
                  );
                })}
              </div>

              {/* Stock Status Message */}
              <div className={styles.stockStatus}>
                {isSoldOut ? (
                  <span className={styles.soldOutMsg}>Out of Stock: This variant is temporarily unavailable.</span>
                ) : isLowStock ? (
                  <span className={styles.lowStockMsg}>Low Stock: Only {maxStock} item{maxStock > 1 ? 's' : ''} left!</span>
                ) : (
                  <span className={styles.inStockMsg}>In Stock: Available to ship immediately.</span>
                )}
              </div>
            </div>

            {/* Action Row: Qty Picker & Add to Cart */}
            <div className={styles.actionRow}>
              {/* Quantity Picker */}
              <div className={styles.quantityPicker}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  aria-label="Decrease quantity"
                >
                  <FiMinus />
                </button>
                <span className={styles.qtyVal}>{isSoldOut ? 0 : quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(prev => Math.min(maxStock, prev + 1))}
                  disabled={quantity >= maxStock || isSoldOut}
                  aria-label="Increase quantity"
                >
                  <FiPlus />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                disabled={isSoldOut || isAdding}
              >
                {isAdding ? (
                  <>
                    <div className={styles.btnSpinner} data-testid="add-btn-spinner" />
                    <span>Adding to Bag...</span>
                  </>
                ) : (
                  <>
                    <FiShoppingBag />
                    <span>{isSoldOut ? 'Sold Out' : 'Add to Bag'}</span>
                  </>
                )}
              </button>
            </div>
            {addError && (
              <div className={styles.addToCartError} data-testid="add-to-cart-error">
                {addError}
              </div>
            )}

            <hr className={styles.divider} />

            {/* Description */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Details</h3>
              <p className={styles.description}>{product.description}</p>
            </div>

            {/* Trust Badges */}
            <div className={styles.trustRow}>
              <div className={styles.trustItem}>
                <FiTruck />
                <span>Free Shipping</span>
              </div>
              <div className={styles.trustItem}>
                <FiShield />
                <span>Secure Payment</span>
              </div>
              <div className={styles.trustItem}>
                <FiRotateCcw />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
