import { useEffect, useRef } from 'react';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import styles from './CartDrawer.module.scss';

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    setCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal
  } = useCart();

  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        setCartDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setCartDrawerOpen]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setCartDrawerOpen(false)}>
      <div 
        className={styles.drawer} 
        onClick={(e) => e.stopPropagation()}
        ref={drawerRef}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <FiShoppingBag />
            <h2>Shopping Bag</h2>
            <span className={styles.itemCount}>
              ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
            </span>
          </div>
          <button 
            className={styles.closeBtn} 
            onClick={() => setCartDrawerOpen(false)}
            aria-label="Close cart drawer"
          >
            <FiX />
          </button>
        </div>

        {/* Cart items list */}
        <div className={styles.itemsContainer}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FiShoppingBag />
              </div>
              <p className={styles.emptyText}>Your cart is currently empty.</p>
              <button 
                className={styles.shopBtn} 
                onClick={() => setCartDrawerOpen(false)}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {cartItems.map((item) => (
                <div key={item.cartItemId} className={styles.cartItem}>
                  <img src={item.image} alt={item.title} className={styles.thumbnail} />
                  
                  <div className={styles.itemInfo}>
                    <span className={styles.itemBrand}>{item.brand || 'Premium Goods'}</span>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    
                    <div className={styles.itemMeta}>
                      <span className={styles.metaBadge}>Color: {item.color}</span>
                      <span className={styles.metaBadge}>Size: {item.size}</span>
                    </div>

                    <div className={styles.itemActions}>
                      {/* Quantity Controls */}
                      <div className={styles.qtyControls}>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <FiMinus />
                        </button>
                        <span className={styles.qtyVal}>{item.quantity}</span>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label="Increase quantity"
                        >
                          <FiPlus />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.cartItemId)}
                        aria-label="Remove item"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  <div className={styles.itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                    {item.quantity > 1 && (
                      <span className={styles.unitPrice}>
                        ${item.price.toFixed(2)} / ea
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Billing Details */}
        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span className={styles.summaryVal}>${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={`${styles.summaryVal} ${styles.freeShipping}`}>Calculated at Checkout</span>
            </div>
            
            <hr className={styles.divider} />
            
            <div className={`${styles.summaryRow} ${styles.grandTotalRow}`}>
              <span>Total</span>
              <span className={styles.grandTotalVal}>${cartSubtotal.toFixed(2)}</span>
            </div>

            <button 
              className={styles.checkoutBtn}
              onClick={() => alert("Checkout pipeline not configured for demo.")}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
