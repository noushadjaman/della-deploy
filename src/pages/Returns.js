import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Returns = () => {
    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '80vh' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)', color: '#fff', padding: '60px 0 40px' }}>
                <Container className="text-center">
                    <h1 className="fw-bold mb-2">Returns & Exchanges</h1>
                    <p style={{ color: '#b0bec5' }}>Hassle-free returns within 7 days.</p>
                </Container>
            </div>

            <Container style={{ maxWidth: 800 }} className="py-5">
                {[
                    {
                        icon: 'fa-calendar-check',
                        title: '7-Day Return Window',
                        text: 'You have 7 days from the delivery date to initiate a return or exchange.',
                    },
                    {
                        icon: 'fa-box',
                        title: 'Condition Requirements',
                        text: 'Items must be unused, unwashed, and in original packaging with all tags attached.',
                    },
                    {
                        icon: 'fa-ban',
                        title: 'Non-Returnable Items',
                        text: 'Sale items, intimate apparel, and customized products cannot be returned.',
                    },
                    {
                        icon: 'fa-sync-alt',
                        title: 'Exchange Process',
                        text: 'To exchange for a different size or color, contact us and we\'ll arrange a pickup and redelivery.',
                    },
                    {
                        icon: 'fa-money-bill-wave',
                        title: 'Refunds',
                        text: 'Approved refunds are processed within 3–5 business days via your original payment method.',
                    },
                ].map(({ icon, title, text }) => (
                    <div key={title} className="bg-white p-4 rounded shadow-sm mb-3 d-flex gap-4 align-items-start">
                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#fdecea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className={`fas ${icon}`} style={{ color: '#e30613' }}></i>
                        </div>
                        <div>
                            <h6 className="fw-bold mb-1">{title}</h6>
                            <p className="text-muted mb-0 small">{text}</p>
                        </div>
                    </div>
                ))}

                <div className="text-center mt-4">
                    <p className="text-muted">Have a question? <Link to="/contact" className="fw-bold text-decoration-none">Contact us</Link></p>
                </div>
            </Container>
        </div>
    );
};

export default Returns;
