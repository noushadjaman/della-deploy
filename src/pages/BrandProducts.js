import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Breadcrumb } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';

const BrandProducts = () => {
  const { brandName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandProducts = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'products'), where('brand', '==', brandName));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(items);
      } catch (err) {
        console.error("Error fetching brand products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandProducts();
  }, [brandName]);

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
        <Breadcrumb.Item active>{brandName}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Products from <span className="text-primary">{brandName}</span></h2>
        <span className="badge bg-light text-dark border p-2">{products.length} Products Found</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-5">
          <h4 className="text-muted">No product found for this category.</h4>
          <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
        </div>
      ) : (
        <Row xs={2} md={3} lg={4} className="g-3">
          {products.map(product => (
            <Col key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default BrandProducts;
