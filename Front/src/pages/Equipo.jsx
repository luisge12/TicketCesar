import React, { useEffect } from 'react';
import '../styles/index.css';
import '../styles/app.css';
import '../styles/quienes-somos.css';
import '../styles/equipo.css';
import { useNavigate } from 'react-router-dom';

const teamMembers = [
  {
    id: 1,
    nombre: 'Carlos',
    apellido: 'Moreno',
    rol: 'Director',
    descripcion: 'Director actual del Teatro César Rengifo. Lidera la visión artística y administrativa del teatro, fortaleciendo el vínculo con la comunidad universitaria y cultural.',
    foto: 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=CM'
  },
  {
    id: 2,
    nombre: 'Igor',
    apellido: 'Martínez',
    rol: 'Coordinador de Producción',
    descripcion: 'Inició el ambicioso proyecto de recuperación del teatro en 2021. Lideró la transformación y restauración del espacio patrimonial.',
    foto: 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=IM'
  },
  {
    id: 3,
    nombre: 'Jony',
    apellido: 'Parra',
    rol: 'Coordinador de Eventos',
    descripcion: 'Continuó la labor de recuperación en 2022, consolidando el modelo de autogestión y logrando la reapertura gradual del teatro.',
    foto: 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=JP'
  },
  {
    id: 4,
    nombre: 'María',
    apellido: 'García',
    rol: 'Coordinadora de Marketing',
    descripcion: 'Encargada de la comunicación y promoción de eventos culturales. Gestiona las redes sociales y estrategias de difusión del teatro.',
    foto: 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=MG'
  },
  {
    id: 5,
    nombre: 'Roberto',
    apellido: 'Méndez',
    rol: 'Técnico de Sonido',
    descripcion: 'Profesional responsable del manejo técnico de audio en todas las presentaciones y eventos del teatro.',
    foto: 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=RM'
  },
  {
    id: 6,
    nombre: 'Ana',
    apellido: 'López',
    rol: 'Atención al Público',
    descripcion: 'Brinda atención cordial a los asistentes y gestiona la venta de tickets y reservas.',
    foto: 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=AL'
  }
];

export default function Equipo() {
    const navigate = useNavigate();
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // ignore in non-browser environments
    }
  }, []);

  return (
    <main className="equipo-page">
        {/* Navegación */}
      <nav className="blog-nav" style={{ background: 'none', color: 'var(--black)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button className={`blog-nav-btn ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>Menú Inicial</button>
          <button className={`blog-nav-btn ${location.pathname.startsWith('/equipo') ? 'active' : ''}`} onClick={() => navigate('/equipo')}>Equipo</button>
        </div>
      </nav>
      <h1 className="equipo-title">Nuestro Equipo</h1>
      <p className="equipo-subtitle">
        Conoce al equipo detrás del Teatro César Rengifo
      </p>
      
      <div className="equipo-grid">
        {teamMembers.map((miembro) => (
          <div key={miembro.id} className="equipo-card">
            <div className="equipo-card-image">
              <img src={miembro.foto} alt={`${miembro.nombre} ${miembro.apellido}`} />
            </div>
            <div className="equipo-card-content">
              <h2 className="equipo-nombre">{miembro.nombre} {miembro.apellido}</h2>
              <span className="equipo-rol">{miembro.rol}</span>
              <p className="equipo-descripcion">{miembro.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
