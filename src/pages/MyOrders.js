import React, { useState, useEffect, useRef } from 'react';
import { Container, Table, Button, Badge, Card, Modal, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DellaLogo = () => (
    <svg width="130" height="40" viewBox="0 0 130 40" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="32" fontFamily="Georgia, serif" fontSize="30" fontWeight="bold" fill="#ffffff" letterSpacing="5">DELLA</text>
    </svg>
);

const MyOrders = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const receiptRef = useRef();

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchMyOrders = async () => {
            try {
                const q = query(
                    collection(db, 'orders'),
                    where('userId', '==', currentUser.uid)
                );
                const querySnapshot = await getDocs(q);
                const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort locally to avoid composite index requirement
                fetchedOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setOrders(fetchedOrders);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, [currentUser, navigate]);

    const downloadOrderReceipt = async (order) => {
        setSelectedOrder(order);
        // Give react a tick to render
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(receiptRef.current, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`DELLA-Order-${order.id.substring(0, 8)}.pdf`);
            } catch (err) {
                console.error("PDF generation failed:", err);
                alert("Failed to generate PDF. Please try again.");
            }
        }, 500);
    };

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="fw-bold mb-4">My Orders</h2>

            {orders.length === 0 ? (
                <Card className="text-center p-5 border-0 shadow-sm rounded-4">
                    <div className="mb-4">
                        <i className="fas fa-box-open fa-4x text-muted opacity-25"></i>
                    </div>
                    <h4>No orders yet</h4>
                    <p className="text-muted">Looks like you haven't placed any orders yet.</p>
                    <Button variant="primary" onClick={() => navigate('/')} className="rounded-pill px-4">Start Shopping</Button>
                </Card>
            ) : (
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <Table hover responsive className="align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="small text-muted text-uppercase">
                                <th className="ps-4">Order ID</th>
                                <th>Items</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th className="pe-4 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="ps-4 fw-bold text-primary">#{order.id.substring(0, 8)}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-1">
                                            {order.items && order.items.slice(0, 3).map((item, idx) => (
                                                <img
                                                    key={idx}
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="rounded border shadow-sm"
                                                    style={{ width: 32, height: 32, objectFit: 'cover' }}
                                                />
                                            ))}
                                            {order.items && order.items.length > 3 && (
                                                <Badge bg="light" text="dark" className="border small">
                                                    +{order.items.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                                    <td><strong>৳</strong>{order.total}</td>
                                    <td>
                                        <Badge bg={
                                            order.status === 'delivered' ? 'success' :
                                                order.status === 'shipped' ? 'info' :
                                                    order.status === 'preparing' ? 'primary' :
                                                        order.status === 'cancelled' ? 'danger' :
                                                            'warning'
                                        } className="text-capitalize">
                                            {order.status === 'preparing' ? 'Preparing' :
                                                order.status === 'shipped' ? 'Shipped' : order.status}
                                        </Badge>
                                        <div className="small mt-1 text-muted">
                                            {order.status === 'preparing' && "Your product is being prepared"}
                                            {order.status === 'shipped' && "Your product will appear soon"}
                                            {order.status === 'delivered' && "Product Delivered"}
                                            {order.status === 'pending' && "Order Received"}
                                        </div>
                                    </td>
                                    <td>{order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</td>
                                    <td className="pe-4 text-end">
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="rounded-circle me-1"
                                            onClick={() => navigate(`/track-order/${order.id}`)}
                                            title="Track Order Progress"
                                        >
                                            <i className="fas fa-truck-fast text-primary"></i>
                                        </Button>
                                        <Button variant="light" size="sm" className="rounded-circle me-1" onClick={() => openOrderDetails(order)}>
                                            <i className="fas fa-eye text-secondary"></i>
                                        </Button>
                                        <Button variant="light" size="sm" className="rounded-circle" onClick={() => downloadOrderReceipt(order)}>
                                            <i className="fas fa-file-pdf text-danger"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card>
            )}

            {/* Order Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered rounded="4">
                {selectedOrder && (
                    <>
                        <Modal.Header closeButton className="border-0 pb-0">
                            <Modal.Title className="fw-bold">Order Details #{selectedOrder.id.substring(0, 8)}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4">
                            <Row className="mb-4">
                                <Col md={6}>
                                    <h6 className="text-muted small fw-bold text-uppercase mb-2">Delivery Address</h6>
                                    <p className="mb-1 fw-bold">{selectedOrder.fullName}</p>
                                    <p className="mb-1">{selectedOrder.phone}</p>
                                    <p className="mb-0 text-muted">{selectedOrder.address}</p>
                                </Col>
                                <Col md={6} className="text-md-end mt-3 mt-md-0">
                                    <h6 className="text-muted small fw-bold text-uppercase mb-2">Order Summary</h6>
                                    <p className="mb-1">Status:
                                        <Badge bg={
                                            selectedOrder.status === 'delivered' ? 'success' :
                                                selectedOrder.status === 'shipped' ? 'info' :
                                                    selectedOrder.status === 'preparing' ? 'primary' :
                                                        'warning'
                                        } className="text-capitalize ms-2">
                                            {selectedOrder.status}
                                        </Badge>
                                    </p>
                                    <div className="alert alert-light border p-2 small mt-2">
                                        <i className="fas fa-info-circle me-2 text-primary"></i>
                                        {selectedOrder.status === 'preparing' && "Your product is being prepared"}
                                        {selectedOrder.status === 'shipped' && "Your product will appear soon"}
                                        {selectedOrder.status === 'delivered' && "Your product has been delivered. Enjoy!"}
                                        {selectedOrder.status === 'pending' && "We have received your order and are reviewing it."}
                                    </div>
                                    <p className="mb-0 text-muted mt-2">Placed on: {selectedOrder.createdAt?.toDate().toLocaleDateString()}</p>
                                </Col>
                            </Row>

                            <div className="table-responsive">
                                <Table className="align-middle">
                                    <thead className="bg-light">
                                        <tr className="small text-muted text-uppercase">
                                            <th>Product</th>
                                            <th>Size</th>
                                            <th>Price</th>
                                            <th>Qty</th>
                                            <th className="text-end">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <img src={item.imageUrl} alt="" className="rounded me-2" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                                                        <span className="fw-medium">{item.name}</span>
                                                    </div>
                                                </td>
                                                <td>{item.size || '-'}</td>
                                                <td>৳{item.price}</td>
                                                <td>{item.qty}</td>
                                                <td className="text-end fw-bold">৳{item.price * item.qty}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            <div className="d-flex justify-content-end mt-4">
                                <div style={{ width: '250px' }}>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Subtotal</span>
                                        <span>৳{selectedOrder.subtotal}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Delivery Fee</span>
                                        <span>৳{selectedOrder.deliveryFee}</span>
                                    </div>
                                    <div className="d-flex justify-content-between pt-2 border-top">
                                        <span className="fw-bold">Total</span>
                                        <span className="fw-bold text-primary fs-5">৳{selectedOrder.total}</span>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="border-0 pt-0">
                            <Button variant="outline-danger" onClick={() => downloadOrderReceipt(selectedOrder)} className="rounded-pill px-4">
                                <i className="fas fa-file-pdf me-2"></i>Download Receipt
                            </Button>
                            <Button variant="secondary" onClick={() => setShowModal(false)} className="rounded-pill px-4">
                                Close
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Hidden container for PDF rendering - Styled like OrderConfirmation receipt */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div
                    ref={receiptRef}
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '20mm',
                        background: '#ffffff',
                        color: '#333'
                    }}
                >
                    {selectedOrder && (
                        <div style={{ fontFamily: 'Arial, sans-serif' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: '#1a1a1a', padding: '30px', borderRadius: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <DellaLogo />
                                </div>
                                <div style={{ textAlign: 'right', color: '#ffffff' }}>
                                    <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>INVOICE</h1>
                                    <p style={{ margin: 0, opacity: 0.8 }}>#{selectedOrder.id.substring(0, 8)}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                <div>
                                    <h4 style={{ color: '#1a1a1a', fontWeight: 'bold', marginBottom: '15px' }}>Billed To:</h4>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>{selectedOrder.fullName}</p>
                                    <p style={{ margin: '0 0 5px 0', color: '#666' }}>{selectedOrder.phone}</p>
                                    <p style={{ margin: '0', color: '#666', maxWidth: '250px' }}>{selectedOrder.address}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h4 style={{ color: '#1a1a1a', fontWeight: 'bold', marginBottom: '15px' }}>Order Details:</h4>
                                    <p style={{ margin: '0 0 5px 0' }}><strong>Date:</strong> {selectedOrder.createdAt?.toDate().toLocaleDateString()}</p>
                                    <p style={{ margin: '0 0 5px 0' }}><strong>Payment:</strong> {selectedOrder.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}</p>
                                    <p style={{ margin: '0' }}><strong>Status:</strong> {selectedOrder.status.toUpperCase()}</p>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
                                        <th style={{ textAlign: 'left', padding: '15px 10px', color: '#1a1a1a' }}>Item Description</th>
                                        <th style={{ textAlign: 'center', padding: '15px 10px', color: '#1a1a1a' }}>Size</th>
                                        <th style={{ textAlign: 'center', padding: '15px 10px', color: '#1a1a1a' }}>Qty</th>
                                        <th style={{ textAlign: 'right', padding: '15px 10px', color: '#1a1a1a' }}>Price</th>
                                        <th style={{ textAlign: 'right', padding: '15px 10px', color: '#1a1a1a' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items.map((item, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '20px 10px' }}>
                                                <div style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{item.name}</div>
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '20px 10px' }}>{item.size || '-'}</td>
                                            <td style={{ textAlign: 'center', padding: '20px 10px' }}>{item.qty}</td>
                                            <td style={{ textAlign: 'right', padding: '20px 10px' }}>৳{item.price}</td>
                                            <td style={{ textAlign: 'right', padding: '20px 10px', fontWeight: 'bold' }}>৳{item.price * item.qty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ width: '300px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                        <span style={{ color: '#666' }}>Subtotal:</span>
                                        <span style={{ fontWeight: 'bold' }}>৳{selectedOrder.subtotal}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                                        <span style={{ color: '#666' }}>Delivery Fee:</span>
                                        <span style={{ fontWeight: 'bold' }}>৳{selectedOrder.deliveryFee}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderTop: '2px solid #1a1a1a', marginTop: '10px' }}>
                                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a' }}>Total Amount:</span>
                                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b35' }}>৳{selectedOrder.total}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '30px', textAlign: 'center' }}>
                                <h4 style={{ color: '#1a1a1a', fontWeight: 'bold', marginBottom: '10px' }}>Thank you for shopping with DELLA!</h4>
                                <p style={{ color: '#666', margin: 0 }}>This is a computer generated invoice and does not require a signature.</p>
                                <p style={{ color: '#666', marginTop: '10px', fontStyle: 'italic' }}>Premium Footwear for your Everyday Style</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default MyOrders;
