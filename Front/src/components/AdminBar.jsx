import React, { useState } from 'react';
import AdminBarContent from './AdminBarContent';
import './../styles/admin-bar.css';

const AdminBar = () => {
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
    <AdminBarContent onClose={() => setExpanded(false)} />
  );
};

export default AdminBar;

