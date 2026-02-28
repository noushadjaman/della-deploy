import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Breadcrumb } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesQuery = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item active>All Categories</Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">All <span className="text-primary">Categories</span></h2>
        <span className="badge bg-light text-dark border p-2">{categories.length} Categories</span>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">No categories found.</h5>
        </div>
      ) : (
        <Row className="g-4">
          {categories.map((category) => (
            <Col key={category.id} xs={6} sm={4} md={3} lg={2}>
              <div
                className="border rounded p-3 text-center cursor-pointer hover-shadow d-flex flex-column align-items-center justify-content-center"
                onClick={() => navigate(`/category/${category.name}`)}
                style={{ cursor: 'pointer', transition: 'all 0.3s', minHeight: '150px' }}
              >
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="rounded-circle mb-3"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="fas fa-tag text-muted fa-2x"></i>
                  </div>
                )}
                <h6 className="fw-bold text-dark text-truncate">{category.name}</h6>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default AllCategories;
