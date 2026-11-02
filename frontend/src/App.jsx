import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Groups from './pages/Groups';
import Saved from './pages/Saved';
import Files from './pages/Files';
import Settings from './pages/Settings';
import Help from './pages/Help';
import PlaceholderPage from './pages/PlaceholderPage';
import EventosPage from './pages/EventosPage';
import CursosPage from './pages/CursosPage';
import AvisosPage from './pages/AvisosPage';
import Ranking from './pages/Ranking';
import Auth from './pages/Auth/Auth';
import AccessibilityMenu from './components/AccessibilityMenu';
import XpToast from './components/XpToast';
import './App.css';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}>Carregando sistema...</div>;
  }

  // Se não estiver logado, exibe apenas as rotas de Auth
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Auth />} />
        </Routes>
      </Router>
    );
  }

  // Layout principal para usuário logado
  return (
    <Router>
      <a href="#conteudo-principal" className="skip-link">Pular para o conteúdo</a>
      <div className="app-layout">
        <Header />
        
        <div className="main-content-wrapper">
          <Sidebar />
          
          <main className="center-feed" id="conteudo-principal">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/feed" element={<Home />} />
              <Route path="/stories" element={<PlaceholderPage title="Histórias" />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/events" element={<EventosPage />} />
              <Route path="/courses" element={<CursosPage />} />
              <Route path="/notices" element={<AvisosPage />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/files" element={<Files />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          
          <RightPanel />
        </div>
        
        <BottomNav />
        <AccessibilityMenu />
        <XpToast />
      </div>
    </Router>
  );
}

export default App;
