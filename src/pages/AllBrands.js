import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Breadcrumb } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const AllBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const brandsQuery = query(collection(db, 'brands'), orderBy('createdAt', 'desc'));
        const brandsSnapshot = await getDocs(brandsQuery);
        const brandsData = brandsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBrands(brandsData);
      } catch (err) {
        console.error("Error fetching brands:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
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
        <Breadcrumb.Item active>All Brands</Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">All <span className="text-primary">Brands</span></h2>
        <span className="badge bg-light text-dark border p-2">{brands.length} Brands</span>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">No brands found.</h5>
        </div>
      ) : (
        <Row className="g-4">
          {brands.map((brand) => (
            <Col key={brand.id} xs={6} sm={4} md={3} lg={2}>
              <div
                className="border rounded p-3 text-center cursor-pointer hover-shadow"
                onClick={() => navigate(`/brands/${brand.name}`)}
                style={{ cursor: 'pointer', transition: 'all 0.3s' }}
              >
                {brand.imageUrl ? (
                  <img
                    src={brand.imageUrl}
                    alt={brand.name}
                    style={{ width: '100%', height: '100px', objectFit: 'contain', marginBottom: '10px' }}
                  />
                ) : (
                  <div
                    className="bg-light rounded d-flex align-items-center justify-content-center mb-2"
                    style={{ height: '100px' }}
                  >
                    <i className="fas fa-store text-muted fa-2x"></i>
                  </div>
                )}
                <h6 className="fw-bold text-dark text-truncate">{brand.name}</h6>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default AllBrands;
