import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Shipping = () => {
    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '80vh' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)', color: '#fff', padding: '60px 0 40px' }}>
                <Container className="text-center">
                    <h1 className="fw-bold mb-2">Shipping Information</h1>
                    <p style={{ color: '#b0bec5' }}>Everything you need to know about delivery.</p>
                </Container>
            </div>

            <Container style={{ maxWidth: 860 }} className="py-5">
                <Row className="g-4 mb-5">
                    {[
                        { icon: 'fa-city', title: 'Inside Dhaka', time: '1–2 Business Days', cost: '৳60' },
                        { icon: 'fa-map', title: 'Outside Dhaka', time: '3–5 Business Days', cost: '৳120' },
                        { icon: 'fa-globe-asia', title: 'Remote Areas', time: '5–7 Business Days', cost: '৳150' },
                    ].map(({ icon, title, time, cost }) => (
                        <Col md={4} key={title}>
                            <div className="bg-white p-4 rounded shadow-sm text-center h-100">
                                <div className="mb-3" style={{ fontSize: '2rem', color: '#e30613' }}>
                                    <i className={`fas ${icon}`}></i>
                                </div>
                                <h6 className="fw-bold mb-1">{title}</h6>
                                <p className="text-muted small mb-1">{time}</p>
                                <p className="fw-bold mb-0" style={{ color: '#e30613' }}>{cost}</p>
                            </div>
                        </Col>
                    ))}
                </Row>

                <div className="bg-white p-4 rounded shadow-sm mb-4">
                    <h5 className="fw-bold mb-3"><i className="fas fa-info-circle me-2 text-primary"></i>Shipping Policy</h5>
                    <ul className="text-muted mb-0" style={{ lineHeight: 2 }}>
                        <li>Orders are processed within 24 hours on business days (Saturday–Thursday).</li>
                        <li>You'll receive an SMS/email confirmation with tracking details once dispatched.</li>
                        <li>Free shipping on orders over ৳2,000.</li>
                        <li>Shipping fees are non-refundable unless the product is defective.</li>
                        <li>Delivery times may vary during holidays and promotional sale periods.</li>
                    </ul>
                </div>

                <div className="bg-white p-4 rounded shadow-sm">
                    <h5 className="fw-bold mb-3"><i className="fas fa-phone-alt me-2 text-success"></i>Delivery Partners</h5>
                    <p className="text-muted mb-0">We work with trusted courier services including Pathao, Steadfast, and Sundarban Courier for reliable delivery across Bangladesh.</p>
                </div>
            </Container>
        </div>
    );
};

export default Shipping;
