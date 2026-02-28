import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const Contact = () => {
    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '80vh' }}>
            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)', color: '#fff', padding: '60px 0 40px' }}>
                <Container className="text-center">
                    <h1 className="fw-bold mb-2">Contact Us</h1>
                    <p style={{ color: '#b0bec5' }}>We'd love to hear from you. Reach out anytime.</p>
                </Container>
            </div>

            <Container className="py-5">
                <Row className="g-5 justify-content-center">
                    {/* Info Cards */}
                    <Col md={4}>
                        <div className="d-flex flex-column gap-4">
                            {[
                                { icon: 'fa-map-marker-alt', title: 'Our Location', text: 'Rajshahi, Bangladesh' },
                                { icon: 'fa-phone-alt', title: 'Phone', text: '+880 1700-000000' },
                                { icon: 'fa-envelope', title: 'Email', text: 'support@della.com.bd' },
                                { icon: 'fa-clock', title: 'Business Hours', text: 'Sat–Thu, 9AM – 6PM' },
                            ].map(({ icon, title, text }) => (
                                <div key={title} className="d-flex align-items-start gap-3 p-4 bg-white rounded shadow-sm">
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <i className={`fas ${icon}`} style={{ color: '#e30613' }}></i>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1">{title}</h6>
                                        <p className="text-muted mb-0 small">{text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Col>

                    {/* Contact Form */}
                    <Col md={7}>
                        <div className="bg-white p-4 p-md-5 rounded shadow-sm">
                            <h4 className="fw-bold mb-4">Send us a Message</h4>
                            <Form>
                                <Row className="g-3">
                                    <Col sm={6}>
                                        <Form.Group>
                                            <Form.Label>Your Name</Form.Label>
                                            <Form.Control type="text" placeholder="John Doe" />
                                        </Form.Group>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Group>
                                            <Form.Label>Email Address</Form.Label>
                                            <Form.Control type="email" placeholder="john@example.com" />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12}>
                                        <Form.Group>
                                            <Form.Label>Subject</Form.Label>
                                            <Form.Control type="text" placeholder="How can we help?" />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12}>
                                        <Form.Group>
                                            <Form.Label>Message</Form.Label>
                                            <Form.Control as="textarea" rows={5} placeholder="Write your message here..." />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12}>
                                        <Button type="submit" style={{ background: '#e30613', border: 'none' }} className="px-5 py-2 fw-semibold">
                                            Send Message
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Contact;
