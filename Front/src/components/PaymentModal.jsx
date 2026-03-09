import React, { useState } from 'react';
import Modal from 'react-modal';
import { API_URL } from '../config.js';
import '../styles/payment-modal.css';

// Modal.setAppElement('#root') is already called in Header.jsx, 
// but we can ensure it here if needed, or assume it's set.

export default function PaymentModal({ isOpen, onRequestClose, event, selectedSeats, onReservationSuccess }) {
    const [formData, setFormData] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const totalPrice = selectedSeats.length * (event.ticket_price || 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const response = await fetch(`${API_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    eventId: event.id,
                    seatId: selectedSeats,
                    paymentMethod: 'credit_card',
                    totalPrice: totalPrice
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error al procesar la reserva');
            }

            setIsProcessing(false);
            onReservationSuccess();
            onRequestClose();
        } catch (err) {
            console.error('Error in reservation process:', err);
            setError(err.message || 'Ocurrió un error al procesar la reserva. Intente nuevamente.');
            setIsProcessing(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Procesar Pago"
            className="payment-modal"
            overlayClassName="payment-modal-overlay"
            ariaHideApp={false}
        >
            <h2>Detalles de la Reserva</h2>

            {isProcessing && (
                <div className="processing-overlay">
                    <div className="spinner"></div>
                    <p>Procesando pago y reserva...</p>
                </div>
            )}

            <div className="reservation-details">
                <p><strong>Evento:</strong> {event.name}</p>
                <p><strong>Asientos:</strong> {selectedSeats.join(', ')}</p>
                <p><strong>Total a pagar:</strong> ${totalPrice.toLocaleString()}</p>
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
                        Pagar y Reservar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
