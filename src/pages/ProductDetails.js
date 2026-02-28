import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Image, Badge, Breadcrumb, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [desiredQty, setDesiredQty] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });
          setActiveImageIndex(data.mainImageIndex || 0);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  if (!product) return (
    <Container className="py-5 text-center">
      <h3>Product not found</h3>
      <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
    </Container>
  );

  const images = product.imageUrls || [product.imageUrl];
  const validImages = images.filter(img => img && img !== "");

  return (
    <Container className="py-5">
      <ToastContainer position="top-center" className="mt-4">
        <Toast show={showSuccess} bg="success" className="border-0 shadow-sm">
          <Toast.Body className="text-white fw-bold">
            <i className="fas fa-check-circle me-2"></i>
            Added to cart successfully!
            <Link to="/cart" className="text-white text-decoration-underline ms-2">
              View Cart →
            </Link>
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item active>{product.category}</Breadcrumb.Item>
        <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="g-5">
        <Col md={6}>
          <div className="product-image-gallery">
            <div className="bg-white p-4 rounded-3 shadow-sm text-center border mb-3 main-image-container" style={{ height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image src={validImages[activeImageIndex] || product.imageUrl} fluid style={{ maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            {validImages.length > 1 && (
              <Row className="gx-2">
                {validImages.map((img, idx) => (
                  <Col key={idx} xs={4}>
                    <div
                      className={`thumbnail-container border rounded overflow-hidden cursor-pointer ${activeImageIndex === idx ? 'border-primary shadow-sm' : ''}`}
                      style={{ height: '80px', cursor: 'pointer', opacity: activeImageIndex === idx ? 1 : 0.6 }}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={img} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Col>
        <Col md={6}>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <Badge bg="primary" className="px-3 py-2 me-2">{product.category}</Badge>
              {product.brand && <Badge bg="info" className="px-3 py-2">{product.brand}</Badge>}
            </div>
            <Badge bg={product.stock > 0 ? "success" : "danger"} className="px-3 py-2">
              {product.stock > 0 ? 'In Stock' : 'Sold Out'}
            </Badge>
          </div>

          <h1 className="display-5 fw-bold mb-3">{product.name}</h1>

          <div className="d-flex align-items-center mb-4">
            <div className="text-warning me-2">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star-half-alt"></i>
            </div>
            <span className="text-muted small">(124 reviews)</span>
          </div>

          <div className="d-flex align-items-center mb-4">
            <h2 className="text-primary fw-bold display-6 mb-0">
              <strong>৳</strong>{product.discount ? (product.price * (1 - product.discount / 100)).toFixed(0) : product.price}
            </h2>
            {product.discount > 0 && (
              <>
                <span className="text-muted text-decoration-line-through ms-3" style={{ fontSize: '1.2rem' }}>
                  <strong>৳</strong>{product.price}
                </span>
                <span className="badge bg-danger ms-2">-{product.discount}%</span>
              </>
            )}
          </div>

          <p className="lead text-muted mb-4">{product.description}</p>

          {product.sizes && Object.keys(product.sizes).length > 0 && (
            <div className="mb-4">
              <div className="mb-2"><strong>Select Size</strong></div>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {Object.entries(product.sizes).map(([sz, qty]) => (
                  <button key={sz} type="button" className={`btn btn-sm ${selectedSize === sz ? 'btn-primary' : 'btn-outline-secondary'}`} disabled={qty <= 0} onClick={() => { setSelectedSize(sz); setDesiredQty(1); }}>
                    {sz} {qty <= 0 ? '(Sold)' : ''}
                  </button>
                ))}
              </div>
              <div className="d-flex align-items-center gap-2">
                <input type="number" className="form-control form-control-sm" style={{ width: '100px' }} min={1} max={selectedSize ? (product.sizes[selectedSize] || 1) : 1} value={desiredQty} onChange={(e) => setDesiredQty(Math.max(1, Math.min(parseInt(e.target.value || 1), selectedSize ? (product.sizes[selectedSize] || 1) : 1)))} />
                <small className="text-muted">Available: {selectedSize ? (product.sizes[selectedSize] || 0) : Object.values(product.sizes).reduce((a, b) => a + Number(b || 0), 0)}</small>
              </div>
            </div>
          )}

          <div className="d-flex align-items-center gap-3 mb-5">
            <Button
              variant="primary"
              size="lg"
              className="rounded-pill add-to-cart-btn"
              disabled={product.stock <= 0}
              onClick={() => {
                if (product.sizes && Object.keys(product.sizes).length > 0 && !selectedSize) {
                  alert('Please select a size');
                  return;
                }
                const size = selectedSize || null;
                addToCart(product, size, desiredQty);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
              }}
            >
              <i className="fas fa-shopping-cart me-2"></i>
              {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
            </Button>
            <button className="wishlist-btn">
              <i className="far fa-heart"></i>
            </button>
          </div>

          <div className="bg-light p-4 rounded-3 small">
            <div className="d-flex align-items-center mb-3">
              <i className="fas fa-truck text-primary me-3 fa-lg"></i>
              <div>
                <strong>Free Shipping</strong>
                <div className="text-muted">On all orders over <strong>৳</strong>500</div>
              </div>
            </div>
            <div className="d-flex align-items-center mb-3">
              <i className="fas fa-undo text-primary me-3 fa-lg"></i>
              <div>
                <strong>Return Policy</strong>
                <div className="text-muted">{product.returnPolicy || '7 Days Return Policy'}</div>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <i className="fas fa-shield-alt text-primary me-3 fa-lg"></i>
              <div>
                <strong>Secure Payment</strong>
                <div className="text-muted">100% secure payment processing</div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails;
