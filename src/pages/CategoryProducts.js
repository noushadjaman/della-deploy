import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Breadcrumb } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';

const CategoryProducts = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all products first to see what we have
        const allProductsQuery = query(collection(db, 'products'));
        const allSnapshot = await getDocs(allProductsQuery);
        const allProducts = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log("All products:", allProducts);
        console.log("Looking for category:", categoryName);

        // Filter by category (case-insensitive)
        const filteredProducts = allProducts.filter(product =>
          product.category && product.category.toLowerCase() === categoryName.toLowerCase()
        );

        console.log("Filtered products:", filteredProducts);
        setProducts(filteredProducts);
      } catch (err) {
        console.error("Error fetching category products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryName]);

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
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/categories" }}>Categories</Breadcrumb.Item>
        <Breadcrumb.Item active>{categoryName}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Products in <span className="text-primary">{categoryName}</span></h2>
        <span className="badge bg-light text-dark border p-2">{products.length} Products Found</span>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {products.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">No product found for this category.</h5>
          <Link to="/products" className="btn btn-primary mt-3">View All Products</Link>
        </div>
      ) : (
        <Row className="g-4">
          {products.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default CategoryProducts;
