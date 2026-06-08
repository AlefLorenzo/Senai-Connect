import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import './Story.css';

const Story = ({ user, isAddStory, onClick }) => {
  const content = (
    <div className="story-card" onClick={onClick}>
      <div className={`story-avatar-container ${isAddStory ? 'add-story' : ''}`}>
        <Avatar user={user} className="story-avatar" />
        {isAddStory && <div className="add-icon">+</div>}
      </div>
      <span className="story-name">{user.name}</span>
      {isAddStory && <span className="story-sub">Ver perfil</span>}
    </div>
  );

  if (onClick) {
    return content;
  }

  return (
    <Link to={`/profile/${user.id || 1}`} style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  );
};

export default Story;
