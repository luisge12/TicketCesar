import React, { useState, useEffect } from 'react';
import { getBcvRate } from '../services/bcvService';

export default function PagoMovilForm({ totalPrice, onSuccess, onCancel }) {
    const [referencia, setReferencia] = useState('');
    const [bcvRate, setBcvRate] = useState(null);
    const [isLoadingRate, setIsLoadingRate] = useState(true);

    useEffect(() => {
        const fetchRate = async () => {
            const rate = await getBcvRate();
            setBcvRate(rate);
            setIsLoadingRate(false);
        };
        fetchRate();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (referencia.trim().length < 4) {
            alert('Por favor ingrese un número de referencia válido.');
            return;
        }
        onSuccess(`pago_movil - Ref: ${referencia.trim()}`, referencia.trim());
    };

    const montoBs = bcvRate ? (totalPrice * bcvRate).toFixed(2) : null;

    return (
        <form className="payment-form" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#333' }}>
                <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Datos para el Pago Móvil:</h4>
                <p style={{ margin: '5px 0' }}><strong>Banco:</strong> Banco de Venezuela (0102)</p>
                <p style={{ margin: '5px 0' }}><strong>Teléfono:</strong> 0414-9182889</p>
                <p style={{ margin: '5px 0' }}><strong>Cédula:</strong> V-27306029</p>
                <hr style={{ margin: '10px 0' }} />
                <p style={{ margin: '5px 0', fontSize: '1.1rem' }}>
                    <strong>Monto a pagar: </strong> 
                    {isLoadingRate ? (
                        <span>Calculando tasa BCV...</span>
                    ) : bcvRate ? (
                        <span>{montoBs} Bs. <small>(Tasa BCV: {bcvRate} Bs/$)</small></span>
                    ) : (
                        <span>Error al obtener tasa. Por favor calcule al BCV actual.</span>
                    )}
                </p>
            </div>

            <div className="form-group">
                <label htmlFor="referencia">NÚMERO DE REFERENCIA</label>
                <input
                    type="text"
                    id="referencia"
                    name="referencia"
                    required
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Ej. 12345678"
                />
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                    Introduce los últimos dígitos del comprobante o el número de referencia completo.
                </small>
            </div>

            <div className="payment-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-cancel" onClick={onCancel} style={{ flex: 1, marginRight: '10px' }}>
                    Volver
                </button>
                <button type="submit" className="btn-pay" style={{ flex: 2 }}>
                    Confirmar Pago Móvil
                </button>
            </div>
        </form>
    );
}
