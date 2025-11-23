import { useEffect, useState } from 'react';
import './../styles/user-profile.css';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showQRFor, setShowQRFor] = useState(null);

    const pad = (n) => String(n).padStart(2, '0');
    const formatDateOnly = (iso) => {
        try {
            const d = new Date(iso);
            return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        } catch { return iso; }
    }
    const formatTimeOnly = (iso) => {
        try {
            const d = new Date(iso);
            return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch { return iso; }
    }

    const parseToDate = (value) => {
        // Accept Date, number (timestamp), ISO string, or dd/mm/yyyy[ hh:mm]
        if (!value && value !== 0) return null;
        if (value instanceof Date) return value;
        if (typeof value === 'number') return new Date(value);
        if (typeof value !== 'string') return null;

        // Try ISO first
        const isoTry = new Date(value);
        if (!Number.isNaN(isoTry.getTime())) return isoTry;

        // Try dd/mm/yyyy or dd-mm-yyyy with optional time
        const dm = value.trim();
    const dmRegex = new RegExp('^(\\d{1,2})[\\/\\-](\\d{1,2})[\\/\\-](\\d{2,4})(?:[ T](\\d{1,2}):(\\d{2}))?');
    const dmMatch = dm.match(dmRegex);
        if (dmMatch) {
            const day = parseInt(dmMatch[1], 10);
            const month = parseInt(dmMatch[2], 10) - 1;
            let year = parseInt(dmMatch[3], 10);
            if (year < 100) year += 2000;
            const hour = dmMatch[4] ? parseInt(dmMatch[4], 10) : 0;
            const minute = dmMatch[5] ? parseInt(dmMatch[5], 10) : 0;
            const d = new Date(year, month, day, hour, minute);
            if (!Number.isNaN(d.getTime())) return d;
        }

        return null;
    }

    const isFutureDate = (value) => {
        try {
            const d = parseToDate(value);
            if (!d) return false;
            return d.getTime() > Date.now();
        } catch { return false; }
    }

    // Returns true if the parsed date is strictly before now
    const hasEventPassed = (value) => {
        try {
            const d = parseToDate(value);
            if (!d) return false;
            return d.getTime() < Date.now();
        } catch { return false; }
    }

    useEffect(() => {
        const fetchSessionUser = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:3000/', { credentials: 'include' });
                const data = await res.json();
                if (data.isAuthenticated && data.user) {
                    setUser(data.user);
                } else {
                    setError('No hay sesión iniciada');
                }
            } catch (err) {
                setError(err.message || 'Error al obtener sesión');
            } finally {
                setLoading(false);
            }
        };

        fetchSessionUser();
    }, []);

    if (loading) return <div>Cargando perfil...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="user-profile-page">
            <div className="user-profile-grid">
                {user ? (
                    <aside className="user-info">
                        <p><strong>Nombre:</strong> {user.name} {user.lastname}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        {user.phone && <p><strong>Teléfono:</strong> {user.phone}</p>}
                        {user.birthdate && <p><strong>Fecha de nacimiento:</strong> {user.birthdate}</p>}
                    </aside>
                ) : (
                    <aside className="user-info">No se encontraron datos de usuario.</aside>
                )}

                <main className="reservations-column">
                    <section className="reservation-sample" style={{ marginTop: '1.5rem' }}>
                    <h3>Reservas recientes</h3>
                    {/* Example reservations array - replace with real fetch data later */}
                        {(() => {
                        const sampleReservations = [
                            {
                                reservation_id: 12345,
                                buy_id: 'BUY-20251022-0001',
                                seat_id: 'platea-A-1',
                                email: user?.email || 'luisge1299@gmail.com',
                                // esta reserva la dejamos con fecha de 'ayer' para pruebas
                                event: { id: 77, name: 'Recital de Música Clásica', date: '2025-10-24T19:30:00', venue: 'Teatro Principal' },
                                price: 25.00,
                                created_at: '2025-10-22T12:00:00'
                            },
                            {
                                reservation_id: 12346,
                                buy_id: 'BUY-20251022-0002',
                                seat_id: 'platea-A-2',
                                email: user?.email || 'luisge1299@gmail.com',
                                event: { id: 78, name: 'Obra de Teatro: La Noche', date: '2025-10-05T20:00:00', venue: 'Sala Experimental' },
                                price: 18.50,
                                created_at: '2025-10-22T12:05:00'
                            },
                            {
                                reservation_id: 12347,
                                buy_id: 'BUY-20251022-0003',
                                seat_id: 'platea-B-10',
                                email: user?.email || 'luisge1299@gmail.com',
                                event: { id: 79, name: 'Concierto de Jazz', date: '2026-01-15T21:00:00', venue: 'Teatro Principal' },
                                price: 30.00,
                                created_at: '2025-10-22T12:10:00'
                            }
                        ];

                        return (
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {sampleReservations.map(res => (
                                    <article key={res.reservation_id} style={{ border: '1px solid #ddd', padding: '0.75rem', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p><strong>Evento:</strong> {res.event.name} <span style={{ color: '#666' }}>({new Date(res.event.date).toLocaleDateString()})</span></p>
                                            <p><strong>Asiento:</strong> {res.seat_id} &nbsp; <strong>Precio:</strong> ${res.price.toFixed(2)}</p>
                                            <p style={{ fontSize: '0.9rem', color: '#555' }}><strong>Fecha:</strong> {formatDateOnly(res.event.date)}</p>
                                            <p style={{ fontSize: '0.9rem', color: '#555' }}><strong>Hora:</strong> {formatTimeOnly(res.event.date)}</p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                            {isFutureDate(res.event.date) ? (
                                                <button className="modal-buttons" onClick={() => setShowQRFor(res.reservation_id)}>Ver QR</button>
                                            ) : (
                                                (parseToDate(res.event.date) ? (
                                                    hasEventPassed(res.event.date) ? (
                                                        <span style={{ color: '#999', fontSize: '0.9rem' }}>Evento pasado</span>
                                                    ) : (
                                                        <span style={{ color: '#999', fontSize: '0.9rem' }}>Fecha inválida</span>
                                                    )
                                                ) : (
                                                    <span style={{ color: '#999', fontSize: '0.9rem' }}>Fecha inválida</span>
                                                ))
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        );
                    })()}
                </section>

                    {showQRFor && (
                        <div className="qr-overlay" onClick={() => setShowQRFor(null)}>
                            <div className="qr-box" onClick={e => e.stopPropagation()}>
                                <h4>QR reserva #{showQRFor}</h4>
                                <div className="qr-placeholder">QR:{showQRFor}</div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <button className="modal-buttons" onClick={() => setShowQRFor(null)}>Cerrar</button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
