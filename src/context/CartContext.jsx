
import { createContext, useContext, useState, useEffect } from 'react';

// carrt context
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  // console.log('context', context);

  // throw error 
  if (!context) {
    // console.log('context error',);
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
// -------------------------------------------------------
// cart provider
export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart_items');
      // console.log('savedCart', savedCart);

      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Error loading cart items', e);
      return [];
    }
  });


  // -------------------------------------------------------
  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error saving cart items to localStorage', e);
    }
  }, [cartItems]);

  const toggleCartDrawer = () => {
    setIsCartOpen(prev => !prev);
  };

  const setCartDrawerOpen = (isOpen) => {
    setIsCartOpen(isOpen);
  };

  // Generating unique key for item variants
  const getCartItemId = (productId, color, size) => {
    return `${productId}-${color.replace(/\s+/g, '')}-${size}`;
  };

  // Add to cart function
  const addToCart = (product, color, size, quantity = 1) => {
    const itemId = getCartItemId(product.id, color, size);

    // Checking variant stock limit and setting it deafult 10 if stock is not available
    const variantStock = product.variants?.[color]?.[size]?.stock ?? 10;

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.cartItemId === itemId);
      // console.log('line 68', existingItemIndex);

      if (existingItemIndex > -1) {
        // Item with same variant exists, increment quantity up to stock
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        const newQty = Math.min(existingItem.quantity + quantity, variantStock);

        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQty
        };
        return updatedItems;
      } else {
        // Add new item variant
        return [
          ...prevItems,
          {
            cartItemId: itemId,
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            brand: product.brand,
            color,
            size,
            quantity: Math.min(quantity, variantStock),
            stock: variantStock
          }
        ];
      }
    });

    // set true Auto open drawer 
    setIsCartOpen(true);
  };

  // delete itme from cart
  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  // update item quantity
  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = Math.min(quantity, item.stock);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // finding cart count
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // finding cart subtotal
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        toggleCartDrawer,
        setCartDrawerOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartCount,
        cartSubtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
