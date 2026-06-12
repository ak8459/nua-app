import { Route, Routes } from "react-router-dom";
import ProductListingPage from "../pages/ProductListingPage/ProductListingPage";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<ProductListingPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default AppRouter;