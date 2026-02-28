import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, googleLogin, register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value.trim();

    try {
      setError('');
      setLoading(true);
      await login(email, password);

      // Redirect Admin directly to Dashboard
      if (email === 'admin@admin.della') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      // Auto-create Admin account if it doesn't exist
      if (email === 'admin@admin.della' && password === 'adminadmin') {
        try {
          await register(email, password);
          navigate('/admin');
          return; // Exit successfully
        } catch (regErr) {
          console.error("Admin auto-creation failed:", regErr);
          if (regErr.code === 'auth/email-already-in-use') {
            setError('Admin account exists but password is incorrect.');
          } else {
            setError('Failed to create admin account: ' + regErr.message);
          }
          setLoading(false);
          return;
        }
      }

      console.error(err);
      setError('Failed to sign in. Please check your credentials.');
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await googleLogin();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to sign in with Google. ' + err.message);
    }
    setLoading(false);
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <h2 className="text-center mb-4 fw-bold">Sign In</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" ref={emailRef} required />
              </Form.Group>
              <Form.Group id="password" className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" ref={passwordRef} required />
              </Form.Group>
              <Button disabled={loading} className="w-100 btn-primary" type="submit">
                Sign In
              </Button>
            </Form>
            <div className="w-100 text-center mt-3">
              <Button disabled={loading} onClick={handleGoogleLogin} className="w-100 btn-danger">
                <i className="fab fa-google me-2"></i> Sign In with Google
              </Button>
            </div>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          Need an account? <Link to="/register" className="fw-bold">Sign Up</Link>
        </div>
      </div>
    </Container>
  );
};

export default Login;
