import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Alert, Carousel } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [dailyDealProducts, setDailyDealProducts] = useState([]);
  const [, setLoading] = useState(true);
  const [error] = useState('');
  const [countdown, setCountdown] = useState('');
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);

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
    // Incremental Data Fetching
    const fetchBanners = async () => {
      try {
        const qry = query(collection(db, "banners"), orderBy("createdAt", "desc"));
        const snap = await getDocs(qry);
        setBanners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } finally { setBannersLoading(false); }
    };

    const fetchCategories = async () => {
      try {
        const qry = query(collection(db, "categories"), orderBy("createdAt", "desc"));
        const snap = await getDocs(qry);
        setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } finally { setCategoriesLoading(false); }
    };

    const fetchBrands = async () => {
      try {
        const qry = query(collection(db, "brands"), orderBy("createdAt", "desc"));
        const snap = await getDocs(qry);
        setBrands(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } finally { setBrandsLoading(false); }
    };

    const fetchProducts = async () => {
      try {
        const qry = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(qry);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
        setFlashSaleProducts(data.filter(p => p.isFlashSale));
        setDailyDealProducts(data.filter(p => p.isDailyDeal));
      } finally {
        setFeaturedLoading(false);
        setLoading(false);
      }
    };

    fetchBanners();
    fetchCategories();
    fetchBrands();
    fetchProducts();
  }, []);

  const SkeletonCard = () => (
    <div className="card h-100 border-0 shadow-sm overflow-hidden p-3" style={{ minWidth: '200px' }}>
      <div className="skeleton skeleton-img mb-3"></div>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
    </div>
  );

  return (
    <>
      <Container className="mb-4 mt-2 px-2 px-lg-3">
        <Row className="g-2 g-lg-3">
          {/* ── ROW 1 (all screens): Banner ── */}
          <Col lg={9} md={8} xs={12} className="order-1">
            {bannersLoading ? (
              <div className="skeleton rounded-4 home-banner-container" style={{ height: 'clamp(150px, 30vh, 350px)' }}></div>
            ) : banners.length > 0 ? (
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
              <div className="hero-section rounded-4 p-4 p-lg-5 d-flex align-items-center home-banner-container" style={{ height: 'clamp(150px, 30vh, 350px)' }}>
                <div className="text-white">
                  <span className="badge bg-warning text-dark mb-2">New Arrival</span>
                  <h2 className="fw-bold mb-1" style={{ fontSize: 'clamp(1.2rem, 5vw, 2.5rem)' }}>Discover Latest Trends</h2>
                  <p className="small mb-3 opacity-90">Shop the best products at unbeatable prices.</p>
                  <Button variant="light" size="sm" className="rounded-pill fw-bold text-primary px-3">Shop Now</Button>
                </div>
              </div>
            )}
          </Col>

          {/* ── ROW 2 mobile (compact strip) | Sidebar desktop ── */}
          <Col lg={3} md={4} xs={12} className="order-2">
            {/* ── ROW 1 mobile | SIDEBAR desktop: Flash Sale ── */}
            <div className="bg-white rounded-4 shadow-sm flex-column overflow-hidden border mb-3 flash-sale-mobile d-lg-none" style={{ background: 'linear-gradient(135deg, #fff 0%, #fffafa 100%)' }}>
              <div className="p-2 border-bottom d-flex justify-content-between align-items-center" style={{ background: 'rgba(239, 68, 68, 0.03)' }}>
                <div className="d-flex align-items-center gap-2">
                  <h6 className="mb-0 fw-bold text-danger d-flex align-items-center"><i className="fas fa-bolt me-1"></i> Flash</h6>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: '#c2410c',
                    background: '#fff7ed',
                    border: '1px solid #ffedd5',
                    borderRadius: '4px',
                    padding: '0 6px'
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
                {featuredLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="skeleton rounded flex-shrink-0" style={{ width: '150px', height: '45px' }}></div>
                  ))
                ) : flashSaleProducts.length > 0 ? flashSaleProducts.slice(0, 8).map((product) => {
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
            <div className="d-none d-lg-flex bg-white rounded-4 shadow-sm flex-column overflow-hidden border flash-sale-container" style={{ height: '100%', background: 'linear-gradient(180deg, #fff 0%, #fdf2f2 100%)' }}>
              <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ background: 'rgba(239, 68, 68, 0.03)' }}>
                <div className="d-flex align-items-center gap-2">
                  <h6 className="mb-0 fw-extrabold text-danger flash-sale-header-title" style={{ letterSpacing: '0.5px' }}><i className="fas fa-bolt me-1"></i> FLASH SALE</h6>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    color: '#c2410c',
                    background: '#fff7ed',
                    border: '2px solid #ffedd5',
                    borderRadius: '8px',
                    padding: '2px 10px',
                    letterSpacing: '0.1em'
                  }}>
                    {countdown}
                  </span>
                </div>
                <small className="text-primary fw-bold shop-more-btn" style={{ cursor: 'pointer', fontSize: '0.7rem' }} onClick={handleMoreClick}>ALL &gt;</small>
              </div>
              <div className="overflow-auto p-1 p-lg-2 flash-sale-list flex-grow-1" style={{ minHeight: '0' }}>
                {featuredLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="d-flex align-items-center p-3 mb-3 border rounded-3 bg-white skeleton" style={{ height: '100px' }}></div>
                  ))
                ) : flashSaleProducts.length > 0 ? flashSaleProducts.slice(0, 6).map((product) => {
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
          <Col lg={12} md={12} xs={12} className="order-3 mt-4">
            <div id="products">
              <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                <h4 className="fw-800 mb-0 featured-products-title" style={{ background: 'linear-gradient(45deg, var(--secondary), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Featured Products</h4>
                <Link to="/products" className="text-primary fw-bold small text-decoration-none">View More &gt;</Link>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <div className="d-flex overflow-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', gap: '8px' }}>
                {featuredLoading ? (
                  [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
                ) : products.map((product, idx) => (
                  <div
                    key={product.id}
                    className={`featured-product-item ${idx >= 4 ? 'd-none d-sm-block' : ''}`}
                    style={{ minWidth: '150px', flex: '0 0 auto' }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </Col>

        </Row>
      </Container >

      <Container className="mb-4 mt-3">
        <Row className="g-4">
          {/* Shop by Category */}
          <Col lg={6}>
            <div className="bg-white rounded-4 shadow-sm overflow-hidden border h-100 p-4" style={{ background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-800 mb-0" style={{ color: 'var(--secondary)' }}>Shop by Category</h5>
                <a href="#categories" className="btn btn-sm btn-light rounded-pill border px-3" onClick={(e) => { e.preventDefault(); navigate('/categories'); }}>All Categories <i className="fas fa-arrow-right ms-1" style={{ fontSize: '0.7rem' }}></i></a>
              </div>
              <div className="d-flex overflow-auto pb-2 category-scroll-container" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {categoriesLoading ? (
                  [1, 2, 4, 5, 6].map(i => (
                    <div key={i} className="text-center me-4" style={{ minWidth: '80px' }}>
                      <div className="skeleton rounded-circle mb-2 mx-auto" style={{ width: '65px', height: '65px' }}></div>
                      <div className="skeleton skeleton-text mx-auto" style={{ width: '40px' }}></div>
                    </div>
                  ))
                ) : categories.map((cat, idx) => (
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
                {!categoriesLoading && categories.length === 0 && (
                  <div className="text-muted w-100 text-center py-3">No categories found.</div>
                )}
              </div>
            </div>
          </Col>

          {/* Brand Deals */}
          <Col lg={6}>
            <div className="bg-white rounded-4 shadow-sm overflow-hidden border h-100" style={{ background: 'linear-gradient(135deg, #fff 0%, #f0f9ff 100%)' }}>
              <div className="p-3 p-lg-4 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="fw-800 mb-0 d-flex align-items-center" style={{ color: 'var(--secondary)', fontSize: 'clamp(0.9rem, 4vw, 1.25rem)' }}>
                  <i className="fas fa-tags text-primary me-2"></i> Brand Deals
                </h5>
                <Link to="/brands" className="btn btn-sm btn-light rounded-pill border px-3" style={{ fontSize: '0.7rem' }}>All <i className="fas fa-arrow-right ms-1"></i></Link>
              </div>
              <div className="p-2 p-lg-3">
                <Row className="g-2 g-lg-3">
                  {brandsLoading ? (
                    [1, 2, 3, 4].map(i => (
                      <Col key={i} xs={6} sm={3}>
                        <div className="skeleton rounded" style={{ height: '100px' }}></div>
                      </Col>
                    ))
                  ) : brands.slice(0, 4).map((brand) => (
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
                  {!brandsLoading && brands.length === 0 && (
                    <div className="text-center p-4 text-muted w-100"><small>No Brand Deals available.</small></div>
                  )}
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Container className="mb-5 mt-5 pb-5">
        <div className="bg-white rounded-4 shadow-sm overflow-hidden border" style={{ background: 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)' }}>
          <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="fw-800 mb-0 d-flex align-items-center" style={{ color: 'var(--secondary)' }}>
              <i className="fas fa-fire-alt text-danger me-2"></i> Hot Daily Deals
            </h5>
            <small className="text-primary fw-bold" style={{ cursor: 'pointer' }} onClick={handleMoreClick}>More Deals &gt;</small>
          </div>
          <div className="p-3">
            {featuredLoading ? (
              <div className="d-flex overflow-auto pb-2" style={{ gap: '15px' }}>
                {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : dailyDealProducts.length > 0 ? (
              <div className="d-flex overflow-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', gap: '6px' }}>
                {dailyDealProducts.slice(0, 8).map((product) => (
                  <div key={product.id} style={{ minWidth: '150px', flex: '0 0 auto' }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-muted"><small>No daily deals available.</small></div>
            )}
          </div>
        </div>
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
