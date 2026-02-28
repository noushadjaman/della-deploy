import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Search = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    async function fetchAndFilter() {
      if (!queryParam) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const searchTerms = queryParam.toLowerCase().split(' ').filter(t => t);
        
        const productsSnapshot = await getDocs(collection(db, "products"));
        const allProducts = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Priority Logic: Product Name > Category > Brand
        const byName = [];
        const byCategory = [];
        const byBrand = [];

        allProducts.forEach(product => {
          const name = (product.name || '').toLowerCase();
          const category = (product.category || '').toLowerCase();
          const brand = (product.brand || '').toLowerCase();

          const matchesName = searchTerms.some(term => name.includes(term));
          const matchesCategory = searchTerms.some(term => category.includes(term));
          const matchesBrand = searchTerms.some(term => brand.includes(term));

          if (matchesName) {
            byName.push(product);
          } else if (matchesCategory) {
            byCategory.push(product);
          } else if (matchesBrand) {
            byBrand.push(product);
          }
        });

        // Combine with priority and remove duplicates (though the logic above already avoids them)
        const prioritizedResults = [...byName, ...byCategory, ...byBrand];
        setResults(prioritizedResults);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search products.");
      } finally {
        setLoading(false);
      }
    }

    fetchAndFilter();
  }, [queryParam]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h3 className="fw-bold mb-4">
        Search Results for: <span className="text-primary">"{queryParam}"</span>
      </h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {results.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-search-minus fa-3x text-muted mb-3"></i>
          <h5>No products found matching your search.</h5>
          <p className="text-muted">Try using different keywords or checking for typos.</p>
        </div>
      ) : (
        <Row xs={2} md={3} lg={4} className="g-4">
          {results.map(product => (
            <Col key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Search;
