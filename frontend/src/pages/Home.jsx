import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Button } from 'react-bootstrap';

function Home() {
  const { token } = useSelector((state) => state.auth);

  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col lg={8}>
          <h1 className="display-4 fw-bold mb-4">Welcome to SkillSync</h1>
          <p className="lead text-muted mb-4">
            Exchange skills instantly. Offer what you know and learn what you need — 
            in short, focused mentorship sessions.
          </p>
          
          <div className="d-flex gap-3 justify-content-center">
            {token ? (
              <>
                <Button as={Link} to="/dashboard" variant="dark" size="lg">
                  Go to Dashboard
                </Button>
                <Button as={Link} to="/finder" variant="outline-dark" size="lg">
                  Find Mentors
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/register" variant="dark" size="lg">
                  Get Started
                </Button>
                <Button as={Link} to="/login" variant="outline-dark" size="lg">
                  Sign In
                </Button>
              </>
            )}
          </div>

          <Row className="mt-5 pt-5">
            <Col md={4} className="mb-4">
              <h3 className="h5">🎯 Quick Sessions</h3>
              <p className="text-muted">
                15-60 minute focused mentorship sessions that fit your schedule
              </p>
            </Col>
            <Col md={4} className="mb-4">
              <h3 className="h5">🌟 Expert Mentors</h3>
              <p className="text-muted">
                Connect with experienced professionals in various skills
              </p>
            </Col>
            <Col md={4} className="mb-4">
              <h3 className="h5">💡 Learn & Teach</h3>
              <p className="text-muted">
                Share your expertise and learn new skills from the community
              </p>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
