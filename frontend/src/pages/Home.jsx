import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Image, Paperclip, Smile, Video, X, Plus } from 'lucide-react';
import Post from '../components/Post';
import Story from '../components/Story';
import StoryViewer from '../components/StoryViewer';
import Avatar from '../components/Avatar';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Home = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [posts, setPosts] = useState([]);
  const [storyGroups, setStoryGroups] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Story creation state
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyImage, setStoryImage] = useState(null);
  const [storyImagePreview, setStoryImagePreview] = useState(null);
  const [storyText, setStoryText] = useState('');
  const [creatingStory, setCreatingStory] = useState(false);
  const storyFileRef = useRef(null);

  // Story viewing state
  const [viewingStoryIndex, setViewingStoryIndex] = useState(null);

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

  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/stories`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStoryGroups(data);
      }
    } catch (err) {
      console.log('Erro ao buscar stories', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStories();
  }, []);

  // Listen for new stories via socket
  useEffect(() => {
    if (!socket) return;
    const handleNewStory = () => {
      fetchStories(); // Refresh stories
    };
    socket.on('new_story', handleNewStory);
    return () => socket.off('new_story', handleNewStory);
  }, [socket]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem deve ter no máximo 5MB.');
      return;
    }
    setPostImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPostImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !postImage) return;
    setLoading(true);
    try {
      let attachment_url = null;
      let attachment_type = null;

      // Upload image first if present
      if (postImage) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(postImage);
        });

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ file: base64, folder: 'posts' })
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachment_url = uploadData.url;
          attachment_type = 'image';
        }
      }

      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newPostContent,
          attachment_url,
          attachment_type
        })
      });
      
      if (res.ok) {
        setNewPostContent('');
        setPostImage(null);
        setPostImagePreview(null);
        fetchPosts();
      }
    } catch (error) {
      alert('Erro ao publicar post.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async () => {
    if (!storyImage && !storyText.trim()) return;
    setCreatingStory(true);
    try {
      let media_url = null;
      let media_type = null;

      if (storyImage) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(storyImage);
        });

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ file: base64, folder: 'stories' })
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          media_url = uploadData.url;
          media_type = 'image';
        }
      }

      const res = await fetch(`${API_URL}/api/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ media_url, media_type, text_content: storyText || null })
      });

      if (res.ok) {
        setShowStoryModal(false);
        setStoryImage(null);
        setStoryImagePreview(null);
        setStoryText('');
        fetchStories();
      }
    } catch (err) {
      alert('Erro ao criar story.');
    } finally {
      setCreatingStory(false);
    }
  };

  const handleStoryImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem deve ter no máximo 5MB.');
      return;
    }
    setStoryImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setStoryImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const onPostDeleted = (deletedId) => {
    setPosts(posts.filter(p => p.id !== deletedId));
  };

  return (
      <div className="home-container">
      <div className="stories-container">
        {/* Add Story Card */}
        <div className="story-card add-story-card" onClick={() => setShowStoryModal(true)}>
          <div className="story-avatar-container add-story">
            <Avatar user={user} className="story-avatar" />
            <div className="add-icon">+</div>
          </div>
          <span className="story-name">Criar Story</span>
        </div>

        {/* Real Stories */}
        {storyGroups.map((group, index) => (
          <Story 
            key={group.user_id} 
            user={{
              id: group.user_id,
              name: group.user_name,
              avatar: group.user_avatar
            }} 
            onClick={() => setViewingStoryIndex(index)}
          />
        ))}
      </div>

      {viewingStoryIndex !== null && (
        <StoryViewer 
          storyGroups={storyGroups} 
          initialGroupIndex={viewingStoryIndex} 
          onClose={() => setViewingStoryIndex(null)} 
        />
      )}

      <div className="create-post-card card">
        <div className="create-post-top">
          <Avatar user={user} className="create-post-avatar" />
          <input 
            type="text" 
            placeholder="No que você está pensando?"  
            className="create-post-input"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) handleCreatePost() }}
          />
        </div>

        {postImagePreview && (
          <div className="post-image-preview">
            <img src={postImagePreview} alt="Preview" />
            <button className="remove-image-btn" onClick={() => { setPostImage(null); setPostImagePreview(null); }}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="create-post-bottom">
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageSelect} />
          <button className="create-post-btn" onClick={() => alert('Em breve!')}>
            <Video size={20} color="#F44336" /><span>Vídeo</span>
          </button>
          <button className="create-post-btn" onClick={() => fileInputRef.current?.click()}>
            <Image size={20} color="#4CAF50" /><span>Foto</span>
          </button>
          <button className="create-post-btn"><Paperclip size={20} color="#FF9800" /><span>Arquivo</span></button>
          <button className="create-post-btn"><Smile size={20} color="#FFEB3B" /><span>Sentimento</span></button>
          <button 
            className="btn-primary" 
            style={{marginLeft: 'auto', padding: '6px 16px', fontSize: '14px'}}
            onClick={handleCreatePost}
            disabled={loading || (!newPostContent.trim() && !postImage)}
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

      {/* Story Creation Modal */}
      {showStoryModal && (
        <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setShowStoryModal(false); }}>
          <div className="modal-content card story-modal">
            <div className="modal-header">
              <h2>Criar Story</h2>
              <button className="close-modal-btn" onClick={() => setShowStoryModal(false)}>✕</button>
            </div>
            <div className="story-create-body">
              {storyImagePreview ? (
                <div className="story-preview-container">
                  <img src={storyImagePreview} alt="Preview" className="story-preview-img" />
                  <button className="remove-image-btn" onClick={() => { setStoryImage(null); setStoryImagePreview(null); }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="story-upload-area" onClick={() => storyFileRef.current?.click()}>
                  <Plus size={40} />
                  <p>Clique para adicionar uma imagem</p>
                </div>
              )}
              <input type="file" ref={storyFileRef} style={{ display: 'none' }} accept="image/*" onChange={handleStoryImageSelect} />
              <textarea
                placeholder="Adicione um texto ao seu story (opcional)..."
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                className="story-text-input"
                maxLength={200}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowStoryModal(false)}>Cancelar</button>
              <button
                className="btn-primary"
                onClick={handleCreateStory}
                disabled={creatingStory || (!storyImage && !storyText.trim())}
              >
                {creatingStory ? 'Publicando...' : 'Publicar Story'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

