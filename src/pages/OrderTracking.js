import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const OrderTracking = () => {
    const { orderId } = useParams();
    const { currentUser } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            if (!currentUser) return;
            try {
                const orderDoc = await getDoc(doc(db, 'orders', orderId));
                if (orderDoc.exists()) {
                    const data = orderDoc.data();
                    // Security check: Only owner can view their order
                    if (data.userId === currentUser.uid) {
                        setOrder({ id: orderDoc.id, ...data });
                    } else {
                        alert("Unauthorized access.");
                        navigate('/my-orders');
                    }
                } else {
                    alert("Order not found.");
                    navigate('/my-orders');
                }
            } catch (err) {
                console.error("Error fetching order tracking:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, currentUser, navigate]);

    if (loading) return (
        <Container className="py-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </Container>
    );

    if (!order) return null;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return 'fa-receipt';
            case 'unpaid': return 'fa-wallet';
            case 'preparing': return 'fa-box-open';
            case 'shipped': return 'fa-truck-fast';
            case 'delivered': return 'fa-check-circle';
            case 'cancelled': return 'fa-times-circle';
            default: return 'fa-info-circle';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return '#198754';
            case 'cancelled': return '#dc3545';
            case 'shipped': return '#0dcaf0';
            case 'preparing': return '#0d6efd';
            default: return '#ffc107';
        }
    };

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <Button variant="link" onClick={() => navigate('/my-orders')} className="text-decoration-none p-0 mb-2">
                        <i className="fas fa-arrow-left me-2"></i>Back to My Orders
                    </Button>
                    <h2 className="fw-bold mb-0">Track Order <span className="text-primary">#{order.id.substring(0, 8)}</span></h2>
                </div>
                <Badge bg="light" className="text-dark border px-3 py-2 rounded-pill">
                    Status: <span className="text-capitalize fw-bold ms-1" style={{ color: getStatusColor(order.status) }}>{order.status}</span>
                </Badge>
            </div>

            <Row>
                <Col lg={8}>
                    <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                        <Card.Header className="bg-white border-0 pt-4 px-4">
                            <h5 className="fw-bold mb-0">Delivery Progress</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div className="tracking-timeline">
                                {order.statusHistory && order.statusHistory.length > 0 ? (
                                    order.statusHistory.map((history, index) => (
                                        <div key={index} className={`timeline-item ${index === order.statusHistory.length - 1 ? 'last' : ''}`}>
                                            <div className="timeline-dot" style={{ backgroundColor: getStatusColor(history.status) }}>
                                                <i className={`fas ${getStatusIcon(history.status)} text-white`}></i>
                                            </div>
                                            <div className="timeline-content">
                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                    <h6 className="fw-bold mb-0 text-capitalize">{history.status}</h6>
                                                    <small className="text-muted fw-bold">
                                                        {new Date(history.time).toLocaleDateString()} {new Date(history.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </small>
                                                </div>
                                                <p className="text-muted mb-0">{history.message}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted italic">Order tracking details will appear as the order progresses.</p>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3">Order Information</h5>
                            <div className="mb-3 pb-3 border-bottom">
                                <small className="text-muted d-block text-uppercase fw-bold mb-1">Delivery Address</small>
                                <p className="mb-0 fw-bold">{order.fullName}</p>
                                <p className="mb-0 small text-muted">{order.address}</p>
                                <p className="mb-0 small text-muted">{order.phone}</p>
                            </div>
                            <div>
                                <small className="text-muted d-block text-uppercase fw-bold mb-1">Payment Method</small>
                                <p className="mb-0 fw-bold">{order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</p>
                                <p className="mb-0 text-primary fw-bold fs-5 mt-2">Total: ৳{order.total}</p>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-4 bg-primary text-white">
                        <Card.Body className="p-4 text-center">
                            <i className="fas fa-headset fa-2x mb-3"></i>
                            <h6>Need Help?</h6>
                            <p className="small mb-0 opacity-75">If you have any questions regarding your delivery, please contact our support.</p>
                            <Button variant="light" size="sm" className="mt-3 rounded-pill px-4 text-primary fw-bold">Contact Support</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .tracking-timeline {
                    position: relative;
                    padding-left: 50px;
                }
                .tracking-timeline::before {
                    content: '';
                    position: absolute;
                    left: 24px;
                    top: 5px;
                    bottom: 5px;
                    width: 2px;
                    background: #e9ecef;
                }
                .timeline-item {
                    position: relative;
                    margin-bottom: 30px;
                }
                .timeline-dot {
                    position: absolute;
                    left: -50px;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: 4px solid #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    box-shadow: 0 0 15px rgba(0,0,0,0.1);
                }
                .timeline-dot i {
                    font-size: 1.2rem;
                }
                .timeline-content {
                    background: #f8f9fa;
                    padding: 15px 20px;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                }
                .timeline-item:last-child {
                    margin-bottom: 0;
                }
                .timeline-item:last-child .timeline-content {
                    background: #fff;
                    border-color: #0d6efd;
                    box-shadow: 0 4px 15px rgba(13, 110, 253, 0.1);
                }
                .timeline-item:last-child h6 {
                    color: #0d6efd;
                }
            `}</style>
        </Container>
    );
};

export default OrderTracking;
