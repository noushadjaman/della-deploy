import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import BrandProducts from './pages/BrandProducts';
import CategoryProducts from './pages/CategoryProducts';
import AllBrands from './pages/AllBrands';
import AllCategories from './pages/AllCategories';
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';
import AllProducts from './pages/AllProducts';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import About from './pages/About';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App d-flex flex-column min-vh-100">
            <Header />
            <div className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/brand/:brandName" element={<BrandProducts />} />
                <Route path="/category/:categoryName" element={<CategoryProducts />} />
                <Route path="/brands" element={<AllBrands />} />
                <Route path="/categories" element={<AllCategories />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/track-order/:orderId" element={<OrderTracking />} />
                <Route path="/search" element={<Search />} />
                <Route path="/products" element={<AllProducts />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/about" element={<About />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Chatbot />
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
