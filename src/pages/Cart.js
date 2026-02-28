import React, { useState } from 'react';
import { Container, Row, Col, Button, Image, Form, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQty } = useCart();
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const subtotal = cart.reduce((s, item) => {
    const price = item.discount ? Math.round(item.price * (1 - item.discount/100)) : item.price;
    return s + price * item.qty;
  }, 0);

  // Simulated delivery fee based on subtotal
  const shippingFee = subtotal > 500 ? 0 : 113;
  const totalDiscount = appliedDiscount;
  const total = subtotal + shippingFee - totalDiscount;

  const handleApplyVoucher = () => {
    if (voucherCode.toLowerCase() === 'save30') {
      setAppliedDiscount(30);
    } else if (voucherCode.toLowerCase() === 'save20') {
      setAppliedDiscount(20);
    } else {
      alert('Invalid voucher code');
      setAppliedDiscount(0);
    }
  };

  if (cart.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center py-5">
          <h5 className="text-muted">Your cart is empty.</h5>
          <Link to="/" className="btn btn-primary mt-3">Continue Shopping</Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{maxWidth: '1200px'}}>
      <h2 className="fw-bold mb-4">Cart</h2>
      
      <Row className="g-4">
        {/* Left Column - Cart Items */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm mb-4 p-4">
            <h5 className="fw-bold mb-4">Merchandise Subtotal ({cart.length} items)</h5>
            
            {cart.map(item => {
              const discountedPrice = item.discount ? Math.round(item.price * (1 - item.discount/100)) : item.price;
              return (
                <div key={`${item.id}-${item.size}`} className="d-flex gap-3 mb-4 pb-3 border-bottom">
                  <Image 
                    src={item.imageUrl} 
                    style={{width: 100, height: 100, objectFit: 'cover'}} 
                    rounded 
                    className="flex-shrink-0"
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between mb-2">
                      <div>
                        <h6 className="mb-1 fw-bold">{item.name}</h6>
                        {item.size && <small className="text-muted">Size: {item.size}</small>}
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-primary">৳ {discountedPrice}</div>
                        {item.discount > 0 && (
                          <small className="text-muted text-decoration-line-through">৳ {item.price}</small>
                        )}
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-3">
                      <div className="d-flex align-items-center gap-2">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => updateQty(item.id, item.size, Math.max(1, item.qty - 1))}
                        >
                          −
                        </Button>
                        <Form.Control 
                          type="number" 
                          value={item.qty} 
                          min={1} 
                          max={item.stock}
                          style={{width: 60, textAlign: 'center'}} 
                          onChange={(e) => {
                            const v = Math.max(1, Math.min(parseInt(e.target.value||1), item.stock));
                            updateQty(item.id, item.size, v);
                          }} 
                        />
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => updateQty(item.id, item.size, Math.min(item.stock, item.qty + 1))}
                        >
                          +
                        </Button>
                      </div>
                      <Button 
                        variant="link" 
                        className="text-danger text-decoration-none p-0"
                        onClick={() => removeFromCart(item.id, item.size)}
                      >
                        <i className="fas fa-trash"></i> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Voucher Section */}
          <div className="mb-4 p-4 rounded-3" style={{background: '#f8f9fa', border: '2px dashed #dee2e6'}}>
            <h6 className="fw-bold mb-3">
              <i className="fas fa-gift text-danger me-2"></i>
              Voucher & Code
            </h6>
            <div className="input-group">
              <Form.Control
                placeholder="Enter voucher code"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="border-end-0"
              />
              <Button 
                variant="primary"
                onClick={handleApplyVoucher}
                className="fw-bold"
              >
                Apply
              </Button>
            </div>
          </div>
        </Col>

        {/* Right Column - Summary */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm sticky-top p-4" style={{top: '20px'}}>
            <h5 className="fw-bold mb-4">Order Summary</h5>

            <div className="mb-3 pb-3 border-bottom">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Merchandise Subtotal</span>
                <strong>৳ {subtotal}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Shipping Fee</span>
                <div>
                  {shippingFee === 0 ? (
                    <span className="text-success fw-bold">
                      <i className="fas fa-check-circle me-1"></i>FREE
                    </span>
                  ) : (
                    <strong>৳ {shippingFee}</strong>
                  )}
                </div>
              </div>
            </div>

            {appliedDiscount > 0 && (
              <div className="mb-3 pb-3 border-bottom">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Total Discount</span>
                  <span className="text-danger fw-bold">-৳ {appliedDiscount}</span>
                </div>
              </div>
            )}

            <div className="bg-light p-3 rounded mb-4">
              <div className="text-muted small mb-2">Total:</div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">৳</span>
                <h3 className="fw-bold mb-0 text-primary">{total}</h3>
              </div>
            </div>

            <Button 
              size="lg"
              className="w-100 fw-bold"
              style={{background: '#ff6b35', border: 'none'}}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>

            <Button 
              variant="outline-secondary"
              className="w-100 mt-2"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>

            <div className="mt-4 pt-3 border-top">
              <small className="text-muted d-block mb-2">
                <i className="fas fa-shield-alt me-1"></i>
                Secure Checkout
              </small>
              <small className="text-muted d-block">
                <i className="fas fa-truck me-1"></i>
                Free Shipping on orders over ৳ 500
              </small>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
