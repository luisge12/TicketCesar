import React, { useState, useEffect } from 'react';
import { API_URL } from '../config.js';
import '../styles/shop.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import CartSidebar from '../components/CartSidebar.jsx';

export default function Shop() {
    const navigate = useNavigate();
    const { totalItems, isCartOpen, setIsCartOpen, purchaseCount } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_URL}/products`);
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [purchaseCount]);

    // Helper hook or function could go here to cycle images, but for now we'll show a simple horizontal scroll if there are multiple, or just the main one.

    return (
        <main className="kiosko-page">
            <nav className="blog-nav" style={{ background: 'none', color: 'var(--black)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <button className="blog-nav-btn" onClick={() => navigate('/')}>Menú Inicial</button>
                    <button className="blog-nav-btn active">Kiosko César</button>
                </div>
                <button className="cart-button-shop" onClick={() => setIsCartOpen(true)}>
                    <svg className="cart-img-svg" viewBox="0 0 24 24">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
                    </svg>
                    {totalItems > 0 && <span className="cart-count-shop">{totalItems}</span>}
                </button>
            </nav>

            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            <header className="kiosko-header">
                <h1>Kiosko César</h1>
                <p>Descubre nuestros productos exclusivos y mercancía oficial del teatro.</p>
            </header>

            <section className="kiosko-gallery">
                {loading ? (
                    <div className="loading-spinner">Cargando productos del catálogo...</div>
                ) : products.length === 0 ? (
                    <p className="no-products">Actualmente no hay productos disponibles en el Kiosko. ¡Vuelve pronto!</p>
                ) : (
                    <div className="kiosko-grid">
                        {products.map(product => (
                            <article key={product.id} className="kiosko-card" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                                <div className="kiosko-image-container">
                                    {product.imagenes && product.imagenes.length > 0 ? (
                                        // We will map exactly the first image as cover, but optionally show dots if multiple
                                        <div className="kiosko-carousel">
                                            <img src={product.imagenes[0]} alt={product.nombre} className="kiosko-img"/>
                                            {product.imagenes.length > 1 && (
                                                <div className="kiosko-image-badge">+{product.imagenes.length - 1}</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="kiosko-no-image">Sin Imagen</div>
                                    )}
                                </div>
                                <div className="kiosko-details">
                                    <h2 className="kiosko-title">{product.nombre}</h2>
                                    <p className="kiosko-desc">{product.descripcion}</p>
                                    <div className="kiosko-meta">
                                        <span className="kiosko-price">${Number(product.precio).toFixed(2)}</span>
                                        <span className={`kiosko-stock ${product.cantidad > 0 ? 'in-stock' : 'out-stock'}`}>
                                            {product.cantidad > 0 ? `Stock: ${product.cantidad}` : 'Agotado'}
                                        </span>
                                    </div>
                                    {/* Action button mimicking a store interact */}
                                    <button className={`kiosko-buy-btn ${product.cantidad === 0 ? 'disabled' : ''}`} disabled={product.cantidad === 0}>
                                        {product.cantidad > 0 ? 'Lo Quiero' : 'Sin disponibilidad'}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
