import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Post from '../components/Post';
import { Bookmark } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Saved = () => {
  const { user } = useContext(AuthContext);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_URL}/api/users/${user.id}/saved`, {
      headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSavedPosts(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  const handlePostDeleted = (deletedId) => {
    setSavedPosts(prev => prev.filter(p => p.id !== deletedId));
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        Carregando publicações salvas...
      </div>
    );
  }

  return (
    <div className="saved-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#FFF3E0', padding: '10px', borderRadius: '50%', color: '#FF9800', display: 'flex' }}>
          <Bookmark size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Publicações Salvas</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Itens que você salvou para ler mais tarde. Apenas você pode ver isso.
          </p>
        </div>
      </div>

      <div className="feed-container">
        {savedPosts.length > 0 ? (
          savedPosts.map(post => (
            <Post key={post.id} post={post} onDeleted={handlePostDeleted} />
          ))
        ) : (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhum item salvo ainda. Explore o feed e clique no ícone de salvar em publicações interessantes!
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
