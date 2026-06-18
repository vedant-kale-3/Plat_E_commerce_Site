import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
