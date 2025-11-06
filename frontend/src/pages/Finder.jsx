import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMentors, setFilters, clearFilters } from '../features/mentors/mentorsSlice';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import MentorCard from '../components/MentorCard';
import LoadingSpinner from '../components/LoadingSpinner';
import axiosInstance from '../api/axios';

function Finder() {
  const dispatch = useDispatch();
  const { list, loading, filters } = useSelector((state) => state.mentors);
  const [skills, setSkills] = useState([]);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    // Fetch skills for filter
    const fetchSkills = async () => {
      try {
        const response = await axiosInstance.get('skills/');
        setSkills(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    dispatch(fetchMentors(filters));
  }, [dispatch, filters]);

  const handleSkillChange = (e) => {
    dispatch(setFilters({ skill: e.target.value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchInput }));
  };

  const handleClearFilters = () => {
    setSearchInput('');
    dispatch(clearFilters());
  };

  return (
    <Container>
      <h1 className="mb-4">Find Mentors</h1>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button variant="outline-dark" type="submit">
                Search
              </Button>
            </InputGroup>
          </Form>
        </Col>

        <Col md={4} className="mb-3">
          <Form.Select value={filters.skill} onChange={handleSkillChange}>
            <option value="">All Skills</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.name}>
                {skill.name}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={2} className="mb-3">
          <Button variant="outline-secondary" onClick={handleClearFilters} className="w-100">
            Clear Filters
          </Button>
        </Col>
      </Row>

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : list.length === 0 ? (
        <Row>
          <Col>
            <p className="text-muted text-center py-5">
              No mentors found. Try adjusting your filters.
            </p>
          </Col>
        </Row>
      ) : (
        <Row>
          {list.map((mentor) => (
            <Col key={mentor.id} md={6} lg={4} className="mb-4">
              <MentorCard mentor={mentor} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default Finder;
