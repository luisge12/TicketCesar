import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config.js';
import { useCart } from '../context/CartContext.jsx';
import CartSidebar from '../components/CartSidebar.jsx';
import './../styles/shop.css';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, totalItems, isCartOpen, setIsCartOpen } = useCart();
    
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${API_URL}/products/${id}`);
                if (!res.ok) {
                    setProduct(null);
                    return;
                }
                const data = await res.json();
                setProduct(data);
            } catch {
                setProduct(null);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity);
        alert(`${quantity} ${product.nombre} añadido al carrito`);
    };

    if (!product) return (
        <div className="product-detail-page">
            <nav className="blog-nav" style={{ background: 'none', color: 'var(--black)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="blog-nav-btn" onClick={() => navigate('/shop')}>← Volver al Kiosko</button>
            </nav>
            <div style={{ padding: '2rem', textAlign: 'center' }}>Producto no encontrado.</div>
        </div>
    );

    const inStock = product.cantidad > 0;

    return (
        <main className="product-detail-page kiosko-page">
            <nav className="blog-nav" style={{ background: 'none', color: 'var(--black)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="blog-nav-btn" onClick={() => navigate('/shop')}>← Volver al Kiosko</button>
                <button className="cart-button-shop" onClick={() => setIsCartOpen(true)}>
                    <svg className="cart-img-svg" viewBox="0 0 24 24">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
                    </svg>
                    {totalItems > 0 && <span className="cart-count-shop">{totalItems}</span>}
                </button>
            </nav>

            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            <div className="product-detail-container">
                <div className="product-detail-media">
                    <div className="main-image-viewport">
                        {product.imagenes && product.imagenes.length > 0 ? (
                            <img src={product.imagenes[activeImage]} alt={product.nombre} className="detail-main-img" />
                        ) : (
                            <div className="no-image-placeholder">Sin imagen disponible</div>
                        )}
                    </div>
                    {product.imagenes && product.imagenes.length > 1 && (
                        <div className="thumbnail-strip">
                            {product.imagenes.map((img, idx) => (
                                <img 
                                    key={idx} 
                                    src={img} 
                                    alt={`thumb-${idx}`} 
                                    className={`thumb-img ${idx === activeImage ? 'active' : ''}`}
                                    onClick={() => setActiveImage(idx)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-detail-info">
                    <h1 className="detail-title">{product.nombre}</h1>
                    <p className="detail-price">${Number(product.precio).toFixed(2)}</p>
                    
                    <div className={`stock-status ${inStock ? 'in-stock' : 'out-stock'}`}>
                        {inStock ? `Disponible: ${product.cantidad} unidades` : 'Agotado'}
                    </div>

                    <div className="detail-description">
                        <h3>Descripción</h3>
                        <p>{product.descripcion || 'Sin descripción disponible.'}</p>
                    </div>

                    {inStock && (
                        <div className="add-to-cart-section">
                            <div className="quantity-selector">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                <input 
                                    type="number" 
                                    value={quantity} 
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (e.target.value === '') {
                                            setQuantity('');
                                        } else if (!isNaN(val)) {
                                            setQuantity(Math.max(1, Math.min(product.cantidad, val)));
                                        }
                                    }}
                                    onBlur={() => {
                                        if (quantity === '' || quantity < 1) setQuantity(1);
                                    }}
                                    min="1"
                                    max={product.cantidad}
                                    step="1"
                                />
                                <button onClick={() => setQuantity(q => Math.min(product.cantidad, q + 1))}>+</button>
                            </div>
                            <button className="primary-buy-btn" onClick={handleAddToCart}>
                                Añadir al Carrito
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
