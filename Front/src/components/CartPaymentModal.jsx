import React, { useState } from 'react';
import Modal from 'react-modal';
import '../styles/payment-modal.css';

export default function CartPaymentModal({ isOpen, onRequestClose, cart, totalPrice, onCheckoutSuccess }) {
    const [formData, setFormData] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);

        // Simulate payment processing delay (same as ticket purchase)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Since we are mocking the checkout simulation:
        setIsProcessing(false);
        onCheckoutSuccess();
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Finalizar Compra"
            className="payment-modal"
            overlayClassName="payment-modal-overlay"
            ariaHideApp={false}
        >
            <h2>Finalizar Compra - Pago Simulado</h2>

            {isProcessing && (
                <div className="processing-overlay">
                    <div className="spinner"></div>
                    <p>Procesando pago...</p>
                </div>
            )}

            <div className="reservation-details">
                <p><strong>Artículos:</strong> {cart.length} productos distintos</p>
                <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                    {cart.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.nombre} x{item.quantity}</span>
                            <span>${(Number(item.precio) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <p><strong>Total a pagar:</strong> ${totalPrice.toFixed(2)}</p>
            </div>

            <form className="payment-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="cardName">Nombre en la tarjeta</label>
                    <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        required
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="Juan Pérez"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cardNumber">Número de tarjeta</label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        required
                        pattern="\d{16}"
                        maxLength="16"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="0000 0000 0000 0000"
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="expiry">Vencimiento</label>
                        <input
                            type="text"
                            id="expiry"
                            name="expiry"
                            required
                            placeholder="MM/YY"
                            maxLength="5"
                            value={formData.expiry}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            required
                            pattern="\d{3,4}"
                            maxLength="4"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                        />
                    </div>
                </div>

                {error && <p style={{ color: 'red', fontSize: '0.9rem', margin: '0.5rem 0' }}>{error}</p>}

                <div className="payment-actions">
                    <button type="button" className="btn-cancel" onClick={onRequestClose}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-pay" disabled={isProcessing}>
                        Pagar y Finalizar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
