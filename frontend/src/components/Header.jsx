import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import Avatar from './Avatar';
import './Header.css';

const Header = () => {
  const { user } = useContext(AuthContext);

  const loggedUserId = user?.id || 1;

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="logo">
            <span className="logo-text">SENAI</span>
            <span className="logo-sub">CONNECT</span>
          </div>
        </Link>
      </div>
      
      <div className="header-center">
        <div className="search-bar">
          <Search size={18} color="#65676B" />
          <input type="text" placeholder="Buscar pessoas, grupos, cursos e mais..." />
        </div>
      </div>
      
      <div className="header-right">
        <NotificationDropdown />
        <Link to="/messages" className="icon-btn" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageCircle size={20} />
          <span className="badge">2</span>
        </Link>
        <Link to={`/profile/${loggedUserId}`} className="user-profile-sm" style={{ textDecoration: 'none' }}>
          <Avatar user={user} style={{ width: '32px', height: '32px' }} />
          <span className="user-name">{user?.name || 'Carregando...'}</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;

