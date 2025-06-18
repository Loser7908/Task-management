'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { api } from '../utils/api';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

export default function LandingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    dispatch(loginStart());
    try {
      // Using our API utility which handles encryption/decryption
      const data = await api.post('/auth/login', formData);
      
      // Store the token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Dispatch login success action
      dispatch(loginSuccess({
        user: data.user,
        token: data.token
      }));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      dispatch(loginFailure(err.message));
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-page" style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      {/* Header */}
      <header className="bg-primary py-3">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h1 className="text-white m-0">Task Management System</h1>
            </Col>
            <Col xs="auto">
              <Button 
                variant="outline-light" 
                className="me-2"
                onClick={() => setShowLogin(true)}
              >
                Login
              </Button>
              <Link href="/signup" passHref>
                <Button variant="light">Sign Up</Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </header>

      {/* Hero Section */}
      <Container className="py-5">
        <Row className="align-items-center">
          <Col md={6} className="mb-4 mb-md-0">
            <h2 className="display-4 fw-bold">Manage Your Tasks Efficiently</h2>
            <p className="lead my-4">
              A simple and powerful task management system inspired by Trello. Organize your tasks, collaborate with team members, and track progress in real-time.
            </p>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => setShowLogin(true)}
            >
              Get Started
            </Button>
          </Col>
          <Col md={6}>
            <img 
              src="/board-preview.svg" 
              alt="Task Board Preview" 
              className="img-fluid rounded shadow" 
              style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
            />
          </Col>
        </Row>
      </Container>

      {/* Features Section */}
      <Container className="py-5 bg-light">
        <h2 className="text-center mb-5">Key Features</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="bi bi-kanban" style={{ fontSize: '2rem', color: '#0d6efd' }}></i>
                </div>
                <Card.Title>Drag & Drop Interface</Card.Title>
                <Card.Text>
                  Easily move tasks between different status columns with our intuitive drag and drop interface.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="bi bi-chat-dots" style={{ fontSize: '2rem', color: '#0d6efd' }}></i>
                </div>
                <Card.Title>Real-time Chat</Card.Title>
                <Card.Text>
                  Communicate with team members in real-time through our integrated chat functionality.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="bi bi-shield-lock" style={{ fontSize: '2rem', color: '#0d6efd' }}></i>
                </div>
                <Card.Title>Secure Communication</Card.Title>
                <Card.Text>
                  All data is encrypted using CryptoJS to ensure your task information remains secure.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Login Modal */}
      {showLogin && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <Card className="shadow" style={{ width: '400px' }}>
            <Card.Header className="d-flex justify-content-between align-items-center bg-white">
              <h5 className="m-0">Login</h5>
              <Button variant="close" onClick={() => setShowLogin(false)}></Button>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="danger">{error}</Alert>
                )}
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </Form>
              <div className="text-center mt-3">
                <small>Don't have an account? <Link href="/signup">Sign up</Link></small>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
}
