import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="text-white py-5 mt-auto" style={{ backgroundColor: '#1a1f36' }}>
      <Container>
        <Row className="g-4">
          <Col md={3}>
            <h5 className="fw-bold mb-4" style={{ color: '#00d4ff' }}>Della.</h5>
            <p className="small mb-4" style={{ color: '#b0bec5' }}>
              Your premium destination for quality products. We believe in providing the best shopping experience for our customers.
            </p>
            <div className="d-flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff' }} className="hover-white"><i className="fab fa-facebook-f"></i></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff' }} className="hover-white"><i className="fab fa-twitter"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff' }} className="hover-white"><i className="fab fa-instagram"></i></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff' }} className="hover-white"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </Col>
          <Col md={2}>
            <h6 className="fw-bold mb-3" style={{ color: '#00d4ff' }}>Shop</h6>
            <ul className="list-unstyled small">
              <li><Link to="/search?q=sneakers" className="text-decoration-none" style={{ color: '#b0bec5' }}>Sneakers</Link></li>
              <li><Link to="/search?q=formal" className="text-decoration-none" style={{ color: '#b0bec5' }}>Formal</Link></li>
              <li><Link to="/search?q=casual" className="text-decoration-none" style={{ color: '#b0bec5' }}>Casual</Link></li>
              <li><Link to="/search?q=deals" className="text-decoration-none" style={{ color: '#b0bec5' }}>Deals</Link></li>
            </ul>
          </Col>
          <Col md={2}>
            <h6 className="fw-bold mb-3" style={{ color: '#00d4ff' }}>Support</h6>
            <ul className="list-unstyled small">
              <li><Link to="/contact" className="text-decoration-none" style={{ color: '#b0bec5' }}>Contact Us</Link></li>
              <li><Link to="/faq" className="text-decoration-none" style={{ color: '#b0bec5' }}>FAQs</Link></li>
              <li><Link to="/shipping" className="text-decoration-none" style={{ color: '#b0bec5' }}>Shipping Info</Link></li>
              <li><Link to="/returns" className="text-decoration-none" style={{ color: '#b0bec5' }}>Returns</Link></li>
            </ul>
          </Col>
          <Col md={2}>
            <h6 className="fw-bold mb-3" style={{ color: '#00d4ff' }}>Company</h6>
            <ul className="list-unstyled small">
              <li><Link to="/about" className="text-decoration-none" style={{ color: '#b0bec5' }}>About Us</Link></li>
              <li><Link to="/privacy" className="text-decoration-none" style={{ color: '#b0bec5' }}>Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-decoration-none" style={{ color: '#b0bec5' }}>Terms of Service</Link></li>
            </ul>
          </Col>
          <Col md={3}>
            <h6 className="fw-bold mb-3" style={{ color: '#00d4ff' }}>Download App</h6>
            <p className="small mb-3" style={{ color: '#b0bec5' }}>Get access to exclusive offers</p>
            <div className="d-flex flex-column gap-2">
              <Button variant="outline-light" size="sm" className="d-flex align-items-center justify-content-center">
                <i className="fab fa-apple me-2 fa-lg"></i> App Store
              </Button>
              <Button variant="outline-light" size="sm" className="d-flex align-items-center justify-content-center">
                <i className="fab fa-google-play me-2"></i> Google Play
              </Button>
            </div>
          </Col>
        </Row>
        <div className="border-top mt-5 pt-4 text-center small" style={{ borderColor: '#444', color: '#b0bec5' }}>
          <p className="mb-1">&copy; {new Date().getFullYear()} Della Inc. All rights reserved.</p>
          <p className="mb-0" style={{ color: '#b0bec5' }}>Developer: <span style={{ color: '#00d4ff' }}>Noushad Jaman Raj</span> | <a href="mailto:2203068@student.ruet.ac.bd" style={{ color: '#00d4ff', textDecoration: 'none' }}>2203068@student.ruet.ac.bd</a></p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
