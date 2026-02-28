import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
      } catch (err) {
        console.error("Error fetching all products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return (
    <Container className="py-5 text-center">
      <Spinner animation="border" variant="primary" />
    </Container>
  );

  return (
    <Container className="py-5">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item active>All Products</Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Our <span className="text-primary">Collection</span></h2>
        <span className="text-muted">{products.length} Products</span>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row xs={2} md={3} lg={4} className="g-4">
        {products.map(product => (
          <Col key={product.id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AllProducts;
