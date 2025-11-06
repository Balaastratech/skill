import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../features/auth/authSlice';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axiosInstance from '../api/axios';

function Profile() {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.auth);
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    is_mentor: false,
    skill_ids: [],
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch all skills
    const fetchSkills = async () => {
      try {
        const response = await axiosInstance.get('skills/');
        setSkills(response.data.results || response.data);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        bio: user.profile?.bio || '',
        is_mentor: user.profile?.is_mentor || false,
        skill_ids: user.profile?.skills?.map(s => s.id) || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skill_ids: prev.skill_ids.includes(skillId)
        ? prev.skill_ids.filter(id => id !== skillId)
        : [...prev.skill_ids, skillId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    const result = await dispatch(updateProfile(formData));
    if (result.type === 'auth/updateProfile/fulfilled') {
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  if (!user) {
    return (
      <Container>
        <p className="text-center text-muted py-5">Loading...</p>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Body className="p-4">
              <h2 className="mb-4">Edit Profile</h2>

              {successMessage && (
                <Alert variant="success">{successMessage}</Alert>
              )}

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
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell others about yourself..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="is_mentor"
                    label="I want to be a mentor"
                    checked={formData.is_mentor}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Check this if you want to offer mentorship sessions
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Skills</Form.Label>
                  <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {skills.map((skill) => (
                      <Form.Check
                        key={skill.id}
                        type="checkbox"
                        id={`skill-${skill.id}`}
                        label={skill.name}
                        checked={formData.skill_ids.includes(skill.id)}
                        onChange={() => handleSkillToggle(skill.id)}
                        className="mb-2"
                      />
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    Select skills you can teach or want to learn
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <Button
                    variant="dark"
                    type="submit"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;
