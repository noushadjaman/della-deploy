import React from 'react';
import { Container, Accordion } from 'react-bootstrap';

const faqs = [
    {
        q: 'How do I place an order?',
        a: 'Browse our products, add items to your cart, and proceed to checkout. You can pay via bKash, Nagad, or cash on delivery.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept bKash, Nagad, Rocket, bank transfer, and cash on delivery for orders within Bangladesh.',
    },
    {
        q: 'How long does delivery take?',
        a: 'Orders within Dhaka are delivered in 1–2 business days. Outside Dhaka, delivery takes 3–5 business days.',
    },
    {
        q: 'Can I return or exchange a product?',
        a: 'Yes! We offer a 7-day return policy on unused items in original packaging. Contact us at support@della.com.bd.',
    },
    {
        q: 'How do I track my order?',
        a: 'Log in to your account, go to "My Orders", and click on any order to view its real-time tracking status.',
    },
    {
        q: 'Is my personal information secure?',
        a: 'Absolutely. We use industry-standard encryption and never share your personal data with third parties.',
    },
    {
        q: 'Do you ship outside Bangladesh?',
        a: 'Currently we only ship within Bangladesh. International shipping is coming soon!',
    },
    {
        q: 'How do I contact customer support?',
        a: 'You can reach us via our Contact page, email at support@della.com.bd, or phone at +880 1700-000000.',
    },
];

const FAQ = () => {
    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '80vh' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)', color: '#fff', padding: '60px 0 40px' }}>
                <Container className="text-center">
                    <h1 className="fw-bold mb-2">Frequently Asked Questions</h1>
                    <p style={{ color: '#b0bec5' }}>Find quick answers to common questions.</p>
                </Container>
            </div>

            <Container style={{ maxWidth: 780 }} className="py-5">
                <Accordion defaultActiveKey="0" flush className="shadow-sm rounded overflow-hidden">
                    {faqs.map((faq, i) => (
                        <Accordion.Item eventKey={String(i)} key={i}>
                            <Accordion.Header>
                                <span className="fw-semibold">{faq.q}</span>
                            </Accordion.Header>
                            <Accordion.Body className="text-muted">{faq.a}</Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Container>
        </div>
    );
};

export default FAQ;
