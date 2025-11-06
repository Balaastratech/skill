import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSessions, acceptSession, rateSession, completeSession, updateMeetingUrl } from '../features/sessions/sessionsSlice';
import { Container, Row, Col, Tabs, Tab, Modal, Form, Button } from 'react-bootstrap';
import SessionCard from '../components/SessionCard';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const dispatch = useDispatch();
  const { upcoming, past, loading } = useSelector((state) => state.sessions);
  const { user } = useSelector((state) => state.auth);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState({ score: 5, comment: '' });
  // Meeting link modal state
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);


  const handleAccept = async (sessionId) => {
    await dispatch(acceptSession(sessionId));
    dispatch(fetchSessions());
  };

  const handleComplete = async (sessionId) => {
    const result = await dispatch(completeSession(sessionId));
    if (result.type === 'sessions/completeSession/fulfilled') {
      const updated = result.payload;
      // If the current user is the learner (requester), prompt to rate immediately
      if (user?.id && updated?.requester?.id === user.id && !updated?.rating) {
        setSelectedSession(updated);
        setShowRatingModal(true);
      }
    }
    dispatch(fetchSessions());
  };

  const handleRateClick = (session) => {
    setSelectedSession(session);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (selectedSession) {
      await dispatch(rateSession({
        session_id: selectedSession.id,
        score: rating.score,
        comment: rating.comment,
      }));
      setShowRatingModal(false);
      setRating({ score: 5, comment: '' });
      dispatch(fetchSessions());
    }
  };


  const handleAddMeetingClick = (session) => {
    setSelectedSession(session);
    setMeetingUrl(session.meeting_url || '');
    setShowMeetingModal(true);
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    if (selectedSession && meetingUrl) {
      await dispatch(updateMeetingUrl({ sessionId: selectedSession.id, meeting_url: meetingUrl }));
      setShowMeetingModal(false);
      setMeetingUrl('');
      dispatch(fetchSessions());
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <h1 className="mb-4">{user?.profile?.is_mentor ? 'Mentor Dashboard' : 'My Dashboard'}</h1>
      
      {user && (
        <div className="mb-4">
          <p className="text-muted">
            Welcome back, {user.first_name || user.username}!
          </p>
        </div>
      )}

      <Tabs defaultActiveKey="upcoming" className="mb-4">
        <Tab eventKey="upcoming" title={`Upcoming (${upcoming.length})`}>
          <Row>
            {upcoming.length === 0 ? (
              <Col>
                <p className="text-muted text-center py-5">
                  No upcoming sessions. Visit the Finder to request a session!
                </p>
              </Col>
            ) : (
              upcoming.map((session) => (
                <Col key={session.id} md={6} lg={4} className="mb-4">
                  <SessionCard
                    session={session}
                    onAccept={handleAccept}
                    onComplete={handleComplete}
                    onAddMeeting={handleAddMeetingClick}
                    currentUserId={user?.id}
                  />
                </Col>
              ))
            )}
          </Row>
        </Tab>

        <Tab eventKey="past" title={`Past (${past.length})`}>
          <Row>
            {past.length === 0 ? (
              <Col>
                <p className="text-muted text-center py-5">
                  No past sessions yet.
                </p>
              </Col>
            ) : (
              past.map((session) => (
                <Col key={session.id} md={6} lg={4} className="mb-4">
                  <SessionCard
                    session={session}
                    onRate={handleRateClick}
                    onComplete={handleComplete}
                    onAddMeeting={handleAddMeetingClick}
                    currentUserId={user?.id}
                  />
                </Col>
              ))
            )}
          </Row>
        </Tab>
      </Tabs>

      {/* Rating Modal */}
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rate Session</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRatingSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Select
                value={rating.score}
                onChange={(e) => setRating({ ...rating, score: parseInt(e.target.value) })}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comment (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rating.comment}
                onChange={(e) => setRating({ ...rating, comment: e.target.value })}
                placeholder="Share your experience..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRatingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Rating
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Meeting Link Modal */}
      <Modal show={showMeetingModal} onHide={() => setShowMeetingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedSession?.meeting_url ? 'Update Meeting Link' : 'Add Meeting Link'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleMeetingSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Zoom Meeting URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://zoom.us/j/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Click "Generate Zoom Link" to create a meeting, then paste the Join URL here.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMeetingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Link
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Dashboard;
