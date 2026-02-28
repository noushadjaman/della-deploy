import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert, Carousel } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [dailyDealProducts, setDailyDealProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState('');

  // Countdown to midnight — resets every day at 12:00:00 AM
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // next midnight
      const diff = Math.max(0, midnight - now);
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMoreClick = () => {
    navigate('/products');
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);

        const bannersQuery = query(collection(db, "banners"), orderBy("createdAt", "desc"));
        const bannersSnapshot = await getDocs(bannersQuery);
        const bannersData = bannersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBanners(bannersData);

        const categoriesQuery = query(collection(db, "categories"), orderBy("createdAt", "desc"));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(categoriesData);

        const brandsQuery = query(collection(db, "brands"), orderBy("createdAt", "desc"));
        const brandsSnapshot = await getDocs(brandsQuery);
        const brandsData = brandsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBrands(brandsData);

        const flashSaleQuery = query(collection(db, "products"), where("isFlashSale", "==", true));
        const flashSaleSnapshot = await getDocs(flashSaleQuery);
        const flashSaleData = flashSaleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFlashSaleProducts(flashSaleData);

        const dailyDealQuery = query(collection(db, "products"), where("isDailyDeal", "==", true));
        const dailyDealSnapshot = await getDocs(dailyDealQuery);
        const dailyDealData = dailyDealSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDailyDealProducts(dailyDealData);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <>
      <Container className="mb-5 mt-3">
        <Row className="g-3">

          {/* ── ROW 1 (all screens): Banner ── */}
          <Col lg={9} md={8} xs={12} className="order-1">
            {banners.length > 0 ? (
              <Carousel className="shadow-sm rounded overflow-hidden home-banner-container">
                {banners.map((banner) => (
                  <Carousel.Item key={banner.id} interval={3000}>
                    <a href="#categories" className="d-block w-100 text-decoration-none">
                      <img className="d-block w-100 home-banner-img" src={banner.imageUrl} alt={banner.title || "Banner"} />
                    </a>
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <div className="hero-section rounded p-5 d-flex align-items-center home-banner-container">
                <div className="text-white">
                  <span className="badge bg-warning text-dark mb-2">New Arrival</span>
                  <h1 className="display-4 fw-bold">Discover Latest Trends</h1>
                  <p className="lead mb-4">Shop the best products at unbeatable prices.</p>
                  <Button variant="light" className="rounded-pill fw-bold text-primary px-4">Shop Now</Button>
                </div>
              </div>
            )}
          </Col>

          {/* ── ROW 2 mobile (compact strip) | Sidebar desktop ── */}
          <Col lg={3} md={4} xs={12} className="order-2">

            {/* MOBILE ONLY: compact horizontal scrollable flash sale strip */}
            <div className="d-lg-none bg-white rounded shadow-sm border overflow-hidden">
              <div className="px-3 py-1 border-bottom d-flex align-items-center bg-light" style={{ gap: 0 }}>
                {/* Left: Flash label */}
                <span className="fw-bold text-danger" style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  <i className="fas fa-bolt me-1"></i> Flash
                </span>
                {/* Center: Live countdown */}
                <div className="flex-grow-1 text-center">
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: '#b91c1c',
                    background: '#fff1f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '1px 8px',
                    letterSpacing: '0.05em'
                  }}>
                    ⏰ {countdown}
                  </span>
                </div>
                {/* Right: More */}
                <small className="text-primary fw-bold" style={{ cursor: 'pointer', fontSize: '0.68rem', whiteSpace: 'nowrap' }} onClick={handleMoreClick}>More &gt;</small>
              </div>
              <div
                className="d-flex px-2 py-2"
                style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', gap: '8px' }}
              >
                {flashSaleProducts.length > 0 ? flashSaleProducts.slice(0, 8).map((product) => {
                  const discount = product.discount || 0;
                  const discountedPrice = discount > 0 ? (product.price * (1 - discount / 100)).toFixed(0) : product.price;
                  return (
                    <div
                      key={product.id}
                      className="d-flex align-items-center border rounded position-relative bg-white flex-shrink-0"
                      style={{ width: '150px', cursor: 'pointer', padding: '5px 7px' }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <span className="position-absolute top-0 start-0 badge bg-danger" style={{ fontSize: '0.45rem', margin: '2px' }}>-{discount}%</span>
                      <img src={product.imageUrl} alt={product.name} className="rounded me-2" style={{ width: '34px', height: '34px', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div className="text-truncate fw-semibold" style={{ fontSize: '0.67rem', maxWidth: '88px' }}>{product.name}</div>
                        <span className="text-danger fw-bold d-block" style={{ fontSize: '0.7rem' }}>৳{discountedPrice}</span>
                        <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.58rem' }}>৳{product.price}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center p-2 text-muted w-100"><small>No flash sales yet</small></div>
                )}
              </div>
            </div>

            {/* DESKTOP ONLY: tall sidebar flash sale */}
            <div className="d-none d-lg-flex bg-white rounded shadow-sm flex-column overflow-hidden border flash-sale-container" style={{ height: '100%' }}>
              <div className="p-2 p-lg-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                <div className="d-flex align-items-center gap-2">
                  <h6 className="mb-0 fw-bold text-danger flash-sale-header-title"><i className="fas fa-bolt me-1"></i> Flash</h6>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#b91c1c',
                    background: '#fff1f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '1px 8px',
                    letterSpacing: '0.05em'
                  }}>
                    ⏰ {countdown}
                  </span>
                </div>
                <small className="text-primary fw-bold shop-more-btn" style={{ cursor: 'pointer', fontSize: '0.65rem' }} onClick={handleMoreClick}>More &gt;</small>
              </div>
              <div className="overflow-auto p-1 p-lg-2 flash-sale-list flex-grow-1" style={{ minHeight: '0' }}>
                {flashSaleProducts.length > 0 ? flashSaleProducts.slice(0, 6).map((product) => {
                  const discount = product.discount || 0;
                  const discountedPrice = discount > 0 ? (product.price * (1 - discount / 100)).toFixed(0) : product.price;
                  // Simulated stock progress for "cool" effect
                  const stockLeft = Math.floor((parseInt(product.id.slice(-2), 16) % 30) + 5);
                  const progress = (stockLeft / 35) * 100;

                  return (
                    <div key={product.id} className="d-flex align-items-center p-3 mb-3 border rounded-3 position-relative bg-white hover-shadow-sm transition-all flash-sale-item-premium" style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${product.id}`)}>
                      <span className="position-absolute top-0 start-0 badge-premium-flash m-2">-{discount}% OFF</span>
                      <div className="me-3 position-relative">
                        <img src={product.imageUrl} alt={product.name} className="rounded-circle border" style={{ width: '64px', height: '64px', objectFit: 'cover' }} />
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <h6 className="mb-1 text-truncate fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{product.name}</h6>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="premium-price-tag"><span className="currency">৳</span>{discountedPrice}</span>
                          <small className="text-muted text-decoration-line-through" style={{ fontSize: '0.75rem' }}>৳{product.price}</small>
                        </div>
                        <div className="stock-progress-container w-100">
                          <div className="stock-progress-bar" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                          <small className="text-muted" style={{ fontSize: '0.6rem' }}>Available: {stockLeft}</small>
                          <small className="text-danger fw-bold" style={{ fontSize: '0.6rem' }}>Selling Fast</small>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center p-4 text-muted"><small>No flash sales yet</small></div>
                )}
              </div>
            </div>
          </Col>

          {/* ── ROW 3 mobile | ROW 2 desktop: Featured Products ── */}
          <Col lg={12} md={12} xs={12} className="order-3">
            <div id="products">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold mb-0 featured-products-title">Featured Products</h5>
                <Link to="/products" className="text-primary fw-bold text-decoration-none small">More &gt;</Link>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {!loading && products.length === 0 && (
                <div className="text-center py-5"><h5 className="text-muted">No products found yet.</h5></div>
              )}

              <div className="d-flex overflow-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', gap: '8px' }}>
                {products.map((product, idx) => (
                  <div
                    key={product.id}
                    className={`featured-product-item ${idx >= 4 ? 'd-none d-sm-block' : ''}`}
                    /* clamp: 130px min on very small phones, 40vw fluid, 220px max on desktop */
                    style={{ minWidth: 'clamp(130px, 38vw, 220px)', flex: '0 0 auto' }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </Col>

        </Row>
      </Container>

      <Container className="mb-5">
        <Row className="g-4">
          {/* Shop by Category */}
          <Col lg={6}>
            <div className="bg-white rounded shadow-sm overflow-hidden border h-100 p-3">
              <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <h5 className="fw-bold mb-0">Shop by Category</h5>
                <a href="#categories" className="text-primary fw-medium small" onClick={(e) => { e.preventDefault(); navigate('/categories'); }}>View All <i className="fas fa-arrow-right ms-1"></i></a>
              </div>
              <div className="d-flex overflow-auto pb-2 category-scroll-container" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {categories.map((cat, idx) => (
                  <div key={cat.id || idx} className="text-center me-4" style={{ minWidth: '80px', cursor: 'pointer' }} onClick={() => navigate(`/category/${cat.name}`)}>
                    <div className="rounded-circle overflow-hidden shadow-sm mb-2 d-flex align-items-center justify-content-center bg-white border mx-auto" style={{ width: '65px', height: '65px' }}>
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="fas fa-shopping-bag text-muted"></i>
                      )}
                    </div>
                    <span className="fw-medium text-dark d-block text-truncate" style={{ fontSize: '0.75rem' }}>{cat.name}</span>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-muted w-100 text-center py-3">No categories found.</div>
                )}
              </div>
            </div>
          </Col>

          {/* Brand Deals */}
          <Col lg={6}>
            <div className="bg-white rounded shadow-sm overflow-hidden border h-100">
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center brand-deals-header">
                <h5 className="mb-0 fw-bold text-primary"><i className="fas fa-tags me-1"></i> Brand Deals</h5>
                <small className="text-primary fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/brands')}>View All Brands &gt;</small>
              </div>
              <div className="p-3">
                <Row className="g-3">
                  {brands.slice(0, 4).map((brand) => (
                    <Col key={brand.id} xs={6} sm={3}>
                      <Link to={`/brand/${brand.name}`} className="text-decoration-none">
                        <div className="brand-card text-center p-2 rounded h-100 d-flex flex-column align-items-center justify-content-center hover-shadow transition-all border">
                          <div className="brand-logo-wrapper mb-2 d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm border overflow-hidden" style={{ width: '80px', height: '80px' }}>
                            <img src={brand.imageUrl} alt={brand.name} className="brand-logo-img img-fluid" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <h6 className="mb-0 fw-bold text-dark text-truncate w-100" style={{ fontSize: '0.95rem' }}>{brand.name}</h6>
                        </div>
                      </Link>
                    </Col>
                  ))}
                  {brands.length === 0 && (
                    <div className="text-center p-4 text-muted w-100"><small>No Brand Deals available.</small></div>
                  )}
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Container className="mb-5">
        <Row className="g-4">
          <Col lg={12}>
            <div className="bg-white rounded shadow-sm overflow-hidden border">
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                <h5 className="mb-0 fw-bold text-danger"><i className="fas fa-fire me-1"></i> Daily Deals</h5>
                <small className="text-primary fw-bold" style={{ cursor: 'pointer' }} onClick={handleMoreClick}>More &gt;</small>
              </div>
              <div className="p-3">
                {dailyDealProducts.length > 0 ? (
                  <div className="d-flex overflow-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {dailyDealProducts.slice(0, 8).map((product) => (
                      <div key={product.id} className="me-3" style={{ minWidth: '220px', flex: '0 0 auto' }}>
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-muted"><small>No daily deals available.</small></div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <div className="bg-primary py-5 text-white text-center mb-5 rounded-3 container">
        <h2 className="text-white fw-bold">Join Our Newsletter</h2>
        <p className="mb-4 opacity-75">Get the latest updates on new products and upcoming sales</p>
        <div className="d-flex justify-content-center">
          <div className="input-group" style={{ maxWidth: '500px' }}>
            <input type="email" className="form-control border-0" placeholder="Your email address" />
            <button className="btn btn-dark px-4" type="button">Subscribe</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
