import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { API_URL } from '../config.js';
import '../styles/reserv-event.css';
import PaymentModal from '../components/PaymentModal.jsx';

const plateaRows = [
  { row: 'A', seats: 10 }, { row: 'C', seats: 11 }, { row: 'E', seats: 10 }, { row: 'G', seats: 10 },
  { row: 'I', seats: 10 }, { row: 'K', seats: 10 }, { row: 'M', seats: 10 }, { row: 'Ñ', seats: 9 },
  { row: 'P', seats: 10 }, { row: 'R', seats: 9 }, { row: 'T', seats: 10 },
  { row: 'B', seats: 10 }, { row: 'D', seats: 11 }, { row: 'F', seats: 10 }, { row: 'H', seats: 10 },
  { row: 'J', seats: 10 }, { row: 'L', seats: 10 }, { row: 'N', seats: 10 }, { row: 'O', seats: 9 },
  { row: 'Q', seats: 10 }, { row: 'S', seats: 9 }, { row: 'U', seats: 10 }
];
const plateaLeft = plateaRows.slice(0, 11);  // Primeras 11 filas
const plateaRight = plateaRows.slice(11);    // Siguientes 11 filas

const palcoRows = [
  { row: 'A', seats: 15 }, { row: 'B', seats: 15 }, { row: 'C', seats: 15 }, { row: 'D', seats: 15 },
  { row: 'E', seats: 15 }, { row: 'F', seats: 15 }
];

