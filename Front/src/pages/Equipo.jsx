import React, { useState, useEffect } from 'react';
import '../styles/index.css';
import '../styles/app.css';
import '../styles/quienes-somos.css';
import '../styles/equipo.css';
import { useNavigate, useLocation } from 'react-router-dom';

import { API_URL } from '../config.js';

export default function Equipo() {
    const navigate = useNavigate();
    const location = useLocation();
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            window.scrollTo(0, 0);
        } catch {}

        const fetchTeam = async () => {
            try {
                const response = await fetch(`${API_URL}/equipo`);
                const data = await response.json();
                setTeamMembers(data);
            } catch (error) {
                console.error("Error fetching team members:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
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
