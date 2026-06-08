import React, { useState } from 'react';
import './Avatar.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Avatar = ({ user, src, alt, name, className, style, size }) => {
  const [imgError, setImgError] = useState(false);

  // Extract variables primarily from `user` prop if available, otherwise direct props
  const rawSrc = src || user?.avatar;
  const targetName = name || user?.name || 'User';
  const targetAlt = alt || targetName;

  // Compute final source based on environment and fallbacks
  let finalSrc = '';
  
  if (imgError || !rawSrc) {
    // Fallback URL generator
    finalSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(targetName)}&background=0D8ABC&color=fff`;
  } else if (rawSrc.startsWith('http') || rawSrc.startsWith('data:') || rawSrc.startsWith('blob:')) {
    // Full URL or data/blob URL
    finalSrc = rawSrc;
  } else {
    // Local server path
    finalSrc = `${API_URL}/uploads/avatars/${rawSrc}`;
  }

  // Handle specific inline size if provided
  const inlineStyle = {
    ...style,
    ...(size ? { width: size, height: size } : {})
  };

  return (
    <img
      src={finalSrc}
      alt={targetAlt}
      className={`global-avatar ${className || ''}`}
      style={inlineStyle}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  );
};

export default Avatar;