export default function ReservEvent() {
  const location = useLocation();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatStates, setSeatStates] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [adminTargetSeat, setAdminTargetSeat] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    fetch(`${API_URL}/session`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.isAuthenticated) {
          setUserRole(data.user.role);
        }
      })
      .catch(err => console.error(err));

    fetch(`${API_URL}/event/${id}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(err => console.error(err));

    fetch(`${API_URL}/get_state_seat/${id}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const stateMap = {};
        data.forEach(seat => {
          stateMap[seat.seat_id] = seat.state;
        });
        setSeatStates(stateMap);
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleSelect = (section, row, seat) => {
    const seatId = `${section}-${row}-${seat}`;
    const state = seatStates[seatId] || 'available';

    if (userRole?.toLowerCase() === 'admin') {
      setAdminTargetSeat(seatId);
      return;
    }

    if (state !== 'available') return;

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleAdminUpdateState = (newState) => {
    if (!adminTargetSeat) return;

    fetch(`${API_URL}/update_seat_state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: id,
        seatId: adminTargetSeat,
        newState
      }),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Error actualizando estado: ' + data.error);
        } else {
          // Actualizar estado localmente
          setSeatStates(prev => ({ ...prev, [adminTargetSeat]: newState }));
          setAdminTargetSeat(null);
        }
      })
      .catch(err => console.error(err));
  };

  const handleReserve = () => {
    setIsPaymentModalOpen(true);
  };

  const handleReservationSuccess = () => {
    setSelectedSeats([]);
    // Reload event and seat states
    fetch(`${API_URL}/event/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(err => console.error(err));

    fetch(`${API_URL}/get_state_seat/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const stateMap = {};
        data.forEach(seat => {
          stateMap[seat.seat_id] = seat.state;
        });
        setSeatStates(stateMap);
      })
      .catch(err => console.error(err));

    alert('¡Reserva realizada con éxito!');
  };

  const formatTime12h = (timeStr) => {
    if (!timeStr) return 'Hora no disponible';
    try {
      const [hours, minutes] = timeStr.split(':');
      let h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12; // la hora '0' debe ser '12'
      return `${h}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  if (!event) return <div className="loading-container">Cargando...</div>;

  return (
    <div className={`seat-reservation-container ${userRole?.toLowerCase() === 'admin' ? 'admin-view' : ''}`}>
      <div className="event-hero">
        <div className="event-info-container">
          <h1 className="event-title_">{event.name}</h1>
          <div className="event-meta">
            <div className="meta-item">
               {event.date_start ? new Date(event.date_start).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no disponible'}
            </div>
            <div className="meta-item">
               {formatTime12h(event.hour)}
            </div>
            <div className="meta-item">
               {event.category || 'Sin categoría'}
            </div>
            <div className="meta-item">
               ${event.ticket_price || '0.00'}
            </div>
          </div>
        </div>
        <div className="event-image-container">
          <img
            src={event.image || 'https://via.placeholder.com/500x300?text=No+Image'}
            alt={event.name}
            className="event-image"
          />
        </div>
        <p className="reserv_event-description_">{event.description}</p>
      </div>
      {/* Palco */}
      <div className="seat-section">
        <h3>Palco</h3>
        <div className="seat-grid">
          {palcoRows.map(({ row, seats }) => (
            <div key={row} className="seat-row">
              <span className="row-label">{row}</span>
              {[...Array(seats)].map((_, i) => {
                const seatNum = i + 1;
                const seatId = `Palco-${row}-${seatNum}`;
                const state = seatStates[seatId] || 'available';
                const isSelected = selectedSeats.includes(seatId);

                return (
                  <button
                    key={seatId}
                    className={`seat-btn ${state !== 'available' && userRole !=='admin' ? 'reserved' : state} 
                      ${isSelected ? ' selected' : ''}`}
                    onClick={() => handleSelect('Palco', row, seatNum)}
                    disabled={userRole?.toLowerCase() !== 'admin' && state !== 'available'}
                  >
                    {seatNum}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Platea después, en dos columnas */}
      <div className="seat-section">
        <h3>Platea</h3>
        <div className="platea-columns">
          <div className="seat-grid">
            {plateaLeft.map(({ row, seats }) => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                {[...Array(seats)].map((_, i) => {
                  const seatNum = i + 1;
                  const seatId = `Platea-${row}-${seatNum}`;
                  const state = seatStates[seatId] || 'available';
                  const isSelected = selectedSeats.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      className={`seat-btn ${state !== 'available' && userRole !=='admin' ? 'reserved' : state} 
                      ${isSelected ? ' selected' : ''}`}
                      onClick={() => handleSelect('Platea', row, seatNum)}
                      disabled={userRole?.toLowerCase() !== 'admin' && state !== 'available'}
                    >
                      {seatNum}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="seat-grid">
            {plateaRight.map(({ row, seats }) => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                {[...Array(seats)].map((_, i) => {
                  const seatNum = i + 1;
                  const seatId = `Platea-${row}-${seatNum}`;
                  const state = seatStates[seatId] || 'available';
                  const isSelected = selectedSeats.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      className={`seat-btn ${state !== 'available' && userRole !=='admin' ? 'reserved' : state} 
                      ${isSelected ? ' selected' : ''}`}
                      onClick={() => handleSelect('Platea', row, seatNum)}
                      disabled={userRole?.toLowerCase() !== 'admin' && state !== 'available'}
                    >
                      {seatNum}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {userRole?.toLowerCase() !== 'admin' && (
        <button className="reserve-btn" onClick={handleReserve} disabled={selectedSeats.length === 0}>
          Comprar
        </button>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onRequestClose={() => setIsPaymentModalOpen(false)}
        event={event}
        selectedSeats={selectedSeats}
        onReservationSuccess={handleReservationSuccess}
      />

      {/* Admin Quick Action Modal */}
      {adminTargetSeat && (
        <div className="admin-seat-modal-overlay">
          <div className="admin-seat-modal">
            <h4>Gestionar Asiento: {adminTargetSeat}</h4>
            <div className="admin-actions">
              <button onClick={() => handleAdminUpdateState('available')} className="btn-available">Disponible</button>
              <button onClick={() => handleAdminUpdateState('reserved')} className="btn-reserved">Vendido</button>
              <button onClick={() => handleAdminUpdateState('occupied')} className="btn-occupied">Reserva interna</button>
              <button onClick={() => setAdminTargetSeat(null)} className="btn-close">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}