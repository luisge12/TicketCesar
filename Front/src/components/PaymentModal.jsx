import React, { useState } from 'react';
import Modal from 'react-modal';
import { API_URL } from '../config.js';
import '../styles/payment-modal.css';

/**
 * PaymentModal – componente unificado para pagos.
 *
 * Modos disponibles (prop `mode`):
 *   - "ticket"  → confirma reserva de asientos en un evento (hace llamada real al backend).
 *   - "cart"    → finaliza compra del Kiosko (simulación).
 *
 * Props comunes:
 *   isOpen, onRequestClose, onSuccess
 *
 * Props para modo "ticket":
 *   event, selectedSeats
 *
 * Props para modo "cart":
 *   cart, totalPrice
 */
export default function PaymentModal({
    isOpen,
    onRequestClose,
    onSuccess,
    // Ticket mode
    mode = 'ticket',
    event,
    selectedSeats,
    // Cart mode
    cart,
    totalPrice: cartTotalPrice,
}) {
    const [formData, setFormData] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Precio total según el modo
    const totalPrice = mode === 'ticket'
        ? (selectedSeats?.length ?? 0) * (event?.ticket_price ?? 0)
        : (cartTotalPrice ?? 0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);

        // Simular delay de procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (mode === 'ticket') {
            // Hacer llamada real al backend para crear la reserva
            try {
                const response = await fetch(`${API_URL}/reservations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                onSuccess?.();
                onRequestClose();
            } catch (err) {
                console.error('Error en el proceso de reserva:', err);
                setError(err.message || 'Ocurrió un error al procesar la reserva. Intente nuevamente.');
                setIsProcessing(false);
            }
        } else {
            // Modo "cart": llamada real al backend para descontar stock
            try {
                const items = cart.map(item => ({ id: item.id, quantity: item.quantity }));

                const response = await fetch(`${API_URL}/products/purchase`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ items })
                });

                if (!response.ok) {
                    // Parsear el error de forma segura (puede ser JSON o HTML)
                    let errorMessage = 'Error al procesar la compra';
                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        const errData = await response.json();
                        errorMessage = errData.error || errorMessage;
                    } else {
                        errorMessage = `Error ${response.status}: ${response.statusText || 'Ruta no encontrada'}`;
                    }
                    throw new Error(errorMessage);
                }

                setIsProcessing(false);
                onSuccess?.();
                onRequestClose();
            } catch (err) {
                setError(err.message || 'Ocurrió un error al procesar la compra. Intente nuevamente.');
                setIsProcessing(false);
            }
        }
    };

    const isTicketMode = mode === 'ticket';

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel={isTicketMode ? 'Procesar Pago' : 'Finalizar Compra'}
            className="payment-modal"
            overlayClassName="payment-modal-overlay"
            ariaHideApp={false}
        >
            <h2>{isTicketMode ? 'Detalles de la Reserva' : 'Finalizar Compra - Pago Simulado'}</h2>

            {isProcessing && (
                <div className="processing-overlay">
                    <div className="spinner"></div>
                    <p>{isTicketMode ? 'Procesando pago y reserva...' : 'Procesando pago...'}</p>
                </div>
            )}

            {/* Resumen de la compra */}
            <div className="reservation-details">
                {isTicketMode ? (
                    <>
                        <p><strong>Evento:</strong> {event?.name}</p>
                        <p><strong>Asientos:</strong> {selectedSeats?.join(', ')}</p>
                        <p><strong>Total a pagar:</strong> ${totalPrice.toLocaleString()}</p>
                    </>
                ) : (
                    <>
                        <p><strong>Artículos:</strong> {cart?.length} productos distintos</p>
                        <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                            {cart?.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{item.nombre} x{item.quantity}</span>
                                    <span>${(Number(item.precio) * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <p><strong>Total a pagar:</strong> ${totalPrice.toFixed(2)}</p>
                    </>
                )}
            </div>

            {/* Formulario de tarjeta (idéntico para ambos modos) */}
            <form className="payment-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="cardName">NOMBRE EN LA TARJETA</label>
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
                    <label htmlFor="cardNumber">NÚMERO DE TARJETA</label>
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
                        <label htmlFor="expiry">VENCIMIENTO</label>
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
                        {isTicketMode ? 'Pagar y Reservar' : 'Pagar y Finalizar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
