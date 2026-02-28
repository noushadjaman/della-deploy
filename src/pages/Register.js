import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { register, googleLogin } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await register(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to create an account. ' + err.message);
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
      setError('Failed to sign up with Google. ' + err.message);
    }
    setLoading(false);
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <h2 className="text-center mb-4 fw-bold">Sign Up</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" ref={emailRef} required />
              </Form.Group>
              <Form.Group id="password" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" ref={passwordRef} required />
              </Form.Group>
              <Form.Group id="password-confirm" className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control type="password" ref={passwordConfirmRef} required />
              </Form.Group>
              <Button disabled={loading} className="w-100 btn-primary" type="submit">
                Sign Up
              </Button>
            </Form>
            <div className="text-center mt-3">
              <button disabled={loading} onClick={handleGoogleLogin} type="button" className="google-btn google-full">
                <svg className="google-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path fill="#EA4335" d="M12 11.5v2.9h5.4c-.2 1.3-.9 2.5-1.9 3.3l3 2.3C20.9 19.6 22 16.9 22 12c0-.8-.1-1.6-.3-2.4H12z" />
                  <path fill="#34A853" d="M6.1 14.1c-.9-1.3-1.4-2.9-1.4-4.6s.5-3.3 1.4-4.6L3.1 2.6C1.1 5.1 0 8.4 0 12s1.1 6.9 3.1 9.4l3-2.3z" />
                  <path fill="#4A90E2" d="M12 3.7c2.2 0 4.1.8 5.6 2.4l4.2-4.2C18.9.9 15.7 0 12 0 7.7 0 3.9 1.9 1.7 4.9l4.4 3.4C7.4 6 9.6 3.7 12 3.7z" />
                  <path fill="#FBBC05" d="M22.5 4.1l-4.2 3.3C17.6 6.6 14.9 5 12 5v4.5h10.5C22.7 9.6 22.6 7 22.5 4.1z" />
                </svg>
                <span>Sign Up with Google</span>
              </button>
            </div>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          Already have an account? <Link to="/login" className="fw-bold">Log In</Link>
        </div>
      </div>
    </Container>
  );
};

export default Register;
