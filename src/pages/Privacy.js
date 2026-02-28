import React from 'react';
import { Container } from 'react-bootstrap';

const Privacy = () => {
    const sections = [
        {
            title: '1. Information We Collect',
            text: 'We collect personal information such as your name, email address, phone number, and delivery address when you register or place an order. We also collect usage data like browsing behavior, device type, and IP address to improve our services.',
        },
        {
            title: '2. How We Use Your Information',
            text: 'Your information is used to process orders, send order updates, improve our platform, provide customer support, and send you relevant promotional offers (with your consent).',
        },
        {
            title: '3. Data Sharing',
            text: 'We do not sell your personal data. We only share it with trusted partners (courier services, payment processors) as necessary to fulfill your orders, and only under strict confidentiality agreements.',
        },
        {
            title: '4. Cookies',
            text: 'We use cookies to maintain your session, remember your cart, and analyze site traffic. You can disable cookies in your browser settings, though some features may not function properly.',
        },
        {
            title: '5. Data Security',
            text: 'We employ industry-standard security measures including HTTPS encryption, Firebase Authentication, and Firestore security rules to protect your personal information.',
        },
        {
            title: '6. Your Rights',
            text: 'You have the right to access, correct, or delete your personal data at any time. To make a request, contact us at privacy@della.com.bd.',
        },
        {
            title: '7. Changes to This Policy',
            text: 'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.',
        },
    ];

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '80vh' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)', color: '#fff', padding: '60px 0 40px' }}>
                <Container className="text-center">
                    <h1 className="fw-bold mb-2">Privacy Policy</h1>
                    <p style={{ color: '#b0bec5' }}>Last updated: March 2026</p>
                </Container>
            </div>

            <Container style={{ maxWidth: 800 }} className="py-5">
                <div className="bg-white p-4 p-md-5 rounded shadow-sm">
                    <p className="text-muted mb-4">
                        At Della, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
                    </p>
                    {sections.map(({ title, text }) => (
                        <div key={title} className="mb-4">
                            <h6 className="fw-bold mb-2">{title}</h6>
                            <p className="text-muted mb-0">{text}</p>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default Privacy;
