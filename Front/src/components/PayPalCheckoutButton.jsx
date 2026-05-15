import React, { useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { API_URL } from '../config.js';

export default function PayPalCheckoutButton({ 
    totalPrice, 
    mode, 
    eventId, 
    selectedSeats, 
    cart, 
    onSuccess, 
    onError 
}) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCreateOrder = async () => {
        try {
            // Se envía totalPrice al backend para crear la orden
            const response = await fetch(`${API_URL}/paypal/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ totalPrice })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'No se pudo crear la orden en PayPal');
            }

            const data = await response.json();
            return data.id; // Retorna el orderID que necesita PayPal
        } catch (error) {
            console.error('Error creando orden:', error);
            if (onError) onError(error.message);
            throw error;
        }
    };

    const handleApprove = async (data, actions) => {
        setIsProcessing(true);
        try {
            // Construir payload según el modo
            const payload = {
                orderID: data.orderID,
                mode,
                totalPrice
            };

            if (mode === 'ticket') {
                payload.eventId = eventId;
                payload.selectedSeats = selectedSeats;
            } else if (mode === 'cart') {
                payload.items = cart?.map(item => ({ id: item.id, quantity: item.quantity }));
            }

            const response = await fetch(`${API_URL}/paypal/capture-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error al procesar el pago o registrar la compra');
            }

            const result = await response.json();
            setIsProcessing(false);
            if (onSuccess) onSuccess(result);

        } catch (error) {
            console.error('Error capturando orden:', error);
            setIsProcessing(false);
            if (onError) onError(error.message || 'Ocurrió un error finalizando el pago. Contáctenos si el dinero fue debitado.');
        }
    };

    return (
        <div style={{ marginTop: '20px', minHeight: '150px', position: 'relative' }}>
            {isProcessing && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 10,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '10px' }}>Validando el pago...</p>
                </div>
            )}
            <PayPalButtons
                style={{ layout: 'vertical', color: 'gold', shape: 'rect' }}
                createOrder={handleCreateOrder}
                onApprove={handleApprove}
                onError={(err) => {
                    console.error('PayPal Button Error:', err);
                    if (onError) onError('Se cerró o falló la ventana de PayPal.');
                }}
            />
        </div>
    );
}
