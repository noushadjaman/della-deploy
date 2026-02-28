import React from 'react';
import { Container } from 'react-bootstrap';

const Terms = () => {
    const sections = [
        {
            title: '1. Acceptance of Terms',
            text: 'By accessing or using Della\'s website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.',
        },
        {
            title: '2. Eligibility',
            text: 'You must be at least 13 years old to use this service. By using Della, you confirm that you meet this age requirement.',
        },
        {
            title: '3. Account Responsibility',
            text: 'You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately at support@della.com.bd if you suspect unauthorized access.',
        },
        {
            title: '4. Product Information',
            text: 'We strive to display accurate product information, images, and pricing. However, we reserve the right to correct errors and cancel orders in case of pricing mistakes.',
        },
        {
            title: '5. Orders & Payments',
            text: 'All orders are subject to product availability. We reserve the right to refuse or cancel any order. Payment must be completed before dispatch.',
        },
        {
            title: '6. Prohibited Activities',
            text: 'Users may not attempt to hack, scrape, or interfere with our platform; impersonate others; or use the site for any unlawful purpose.',
        },
        {
            title: '7. Limitation of Liability',
            text: 'Della is not liable for indirect, incidental, or consequential damages arising from your use of the platform or products purchased through it.',
        },
        {
            title: '8. Changes to Terms',
            text: 'We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.',
        },
    ];

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '80vh' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)', color: '#fff', padding: '60px 0 40px' }}>
                <Container className="text-center">
                    <h1 className="fw-bold mb-2">Terms of Service</h1>
                    <p style={{ color: '#b0bec5' }}>Last updated: March 2026</p>
                </Container>
            </div>

            <Container style={{ maxWidth: 800 }} className="py-5">
                <div className="bg-white p-4 p-md-5 rounded shadow-sm">
                    <p className="text-muted mb-4">
                        Please read these Terms of Service carefully before using the Della platform.
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

export default Terms;
