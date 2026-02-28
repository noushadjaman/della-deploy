import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Chatbot.css';
import ProductCard from './ProductCard';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hi! I'm Della, your shopping assistant. How can I help you today? ✨" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const messagesEndRef = useRef(null);

    // Fetch store context (Categories & Products)
    useEffect(() => {
        const fetchContext = async () => {
            try {
                const catSnapshot = await getDocs(collection(db, 'categories'));
                setCategories(catSnapshot.docs.map(doc => doc.data().name));

                const prodSnapshot = await getDocs(collection(db, 'products'));
                setProducts(prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Error fetching context:", err);
            }
        };
        fetchContext();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', text: input };
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        setInput('');
        setLoading(true);

        try {
            const messageHistory = currentMessages.slice(1).map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.text
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: messageHistory,
                    products
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Chat API Error:", data);
                throw new Error(data.error || "AI services are busy.");
            }

            setMessages(prev => [...prev, {
                role: 'ai',
                text: data.reply,
                products: Array.isArray(data.products) ? data.products : []
            }]);

        } catch (error) {
            console.error("Della Error:", error);
            setMessages(prev => [...prev, {
                role: 'ai',
                text: `Sorry! My circuits are a bit busy. 😅 (Error: ${error.message}). Please try again in a few seconds.`
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="della-chatbot-container">
            {isOpen && (
                <div className="della-chat-window">
                    <div className="della-chat-header shadow-sm">
                        <div className="d-flex align-items-center gap-2">
                            <div className="bg-white rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                <img src="/assets/images/della_mascot.png" alt="Della" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                                <h6 className="m-0 fw-bold text-white">Della</h6>
                                <small className="text-white-50">Online Assistant</small>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="btn-close btn-close-white"></button>
                    </div>

                    <div className="della-chat-messages p-3">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}>
                                <div className={`message-bubble ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light text-dark shadow-sm'}`}>
                                    {msg.text}
                                    {msg.role === 'ai' && Array.isArray(msg.products) && msg.products.length > 0 && (
                                        <div className="della-product-cards mt-2">
                                            {msg.products.slice(0, 6).map((p) => (
                                                <div key={p.id || p.name} className="della-product-card">
                                                    <ProductCard product={p} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message-wrapper ai">
                                <div className="message-bubble bg-light text-muted shadow-sm">
                                    <span className="spinner-grow spinner-grow-sm me-2"></span>
                                    Della is thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="della-chat-footer p-2 border-top bg-white">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control border-0 bg-light rounded-pill px-3"
                                placeholder="Ask anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary rounded-circle ms-2 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`della-toggle-btn shadow-lg ${isOpen ? 'active' : ''}`}
            >
                <img src="/assets/images/della_mascot.png" alt="Della" className="mascot-img" />
                {!isOpen && <div className="notification-dot"></div>}
            </button>
        </div>
    );
};

export default Chatbot;
