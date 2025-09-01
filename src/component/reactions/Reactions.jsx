// components/Reactions.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThumbsUp,
  faHeart,
  faLaughSquint,
  faSurprise,
  faSadTear,
  faAngry
} from '@fortawesome/free-solid-svg-icons';

export const reactions = [
  { name: 'like', icon: faThumbsUp, color: '#1877f2', label: 'Like' },
  { name: 'love', icon: faHeart, color: '#f33e58', label: 'Love' },
  { name: 'haha', icon: faLaughSquint, color: '#f7b125', label: 'Haha' },
  { name: 'wow', icon: faSurprise, color: '#f7b125', label: 'Wow' },
  { name: 'sad', icon: faSadTear, color: '#f7b125', label: 'Sad' },
  { name: 'angry', icon: faAngry, color: '#e9710f', label: 'Angry' }
];

const Reactions = ({ onSelect, currentReaction, onClose }) => {
  const ref = useRef(null);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={ref} className="reactions-container">
      {reactions.map((reaction) => (
        <button
          key={reaction.name}
          className={`reaction-option ${currentReaction === reaction.name ? 'active' : ''}`}
          onClick={() => onSelect(reaction.name)}
          aria-label={reaction.label}
          style={{ color: reaction.color }}
        >
          <FontAwesomeIcon icon={reaction.icon} size="lg" />
          <span className="reaction-tooltip">{reaction.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Reactions;