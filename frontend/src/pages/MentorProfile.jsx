import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMentorById } from '../features/mentors/mentorsSlice';
import { createSession } from '../features/sessions/sessionsSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import { ENABLE_NOTIFICATIONS } from '../config';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import LoadingSpinner from '../components/LoadingSpinner';
import axiosInstance from '../api/axios';

function MentorProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentMentor, loading } = useSelector((state) => state.mentors);
  const { user } = useSelector((state) => state.auth);
  const { creating } = useSelector((state) => state.sessions);
  
  const [showModal, setShowModal] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [sessionData, setSessionData] = useState({
    skill_id: '',
    duration_minutes: 30,
    description: '',
    scheduled_time: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchMentorById(id));
    
    // Fetch ratings for this mentor
    const fetchRatings = async () => {
      try {
        const response = await axiosInstance.get(`ratings/?mentor_id=${id}`);
        setRatings(response.data.results || response.data);
      } catch (err) {
        console.error('Failed to fetch ratings:', err);
      }
    };
    fetchRatings();
  }, [dispatch, id]);

  const handleRequestSession = () => {
    if (user?.id && currentMentor?.id && user.id === currentMentor.id) {
      setError('You cannot request a session with yourself.');
      setShowModal(false);
      return;
    }
    setShowModal(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const requestData = {
      mentor_id: parseInt(id),
      ...sessionData,
      skill_id: sessionData.skill_id ? parseInt(sessionData.skill_id) : null,
    };

    const result = await dispatch(createSession(requestData));
    if (result.type === 'sessions/createSession/fulfilled') {
      setShowModal(false);
      if (ENABLE_NOTIFICATIONS) {
        dispatch(
          addNotification({
            title: 'Session Requested',
            message: 'Your session request has been sent to the mentor.',
            variant: 'success',
          })
        );
      }
      navigate('/dashboard');
    } else if (result.type === 'sessions/createSession/rejected') {
      const p = result.payload;
      let msg = 'Failed to create session';
      if (typeof p === 'string') msg = p;
      else if (p && typeof p === 'object') {
        const parts = [];
        Object.entries(p).forEach(([k, v]) => {
          if (Array.isArray(v)) parts.push(`${k}: ${v.join(', ')}`);
          else parts.push(`${k}: ${v}`);
        });
        if (parts.length) msg = parts.join(' | ');
      }
      setError(msg);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentMentor) {
    return (
      <Container>
        <p className="text-center text-muted py-5">Mentor not found</p>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <h1 className="mb-2">
                {currentMentor.first_name} {currentMentor.last_name}
              </h1>
              <p className="text-muted mb-3">@{currentMentor.username}</p>

              {currentMentor.profile?.rating_avg > 0 && (
                <div className="mb-3">
                  <span className="rating-stars fs-5">
                    {'★'.repeat(Math.round(currentMentor.profile.rating_avg))}
                    {'☆'.repeat(5 - Math.round(currentMentor.profile.rating_avg))}
                  </span>
                  <span className="text-muted ms-2">
                    {currentMentor.profile.rating_avg.toFixed(1)} ({currentMentor.profile.rating_count} reviews)
                  </span>
                </div>
              )}

              <div className="mb-3">
                <strong>Skills:</strong>
                <div className="mt-2">
                  {currentMentor.profile?.skills?.map((skill) => (
                    <Badge key={skill.id} bg="secondary" className="me-2 mb-2">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {currentMentor.profile?.bio && (
                <div className="mb-3">
                  <strong>About:</strong>
                  <p className="mt-2">{currentMentor.profile.bio}</p>
                </div>
              )}

              {user?.id === currentMentor.id ? (
                <Alert variant="warning" className="mt-2">
                  You are viewing your own mentor profile.
                </Alert>
              ) : (
                <Button variant="primary" size="lg" onClick={handleRequestSession}>
                  Request Session
                </Button>
              )}
            </Card.Body>
          </Card>

          {/* Ratings Section */}
          {ratings.length > 0 && (
            <Card>
              <Card.Body>
                <h3 className="mb-4">Reviews</h3>
                {ratings.map((rating) => (
                  <div key={rating.id} className="mb-3 pb-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{rating.rater?.username}</strong>
                        <span className="ms-2 badge bg-secondary">{rating.rater?.is_mentor ? 'Mentor' : 'Learner'}</span>
                        <div className="rating-stars">
                          {'★'.repeat(rating.score)}
                          {'☆'.repeat(5 - rating.score)}
                        </div>
                      </div>
                      <small className="text-muted">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    {rating.comment && (
                      <p className="mt-2 mb-0 text-muted">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <h5>Availability</h5>
              {currentMentor.profile?.availability?.length > 0 ? (
                <ul className="list-unstyled">
                  {currentMentor.profile.availability.map((slot, index) => (
                    <li key={index} className="mb-2">
                      <strong>Day {slot.day}:</strong> {slot.start} - {slot.end}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No availability set</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Session Request Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Session with {currentMentor.first_name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Skill</Form.Label>
              <Form.Select
                value={sessionData.skill_id}
                onChange={(e) => setSessionData({ ...sessionData, skill_id: e.target.value })}
              >
                <option value="">Select a skill</option>
                {currentMentor.profile?.skills?.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Duration</Form.Label>
              <Form.Select
                value={sessionData.duration_minutes}
                onChange={(e) => setSessionData({ ...sessionData, duration_minutes: parseInt(e.target.value) })}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Preferred Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={sessionData.scheduled_time}
                onChange={(e) => setSessionData({ ...sessionData, scheduled_time: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="What would you like to learn?"
                value={sessionData.description}
                onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Sending...' : 'Send Request'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default MentorProfile;
