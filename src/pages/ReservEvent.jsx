import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import '../styles/reserv-event.css';

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    fetch(`http://localhost:3000/event/${id}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch(err => console.error(err));
  }, [id]);

  const handleSelect = (section, row, seat) => {
    const seatId = `${section}-${row}-${seat}`;
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const handleReserve = () => {
    alert(`Reservaste: ${selectedSeats.join(', ')}`);
    // Aquí puedes hacer el fetch para guardar la reserva
  };

  if (!event) return <div>Cargando...</div>;

  return (
    <div className="seat-reservation-container">
      <h2>{event.name}</h2>
      <p>{event.description}</p>
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
                return (
                  <button
                    key={seatId}
                    className={`seat-btn${selectedSeats.includes(seatId) ? ' selected' : ''}`}
                    onClick={() => handleSelect('Palco', row, seatNum)}
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
                  return (
                    <button
                      key={seatId}
                      className={`seat-btn${selectedSeats.includes(seatId) ? ' selected' : ''}`}
                      onClick={() => handleSelect('Platea', row, seatNum)}
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
                  return (
                    <button
                      key={seatId}
                      className={`seat-btn${selectedSeats.includes(seatId) ? ' selected' : ''}`}
                      onClick={() => handleSelect('Platea', row, seatNum)}
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
      <button className="reserve-btn" onClick={handleReserve} disabled={selectedSeats.length === 0}>
        Reservar seleccionadas
      </button>
    </div>
  );
}