import { Card, Badge, Button } from "react-bootstrap";
import PropTypes from "prop-types";

function SessionCard({
  session,
  onAccept,
  onRate,
  onComplete,
  onAddMeeting,
  currentUserId,
}) {
  const isMentor = session.mentor?.id === currentUserId;
  const isRequester = session.requester?.id === currentUserId;

  const getStatusVariant = (status) => {
    switch (status) {
      case "requested":
        return "warning";
      case "accepted":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="session-card mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Card.Title className="mb-1">
              {session.skill?.name || "General Session"}
            </Card.Title>
            <Card.Subtitle className="text-muted">
              {isMentor && `With ${session.requester?.username}`}
              {isRequester && `With ${session.mentor?.username}`}
            </Card.Subtitle>
          </div>
          <Badge bg={getStatusVariant(session.status)}>{session.status}</Badge>
        </div>

        {session.description && (
          <Card.Text className="mb-2">{session.description}</Card.Text>
        )}

        <div className="small text-muted mb-2">
          <div>Duration: {session.duration_minutes} minutes</div>
          <div>Scheduled: {formatDate(session.scheduled_time)}</div>
        </div>

        {session.status === 'accepted' && session.meeting_url && (
          <div className="mb-2">
            <strong>Meeting:</strong>{' '}
            <a href={session.meeting_url} target="_blank" rel="noopener noreferrer">
              Join Session
            </a>
          </div>
        )}

        {session.rating && (
          <div className="mb-2">
            <strong>Rating: </strong>
            <span className="rating-stars">
              {"★".repeat(session.rating.score)}
              {"☆".repeat(5 - session.rating.score)}
            </span>
            {session.rating.comment && (
              <div className="small text-muted mt-1">
                &quot;{session.rating.comment}&quot;
              </div>
            )}
          </div>
        )}

        <div className="d-flex flex-wrap gap-2">
          {isMentor && session.status === "requested" && onAccept && (
            <Button
              variant="success"
              size="sm"
              onClick={() => onAccept(session.id)}
            >
              Accept Session
            </Button>
          )}

          {session.status === "accepted" && session.meeting_url && (
            <Button
              as="a"
              href={session.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="sm"
            >
              Join Session
            </Button>
          )}

          {isMentor &&
            session.status === "accepted" &&
            !session.meeting_url && (
              <>
                <Button
                  as="a"
                  href="https://zoom.us/meeting/schedule"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outline-primary"
                  size="sm"
                >
                  Generate Zoom Link
                </Button>
                {onAddMeeting && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAddMeeting(session)}
                  >
                    Paste Link
                  </Button>
                )}
              </>
            )}

          {isMentor &&
            session.status === "accepted" &&
            session.meeting_url &&
            onAddMeeting && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => onAddMeeting(session)}
              >
                Update Link
              </Button>
            )}

          {["accepted"].includes(session.status) &&
            onComplete &&
            (isMentor || isRequester) && (
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => onComplete(session.id)}
              >
                Mark as Completed
              </Button>
            )}

          {session.status === "completed" &&
            !session.rating &&
            isRequester &&
            onRate && (
              <Button
                variant="warning"
                size="sm"
                onClick={() => onRate(session)}
              >
                Rate Session
              </Button>
            )}
        </div>
      </Card.Body>
    </Card>
  );
}

SessionCard.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    description: PropTypes.string,
    duration_minutes: PropTypes.number,
    scheduled_time: PropTypes.string,
    skill: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
    mentor: PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
    }),
    requester: PropTypes.shape({
      id: PropTypes.number,
      username: PropTypes.string,
    }),
    rating: PropTypes.shape({
      score: PropTypes.number,
      comment: PropTypes.string,
    }),
  }).isRequired,
  onAccept: PropTypes.func,
  onRate: PropTypes.func,
  onComplete: PropTypes.func,
  onAddMeeting: PropTypes.func,
  currentUserId: PropTypes.number,
};

export default SessionCard;
