import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Image, Paperclip, Smile, Video } from 'lucide-react';
import Post from '../components/Post';
import Story from '../components/Story';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.log('Erro ao buscar posts', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    // Simulação de stories
    setStories([
      { id: 2, name: 'Maria Silva', avatar: 'https://ui-avatars.com/api/?name=Maria+Silva' }
    ]);
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newPostContent })
      });
      
      if (res.ok) {
        setNewPostContent('');
        fetchPosts(); // Recarrega os posts
      }
    } catch (error) {
      alert('Erro ao publicar post.');
    } finally {
      setLoading(false);
    }
  };

  // Callback chamado pelo Post quando ele é deletado
  const onPostDeleted = (deletedId) => {
    setPosts(posts.filter(p => p.id !== deletedId));
  };

  return (
    <div className="home-container">
      <div className="stories-container">
        <Story user={user} isAddStory={true} />
        {stories.map(story => (
          <Story key={story.id} user={story} />
        ))}
      </div>

      <div className="create-post-card card">
        <div className="create-post-top">
          <img src={user.avatar} alt="User" className="create-post-avatar" />
          <input 
            type="text" 
            placeholder="No que você está pensando?" 
            className="create-post-input"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') handleCreatePost() }}
          />
        </div>
        <div className="create-post-bottom">
          <button className="create-post-btn"><Video size={20} color="#F44336" /><span>Vídeo</span></button>
          <button className="create-post-btn"><Image size={20} color="#4CAF50" /><span>Foto</span></button>
          <button className="create-post-btn"><Paperclip size={20} color="#FF9800" /><span>Arquivo</span></button>
          <button className="create-post-btn"><Smile size={20} color="#FFEB3B" /><span>Sentimento</span></button>
          <button 
            className="btn-primary" 
            style={{marginLeft: 'auto', padding: '6px 16px', fontSize: '14px'}}
            onClick={handleCreatePost}
            disabled={loading || !newPostContent.trim()}
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      <div className="feed-container">
        {posts.length > 0 ? (
          posts.map(post => <Post key={post.id} post={post} onDeleted={onPostDeleted} />)
        ) : (
          <div className="card" style={{padding: '32px', textAlign: 'center', color: '#65676B'}}>
            Nenhuma publicação ainda. Seja o primeiro a postar!
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
