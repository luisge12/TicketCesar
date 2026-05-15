import React, { useState } from 'react';
import Modal from 'react-modal';
import PayPalCheckoutButton from './PayPalCheckoutButton.jsx';
import PagoMovilForm from './PagoMovilForm.jsx';
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
    const [error, setError] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null); // 'paypal' o 'pago_movil'
    const [isProcessing, setIsProcessing] = useState(false);

    // Precio total según el modo
    const totalPrice = mode === 'ticket'
        ? (selectedSeats?.length ?? 0) * (event?.ticket_price ?? 0)
        : (cartTotalPrice ?? 0);

    const isTicketMode = mode === 'ticket';

    const handlePayPalSuccess = () => {
        onSuccess?.();
        onRequestClose();
    };

    const handlePayPalError = (errMsg) => {
        setError(errMsg);
    };

    const handlePagoMovilSubmit = async (payMethod, reference) => {
        setIsProcessing(true);
        setError(null);
        try {
            if (mode === 'ticket') {
                const response = await fetch(`${API_URL}/reservations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        eventId: event.id,
                        seatId: selectedSeats,
                        paymentMethod: payMethod,
                        totalPrice: totalPrice,
                        paymentReference: reference,
                        seatState: 'pending_verification'
                    })
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Error al procesar la reserva manual');
                }
            } else if (mode === 'cart') {
                // Nuevo endpoint para crear ordenes de tienda
                const items = cart.map(item => ({ id: item.id, quantity: item.quantity }));
                const response = await fetch(`${API_URL}/products/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        items,
                        paymentMethod: payMethod,
                        paymentReference: reference,
                        totalPrice: totalPrice
                    })
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Error al crear la orden de la tienda');
                }
            }
            
            setIsProcessing(false);
            alert('Pago reportado exitosamente. Queda en espera de verificación.');
            onSuccess?.();
            onRequestClose();
        } catch (err) {
            console.error('Error procesando pago manual:', err);
            setError(err.message || 'Error de conexión');
            setIsProcessing(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel={isTicketMode ? 'Procesar Pago' : 'Finalizar Compra'}
            className="payment-modal"
            overlayClassName="payment-modal-overlay"
            ariaHideApp={false}
        >
            <h2>{isTicketMode ? 'Detalles de la Reserva' : 'Finalizar Compra'}</h2>

            {isProcessing && (
                <div className="processing-overlay">
                    <div className="spinner"></div>
                    <p>Enviando información...</p>
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

            {error && <p style={{ color: 'red', fontSize: '0.9rem', margin: '0.5rem 0', textAlign: 'center' }}>{error}</p>}

            {!selectedMethod ? (
                <div className="payment-options-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    <p style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold' }}>Selecciona tu método de pago:</p>
                    
                    <button 
                        onClick={() => setSelectedMethod('paypal')}
                        style={{ padding: '15px', backgroundColor: '#ffc439', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                    >
                        💳 Pagar Automáticamente (PayPal / Tarjeta)
                    </button>
                    
                    <button 
                        onClick={() => setSelectedMethod('pago_movil')}
                        style={{ padding: '15px', backgroundColor: '#00a4e4', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                    >
                        📱 Pago Móvil (Verificación Manual)
                    </button>
                    
                    <div className="payment-actions" style={{ marginTop: '20px' }}>
                        <button type="button" className="btn-cancel" onClick={onRequestClose} style={{ width: '100%' }}>
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : selectedMethod === 'paypal' ? (
                <div className="payment-options-container">
                    <PayPalCheckoutButton 
                        totalPrice={totalPrice}
                        mode={mode}
                        eventId={event?.id}
                        selectedSeats={selectedSeats}
                        cart={cart}
                        onSuccess={handlePayPalSuccess}
                        onError={handlePayPalError}
                    />
                    <div className="payment-actions" style={{ marginTop: '20px' }}>
                        <button type="button" className="btn-cancel" onClick={() => setSelectedMethod(null)} style={{ width: '100%' }}>
                            Volver a métodos de pago
                        </button>
                    </div>
                </div>
            ) : (
                <PagoMovilForm 
                    totalPrice={totalPrice} 
                    onSuccess={handlePagoMovilSubmit} 
                    onCancel={() => setSelectedMethod(null)} 
                />
            )}
        </Modal>
    );
}
