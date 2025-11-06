import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../features/auth/authSlice';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ username, password }));
    if (result.type === 'auth/login/fulfilled') {
      navigate('/dashboard');
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card>
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Sign In to SkillSync</h2>
              
              {error && (
                <Alert variant="danger">
                  {typeof error === 'string' ? error : 'Login failed. Please check your credentials.'}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  variant="dark"
                  type="submit"
                  className="w-100"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Don&apos;t have an account?{' '}
                  <Link to="/register">Register here</Link>
                </small>
              </div>

              <div className="mt-4 pt-3 border-top">
                <small className="text-muted d-block mb-2">Demo Accounts:</small>
                <small className="text-muted d-block">Learner: alice / password123</small>
                <small className="text-muted d-block">Mentor: sarah_mentor / password123</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
