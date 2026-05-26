import React from 'react';
import { Link } from 'react-router-dom';
import './Story.css';

const Story = ({ user, isAddStory }) => {
  return (
    <Link to={`/profile/${user.id || 1}`} style={{ textDecoration: 'none' }}>
      <div className="story-card">
        <div className={`story-avatar-container ${isAddStory ? 'add-story' : ''}`}>
          <img src={user.avatar} alt={user.name} className="story-avatar" />
          {isAddStory && <div className="add-icon">+</div>}
        </div>
        <span className="story-name">{user.name}</span>
        {isAddStory && <span className="story-sub">Ver perfil</span>}
      </div>
    </Link>
  );
};

export default Story;
