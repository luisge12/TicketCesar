import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import '../styles/admin-reports.css'; // Podemos reusar estilos de reportes o tablas

export default function AdminPagos() {
    const [pendingData, setPendingData] = useState({ reservations: [], orders: [] });
    const [isLoading, setIsLoading] = useState(true);

    const fetchPendingPayments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/payments/pending`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Error al obtener pagos');
            const data = await res.json();
            setPendingData(data);
        } catch (error) {
            console.error(error);
            alert('Error al cargar pagos pendientes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const handleAction = async (type, id, action) => {
        const confirmMsg = action === 'approve' 
            ? '¿Estás seguro de APROBAR este pago?' 
            : '¿Estás seguro de RECHAZAR este pago y devolver el stock/asiento?';
            
        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await fetch(`${API_URL}/admin/payments/${type}/${id}/${action}`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Error en la operación');
            
            alert(`Pago ${action === 'approve' ? 'aprobado' : 'rechazado'} con éxito.`);
            fetchPendingPayments(); // Recargar datos
        } catch (error) {
            console.error(error);
            alert('Ocurrió un error al procesar el pago.');
        }
    };

    if (isLoading) {
        return <div className="loading-overlay"><div className="spinner"></div></div>;
    }

    const { reservations, orders } = pendingData;
    const hasPending = reservations.length > 0 || orders.length > 0;

    return (
        <div className="admin-reports-container" style={{ padding: '2rem', minHeight: '80vh' }}>
            <h1 className="reports-title">Verificación de Pagos Móviles (Pendientes)</h1>
            <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
                Aquí se muestran las reservas de tickets y órdenes de la tienda que fueron reportadas por Pago Móvil y están esperando confirmación manual.
            </p>

            {!hasPending ? (
                <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '1.2rem', color: '#666' }}>
                    <p>✅ No hay pagos pendientes por verificar en este momento.</p>
                </div>
            ) : (
                <>
                    {reservations.length > 0 && (
                        <div className="report-section" style={{ marginBottom: '3rem' }}>
                            <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>🎟️ Reservas de Tickets Pendientes</h2>
                            <div className="table-responsive">
                                <table className="reports-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha/Hora</th>
                                            <th>Usuario</th>
                                            <th>Evento</th>
                                            <th>Asientos</th>
                                            <th>Monto ($)</th>
                                            <th>Referencia Pago Móvil</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservations.map(r => (
                                            <tr key={r.id}>
                                                <td>{new Date(r.buy_date).toLocaleString()}</td>
                                                <td>{r.user_email}</td>
                                                <td>{r.event_name}</td>
                                                <td>{r.tickets_quantity} ({r.seats.join(', ')})</td>
                                                <td style={{ fontWeight: 'bold' }}>${r.total_price}</td>
                                                <td style={{ color: '#00a4e4', fontWeight: 'bold' }}>{r.payment_reference?.replace('pago_movil - Ref: ', '') || r.payment_method}</td>
                                                <td>
                                                    <button onClick={() => handleAction('reservation', r.id, 'approve')} style={{ background: '#28a745', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>✅ Aprobar</button>
                                                    <button onClick={() => handleAction('reservation', r.id, 'reject')} style={{ background: '#dc3545', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❌ Rechazar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {orders.length > 0 && (
                        <div className="report-section">
                            <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>🛒 Órdenes del Kiosko Pendientes</h2>
                            <div className="table-responsive">
                                <table className="reports-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha/Hora</th>
                                            <th>Usuario</th>
                                            <th>Productos (Cant.)</th>
                                            <th>Monto ($)</th>
                                            <th>Referencia Pago Móvil</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(o => (
                                            <tr key={o.id}>
                                                <td>{new Date(o.created_at).toLocaleString()}</td>
                                                <td>{o.user_email}</td>
                                                <td>
                                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                        {o.items?.map((item, idx) => (
                                                            <li key={idx}>{item.product_name} (x{item.quantity})</li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td style={{ fontWeight: 'bold' }}>${o.total_price}</td>
                                                <td style={{ color: '#00a4e4', fontWeight: 'bold' }}>{o.payment_reference?.replace('pago_movil - Ref: ', '') || o.payment_method}</td>
                                                <td>
                                                    <button onClick={() => handleAction('order', o.id, 'approve')} style={{ background: '#28a745', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>✅ Aprobar</button>
                                                    <button onClick={() => handleAction('order', o.id, 'reject')} style={{ background: '#dc3545', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>❌ Rechazar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
