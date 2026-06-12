import { Link } from 'react-router-dom';
import { FiPlus, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { getEnrichedProduct } from '../../utils/mockGenerator';
import styles from './ProductCard.module.scss';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  // Ensure product has enriched mock variant fields
  const enrichedProduct = product.variants ? product : getEnrichedProduct(product);
  
  const { id, title, price, originalPrice, brand, image, colors, variants } = enrichedProduct;

  // Determine the default available variant for Quick Add
  const getDefaultVariant = () => {
    for (const color of colors) {
      const sizeMatrix = variants[color.name];
      for (const size in sizeMatrix) {
        if (sizeMatrix[size].status !== 'sold-out') {
          return { color: color.name, size };
        }
      }
    }
    return null; // All sold out
  };

  const defaultVariant = getDefaultVariant();
  const isAllSoldOut = !defaultVariant;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultVariant) {
      addToCart(enrichedProduct, defaultVariant.color, defaultVariant.size, 1);
    }
  };

  return (
    <div className={styles.card}>
      <Link to={`/product/${id}`} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <img src={image} alt={title} className={styles.productImage} loading="lazy" />
          
          {isAllSoldOut && (
            <div className={styles.soldOutBadge}>
              <span>Sold Out</span>
            </div>
          )}
        </div>
      </Link>

      <div className={styles.content}>
        <div className={styles.brand}>{brand || 'Premium Goods'}</div>
        <Link to={`/product/${id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{title}</h3>
        </Link>
        
        <div className={styles.footer}>
          <div className={styles.priceContainer}>
            <span className={styles.price}>${price.toFixed(2)}</span>
            {originalPrice && (
              <span className={styles.originalPrice}>${originalPrice.toFixed(2)}</span>
            )}
          </div>

          <button 
            className={styles.quickAddBtn}
            onClick={handleQuickAdd}
            disabled={isAllSoldOut}
            aria-label={`Quick add ${title} to cart`}
            title={isAllSoldOut ? "Sold Out" : "Quick Add"}
          >
            {isAllSoldOut ? (
              <span className={styles.soldOutText}>Out of Stock</span>
            ) : (
              <>
                <FiPlus className={styles.plusIcon} />
                <FiShoppingBag className={styles.bagIcon} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
