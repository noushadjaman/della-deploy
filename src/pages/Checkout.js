import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const { cart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(currentUser?.email?.split('@')[0] || '');
  const [deliveryType, setDeliveryType] = useState('home');
  const [zone, setZone] = useState('inside');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    // Check if user is logged in
    if (!currentUser) {
      alert('You must be logged in to proceed with checkout.');
      navigate('/login');
      return;
    }

    if (!cart || cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate, currentUser]);

  const subtotal = cart.reduce((s, item) => {
    const price = item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
    return s + price * item.qty;
  }, 0);

  const deliveryFee = subtotal > 500 ? 0 : (zone === 'inside' ? 113 : 286);
  const totalDiscount = 102; // Sample discount shown
  const total = subtotal + deliveryFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert('Please fill in all required fields');
      return;
    }
    navigate('/payment', { state: { fullName, phone, address, deliveryType, zone, deliveryFee, subtotal, total } });
  };

  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      <Button variant="link" className="mb-4 text-decoration-none p-0" onClick={() => navigate('/cart')}>
        <i className="fas fa-chevron-left me-2"></i>Back
      </Button>

      <h2 className="fw-bold mb-4">Checkout</h2>

      <Row className="g-4">
        {/* Left Column - Delivery & Address */}
        <Col lg={7}>
          {/* Delivery Address */}
          <Card className="border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-bold mb-4">
              <i className="fas fa-map-marker-alt text-primary me-2"></i>
              Delivery Address
            </h5>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Full Name</Form.Label>
                <Form.Control
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Delivery Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter your full delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <small className="text-muted d-block mt-2">
                  <i className="fas fa-lightbulb"></i> Collect your parcels from a nearby location at a minimal delivery fee.
                </small>
              </Form.Group>

              {/* Delivery Type Selection */}
              <h6 className="fw-bold mt-4 mb-3">Delivery or Pickup</h6>
              <div className="mb-3">
                <Form.Check
                  type="radio"
                  id="home-delivery"
                  name="delivery"
                  label="Home Delivery"
                  value="home"
                  checked={deliveryType === 'home'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <Form.Check
                  type="radio"
                  id="self-pickup"
                  name="delivery"
                  label="Self Pickup"
                  value="pickup"
                  checked={deliveryType === 'pickup'}
                  onChange={(e) => setDeliveryType(e.target.value)}
                />
              </div>

              {/* Delivery Zone Selection */}
              {deliveryType === 'home' && (
                <div className="bg-light p-3 rounded mb-4">
                  <h6 className="fw-bold mb-3">Delivery Zone</h6>
                  <div className="d-flex gap-3 mb-3">
                    <Form.Check
                      type="radio"
                      id="inside-dhaka"
                      name="zone"
                      label="Inside Dhaka"
                      value="inside"
                      checked={zone === 'inside'}
                      onChange={(e) => setZone(e.target.value)}
                    />
                    <Form.Check
                      type="radio"
                      id="outside-dhaka"
                      name="zone"
                      label="Outside Dhaka"
                      value="outside"
                      checked={zone === 'outside'}
                      onChange={(e) => setZone(e.target.value)}
                    />
                  </div>
                  <div className="alert alert-info small mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Free Shipping Voucher applied, save ৳ 30</strong>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-100 fw-bold py-2"
                style={{ background: '#ff6b35', border: 'none' }}
              >
                Continue to Payment
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Right Column - Order Summary */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm sticky-top p-4" style={{ top: '20px' }}>
            <h5 className="fw-bold mb-4">Order Summary</h5>

            {/* Items */}
            <div className="mb-4 pb-4 border-bottom" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {cart.map(item => {
                const discountedPrice = item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
                return (
                  <div key={`${item.id}-${item.size}`} className="d-flex gap-3 mb-3">
                    <Image
                      src={item.imageUrl}
                      style={{ width: 60, height: 60, objectFit: 'cover' }}
                      rounded
                      className="flex-shrink-0"
                    />
                    <div className="flex-grow-1 small">
                      <div className="fw-bold">{item.name}</div>
                      {item.size && <small className="text-muted">Size: {item.size}</small>}
                      <div className="text-muted">Qty: {item.qty}</div>
                      <div className="fw-bold text-primary">৳ {discountedPrice * item.qty}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Details */}
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Merchandise Subtotal</span>
                <strong>৳ {subtotal}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Shipping Fee</span>
                {deliveryFee === 0 ? (
                  <span className="text-success fw-bold">
                    <i className="fas fa-check-circle me-1"></i>FREE
                  </span>
                ) : (
                  <strong>৳ {deliveryFee}</strong>
                )}
              </div>
              <div className="d-flex justify-content-between mb-3 pb-3 border-bottom">
                <span className="text-danger fw-bold">
                  <i className="fas fa-tag me-1"></i>Total Discount
                </span>
                <span className="text-danger fw-bold">-৳ {totalDiscount}</span>
              </div>
            </div>

            {/* Total */}
            <div className="bg-light p-3 rounded mb-4">
              <div className="text-muted small mb-1">Total Amount:</div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">৳</span>
                <h3 className="fw-bold mb-0 text-primary">{total}</h3>
              </div>
            </div>

            {/* VAT Notice */}
            <small className="text-muted d-block">
              VAT included, where applicable
            </small>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
