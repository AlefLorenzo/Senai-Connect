import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Home, Rss, Users, MessageSquare, Menu } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
        <Home size={24} />
        <span>Início</span>
      </NavLink>
      <NavLink to="/feed" className={({ isActive }) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
        <Rss size={24} />
        <span>Feed</span>
      </NavLink>
      <NavLink to="/groups" className={({ isActive }) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
        <Users size={24} />
        <span>Grupos</span>
      </NavLink>
      <NavLink to="/messages" className={({ isActive }) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
        <div className="icon-badge-wrapper">
          <MessageSquare size={24} />
          <span className="badge">2</span>
        </div>
        <span>Mensagens</span>
      </NavLink>
      <button className="bottom-nav-item" onClick={() => setIsMoreOpen(true)}>
        <Menu size={24} />
        <span>Mais</span>
      </button>
      </nav>
      {isMoreOpen && (
        <div className="more-sheet-overlay" onClick={() => setIsMoreOpen(false)}>
          <div className="more-sheet" onClick={e => e.stopPropagation()}>
            <div className="more-sheet-header">
              <h3>Mais</h3>
              <button className="close-btn" onClick={() => setIsMoreOpen(false)}>✕</button>
            </div>
            <ul className="more-sheet-list">
              <li><Link to="/profile">Perfil</Link></li>
              <li><Link to="/saved">Salvos</Link></li>
              <li><Link to="/files">Arquivos</Link></li>
              <li><Link to="/settings">Configurações</Link></li>
              <li><Link to="/help">Ajuda</Link></li>
              <li><button className="logout-btn" onClick={handleLogout}>Sair</button></li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
export default BottomNav;
