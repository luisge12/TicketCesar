import React, { useState, useEffect } from 'react';
import { API_URL } from '../config.js';
import '../styles/admin-reports.css';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function AdminReports() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    
    // Analytics states
    const [analyticsData, setAnalyticsData] = useState([]);
    const [topEvents, setTopEvents] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const { userRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        if (userRole && userRole !== 'admin') {
            navigate('/');
        }
        fetchEvents();
        fetchAnalytics();
        fetchTopEvents();
    }, [userRole, navigate, selectedYear, selectedMonth]);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${API_URL}/get-events`);
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching events for reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`${API_URL}/analytics/monthly-sales/${selectedYear}`, { credentials: 'include' });
            const data = await res.json();
            
            // Format data for Recharts (fill missing months)
            const monthsNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const formattedData = monthsNames.map((name, i) => {
                const monthNum = i + 1;
                const found = Array.isArray(data) ? data.find(item => parseInt(item.month) === monthNum) : null;
                return {
                    name: name,
                    recaudacion: found ? parseFloat(found.total_revenue) : 0,
                    tickets: found ? parseInt(found.total_tickets) : 0
                };
            });
            setAnalyticsData(formattedData);
        } catch (err) {
            console.error("Error fetching analytics:", err);
        }
    };

    const fetchTopEvents = async () => {
        try {
            const res = await fetch(`${API_URL}/analytics/top-events/${selectedMonth}/${selectedYear}`, { credentials: 'include' });
            const data = await res.json();
            setTopEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching top events:", err);
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
                <h1>Panel de Control Administrativo</h1>
            </header>

            <section className="dashboard-charts-section no-print">
                <div className="chart-card">
                    <div className="card-header-flex">
                        <h3>Recaudación Mensual</h3>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="admin-selector"
                        >
                            {[2024, 2025, 2026].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="chart-container" style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <BarChart data={analyticsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`$${value}`, 'Recaudación']}
                                />
                                <Bar dataKey="recaudacion" fill="#000" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="top-events-card">
                    <div className="card-header-flex">
                        <h3>Top Eventos</h3>
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="admin-selector"
                        >
                            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="top-list">
                        {topEvents.length > 0 ? (
                            topEvents.map((event, idx) => (
                                <div key={event.id} className="top-item">
                                    <div className="rank-circle">{idx + 1}</div>
                                    <div className="event-info">
                                        <strong>{event.name}</strong>
                                        <small>{event.tickets} tickets vendidos</small>
                                    </div>
                                    <div className="item-revenue">${Number(event.revenue).toLocaleString()}</div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-top">No hay ventas registradas.</div>
                        )}
                    </div>
                </div>
            </section>

            <header className="reports-header-sub">
                <h2>Gestión Individual de Eventos</h2>
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
                                    {Array.isArray(selectedReport.data) && selectedReport.data.map((item, index) => {
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
                                        <th>{Array.isArray(selectedReport.data) ? selectedReport.data.reduce((sum, item) => sum + parseInt(item.total_tickets), 0) : 0}</th>
                                        <th>${Array.isArray(selectedReport.data) ? selectedReport.data.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0).toFixed(2) : '0.00'}</th>
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
