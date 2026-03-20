import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import './../styles/shop.css';

export default function CartSidebar({ isOpen, onClose }) {
    const { cart, removeFromCart, updateQuantity, totalPrice, clearCart, isPaymentModalOpen, setIsPaymentModalOpen } = useCart();

    const handleCheckoutSuccess = () => {
        alert('¡Pago procesado con éxito! Gracias por tu compra.');
        clearCart();
        setIsPaymentModalOpen(false);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="cart-overlay" onClick={onClose}>
                <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
                    <div className="cart-header">
                        <h2>Tu Carrito</h2>
                        <button className="close-cart" onClick={onClose}>✕</button>
                    </div>

                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <p className="empty-cart-msg">El carrito está vacío.</p>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <img src={item.imagenes && item.imagenes[0]} alt={item.nombre} className="cart-item-img" />
                                    <div className="cart-item-info">
                                        <h4>{item.nombre}</h4>
                                        <p className="cart-item-price">${Number(item.precio).toFixed(2)}</p>
                                        <div className="cart-item-actions">
                                            <div className="cart-qty-selector">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                <input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        if (e.target.value === '') {
                                                            updateQuantity(item.id, ''); 
                                                        } else if (!isNaN(val)) {
                                                            updateQuantity(item.id, Math.max(1, Math.min(item.cantidad || 999, val)));
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (item.quantity === '' || item.quantity < 1) {
                                                            updateQuantity(item.id, 1);
                                                        }
                                                    }}
                                                    min="1"
                                                    step="1"
                                                />
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                            <button className="remove-item" onClick={() => removeFromCart(item.id)}>Eliminar</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total:</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <button className="checkout-btn" onClick={() => {
                                setIsPaymentModalOpen(true);
                                onClose();
                            }}>
                                Finalizar Compra
                            </button>
                            <button className="clear-cart-btn" onClick={clearCart}>Vaciar Carrito</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
