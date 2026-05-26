import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
      <h1 style={{ color: 'var(--senai-blue-dark)', marginBottom: '16px' }}>{title}</h1>
      <p>Esta página ({title}) está em desenvolvimento e logo estará disponível.</p>
    </div>
  );
};

export default PlaceholderPage;
