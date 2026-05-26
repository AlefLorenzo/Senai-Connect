import React, { useState, useEffect, useContext } from 'react';
import { Users, Search, ChevronLeft, Calendar, LogOut, ArrowRight, UserCheck, MessageSquare, BookOpen } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Post from '../components/Post';
import './Groups.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Groups = () => {
  const { user } = useContext(AuthContext);
  
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('mine'); // 'mine' or 'discover'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected Group details
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupPosts, setGroupPosts] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupTab, setGroupTab] = useState('feed'); // 'feed' or 'members'
  const [newGroupPost, setNewGroupPost] = useState('');
  const [posting, setPosting] = useState(false);

  // Group creation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/api/groups`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error('Erro ao buscar grupos:', err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupSelect = async (group) => {
    setSelectedGroup(group);
    setGroupTab('feed');
    
    // Fetch group posts
    try {
      const postsRes = await fetch(`${API_URL}/api/groups/${group.id}/posts`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setGroupPosts(postsData);
      }
    } catch (err) {
      console.error(err);
    }

    // Fetch group members
    try {
      const membersRes = await fetch(`${API_URL}/api/groups/${group.id}/members`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setGroupMembers(membersData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinLeave = async () => {
    if (!selectedGroup) return;
    const isMember = selectedGroup.is_member;
    const endpoint = isMember ? 'leave' : 'join';
    
    try {
      const res = await fetch(`${API_URL}/api/groups/${selectedGroup.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.ok) {
        // Toggle membership in local UI state
        setSelectedGroup(prev => ({
          ...prev,
          is_member: !isMember,
          members_count: isMember ? prev.members_count - 1 : prev.members_count + 1
        }));
        
        // Refresh group list in background
        fetchGroups();
        
        // Refresh members list
        const membersRes = await fetch(`${API_URL}/api/groups/${selectedGroup.id}/members`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setGroupMembers(membersData);
        }
      } else {
        const errData = await res.json();
        alert(errData.error || 'Ocorreu um erro.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newGroupName, description: newGroupDesc })
      });
      if (res.ok) {
        const data = await res.json();
        setNewGroupName('');
        setNewGroupDesc('');
        setIsModalOpen(false);
        fetchGroups();
        
        // Auto-select the newly created group
        handleGroupSelect({
          id: data.id,
          name: newGroupName,
          description: newGroupDesc,
          members_count: 1,
          is_member: 1
        });
      } else {
        alert('Erro ao criar grupo.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroupPost = async () => {
    if (!newGroupPost.trim() || !selectedGroup) return;
    setPosting(true);
    try {
      const res = await fetch(`${API_URL}/api/groups/${selectedGroup.id}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newGroupPost })
      });
      if (res.ok) {
        setNewGroupPost('');
        // Reload group posts
        const postsRes = await fetch(`${API_URL}/api/groups/${selectedGroup.id}/posts`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setGroupPosts(postsData);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleGroupPostDeleted = (deletedId) => {
    setGroupPosts(prev => prev.filter(p => p.id !== deletedId));
  };

  // Filter groups
  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isMember = g.is_member === 1 || g.is_member === true;
    
    if (activeTab === 'mine') {
      return matchesSearch && isMember;
    } else {
      return matchesSearch && !isMember;
    }
  });

  if (selectedGroup) {
    return (
      <div className="group-detail-view groups-page">
        <div className="card group-detail-header" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="group-banner" style={{ height: '120px', background: 'linear-gradient(135deg, #1A237E 0%, #0056D2 100%)' }}></div>
          <div style={{ padding: '16px 20px', position: 'relative' }}>
            <button className="back-btn btn-secondary" onClick={() => { setSelectedGroup(null); fetchGroups(); }} style={{ position: 'absolute', top: '-40px', left: '20px', padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronLeft size={16} /> Voltar para Grupos
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginTop: '10px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{selectedGroup.name}</h2>
                <p style={{ margin: '4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selectedGroup.members_count} membros
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {selectedGroup.description}
                </p>
              </div>
              <button 
                className={selectedGroup.is_member ? 'btn-secondary' : 'btn-primary'}
                onClick={handleJoinLeave}
                style={{ minWidth: '150px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {selectedGroup.is_member ? (
                  <>
                    <LogOut size={16} /> Sair do Grupo
                  </>
                ) : (
                  <>
                    <UserCheck size={16} /> Participar
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="groups-tabs">
            <button className={`tab ${groupTab === 'feed' ? 'active' : ''}`} onClick={() => setGroupTab('feed')} style={{ flex: 1, padding: '12px', fontWeight: 600 }}>
              Feed do Grupo
            </button>
            <button className={`tab ${groupTab === 'members' ? 'active' : ''}`} onClick={() => setGroupTab('members')} style={{ flex: 1, padding: '12px', fontWeight: 600 }}>
              Membros ({groupMembers.length})
            </button>
          </div>
        </div>

        {groupTab === 'feed' ? (
          <div className="group-feed-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedGroup.is_member ? (
              <div className="create-post-card card" style={{ padding: '16px' }}>
                <div className="create-post-top" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <img src={user?.avatar ? `/uploads/avatars/${user.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}`} alt="Você" className="create-post-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <input 
                    type="text" 
                    placeholder={`Compartilhe algo no grupo ${selectedGroup.name}...`} 
                    className="create-post-input"
                    value={newGroupPost}
                    onChange={(e) => setNewGroupPost(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') handleCreateGroupPost() }}
                    style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: '20px', padding: '8px 16px', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn-primary" 
                    onClick={handleCreateGroupPost}
                    disabled={posting || !newGroupPost.trim()}
                    style={{ padding: '6px 16px', fontSize: '13px' }}
                  >
                    {posting ? 'Publicando...' : 'Publicar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Faça parte do grupo para poder visualizar e criar publicações!
              </div>
            )}

            {selectedGroup.is_member && (
              <div className="feed-container">
                {groupPosts.length > 0 ? (
                  groupPosts.map(post => (
                    <Post key={post.id} post={post} onDeleted={handleGroupPostDeleted} />
                  ))
                ) : (
                  <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nenhuma publicação neste grupo ainda. Escreva a primeira!
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="group-members-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {groupMembers.length > 0 ? (
              groupMembers.map(member => {
                const memberAvatar = member.avatar ? `/uploads/avatars/${member.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0D8ABC&color=fff`;
                return (
                  <div key={member.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={memberAvatar} alt={member.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{member.name}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{member.role || 'Aluno'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                Nenhum membro listado.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="groups-page">
      <div className="groups-header card">
        <div className="groups-header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(13, 138, 188, 0.1)', padding: '10px', borderRadius: '50%', color: 'var(--senai-blue-primary)', display: 'flex' }}>
              <Users size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>Grupos Acadêmicos</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Participe de salas de estudo, projetos e turmas.
              </p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Criar grupo</button>
        </div>

        <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '6px 16px', background: 'var(--bg-card)', flex: 1 }}>
            <Search size={18} color="#65676B" style={{ marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Pesquisar grupos por nome ou tema..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', width: '100%', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="groups-tabs">
          <button className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>Meus grupos</button>
          <button className={`tab ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>Descobrir</button>
        </div>
      </div>

      <div className="groups-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => (
            <div key={group.id} className="group-item card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div className="group-item-info">
                <div className="group-icon-large">
                  <Users size={32} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{group.name}</h3>
                  <p className="group-members" style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {group.members_count} membros
                  </p>
                  <p className="group-desc" style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {group.description || 'Sem descrição.'}
                  </p>
                </div>
              </div>
              <button className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }} onClick={() => handleGroupSelect(group)}>
                Acessar <ArrowRight size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhum grupo encontrado nesta categoria.
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>Criar Novo Grupo</h2>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateGroup} className="edit-profile-form">
              <div className="form-group">
                <label htmlFor="groupName">Nome do Grupo</label>
                <input 
                  type="text" 
                  id="groupName" 
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)} 
                  placeholder="Ex: Estudo de Robótica - 2A"
                  className="modal-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="groupDesc">Descrição</label>
                <textarea 
                  id="groupDesc" 
                  value={newGroupDesc} 
                  onChange={(e) => setNewGroupDesc(e.target.value)} 
                  placeholder="Descreva o propósito ou tópicos deste grupo..."
                  className="modal-textarea"
                  maxLength={150}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={creating}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Criando...' : 'Criar Grupo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
