import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, MessageCircle, MoreHorizontal, Users, Calendar, MapPin, Mail, Sparkles, BookOpen } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Post from '../components/Post';
import './Profile.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Profile = () => {
  const { id } = useParams();
  const { user: loggedInUser, setUser: setLoggedInUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const userId = id ? parseInt(id) : loggedInUser?.id;
  const isOwnProfile = userId === loggedInUser?.id;

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  // Edit profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    
    // Fetch User Details
    fetch(`${API_URL}/api/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProfileUser(data);
          setBioInput(data.bio || '');
          setAvatarInput(data.avatar || '');
        }
      })
      .catch(err => console.error(err));

    // Fetch User Posts
    fetch(`${API_URL}/api/users/${userId}/posts`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setPosts(data);
      })
      .catch(err => console.error(err));

    // Fetch User Groups
    fetch(`${API_URL}/api/users/${userId}/groups`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setGroups(data);
      })
      .catch(err => console.error(err));

    // Fetch Saved Posts (only if own profile)
    if (isOwnProfile) {
      fetch(`${API_URL}/api/users/${userId}/saved`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.error) setSavedPosts(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId, isOwnProfile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ avatar: avatarInput, bio: bioInput })
      });
      if (res.ok) {
        // Update local user state
        setProfileUser(prev => ({ ...prev, avatar: avatarInput, bio: bioInput }));
        // Update Auth Context state
        setLoggedInUser(prev => ({ ...prev, avatar: avatarInput, bio: bioInput }));
        setIsEditModalOpen(false);
      } else {
        alert('Erro ao atualizar perfil.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
  };

  if (loading || !profileUser) {
    return (
      <div className="profile-container">
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          Carregando perfil...
        </div>
      </div>
    );
  }

  const userAvatar = profileUser.avatar ? `/uploads/avatars/${profileUser.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=0D8ABC&color=fff`;

  return (
    <div className="profile-container">
      <div className="profile-header card">
        <div className="profile-cover"></div>
        <div className="profile-info-section">
          <div className="profile-avatar-wrapper">
            <img src={userAvatar} alt={profileUser.name} className="profile-main-avatar" />
          </div>
          
          <div className="profile-details">
            <div className="profile-name-role">
              <h1>{profileUser.name}</h1>
              {profileUser.role === 'PROFESSOR' && <span className="role-badge large">PROFESSOR</span>}
            </div>
            <p className="profile-handle">@{profileUser.name.toLowerCase().replaceAll(' ', '.')}</p>
            <p className="profile-bio">{profileUser.bio || 'Nenhuma biografia fornecida ainda.'}</p>
            
            <div className="profile-meta">
              <span><BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {profileUser.role || 'Aluno'}</span>
              <span>• <MapPin size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> SENAI São Paulo</span>
              <span>• <Mail size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {profileUser.email}</span>
            </div>
          </div>

          <div className="profile-actions">
            {!isOwnProfile && <button className="btn-primary" onClick={() => alert('Seguindo!')}>Seguir</button>}
            {!isOwnProfile && (
              <button className="btn-secondary" onClick={() => navigate('/messages')}>
                <MessageCircle size={18} />
                <span>Mensagem</span>
              </button>
            )}
            {isOwnProfile && (
              <button className="btn-secondary" onClick={() => setIsEditModalOpen(true)}>
                <Settings size={18} />
                <span>Editar Perfil</span>
              </button>
            )}
            <button className="icon-btn-border" onClick={() => alert('Mais opções')}>
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
        
        <div className="profile-tabs">
          <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Publicações</button>
          <button className={`tab ${activeTab === 'sobre' ? 'active' : ''}`} onClick={() => setActiveTab('sobre')}>Sobre</button>
          <button className={`tab ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>Grupos</button>
          {isOwnProfile && (
            <button className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>Salvos</button>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-stats card">
          <div className="stat-item">
            <strong>{posts.length}</strong>
            <span>Publicações</span>
          </div>
          <div className="stat-item">
            <strong>120</strong>
            <span>Seguidores</span>
          </div>
          <div className="stat-item">
            <strong>85</strong>
            <span>Seguindo</span>
          </div>
          <div className="stat-item">
            <strong>{groups.length}</strong>
            <span>Grupos</span>
          </div>
        </div>
        
        <div className="profile-feed">
          {activeTab === 'posts' && (
            posts.length > 0 ? (
              posts.map(post => <Post key={post.id} post={post} onDeleted={handlePostDeleted} />)
            ) : (
              <div className="post-placeholder card">
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                  Nenhuma publicação encontrada para este usuário.
                </p>
              </div>
            )
          )}

          {activeTab === 'sobre' && (
            <div className="card" style={{ padding: '20px' }}>
              <h3>Sobre {profileUser.name}</h3>
              <p style={{ margin: '12px 0', fontSize: '15px' }}>{profileUser.bio || 'Usuário sem biografia.'}</p>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <div><strong>E-mail:</strong> {profileUser.email}</div>
                <div><strong>Tipo de Conta:</strong> {profileUser.role}</div>
                <div><strong>Membro desde:</strong> {new Date(profileUser.created_at || Date.now()).toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="groups-tab-list">
              {groups.length > 0 ? (
                groups.map(group => (
                  <div key={group.id} className="card group-item-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }} onClick={() => navigate('/groups')}>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{group.name}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{group.description}</p>
                    </div>
                    <span className="badge-members" style={{ fontSize: '12px', background: 'var(--bg-main)', padding: '4px 8px', borderRadius: '12px' }}>
                      {group.members_count} membros
                    </span>
                  </div>
                ))
              ) : (
                <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Este usuário ainda não participa de nenhum grupo.
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && isOwnProfile && (
            savedPosts.length > 0 ? (
              savedPosts.map(post => <Post key={post.id} post={post} onDeleted={handlePostDeleted} />)
            ) : (
              <div className="post-placeholder card">
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                  Você ainda não salvou nenhuma publicação.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>Editar Perfil</h2>
              <button className="close-modal-btn" onClick={() => setIsEditModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateProfile} className="edit-profile-form">
              <div className="form-group">
                <label htmlFor="avatar">Avatar (Nome do arquivo ou URL de avatar)</label>
                <input 
                  type="text" 
                  id="avatar" 
                  value={avatarInput} 
                  onChange={(e) => setAvatarInput(e.target.value)} 
                  placeholder="Ex: joao.jpg ou deixe em branco para default"
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Biografia</label>
                <textarea 
                  id="bio" 
                  value={bioInput} 
                  onChange={(e) => setBioInput(e.target.value)} 
                  placeholder="Escreva algo sobre você..."
                  className="modal-textarea"
                  maxLength={200}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)} disabled={saving}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
