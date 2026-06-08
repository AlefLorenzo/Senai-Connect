import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Avatar from './Avatar';
import './StoryViewer.css';

const StoryViewer = ({ storyGroups, initialGroupIndex, onClose }) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];
  
  const progressRef = useRef(0);
  const requestRef = useRef();
  const lastTimeRef = useRef();

  const STORY_DURATION = 30000; // 30 seconds

  const goToNext = () => {
    setProgress(0);
    progressRef.current = 0;
    
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      onClose(); // End of all stories
    }
  };

  const goToPrev = () => {
    setProgress(0);
    progressRef.current = 0;
    
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(prevGroup.stories.length - 1);
    }
  };

  const animate = time => {
    if (isPaused) {
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    if (lastTimeRef.current != null) {
      const deltaTime = time - lastTimeRef.current;
      progressRef.current += (deltaTime / STORY_DURATION) * 100;
      
      if (progressRef.current >= 100) {
        goToNext();
        return; // wait for next frame
      }
      setProgress(progressRef.current);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [currentGroupIndex, currentStoryIndex, isPaused]);

  if (!currentGroup || !currentStory) return null;

  const userAvatar = currentGroup.user_avatar
    ? `/uploads/avatars/${currentGroup.user_avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentGroup.user_name)}&background=0D8ABC&color=fff`;

  return (
    <div className="story-viewer-overlay">
      <div className="story-viewer-container">
        
        {/* Progress Bars */}
        <div className="story-progress-container">
          {currentGroup.stories.map((s, idx) => (
            <div key={s.id} className="story-progress-bar-bg">
              <div 
                className="story-progress-bar-fill" 
                style={{ 
                  width: idx === currentStoryIndex ? `${progress}%` : idx < currentStoryIndex ? '100%' : '0%' 
                }} 
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-header">
          <div className="story-user-info">
            <Avatar user={{ avatar: currentGroup.user_avatar, name: currentGroup.user_name }} className="story-viewer-avatar" />
            <div>
              <span className="story-viewer-name">{currentGroup.user_name}</span>
              <span className="story-viewer-time">
                {new Date(currentStory.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <button className="story-close-btn" onClick={onClose}>
            <X size={24} color="white" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="story-content-area" 
          onPointerDown={() => setIsPaused(true)} 
          onPointerUp={() => setIsPaused(false)}
          onPointerLeave={() => setIsPaused(false)}
        >
          {currentStory.media_url ? (
            <img src={currentStory.media_url} alt="Story" className="story-media" />
          ) : (
            <div className="story-text-only">
              <p>{currentStory.text_content}</p>
            </div>
          )}
          
          {currentStory.media_url && currentStory.text_content && (
            <div className="story-caption-overlay">
              <p>{currentStory.text_content}</p>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="story-nav-left" onClick={(e) => { e.stopPropagation(); goToPrev(); }}>
          {(currentStoryIndex > 0 || currentGroupIndex > 0) && <ChevronLeft size={36} color="white" />}
        </div>
        <div className="story-nav-right" onClick={(e) => { e.stopPropagation(); goToNext(); }}>
          <ChevronRight size={36} color="white" />
        </div>

      </div>
    </div>
  );
};

export default StoryViewer;
