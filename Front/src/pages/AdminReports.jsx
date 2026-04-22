import React, { useState, useEffect } from 'react';
import { API_URL } from '../config.js';
import '../styles/admin-reports.css';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function AdminReports() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const { userRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        if (userRole && userRole !== 'admin') {
            navigate('/');
        }
        fetchEvents();
    }, [userRole, navigate]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/get-events`);
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            console.error("Error fetching events for reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseEvent = async (id) => {
        const confirmClose = window.confirm("¿Seguro que deseas cerrar este evento? Esto cortará su venta, configurará los tickets vendidos de forma histórica y no se puede deshacer de forma sencilla.");
        if (!confirmClose) return;

        try {
            const res = await fetch(`${API_URL}/close-event/${id}`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (res.ok) {
                alert('Evento cerrado con éxito');
                fetchEvents();
            } else {
                alert('Error al cerrar el evento');
            }
        } catch (err) {
            console.error("Error closing event:", err);
            alert('Error en conexión al cerrar el evento');
        }
    };

    const handleViewReport = async (eventTarget) => {
        try {
            const res = await fetch(`${API_URL}/event-report/${eventTarget.id}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            setSelectedReport({ event: eventTarget, data });
            setReportModalOpen(true);
        } catch (err) {
            console.error(err);
            alert("Error al obtener detalles");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <main className="admin-reports-page">
            <header className="reports-header">
                <h1>Reportes Administrativos de Eventos</h1>
                <p>Visualiza el rendimiento de taquilla y finaliza sus ventas.</p>
            </header>

            <section className="reports-section">
                <table className="reports-table">
                    <thead>
                        <tr>
                            <th>Evento</th>
                            <th>Status</th>
                            <th>Tickets Vendidos / Reservados</th>
                            <th>Precio Entrada</th>
                            <th>Recaudación Proyectada</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(event => {
                            return (
                                <tr key={event.id} className={!event.is_active ? 'closed-event-row' : ''}>
                                    <td>
                                        <strong>{event.name}</strong><br/>
                                        <small>{new Date(event.date_start).toLocaleDateString()}</small>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${event.is_active ? 'active' : 'closed'}`}>
                                            {event.is_active ? 'Abierto' : 'Cerrado'}
                                        </span>
                                    </td>
                                    <td>{event.is_active ? 'Contando al cerrar...' : event.tickets_sold}</td>
                                    <td>${Number(event.ticket_price || 0).toFixed(2)}</td>
                                    <td>
                                        {!event.is_active 
                                            ? `$${(event.tickets_sold * (event.ticket_price || 0)).toFixed(2)}`
                                            : 'Pendiente'}
                                    </td>
                                    <td>
                                        {event.is_active && (
                                            <button 
                                                className="btn-close-event" 
                                                onClick={() => handleCloseEvent(event.id)}
                                            >
                                                Cerrar Evento
                                            </button>
                                        )}
                                        <button 
                                            className="btn-view-report" 
                                            onClick={() => handleViewReport(event)}
                                        >
                                            Ver Detalles
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {events.length === 0 && <p className="no-events-reports">No hay eventos registrados.</p>}
            </section>

            {reportModalOpen && selectedReport && (
                <div className="report-modal-overlay">
                    <div className="report-modal-content print-area">
                        <div className="report-modal-header no-print">
                            <h2>Reporte Detallado</h2>
                            <button className="btn-close-modal" onClick={() => setReportModalOpen(false)}>×</button>
                        </div>
                        
                        <div className="report-modal-body">
                            <h3>{selectedReport.event.name}</h3>
                            <p><strong>Fecha de Inicio:</strong> {new Date(selectedReport.event.date_start).toLocaleDateString()}</p>
                            <p><strong>Estado:</strong> {selectedReport.event.is_active ? 'Abierto' : 'Cerrado'}</p>
                            
                            <table className="detailed-report-table">
                                <thead>
                                    <tr>
                                        <th>Método de Pago</th>
                                        <th>Tickets</th>
                                        <th>Recaudación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedReport.data.map((item, index) => {
                                        let methodName = item.pay_method;
                                        if (methodName === 'reserva_interna') methodName = 'Reserva Interna (Cortesía)';
                                        if (methodName === 'efectivo_bs') methodName = 'Efectivo Bs';
                                        if (methodName === 'efectivo_usd') methodName = 'Efectivo USD';
                                        if (methodName === 'pago_movil') methodName = 'Pago Móvil';
                                        
                                        return (
                                            <tr key={index}>
                                                <td>{methodName}</td>
                                                <td>{item.total_tickets}</td>
                                                <td>${Number(item.total_revenue).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th>Total Comercial</th>
                                        <th>{selectedReport.data.reduce((sum, item) => sum + parseInt(item.total_tickets), 0)}</th>
                                        <th>${selectedReport.data.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0).toFixed(2)}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="report-modal-footer no-print">
                            <button className="btn-print" onClick={handlePrint}>Imprimir / Exportar a PDF</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
