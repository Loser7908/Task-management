'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import { api } from '../../utils/api';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    age: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await api.post('/auth/signup', formData);
      
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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page" style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow">
              <Card.Header className="bg-white">
                <h3 className="text-center mb-0">Create Account</h3>
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
                  <Form.Group className="mb-3">
                    <Form.Label>Age</Form.Label>
                    <Form.Control
                      type="number"
                      required
                      min="18"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </Form.Group>
                  <div className="d-grid">
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                  </div>
                </Form>
                <div className="text-center mt-3">
                  <small>Already have an account? <Link href="/">Login</Link></small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}