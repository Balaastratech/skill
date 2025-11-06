import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../features/auth/authSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import { ENABLE_NOTIFICATIONS } from '../config';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password2) {
      alert('Passwords do not match');
      return;
    }

    const result = await dispatch(register(formData));
    if (result.type === 'auth/register/fulfilled') {
      if (ENABLE_NOTIFICATIONS) {
        dispatch(
          addNotification({
            title: 'Registration Successful',
            message: 'Please login to continue.',
            variant: 'success',
          })
        );
      }
      navigate('/login');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Create Your Account</h2>
              
              {error && (
                <Alert variant="danger">
                  {typeof error === 'object' 
                    ? Object.entries(error).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value}
                        </div>
                      ))
                    : error
                  }
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 8 characters
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button
                  variant="dark"
                  type="submit"
                  className="w-100"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Creating account...' : 'Create Account'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Already have an account?{' '}
                  <Link to="/login">Sign in here</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
