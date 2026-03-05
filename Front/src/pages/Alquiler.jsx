import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/index.css';
import '../styles/app.css';
import '../styles/alquiler.css';

const Alquiler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <main className="alquiler-page">
      {/* Navegación similar a otras páginas */}
      <nav className="blog-nav" style={{ background: 'none', color: 'var(--black)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button className={`blog-nav-btn ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>Menú Inicial</button>
          <button className={`blog-nav-btn ${location.pathname === '/alquiler' ? 'active' : ''}`} onClick={() => navigate('/alquiler')}>Alquiler</button>
        </div>
      </nav>

      <div className="submission-container">
        <h1 className="main-title">Teatro César Rengifo</h1>
        <h2 className="sub-title">Instrucciones para envío de propuestas</h2>
        
        <section className="info-section">
          <h3>Datos requeridos</h3>
          <p>
            Debes enviarnos una carta dirigida al profesor <strong>Carlos Moreno Gil</strong>, 
            Director del Teatro César Rengifo, con los siguientes datos:
          </p>
          <ul className="data-list">
            <li><span className="label">Título del proyecto:</span> (nombre de la obra o evento)</li>
            <li><span className="label">Director o productor encargado:</span> (nombre y contacto)</li>
            <li><span className="label">Descripción del evento y la agrupación o compañía:</span> (breve reseña)</li>
            <li><span className="label">Fecha solicitada:</span> (día o período deseado)</li>
            <li><span className="label">Categoría del evento:</span> (teatro, danza, festival, musical, etc.)</li>
            <li><span className="label">Dossier artístico y rider técnico:</span> (en caso de tenerlo)</li>
          </ul>
          <p className="format-note">
            <strong>Formato:</strong> Puedes enviarnos un documento en formato PDF o un archivo de Word.
          </p>
        </section>

        <section className="deadline-section">
          <h3>Plazos de envío</h3>
          <p>Actualmente trabajamos con un formato trimestral, lo que significa que:</p>
          <ul className="deadline-list">
            <li>
              <span className="quarter">Eventos para enero, febrero y marzo:</span> deben enviarse durante el mes de diciembre.
            </li>
            <li>
              <span className="quarter">Eventos para abril, mayo y junio:</span> deben enviarse durante el mes de marzo.
            </li>
            <li>
              <span className="quarter">Eventos para julio, agosto y septiembre:</span> deben enviarse durante el mes de junio.
            </li>
            <li>
              <span className="quarter">Eventos para octubre, noviembre y diciembre:</span> deben enviarse durante el mes de septiembre.
            </li>
          </ul>
        </section>

        <section className="contact-section">
          <h3>Contacto</h3>
          <p>
            Para enviar tu propuesta, puedes contactarnos a través de nuestro correo electrónico:
          </p>
          <p className="contact-email">
            <strong>✉️ Correo:</strong> salacesarrengifo@gmail.com
          </p>
        </section>
      </div>
    </main>
  );
};

export default Alquiler;

