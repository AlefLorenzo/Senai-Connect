import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Rss, Clock, Users, MessageSquare, Calendar, BookOpen, Bell, FileText, Bookmark, Settings, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Avatar from './Avatar';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    window.location.reload();
  };

  const menuItems = [
    { icon: <Home size={22} />, text: 'Início', path: '/' },
    { icon: <Rss size={22} />, text: 'Feed', path: '/feed' },
    { icon: <Clock size={22} />, text: 'Histórias', path: '/stories' },
    { icon: <Users size={22} />, text: 'Grupos', path: '/groups' },
    { icon: <MessageSquare size={22} />, text: 'Mensagens', path: '/messages', badge: 3 },
    { icon: <Calendar size={22} />, text: 'Eventos', path: '/events' },
    { icon: <BookOpen size={22} />, text: 'Cursos', path: '/courses' },
    { icon: <Bell size={22} />, text: 'Avisos', path: '/notices' },
    { icon: <FileText size={22} />, text: 'Arquivos', path: '/files' },
    { icon: <Bookmark size={22} />, text: 'Salvos', path: '/saved' },
    { icon: <Settings size={22} />, text: 'Configurações', path: '/settings' },
  ];

  const loggedUserId = user?.id || 1;

  return (
    <aside className="sidebar-container">
      <div className="sidebar-profile">
        <Link to={`/profile/${loggedUserId}`}>
          <Avatar user={user} className="sidebar-avatar" />
        </Link>
        <div className="sidebar-profile-info">
          <Link to={`/profile/${loggedUserId}`} style={{ color: 'white', textDecoration: 'none' }}>
            <h4>{user?.name || 'Carregando...'}</h4>
          </Link>
          <Link to={`/profile/${loggedUserId}`} className="view-profile">Ver perfil</Link>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive && item.path !== '#' ? 'nav-item active' : 'nav-item'}
              >
                {item.icon}
                <span>{item.text}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={22} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
