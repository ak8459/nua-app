import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.scss';

const Navbar = () => {
  const { cartCount, toggleCartDrawer } = useCart();
  const navigate = useNavigate();

  return (
    <header className={styles.navbarHeader}>
      <div className={`container ${styles.navbarContainer}`}>
        {/* Brand Logo */}
        <Link to="/" className={styles.logo}>
          <span>A E T H E R</span>
          <span className={styles.logoDot}>.</span>
        </Link>

        {/* Navigation Links */}
        <nav className={styles.navMenu}>
          <Link to="/" className={styles.navLink}>Collection</Link>
          <a href="#electronics" className={styles.navLink} onClick={(e) => {
            e.preventDefault();
            navigate('/?category=electronics');
          }}>Tech</a>
          <a href="#jewelry" className={styles.navLink} onClick={(e) => {
            e.preventDefault();
            navigate('/?category=jewelery');
          }}>Jewelry</a>
          <a href="#clothing" className={styles.navLink} onClick={(e) => {
            e.preventDefault();
            navigate('/?category=clothing');
          }}>Apparel</a>
        </nav>

        {/* Actions (Cart) */}
        <div className={styles.actions}>
          <button 
            className={styles.cartBtn} 
            onClick={toggleCartDrawer}
            aria-label="Open shopping cart"
          >
            <FiShoppingBag className={styles.cartIcon} />
            {cartCount > 0 && (
              <span className={styles.badge} key={cartCount}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
