import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { API_URL } from '../config.js';
import '../styles/reserv-event.css';
import PaymentModal from '../components/PaymentModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const plateaRows = [
  { row: 'A', seats: 10 }, { row: 'C', seats: 11 }, { row: 'E', seats: 10 }, { row: 'G', seats: 10 },
  { row: 'I', seats: 10 }, { row: 'K', seats: 10 }, { row: 'M', seats: 10 }, { row: 'Ñ', seats: 9 },
  { row: 'P', seats: 10 }, { row: 'R', seats: 9 }, { row: 'T', seats: 10 },
  { row: 'B', seats: 10 }, { row: 'D', seats: 11 }, { row: 'F', seats: 10 }, { row: 'H', seats: 10 },
  { row: 'J', seats: 10 }, { row: 'L', seats: 10 }, { row: 'N', seats: 10 }, { row: 'O', seats: 9 },
  { row: 'Q', seats: 10 }, { row: 'S', seats: 9 }, { row: 'U', seats: 10 }
];
const plateaLeft = plateaRows.slice(0, 11);
const plateaRight = plateaRows.slice(11);

const palcoRows = [
  { row: 'F', seats: 15 }, { row: 'E', seats: 15 }, { row: 'D', seats: 15 }, { row: 'C', seats: 15 },
  { row: 'B', seats: 15 }, { row: 'A', seats: 15 }
];

