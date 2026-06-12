import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar/Navbar';
import CartDrawer from './components/CartDrawer/CartDrawer';
import ProductListingPage from './pages/ProductListingPage/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import AppRouter from './router/AppRouter';

function App() {
  return (
    // <BrowserRouter>
    // <CartProvider>
    <div className="app-container">
      <Navbar />
      {/* <Routes>
        <Route path="/" element={<ProductListingPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes> */}
      <AppRouter />
      <CartDrawer />
    </div>
    // </CartProvider>
    // </BrowserRouter>
  );
}

export default App;
