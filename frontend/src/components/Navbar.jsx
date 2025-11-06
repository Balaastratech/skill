import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const isMentor = !!user?.profile?.is_mentor;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          SkillSync
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {token && (
              <>
                <Nav.Link as={Link} to="/dashboard">
                  {isMentor ? 'Mentor Dashboard' : 'Dashboard'}
                </Nav.Link>
                {(
                  <Nav.Link as={Link} to="/finder">
                    Find Mentors
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {token && user ? (
              <>
                <Nav.Link as={Link} to="/profile">
                  {user.username}
                  <span className="ms-2 badge bg-secondary">{isMentor ? 'Mentor' : 'Learner'}</span>
                </Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;