export default function ReservEvent({ openLoginModal }) {
  const location = useLocation();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatStates, setSeatStates] = useState({});
  const { userRole } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPaymentMethod, setAdminPaymentMethod] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [ticketInputValue, setTicketInputValue] = useState('1');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
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
  }, [id]);

  const handleSelect = (section, row, seat) => {
    const seatId = `${section}-${row}-${seat}`;
    const state = seatStates[seatId] || 'available';

    // Admins can select any seat, even if not available, to manage it
    if (userRole?.toLowerCase() === 'admin') {
      setSelectedSeats(prev =>
        prev.includes(seatId)
          ? prev.filter(s => s !== seatId)
          : [...prev, seatId]
      );
      return;
    }

    if (state !== 'available') return;

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleAdminAction = async (action) => {
    if (selectedSeats.length === 0) return;

    if (action === 'vender') {
      setIsAdminModalOpen(true);
      return;
    }

    const newState = action === 'disponible' ? 'available' : 'occupied';

    try {
      const response = await fetch(`${API_URL}/update_seat_state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, seatId: selectedSeats, newState }),
        credentials: 'include'
      });
      const data = await response.json();
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        const newStates = { ...seatStates };
        selectedSeats.forEach(s => newStates[s] = newState);
        setSeatStates(newStates);
        setSelectedSeats([]);
        alert('Asientos actualizados correctamente');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminSale = async (e) => {
    e.preventDefault();
    if (!adminPaymentMethod) {
      alert('Seleccione un método de pago');
      return;
    }

    try {
      const totalPrice = selectedSeats.length * (event.ticket_price || 0);
      const response = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          eventId: id,
          seatId: selectedSeats,
          paymentMethod: adminPaymentMethod,
          totalPrice: totalPrice
        })
      });

      if (response.ok) {
        handleReservationSuccess();
        setIsAdminModalOpen(false);
        setAdminPaymentMethod('');
      } else {
        const data = await response.json();
        alert('Error al procesar la venta: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReservationSuccess = () => {
    setSelectedSeats([]);
    // Refresh states
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

    alert('¡Operación realizada con éxito!');
  };

  const formatTime12h = (timeStr) => {
    if (!timeStr) return 'Hora no disponible';
    try {
      const [hours, minutes] = timeStr.split(':');
      let h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      return `${h}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const isRecorrido = event?.category?.toLowerCase() === 'recorridos';

  const handleReserve = async () => {
    if (isRecorrido) {
      const qty = parseInt(ticketInputValue, 10);
      if (isNaN(qty) || qty < 1) {
        alert('La cantidad mínima de tickets es 1');
        return;
      }
      if (qty > 15) {
        alert('La cantidad máxima de tickets es 15');
        return;
      }
    }

    try {
      const response = await fetch(`${API_URL}/session`, { credentials: 'include' });
      const data = await response.json();

      if (!data.isAuthenticated) {
        openLoginModal();
        return;
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      openLoginModal();
      return;
    }

    if (isRecorrido) {
      const tickets = [];
      const qty = parseInt(ticketInputValue, 10);
      for (let i = 0; i < qty; i++) {
        tickets.push(`recorrido-general-${i + 1}`);
      }
      // We set them immediately here for the modal to use
      setSelectedSeats(tickets);
    }

    setIsPaymentModalOpen(true);
  };

  if (!event) return <div className="loading-container">Cargando...</div>;

  const isAdmin = userRole?.toLowerCase() === 'admin';

  return (
    <div className={`seat-reservation-container ${isAdmin ? 'admin-view' : ''}`}>
      <div className="event-hero">
        <div className="event-content-left">
          <div className="event-info-container">
            <h1 className="event-title_">{event.name}</h1>
            <div className="event-meta">
              <div className="meta-item">
                📋 {event.date_start ? new Date(event.date_start).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no disponible'}
              </div>
              <div className="meta-item">
                🕚 {formatTime12h(event.hour)}
              </div>
              <div className="meta-item">
                𖤘 {event.category || 'Sin categoría'}
              </div>
              <div className="meta-item">
                $ {event.ticket_price || '0.00'}
              </div>
            </div>
          </div>
          <p className="reserv_event-description_">{event.description}</p>
        </div>
        <div className="event-image-container">
          <img
            src={event.image || 'https://via.placeholder.com/500x300?text=No+Image'}
            alt={event.name}
            className="event-image"
          />
        </div>
      </div>

      {!isRecorrido && (
        <>
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
                        className={`seat-btn ${state !== 'available' && !isAdmin ? 'reserved' : state} ${isSelected ? ' selected' : ''}`}
                        onClick={() => handleSelect('Palco', row, seatNum)}
                        disabled={!isAdmin && state !== 'available'}
                      >
                        {seatNum}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="seat-section">
            <h3>Platea</h3>
            <div className="platea-columns">
              <div className="seat-grid">
                {plateaLeft.map(({ row, seats }) => {
                  const isZigzag = ['C', 'G', 'K', 'Ñ', 'R'].includes(row);
                  return (
                    <div key={row} className={`seat-row ${isZigzag ? 'zigzag-left' : ''}`}>
                      <span className="row-label hidden-label">{row}</span>
                      {[...Array(seats)].map((_, i) => {
                        const seatNum = seats - i;
                        const seatId = `Platea-${row}-${seatNum}`;
                        const state = seatStates[seatId] || 'available';
                        const isSelected = selectedSeats.includes(seatId);
                        const isInnerSeatLeft = isZigzag && i === seats - 1;

                        return (
                          <button
                            key={seatId}
                            className={`seat-btn ${state !== 'available' && !isAdmin ? 'reserved' : state} ${isSelected ? ' selected' : ''} ${isInnerSeatLeft ? 'zigzag-offset-left' : ''}`}
                            onClick={() => handleSelect('Platea', row, seatNum)}
                            disabled={!isAdmin && state !== 'available'}
                          >
                            {seatNum}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div className="platea-center-labels">
                <div className="center-labels-col">
                  {plateaLeft.map(({ row }) => (
                    <div key={`center-left-${row}`} className="center-row-label">
                      {row}
                    </div>
                  ))}
                </div>
                <div className="center-labels-col">
                  {plateaRight.map(({ row }) => (
                    <div key={`center-right-${row}`} className="center-row-label">
                      {row}
                    </div>
                  ))}
                </div>
              </div>
              <div className="seat-grid">
                {plateaRight.map(({ row, seats }) => {
                  const isZigzag = ['D', 'H', 'L', 'O', 'S'].includes(row);
                  return (
                    <div key={row} className={`seat-row ${isZigzag ? 'zigzag-right' : ''}`}>
                      <span className="row-label hidden-label"></span>
                      {[...Array(seats)].map((_, i) => {
                        const seatNum = i + 1;
                        const seatId = `Platea-${row}-${seatNum}`;
                        const state = seatStates[seatId] || 'available';
                        const isSelected = selectedSeats.includes(seatId);
                        const isInnerSeatRight = isZigzag && i === 0;

                        return (
                          <button
                            key={seatId}
                            className={`seat-btn ${state !== 'available' && !isAdmin ? 'reserved' : state} ${isSelected ? ' selected' : ''} ${isInnerSeatRight ? 'zigzag-offset-right' : ''}`}
                            onClick={() => handleSelect('Platea', row, seatNum)}
                            disabled={!isAdmin && state !== 'available'}
                          >
                            {seatNum}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="stage-container">
              <div className="stage-box">ESCENARIO</div>
            </div>
          </div>
        </>
      )}

      {isRecorrido && (
        <div className="ticket-quantity-selector">
          <label htmlFor="ticket-qty">Cantidad de tickets:</label>
          <div className="quantity-controls">
            <button
              type="button"
              onClick={() => {
                const newQty = Math.max(1, ticketQuantity - 1);
                setTicketQuantity(newQty);
                setTicketInputValue(newQty.toString());
              }}
              className="qty-btn"
            >
              -
            </button>
            <input
              type="text"
              id="ticket-qty"
              value={ticketInputValue}
              onChange={(e) => {
                const val = e.target.value;
                setTicketInputValue(val);
                const num = parseInt(val, 10);
                if (!isNaN(num)) {
                  setTicketQuantity(num);
                }
              }}
              className="qty-input"
            />
            <button
              type="button"
              onClick={() => {
                const newQty = Math.min(15, ticketQuantity + 1);
                setTicketQuantity(newQty);
                setTicketInputValue(newQty.toString());
              }}
              className="qty-btn"
            >
              +
            </button>
          </div>
          <p className="total-price">
            Total: ${(event.ticket_price || 0) * (ticketQuantity || 0)}
          </p>
        </div>
      )}

      {isAdmin ? (
        <div className="admin-confirm-container">
          {selectedSeats.length > 0 && (
            <div className="admin-floating-actions">
              <span>{selectedSeats.length} seleccionados</span>
              <div className="admin-buttons-group">
                <button onClick={() => handleAdminAction('disponible')} className="btn-admin-action available">Liberar</button>
                <button onClick={() => handleAdminAction('ocupado')} className="btn-admin-action occupied">Reserva Interna</button>
                <button onClick={() => handleAdminAction('vender')} className="btn-admin-confirm">Vender</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          className="reserve-btn"
          onClick={handleReserve}
          disabled={(selectedSeats.length === 0 && !isRecorrido) || (isRecorrido && ticketInputValue.trim() === '')}
        >
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

      {isAdminModalOpen && (
        <div className="admin-seat-modal-overlay">
          <div className="admin-seat-modal">
            <h3>Confirmar Venta en Taquilla</h3>
            <p><strong>Asientos:</strong> {selectedSeats.join(', ')}</p>
            <p><strong>Total:</strong> ${selectedSeats.length * (event.ticket_price || 0)}</p>

            <form onSubmit={handleAdminSale} className="admin-sale-form">
              <label>Método de Pago:</label>
              <select
                value={adminPaymentMethod}
                onChange={(e) => setAdminPaymentMethod(e.target.value)}
                required
              >
                <option value="">Seleccione...</option>
                <option value="pago_movil">Pago Móvil</option>
                <option value="efectivo_bs">Efectivo Bs</option>
                <option value="efectivo_usd">Efectivo $</option>
              </select>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsAdminModalOpen(false)} className="btn-cancel">Cancelar</button>
                <button type="submit" className="btn-confirm">Procesar Venta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

