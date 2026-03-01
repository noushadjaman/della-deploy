import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const discount = product.discount || 0;
  const discountedPrice = discount > 0 ? (product.price * (1 - discount / 100)).toFixed(0) : product.price;

  // Optimize Cloudinary URL
  const getOptimizedUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/f_auto,q_auto,w_400/');
  };

  return (
    <Card className="h-100 product-card border-0 shadow-sm overflow-hidden position-relative">
      <div className="product-image-wrapper position-relative">
        {discount > 0 && (
          <span className="position-absolute" style={{ background: 'var(--primary)', color: '#fff', padding: '4px 10px', borderRadius: '50px', top: '10px', left: '10px', zIndex: 10, fontSize: '0.7rem', fontWeight: '800', boxShadow: '0 4px 10px var(--primary-glow)', textTransform: 'uppercase' }}>-{discount}%</span>
        )}
        {product.condition === 'New' && !discount && product.stock > 0 && (
          <span className="position-absolute" style={{ background: 'var(--accent)', color: '#fff', padding: '4px 10px', borderRadius: '50px', top: '10px', left: '10px', zIndex: 10, fontSize: '0.7rem', fontWeight: '800', boxShadow: '0 4px 10px rgba(109, 40, 217, 0.3)', textTransform: 'uppercase' }}>New</span>
        )}
        {product.stock <= 0 && (
          <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 15, top: 0, left: 0 }}>
            <Badge bg="danger" className="px-3 py-2 fs-6 shadow-lg rotate-badge" style={{ transform: 'rotate(-15deg)' }}>SOLD OUT</Badge>
          </div>
        )}
        <div className="position-absolute top-0 end-0 p-2" style={{ zIndex: 20 }}>
          <button className="btn btn-light rounded-circle shadow-sm btn-sm">
            <i className="far fa-heart"></i>
          </button>
        </div>

        <Link to={product.stock > 0 ? `/product/${product.id}` : '#'} className="w-100 h-100 d-flex align-items-center justify-content-center">
          <img
            src={getOptimizedUrl(product.imageUrl)}
            alt={product.name}
            loading="lazy"
            className="mw-100 mh-100"
            style={{ objectFit: 'contain', transition: 'transform 0.3s ease' }}
          />
        </Link>
      </div>

      <Card.Body className="d-flex flex-column p-3 position-relative">
        <div className="mb-2">
          <Badge bg="light" text="dark" className="fw-normal border">{product.category}</Badge>
        </div>
        <Card.Title className="h6 mb-2 text-truncate" style={{ maxWidth: '100%', display: 'block' }}>
          <Link
            to={product.stock > 0 ? `/product/${product.id}` : '#'}
            className={`text-decoration-none text-dark ${product.stock > 0 ? 'stretched-link' : 'disabled-link disabled'}`}
            style={{ pointerEvents: product.stock > 0 ? 'auto' : 'none', opacity: product.stock > 0 ? 1 : 0.7 }}
          >
            {product.name}
          </Link>
        </Card.Title>
        <div className="mt-auto d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <div>
            <span className="product-price" style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.1rem' }}><span className="fw-bold" style={{ fontSize: '0.8rem' }}>৳</span>{discountedPrice}</span>
            {discount > 0 && (
              <div className="small text-muted text-decoration-line-through ms-2">
                <span className="fw-bold">৳</span>{product.price}
              </div>
            )}
          </div>
          <div className="d-flex align-items-center small mt-1">
            <i className="fas fa-star" style={{ color: 'var(--vibrant-amber)' }}></i>
            <span className="text-muted ms-1" style={{ fontSize: '0.7rem' }}>({product.rating || '4.5'})</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
