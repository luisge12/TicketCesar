import React from 'react';
import { useNavigate } from 'react-router-dom';
import './../styles/admin-bar.css';

const AdminBar = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-bar-container">
      <div className="admin-bar-text">
        <button onClick={() => navigate('/insertEvent')}>Insertar Eventos</button>
      </div>
    </div>
  );
};

export default AdminBar;