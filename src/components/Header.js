import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const [categories, setCategories] = useState([]);

  // Placeholder cycling logic
  const placeholders = [
    "Search for sneakers...",
    "Search for premium footwear...",
    "Search for Bata collection...",
    "Search for casual shoes...",
    "Search for formal leather shoes..."
  ];

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    // Update search input based on URL query parameter
    const queryParam = new URLSearchParams(location.search).get('q');
    if (location.pathname === '/search' && queryParam) {
      setSearchInput(decodeURIComponent(queryParam));
    } else if (location.pathname !== '/search') {
      setSearchInput('');
    }
  }, [location]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
      } catch (err) {
        console.error("Error fetching categories for header:", err);
      }
    }
    fetchCategories();

    const interval = setInterval(() => {
      setFade(true); // Start fading out
      setTimeout(() => {
        setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setFade(false); // Fade back in with new text
      }, 500); // Half a second for the fade transition
    }, 3500); // Change every 3.5 seconds

    return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error('Failed to log out');
    }
  }

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="py-2 py-lg-3 shadow-sm custom-navbar">
      <Container className="px-2 px-lg-3">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center me-2 me-lg-5 logo-container">
          <svg className="logo-svg" viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
            {/* The fill text */}
            <text x="10" y="45" className="logo-text-fill" fill="var(--accent)">DELLA</text>

            {/* The drawing stroke text */}
            <text x="10" y="45" className="logo-text-main" stroke="var(--secondary)">DELLA</text>

            {/* Red Accent Triangle */}
            <path className="logo-accent-triangle" d="M110,10 L120,10 L115,2 Z" fill="var(--primary)" />

            {/* Red signature dot - 2X big and at the corner of A */}
            <circle className="logo-dot" cx="160" cy="35" r="5" fill="var(--primary)" />
          </svg>
        </Navbar.Brand>

        {/* Cart and Login Section for Mobile View - Right Side */}
        <div className="d-flex align-items-center gap-3 ms-auto d-lg-none">
          {currentUser ? (
            <NavDropdown title={currentUser.email} id="user-dropdown-mobile" align="end" className="p-0">
              {currentUser.email === 'admin@admin.della' && (
                <NavDropdown.Item as={Link} to="/admin" className="text-primary fw-bold">Admin Panel</NavDropdown.Item>
              )}
              <NavDropdown.Item as={Link} to="/my-orders">My Orders</NavDropdown.Item>
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          ) : (
            <div className="d-flex">
              <Nav.Link as={Link} to="/login" className="px-2">Login</Nav.Link>
              <Nav.Link as={Link} to="/register" className="px-2">Register</Nav.Link>
            </div>
          )}

          <Nav.Link as={Link} to="/cart" className="position-relative">
            <i className="fas fa-shopping-cart fa-lg"></i>
            {cart.length > 0 && (
              <Badge pill bg="primary" className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                {cart.length}
              </Badge>
            )}
          </Nav.Link>
        </div>

        <Form className="d-flex flex-grow-1 mx-2 mx-lg-4 my-0 order-2 order-lg-2 search-form-container" onSubmit={handleSearch}>
          <div className="input-group custom-search-group">
            <span className="input-group-text search-icon-box px-2 px-lg-3">
              <i className="fas fa-search"></i>
            </span>
            <FormControl
              type="search"
              placeholder={placeholders[currentPlaceholderIndex]}
              className={`custom-search-input ${fade ? 'fade-placeholder' : ''}`}
              aria-label="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button className="custom-search-btn" type="submit">Search</Button>
          </div>
        </Form>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="order-3 custom-toggler" />

        <Navbar.Collapse id="basic-navbar-nav" className="order-4 order-lg-3">
          <Nav className="ms-auto mb-2 mb-lg-0 fw-medium align-items-center">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <NavDropdown title="Categories" id="basic-nav-dropdown">
              {categories.map(cat => (
                <NavDropdown.Item key={cat.id} as={Link} to={`/category/${cat.name}`}>{cat.name}</NavDropdown.Item>
              ))}
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/search?q=deals">Daily Deals</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/search?q=deals" className="text-primary fw-bold">Deals</Nav.Link>

            <div className="d-flex align-items-center ms-lg-3 mt-3 mt-lg-0">
              {currentUser ? (
                <NavDropdown title={currentUser.email} id="user-dropdown" align="end">
                  {currentUser.email === 'admin@admin.della' && (
                    <NavDropdown.Item as={Link} to="/admin" className="text-primary fw-bold">Admin Panel</NavDropdown.Item>
                  )}
                  <NavDropdown.Item as={Link} to="/my-orders">My Orders</NavDropdown.Item>
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <div className="d-flex">
                  <Nav.Link as={Link} to="/login" className="px-2">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register" className="px-2">Register</Nav.Link>
                </div>
              )}

              <Nav.Link as={Link} to="/cart" className="position-relative ms-3">
                <i className="fas fa-shopping-cart fa-lg"></i>
                {cart.length > 0 && (
                  <Badge pill bg="primary" className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                    {cart.length}
                  </Badge>
                )}
              </Nav.Link>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
