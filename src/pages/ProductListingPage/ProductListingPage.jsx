import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiSliders, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import ProductCard from '../../components/ProductCard/ProductCard';
import { getEnrichedProduct } from '../../utils/mockGenerator';
import styles from './ProductListingPage.module.scss';

const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc', 'rating'

  // console.log('products', products);
  // console.log('products', products.length);

  const loadProducts = async () => {
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      // console.log('line 22', response);

      if (!response.ok) {
        console.log('indside error block');

        throw new Error('Failed to retrieve products.' + response.status);
      }

      const data = await response.json();
      // console.log('getting data', data);

      const enriched = data.map(p => getEnrichedProduct(p));
      setProducts(enriched);
      setError(null);
    } catch (err) {
      // console.log(err);

      setError(err.message || 'An unexpected error occurred while loading products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchProductsOnMount = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        // console.log('getting res', response);

        if (!response.ok) {
          throw new Error('Failed to retrieve products.');
        }
        const data = await response.json();
        // console.log('getting res data', data);

        const enriched = data.map(p => getEnrichedProduct(p));
        // console.log('enriched', enriched);

        if (active) {
          setProducts(enriched);
          setError(null);
          // console.log('inside active');

        }
      } catch (err) {
        // console.log(err);

        if (active) {
          setError(err.message || 'An unexpected error occurred.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProductsOnMount();
    // cleanup function to prevent state updates on unmounted components
    return () => { active = false; };
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadProducts();
  };

  // category handler function
  const handleCategoryChange = (category) => {
    // console.log('log category', category);

    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // Filter and Sort Logic
  const filterByCategory = (product) => {
    if (activeCategory === "all") return true;

    const productCategory = product.category.toLowerCase();
    const selectedCategory = activeCategory.toLowerCase();

    if (selectedCategory === "clothing") {
      return productCategory.includes("clothing");
    }

    return productCategory === selectedCategory;
  };

  // search handler function
  const filterBySearch = (product) => {
    const search = searchQuery.toLowerCase();

    return (
      product.title.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search)
    );
  };

  const sortProducts = (a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;

      case "price-desc":
        return b.price - a.price;

      case "rating":
        return b.rating.rate - a.rating.rate;

      default:
        return 0;
    }
  };

  const filteredProducts = products
    ?.filter(filterByCategory)
    .filter(filterBySearch)
    .sort(sortProducts);

  // Categories list
  const categories = [
    { id: 'all', label: 'All Collection' },
    { id: 'clothing', label: 'Apparel' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'jewelery', label: 'Jewelry' }
  ];

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroSubtitle}>Autumn / Winter 2026</span>
            <h1 className={styles.heroTitle}>Curated Objects for Modern Living.</h1>
            <p className={styles.heroDescription}>
              Explore our latest collection of premium clothing, jewelry, and refined electronic goods. Craftsmanship meets utility.
            </p>
          </div>
        </div>
      </section>

      {/* Control panel (Filter, search, sorting) */}
      <section className={styles.controlsSection}>
        <div className="container">
          <div className={styles.controlsWrapper}>
            {/* Search Bar */}
            <div className={styles.searchBox}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Category Filter Tabs */}
            <div className={styles.tabsContainer}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.tabBtn} ${activeCategory === cat.id ? styles.activeTab : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sorting Dropdown */}
            <div className={styles.sortContainer}>
              <FiSliders className={styles.sortIcon} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid Area */}
      <section className={styles.gridSection}>
        <div className="container">
          {loading ? (
            // Shimmer Loading Skeleton
            <div className={styles.grid}>
              {[...Array(8)].map((_, index) => (
                <div key={index} className={styles.skeletonCard}>
                  <div className={`shimmer-bg ${styles.skeletonImage}`} />
                  <div className={styles.skeletonContent}>
                    <div className={`shimmer-bg ${styles.skeletonBrand}`} />
                    <div className={`shimmer-bg ${styles.skeletonTitle}`} />
                    <div className={styles.skeletonFooter}>
                      <div className={`shimmer-bg ${styles.skeletonPrice}`} />
                      <div className={`shimmer-bg ${styles.skeletonBtn}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error State
            <div className={styles.errorContainer}>
              <FiAlertTriangle className={styles.errorIcon} />
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button onClick={handleRetry} className={styles.retryBtn}>
                <FiRefreshCw /> Retry Loading
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            // Empty State
            <div className={styles.emptyContainer}>
              <FiSearch className={styles.emptyIcon} />
              <h3>No items found</h3>
              <p>We couldn't find any products matching your current query.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  handleCategoryChange('all');
                }}
                className={styles.clearFiltersBtn}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            // Active Product Grid
            <div className={styles.grid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductListingPage;
