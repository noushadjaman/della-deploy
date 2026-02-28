import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signOut, getAuth } from 'firebase/auth';

const EmailVerification = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Check if email is already verified
    if (currentUser.emailVerified) {
      navigate('/');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentUser, navigate]);

  const handleResendEmail = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/otp/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentUser.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('New verification code sent! Please check your inbox.');
        setCountdown(60);
        setCanResend(false);
      } else {
        setError(data.error || 'Failed to resend verification code.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setVerificationCode(newCode);
      document.getElementById('code-5')?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Send OTP verification request to backend
      const response = await fetch('/api/otp/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentUser.email,
          otp: code
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Email verified successfully! Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(data.error || 'Verification failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <div className="w-100" style={{ maxWidth: "500px" }}>
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <div className="mb-3">
                <i className="fas fa-envelope-open-text" style={{ fontSize: '48px', color: '#007bff' }}></i>
              </div>
              <h2 className="fw-bold">Verify Your Email</h2>
              <p className="text-muted">We've sent a verification code to your email address</p>
              <p className="text-muted fw-bold">{currentUser?.email}</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Form.Label className="fw-bold">Enter 6-digit verification code</Form.Label>
                <div className="d-flex gap-2 justify-content-center">
                  {verificationCode.map((digit, index) => (
                    <Form.Control
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="text-center"
                      style={{
                        fontSize: '24px',
                        height: '60px',
                        width: '60px',
                        border: '2px solid #dee2e6',
                        borderRadius: '8px'
                      }}
                      required
                    />
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-100 fw-bold py-2 mb-3"
                disabled={loading}
                style={{ background: '#007bff', border: 'none' }}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>

              <div className="text-center">
                <Button 
                  variant="outline-primary" 
                  onClick={handleResendEmail}
                  disabled={loading || !canResend}
                  className="me-2"
                >
                  {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
                </Button>
                <Button variant="outline-secondary" onClick={handleLogout}>
                  Logout
                </Button>
              </div>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Didn't receive the email? Check your spam folder or contact support.
                </small>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <div className="text-center mt-3">
          <small className="text-muted">
            <i className="fas fa-shield-alt me-1"></i>
            Your security is important to us. We never share your email address.
          </small>
        </div>
      </div>
    </Container>
  );
};

export default EmailVerification;