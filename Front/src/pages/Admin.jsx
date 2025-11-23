import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './../styles/admin-bar.css';

const AdminBar = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // Small toggle shown when collapsed
  if (!expanded) {
    return (
      <div className="admin-toggle" onClick={() => setExpanded(true)} title="Abrir panel administrador">
        <span>ADMIN</span>
      </div>
    );
  }

  return (
    <div className="admin-bar-container">
      <div className="admin-bar-header">
        <button className="admin-close" onClick={() => setExpanded(false)}>×</button>
      </div>
      <div className="admin-bar-text">
        <button onClick={() => navigate('/insertEvent')}>Insertar Eventos</button>
        <button onClick={() => navigate('/insertArticle')}>Insertar Artículo</button>
      </div>
    </div>
  );
};

export default AdminBar;