import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Image, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, runTransaction, getDoc } from 'firebase/firestore';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [processing, setProcessing] = useState(false);

  if (!state) {
    navigate('/checkout');
    return null;
  }

  const { phone, address, deliveryType, zone, deliveryFee, subtotal, total } = state;

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      const newOrderRef = doc(collection(db, 'orders'));
      const initialStatus = paymentMethod === 'cash' ? 'pending' : 'unpaid';
      const statusMessages = {
        'pending': 'Your order received',
        'unpaid': 'Your order received',
        'preparing': 'Your order prepare for delivery',
        'shipped': 'Your order shipped to the destination (rider will get you soon)',
        'delivered': 'Order Received',
        'cancelled': 'Your order cancelled!'
      };

      await runTransaction(db, async (transaction) => {
        // First, fetch all product data (READS)
        const productDataMap = {};
        for (const item of cart) {
          const productRef = doc(db, 'products', item.id);
          const productSnap = await transaction.get(productRef);
          if (!productSnap.exists()) {
            throw new Error(`Product ${item.name} no longer exists.`);
          }
          productDataMap[item.id] = productSnap.data();
        }

        // Second, apply all updates (WRITES)
        for (const item of cart) {
          const productRef = doc(db, 'products', item.id);
          const productData = productDataMap[item.id];
          const currentStock = productData.stock || 0;

          if (currentStock < item.qty) {
            throw new Error(`Insufficient stock for ${item.name}.`);
          }

          const updates = {
            stock: currentStock - item.qty
          };

          if (item.size && productData.sizes && productData.sizes[item.size] !== undefined) {
            const sizeStock = productData.sizes[item.size] || 0;
            if (sizeStock < item.qty) {
              throw new Error(`Insufficient stock for ${item.name} size ${item.size}.`);
            }
            updates[`sizes.${item.size}`] = sizeStock - item.qty;
          }

          transaction.update(productRef, updates);
        }

        // Prepare order document
        const order = {
          userId: currentUser ? currentUser.uid : null,
          userEmail: currentUser ? currentUser.email : null,
          fullName: state.fullName, // Ensure fullName is captured
          phone, address, deliveryType, zone,
          items: cart,
          subtotal,
          deliveryFee,
          total,
          paymentMethod: paymentMethod,
          status: initialStatus,
          statusHistory: [
            {
              status: initialStatus,
              message: statusMessages[initialStatus],
              time: new Date().toISOString()
            }
          ],
          createdAt: serverTimestamp()
        };

        // Complete the order part of the transaction
        transaction.set(newOrderRef, order);
      });

      // Side effects belong outside of the transaction block
      clearCart();
      navigate('/order-confirmation', {
        state: {
          orderId: newOrderRef.id,
          total, phone, address,
          fullName: state.fullName,
          cart, subtotal,
          deliveryFee, paymentMethod
        }
      });
    } catch (err) {
      console.error('Order placement failed:', err);
      alert(err.message || 'Failed to place order. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  const paymentOptions = [
    { id: 'credit-card', name: 'Credit/Debit Card', icon: 'fas fa-credit-card' },
    { id: 'bkash', name: 'bKash', icon: 'fas fa-money-bill' },
    { id: 'cash', name: 'Cash on Delivery', icon: 'fas fa-money-bill-wave' },
    { id: 'rocket', name: 'Rocket', icon: 'fas fa-rocket' },
    { id: 'installment', name: 'Installment', icon: 'fas fa-calendar' },
  ];

  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      <Button variant="link" className="mb-4 text-decoration-none p-0" onClick={() => navigate('/checkout')}>
        <i className="fas fa-chevron-left me-2"></i>Back
      </Button>

      <h2 className="fw-bold mb-4">Select Payment Method</h2>

      <Row className="g-4">
        {/* Left Column - Payment Methods */}
        <Col lg={7}>
          {/* Info Alert */}
          <Alert className="bg-light border-0 mb-4" style={{ color: '#0066cc' }}>
            <i className="fas fa-info-circle me-2"></i>
            Collect payment voucher & get extra savings on your purchase!
          </Alert>

          {/* Payment Methods */}
          <Card className="border-0 shadow-sm p-4 mb-4">
            <h6 className="fw-bold mb-4">Recommended method(s)</h6>
            <div className="mb-4">
              <Form.Check
                type="radio"
                id="credit-card"
                name="payment"
                label={
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <i className="fas fa-credit-card fa-lg text-primary"></i>
                    <div>
                      <strong>Credit/Debit Card</strong>
                      <div className="small text-muted">Credit/Debit Card</div>
                    </div>
                    <div className="ms-auto">
                      <i className="fab fa-cc-amex text-primary me-2"></i>
                      <i className="fab fa-cc-mastercard text-danger me-2"></i>
                      <i className="fab fa-cc-visa text-primary"></i>
                    </div>
                  </div>
                }
                value="credit-card"
                checked={paymentMethod === 'credit-card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </div>

            <hr />

            <h6 className="fw-bold mb-3 mt-4">My Saved Payment Methods</h6>
            <Form.Check
              type="radio"
              id="saved-card"
              name="payment"
              label="016*****780"
              value="saved-card"
              checked={paymentMethod === 'saved-card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />

            <hr />

            <h6 className="fw-bold mb-3 mt-4">Other Payment Methods</h6>
            <div className="space-y-2">
              {['bkash', 'cash', 'rocket', 'installment'].map((method) => {
                const opt = paymentOptions.find(o => o.id === method);
                return (
                  <Form.Check
                    key={method}
                    type="radio"
                    id={method}
                    name="payment"
                    label={
                      <div className="d-flex align-items-center gap-3">
                        <i className={`${opt.icon} fa-lg`}></i>
                        <strong>{opt.name}</strong>
                      </div>
                    }
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mb-2"
                  />
                );
              })}
            </div>

            {/* Cash on Delivery Details */}
            {paymentMethod === 'cash' && (
              <Card className="mt-4 p-3 bg-light border-0">
                <h6 className="fw-bold mb-3">
                  <i className="fas fa-money-bill-wave me-2 text-success"></i>
                  Cash on Delivery
                </h6>
                <ul className="small text-muted mb-0">
                  <li>You may pay in cash to our courier upon receiving your parcel at the doorstep</li>
                  <li>Before agreeing to receive the parcel, check if your delivery status has been updated to 'Out for Delivery'</li>
                  <li>Before receiving, confirm that the airway bill shows that the parcel is from Daraz</li>
                  <li>Before you make payment to the courier, confirm your order number, sender information and tracking number on the parcel</li>
                </ul>
              </Card>
            )}
          </Card>

          {/* Security Notice */}
          <div className="text-center mt-4 text-muted small">
            <i className="fas fa-shield-alt me-1"></i> Norton
            <span className="mx-2">|</span>
            <i className="fas fa-lock me-1"></i> PCI
            <span className="mx-2">|</span>
            <span className="text-muted">Verified by VISA</span>
            <span className="mx-2">|</span>
            <span className="text-muted">Mastercard SecureCode</span>
          </div>
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
                      <div className="fw-bold text-truncate">{item.name}</div>
                      {item.size && <small className="text-muted">Size: {item.size}</small>}
                      <div className="text-muted">Qty: {item.qty}</div>
                      <div className="fw-bold text-primary">৳ {discountedPrice * item.qty}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Summary */}
            <div className="mb-4">
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Subtotal</span>
                <strong>৳ {subtotal}</strong>
              </div>
              <div className="d-flex justify-content-between small mb-3 pb-3 border-bottom">
                <span className="text-muted">Total Amount</span>
                <strong>৳ {total}</strong>
              </div>
            </div>

            {/* Total */}
            <div className="bg-light p-3 rounded mb-4">
              <div className="text-muted small mb-1">Total Amount:</div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">৳</span>
                <h3 className="fw-bold mb-0 text-primary">{total}</h3>
              </div>
              <small className="text-muted d-block mt-2">VAT included, where applicable</small>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="w-100 fw-bold py-3"
              style={{ background: '#ff6b35', border: 'none' }}
              size="lg"
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle me-2"></i>
                  Confirm Order
                </>
              )}
            </Button>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Payment;
