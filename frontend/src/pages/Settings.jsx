import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Eye, Moon, Sun, Save } from 'lucide-react';

const Settings = () => {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    newPost: true,
    newComment: true,
    newLike: true,
    messages: true
  });
  const [privacy, setPrivacy] = useState({
    showProfile: 'public',
    showEmail: false
  });
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = () => {
    setSuccessMsg('Configurações salvas com sucesso!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="settings-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#ECEFF1', padding: '10px', borderRadius: '50%', color: '#37474F', display: 'flex' }}>
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Configurações do Sistema</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Personalize a sua experiência no SENAI Connect.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="card animate-fade-in" style={{ padding: '12px 20px', background: '#E8F5E9', borderLeft: '4px solid #4CAF50', color: '#2E7D32', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* Aparência */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Moon size={20} color="var(--senai-blue-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Aparência e Tema</h3>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Escolha como o SENAI Connect deve parecer no seu dispositivo.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={`btn-secondary ${theme === 'light' ? 'active-theme-btn' : ''}`}
            onClick={() => setTheme('light')}
            style={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px', 
              border: theme === 'light' ? '2px solid var(--senai-blue-primary)' : '1px solid var(--border-color)',
              padding: '12px'
            }}
          >
            <Sun size={18} /> Light Mode
          </button>
          <button 
            className={`btn-secondary ${theme === 'dark' ? 'active-theme-btn' : ''}`}
            onClick={() => setTheme('dark')}
            style={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px', 
              border: theme === 'dark' ? '2px solid var(--senai-blue-primary)' : '1px solid var(--border-color)',
              padding: '12px'
            }}
          >
            <Moon size={18} /> Dark Mode
          </button>
        </div>
      </div>

      {/* Notificações */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Bell size={20} color="var(--senai-blue-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Notificações</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Novas publicações dos seus contatos</span>
            <input 
              type="checkbox" 
              checked={notifications.newPost} 
              onChange={(e) => setNotifications({ ...notifications, newPost: e.target.checked })} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Novos comentários nas suas publicações</span>
            <input 
              type="checkbox" 
              checked={notifications.newComment} 
              onChange={(e) => setNotifications({ ...notifications, newComment: e.target.checked })} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Curtidas nas suas publicações</span>
            <input 
              type="checkbox" 
              checked={notifications.newLike} 
              onChange={(e) => setNotifications({ ...notifications, newLike: e.target.checked })} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Novas mensagens diretas</span>
            <input 
              type="checkbox" 
              checked={notifications.messages} 
              onChange={(e) => setNotifications({ ...notifications, messages: e.target.checked })} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </label>
        </div>
      </div>

      {/* Privacidade */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Shield size={20} color="var(--senai-blue-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Privacidade e Visibilidade</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Quem pode ver seu perfil completo?</span>
            <select 
              value={privacy.showProfile} 
              onChange={(e) => setPrivacy({ ...privacy, showProfile: e.target.value })}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              <option value="public">Todos os alunos e professores</option>
              <option value="professor">Apenas professores</option>
              <option value="private">Privado (apenas você)</option>
            </select>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Mostrar seu e-mail corporativo no perfil?</span>
            <input 
              type="checkbox" 
              checked={privacy.showEmail} 
              onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </label>
        </div>
      </div>

      <button 
        className="btn-primary" 
        onClick={handleSave} 
        style={{ padding: '12px 24px', display: 'flex', alignSelf: 'flex-end', gap: '8px', fontSize: '0.95rem' }}
      >
        <Save size={18} /> Salvar Alterações
      </button>
    </div>
  );
};

export default Settings;
