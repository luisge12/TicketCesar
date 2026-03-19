import React from 'react';
import { useNavigate } from 'react-router-dom';
import './../styles/admin-bar.css';

const AdminBarContent = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="admin-bar-container">
      <div className="admin-bar-header">
        <button className="admin-close" onClick={onClose}>×</button>
      </div>
      <div className="admin-bar-text">
        <button onClick={() => navigate('/insertEvent')}>Insertar Eventos</button>
        <button onClick={() => navigate('/insertArticle')}>Insertar Artículo</button>
        <button onClick={() => navigate('/insertProgramacion')}>Programación</button>
        <button onClick={() => navigate('/insertEquipo')}>Equipo</button>
      </div>
    </div>
  );
};

export default AdminBarContent;

