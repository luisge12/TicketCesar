import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/index.css';
import '../styles/app.css';
import '../styles/visitanos.css';

export default function Visitanos() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <main className="visitanos-page" >
      {/* Navegación similar a la de la página de Blog */}
      <nav className="blog-nav" style={{ background: 'none', color: 'var(--black)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button className={`blog-nav-btn ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>Menú Inicial</button>
          <button className={`blog-nav-btn ${location.pathname === '/visitanos' ? 'active' : ''}`} onClick={() => navigate('/visitanos')}>Visítanos</button>
        </div>
      </nav>

      <h1>Visítanos</h1>

      <section>
        <h2>Sobre el Teatro</h2>
        <p>
          El Teatro César es un espacio dedicado a la difusión de las artes escénicas: música, danza, teatro y actividades culturales. Contamos con programación variada durante todo el año, ciclos de formación y espacios para muestras locales.
        </p>
        <p>
          Horario de atención: Lunes a Viernes 10:00 - 18:00. Taquilla abierta 2 horas antes de cada función.
        </p>
      </section>

      <section>
        <h2>Cómo llegar</h2>
        <p>
          Dirección: Estamos en el Rectorado de la Universidad de Los Andes, en el boulevard de los Pintores. Calle 23 Vargas, entre Avenidas 2 y 3, Mérida, Edo. Mérida. Venezuela.
        </p>

        {/* Optional photo: place an image at `src/assets/rectorado.jpg` to show the building */}
        <div>
          <img src="src/assets/rectorado.jpg" alt="Rectorado - Teatro César" className="visitanos-photo" onError={(e)=>{e.target.style.display='none'}} />
        </div>

        <div>
          {/* Embedded Google Maps centered on the provided coordinates (Teatro César Rengifo) */}
          <iframe
            title="mapa-teatro"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src="https://www.google.com/maps?q=8.597837825828972,-71.14532011966672&z=17&output=embed"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p><strong>Ubicación:</strong> Teatro César Rengifo — coordenadas 8.597837825828972, -71.14532011966672</p>
      </section>

      
    </main>
  );
}
