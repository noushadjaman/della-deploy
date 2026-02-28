import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <Container className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '70vh' }}>
            <h1 style={{ fontSize: '7rem', fontWeight: 700, color: '#e30613', lineHeight: 1 }}>404</h1>
            <h2 className="fw-bold mb-3">Page Not Found</h2>
            <p className="text-muted mb-4">Oops! The page you're looking for doesn't exist or has been moved.</p>
            <Link to="/" className="btn btn-primary px-4 py-2 fw-semibold">Go Back Home</Link>
        </Container>
    );
};

export default NotFound;
