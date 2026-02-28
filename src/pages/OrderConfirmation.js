import React, { useRef } from 'react';
import { Container, Button, Row, Col, Image } from 'react-bootstrap';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DellaLogo = () => (
  <svg width="130" height="40" viewBox="0 0 130 40" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="32" fontFamily="Georgia, serif" fontSize="30" fontWeight="bold" fill="#ffffff" letterSpacing="5">DELLA</text>
  </svg>
);

const OrderConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const receiptRef = useRef();
  const cart = state?.cart || [];

  if (!state) return (
    <Container className="py-5 text-center">
      <h4>No order information found.</h4>
      <Link to="/">Back to Home</Link>
    </Container>
  );

  const { orderId, total, fullName, phone, address } = state;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const orderTime = new Date().toLocaleTimeString();

  const downloadReceipt = async () => {
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      // Use JPEG at 75% quality — drastically reduces file size vs PNG
      const imgData = canvas.toDataURL('image/jpeg', 0.75);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
      pdf.save(`DELLA-Receipt-${orderId}.pdf`);
    } catch (error) {
      console.error('PDF error:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container className="py-5" style={{ maxWidth: '840px', flex: 1 }}>

        {/* Success Banner */}
        <div className="text-center mb-5">
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className="fw-bold mb-1">Order Confirmed!</h1>
          <p className="text-muted">Your DELLA receipt is ready to download.</p>
        </div>

        {/* ─── RECEIPT ─── */}
        <div ref={receiptRef} style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', fontFamily: 'system-ui, sans-serif', background: '#fff' }}>

          {/* Red Header Band */}
          <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 60%, #ef4444 100%)', padding: '32px 36px 28px' }}>
            <Row className="align-items-center">
              <Col xs={7}>
                <DellaLogo />
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', letterSpacing: '0.1em', marginTop: 4 }}>
                  OFFICIAL STORE · PREMIUM FOOTWEAR & LIFESTYLE
                </div>
              </Col>
              <Col xs={5} className="text-end">
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontSize: '0.65rem', fontWeight: '700', padding: '4px 14px', borderRadius: 4, letterSpacing: '0.12em' }}>
                  INVOICE
                </div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem', marginTop: 8 }}>{today}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem' }}>{orderTime}</div>
              </Col>
            </Row>
          </div>

          {/* Diagonal accent strip */}
          <div style={{ height: 6, background: 'linear-gradient(90deg, #7f1d1d, #b91c1c, #fca5a5, #fff)' }} />

          {/* Order ID + Status */}
          <div style={{ padding: '20px 36px', background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#b91c1c', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Transaction ID</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginTop: 2 }}>#{orderId}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 20, padding: '5px 16px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#14532d' }}>Paid in Full</span>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ padding: '24px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 18, background: '#b91c1c', borderRadius: 3 }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#374151', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Order Items</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Product', 'Qty', 'Price', 'Total'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 8px', fontSize: '0.68rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: i === 0 ? 'left' : 'center', borderBottom: '2px solid #f3f4f6' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => {
                  const price = item.discount ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Image src={item.imageUrl} rounded style={{ width: 44, height: 44, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                          <div>
                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.9rem' }}>{item.name}</div>
                            {item.size && <div style={{ fontSize: '0.73rem', color: '#9ca3af' }}>Size: {item.size}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.88rem' }}>×{item.qty}</td>
                      <td style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.88rem' }}>৳{price}</td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>৳{price * item.qty}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Delivery + Totals */}
          <div style={{ padding: '4px 36px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Delivery Box */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ background: '#f9fafb', padding: '10px 16px', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Delivery Info</span>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontWeight: '700', color: '#111827', marginBottom: 2 }}>{fullName}</div>
                <div style={{ color: '#6b7280', fontSize: '0.83rem', marginBottom: 6 }}>{phone}</div>
                <div style={{ color: '#374151', fontSize: '0.83rem', lineHeight: 1.55 }}>{address}</div>
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #e5e7eb', fontSize: '0.75rem', color: '#9ca3af' }}>
                  🚚 Fast delivery: 1–4 business days
                </div>
              </div>
            </div>

            {/* Totals Box — dark for contrast */}
            <div style={{ borderRadius: 10, overflow: 'hidden', background: 'linear-gradient(145deg, #1e1b4b 0%, #1e293b 100%)' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Payment Summary</span>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                  <span>Subtotal</span><span>৳{total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 14 }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Shipping</span>
                  <span style={{ color: '#4ade80', fontWeight: '600' }}>Free</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Grand Total</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fca5a5' }}>৳{total}</div>
                </div>
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, padding: '3px 12px', gap: 5 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#4ade80', letterSpacing: '0.08em' }}>RECEIVED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)', padding: '14px 36px', textAlign: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}>
              Thank you for shopping with <strong style={{ color: '#fff' }}>DELLA</strong> · www.della.com
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
          <Button onClick={downloadReceipt} style={{ background: '#b91c1c', border: 'none', padding: '13px 34px', borderRadius: 10, fontWeight: '700', fontSize: '0.95rem' }}>
            📄 Download PDF Receipt
          </Button>
          <Button variant="outline-primary" style={{ padding: '13px 34px', borderRadius: 10, fontWeight: '700', fontSize: '0.95rem' }} onClick={() => navigate('/my-orders')}>
            🛍️ View Order History
          </Button>
          <Button variant="outline-secondary" style={{ padding: '13px 34px', borderRadius: 10, fontWeight: '700', fontSize: '0.95rem' }} onClick={() => navigate('/')}>
            ← Return to Store
          </Button>
        </div>
      </Container>

      {/* Full-width page footer banner */}
      <div style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)',
        padding: '20px 36px',
        marginTop: 48,
        borderRadius: '12px 12px 0 0',
        textAlign: 'center'
      }}>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem' }}>
          Thank you for shopping with <strong style={{ color: '#fff' }}>DELLA</strong> · www.della.com
        </span>
      </div>
    </div>
  );
};

export default OrderConfirmation;

