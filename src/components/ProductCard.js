import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const discount = product.discount || 0;
  const discountedPrice = discount > 0 ? (product.price * (1 - discount / 100)).toFixed(0) : product.price;

  return (
    <Card className="h-100 product-card border-0 shadow-sm overflow-hidden position-relative">
      <div className="position-relative image-wrapper border-bottom" style={{ backgroundImage: `url(${product.imageUrl})` }}>
        {discount > 0 && (
          <span className="position-absolute" style={{ background: '#dc3545', color: '#fff', padding: '4px 8px', borderRadius: '4px', top: '8px', left: '8px', zIndex: 10, fontSize: '0.75rem', fontWeight: 'bold' }}>-{discount}%</span>
        )}
        {product.condition === 'New' && !discount && product.stock > 0 && (
          <span className="position-absolute" style={{ background: '#007bff', color: '#fff', padding: '4px 8px', borderRadius: '4px', top: '8px', left: '8px', zIndex: 10, fontSize: '0.75rem', fontWeight: 'bold' }}>New</span>
        )}
        {product.stock <= 0 && (
          <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 15, top: 0, left: 0 }}>
            <Badge bg="danger" className="px-3 py-2 fs-6 shadow-lg rotate-badge" style={{ transform: 'rotate(-15deg)' }}>SOLD OUT</Badge>
          </div>
        )}
        <div className="position-absolute top-0 end-0 p-2">
          <button className="btn btn-light rounded-circle shadow-sm btn-sm">
            <i className="far fa-heart"></i>
          </button>
        </div>
        <Link
          to={product.stock > 0 ? `/product/${product.id}` : '#'}
          className={`image-inner ${product.stock > 0 ? 'stretched-link' : 'disabled-link disabled'}`}
          style={{ pointerEvents: product.stock > 0 ? 'auto' : 'none', opacity: product.stock > 0 ? 1 : 0.7 }}
          role="img"
          aria-label={product.name}
        />
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
            <span className="product-price"><span className="fw-bold">৳</span>{discountedPrice}</span>
            {discount > 0 && (
              <div className="small text-muted text-decoration-line-through ms-2">
                <span className="fw-bold">৳</span>{product.price}
              </div>
            )}
          </div>
          <div className="d-flex align-items-center text-warning small">
            <i className="fas fa-star"></i>
            <span className="text-muted ms-1">({product.rating || 'New'})</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
