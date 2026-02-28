import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div style={{ backgroundColor: '#f8f9fa' }}>
            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)', color: '#fff', padding: '70px 0 50px' }}>
                <Container className="text-center">
                    <h1 className="fw-bold mb-3" style={{ fontSize: '2.8rem' }}>About Della</h1>
                    <p style={{ color: '#b0bec5', maxWidth: 600, margin: '0 auto', fontSize: '1.1rem' }}>
                        Bangladesh's premier online destination for quality footwear and fashion.
                    </p>
                </Container>
            </div>

            {/* Story */}
            <Container className="py-5">
                <Row className="align-items-center g-5">
                    <Col md={6}>
                        <h2 className="fw-bold mb-3">Our Story</h2>
                        <p className="text-muted">
                            Founded in Rajshahi, Della was born from a simple belief — that everyone deserves access to quality,
                            stylish footwear at fair prices. What started as a small local shop has grown into a trusted online
                            brand serving customers across Bangladesh.
                        </p>
                        <p className="text-muted">
                            We carefully curate products from top brands like Bata, Apex, Bay Emporium, and many more to bring
                            you the best selection of sneakers, formal shoes, casual wear, and accessories.
                        </p>
                    </Col>
                    <Col md={6}>
                        <Row className="g-3 text-center">
                            {[
                                { value: '10,000+', label: 'Happy Customers' },
                                { value: '500+', label: 'Products' },
                                { value: '50+', label: 'Brands' },
                                { value: '64', label: 'Districts Delivered' },
                            ].map(({ value, label }) => (
                                <Col xs={6} key={label}>
                                    <div className="p-4 bg-white rounded shadow-sm">
                                        <h3 className="fw-bold mb-1" style={{ color: '#e30613' }}>{value}</h3>
                                        <p className="text-muted mb-0 small">{label}</p>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>

                {/* Values */}
                <div className="text-center mt-5 mb-4">
                    <h2 className="fw-bold">Our Values</h2>
                </div>
                <Row className="g-4 text-center">
                    {[
                        { icon: 'fa-star', title: 'Quality First', text: 'We only stock products we believe in.' },
                        { icon: 'fa-truck', title: 'Fast Delivery', text: 'Swift, reliable delivery across Bangladesh.' },
                        { icon: 'fa-headset', title: 'Great Support', text: '24/7 customer service, always here for you.' },
                        { icon: 'fa-shield-alt', title: 'Secure Shopping', text: 'Your data and payments are always safe.' },
                    ].map(({ icon, title, text }) => (
                        <Col md={3} sm={6} key={title}>
                            <div className="p-4 bg-white rounded shadow-sm h-100">
                                <div className="mb-3" style={{ fontSize: '2rem', color: '#e30613' }}>
                                    <i className={`fas ${icon}`}></i>
                                </div>
                                <h6 className="fw-bold mb-2">{title}</h6>
                                <p className="text-muted small mb-0">{text}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default About;
