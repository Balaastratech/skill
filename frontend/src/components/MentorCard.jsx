import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

function MentorCard({ mentor }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/mentors/${mentor.id}`);
  };

  return (
    <Card className="mentor-card h-100" onClick={handleClick}>
      <Card.Body>
        <Card.Title>
          {mentor.first_name} {mentor.last_name}
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          @{mentor.username}
        </Card.Subtitle>
        
        <div className="mb-3">
          {mentor.profile?.skills?.map((skill) => (
            <Badge key={skill.id} bg="secondary" className="me-1 mb-1">
              {skill.name}
            </Badge>
          ))}
        </div>

        {mentor.profile?.rating_avg > 0 && (
          <div className="mb-2">
            <span className="rating-stars">
              {'★'.repeat(Math.round(mentor.profile.rating_avg))}
              {'☆'.repeat(5 - Math.round(mentor.profile.rating_avg))}
            </span>
            <small className="text-muted ms-2">
              ({mentor.profile.rating_count} reviews)
            </small>
          </div>
        )}

        {mentor.profile?.bio && (
          <Card.Text className="text-muted small">
            {mentor.profile.bio.substring(0, 100)}
            {mentor.profile.bio.length > 100 ? '...' : ''}
          </Card.Text>
        )}

        <Button variant="primary" size="sm" className="w-100">
          View Profile
        </Button>
      </Card.Body>
    </Card>
  );
}

MentorCard.propTypes = {
  mentor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    profile: PropTypes.shape({
      bio: PropTypes.string,
      skills: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string,
        })
      ),
      rating_avg: PropTypes.number,
      rating_count: PropTypes.number,
    }),
  }).isRequired,
};

export default MentorCard;
